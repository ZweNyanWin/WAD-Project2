const express = require('express')
const next = require('next')
const multer = require('multer')
const mongoose = require('mongoose')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// file upload middleware (not persisting files in starter)
const upload = multer({ storage: multer.memoryStorage() })

// Mongoose model
const recipeSchema = new mongoose.Schema({
  title: String,
  difficulty: String,
  ingredients: [{ name: String, qty: mongoose.Schema.Types.Mixed, unit: String }],
  steps: [String]
}, { timestamps: true })

let RecipeModel = null

// simple in-memory fallback store if no DB
const inMemoryRecipes = [
  {
    id: '1',
    title: 'egg',
    difficulty: 'Easy',
    ingredients: [{ name: 'egg', qty: 1, unit: 'egg' }],
    steps: ['fry it in the pan']
  }
]

async function start() {
  const server = express()
  // Request logger with status and timing (helps diagnose 404s)
  server.use((req, res, next) => {
    const start = Date.now()
    function onFinish() {
      res.removeListener('finish', onFinish)
      const ms = Date.now() - start
      // eslint-disable-next-line no-console
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode} (${ms}ms)`)
    }
    res.on('finish', onFinish)
    next()
  })
  server.use(express.json())

  // Connect to MongoDB if MONGODB_URI provided
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      RecipeModel = mongoose.model('Recipe', recipeSchema)
      console.log('Connected to MongoDB')
    } catch (err) {
      console.error('MongoDB connection error:', err)
      console.error('Falling back to in-memory store')
    }
  }

  // API endpoints
  server.get('/api/recipes', async (req, res) => {
    if (RecipeModel) {
      const docs = await RecipeModel.find().sort({ createdAt: -1 }).lean()
      return res.json(docs)
    }
    res.json(inMemoryRecipes)
  })

  server.get('/api/recipes/:id', async (req, res) => {
    const id = req.params.id
    if (RecipeModel) {
      const doc = await RecipeModel.findById(id).lean()
      if (!doc) return res.status(404).json({ error: 'Not found' })
      return res.json(doc)
    }
    const r = inMemoryRecipes.find(x => x.id === id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json(r)
  })

  server.post('/api/recipes', upload.single('photo'), async (req, res) => {
    const { title, difficulty, ingredients, steps } = req.body
    const parsedIngredients = ingredients ? JSON.parse(ingredients) : []
    const parsedSteps = steps ? JSON.parse(steps) : []

    if (RecipeModel) {
      try {
        const created = await RecipeModel.create({ title, difficulty, ingredients: parsedIngredients, steps: parsedSteps })
        return res.status(201).json(created)
      } catch (err) {
        console.error('Create recipe error:', err)
        return res.status(500).json({ error: 'Failed to create recipe' })
      }
    }

    const id = Date.now().toString(36)
    const newRecipe = {
      id,
      title: title || 'Untitled',
      difficulty: difficulty || 'Easy',
      ingredients: parsedIngredients,
      steps: parsedSteps
    }
    inMemoryRecipes.push(newRecipe)
    res.status(201).json(newRecipe)
  })

  // (No explicit root redirect) let Next handle '/'

  // Next pages + assets
  server.all('*', (req, res) => {
    try {
      return handle(req, res)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Next handler error:', err)
      res.status(500).send('Server error')
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
}

if (require.main === module) {
  // started directly with `node server.js` -> run the server
  app.prepare().then(start).catch(err => console.error(err))
} else {
  // when required (e.g. in tests) export start so it can be used programmatically
  module.exports = { start }
}

