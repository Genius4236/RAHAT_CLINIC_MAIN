import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BookAppointment from './pages/BookAppointment'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import AdminMessages from './pages/AdminMessages'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import UserProfile from './pages/UserProfile'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useAuth } from './context/AuthContext'
import { api } from './api'
import Loading from './Components/Loading'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { isLoggedIn, userRole, loading, logout } = useAuth()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleLogout = async () => {
    try {
      if (userRole === 'Admin') {
        await api.logoutAdmin()
      } else if (userRole === 'Patient') {
        await api.logoutPatient()
      } else if (userRole === 'Doctor') {
        await api.logoutDoctor()
      }
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
      await logout()
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <img src="/LOGO1.png" alt="Rahat Clinic Logo" className="Img-logo" />

          <Link to="/" className="logo">Rahat Clinic</Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/book">Book Appointment</Link>
            <Link to="/contact">Contact</Link>
            {isLoggedIn && userRole === 'Admin' && <Link to="/admin">Admin</Link>}
            {isLoggedIn && userRole === 'Admin' && <Link to="/admin/messages">Messages</Link>}
            {isLoggedIn && userRole === 'Patient' && <Link to="/patient-dashboard">Dashboard</Link>}
            {isLoggedIn && userRole === 'Patient' && <Link to="/profile">Profile</Link>}
            {isLoggedIn && userRole === 'Doctor' && <Link to="/doctor-dashboard">Dashboard</Link>}
            {isLoggedIn && userRole === 'patient' && <Link to="/pay">pay</Link>}
            {/* <Link to="/pay">Pay</Link> */}
            {isLoggedIn ? (
              <>
                <span style={{ color: 'var(--color-muted)' }}>({userRole})</span>
                <button
                  onClick={handleLogout}
                  className="nav-btn"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn">Login</Link>
                <Link to="/register" className="nav-btn primary">Register</Link>
              </>
            )}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/pay" element={<Payment />} />
          <Route path="/paymentSuccess" element={<PaymentSuccess />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Rahat Clinic. Care you can trust.</p>
        </div>
      </footer>
    </>
  )
}

export default App
