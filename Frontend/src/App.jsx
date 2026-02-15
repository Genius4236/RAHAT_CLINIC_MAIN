import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BookAppointment from './pages/BookAppointment'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import { useAuth } from './context/AuthContext'
import { api } from './api'
import Loading from './Components/Loading'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { isLoggedIn, userRole, loading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      if (userRole === 'Admin') {
        await api.logoutAdmin()
      } else if (userRole === 'Patient') {
        await api.logoutPatient()
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
          <Link to="/" className="logo">Rahat Clinic</Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/book">Book Appointment</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/admin">Admin</Link>
            <Link to="/pay">Pay</Link>
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
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
