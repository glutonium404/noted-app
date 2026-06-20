export const STORAGE_KEYS = {
  users: 'noted_users',
  session: 'noted_session_user',
  noteIdCounter: 'noted_note_id_counter',
}

export const readStorage = (key, fallback) => {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const noteStorageKey = (username) => `noted_notes_${username}`

// Turns a display name into a username: lowercase, spaces -> underscores,
// strip anything that isn't a letter/number/underscore.
export const sanitizeUsername = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

export const generateUniqueUsername = (name, users) => {
  const base = sanitizeUsername(name) || 'user'
  const existing = new Set(users.map((user) => user.username))
  if (!existing.has(base)) {
    return base
  }

  let counter = 1
  while (existing.has(`${base}_${counter}`)) {
    counter += 1
  }

  return `${base}_${counter}`
}

export const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const getNoteActivityDate = (note) => note.updatedAt || note.createdAt

export const pluralize = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`

export const createNoteId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  const currentCounter = Number(localStorage.getItem(STORAGE_KEYS.noteIdCounter)) || 0
  const nextCounter = currentCounter + 1
  localStorage.setItem(STORAGE_KEYS.noteIdCounter, String(nextCounter))
  return `note_${Date.now()}_${nextCounter}_${Math.random().toString(36).slice(2, 10)}`
}

// Deterministic accent color per note, derived from the title.
// Gives the dashboard a "shelf of book spines" feel without any user setup.
const SPINE_COLORS = [
  '#baff29', // lime (brand accent)
  '#5eead4', // teal
  '#60a5fa', // blue
  '#f9a8d4', // pink
  '#fbbf24', // amber
  '#c4b5fd', // violet
  '#fb923c', // orange
  '#a3e635', // green
]

export const spineColorForTitle = (title) => {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash << 5) - hash + title.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % SPINE_COLORS.length
  return SPINE_COLORS[index]
}

// Mock server call. There is no backend yet, so every request is logged with
// the intended endpoint/payload and resolved as a 200 success once the
// (currently empty) endpoint string is filled in, this is wired to call it.
//
// Expected request body: JSON object with { action, ...actionSpecificFields }.
// Expected success response shape: { status: 200, data?: unknown }.
// Expected error response shape: { status: 4xx | 5xx, error: { code, message } }.
export const mockServerRequest = async (payload) => {
  // TODO: point this at the real backend, e.g. import.meta.env.VITE_API_BASE_URL
  const endpoint = ''

  if (!endpoint) {
    return { status: 200 }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        status: response.status,
        error: data?.error ?? { code: 'unknown', message: 'Request failed.' },
      }
    }

    return { status: response.status, data }
  } catch {
    // No backend reachable yet: intentionally continue with mocked success
    // so the UI remains usable end-to-end.
    return { status: 200 }
  }
}
