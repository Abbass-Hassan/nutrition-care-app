import { useState, useEffect } from 'react'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('signin')

  // Update URL when page changes
  useEffect(() => {
    const path = currentPage === 'signup' ? '/signup' : '/signin'
    window.history.pushState({}, '', path)
  }, [currentPage])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/signup') {
        setCurrentPage('signup')
      } else {
        setCurrentPage('signin')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Set initial page based on URL
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/signup') {
      setCurrentPage('signup')
    } else {
      setCurrentPage('signin')
    }
  }, [])

  const renderPage = () => {
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
