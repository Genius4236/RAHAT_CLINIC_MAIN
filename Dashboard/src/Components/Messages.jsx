import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { api } from '../api'

const Messages = ({ isAuthenticated }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.getMessages()
        setMessages(response.messages || [])
      } catch (error) {
        toast.error(error.message || 'Failed to load messages')
        setMessages([])
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  if (!isAuthenticated) {
    return <Navigate to={'/login'} />
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading messages...</div>
  }

  return (
    <section className="page messages">
      <h1>MESSAGE</h1>
      <div className="banner">
        {messages && messages.length > 0 ? (
          messages.map((element) => (
            <div className="card" key={element._id}>
              <div className="details">
                <p>
                  First Name: <span>{element.firstName}</span>
                </p>
                <p>
                  Last Name: <span>{element.lastName}</span>
                </p>
                <p>
                  Email: <span>{element.email}</span>
                </p>
                <p>
                  Phone: <span>{element.phone}</span>
                </p>
                <p>
                  Message: <span>{element.message}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <h1>No Messages!</h1>
        )}
      </div>
    </section>
  )
}

export default Messages
