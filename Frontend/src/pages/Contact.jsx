import { useState } from 'react'
import { api } from '../api'

const initial = { firstName: '', lastName: '', email: '', phone: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await api.sendMessage(form)
      setSuccess(true)
      setForm(initial)
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Contact us</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Send a message and we’ll get back to you as soon as we can.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>First name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">Message sent successfully. We’ll be in touch.</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  )
}
