import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, TextField, Tabs, Tab, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Paper, IconButton, Chip, Alert, Divider, Avatar
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PaymentIcon from '@mui/icons-material/Payment'
import DescriptionIcon from '@mui/icons-material/Description'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ReceiptIcon from '@mui/icons-material/Receipt'
import BarChartIcon from '@mui/icons-material/BarChart'
import EventNoteIcon from '@mui/icons-material/EventNote'
import BadgeIcon from '@mui/icons-material/Badge'

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

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
  const [analytics, setAnalytics] = useState(null)
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
        const [docRes, apptRes, statsRes, payRes, docListRes, patientsRes, analyticsRes] = await Promise.all([
          api.getDoctors().catch(() => ({ doctors: [] })),
          api.getAppointments().catch(() => ({ appointments: [] })),
          api.getAdminPaymentStats().catch(() => null),
          api.getAdminPayments(1, 50).catch(() => ({ payments: [] })),
          api.getAllDocuments(1, 50).catch(() => ({ documents: [] })),
          api.getAllPatients().catch(() => ({ patients: [] })),
          api.getAdminAnalytics().catch(() => null),
        ])
        setDoctors(docRes.doctors || [])
        setAppointments(apptRes.appointments || [])
        setPaymentStats(statsRes?.stats || null)
        setAnalytics(analyticsRes || null)
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
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper elevation={0} sx={{
        p: { xs: 3, md: 4 },
        mb: 5,
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        textAlign: { xs: 'center', sm: 'left' },
        gap: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Avatar sx={{ width: { xs: 64, md: 80 }, height: { xs: 64, md: 80 }, bgcolor: 'primary.main', fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 'bold' }}>
          {admin.firstName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="900" color="text.primary" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Welcome back, {admin.firstName}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            Here is what's happening at Rahat Clinic today.
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 3, md: 5 } }}>
        <Tabs
          value={adminTab}
          onChange={(e, val) => setAdminTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' }, minHeight: 60, whiteSpace: 'nowrap' } }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="Payments" />
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documents" />
        </Tabs>
      </Box>

      {/* OVERVIEW TAB */}
      {adminTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {paymentStats && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 56, height: 56 }}>
                    <AttachMoneyIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight="900" color="text.primary">
                      ₹{paymentStats.totalRevenue?.toFixed(0) ?? 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <Avatar sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', width: 56, height: 56 }}>
                    <ReceiptIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">Transactions</Typography>
                    <Typography variant="h4" fontWeight="900" color="text.primary">
                      {paymentStats.totalTransactions ?? 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 56, height: 56 }}>
                    <BarChartIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">Avg Transaction</Typography>
                    <Typography variant="h4" fontWeight="900" color="text.primary">
                      ₹{paymentStats.averageTransaction?.toFixed(0) ?? 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {analytics && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Revenue Trends</Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={analytics.revenueTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Appointment Trends</Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={analytics.appointmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Most Booked Doctors</Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={analytics.topDoctors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="doctorName"
                        label={({ doctorName, percent }) => percent > 0.05 ? `${doctorName} ${(percent * 100).toFixed(0)}%` : ''}
                      >
                        {analytics.topDoctors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Top Diagnostic Tests</Typography>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={analytics.topTests} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                      <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          <section>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <BadgeIcon color="primary" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">
                Registered Doctors
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {doctors.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No doctors found.</Typography>
                </Grid>
              )}
              {doctors.map((d) => (
                <Grid item xs={12} sm={6} md={4} key={d._id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' } }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={d.docAvatar?.url} sx={{ width: 64, height: 64, boxShadow: 1 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                          Dr. {d.firstName} {d.lastName}
                        </Typography>
                        <Chip label={d.doctorDepartment || 'General'} size="small" color="primary" variant="outlined" sx={{ mt: 1, mb: 0.5, fontWeight: 600, fontSize: '0.7rem' }} />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {d.email}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </section>

          <section>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <EventNoteIcon color="primary" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">
                Recent Appointments
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {appointments.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No appointments yet.</Typography>
                </Grid>
              )}
              {appointments.map((a) => (
                <Grid item xs={12} md={6} key={a._id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid', borderLeftColor: a.status === 'Accepted' ? '#10b981' : a.status === 'Rejected' ? '#ef4444' : '#f59e0b', transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                    <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: { xs: 2, sm: 0 }, p: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {a.firstName} {a.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                          With <strong>Dr. {a.doctor?.firstName} {a.doctor?.lastName}</strong> ({a.department})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip label={new Date(a.appointment_date).toLocaleDateString()} size="small" icon={<EventNoteIcon fontSize="small" />} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                          <Chip label={a.appointment_time} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                          <Chip label={a.status} size="small" color={a.status === 'Accepted' ? 'success' : a.status === 'Rejected' ? 'error' : 'warning'} variant="outlined" sx={{ fontWeight: 'bold' }} />
                        </Box>
                      </Box>
                      <IconButton color="error" onClick={() => deleteAppointment(a._id)} sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' }, bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
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
                    {doctorAvatar ? doctorAvatar.name : 'Upload Image'}
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
                <Card variant="outlined" sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                  <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, p: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        ₹{p.amount} <Typography component="span" variant="subtitle1" color={p.status === 'Completed' ? 'success.main' : 'warning.main'}>- {p.status}</Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Method: <strong>{p.paymentMethod}</strong> • Date: {new Date(p.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {p.status === 'Completed' && (
                      <Button variant="outlined" color="primary" onClick={() => refundPayment(p._id)} sx={{ px: 3, alignSelf: { xs: 'stretch', sm: 'center' } }}>
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
                  <Card variant="outlined" sx={{ borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                    <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 }, p: 3 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {d.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          <Chip label={d.documentType} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                          <Typography variant="body2" color="text.secondary">
                            Patient: <strong>{d.patientId?.firstName} {d.patientId?.lastName}</strong>
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, display: 'flex', gap: 1 }}>
                        <IconButton color="primary" onClick={() => window.open(d.filePath, '_blank')} sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' } }}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteDocument(d._id)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
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
