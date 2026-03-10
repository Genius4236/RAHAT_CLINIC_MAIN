import { useState, useEffect } from 'react'
import { api } from '../api'
import { Container, Typography, Box, Grid, TextField, Button, Paper, Alert, List, ListItem, ListItemText, Divider, ListItemButton } from '@mui/material'

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
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading messages…</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Contact Messages ({messages.length})
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Paper elevation={0} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto', borderRadius: 2 }}>
            <List disablePadding>
              {messages.length === 0 && (
                <ListItem>
                  <ListItemText primary="No messages received yet." sx={{ color: 'text.secondary', textAlign: 'center' }} />
                </ListItem>
              )}
              {messages.map((m, index) => (
                <div key={m._id}>
                  <ListItemButton
                    selected={selectedMessage?._id === m._id}
                    onClick={() => setSelectedMessage(m)}
                    sx={{
                      py: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {m.firstName} {m.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      {m.email}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ width: '100%' }}>
                      {m.message}
                    </Typography>
                  </ListItemButton>
                  {index < messages.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          {selectedMessage ? (
            <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Message Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">From</Typography>
                    <Typography variant="body1">{selectedMessage.firstName} {selectedMessage.lastName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Email</Typography>
                    <Typography variant="body1">{selectedMessage.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Phone</Typography>
                    <Typography variant="body1">{selectedMessage.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Message</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'background.default', p: 2, borderRadius: 1, mt: 1 }}>
                      {selectedMessage.message}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box component="form" onSubmit={handleReply} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Reply"
                  multiline
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={replying}>
                    {replying ? 'Sending…' : 'Send Reply'}
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteMessage(selectedMessage._id)}>
                    Delete
                  </Button>
                  <Button variant="text" onClick={() => setSelectedMessage(null)}>
                    Close
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary">Select a message to view details and reply</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}
