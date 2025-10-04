"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

export default function RecipePage({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const id = params.id

  useEffect(() => {
    if (!id) return
    
    // Load recipe
    fetch(`/api/recipes/${id}`)
      .then(r => {
        if (!r.ok) {
          throw new Error('Recipe not found')
        }
        return r.json()
      })
      .then(data => {
        setRecipe(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch recipe:', err)
        setLoading(false)
      })

    // Load reviews
    setReviewsLoading(true)
    fetch(`/api/reviews?recipeId=${id}`)
      .then(r => r.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : [])
        setReviewsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch reviews:', err)
        setReviews([])
        setReviewsLoading(false)
      })
  }, [id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to leave a review')
      return
    }

    if (!newReview.comment.trim()) {
      alert('Please enter a comment')
      return
    }

    setSubmittingReview(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      })

      if (response.ok) {
        const review = await response.json()
        setReviews(prev => [review, ...prev])
        setNewReview({ rating: 5, comment: '' })
        
        // Refresh recipe to get updated ratings
        const recipeResponse = await fetch(`/api/recipes/${id}`)
        if (recipeResponse.ok) {
          const updatedRecipe = await recipeResponse.json()
          setRecipe(updatedRecipe)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        Loading recipe...
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#666', marginBottom: '1rem' }}>Recipe not found</h2>
        <Link href="/" style={{ color: '#ff7a18' }}>← Back to recipes</Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#ff7a18', textDecoration: 'none', fontSize: '0.95rem' }}>
          ← Back to recipes
        </Link>
      </div>

      <div className="recipe-detail">
        <div className="recipe-detail-header">
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          <div className="recipe-detail-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="author-avatar">👤</div>
              <span>Unknown</span>
            </div>
            <div>Difficulty: <strong>{recipe.difficulty}</strong></div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>⭐ 3.0</span>
              <span>(1 review)</span>
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-primary">Update</button>
            <button className="btn-secondary" style={{ background: '#dc3545' }}>Delete</button>
          </div>
        </div>

        <div className="recipe-detail-content">
          <div className="ingredients-section">
            <h3 className="section-title">Ingredients</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <strong>{ingredient.name}</strong> — {ingredient.qty} {ingredient.unit}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No ingredients listed</p>
            )}
          </div>

          <div className="steps-section">
            <h3 className="section-title">Steps</h3>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className="steps-list">
                {recipe.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p style={{ color: '#666' }}>No cooking steps provided</p>
            )}
          </div>
        </div>

        <div style={{ padding: '2rem', borderTop: '1px solid #dee2e6' }}>
          <h3 className="section-title">Reviews</h3>
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>⭐⭐⭐⭐⭐</span>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Your rating</span>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Optional comments..."
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary">Save Review</button>
              <button className="btn-secondary">Remove</button>
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="author-avatar">z</div>
              <span style={{ fontWeight: '500' }}>zws</span>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>9/24/2024, 6:36:33 PM</span>
              <span style={{ marginLeft: 'auto' }}>⭐ 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}