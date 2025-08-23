import { useState, useEffect } from 'react'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('signin')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication and set initial state
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      console.log('🔍 Checking authentication...')
      console.log('Token:', token ? 'Found' : 'Not found')
      console.log('User:', user ? 'Found' : 'Not found')
      
      if (token && user) {
        console.log('✅ User authenticated, redirecting to dashboard')
        setIsAuthenticated(true)
        setCurrentPage('dashboard')
        // Update URL to dashboard
        window.history.pushState({}, '', '/dashboard')
      } else {
        console.log('❌ User not authenticated, staying on signin')
        setIsAuthenticated(false)
        // Check current URL and set appropriate page
        const path = window.location.pathname
        if (path === '/signup') {
          setCurrentPage('signup')
        } else {
          setCurrentPage('signin')
          window.history.pushState({}, '', '/signin')
        }
      }
    }

    checkAuth()
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/dashboard' && isAuthenticated) {
        setCurrentPage('dashboard')
      } else if (path === '/signup') {
        setCurrentPage('signup')
        setIsAuthenticated(false)
      } else {
        setCurrentPage('signin')
        setIsAuthenticated(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isAuthenticated])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentPage('signin')
    window.history.pushState({}, '', '/signin')
  }

  const renderPage = () => {
    console.log('🎭 Rendering page:', { isAuthenticated, currentPage })
    
    if (isAuthenticated) {
      return <Dashboard onSignOut={handleSignOut} />
    }

    switch (currentPage) {
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />
      default:
        return <SignIn onNavigate={setCurrentPage} />
    }
  }

  return renderPage()
}

export default App
