import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import { formatDate, getNoteActivityDate, spineColorForTitle } from '../lib/noted'

function NoteViewDialog({ note, onClose, onEdit, onDelete }) {
  return (
    <Dialog open={Boolean(note)} onClose={onClose} fullWidth maxWidth="sm">
      {note && (
        <>
          <DialogTitle sx={{ pr: 1 }}>
            <Stack className="card-title-wrapper" direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <span
                  className="note-spine note-spine-dialog"
                  style={{ backgroundColor: spineColorForTitle(note.title) }}
                  aria-hidden="true"
                />
                <Typography variant="h6" className="note-title-text" sx={{ wordBreak: 'break-word' }}>
                  {note.title}
                </Typography>
              </Stack>
              <IconButton onClick={onClose} aria-label="Close">
                <CloseRounded />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {note.updatedAt ? 'Updated ' : 'Created '}
              {formatDate(getNoteActivityDate(note))}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{note.body}</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="outlined"
              startIcon={<EditRounded />}
              onClick={() => onEdit(note)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRounded />}
              onClick={() => onDelete(note)}
            >
              Delete
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default NoteViewDialog
