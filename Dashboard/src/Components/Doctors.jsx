import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { api } from '../api'

const Doctors = ({ isAuthenticated }) => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.getDoctors()
        setDoctors(response.doctors || [])
      } catch (error) {
        toast.error(error.message || 'Failed to load doctors')
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  if (!isAuthenticated) {
    return <Navigate to={'/login'} />
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading doctors...</div>
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((element) => (
            <div className="card" key={element._id}>
              <img
                src={element.docAvatar && element.docAvatar.url}
                alt="doctor avatar"
              />
              <h4>{`${element.firstName} ${element.lastName}`}</h4>
              <div className="details">
                <p>
                  Email: <span>{element.email}</span>
                </p>
                <p>
                  Phone: <span>{element.phone}</span>
                </p>
                <p>
                  DOB: <span>{element.dob.substring(0, 10)}</span>
                </p>
                <p>
                  Department: <span>{element.doctorDepartment}</span>
                </p>
                <p>
                  Gender: <span>{element.gender}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>
    </section>
  )
}

export default Doctors
