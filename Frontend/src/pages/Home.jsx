import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Container, Typography, Box, Grid, Card, CardContent, Button as MuiButton, Avatar } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import MapIcon from '@mui/icons-material/Map'
import DirectionsIcon from '@mui/icons-material/Directions'
import PlaceIcon from '@mui/icons-material/Place'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDoctors()
      .then(res => setDoctors(res.doctors || []))
      .catch(err => console.error("Failed to fetch doctors:", err))
      .finally(() => setLoading(false))
  }, [])

  const mapEmbedUrl = import.meta.env.VITE_MAP_EMBED_URL
  const clinicAddress = import.meta.env.VITE_CLINIC_ADDRESS
  const directionsUrl =
    import.meta.env.VITE_CLINIC_DIRECTIONS_URL ||
    (clinicAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}` : '')

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
          <Grid size={{ xs: 12, md: 4 }}>
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
          <Grid size={{ xs: 12, md: 4 }}>
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
          <Grid size={{ xs: 12, md: 4 }}>
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

      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 8, md: 10 },
          background:
            'radial-gradient(1200px circle at 20% 0%, rgba(14,165,233,0.14), transparent 55%), radial-gradient(900px circle at 80% 30%, rgba(245,158,11,0.12), transparent 55%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <MapIcon color="primary" fontSize="small" />
              <Typography variant="overline" sx={{ letterSpacing: 1.2 }}>
                Visit us
              </Typography>
            </Box>
            <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mt: 1.5 }}>
              Find Rahat Clinic
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 720, mx: 'auto' }}>
              Get directions, check the location on the map, and reach us easily.
            </Typography>
          </Box>
          <Grid container spacing={4} alignItems="stretch">
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PlaceIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                    {clinicAddress || 'Clinic address not configured'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Hours may vary. Please call or message before visiting.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <MuiButton
                      component="a"
                      href={directionsUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      color="primary"
                      startIcon={<DirectionsIcon />}
                      sx={{ flex: 1, minWidth: 220 }}
                      disabled={!directionsUrl}
                    >
                      Get directions
                    </MuiButton>
                    <MuiButton
                      component={Link}
                      to="/contact"
                      variant="outlined"
                      color="primary"
                      sx={{ flex: 1, minWidth: 180 }}
                    >
                      Contact us
                    </MuiButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  height: { xs: 300, sm: 380 },
                  width: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: { xs: 0, md: 2 },
                }}
              >
                {mapEmbedUrl ? (
                  <iframe
                    title="Clinic location map"
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block', minHeight: 280 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 2 }}>
                    <Typography color="text.secondary">Map location is not configured.</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doctor._id}>
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
