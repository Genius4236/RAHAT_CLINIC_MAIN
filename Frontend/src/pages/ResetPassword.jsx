import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

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
      <div className="page">
        <div className="container">
          <p>Validating reset link…</p>
        </div>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Reset password</h1>
          <p className="error-msg" style={{ marginBottom: '2rem' }}>{error}</p>
          <Link to="/forgot-password" className="btn btn-primary">
            Request new reset link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Reset password</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
