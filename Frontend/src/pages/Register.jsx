import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Input from '../Components/Input'
import Button from '../Components/Button'
import Alert from '../Components/Alert'
import Loading from '../Components/Loading'
import { validators, validateForm } from '../utils/validators'

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
    <div className="page">
      <Alert message={error} type="error" onClose={() => setError('')} />
      <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Create account</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Register as a patient to book appointments.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />

          <Input
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            maxLength={10}
            error={errors.phone}
            required
          />

          <div>
            <label htmlFor="gender" style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <Input
            label="Date of birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            error={errors.dob}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
