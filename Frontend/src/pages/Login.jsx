import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Input from '../Components/Input'
import Button from '../Components/Button'
import Alert from '../Components/Alert'
import Loading from '../Components/Loading'
import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, Link as MuiLink } from '@mui/material'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      const response = await api.login(email, password)
      const assignedRole = response.user.role
      login(assignedRole, response.user)
      navigate(assignedRole === 'Patient' ? '/book' : '/')
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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Alert message={error} type="error" onClose={() => setError('')} />
      <Box sx={{ maxWidth: 420, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Log in
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to book or manage appointments.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>

          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ marginBottom: 0 }}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: 0 }}
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '10px' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <MuiLink component={Link} to="/forgot-password" underline="hover">
              Forgot password?
            </MuiLink>
          </Typography>
          <Typography variant="body2">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" underline="hover">
              Register
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
