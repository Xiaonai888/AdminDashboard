const ROOT = `${import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'}/api/admin/resource-cost/overview`
const ALLOWED_PERIODS = new Set(['today', 'yesterday', 'last7', 'week', 'month', 'last30', 'last12months', 'custom'])

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

export async function loadResourceCostOverview(period = 'last7', signal, dates = null) {
  if (!ALLOWED_PERIODS.has(period)) throw new Error('Unsupported Cost Overview period.')
  const token = adminToken()
  if (!token) throw new Error('Admin session is missing. Sign in again.')
  const params = new URLSearchParams({ period })
  if (period === 'custom') {
    const from = dates?.from
    const to = dates?.to
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(to || '') || from > to) {
      throw new Error('Select a valid Custom Date range.')
    }
    params.set('from', from)
    params.set('to', to)
  }
  const response = await fetch(`${ROOT}?${params}`, {
    signal,
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || `Cost Overview unavailable (${response.status}).`)
  if (payload?.ok !== true || !payload.overview || !Array.isArray(payload.overview.series) || !payload.overview.totals) {
    throw new Error('Cost Overview returned incomplete data.')
  }
  if ((period === 'today' || period === 'yesterday') && !Array.isArray(payload.overview.hourly_series)) {
    throw new Error('Hourly Cost Overview is unavailable. Deploy the updated Backend first.')
  }
  return payload.overview
}
