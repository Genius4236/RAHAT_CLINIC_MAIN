import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

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
          <h2 className="section-title">Why choose Rahat Clinic</h2>
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

      <section className="section doctors" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <h2 className="section-title">Our Expert Doctors</h2>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>Loading doctors...</p>
          ) : doctors.length > 0 ? (
            <div className="feature-grid">
              {doctors.map((doctor, index) => (
                <div key={doctor._id} className="feature-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', '--animation-delay': `${index * 0.1}s` }}>
                  {doctor.docAvatar?.url ? (
                    <img src={doctor.docAvatar.url} alt={`Dr. ${doctor.firstName}`} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid var(--color-border)' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', border: '3px solid var(--color-border)', boxShadow: 'var(--shadow)' }}>
                      {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                    </div>
                  )}
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Dr. {doctor.firstName} {doctor.lastName}</h3>
                  <p style={{ color: 'var(--color-primary)', fontWeight: '500', marginBottom: '1.5rem' }}>{doctor.doctorDepartment}</p>
                  <Link to="/book" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.95rem', width: '100%' }}>Book Appointment</Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No doctors available at the moment.</p>
          )}
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
