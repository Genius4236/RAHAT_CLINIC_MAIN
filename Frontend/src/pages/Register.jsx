import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Input from '../Components/Input'
import Button from '../Components/Button'
import Alert from '../Components/Alert'
import Loading from '../Components/Loading'
import { validators, validateForm } from '../utils/validators'
import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, Link as MuiLink } from '@mui/material'

const initial = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  gender: 'Male',
  dob: '',
  role: 'Patient',
}

const validationRules = {
  firstName: (v) => validators.name(v, 'First name'),
  lastName: (v) => validators.name(v, 'Last name'),
  email: (v) => validators.email(v),
  phone: (v) => validators.phone(v),
  dob: (v) => validators.dob(v),
  password: (v) => validators.password(v),
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate form
    const validationErrors = validateForm(form, validationRules)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const response = await api.register(form)
      login(form.role, response.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
      <Box sx={{ maxWidth: 420, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
          Create account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} textAlign="center">
          Register as a patient to book appointments.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Input
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            style={{ marginBottom: 0 }}
          />

          <Input
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            style={{ marginBottom: 0 }}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
            style={{ marginBottom: 0 }}
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            error={errors.phone}
            required
            style={{ marginBottom: 0 }}
          />

          <FormControl fullWidth>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender"
              name="gender"
              value={form.gender}
              label="Gender"
              onChange={handleChange}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          <Input
            label="Date of birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            error={errors.dob}
            required
            InputLabelProps={{ shrink: true }}
            style={{ marginBottom: 0 }}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
            style={{ marginBottom: 0 }}
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', mt: 2, padding: '12px' }}>
            {loading ? 'Creating account…' : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <MuiLink component={Link} to="/login" underline="hover">
            Log in
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  )
}
