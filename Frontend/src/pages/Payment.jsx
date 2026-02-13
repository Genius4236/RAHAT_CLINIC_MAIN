import { useEffect, useState } from 'react'
import { api } from '../api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

export default function Payment() {
  const [amount, setAmount] = useState(500)
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
    <div className="page">
      <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Payment</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Pay securely using Razorpay. You&apos;ll be redirected back here after payment.
        </p>
        <div className="form-group">
          <label>Amount (INR)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={startPayment}
          disabled={!key || loading || amount <= 0}
        >
          {loading ? 'Processing…' : 'Pay now'}
        </button>
        {status && <p className="error-msg" style={{ marginTop: '1rem' }}>{status}</p>}
      </div>
    </div>
  )
}

