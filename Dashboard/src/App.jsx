import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Login from './Components/Login'
import AddNewDoctor from './Components/AddNewDoctor'
import Messages from './Components/Messages'
import Doctors from './Components/Doctors'
import Sidebar from './Components/Sidebar'
import AddNewAdmin from './Components/AddNewAdmin'
import { api } from './api'
import './App.css'

const App = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in and validate session
    const loggedInStatus = localStorage.getItem('isLoggedIn')
    if (loggedInStatus === 'true') {
      const fetchUser = async () => {
        try {
          const response = await api.getAdmin()
          setIsAuthenticated(true)
          setAdmin(response.user)
        } catch (error) {
          console.error('Failed to fetch admin:', error)
          setIsAuthenticated(false)
          setAdmin({})
          localStorage.removeItem('isLoggedIn')
          navigate('/login')
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [navigate])

  // Listen for localStorage changes (explicit logout from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn')
      if (loggedInStatus !== 'true') {
        setIsAuthenticated(false)
        setAdmin({})
        navigate('/login')
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [navigate])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <>
      <Sidebar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={isAuthenticated ? <Dashboard isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/doctor/addnew' element={isAuthenticated ? <AddNewDoctor isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/admin/addnew' element={isAuthenticated ? <AddNewAdmin isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/messages' element={isAuthenticated ? <Messages isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/doctors' element={isAuthenticated ? <Doctors isAuthenticated={isAuthenticated} /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
      </Routes>
    </>
  )
}

export default App
