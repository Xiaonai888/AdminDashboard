import { validateAdminFinancialMonth, getSafeAdminFinancialSheetUrl } from '../utils/adminFinancialReportsDates'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const ENDPOINT = `${API_URL}/api/admin/income/financial-reports`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function requestFinancialReport(path, { method = 'GET', body, signal } = {}) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin session has expired. Please sign in again.')

  let response
  try {
    response = await fetch(`${ENDPOINT}${path}`, {
      method,
      credentials: 'include',
      signal,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error('Cannot contact Shadow Backend. Check your connection and try again.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || data?.ok !== true) {
    const fallback = response.status === 401 || response.status === 403
      ? 'Admin access was denied. Please sign in again.'
      : response.status === 429
        ? 'Too many requests. Please try again shortly.'
        : 'Google Sheets request failed. Please try again.'
    throw new Error(typeof data?.message === 'string' && data.message.trim() ? data.message : fallback)
  }
  return data
}

export function getAdminFinancialReportsStatus(options = {}) {
  return requestFinancialReport('/status', options)
}

export function connectAdminFinancialReportsSheet(spreadsheetUrl, options = {}) {
  const url = getSafeAdminFinancialSheetUrl(spreadsheetUrl)
  if (!url) throw new Error('Enter a valid Google Sheets link.')
  return requestFinancialReport('/connect', {
    ...options,
    method: 'POST',
    body: { spreadsheet_url: url },
  })
}

export function syncAdminFinancialReportsMonth(month, options = {}) {
  return requestFinancialReport('/sync', {
    ...options,
    method: 'POST',
    body: { month: validateAdminFinancialMonth(month) },
  })
}
