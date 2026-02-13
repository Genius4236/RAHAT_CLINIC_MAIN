import { useLocation, Link } from 'react-router-dom'

export default function PaymentSuccess() {
  const search = new URLSearchParams(useLocation().search)
  const reference = search.get('reference')

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Payment successful</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          Thank you. Your payment was processed successfully.
        </p>
        {reference && (
          <p style={{ fontWeight: 500, marginBottom: '2rem' }}>
            Reference ID: <span style={{ fontFamily: 'monospace' }}>{reference}</span>
          </p>
        )}
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/book" className="btn btn-primary">Book another appointment</Link>
          <Link to="/" className="btn btn-outline">Back to home</Link>
        </div>
      </div>
    </div>
  )
}

