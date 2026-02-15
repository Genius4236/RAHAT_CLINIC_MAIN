import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Input from '../Components/Input'
import Button from '../Components/Button'
import Alert from '../Components/Alert'
import Loading from '../Components/Loading'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.login(email, password, role)
      login(role, response.user)
      navigate(role === 'Patient' ? '/book' : '/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="page">
      <Alert message={error} type="error" onClose={() => setError('')} />
      <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Log in</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Sign in to book or manage appointments.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="role" style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                width: '100%',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <option value="Patient">Patient</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
