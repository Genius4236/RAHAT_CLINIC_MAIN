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

import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Button as MuiButton, IconButton, Box, Container } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import './App.css'

function App() {
  const navigate = useNavigate()
  const { isLoggedIn, userRole, loading, logout } = useAuth()
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
    localStorage.setItem('theme', themeMode)
  }, [themeMode])

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'))
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

  const muiTheme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#0ea5e9',
      },
      secondary: {
        main: '#f59e0b',
      },
      background: {
        default: themeMode === 'light' ? '#f8fafc' : '#0f172a',
        paper: themeMode === 'light' ? '#ffffff' : '#1e293b',
      }
    },
    typography: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 600,
      }
    },
    shape: {
      borderRadius: 12,
    }
  });

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/LOGO1.png" alt="Rahat Clinic Logo" style={{ height: 40, marginRight: 12 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Rahat Clinic
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <MuiButton component={Link} to="/" color="inherit" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Home</MuiButton>
              <MuiButton component={Link} to="/book" color="inherit" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Book Appointment</MuiButton>
              <MuiButton component={Link} to="/contact" color="inherit" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Contact</MuiButton>

              {isLoggedIn && userRole === 'Admin' && <MuiButton component={Link} to="/admin" color="inherit">Admin</MuiButton>}
              {isLoggedIn && userRole === 'Admin' && <MuiButton component={Link} to="/admin/messages" color="inherit">Messages</MuiButton>}
              {isLoggedIn && userRole === 'Patient' && <MuiButton component={Link} to="/patient-dashboard" color="inherit">Dashboard</MuiButton>}
              {isLoggedIn && userRole === 'Patient' && <MuiButton component={Link} to="/profile" color="inherit">Profile</MuiButton>}
              {isLoggedIn && userRole === 'Doctor' && <MuiButton component={Link} to="/doctor-dashboard" color="inherit">Dashboard</MuiButton>}
              {isLoggedIn && userRole === 'patient' && <MuiButton component={Link} to="/pay" color="inherit">Pay</MuiButton>}

              {isLoggedIn ? (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }}>({userRole})</Typography>
                  <MuiButton onClick={handleLogout} color="inherit">Logout</MuiButton>
                </>
              ) : (
                <>
                  <MuiButton component={Link} to="/login" color="inherit">Login</MuiButton>
                  <MuiButton component={Link} to="/register" variant="contained" color="primary">Register</MuiButton>
                </>
              )}
              <IconButton onClick={toggleTheme} color="inherit">
                {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <main style={{ minHeight: '80vh' }}>
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

      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider', mt: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Rahat Clinic. Care you can trust.
        </Typography>
      </Box>
    </ThemeProvider>
  )
}

export default App
