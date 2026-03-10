import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { api } from '../api'
import { Container, Box, Typography, TextField, Button, Alert, Paper, Link } from '@mui/material'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await api.requestPasswordReset(email)
      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom textAlign="center">
          Forgot password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">
              Password reset link has been sent to your email. Check your inbox!
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link component={RouterLink} to="/login" fontWeight="bold" color="primary" underline="hover">
              Log in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
