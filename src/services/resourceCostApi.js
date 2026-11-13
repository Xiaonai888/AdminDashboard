const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const ROOT = `${API_URL}/api/admin/resource-cost`
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = HOUR_MS * 24

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function requestOptions(signal) {
  const token = adminToken()
  if (!token) throw new Error('Admin session is missing. Sign in again.')
  return { credentials: 'include', signal, headers: { Authorization: `Bearer ${token}` } }
}

function queryString({ period = 'today', from, to } = {}) {
  const params = new URLSearchParams({ period })
  if (period === 'custom') {
    if (!from || !to || to < from) throw new Error('Choose a valid start and end date.')
    const toUtc = (date, after = 0) => {
      const parsed = Date.parse(`${date}T00:00:00.000Z`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== date) {
        throw new Error('Enter valid calendar dates.')
      }
      return new Date(parsed - 7 * HOUR_MS + after).toISOString()
    }
    params.set('from', toUtc(from))
    params.set('to', toUtc(to, DAY_MS))
  }
  return params
}

async function apiError(response) {
  const body = await response.json().catch(() => ({}))
  return new Error(body.message || `Resource & Cost request failed (${response.status}).`)
}

export async function loadResourceCostSummary(options = {}, signal) {
  const response = await fetch(`${ROOT}/summary?${queryString(options)}`, requestOptions(signal))
  if (!response.ok) throw await apiError(response)
  const result = await response.json().catch(() => null)
  if (result?.ok !== true || !result.report) throw new Error('Resource & Cost returned an incomplete report.')
  return result
}

export async function downloadResourceCostReport(options = {}, format = 'full-zip') {
  const query = queryString(options)
  query.set('format', format)
  const response = await fetch(`${ROOT}/download?${query}`, requestOptions())
  if (!response.ok) throw await apiError(response)
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const matched = disposition.match(/filename="?([^";]+)"?/i)
  const filename = (matched?.[1] || `shadow-resource-cost-${format}`).replace(/[^a-zA-Z0-9._-]/g, '_')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  try {
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

export function formatResourceBytes(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0) return '—'
  const bytes = Number(value)
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
  return `${Math.round(bytes)} B`
}

export function formatResourceCount(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number.toLocaleString() : '—'
}

export function resourceCostDateToday() {
  return new Date(Date.now() + 7 * HOUR_MS).toISOString().slice(0, 10)
}
