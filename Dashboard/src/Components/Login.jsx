import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../api'

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigateTo = useNavigate()

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.loginAdmin(email, password)
      toast.success(response.message || 'Login successful')
      localStorage.setItem('isLoggedIn', 'true')
      setIsAuthenticated(true)
      setEmail('')
      setPassword('')
      // Navigate after setting state to allow state to update
      setTimeout(() => {
        navigateTo('/')
      }, 500)
    } catch (error) {
      toast.error(error.message || 'Login failed')
      localStorage.removeItem('isLoggedIn')
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return <Navigate to={'/'} />
  }

  return (
    <>
      <section className="container form-component">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">WELCOME TO Rahat Medical Clinic</h1>
        <p>Only Admins Are Allowed To Access These Resources!</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div style={{ justifyContent: 'center', alignItems: 'center' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default Login
