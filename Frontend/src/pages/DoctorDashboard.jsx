import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('appointments')
  const [availType, setAvailType] = useState('weekly') // 'weekly' or 'specific'
  const [availForm, setAvailForm] = useState({
    date: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
  })
  const [submitting, setSubmitting] = useState(false)

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
      // Prepare the data based on availability type
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
      // Reload availability
      const availRes = await api.getDoctorAvailability(user._id)
      setAvailability(availRes.availability || [])
      alert('Availability set successfully!')
      // Reset form
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

  const markVisited = async (id, hasVisited) => {
    try {
      await api.updateAppointment(id, { hasVisited })
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, hasVisited } : a))
      )
    } catch (err) {
      setError(err.message || 'Failed to update appointment')
    }
  }

  const deleteAvailability = async (id) => {
    if (window.confirm('Delete this availability slot?')) {
      try {
        await api.deleteAvailability(id)
        setAvailability((prev) => prev.filter((a) => a._id !== id))
      } catch (err) {
        setError(err.message || 'Failed to delete availability')
      }
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ display: 'grid', gap: '2rem' }}>
        <header>
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome, Dr. {user?.firstName}</h1>
          <p style={{ color: 'var(--color-muted)' }}>Doctor Dashboard</p>
        </header>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'appointments' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'appointments' ? 'white' : 'inherit',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'appointments' ? '3px solid var(--color-primary)' : 'none',
              fontSize: '1rem',
            }}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'availability' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'availability' ? 'white' : 'inherit',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'availability' ? '3px solid var(--color-primary)' : 'none',
              fontSize: '1rem',
            }}
          >
            Availability ({availability.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <section>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Your Appointments
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {appointments.length === 0 && (
                <p style={{ color: 'var(--color-muted)' }}>No appointments yet.</p>
              )}
              {appointments.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>
                      {a.firstName} {a.lastName}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                      {a.department} • {new Date(a.appointment_date).toLocaleDateString()} • Status:{' '}
                      <strong style={{ color: 'var(--color-text)' }}>{a.status}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                      {a.hasVisited ? '✓ Visited' : 'Not visited'}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => markVisited(a._id, !a.hasVisited)}
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    Mark {a.hasVisited ? 'not visited' : 'visited'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'availability' && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                Set Availability
              </h2>
              
              {/* Availability Type Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAvailType('weekly')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: availType === 'weekly' ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: availType === 'weekly' ? 'white' : 'inherit',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                  }}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setAvailType('specific')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: availType === 'specific' ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: availType === 'specific' ? 'white' : 'inherit',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                  }}
                >
                  Specific Date
                </button>
              </div>

              <form onSubmit={handleAddAvailability} style={{ display: 'grid', gap: '1rem' }}>
                {availType === 'specific' ? (
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={availForm.date}
                      onChange={handleAvailChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Day of Week</label>
                    <select name="dayOfWeek" value={availForm.dayOfWeek} onChange={handleAvailChange}>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={availForm.startTime}
                    onChange={handleAvailChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={availForm.endTime}
                    onChange={handleAvailChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slot Duration (minutes)</label>
                  <input
                    type="number"
                    name="slotDuration"
                    value={availForm.slotDuration}
                    onChange={handleAvailChange}
                    min="15"
                    max="120"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={submitting}
                >
                  {submitting ? 'Setting…' : 'Set Availability'}
                </button>
              </form>
            </div>

            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                Current Schedule
              </h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {availability.length === 0 && (
                  <p style={{ color: 'var(--color-muted)' }}>No availability set yet.</p>
                )}
                {availability.map((a) => (
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
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {a.dayOfWeek ? (
                          <>
                            <span>{a.dayOfWeek}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'var(--color-primary)', color: 'white' }}>
                              Weekly
                            </span>
                          </>
                        ) : (
                          <>
                            <span>{new Date(a.date).toLocaleDateString()}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: 'var(--color-warning)', color: 'white' }}>
                              Specific
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                        {a.startTime} - {a.endTime} ({a.slotDuration} min slots)
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => deleteAvailability(a._id)}
                      style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
