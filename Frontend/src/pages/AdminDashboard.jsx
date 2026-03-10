import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, TextField, Tabs, Tab, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Paper, IconButton, Chip, Alert, Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: 'Male',
    dob: '',
  })
  const [adminSubmitting, setAdminSubmitting] = useState(false)
  const [adminSuccess, setAdminSuccess] = useState('')

  const [doctorForm, setDoctorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: 'Male',
    dob: '',
    doctorDepartment: '',
  })
  const [doctorAvatar, setDoctorAvatar] = useState(null)
  const [doctorSubmitting, setDoctorSubmitting] = useState(false)
  const [doctorSuccess, setDoctorSuccess] = useState('')
  const [paymentStats, setPaymentStats] = useState(null)
  const [adminTab, setAdminTab] = useState(0)
  const [payments, setPayments] = useState([])
  const [documents, setDocuments] = useState([])
  const [docForm, setDocForm] = useState({ patientId: '', title: '', description: '', documentType: 'Other' })
  const [docFile, setDocFile] = useState(null)
  const [docSubmitting, setDocSubmitting] = useState(false)
  const [allPatients, setAllPatients] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getAdmin().catch(() => null)
        if (!me?.user) {
          setError('You must be logged in as an admin to view this page.')
          setLoading(false)
          return
        }
        setAdmin(me.user)
        const [docRes, apptRes, statsRes, payRes, docListRes, patientsRes] = await Promise.all([
          api.getDoctors().catch(() => ({ doctors: [] })),
          api.getAppointments().catch(() => ({ appointments: [] })),
          api.getAdminPaymentStats().catch(() => null),
          api.getAdminPayments(1, 50).catch(() => ({ payments: [] })),
          api.getAllDocuments(1, 50).catch(() => ({ documents: [] })),
          api.getAllPatients().catch(() => ({ patients: [] })),
        ])
        setDoctors(docRes.doctors || [])
        setAppointments(apptRes.appointments || [])
        setPaymentStats(statsRes?.stats || null)
        setPayments(payRes.payments || [])
        setDocuments(docListRes.documents || [])
        setAllPatients(patientsRes.patients || [])
      } catch (err) {
        setError(err.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdminChange = (e) => {
    setAdminForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleDoctorChange = (e) => {
    setDoctorForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const submitAdmin = async (e) => {
    e.preventDefault()
    setAdminSubmitting(true)
    setAdminSuccess('')
    setError('')
    try {
      await api.addAdmin(adminForm)
      setAdminSuccess('Admin added successfully.')
      setAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        gender: 'Male',
        dob: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to add admin')
    } finally {
      setAdminSubmitting(false)
    }
  }

  const submitDoctor = async (e) => {
    e.preventDefault()
    if (!doctorAvatar) {
      setError('Doctor avatar is required.')
      return
    }
    setDoctorSubmitting(true)
    setDoctorSuccess('')
    setError('')
    try {
      const formData = new FormData()
      Object.entries(doctorForm).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('docAvatar', doctorAvatar)
      const res = await api.addDoctor(formData)
      setDoctorSuccess('Doctor added successfully.')
      setDoctors((prev) => [...prev, res.doctor].filter(Boolean))
      setDoctorForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        gender: 'Male',
        dob: '',
        doctorDepartment: '',
      })
      setDoctorAvatar(null)
    } catch (err) {
      setError(err.message || 'Failed to add doctor')
    } finally {
      setDoctorSubmitting(false)
    }
  }

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return
    try {
      await api.deleteAppointment(id)
      setAppointments((prev) => prev.filter((a) => a._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete appointment')
    }
  }

  const refundPayment = async (paymentId) => {
    if (!window.confirm('Refund this payment?')) return
    try {
      await api.refundPayment(paymentId)
      setPayments((prev) =>
        prev.map((p) => (p._id === paymentId ? { ...p, status: 'Refunded' } : p))
      )
      if (paymentStats) {
        setPaymentStats((s) => ({
          ...s,
          totalTransactions: Math.max(0, (s.totalTransactions || 0) - 1),
        }))
      }
    } catch (err) {
      setError(err.message || 'Failed to refund')
    }
  }

  const submitDocument = async (e) => {
    e.preventDefault()
    if (!docFile || !docForm.patientId || !docForm.title) {
      setError('Patient, title, and file are required')
      return
    }
    setDocSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('patientId', docForm.patientId)
      formData.append('title', docForm.title)
      formData.append('description', docForm.description || '')
      formData.append('documentType', docForm.documentType || 'Other')
      formData.append('document', docFile)
      await api.uploadDocument(formData)
      const res = await api.getAllDocuments(1, 50)
      setDocuments(res.documents || [])
      setDocForm({ patientId: '', title: '', description: '', documentType: 'Other' })
      setDocFile(null)
    } catch (err) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setDocSubmitting(false)
    }
  }

  const deleteDocument = async (id) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await api.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete document')
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading admin dashboard…</Typography>
      </Container>
    )
  }

  if (!admin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Typography color="error">{error || 'Not authorized.'}</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome, {admin.firstName}
        </Typography>
        <Typography color="text.secondary">
          Admin dashboard
        </Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={adminTab} onChange={(e, val) => setAdminTab(val)}>
          <Tab label="Overview" />
          <Tab label="Payments" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* OVERVIEW TAB */}
      {adminTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {paymentStats && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Payment Stats
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      ₹{paymentStats.totalRevenue?.toFixed(2) ?? 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Transactions</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {paymentStats.totalTransactions ?? 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Avg Transaction</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ₹{paymentStats.averageTransaction?.toFixed(2) ?? 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          <section>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Doctors
            </Typography>
            <Grid container spacing={2}>
              {doctors.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No doctors found.</Typography>
                </Grid>
              )}
              {doctors.map((d) => (
                <Grid item xs={12} sm={6} md={4} key={d._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Dr. {d.firstName} {d.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {d.doctorDepartment || 'General'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </section>

          <section>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Appointments
            </Typography>
            <Grid container spacing={2}>
              {appointments.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No appointments yet.</Typography>
                </Grid>
              )}
              {appointments.map((a) => (
                <Grid item xs={12} md={6} key={a._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {a.firstName} {a.lastName}{' '}
                          <Typography component="span" variant="body2" color="text.secondary">
                            ({a.department})
                          </Typography>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Doctor: Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                        </Typography>
                      </Box>
                      <IconButton color="error" onClick={() => deleteAppointment(a._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </section>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                  <SupportAgentIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Add Admin
                  </Typography>
                </Box>
                {adminSuccess && <Alert severity="success" sx={{ mb: 2 }}>{adminSuccess}</Alert>}
                <Box component="form" onSubmit={submitAdmin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="First Name" name="firstName" value={adminForm.firstName} onChange={handleAdminChange} required fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Last Name" name="lastName" value={adminForm.lastName} onChange={handleAdminChange} required fullWidth />
                    </Grid>
                  </Grid>
                  <TextField label="Email" name="email" type="email" value={adminForm.email} onChange={handleAdminChange} required fullWidth />
                  <TextField label="Phone" name="phone" value={adminForm.phone} onChange={handleAdminChange} required fullWidth />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select name="gender" value={adminForm.gender} onChange={handleAdminChange} label="Gender">
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Date of Birth" name="dob" type="date" value={adminForm.dob} onChange={handleAdminChange} InputLabelProps={{ shrink: true }} required fullWidth />
                    </Grid>
                  </Grid>

                  <TextField label="Password" name="password" type="password" value={adminForm.password} onChange={handleAdminChange} required fullWidth />

                  <Button type="submit" variant="contained" color="primary" disabled={adminSubmitting} size="large" sx={{ mt: 1 }}>
                    {adminSubmitting ? 'Adding…' : 'Add Admin'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                  <PersonAddIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Add Doctor
                  </Typography>
                </Box>
                {doctorSuccess && <Alert severity="success" sx={{ mb: 2 }}>{doctorSuccess}</Alert>}
                <Box component="form" onSubmit={submitDoctor} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="First Name" name="firstName" value={doctorForm.firstName} onChange={handleDoctorChange} required fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Last Name" name="lastName" value={doctorForm.lastName} onChange={handleDoctorChange} required fullWidth />
                    </Grid>
                  </Grid>
                  <TextField label="Email" name="email" type="email" value={doctorForm.email} onChange={handleDoctorChange} required fullWidth />
                  <TextField label="Phone" name="phone" value={doctorForm.phone} onChange={handleDoctorChange} required fullWidth />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select name="gender" value={doctorForm.gender} onChange={handleDoctorChange} label="Gender">
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Date of Birth" name="dob" type="date" value={doctorForm.dob} onChange={handleDoctorChange} InputLabelProps={{ shrink: true }} required fullWidth />
                    </Grid>
                  </Grid>

                  <TextField label="Department" name="doctorDepartment" value={doctorForm.doctorDepartment} onChange={handleDoctorChange} required fullWidth />
                  <TextField label="Password" name="password" type="password" value={doctorForm.password} onChange={handleDoctorChange} required fullWidth />

                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ py: 1.5, justifyContent: 'flex-start' }}>
                    {doctorAvatar ? doctorAvatar.name : 'Upload Avatar Image'}
                    <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => setDoctorAvatar(e.target.files?.[0] || null)} required />
                  </Button>

                  <Button type="submit" variant="contained" color="primary" disabled={doctorSubmitting} size="large" sx={{ mt: 1 }}>
                    {doctorSubmitting ? 'Adding…' : 'Add Doctor'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* PAYMENTS TAB */}
      {adminTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Payment History
          </Typography>
          <Grid container spacing={2}>
            {payments.length === 0 && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No payments found.</Typography>
              </Grid>
            )}
            {payments.map((p) => (
              <Grid item xs={12} md={6} key={p._id}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        ₹{p.amount} <Typography component="span" variant="subtitle1" color={p.status === 'Completed' ? 'success.main' : 'warning.main'}>- {p.status}</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Method: {p.paymentMethod} • Date: {new Date(p.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {p.status === 'Completed' && (
                      <Button variant="outlined" color="primary" onClick={() => refundPayment(p._id)}>
                        Refund
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* DOCUMENTS TAB */}
      {adminTab === 2 && (
        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Documents
            </Typography>
            <Grid container spacing={2}>
              {documents.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No documents found.</Typography>
                </Grid>
              )}
              {documents.map((d) => (
                <Grid item xs={12} key={d._id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {d.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip label={d.documentType} size="small" variant="outlined" />
                          <Typography variant="body2" color="text.secondary">
                            Patient: {d.patientId?.firstName} {d.patientId?.lastName}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton color="error" onClick={() => deleteDocument(d._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, position: 'sticky', top: 24 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Upload Document
              </Typography>
              <Box component="form" onSubmit={submitDocument} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                <FormControl fullWidth required>
                  <InputLabel>Patient</InputLabel>
                  <Select value={docForm.patientId} onChange={(e) => setDocForm({ ...docForm, patientId: e.target.value })} label="Patient">
                    {allPatients.map((p) => (
                      <MenuItem key={p._id || p} value={p._id || p}>
                        {p.firstName} {p.lastName} {p.phone ? `(${p.phone})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Title"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  required
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={docForm.documentType} onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })} label="Type">
                    <MenuItem value="Prescription">Prescription</MenuItem>
                    <MenuItem value="Lab Report">Lab Report</MenuItem>
                    <MenuItem value="Medical Record">Medical Record</MenuItem>
                    <MenuItem value="Invoice">Invoice</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Description (Optional)"
                  value={docForm.description}
                  onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                />

                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ py: 1.5, justifyContent: 'flex-start' }}>
                  {docFile ? docFile.name : 'Select File'}
                  <input type="file" hidden onChange={(e) => setDocFile(e.target.files?.[0] || null)} required />
                </Button>

                <Button type="submit" variant="contained" color="primary" disabled={docSubmitting} size="large" sx={{ mt: 1 }}>
                  {docSubmitting ? 'Uploading...' : 'Upload Document'}
                </Button>
              </Box>
            </Paper>
          </Grid>

        </Grid>
      )}

    </Container>
  )
}
