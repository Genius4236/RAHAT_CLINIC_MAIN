import { useState, useEffect } from 'react'
import { api } from '../api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const res = await api.getAllMessages()
      setMessages(res.messages || [])
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Delete this message?')) {
      try {
        await api.deleteMessage(id)
        setMessages((prev) => prev.filter((m) => m._id !== id))
        setSelectedMessage(null)
      } catch (err) {
        setError(err.message || 'Failed to delete message')
      }
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) {
      setError('Please enter a reply message')
      return
    }

    setReplying(true)
    try {
      await api.replyToMessage(selectedMessage._id, {
        replyMessage: replyText,
        email: selectedMessage.email,
      })
      alert('Reply sent successfully!')
      setReplyText('')
      setSelectedMessage(null)
    } catch (err) {
      setError(err.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading messages…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            Contact Messages ({messages.length})
          </h2>
          {error && <p className="error-msg">{error}</p>}
          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
            {messages.length === 0 && (
              <p style={{ color: 'var(--color-muted)' }}>No messages received yet.</p>
            )}
            {messages.map((m) => (
              <div
                key={m._id}
                onClick={() => setSelectedMessage(m)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  background: selectedMessage?._id === m._id ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  color: selectedMessage?._id === m._id ? 'white' : 'inherit',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {m.firstName} {m.lastName}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                  {m.email}
                </div>
                <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          {selectedMessage ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Message Details</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>From</label>
                    <p style={{ color: 'var(--color-muted)' }}>
                      {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Email</label>
                    <p style={{ color: 'var(--color-muted)' }}>{selectedMessage.email}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Phone</label>
                    <p style={{ color: 'var(--color-muted)' }}>{selectedMessage.phone}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Message</label>
                    <p style={{ color: 'var(--color-muted)', whiteSpace: 'pre-wrap' }}>
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleReply} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'inherit',
                      fontSize: '1rem',
                      width: '100%',
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={replying}
                  >
                    {replying ? 'Sending…' : 'Send Reply'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-muted)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p>Select a message to view details and reply</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
