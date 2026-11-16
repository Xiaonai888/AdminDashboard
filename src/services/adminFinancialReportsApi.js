import { validateAdminFinancialMonth, getSafeAdminFinancialSheetUrl } from '../utils/adminFinancialReportsDates'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const ENDPOINT = `${API_URL}/api/admin/income/financial-reports`
const DIAGNOSTIC_CONTROLLER_COMMIT = '56e1f979'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function clean(value, limit = 280) {
  return String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, limit)
}

function safeBackendUrl(path) {
  try {
    const url = new URL(`${ENDPOINT}${path}`)
    return `${url.origin}${url.pathname}`
  } catch {
    return 'Financial Reports Backend endpoint'
  }
}

function financialError(response, payload, path) {
  const status = Number(response.status || 0)
  const message = clean(payload?.message, 650)
  const legacy = /unable to complete financial reports request; check server logs/i.test(message) && !payload?.diagnostic
  const diagnostic = payload?.diagnostic && typeof payload.diagnostic === 'object' ? payload.diagnostic : null
  const code = clean(payload?.code || (legacy ? 'OLD_BACKEND_CONTROLLER_ACTIVE' : 'UNCLASSIFIED_API_ERROR'), 90)
  const lines = [
    `Google Sheets request failed (HTTP ${status}).`,
    `Error code: ${code}`,
    `API: ${safeBackendUrl(path)}`,
  ]

  if (legacy) {
    lines.push(
      'Problem location: Render → Shadow-Backend → active deployment.',
      'Evidence: Live API returned the old generic error without code or diagnostic fields.',
      `The GitHub controller has diagnostics starting at commit ${DIAGNOSTIC_CONTROLLER_COMMIT}.`,
      'Check the LIVE Render commit, service repository and branch. Also compare the API above with Admin VITE_API_URL.',
      'The actual Google Apps Script error is hidden by this older Backend response; check the latest Render Logs before changing credentials.'
    )
  } else if (diagnostic) {
    lines.push(
      `Problem location: ${clean(diagnostic.origin || 'Backend / Apps Script', 150)}`,
      `Field to check: ${clean(diagnostic.field || 'Not identified', 180)}`
    )
    if (diagnostic.secret_status) lines.push(`Apps Script secret check: ${clean(diagnostic.secret_status, 100)}`)
    if (diagnostic.render_spreadsheet_id) lines.push(`Render Sheet ID: ${clean(diagnostic.render_spreadsheet_id, 150)}`)
    if (diagnostic.admin_spreadsheet_id) lines.push(`Admin Sheet ID: ${clean(diagnostic.admin_spreadsheet_id, 150)}`)
    if (diagnostic.sheet_ids_match !== null && diagnostic.sheet_ids_match !== undefined) {
      lines.push(`Sheet IDs match: ${diagnostic.sheet_ids_match ? 'YES' : 'NO'}`)
    }
    if (message) lines.push(`Reason: ${message}`)
    if (diagnostic.step) lines.push(`Where to fix: ${clean(diagnostic.step, 450)}`)
  } else {
    lines.push(`Server response: ${message || 'No detailed error provided.'}`)
    if (status === 401 || status === 403) {
      lines.push('Problem location: Admin authentication. Check the active Admin session.')
    } else if (status === 404) {
      lines.push('Problem location: Backend routes. Check that the Financial Reports endpoint is mounted on the deployed service.')
    } else if (status === 429) {
      lines.push('Problem location: Backend rate limit. Wait until the limit resets before retrying.')
    } else {
      lines.push('Problem location: Backend or Apps Script is not yet identified. Check Render Logs for this exact request.')
    }
  }

  const error = new Error(lines.join('\n'))
  error.code = code
  error.httpStatus = status
  error.diagnostic = diagnostic
  return error
}

async function requestFinancialReport(path, { method = 'GET', body, signal } = {}) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin session is missing. Sign in again.')

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
    throw new Error(`Cannot contact Financial Reports Backend.\nAPI: ${safeBackendUrl(path)}\nCheck Admin VITE_API_URL and Render service availability.`)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || data?.ok !== true) throw financialError(response, data, path)
  return data
}

export function getAdminFinancialReportsStatus(options = {}) {
  return requestFinancialReport('/status', options)
}

export function getAdminFinancialReportsHistoryRange(options = {}) {
  return requestFinancialReport('/history-range', options)
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
