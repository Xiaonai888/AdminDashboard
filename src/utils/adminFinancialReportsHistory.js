const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/
const MAX_HISTORY_MONTHS = 240

function monthIndex(value) {
  const match = String(value || '').match(MONTH_PATTERN)
  if (!match) throw new Error('Financial history month must use YYYY-MM')
  return Number(match[1]) * 12 + Number(match[2]) - 1
}

function monthLabel(index) {
  return `${String(Math.floor(index / 12)).padStart(4, '0')}-${String(index % 12 + 1).padStart(2, '0')}`
}

export function listAdminFinancialHistoryMonths(startMonth, endMonth) {
  const first = monthIndex(startMonth)
  const last = monthIndex(endMonth)
  const size = last - first + 1
  if (size < 1) throw new Error('Financial history start month is after the end month')
  if (size > MAX_HISTORY_MONTHS) throw new Error('Financial history exceeds 240 months and needs a smaller batch')
  return Array.from({ length: size }, (_, index) => monthLabel(first + index))
}

export function getAdminFinancialHistoryProgress(completed, total) {
  const count = Math.min(Math.max(Math.trunc(Number(completed) || 0), 0), Math.max(0, Math.trunc(Number(total) || 0)))
  const size = Math.max(0, Math.trunc(Number(total) || 0))
  return { completed: count, total: size, percent: size ? Math.round(count / size * 100) : 0 }
}
