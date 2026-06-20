import { Card, CardContent, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import { formatDate, getNoteActivityDate, spineColorForTitle } from '../lib/noted'

function NoteCard({ note, onOpen, onEdit, onDelete }) {
  return (
    <Card
      variant="outlined"
      className="note-card"
      onClick={() => onOpen(note)}
      style={{ '--spine-color': spineColorForTitle(note.title) }}
    >
      <span className="note-spine" aria-hidden="true" />
      <CardContent sx={{ p: 2.2, pl: 2.6, '&:last-child': { pb: 2.2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="h6" className="note-title-text" noWrap>
            {note.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(note)
                }}
                aria-label={`Edit ${note.title}`}
              >
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(note)
                }}
                aria-label={`Delete ${note.title}`}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {note.updatedAt ? 'Updated ' : 'Created '}
          {formatDate(getNoteActivityDate(note))}
        </Typography>
        <Typography className="note-preview">{note.body}</Typography>
      </CardContent>
    </Card>
  )
}

export default NoteCard
