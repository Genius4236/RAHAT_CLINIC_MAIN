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
                      {a.department} • {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem' }}>Status:</label>
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-bg)',
                          fontSize: '0.9rem',
                          minWidth: 120,
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => openNotesModal(a)}
                      style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                      {a.appointmentNotes || a.prescription ? 'Edit Notes' : 'Add Notes / Prescription'}
                    </button>
                    {a.status === 'Accepted' && (
                      <a
                        href={getVideoMeetingUrl(a._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                      >
                        Join Video Call
                      </a>
                    )}
                  </div>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => openEditAvail(a)}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => deleteAvailability(a._id)}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {notesModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setNotesModal(null)}
          >
            <div
              style={{
                background: 'var(--color-bg)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                maxWidth: 500,
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>Notes & Prescription</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                {notesModal.firstName} {notesModal.lastName} • {notesModal.department}
              </p>
              <form onSubmit={handleAddNotes} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label>Appointment Notes</label>
                  <textarea
                    name="appointmentNotes"
                    value={notesForm.appointmentNotes}
                    onChange={(e) => setNotesForm((f) => ({ ...f, appointmentNotes: e.target.value }))}
                    rows={4}
                    placeholder="Clinical notes, diagnosis, follow-up instructions..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div className="form-group">
                  <label>Prescription</label>
                  <textarea
                    name="prescription"
                    value={notesForm.prescription}
                    onChange={(e) => setNotesForm((f) => ({ ...f, prescription: e.target.value }))}
                    rows={4}
                    placeholder="Medications, dosage, duration..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={notesSubmitting}>
                    {notesSubmitting ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setNotesModal(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingAvail && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setEditingAvail(null)}
          >
            <div
              style={{
                background: 'var(--color-bg)',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                maxWidth: 400,
                width: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1rem' }}>Edit Availability</h3>
              <form onSubmit={handleUpdateAvailability} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={editForm.startTime}
                    onChange={handleEditAvailChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={editForm.endTime}
                    onChange={handleEditAvailChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slot Duration (minutes)</label>
                  <input
                    type="number"
                    name="slotDuration"
                    value={editForm.slotDuration}
                    onChange={handleEditAvailChange}
                    min="15"
                    max="120"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setEditingAvail(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
