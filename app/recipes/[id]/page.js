"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

export default function RecipePage({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const id = params?.id

  useEffect(() => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
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
        setError(err.message)
        setLoading(false)
      })

    // Load reviews
    setReviewsLoading(true)
    fetch(`/api/reviews?recipeId=${id}`)
      .then(r => {
        if (!r.ok) {
          throw new Error('Failed to load reviews')
        }
        return r.json()
      })
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
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading recipe...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
          <Link href="/" style={{ color: '#ff7a18', textDecoration: 'none' }}>
            ← Back to recipes
          </Link>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#666', marginBottom: '1rem' }}>Recipe not found</h2>
          <Link href="/" style={{ color: '#ff7a18', textDecoration: 'none' }}>
            ← Back to recipes
          </Link>
        </div>
      </div>
    )
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  // Check if user already reviewed this recipe
  const userReview = reviews.find(review => review.user?._id === user?.id)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#ff7a18', textDecoration: 'none', fontSize: '0.95rem' }}>
          ← Back to recipes
        </Link>
      </div>

      <div className="recipe-detail">
        {/* Recipe Photo */}
        {recipe.photo && (
          <div style={{ 
            width: '100%', 
            height: '300px', 
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            background: '#f8f9fa'
          }}>
            <img 
              src={recipe.photo} 
              alt={recipe.title}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          </div>
        )}
        
        <div className="recipe-detail-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h1 className="recipe-detail-title">{recipe.title}</h1>
            {user && recipe.author?._id === user.id && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link 
                  href={`/recipes/${id}/edit`}
                  style={{
                    background: '#ff7a18',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  Edit Recipe
                </Link>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
                      try {
                        const token = localStorage.getItem('token')
                        const response = await fetch(`/api/recipes/${id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
                        
                        if (response.ok) {
                          router.push('/')
                        } else {
                          const error = await response.json()
                          alert('Failed to delete recipe: ' + (error.error || 'Unknown error'))
                        }
                      } catch (error) {
                        console.error('Failed to delete recipe:', error)
                        alert('Failed to delete recipe. Please try again.')
                      }
                    }
                  }}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="recipe-detail-meta">{/* existing meta content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="author-avatar">
                {recipe.author?.name ? recipe.author.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <span>{recipe.author?.name || 'Unknown Chef'}</span>
            </div>
            <div>Difficulty: <strong>{recipe.difficulty}</strong></div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>⭐ {recipe.avgRating?.toFixed(1) || '0.0'}</span>
              <span>({recipe.reviewCount || 0} reviews)</span>
            </div>
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

        {/* Reviews Section */}
        <div style={{ padding: '2rem', borderTop: '1px solid #dee2e6' }}>
          <h3 className="section-title">Reviews ({reviews.length})</h3>
          
          {/* Add Review Form (only if user is logged in and hasn't reviewed) */}
          {user && !userReview && (
            <form onSubmit={handleSubmitReview} style={{ 
              background: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '2rem' 
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#333' }}>Leave a Review</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Rating
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: rating <= newReview.rating ? '#ff7a18' : '#ddd'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Comment
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your thoughts about this recipe..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  required
                  style={{ minHeight: '100px' }}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* User's existing review */}
          {userReview && (
            <div style={{ 
              background: '#e8f5e8', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              border: '1px solid #c3e6c3'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#333' }}>Your Review</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#ff7a18' }}>{renderStars(userReview.rating)}</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, color: '#333' }}>{userReview.comment}</p>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No reviews yet. {user ? 'Be the first to review!' : 'Login to leave a review.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.filter(review => review.user?._id !== user?.id).map((review) => (
                <div key={review._id} style={{ 
                  padding: '1.5rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div className="author-avatar" style={{ fontSize: '0.9rem' }}>
                      {review.user?.name ? review.user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span style={{ fontWeight: '500' }}>{review.user?.name || 'Anonymous'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ marginLeft: 'auto', color: '#ff7a18' }}>
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#333', lineHeight: 1.5 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}