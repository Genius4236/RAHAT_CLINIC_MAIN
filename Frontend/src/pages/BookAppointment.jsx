import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

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
    hasVisited: false,
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
      <div className="page">
        <div className="container">
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
          <h1>Book an appointment</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            You need to be logged in to book an appointment.
          </p>
          <Link to="/login" className="btn btn-primary">Log in</Link>
          <span style={{ margin: '0 0.5rem' }} />
          <Link to="/register" className="btn btn-outline">Register</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Book an appointment</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Choose a doctor and time. We’ll confirm your booking.
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
            <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date of birth</label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select
              value={doctors.find((d) => d.firstName === form.doctor_firstName && d.lastName === form.doctor_lastName)?._id || ''}
              onChange={handleDoctorSelect}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.firstName} {d.lastName} — {d.doctorDepartment || 'General'}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Appointment date</label>
              <input
                name="appointment_date"
                type="date"
                value={form.appointment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} readOnly placeholder="From doctor" />
            </div>
          </div>

          {selectedDoctor && form.appointment_date && (
            <div className="form-group">
              <label>Available Time Slots</label>
              {availabilityLoading ? (
                <p style={{ color: 'var(--color-muted)' }}>Loading available slots…</p>
              ) : availability.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                  {availability.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, appointment_time: slot.time }))}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)',
                        background: form.appointment_time === slot.time ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: form.appointment_time === slot.time ? 'white' : 'inherit',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        opacity: slot.available ? 1 : 0.5,
                        fontWeight: form.appointment_time === slot.time ? 600 : 400,
                      }}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)' }}>No available slots for this date</p>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required placeholder="Full address" />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="hasVisited"
              id="hasVisited"
              checked={form.hasVisited}
              onChange={handleChange}
            />
            <label htmlFor="hasVisited" style={{ marginBottom: 0 }}>I have visited before</label>
          </div>
          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">Appointment request sent. We’ll confirm shortly.</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitLoading}>
            {submitLoading ? 'Submitting…' : 'Request appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}