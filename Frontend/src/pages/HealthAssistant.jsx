import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SendIcon from '@mui/icons-material/Send'

export default function HealthAssistant() {
  const { isLoggedIn, userRole, user } = useAuth()
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [error, setError] = useState('')

  const sendHealthChat = async (e) => {
    e?.preventDefault?.()
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    setError('')

    try {
      const res = await api.chatHealthQuery(text)
      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        advice: res.advice,
        nextSteps: res.nextSteps,
        doctorSuggestion: res.doctorSuggestion,
        disclaimer: res.disclaimer,
      }
      setChatMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setError(err.message || 'Could not get a reply')
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          role: 'assistant',
          advice: 'Something went wrong.',
          nextSteps: 'Please try again in a moment.',
          doctorSuggestion: 'If you need urgent help, contact emergency services or visit your nearest clinic.',
          disclaimer: null,
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (isLoggedIn && userRole !== 'Patient') {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Health assistant
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          This tool is for patients. Log in with a patient account to ask basic health questions.
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined" color="primary">
          Back to home
        </Button>
      </Container>
    )
  }

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Health assistant
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in as a patient to ask basic health questions and get general guidance.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" color="primary">
          Log in
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Health assistant
        </Typography>
        <Typography color="text.secondary">
          {`Hi${user?.firstName ? `, ${user.firstName}` : ''} — ask basic health questions. You will get general information—not a diagnosis. Example: "I have a headache, what should I do?"`}
        </Typography>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mb: 2,
            maxHeight: { xs: 360, sm: 480 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {chatMessages.length === 0 && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center', py: 4, textAlign: 'center', px: 2 }}>
              Type a question below to get advice, next steps, and when to see a doctor.
            </Typography>
          )}
          {chatMessages.map((m) =>
            m.role === 'user' ? (
              <Box key={m.id} sx={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                <Paper elevation={0} sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
                  <Typography variant="body2">{m.text}</Typography>
                </Paper>
              </Box>
            ) : (
              <Box key={m.id} sx={{ alignSelf: 'flex-start', maxWidth: '100%', width: '100%' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      Assistant
                    </Typography>
                  </Box>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                        Advice
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {m.advice}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                        Next steps
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {m.nextSteps}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                        Doctor suggestion
                      </Typography>
                      <Typography variant="body2" sx={{ mb: m.disclaimer ? 2 : 0 }}>
                        {m.doctorSuggestion}
                      </Typography>
                      {m.disclaimer && (
                        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                          {m.disclaimer}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              </Box>
            )
          )}
          {chatLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Thinking…
              </Typography>
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={sendHealthChat} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="e.g. I have a headache, what should I do?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={chatLoading || !chatInput.trim()}
            sx={{ minWidth: 100, height: 40 }}
          >
            Send
          </Button>
        </Box>
        <Button component={RouterLink} to="/book" size="small" sx={{ mt: 1.5 }} variant="text">
          Book an appointment at Rahat Clinic
        </Button>
      </Paper>
    </Container>
  )
}
