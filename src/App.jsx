import { useEffect, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import NoteEditorDialog from './components/NoteEditorDialog'
import NoteViewDialog from './components/NoteViewDialog'
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog'
import {
  STORAGE_KEYS,
  readStorage,
  writeStorage,
  noteStorageKey,
  generateUniqueUsername,
  sanitizeUsername,
  createNoteId,
  mockServerRequest,
} from './lib/noted'
import './App.css'

function App() {
  const [users, setUsers] = useState(() => readStorage(STORAGE_KEYS.users, []))
  const [currentUser, setCurrentUser] = useState(() => readStorage(STORAGE_KEYS.session, null))
  const [notes, setNotes] = useState(() => {
    const session = readStorage(STORAGE_KEYS.session, null)
    return session ? readStorage(noteStorageKey(session.username), []) : []
  })

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteToDelete, setNoteToDelete] = useState(null)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    writeStorage(STORAGE_KEYS.users, users)
  }, [users])

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(STORAGE_KEYS.session)
      return
    }
    writeStorage(STORAGE_KEYS.session, currentUser)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      return
    }
    writeStorage(noteStorageKey(currentUser.username), notes)
  }, [currentUser, notes])

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSnackbarClose = () => {
    setSnackbar((previous) => ({ ...previous, open: false }))
  }

  // --- Auth -----------------------------------------------------------

  const handleLogin = async (rawEmail) => {
    const normalizedEmail = rawEmail.trim().toLowerCase()
    if (!normalizedEmail) {
      notify('Enter your email to continue.', 'warning')
      return false
    }

    const existingUser = users.find((user) => user.email === normalizedEmail)
    if (!existingUser) {
      notify('No account found for that email. Try registering instead.', 'warning')
      return false
    }

    const result = await mockServerRequest({ action: 'login', email: normalizedEmail })
    if (result.status !== 200) {
      notify('Unable to login at the moment.', 'error')
      return false
    }

    setNotes(readStorage(noteStorageKey(existingUser.username), []))
    setCurrentUser(existingUser)
    notify(`Welcome back, ${existingUser.name}.`)
    return true
  }

  const handleRegister = async (rawName, rawEmail) => {
    const trimmedName = rawName.trim()
    const normalizedEmail = rawEmail.trim().toLowerCase()

    if (!trimmedName || !normalizedEmail) {
      notify('Name and email are required to register.', 'warning')
      return false
    }

    if (!sanitizeUsername(trimmedName)) {
      notify('Name must contain at least one letter or number.', 'warning')
      return false
    }

    if (users.some((user) => user.email === normalizedEmail)) {
      notify('An account with that email already exists. Try logging in.', 'warning')
      return false
    }

    const username = generateUniqueUsername(trimmedName, users)

    const result = await mockServerRequest({
      action: 'register',
      email: normalizedEmail,
      name: trimmedName,
      username,
    })

    if (result.status !== 200) {
      notify('Unable to register at the moment.', 'error')
      return false
    }

    const newUser = { name: trimmedName, email: normalizedEmail, username }

    setUsers((previous) => [...previous, newUser])
    setNotes([])
    setCurrentUser(newUser)
    notify(`Account created. Your username is ${username}.`)
    return true
  }

  const handleLogout = async () => {
    await mockServerRequest({ action: 'logout', username: currentUser.username })
    setNotes([])
    setCurrentUser(null)
    setSelectedNote(null)
    notify('You have been logged out.', 'info')
  }

  // --- Notes ------------------------------------------------------------

  const openAddDialog = () => {
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const openEditDialog = (note) => {
    setEditingNote(note)
    setSelectedNote(null)
    setIsEditorOpen(true)
  }

  const closeEditorDialog = () => {
    setIsEditorOpen(false)
    setEditingNote(null)
  }

  const handleSaveNote = async ({ title, body }) => {
    const result = await mockServerRequest({
      action: editingNote ? 'update-note' : 'create-note',
      username: currentUser.username,
      note: { id: editingNote?.id, title, body },
    })

    if (result.status !== 200) {
      notify('Note could not be saved.', 'error')
      return
    }

    if (editingNote) {
      const updatedAt = new Date().toISOString()
      setNotes((previous) =>
        previous.map((note) =>
          note.id === editingNote.id ? { ...note, title, body, updatedAt } : note,
        ),
      )
      notify('Note updated.')
    } else {
      const note = { id: createNoteId(), title, body, createdAt: new Date().toISOString() }
      setNotes((previous) => [note, ...previous])
      notify('Note added.')
    }

    closeEditorDialog()
  }

  const requestDeleteNote = (note) => {
    setSelectedNote(null)
    setNoteToDelete(note)
  }

  const confirmDeleteNote = async () => {
    if (!noteToDelete) {
      return
    }

    const result = await mockServerRequest({
      action: 'delete-note',
      username: currentUser.username,
      noteId: noteToDelete.id,
    })

    if (result.status !== 200) {
      notify('Unable to delete note right now.', 'error')
      setNoteToDelete(null)
      return
    }

    setNotes((previous) => previous.filter((note) => note.id !== noteToDelete.id))
    setNoteToDelete(null)
    notify('Note deleted.', 'info')
  }

  if (!currentUser) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    )
  }

  return (
    <>
      <Dashboard
        user={currentUser}
        notes={notes}
        onLogout={handleLogout}
        onAdd={openAddDialog}
        onOpenNote={setSelectedNote}
        onEditNote={openEditDialog}
        onDeleteNote={requestDeleteNote}
      />

      {isEditorOpen && (
        <NoteEditorDialog
          key={editingNote?.id ?? 'new-note'}
          open={isEditorOpen}
          note={editingNote}
          onClose={closeEditorDialog}
          onSave={handleSaveNote}
        />
      )}

      <NoteViewDialog
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onEdit={openEditDialog}
        onDelete={requestDeleteNote}
      />

      <ConfirmDeleteDialog
        open={Boolean(noteToDelete)}
        noteTitle={noteToDelete?.title}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={confirmDeleteNote}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App
