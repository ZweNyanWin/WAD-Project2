"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from './contexts/AuthContext'

export default function Page() {
  const [recipes, setRecipes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    
    fetch('/api/recipes')
      .then(r => {
        if (!r.ok) {
          throw new Error('Failed to fetch recipes')
        }
        return r.json()
      })
      .then(data => {
        if (mounted) {
          setRecipes(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('Failed to fetch recipes (client):', err)
        if (mounted) {
          setError(err.message)
          setRecipes([])
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading recipes...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error loading recipes</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#ff7a18',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">PlateMate</h1>
        <p className="page-subtitle">Discover, share, and rate recipes from home cooks around the world</p>
      </div>

      {/* {!user && (
        <div className="welcome-banner">
          <p className="welcome-text">
            <strong>Welcome to PlateMate! 🍽️</strong>
          </p>
          <p className="welcome-subtext">
            <Link href="/signup" className="welcome-link">Sign up</Link>
            {' '}or{' '}
            <Link href="/login" className="welcome-link">log in</Link>
            {' '}to create and share your own recipes!
          </p>
        </div>
      )} */}

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Ingredients</label>
            <input
              type="text"
              placeholder="Type ingredient and press Enter"
              className="ingredients-input"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Difficulty</label>
            <div className="difficulty-filters">
              {['Easy', 'Medium', 'Hard', 'Any'].map(level => (
                <button
                  key={level}
                  className={`difficulty-btn ${selectedDifficulty === level || (level === 'Any' && !selectedDifficulty) ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(level === 'Any' ? '' : level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Sort by</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-count">
        {filteredRecipes.length} recipes found
      </div>

      <div className="recipes-grid">
        {filteredRecipes.length === 0 && (
          <div className="no-recipes">
            No recipes yet. <Link href="/recipes/new" className="create-link">Create the first one!</Link>
          </div>
        )}
        {filteredRecipes.map(recipe => {
          if (!recipe || !recipe._id) return null
          
          return (
            <Link key={recipe._id || recipe.id} href={`/recipes/${recipe._id || recipe.id}`} className="recipe-card">
              <div className="recipe-image">
                {recipe.photo ? (
                  <img 
                    src={recipe.photo} 
                    alt={recipe.title || 'Recipe'}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  <span style={{ fontSize: '3rem' }}>🍳</span>
                )}
                <div className="recipe-difficulty">{recipe.difficulty || 'Easy'}</div>
              </div>
              <div className="recipe-content">
                <h3 className="recipe-title">{recipe.title || 'Untitled Recipe'}</h3>
                <div className="recipe-meta">
                  <div className="recipe-author">
                    <div className="author-avatar">
                      {recipe.author?.name ? recipe.author.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <span>{recipe.author?.name || 'Unknown Chef'}</span>
                  </div>
                  <div>⭐ {recipe.avgRating?.toFixed(1) || '0.0'} ({recipe.reviewCount || 0})</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
