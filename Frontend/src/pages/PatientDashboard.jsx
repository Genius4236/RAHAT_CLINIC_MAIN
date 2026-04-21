import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Container, Typography, Box, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Chip, CircularProgress, IconButton } from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PaymentIcon from '@mui/icons-material/Payment'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import CancelIcon from '@mui/icons-material/Cancel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SmartToyIcon from '@mui/icons-material/SmartToy'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  // Reschedule Modal States
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(null)

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-script')) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })

  const payForAppointment = async (appointment) => {
    const amount = 500
    setPaymentLoading(appointment._id)
    setError('')
    try {
      await loadRazorpayScript()
      const keyRes = await api.getPaymentKey()
      const key = keyRes.key
      const { payment, order } = await api.createPaymentOrder(appointment._id, amount)

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Rahat Clinic',
        description: `Payment for appointment - ${appointment.department}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              appointment._id
            )
            setAppointments((prev) =>
              prev.map((a) =>
                a._id === appointment._id ? { ...a, paymentStatus: 'Completed' } : a
              )
            )
            const payRes = await api.getPaymentHistory()
            setPayments(payRes.payments || [])
            alert('Payment successful!')
          } catch (err) {
            setError(err.message || 'Payment verification failed')
          } finally {
            setPaymentLoading(null)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        setError('Payment failed')
        setPaymentLoading(null)
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Could not start payment')
      setPaymentLoading(null)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, payRes, docRes] = await Promise.all([
          api.getMyAppointments().catch(() => ({ appointments: [] })),
          api.getPaymentHistory().catch(() => ({ payments: [] })),
          user?._id ? api.getPatientDocuments(user._id).catch(() => ({ documents: [] })) : Promise.resolve({ documents: [] }),
        ])
        setAppointments(appRes.appointments || [])
        setPayments(payRes.payments || [])
        setReports(docRes.documents || [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?._id])

  useEffect(() => {
    const fetchSlots = async () => {
      if (rescheduleModal && rescheduleDate) {
        setAvailabilityLoading(true)
        setRescheduleTime('')
        try {
          const doctorId = rescheduleModal.doctorId?._id || rescheduleModal.doctorId
          const res = await api.getAvailableSlots(doctorId, rescheduleDate)
          setAvailability(res.slots || [])
        } catch (err) {
          console.error('Failed to load slots:', err)
          setAvailability([])
        } finally {
          setAvailabilityLoading(false)
        }
      } else {
        setAvailability([])
      }
    }
    fetchSlots()
  }, [rescheduleDate, rescheduleModal])

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.cancelAppointment(id)
        setAppointments((prev) => prev.filter((a) => a._id !== id))
      } catch (err) {
        setError(err.message || 'Failed to cancel appointment')
      }
    }
  }

  const handleReschedule = async (e) => {
    e.preventDefault()
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both a new date and an available time slot.')
      return
    }

    setRescheduling(true)
    try {
      await api.rescheduleAppointment(rescheduleModal._id, {
        appointment_date: rescheduleDate,
        appointment_time: rescheduleTime,
      })

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === rescheduleModal._id
            ? { ...a, appointment_date: rescheduleDate, appointment_time: rescheduleTime, status: 'Pending' }
            : a
        )
      )

      closeModal()
      alert('Appointment rescheduled successfully!')
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment')
    } finally {
      setRescheduling(false)
    }
  }

  const closeModal = () => {
    setRescheduleModal(null)
    setRescheduleDate('')
    setRescheduleTime('')
    setAvailability([])
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
          Welcome, {user?.firstName}
        </Typography>
        <Typography color="text.secondary">
          Patient Dashboard
        </Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Appointments (${appointments.length})`} sx={{ minWidth: 120, whiteSpace: 'nowrap' }} />
          <Tab label={`Payments (${payments.length})`} sx={{ minWidth: 120, whiteSpace: 'nowrap' }} />
          <Tab label={`Reports (${reports.length})`} sx={{ minWidth: 120, whiteSpace: 'nowrap' }} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            My Appointments
          </Typography>
          <Grid container spacing={3}>
            {appointments.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">No appointments booked yet.</Typography>
              </Grid>
            )}
            {appointments.map((a) => (
              <Grid size={{ xs: 12 }} key={a._id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {a.department} • {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={`Status: ${a.status}`} color={a.status === 'Accepted' ? 'success' : a.status === 'Rejected' ? 'error' : 'warning'} size="small" />
                        {a.paymentStatus && (
                          <Chip label={`Payment: ${a.paymentStatus}`} color={a.paymentStatus === 'Completed' ? 'success' : 'default'} size="small" variant="outlined" />
                        )}
                      </Box>

                      {(a.appointmentNotes || a.prescription) && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                          {a.appointmentNotes && (
                            <Box sx={{ mb: a.prescription ? 2 : 0 }}>
                              <Typography variant="subtitle2" fontWeight="bold">Notes:</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.appointmentNotes}</Typography>
                            </Box>
                          )}
                          {a.prescription && (
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">Prescription:</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{a.prescription}</Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'column' }, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-start', minWidth: 160, width: { xs: '100%', md: 'auto' } }}>
                      {a.status === 'Accepted' && (
                        <Button
                          variant="outlined"
                          color="primary"
                          href={`https://meet.jit.si/rahat-${a._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<VideoCallIcon />}
                          fullWidth
                        >
                          Video Call
                        </Button>
                      )}
                      {a.paymentStatus !== 'Completed' && a.status !== 'Rejected' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => payForAppointment(a)}
                          disabled={!!paymentLoading}
                          startIcon={<PaymentIcon />}
                          fullWidth
                        >
                          {paymentLoading === a._id ? 'Opening…' : 'Pay (₹500)'}
                        </Button>
                      )}
                      {a.status !== 'Rejected' && (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setRescheduleModal(a)
                              setRescheduleDate(a.appointment_date.split('T')[0])
                            }}
                            startIcon={<EditCalendarIcon />}
                            fullWidth
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="text"
                            color="error"
                            onClick={() => cancelAppointment(a._id)}
                            startIcon={<CancelIcon />}
                            fullWidth
                          >
                            Cancel
                          </Button>
                        </>
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
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Payment History
          </Typography>
          <Grid container spacing={3}>
            {payments.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">No payments yet.</Typography>
              </Grid>
            )}
            {payments.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      ₹{p.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Date: {new Date(p.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Status: <Box component="span" sx={{ color: p.status === 'Completed' ? 'success.main' : 'warning.main', fontWeight: 'bold' }}>{p.status}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ID: {p.transactionId || 'N/A'}
                    </Typography>
                    {p.status === 'Pending' && p.appointmentId && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<PaymentIcon />}
                          onClick={() => {
                            const appt = {
                              _id: p.appointmentId._id || p.appointmentId,
                              department: p.appointmentId.department || 'Consultation'
                            };
                            payForAppointment(appt);
                          }}
                          disabled={!!paymentLoading}
                          fullWidth
                        >
                          {paymentLoading === (p.appointmentId._id || p.appointmentId) ? 'Opening…' : 'Complete Payment'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            My Reports
          </Typography>
          <Grid container spacing={3}>
            {reports.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">No reports available.</Typography>
              </Grid>
            )}
            {reports.map((r) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r._id}>
                <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ height: 200, width: '100%', overflow: 'hidden', borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.100' }}>
                    {r.fileType?.includes('pdf') || r.filePath?.includes('.pdf') ? (
                      <iframe src={r.filePath} width="100%" height="100%" style={{ border: 'none' }} title={r.title} />
                    ) : (
                      <img src={r.filePath} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </Box>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexGrow: 1, pt: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {r.title}
                      </Typography>
                      <Chip label={r.documentType} size="small" variant="outlined" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Date: {new Date(r.uploadedAt).toLocaleDateString()}
                      </Typography>
                      {r.description && (
                        <Typography variant="body2" color="text.secondary">
                          {r.description}
                        </Typography>
                      )}
                    </Box>
                    <IconButton color="primary" onClick={() => window.open(r.filePath, '_blank')}>
                      <VisibilityIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog open={!!rescheduleModal} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Select a new date and time for your appointment with Dr. {rescheduleModal?.doctor?.firstName} {rescheduleModal?.doctor?.lastName}
          </Typography>

          <Box component="form" id="reschedule-form" onSubmit={handleReschedule} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              type="date"
              label="New Appointment Date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            {rescheduleDate && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Available Time Slots</Typography>
                {availabilityLoading ? (
                  <CircularProgress size={24} />
                ) : availability.length > 0 ? (
                  <Grid container spacing={1}>
                    {availability.map((slot) => (
                      <Grid size="auto" key={slot.time}>
                        <Chip
                          label={slot.time}
                          onClick={() => setRescheduleTime(slot.time)}
                          disabled={!slot.available}
                          color={rescheduleTime === slot.time ? 'primary' : 'default'}
                          variant={rescheduleTime === slot.time ? 'filled' : 'outlined'}
                          sx={{ px: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">No available slots for this date.</Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeModal} color="inherit">Cancel</Button>
          <Button type="submit" form="reschedule-form" variant="contained" color="primary" disabled={rescheduling}>
            {rescheduling ? 'Rescheduling…' : 'Confirm Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
