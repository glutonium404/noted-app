import { useState } from 'react'
import {
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import LoginRounded from '@mui/icons-material/LoginRounded'
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded'

function AuthPage({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState(0)
  const [loginEmail, setLoginEmail] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const succeeded = await onLogin(loginEmail)
    setSubmitting(false)
    if (succeeded) {
      setLoginEmail('')
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const succeeded = await onRegister(registerName, registerEmail)
    setSubmitting(false)
    if (succeeded) {
      setRegisterName('')
      setRegisterEmail('')
    }
  }

  return (
    <Box className="auth-shell">
      <Paper elevation={0} className="auth-card">
        <Stack spacing={0.5} className="auth-header">
          <Typography variant="h5" className="auth-wordmark">
            Noted
          </Typography>
          <span className="auth-scribble" aria-hidden="true" />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            Sign in or create an account to reach your notes.
          </Typography>
        </Stack>

        <Tabs
          value={authMode}
          onChange={(_, nextValue) => setAuthMode(nextValue)}
          variant="fullWidth"
          sx={{ mb: 2.5 }}
        >
          <Tab icon={<LoginRounded />} iconPosition="start" label="Login" />
          <Tab
            icon={<PersonAddAlt1Rounded />}
            iconPosition="start"
            label="Register"
          />
        </Tabs>

        {authMode === 0 ? (
          <Box component="form" onSubmit={handleLoginSubmit} className="auth-form">
            <TextField
              required
              fullWidth
              label="Email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit} className="auth-form">
            <TextField
              required
              fullWidth
              label="Name"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              autoComplete="name"
            />
            <TextField
              required
              fullWidth
              label="Email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              Create account
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default AuthPage
