import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../api'

const AddNewAdmin = ({ isAuthenticated }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigateTo = useNavigate()

  const handleAddNewAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.addAdmin({
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        password,
      })
      toast.success(response.message || 'Admin added successfully')
      navigateTo('/')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setDob('')
      setGender('')
      setPassword('')
    } catch (error) {
      toast.error(error.message || 'Failed to add admin')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to={'/login'} />
  }

  return (
    <>
      <section className="container form-component add-admin-form">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">Add New Admin</h1>
        <form onSubmit={handleAddNewAdmin}>
          <div className="first-wrapper">
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="first-wrapper">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="first-wrapper">
            <div>
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
            <div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding Admin...' : 'Add Admin'}
          </button>
        </form>
      </section>
    </>
  )
}

export default AddNewAdmin
