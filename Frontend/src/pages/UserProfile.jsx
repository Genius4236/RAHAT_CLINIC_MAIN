import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        dob: user.dob ? user.dob.split('T')[0] : '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setPasswordLoading(true)
    try {
      await api.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      )
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePassword(false)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await api.updateProfile(form)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>My Profile</h1>
          <p style={{ color: 'var(--color-muted)' }}>View and manage your account information</p>
        </header>

        {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}
        {success && <p className="success-msg" style={{ marginBottom: '1rem' }}>{success}</p>}

        {!isEditing ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    First Name
                  </label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {form.firstName}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    Last Name
                  </label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {form.lastName}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                  Email
                </label>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                  {form.email}
                </p>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                  Phone
                </label>
                <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                  {form.phone}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    Gender
                  </label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {form.gender}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                    Date of Birth
                  </label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {form.dob ? new Date(form.dob).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Edit Profile
            </button>

            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Change Password</h3>
              {!showChangePassword ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  {passwordError && <p className="error-msg">{passwordError}</p>}
                  {passwordSuccess && <p className="success-msg">{passwordSuccess}</p>}
                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                      {passwordLoading ? 'Updating…' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setShowChangePassword(false)
                        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                        setPasswordError('')
                        setPasswordSuccess('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
