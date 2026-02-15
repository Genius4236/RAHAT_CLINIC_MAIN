import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../api'

const AddNewDoctor = ({ isAuthenticated }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [password, setPassword] = useState('')
  const [doctorDepartment, setDoctorDepartment] = useState('')
  const [docAvatar, setDocAvatar] = useState('')
  const [docAvatarPreview, setDocAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)

  const navigateTo = useNavigate()

  const departmentsArray = [
    'Pediatrics',
    'Orthopedics',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Radiology',
    'Physical Therapy',
    'Dermatology',
    'ENT',
  ]

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setDocAvatarPreview(reader.result)
      setDocAvatar(file)
    }
  }

  const handleAddNewDoctor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('password', password)
      formData.append('dob', dob)
      formData.append('gender', gender)
      formData.append('doctorDepartment', doctorDepartment)
      formData.append('docAvatar', docAvatar)

      const response = await api.addDoctor(formData)
      toast.success(response.message || 'Doctor added successfully')
      navigateTo('/')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setDob('')
      setGender('')
      setPassword('')
      setDocAvatarPreview('')
    } catch (error) {
      toast.error(error.message || 'Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to={'/login'} />
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">REGISTER A NEW DOCTOR</h1>
        <form onSubmit={handleAddNewDoctor}>
          <div className="first-wrapper">
            <div>
              <img
                src={docAvatarPreview ? `${docAvatarPreview}` : '/docHolder.jpg'}
                alt="Doctor Avatar"
              />
              <input type="file" onChange={handleAvatar} required />
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <select
                value={doctorDepartment}
                onChange={(e) => setDoctorDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departmentsArray.map((depart, index) => (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={loading}>
                {loading ? 'Registering Doctor...' : 'Register New Doctor'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </section>
  )
}

export default AddNewDoctor
