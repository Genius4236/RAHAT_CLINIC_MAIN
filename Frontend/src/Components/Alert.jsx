import { useState, useEffect } from 'react'

export default function Alert({ message, type = 'info', onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(!!message)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!isVisible || !message) return null

  const colors = {
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
    warning: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
  }

  const color = colors[type] || colors.info

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: 'var(--radius)',
        padding: '1rem 1.5rem',
        color: color.text,
        fontSize: '0.95rem',
        boxShadow: 'var(--shadow)',
        zIndex: 1000,
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {message}
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: color.text,
          opacity: 0.7,
        }}
      >
        ✕
      </button>
    </div>
  )
}
