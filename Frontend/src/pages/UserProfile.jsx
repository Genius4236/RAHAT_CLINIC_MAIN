import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Container, Typography, Box, Grid, TextField, Button, MenuItem, Paper, Alert, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import EventIcon from '@mui/icons-material/Event';

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
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Profile
        </Typography>
        <Typography color="text.secondary">
          View and manage your account information
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {!isEditing ? (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }} />
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2, border: '4px solid white', boxShadow: 2 }}>
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">{form.firstName} {form.lastName}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <EmailIcon fontSize="small" /> {form.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Full Name</Typography>
                    <Typography variant="h6" fontWeight={500}>{form.firstName} {form.lastName}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Phone</Typography>
                    <Typography variant="h6" fontWeight={500}>{form.phone}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <WcIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Gender</Typography>
                    <Typography variant="h6" fontWeight={500}>{form.gender}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <EventIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>Date of Birth</Typography>
                    <Typography variant="h6" fontWeight={500}>{form.dob ? new Date(form.dob).toLocaleDateString() : 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Button variant="contained" color="primary" fullWidth size="large" onClick={() => setIsEditing(true)} sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
            Edit Profile
          </Button>

          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Change Password</Typography>
            <Divider sx={{ mb: 3 }} />
            {!showChangePassword ? (
              <Button variant="outlined" color="primary" onClick={() => setShowChangePassword(true)} sx={{ mt: 1 }}>
                Change Password
              </Button>
            ) : (
              <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {passwordError && <Alert severity="error">{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}

                <TextField fullWidth type="password" label="Current Password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required />
                <TextField fullWidth type="password" label="New Password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required helperText="Minimum 8 characters" />
                <TextField fullWidth type="password" label="Confirm New Password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 1 }, mt: 1 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={passwordLoading} sx={{ flex: 1 }}>
                    {passwordLoading ? 'Updating…' : 'Update Password'}
                  </Button>
                  <Button variant="outlined" sx={{ flex: 1 }} onClick={() => {
                    setShowChangePassword(false)
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                    setPasswordSuccess('')
                  }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      ) : (
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>Edit Profile</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
              </Grid>
            </Grid>

            <TextField fullWidth type="email" label="Email" name="email" value={form.email} onChange={handleChange} required />
            <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} inputProps={{ maxLength: 10 }} required />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Gender" name="gender" value={form.gender} onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ flex: 1 }} disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="outlined" size="large" sx={{ flex: 1 }} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  )
}
