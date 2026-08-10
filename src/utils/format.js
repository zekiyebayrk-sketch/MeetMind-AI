const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatDate(isoDate) {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`))
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`
}

export function daysAgo(isoDate, from = new Date()) {
  const target = new Date(`${isoDate}T00:00:00`)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const diff = today - target
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function getRecencyGroup(isoDate, from = new Date()) {
  const diff = daysAgo(isoDate, from)
  if (diff <= 6) return 'This Week'
  if (diff <= 13) return 'Last Week'
  return 'Earlier'
}

export function slugify(text) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug || 'meeting'
}

function toIsoDate(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(isoDate, days) {
  const base = isoDate ? new Date(`${isoDate}T00:00:00`) : new Date()
  base.setDate(base.getDate() + days)
  return toIsoDate(base)
}

export function todayIso() {
  return toIsoDate(new Date())
}
