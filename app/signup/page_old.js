"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement actual signup API
      console.log('Sign up:', { name, email, password })
      
      // For now, just redirect to home page
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.error('Signup failed:', error)
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa'
    }}>
      <div className="form-container" style={{ 
        maxWidth: '400px', 
        width: '100%',
        margin: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Sign Up
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ 
              width: '100%', 
              marginBottom: '1rem',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <Link 
            href="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#666',
              background: 'white',
              fontWeight: '500'
            }}
          >
            I already have an account
          </Link>
        </form>
      </div>
    </div>
  )
}