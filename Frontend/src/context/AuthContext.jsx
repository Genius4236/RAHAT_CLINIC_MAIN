import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole')
    
    if (loggedInStatus && role) {
      setIsLoggedIn(true)
      setUserRole(role)
    }
    setLoading(false)
  }, [])

  const login = (role, userData = null) => {
    setIsLoggedIn(true)
    setUserRole(role)
    setUser(userData)
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', role)
  }

  const logout = async () => {
    setIsLoggedIn(false)
    setUserRole('')
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
