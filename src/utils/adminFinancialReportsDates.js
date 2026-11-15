const FINANCIAL_TIME_ZONE = 'Asia/Phnom_Penh'

export function getAdminFinancialCurrentMonth(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid current date')
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: FINANCIAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return `${year}-${month}`
}

export function validateAdminFinancialMonth(month, now = new Date()) {
  const text = String(month || '').trim()
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) {
    throw new Error('Choose a valid month')
  }
  if (text > getAdminFinancialCurrentMonth(now)) {
    throw new Error('Future months cannot be synced')
  }
  return text
}

export function formatAdminFinancialTime(value) {
  if (!value) return 'Not yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not yet'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: FINANCIAL_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function getSafeAdminFinancialSheetUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com') return ''
    if (!/^\/spreadsheets\/d\/[a-zA-Z0-9_-]+(?:\/|$)/.test(url.pathname)) return ''
    return url.toString()
  } catch {
    return ''
  }
}
