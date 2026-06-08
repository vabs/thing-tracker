export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addWeeks(date, n) {
  return addDays(date, n * 7)
}

export function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(str) {
  if (!str) return null
  const d = new Date(str + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return d
}

export function displayDate(str) {
  const d = parseDate(str)
  if (!d) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}

export function getGridCells(baseDate) {
  const base = new Date(baseDate)
  base.setHours(0, 0, 0, 0)

  return [
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `d${i + 1}`,
      label: `${i + 1}d`,
      shortLabel: `${i + 1}`,
      date: addDays(base, i + 1),
      type: 'day',
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `w${i + 1}`,
      label: `${i + 1}w`,
      shortLabel: `${i + 1}`,
      date: addWeeks(base, i + 1),
      type: 'week',
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `m${i + 1}`,
      label: `${i + 1}m`,
      shortLabel: `${i + 1}`,
      date: addMonths(base, i + 1),
      type: 'month',
    })),
  ]
}
