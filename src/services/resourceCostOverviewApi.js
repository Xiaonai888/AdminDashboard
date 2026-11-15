const ROOT = `${import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'}/api/admin/resource-cost/overview`
const ALLOWED_PERIODS = new Set(['yesterday', 'last7', 'week', 'month', 'last30', 'last12months'])

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

export async function loadResourceCostOverview(period = 'last7', signal) {
  if (!ALLOWED_PERIODS.has(period)) throw new Error('Unsupported Cost Overview period.')
  const token = adminToken()
  if (!token) throw new Error('Admin session is missing. Sign in again.')
  const response = await fetch(`${ROOT}?period=${encodeURIComponent(period)}`, {
    signal,
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || `Cost Overview unavailable (${response.status}).`)
  if (payload?.ok !== true || !payload.overview || !Array.isArray(payload.overview.series) || !payload.overview.totals) {
    throw new Error('Cost Overview returned incomplete data.')
  }
  return payload.overview
}
