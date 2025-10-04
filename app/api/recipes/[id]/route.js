import { NextResponse } from 'next/server'
import { connect } from '../../../../lib/db'
import { extractUserFromToken } from '../../../../lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
let Recipe

const inMemory = [
  { id: '1', title: 'egg', difficulty: 'Easy', ingredients: [{ name: 'egg', qty: 1, unit: 'egg' }], steps: ['fry it in the pan'], photo: null }
]

async function ensureModel() {
  if (Recipe) return Recipe
  try {
    await connect(process.env.MONGODB_URI)
    Recipe = require('../../../../models/Recipe')
  } catch (err) {
    console.error('App Route DB connect failed:', err && err.message ? err.message : err)
    Recipe = null
  }
  return Recipe
}

export async function GET(request, { params }) {
  const id = params.id
  const model = await ensureModel()
  
  if (model) {
    try {
      const doc = await model.findById(id).populate('author', 'name email').lean()
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(doc)
    } catch (err) {
      // If MongoDB ID is invalid, return 404
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }
  
  // Fallback to in-memory store
  const recipe = inMemory.find(x => x.id === id)
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(recipe)
}

export async function PUT(request, { params }) {
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
    if (!model) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Check if recipe exists and user owns it
    const existingRecipe = await model.findById(params.id)
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    if (existingRecipe.author.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own recipes' },
        { status: 403 }
      )
    }

    const data = await request.formData()
    const title = data.get('title') || existingRecipe.title
    const difficulty = data.get('difficulty') || existingRecipe.difficulty
    const ingredients = data.get('ingredients') ? JSON.parse(data.get('ingredients')) : existingRecipe.ingredients
    const steps = data.get('steps') ? JSON.parse(data.get('steps')) : existingRecipe.steps
    const photo = data.get('photo')
    
    let photoPath = existingRecipe.photo
    
    // Handle photo upload if new photo provided
    if (photo && photo.size > 0) {
      // Delete old photo if it exists
      if (existingRecipe.photo) {
        try {
          const oldPhotoPath = path.join(process.cwd(), 'public', existingRecipe.photo)
          await unlink(oldPhotoPath)
        } catch (error) {
          // File might not exist, ignore error
        }
      }
      
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

    // Update recipe
    const updatedRecipe = await model.findByIdAndUpdate(
      params.id,
      { 
        title, 
        difficulty, 
        ingredients, 
        steps,
        photo: photoPath,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('author', 'name email').lean()
    
    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('PUT /api/recipes/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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
    if (!model) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Check if recipe exists and user owns it
    const existingRecipe = await model.findById(params.id)
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    if (existingRecipe.author.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own recipes' },
        { status: 403 }
      )
    }

    // Delete photo if it exists
    if (existingRecipe.photo) {
      try {
        const photoPath = path.join(process.cwd(), 'public', existingRecipe.photo)
        await unlink(photoPath)
      } catch (error) {
        // File might not exist, ignore error
      }
    }

    // Delete recipe
    await model.findByIdAndDelete(params.id)
    
    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/recipes/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 })
  }
}