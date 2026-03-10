import { useEffect, useState } from 'react'
import { api } from '../api'
import { Container, Typography, Box, TextField, Button, Alert, Paper } from '@mui/material'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

export default function Payment() {
  const [amount, setAmount] = useState(200) // Default amount for testing
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    api
      .getPaymentKey()
      .then((data) => setKey(data.key || ''))
      .catch(() => setStatus('Unable to load payment key.'))
  }, [])

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-script')) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })

  const startPayment = async () => {
    setLoading(true)
    setStatus('')
    try {
      await loadRazorpayScript()
      const data = await api.processPayment(amount)

      const options = {
        key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Rahat Clinic',
        description: 'Appointment payment',
        order_id: data.order.id,
        callback_url: `${API_BASE}/product/paymentVerification`,
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setStatus(err.message || 'Could not start payment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Payment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Pay securely using Razorpay. You'll be redirected back here after payment.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Amount (INR)"
            type="number"
            inputProps={{ min: 1 }}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={startPayment}
            disabled={!key || loading || amount <= 0}
            fullWidth
          >
            {loading ? 'Processing…' : 'Pay now'}
          </Button>

          {status && <Alert severity="error">{status}</Alert>}
        </Box>
      </Paper>
    </Container>
  )
}
