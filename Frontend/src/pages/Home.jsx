import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">
            Care you can <span className="highlight">trust</span>
          </h1>
          <p className="hero-sub">
            Book appointments with experienced doctors, get timely care, and stay on top of your health — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/book" className="btn btn-primary">Book an appointment</Link>
            <Link to="/contact" className="btn btn-outline">Get in touch</Link>
          </div>
        </div>
      </section>

      <section className="section features">
        <div className="container">
          <h2 className="section-title">Why choose us</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy booking</h3>
              <p>Schedule appointments online in a few clicks. Choose your doctor and time that works for you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Expert doctors</h3>
              <p>Our team of qualified doctors across departments is here to provide personalized care.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>We listen</h3>
              <p>Have questions? Reach out anytime. We respond to every message and are here to help.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container cta-inner">
          <h2>Ready to book?</h2>
          <p>Create an account or log in to schedule your appointment.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Create account</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
