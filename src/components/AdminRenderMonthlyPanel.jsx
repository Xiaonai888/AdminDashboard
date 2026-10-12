const RENDER_MONTHLY_CACHE_MS = 15 * 60 * 1000
let renderMonthlyCache = { key: '', until: 0, value: null, pending: null }

async function loadRenderMonthlySummary() {
  const now = new Date()
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const key = periodStart.toISOString()

  if (renderMonthlyCache.key !== key) {
    renderMonthlyCache = { key, until: 0, value: null, pending: null }
  }
  if (renderMonthlyCache.value && Date.now() < renderMonthlyCache.until) {
    return renderMonthlyCache.value
  }
  if (renderMonthlyCache.pending) return renderMonthlyCache.pending

  const pending = (async () => {
    const { supabase } = await import('../config/supabase.js')
    const { data, error } = await supabase.rpc('get_render_bandwidth_summary', {
      p_start: periodStart.toISOString(),
      p_end: periodEnd.toISOString(),
    })
    if (error) throw error
    if (!data || typeof data !== 'object') {
      throw new Error('Render bandwidth summary is unavailable.')
    }

    const configuredIds = [
      process.env.RENDER_SERVICE_ID,
      process.env.SYSTEM_RENDER_SERVICE_ID,
      ...(process.env.RENDER_SERVICE_IDS || '').split(/[\s,;]+/),
    ].map((item) => String(item || '').trim()).filter((item) => /^srv-[a-z0-9-]+$/i.test(item))
    const serviceIds = [...new Set(configuredIds)]
    const includedGbRaw = Number(process.env.RENDER_MONTHLY_INCLUDED_GB || 5)
    const includedGb = Number.isFinite(includedGbRaw) && includedGbRaw >= 0
      ? includedGbRaw : 5
    const includedBytes = includedGb * 1000 ** 3
    const totalBytes = Math.max(0, Number(data.total_bytes) || 0)
    const expectedUntil = Math.min(periodEnd.getTime(), Date.now() - 2 * 60 * 60 * 1000)
    const expectedHours = Math.max(0, Math.floor((expectedUntil - periodStart.getTime()) / 3600000))
    const serviceCount = serviceIds.length || Math.max(0, Number(data.tracked_services) || 0)
    const expectedServiceHours = expectedHours * serviceCount
    const recordedServiceHours = Math.max(0, Number(data.recorded_service_hours) || 0)
    const coveragePercent = expectedServiceHours > 0
      ? Math.min(100, Math.round(recordedServiceHours * 10000 / expectedServiceHours) / 100)
      : null
    const overageGbOnRecordedData = Math.max(0, (totalBytes - includedBytes) / 1000 ** 3)

    const value = {
      ...data,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      measured_at: new Date().toISOString(),
      configured_service_ids: serviceIds,
      configured_services: serviceCount,
      included_gb: includedGb,
      included_bytes: includedBytes,
      expected_service_hours: expectedServiceHours,
      coverage_percent: coveragePercent,
      incomplete: expectedServiceHours === 0 || recordedServiceHours < expectedServiceHours ||
        (Number(data.missing_breakdown_hours) || 0) > 0 ||
        (serviceIds.length > 0 && (Number(data.tracked_services) || 0) < serviceIds.length),
      recorded_overage_gb: Number(overageGbOnRecordedData.toFixed(4)),
      illustrative_public_egress_cost_usd: Number((overageGbOnRecordedData * 0.15).toFixed(4)),
      illustrative_public_rate_usd_per_gb: 0.15,
      billing_note: 'Recorded metrics only. Estimates assume all excess traffic is public internet egress. Render Billing is authoritative; private link and unrecorded usage may change the invoice.',
    }
    renderMonthlyCache.value = value
    renderMonthlyCache.until = Date.now() + RENDER_MONTHLY_CACHE_MS
    return value
  })()

  renderMonthlyCache.pending = pending
  try {
    return await pending
  } finally {
    renderMonthlyCache.pending = null
  }
}

router.get('/render/bandwidth/monthly', viewSystemControl, async (req, res) => {
  try {
    const monthly = await loadRenderMonthlySummary()
    return res.status(200).json({ ok: true, monthly })
  } catch (error) {
    console.error('ADMIN_RENDER_MONTHLY_BANDWIDTH_ERROR:', error?.message || error)
    return res.status(500).json({
      ok: false,
      message: 'Unable to read stored Render bandwidth history. Verify the SQL function and backend permissions.',
    })
  }
})
