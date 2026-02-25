import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('appointments')
  
  // Reschedule Modal States
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('') // NEW: Track selected time
  const [availability, setAvailability] = useState([])     // NEW: Track available slots
  const [availabilityLoading, setAvailabilityLoading] = useState(false) // NEW: Track loading state
  const [rescheduling, setRescheduling] = useState(false)

  // Load initial dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, payRes] = await Promise.all([
          api.getMyAppointments().catch(() => ({ appointments: [] })),
          api.getPaymentHistory().catch(() => ({ payments: [] })),
        ])
        setAppointments(appRes.appointments || [])
        setPayments(payRes.payments || [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // NEW: Fetch availability when the modal is open and the date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (rescheduleModal && rescheduleDate) {
        setAvailabilityLoading(true)
        setRescheduleTime('') // Reset time when date changes
        try {
          // Make sure your backend can find the doctor by doctor._id or doctor ID string
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
        await api.deleteAppointment(id)
        setAppointments((prev) => prev.filter((a) => a._id !== id))
      } catch (err) {
        setError(err.message || 'Failed to cancel appointment')
      }
    }
  }

  const handleReschedule = async (e) => {
    e.preventDefault()
    
    // UPDATED: Validate BOTH Date and Time
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select both a new date and an available time slot.')
      return
    }

    setRescheduling(true)
    try {
      // UPDATED: Send BOTH to the API
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

  // Helper to neatly clear all modal states
  const closeModal = () => {
    setRescheduleModal(null)
    setRescheduleDate('')
    setRescheduleTime('')
    setAvailability([])
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
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {user?.firstName}</h1>
          <p style={{ color: 'var(--color-muted)' }}>Patient Dashboard</p>
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
            onClick={() => setActiveTab('payments')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'payments' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'payments' ? 'white' : 'inherit',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'payments' ? '3px solid var(--color-primary)' : 'none',
              fontSize: '1rem',
            }}
          >
            Payments ({payments.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <section>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              My Appointments
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {appointments.length === 0 && (
                <p style={{ color: 'var(--color-muted)' }}>No appointments booked yet.</p>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                        {a.department} • {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                        Status: <strong style={{ color: 'var(--color-text)' }}>{a.status}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {a.status !== 'Rejected' && (
                        <>
                          <button
                            className="btn btn-outline"
                            onClick={() => {
                              setRescheduleModal(a)
                              setRescheduleDate(a.appointment_date.split('T')[0]) // Ensure safe date format for input
                            }}
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                          >
                            Reschedule
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={() => cancelAppointment(a._id)}
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Payments Section Snipped for Brevity (unchanged) --- */}
        {activeTab === 'payments' && (
          <section>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Payment History
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {payments.length === 0 && (
                <p style={{ color: 'var(--color-muted)' }}>No payments yet.</p>
              )}
              {payments.map((p) => (
                <div
                  key={p._id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>₹{p.amount}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Status:{' '}
                        <strong
                          style={{
                            color: p.status === 'Completed' ? 'var(--color-success)' : 'var(--color-warning)',
                          }}
                        >
                          {p.status}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                        ID: {p.transactionId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* UPDATED RESCHEDULE MODAL */}
        {rescheduleModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={closeModal}
          >
            <div
              style={{
                background: 'var(--color-bg)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                maxWidth: '460px', // Slightly wider to fit time slots nicely
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1rem' }}>Reschedule Appointment</h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                Select a new date and time for your appointment with Dr. {rescheduleModal.doctor?.firstName}{' '}
                {rescheduleModal.doctor?.lastName}
              </p>

              <form onSubmit={handleReschedule} style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>New Appointment Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* NEW: Time Slot Selection Block */}
                {rescheduleDate && (
                  <div className="form-group">
                    <label>Available Time Slots</label>
                    {availabilityLoading ? (
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Loading available slots…</p>
                    ) : availability.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                        {availability.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setRescheduleTime(slot.time)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: 'var(--radius)',
                              border: '1px solid var(--color-border)',
                              background: rescheduleTime === slot.time ? 'var(--color-primary)' : 'var(--color-surface)',
                              color: rescheduleTime === slot.time ? 'white' : 'inherit',
                              cursor: slot.available ? 'pointer' : 'not-allowed',
                              opacity: slot.available ? 1 : 0.5,
                              fontWeight: rescheduleTime === slot.time ? 600 : 400,
                              fontSize: '0.85rem'
                            }}
                            disabled={!slot.available}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>No available slots for this date.</p>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={rescheduling}
                  >
                    {rescheduling ? 'Rescheduling…' : 'Confirm Reschedule'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={closeModal}
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