import { useState } from 'react'
import { api } from '../api'
import { Container, Typography, Box, Grid, TextField, Button, Alert, Link, Paper } from '@mui/material'

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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
          Contact us
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} textAlign="center">
          Send a message and we’ll get back to you as soon as we can.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Message sent successfully. We’ll be in touch.</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Message"
            name="message"
            multiline
            rows={4}
            value={form.message}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="contained" color="primary" disabled={loading} size="large" sx={{ mt: 2 }}>
            {loading ? 'Sending…' : 'Send message'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
