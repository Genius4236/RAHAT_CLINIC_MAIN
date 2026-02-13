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
        const [docRes, apptRes] = await Promise.all([
          api.getDoctors().catch(() => ({ doctors: [] })),
          api.getAppointments().catch(() => ({ appointments: [] })),
        ])
        setDoctors(docRes.doctors || [])
        setAppointments(apptRes.appointments || [])
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

  const markVisited = async (id, hasVisited) => {
    try {
      await api.updateAppointment(id, { hasVisited })
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, hasVisited } : a)),
      )
    } catch (err) {
      setError(err.message || 'Failed to update appointment')
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
                    Doctor: {a.doctor?.firstName} {a.doctor?.lastName} •{' '}
                    {a.hasVisited ? 'Visited' : 'Not visited'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => markVisited(a._id, !a.hasVisited)}
                  >
                    Mark {a.hasVisited ? 'not visited' : 'visited'}
                  </button>
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
      </div>
    </div>
  )
}

