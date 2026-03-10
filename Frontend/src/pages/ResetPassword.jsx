import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { api } from '../api'
import { Container, Box, Typography, TextField, Button, Alert, Paper, Link, CircularProgress } from '@mui/material'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      try {
        await api.verifyResetToken(token)
        setIsTokenValid(true)
      } catch (err) {
        setError('Invalid or expired reset token. Please request a new password reset.')
      } finally {
        setValidating(false)
      }
    }

    if (token) {
      validateToken()
    } else {
      setError('No reset token provided.')
      setValidating(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.resetPassword(token, newPassword, confirmPassword)
      alert('Password reset successfully! You can now log in with your new password.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validating reset link…</Typography>
      </Container>
    )
  }

  if (!isTokenValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Reset Password
          </Typography>
          <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>{error}</Alert>
          <Button component={RouterLink} to="/forgot-password" variant="contained" color="primary">
            Request new reset link
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom textAlign="center">
          Reset Password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Enter your new password below.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            fullWidth
          />

          <TextField
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Resetting…' : 'Reset password'}
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
