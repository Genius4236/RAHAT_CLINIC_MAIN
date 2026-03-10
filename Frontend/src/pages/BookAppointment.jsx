import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Container, Typography, Box, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Paper, Alert, Link as MuiLink } from '@mui/material'

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([])
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availability, setAvailability] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    appointment_date: '',
    appointment_time: '',
    department: '',
    doctor_firstName: '',
    doctor_lastName: '',
    address: '',
  })

  useEffect(() => {
    Promise.all([api.getDoctors().catch(() => ({ doctors: [] })), api.getPatient().catch(() => null)])
      .then(([docRes, me]) => {
        setDoctors(docRes.doctors || [])
        if (me?.user) {
          const u = me.user
          setForm((f) => ({
            ...f,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            gender: u.gender || 'Male',
            dob: u.dob ? u.dob.slice(0, 10) : '',
          }))
          setPatient(me.user)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    // Load availability when date changes (use new value since state is async)
    if (name === 'appointment_date' && selectedDoctor && value) {
      loadAvailability(selectedDoctor._id, value)
    }
  }

  const handleDoctorSelect = (e) => {
    const id = e.target.value
    const doc = doctors.find((d) => d._id === id)
    if (doc) {
      setSelectedDoctor(doc)
      setForm((f) => ({
        ...f,
        doctor_firstName: doc.firstName,
        doctor_lastName: doc.lastName,
        department: doc.doctorDepartment || '',
      }))
      // Load availability if date is already selected
      if (form.appointment_date) {
        loadAvailability(id, form.appointment_date)
      }
    }
  }

  const loadAvailability = async (doctorId = selectedDoctor?._id, date = form.appointment_date) => {
    if (!doctorId || !date) return

    setAvailabilityLoading(true)
    try {
      const res = await api.getAvailableSlots(doctorId, date)
      setAvailability(res.slots || [])
    } catch (err) {
      console.log('No availability data:', err.message)
      setAvailability([])
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patient) {
      setError('Please log in to book an appointment.')
      return
    }

    // NEW VALIDATION CHECK
    if (!form.appointment_time) {
      setError('Please select an available appointment time.')
      return
    }

    setError('')
    setSuccess(false)
    setSubmitLoading(true)
    try {
      await api.postAppointment(form)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to book appointment')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading…</Typography>
      </Container>
    )
  }

  if (!patient) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">Book an appointment</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          You need to be logged in to book an appointment.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button component={Link} to="/login" variant="contained" color="primary">Log in</Button>
          <Button component={Link} to="/register" variant="outlined" color="primary">Register</Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Book an appointment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Choose a doctor and time. We’ll confirm your booking.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Appointment request sent. We’ll confirm shortly.</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, mt: 2 }} fontWeight="bold">Personal Details</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First name" name="firstName" value={form.firstName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last name" name="lastName" value={form.lastName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} inputProps={{ maxLength: 10 }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date of birth" type="date" name="dob" value={form.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select labelId="gender-label" name="gender" value={form.gender} label="Gender" onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} required />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2, mt: 4 }} fontWeight="bold">Appointment Details</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  label="Doctor"
                  value={doctors.find((d) => d.firstName === form.doctor_firstName && d.lastName === form.doctor_lastName)?._id || ''}
                  onChange={handleDoctorSelect}
                >
                  <MenuItem value=""><em>Select a doctor</em></MenuItem>
                  {doctors.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      Dr. {d.firstName} {d.lastName} — {d.doctorDepartment || 'General'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" name="department" value={form.department} disabled InputLabelProps={{ shrink: true }} placeholder="From doctor" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Appointment date" type="date" name="appointment_date" value={form.appointment_date} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
            </Grid>
          </Grid>

          {selectedDoctor && form.appointment_date && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Available Time Slots</Typography>
              {availabilityLoading ? (
                <Typography color="text.secondary">Loading available slots…</Typography>
              ) : availability.length > 0 ? (
                <Grid container spacing={1}>
                  {availability.map((slot) => (
                    <Grid item key={slot.time}>
                      <Button
                        variant={form.appointment_time === slot.time ? "contained" : "outlined"}
                        color={form.appointment_time === slot.time ? "primary" : "inherit"}
                        disabled={!slot.available}
                        onClick={() => setForm((f) => ({ ...f, appointment_time: slot.time }))}
                        sx={{ minWidth: 80, textTransform: 'none' }}
                      >
                        {slot.time}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">No available slots for this date</Typography>
              )}
            </Box>
          )}

          <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 5, py: 1.5 }} disabled={submitLoading}>
            {submitLoading ? 'Submitting…' : 'Request appointment'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}