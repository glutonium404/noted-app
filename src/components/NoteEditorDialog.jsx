import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import SaveRounded from '@mui/icons-material/SaveRounded'

const TITLE_MAX = 80
const BODY_MAX = 4000

// `note` (and the `key` the parent assigns based on it) determine the
// initial field values. Remounting via key, rather than syncing in an
// effect, is what resets the form when switching between add/edit or
// between two different notes.
function NoteEditorDialog({ open, note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')

  const isEditing = Boolean(note)

  const trySave = () => {
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle || !trimmedBody) {
      return
    }

    onSave({ title: trimmedTitle, body: trimmedBody })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    trySave()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ component: 'form', onSubmit: handleSubmit }}
    >
      <DialogTitle>{isEditing ? 'Edit note' : 'Add a new note'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            required
            fullWidth
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX))}
            helperText={`${title.length}/${TITLE_MAX}`}
          />
          <TextField
            label="Note"
            required
            fullWidth
            multiline
            minRows={6}
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, BODY_MAX))}
            helperText={`${body.length}/${BODY_MAX}`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={isEditing ? <SaveRounded /> : <AddRounded />}
          onClick={trySave}
        >
          {isEditing ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NoteEditorDialog
