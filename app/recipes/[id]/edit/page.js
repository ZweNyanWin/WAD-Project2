"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useAuth } from '../../../contexts/AuthContext'
import Link from 'next/link'

export default function EditRecipe({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [ingredients, setIngredients] = useState([{ name: '', qty: '', unit: '' }])
  const [steps, setSteps] = useState([''])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id

  useEffect(() => {
    if (!id) return
    
    // Load recipe to edit
    fetch(`/api/recipes/${id}`)
      .then(r => {
        if (!r.ok) {
          throw new Error('Recipe not found')
        }
        return r.json()
      })
      .then(data => {
        // Check if user owns this recipe
        if (user && data.author?._id !== user.id) {
          alert('You can only edit your own recipes')
          router.push(`/recipes/${id}`)
          return
        }
        
        setRecipe(data)
        setTitle(data.title || '')
        setDifficulty(data.difficulty || 'Easy')
        setIngredients(data.ingredients?.length > 0 ? data.ingredients : [{ name: '', qty: '', unit: '' }])
        setSteps(data.steps?.length > 0 ? data.steps : [''])
        setPhotoPreview(data.photo)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch recipe:', err)
        alert('Failed to load recipe')
        router.push('/')
      })
  }, [id, user, router])

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', qty: '', unit: '' }])
  }

  function removeIngredient(index) {
    setIngredients(prev => prev.filter((_, i) => i !== index))
  }

  function updateIngredient(index, field, value) {
    setIngredients(prev => {
      const updated = [...prev]
      updated[index][field] = value
      return updated
    })
  }

  function addStep() {
    setSteps(prev => [...prev, ''])
  }

  function removeStep(index) {
    setSteps(prev => prev.filter((_, i) => i !== index))
  }

  function updateStep(index, value) {
    setSteps(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    
    const body = new FormData()
    body.append('title', title)
    body.append('difficulty', difficulty)
    body.append('ingredients', JSON.stringify(ingredients.filter(ing => ing.name)))
    body.append('steps', JSON.stringify(steps.filter(step => step.trim())))
    if (photo) {
      body.append('photo', photo)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/recipes/${id}`, { 
        method: 'PUT', 
        body,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        router.push(`/recipes/${id}`)
      } else {
        const error = await response.json()
        console.error('Failed to update recipe:', error)
        alert('Failed to update recipe: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update recipe:', error)
      alert('Failed to update recipe. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading recipe...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/recipes/${id}`} style={{ color: '#ff7a18', textDecoration: 'none', fontSize: '0.95rem' }}>
            ← Back to recipe
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">Edit Recipe</h1>
        </div>

        <div className="form-container">
          <form onSubmit={submit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="title">Recipe Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="Enter recipe title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="difficulty">Difficulty Level *</label>
                <select
                  id="difficulty"
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Recipe Photo */}
            <div className="form-section">
              <h3 className="section-title">Recipe Photo</h3>
              <div className="form-group">
                <input
                  type="file"
                  className="form-input"
                  onChange={handlePhotoChange}
                  accept="image/*"
                />
                {photoPreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={photoPreview} 
                      alt="Recipe preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-section">
              <h3 className="section-title">Ingredients *</h3>
              <div className="dynamic-list">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      className="list-input"
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="list-input"
                      placeholder="Qty"
                      value={ingredient.qty}
                      onChange={(e) => updateIngredient(index, 'qty', e.target.value)}
                      style={{ maxWidth: '100px' }}
                    />
                    <input
                      type="text"
                      className="list-input"
                      placeholder="unit (e.g. cup, tsp)"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      style={{ maxWidth: '150px' }}
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeIngredient(index)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addIngredient}
                >
                  + Add Ingredient
                </button>
              </div>
            </div>

            {/* Cooking Steps */}
            <div className="form-section">
              <h3 className="section-title">Cooking Steps *</h3>
              <div className="dynamic-list">
                {steps.map((step, index) => (
                  <div key={index} className="list-item">
                    <span style={{ fontWeight: '600', color: '#333', minWidth: '20px' }}>
                      {index + 1}.
                    </span>
                    <textarea
                      className="list-input"
                      placeholder="Step 1 instructions..."
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeStep(index)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addStep}
                >
                  + Add Step
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <Link href={`/recipes/${id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                Cancel
              </Link>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}