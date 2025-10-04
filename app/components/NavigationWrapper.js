"use client"

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function NavigationWrapper() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <span className="brand-icon">🍽️</span>
            <span className="brand-text">PlateMate</span>
          </Link>
          <div className="nav-links">
            <span style={{ color: '#666' }}>Loading...</span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-text">PlateMate</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/" className="nav-link">Browse</Link>
              <Link href="/recipes/new" className="nav-link">Create Recipe</Link>
              <span className="nav-link" style={{ color: '#666' }}>
                Welcome, {user.name}
              </span>
              <button 
                className="logout-btn" 
                onClick={logout}
                style={{ 
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/signup" style={{ 
                background: '#ff7a18',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}