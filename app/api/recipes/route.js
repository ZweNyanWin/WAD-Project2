import { NextResponse } from 'next/server'
import { connect } from '../../../lib/db'
import { extractUserFromToken } from '../../../lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
let Recipe

const inMemory = [
  { id: '1', title: 'egg', difficulty: 'Easy', ingredients: [{ name: 'egg', qty: 1, unit: 'egg' }], steps: ['fry it in the pan'], photo: null }
]

async function ensureModel() {
  if (Recipe) return Recipe
  try {
    await connect(process.env.MONGODB_URI)
    // lazy require to avoid serverless cold start issues
    // eslint-disable-next-line global-require
    Recipe = require('../../../models/Recipe')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('App Route DB connect failed:', err && err.message ? err.message : err)
    Recipe = null
  }
  return Recipe
}

export async function GET() {
  try {
    const model = await ensureModel()
    if (model) {
      const docs = await model.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .lean()
      return NextResponse.json(docs)
    }
    return NextResponse.json(inMemory)
  } catch (error) {
    console.error('GET /api/recipes error:', error)
    return NextResponse.json(inMemory)
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const user = extractUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const model = await ensureModel()
    const data = await request.formData()
    const title = data.get('title') || 'Untitled'
    const difficulty = data.get('difficulty') || 'Easy'
    const ingredients = data.get('ingredients') ? JSON.parse(data.get('ingredients')) : []
    const steps = data.get('steps') ? JSON.parse(data.get('steps')) : []
    const photo = data.get('photo')
    
    let photoPath = null
    
    // Handle photo upload
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create unique filename
      const fileExtension = photo.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }
      
      // Save file
      const filePath = path.join(uploadsDir, fileName)
      await writeFile(filePath, buffer)
      photoPath = `/uploads/${fileName}`
    }

    if (model) {
      const created = await model.create({ 
        title, 
        difficulty, 
        ingredients, 
        steps,
        photo: photoPath,
        author: user.userId
      })
      
      // Populate author info before returning
      const populatedRecipe = await model.findById(created._id)
        .populate('author', 'name email')
        .lean()
      
      return NextResponse.json(populatedRecipe, { status: 201 })
    }

    const id = Date.now().toString(36)
    const newRecipe = { 
      id, 
      title, 
      difficulty, 
      ingredients, 
      steps,
      photo: photoPath,
      author: { _id: user.userId, name: 'Unknown User' }
    }
    inMemory.push(newRecipe)
    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error('POST /api/recipes error:', error)
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}
