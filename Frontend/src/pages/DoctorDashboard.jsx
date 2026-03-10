import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Container, Typography, Box, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Divider, CircularProgress, Paper, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [availType, setAvailType] = useState('weekly') // 'weekly' or 'specific'
  const [availForm, setAvailForm] = useState({
    date: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingAvail, setEditingAvail] = useState(null)
  const [editForm, setEditForm] = useState({ startTime: '09:00', endTime: '17:00', slotDuration: 30 })
  const [notesModal, setNotesModal] = useState(null)
  const [notesForm, setNotesForm] = useState({ appointmentNotes: '', prescription: '' })
  const [notesSubmitting, setNotesSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, availRes] = await Promise.all([
          api.getDoctorAppointments().catch(() => ({ appointments: [] })),
          user && api.getDoctorAvailability(user._id).catch(() => ({ availability: [] })),
        ])
        setAppointments(appRes.appointments || [])
        setAvailability(availRes?.availability || [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handleAvailChange = (e) => {
    setAvailForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = {
        startTime: availForm.startTime,
        endTime: availForm.endTime,
        slotDuration: availForm.slotDuration,
      }

      if (availType === 'specific') {
        formData.date = availForm.date
      } else {
        formData.dayOfWeek = availForm.dayOfWeek
      }

      await api.setAvailability(formData)
      const availRes = await api.getDoctorAvailability(user._id)
      setAvailability(availRes.availability || [])
      alert('Availability set successfully!')
      setAvailForm({
        ...availForm,
        date: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to set availability')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAvailability = async (id) => {
    if (window.confirm('Delete this availability slot?')) {
      try {
        await api.deleteAvailability(id)
        setAvailability((prev) => prev.filter((a) => a._id !== id))
        setEditingAvail(null)
      } catch (err) {
        setError(err.message || 'Failed to delete availability')
      }
    }
  }

  const openEditAvail = (a) => {
    setEditingAvail(a)
    setEditForm({ startTime: a.startTime, endTime: a.endTime, slotDuration: a.slotDuration })
  }

  const handleEditAvailChange = (e) => {
    const { name, value } = e.target
    setEditForm((f) => ({ ...f, [name]: name === 'slotDuration' ? Number(value) : value }))
  }

  const openNotesModal = (a) => {
    setNotesModal(a)
    setNotesForm({
      appointmentNotes: a.appointmentNotes || '',
      prescription: a.prescription || '',
    })
  }

  const handleAddNotes = async (e) => {
    e.preventDefault()
    if (!notesModal) return
    if (!notesForm.appointmentNotes && !notesForm.prescription) {
      setError('Add at least notes or prescription')
      return
    }
    setNotesSubmitting(true)
    setError('')
    try {
      await api.addAppointmentNotes(notesModal._id, notesForm)
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === notesModal._id ? { ...a, ...notesForm, status: 'Accepted' } : a
        )
      )
      setNotesModal(null)
      alert('Notes added successfully!')
    } catch (err) {
      setError(err.message || 'Failed to add notes')
    } finally {
      setNotesSubmitting(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus)
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  const getVideoMeetingUrl = (appointmentId) => {
    const roomName = `rahat-${appointmentId}`.replace(/[^a-zA-Z0-9-]/g, '-')
    return `https://meet.jit.si/${roomName}`
  }

  const handleUpdateAvailability = async (e) => {
    e.preventDefault()
    if (!editingAvail) return
    try {
      await api.updateAvailability(editingAvail._id, editForm)
      setAvailability((prev) =>
        prev.map((a) =>
          a._id === editingAvail._id ? { ...a, ...editForm } : a
        )
      )
      setEditingAvail(null)
      alert('Availability updated successfully!')
    } catch (err) {
      setError(err.message || 'Failed to update availability')
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard…</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome, Dr. {user?.firstName}
        </Typography>
        <Typography color="text.secondary">
          Doctor Dashboard
        </Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label={`Appointments (${appointments.length})`} />
          <Tab label={`Availability (${availability.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Your Appointments
          </Typography>
          <Grid container spacing={3}>
            {appointments.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No appointments yet.</Typography>
              </Grid>
            )}
            {appointments.map((a) => (
              <Grid item xs={12} key={a._id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {a.firstName} {a.lastName}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {a.department} • {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Payment: <Box component="span" sx={{ color: a.paymentStatus === 'Completed' ? 'success.main' : 'text.primary', fontWeight: 'bold' }}>{a.paymentStatus === 'Completed' ? 'Successful' : a.paymentStatus || 'Pending'}</Box>
                        </Typography>

                        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={a.status}
                            label="Status"
                            onChange={(e) => handleStatusChange(a._id, e.target.value)}
                            sx={{
                              bgcolor: 'background.paper',
                              color: a.status === 'Pending' ? 'warning.main' : a.status === 'Accepted' ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Accepted">Accepted</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start', minWidth: 200 }}>
                      <Button
                        variant="outlined"
                        onClick={() => openNotesModal(a)}
                        startIcon={<EditIcon />}
                        fullWidth
                      >
                        {a.appointmentNotes || a.prescription ? 'Edit Notes' : 'Add Notes / Prescn.'}
                      </Button>
                      {a.status === 'Accepted' && (
                        <Button
                          variant="contained"
                          color="primary"
                          href={getVideoMeetingUrl(a._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<VideoCallIcon />}
                          fullWidth
                        >
                          Join Video Call
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Set Availability
              </Typography>

              <RadioGroup
                row
                value={availType}
                onChange={(e) => setAvailType(e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="specific" control={<Radio />} label="Specific Date" />
              </RadioGroup>

              <Box component="form" onSubmit={handleAddAvailability} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {availType === 'specific' ? (
                  <TextField
                    type="date"
                    label="Date"
                    name="date"
                    value={availForm.date}
                    onChange={handleAvailChange}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                  />
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>Day of Week</InputLabel>
                    <Select name="dayOfWeek" value={availForm.dayOfWeek} onChange={handleAvailChange} label="Day of Week">
                      <MenuItem value="Monday">Monday</MenuItem>
                      <MenuItem value="Tuesday">Tuesday</MenuItem>
                      <MenuItem value="Wednesday">Wednesday</MenuItem>
                      <MenuItem value="Thursday">Thursday</MenuItem>
                      <MenuItem value="Friday">Friday</MenuItem>
                      <MenuItem value="Saturday">Saturday</MenuItem>
                      <MenuItem value="Sunday">Sunday</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      type="time"
                      label="Start Time"
                      name="startTime"
                      value={availForm.startTime}
                      onChange={handleAvailChange}
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      type="time"
                      label="End Time"
                      name="endTime"
                      value={availForm.endTime}
                      onChange={handleAvailChange}
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <TextField
                  type="number"
                  label="Slot Duration (minutes)"
                  name="slotDuration"
                  value={availForm.slotDuration}
                  onChange={handleAvailChange}
                  inputProps={{ min: 15, max: 120 }}
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={submitting}
                  size="large"
                  sx={{ mt: 1 }}
                >
                  {submitting ? 'Setting…' : 'Set Availability'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Current Schedule
            </Typography>
            <Grid container spacing={2}>
              {availability.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No availability set yet.</Typography>
                </Grid>
              )}
              {availability.map((a) => (
                <Grid item xs={12} key={a._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {a.dayOfWeek ? a.dayOfWeek : new Date(a.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={a.dayOfWeek ? 'Weekly' : 'Specific'}
                            color={a.dayOfWeek ? 'primary' : 'warning'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {a.startTime} - {a.endTime} ({a.slotDuration} min slots)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="primary" onClick={() => openEditAvail(a)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteAvailability(a._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Notes Modal */}
      <Dialog open={!!notesModal} onClose={() => setNotesModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Notes & Prescription</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Patient: {notesModal?.firstName} {notesModal?.lastName} • {notesModal?.department}
          </Typography>
          <Box component="form" id="notes-form" onSubmit={handleAddNotes} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Appointment Notes"
              name="appointmentNotes"
              multiline
              rows={4}
              value={notesForm.appointmentNotes}
              onChange={(e) => setNotesForm((f) => ({ ...f, appointmentNotes: e.target.value }))}
              placeholder="Clinical notes, diagnosis, follow-up instructions..."
              fullWidth
            />
            <TextField
              label="Prescription"
              name="prescription"
              multiline
              rows={4}
              value={notesForm.prescription}
              onChange={(e) => setNotesForm((f) => ({ ...f, prescription: e.target.value }))}
              placeholder="Medications, dosage, duration..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNotesModal(null)} color="inherit">Cancel</Button>
          <Button type="submit" form="notes-form" variant="contained" color="primary" disabled={notesSubmitting}>
            {notesSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Availability Modal */}
      <Dialog open={!!editingAvail} onClose={() => setEditingAvail(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Availability</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="edit-avail-form" onSubmit={handleUpdateAvailability} sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              type="time"
              label="Start Time"
              name="startTime"
              value={editForm.startTime}
              onChange={handleEditAvailChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              type="time"
              label="End Time"
              name="endTime"
              value={editForm.endTime}
              onChange={handleEditAvailChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              type="number"
              label="Slot Duration (minutes)"
              name="slotDuration"
              value={editForm.slotDuration}
              onChange={handleEditAvailChange}
              inputProps={{ min: 15, max: 120 }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingAvail(null)} color="inherit">Cancel</Button>
          <Button type="submit" form="edit-avail-form" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
