import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoCheckCircleFill } from 'react-icons/go'
import { AiFillCloseCircle } from 'react-icons/ai'
import { api } from '../api'

const Dashboard = ({ isAuthenticated }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.getAppointments()
        setAppointments(response.appointments || [])
      } catch (error) {
        toast.error(error.message || 'Failed to fetch appointments')
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const response = await api.updateAppointment(appointmentId, { status })
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      )
      toast.success(response.message || 'Status updated')
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  if (!isAuthenticated) {
    return <Navigate to={'/login'} />
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading appointments...</div>
  }

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <h1>Welcome to Rahat Clinic Admin Dashboard</h1>
        </div>
        <div className="banner">
          <h1>Appointments</h1>
        </div>
        {appointments && appointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.firstName} {appointment.lastName}</td>
                  <td>{appointment.email}</td>
                  <td>{appointment.department}</td>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.status}</td>
                  <td>
                    {appointment.status !== 'Accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'Accepted')}
                      >
                        <GoCheckCircleFill className="icon-btn" />
                      </button>
                    )}
                    {appointment.status !== 'Rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'Rejected')}
                      >
                        <AiFillCloseCircle className="icon-btn" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No appointments found</p>
        )}
      </section>
    </>
  )
}

export default Dashboard
