import { meetings as staticMeetings } from '../constants/meetings'

const STORAGE_KEY = 'meetmind:custom-meetings'

export function getCustomMeetings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomMeeting(meeting) {
  const next = [meeting, ...getCustomMeetings()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function getAllMeetings() {
  return [...getCustomMeetings(), ...staticMeetings].sort((a, b) => {
    if (a.date === b.date) return 0
    return a.date < b.date ? 1 : -1
  })
}

export function getMeetingById(id) {
  return getAllMeetings().find((meeting) => meeting.id === id) ?? null
}
