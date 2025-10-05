"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'
import { apiCall } from '../../../lib/api'

export default function NewRecipe() {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [ingredients, setIngredients] = useState([{ name: '', qty: '', unit: '' }])
  const [steps, setSteps] = useState([''])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const router = useRouter()
  const { user } = useAuth()

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
      const response = await apiCall('/recipes', { 
        method: 'POST', 
        body,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        console.error('Failed to create recipe:', error)
        alert('Failed to create recipe: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create recipe:', error)
      alert('Failed to create recipe. Please try again.')
    }
  }

  return (
    <ProtectedRoute>
      <div>
        <div className="page-header">
          <h1 className="page-title">Create New Recipe</h1>
        </div>

        <form onSubmit={submit} className="form-container">
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="form-group">
              <label className="form-label">Recipe Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter recipe title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level *</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recipe Photo</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreview && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={photoPreview} 
                    alt="Recipe preview" 
                    style={{ 
                      width: '200px', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }} 
                  />
                </div>
              )}
              <small style={{ color: '#666', fontSize: '0.9rem' }}>
                {photo ? `Selected: ${photo.name}` : 'No file chosen'}
              </small>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Ingredients *</h2>
            <div className="dynamic-list">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="list-item">
                  <input
                    type="text"
                    className="list-input"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={e => updateIngredient(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    className="list-input"
                    placeholder="Qty"
                    style={{ flex: '0 0 80px' }}
                    value={ingredient.qty}
                    onChange={e => updateIngredient(index, 'qty', e.target.value)}
                  />
                  <input
                    type="text"
                    className="list-input"
                    placeholder="unit (e.g. cup, tsp)"
                    style={{ flex: '0 0 140px' }}
                    value={ingredient.unit}
                    onChange={e => updateIngredient(index, 'unit', e.target.value)}
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
              <button type="button" className="add-item-btn" onClick={addIngredient}>
                + Add Ingredient
              </button>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Cooking Steps *</h2>
            <div className="dynamic-list">
              {steps.map((step, index) => (
                <div key={index} className="list-item">
                  <span style={{ fontSize: '0.9rem', color: '#666', minWidth: '20px' }}>
                    {index + 1}.
                  </span>
                  <textarea
                    className="form-textarea list-input"
                    placeholder="Step 1 instructions..."
                    value={step}
                    onChange={e => updateStep(index, e.target.value)}
                    style={{ minHeight: '80px' }}
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
              <button type="button" className="add-item-btn" onClick={addStep}>
                + Add Step
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}