import { useLocation, Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Box, Button, Paper, Stack } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

export default function PaymentSuccess() {
  const search = new URLSearchParams(useLocation().search)
  const reference = search.get('reference')

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Payment Successful
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Thank you. Your payment was processed successfully.
        </Typography>

        {reference && (
          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2, mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Reference ID
            </Typography>
            <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
              {reference}
            </Typography>
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button component={RouterLink} to="/book" variant="contained" color="primary" size="large">
            Book Another Appointment
          </Button>
          <Button component={RouterLink} to="/" variant="outlined" size="large">
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
