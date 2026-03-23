import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Container, Typography, Box, Grid, Card, CardContent, Button as MuiButton, CardMedia, Avatar } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDoctors()
      .then(res => setDoctors(res.doctors || []))
      .catch(err => console.error("Failed to fetch doctors:", err))
      .finally(() => setLoading(false))
  }, [])
  return (
    <Box>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Care you can <Typography component="span" variant="h2" color="secondary.main" fontWeight="bold">trust</Typography>
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Book appointments with experienced doctors, get timely care, and stay on top of your health — all in one place.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <MuiButton component={Link} to="/book" variant="contained" color="secondary" size="large">
              Book an appointment
            </MuiButton>
            <MuiButton component={Link} to="/contact" variant="outlined" color="inherit" size="large">
              Get in touch
            </MuiButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="h4" component="h2" textAlign="center" fontWeight="bold" gutterBottom mb={6}>
          Why choose Rahat Clinic
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', textAlign: 'center', bgcolor: 'transparent' }}>
              <CardContent>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.light', width: 64, height: 64 }}>
                  <CalendarMonthIcon fontSize="large" color="primary" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Easy booking</Typography>
                <Typography variant="body1" color="text.secondary">
                  Schedule appointments online in a few clicks. Choose your doctor and time that works for you.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', textAlign: 'center', bgcolor: 'transparent' }}>
              <CardContent>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.light', width: 64, height: 64 }}>
                  <LocalHospitalIcon fontSize="large" color="primary" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Expert doctors</Typography>
                <Typography variant="body1" color="text.secondary">
                  Our team of qualified doctors across departments is here to provide personalized care.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ height: '100%', textAlign: 'center', bgcolor: 'transparent' }}>
              <CardContent>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.light', width: 64, height: 64 }}>
                  <ChatBubbleIcon fontSize="large" color="primary" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>We listen</Typography>
                <Typography variant="body1" color="text.secondary">
                  Have questions? Reach out anytime. We respond to every message and are here to help.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" fontWeight="bold" gutterBottom mb={6}>
            Our Expert Doctors
          </Typography>
          {loading ? (
            <Typography textAlign="center" color="text.secondary">Loading doctors...</Typography>
          ) : doctors.length > 0 ? (
            <Grid container spacing={4} justifyContent="center">
              {doctors.map((doctor, index) => (
                <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, textAlign: 'center', borderRadius: 4, transition: '0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
                    {doctor.docAvatar?.url ? (
                      <Avatar src={doctor.docAvatar.url} alt={`Dr. ${doctor.firstName}`} sx={{ width: 120, height: 120, mb: 2, border: '4px solid', borderColor: 'divider' }} />
                    ) : (
                      <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 'bold', border: '4px solid', borderColor: 'divider' }}>
                        {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                      </Avatar>
                    )}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="medium" gutterBottom>
                      {doctor.doctorDepartment}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <MuiButton component={Link} to="/book" variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
                      Book Appointment
                    </MuiButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography textAlign="center" color="text.secondary">No doctors available at the moment.</Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Ready to book?
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Create an account or log in to schedule your appointment.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <MuiButton component={Link} to="/register" variant="contained" color="primary" size="large">
            Create account
          </MuiButton>
          <MuiButton component={Link} to="/login" variant="outlined" color="primary" size="large">
            Log in
          </MuiButton>
        </Box>
      </Container>
    </Box>
  )
}
