import { useEffect, useState } from 'react'
import { api } from '../api'

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
  const [adminTab, setAdminTab] = useState('overview')
  const [payments, setPayments] = useState([])
  const [documents, setDocuments] = useState([])
  const [docForm, setDocForm] = useState({ patientId: '', title: '', description: '', documentType: 'Other' })
  const [docFile, setDocFile] = useState(null)
  const [docSubmitting, setDocSubmitting] = useState(false)

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
        const [docRes, apptRes, statsRes, payRes, docListRes] = await Promise.all([
          api.getDoctors().catch(() => ({ doctors: [] })),
          api.getAppointments().catch(() => ({ appointments: [] })),
          api.getAdminPaymentStats().catch(() => null),
          api.getAdminPayments(1, 50).catch(() => ({ payments: [] })),
          api.getAllDocuments(1, 50).catch(() => ({ documents: [] })),
        ])
        setDoctors(docRes.doctors || [])
        setAppointments(apptRes.appointments || [])
        setPaymentStats(statsRes?.stats || null)
        setPayments(payRes.payments || [])
        setDocuments(docListRes.documents || [])
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

  const patientsFromAppointments = [...new Map(
    appointments
      .filter((a) => a.patientId)
      .map((a) => [a.patientId._id || a.patientId, a.patientId])
  ).values()]

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading admin dashboard…</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1>Admin dashboard</h1>
          <p style={{ color: 'var(--color-muted)' }}>{error || 'Not authorized.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ display: 'grid', gap: '2.5rem' }}>
        <header>
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {admin.firstName}</h1>
          <p style={{ color: 'var(--color-muted)' }}>Admin dashboard</p>
        </header>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)' }}>
          {['overview', 'payments', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                background: adminTab === tab ? 'var(--color-primary)' : 'transparent',
                color: adminTab === tab ? 'white' : 'inherit',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {adminTab === 'overview' && (
          <>
        {paymentStats && (
          <section
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Payment Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Total Revenue</div>
                <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>₹{paymentStats.totalRevenue?.toFixed(2) ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Transactions</div>
                <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{paymentStats.totalTransactions ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Avg Transaction</div>
                <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>₹{paymentStats.averageTransaction?.toFixed(2) ?? 0}</div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Doctors</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {doctors.length === 0 && <p style={{ color: 'var(--color-muted)' }}>No doctors found.</p>}
            {doctors.map((d) => (
              <div
                key={d._id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Dr. {d.firstName} {d.lastName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                    {d.doctorDepartment || 'General'} • {d.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Appointments</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {appointments.length === 0 && <p style={{ color: 'var(--color-muted)' }}>No appointments yet.</p>}
            {appointments.map((a) => (
              <div
                key={a._id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {a.firstName} {a.lastName}{' '}
                    <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>
                      ({a.department})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                    Doctor: {a.doctor?.firstName} {a.doctor?.lastName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => deleteAppointment(a._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Add admin</h2>
            <form onSubmit={submitAdmin}>
              <div className="form-group">
                <label>First name</label>
                <input name="firstName" value={adminForm.firstName} onChange={handleAdminChange} required />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input name="lastName" value={adminForm.lastName} onChange={handleAdminChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={adminForm.email} onChange={handleAdminChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={adminForm.phone} onChange={handleAdminChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={adminForm.gender} onChange={handleAdminChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of birth</label>
                <input name="dob" type="date" value={adminForm.dob} onChange={handleAdminChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={adminForm.password} onChange={handleAdminChange} required />
              </div>
              {adminSuccess && <p className="success-msg">{adminSuccess}</p>}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={adminSubmitting}
              >
                {adminSubmitting ? 'Adding…' : 'Add admin'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Add doctor</h2>
            <form onSubmit={submitDoctor}>
              <div className="form-group">
                <label>First name</label>
                <input name="firstName" value={doctorForm.firstName} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input name="lastName" value={doctorForm.lastName} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={doctorForm.email} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={doctorForm.phone} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={doctorForm.gender} onChange={handleDoctorChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of birth</label>
                <input name="dob" type="date" value={doctorForm.dob} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  name="doctorDepartment"
                  value={doctorForm.doctorDepartment}
                  onChange={handleDoctorChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={doctorForm.password} onChange={handleDoctorChange} required />
              </div>
              <div className="form-group">
                <label>Doctor avatar</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setDoctorAvatar(e.target.files?.[0] || null)}
                  required
                />
              </div>
              {doctorSuccess && <p className="success-msg">{doctorSuccess}</p>}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={doctorSubmitting}
              >
                {doctorSubmitting ? 'Adding…' : 'Add doctor'}
              </button>
            </form>
          </div>
        </section>
        </>
        )}
      </div>
    </div>
  )
}

