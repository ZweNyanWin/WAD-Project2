import { NextResponse } from 'next/server'
import { connect } from '../../../lib/db'
import { extractUserFromToken } from '../../../lib/auth'

let Review, Recipe

async function ensureModels() {
  if (Review && Recipe) return { Review, Recipe }
  try {
    await connect(process.env.MONGODB_URI)
    Review = require('../../../models/Review')
    Recipe = require('../../../models/Recipe')
  } catch (err) {
    console.error('Reviews API DB connect failed:', err && err.message ? err.message : err)
    Review = null
    Recipe = null
  }
  return { Review, Recipe }
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

    const { recipeId, rating, comment } = await request.json()

    if (!recipeId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Recipe ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const { Review, Recipe } = await ensureModels()
    if (!Review || !Recipe) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId)
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this recipe
    const existingReview = await Review.findOne({ 
      recipe: recipeId, 
      user: user.userId 
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this recipe' },
        { status: 409 }
      )
    }

    // Create the review
    const review = await Review.create({
      recipe: recipeId,
      user: user.userId,
      rating,
      comment
    })

    // Update recipe ratings
    const reviews = await Review.find({ recipe: recipeId })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    
    await Recipe.findByIdAndUpdate(recipeId, {
      $push: { reviews: review._id },
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    })

    // Populate user info before returning
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .lean()

    return NextResponse.json(populatedReview, { status: 201 })

  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    const { Review } = await ensureModels()
    if (!Review) {
      return NextResponse.json([])
    }

    const reviews = await Review.find({ recipe: recipeId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(reviews)

  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json([])
  }
}