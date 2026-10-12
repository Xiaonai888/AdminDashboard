import React, { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const readableBytes = (value) => {
  if (value === null || value === undefined) return '—'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount >= 1000 ** 3
    ? `${(amount / 1000 ** 3).toFixed(2)} GB`
    : `${(amount / 1000 ** 2).toFixed(2)} MB`
}

const dateText = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '—'
}

const styles = `
  .rmb { border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; padding: 17px; display: grid; gap: 15px; }
  .rmb * { box-sizing: border-box; }
  .rmb-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .rmb-title { font-size: 14px; font-weight: 950; color: #0f172a; }
  .rmb-sub { margin-top: 4px; font-size: 10px; color: #64748b; line-height: 1.7; }
  .rmb-button { border: 1px solid #ddd6fe; border-radius: 10px; padding: 9px 13px; background: #f5f3ff; color: #6d28d9; font: inherit; font-size: 10px; font-weight: 900; cursor: pointer; }
  .rmb-button:disabled { opacity: .6; cursor: wait; }
  .rmb-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .rmb-card { padding: 13px; background: #f8fafc; border-radius: 13px; min-width: 0; }
  .rmb-label { font-size: 9px; color: #64748b; font-weight: 850; }
  .rmb-value { margin-top: 7px; font-size: 19px; color: #0f172a; font-weight: 950; word-break: break-word; }
  .rmb-note { margin-top: 5px; font-size: 9px; color: #64748b; line-height: 1.5; }
  .rmb-track { width: 100%; height: 9px; overflow: hidden; border-radius: 99px; background: #e2e8f0; }
  .rmb-fill { height: 100%; background: #7c3aed; border-radius: 99px; }
  .rmb-warning { padding: 10px 12px; background: #fff7ed; color: #9a3412; border-radius: 11px; font-size: 10px; font-weight: 750; line-height: 1.7; }
  .rmb-error { padding: 10px 12px; background: #fef2f2; color: #b91c1c; border-radius: 11px; font-size: 10px; }
  .rmb-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .rmb-table th { color: #64748b; font-weight: 950; background: #f8fafc; text-align: left; }
  .rmb-table th, .rmb-table td { padding: 10px 9px; border-bottom: 1px solid #f1f5f9; }
  .rmb-table td { color: #334155; }
  .rmb-scroll { overflow-x: auto; }
  .rmb-foot { font-size: 9px; color: #64748b; line-height: 1.8; }
  @media (max-width: 900px) { .rmb-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 500px) { .rmb { padding: 12px; } .rmb-value { font-size: 16px; } .rmb-table { min-width: 690px; } }
`

export default function AdminRenderMonthlyPanel() {
  const [monthly, setMonthly] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (signal) => {
    const adminToken = sessionStorage.getItem('shadow_admin_token') ||
      localStorage.getItem('shadow_admin_token') || ''
    if (!adminToken) {
      setError('Admin token is missing.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/system-control/render/bandwidth/monthly`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${adminToken}` },
        ...(signal ? { signal } : {}),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.message || 'Unable to load monthly bandwidth.')
      }
      if (!signal?.aborted) {
        setMonthly(payload.monthly || null)
        setError('')
      }
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(requestError?.message || 'Unable to load monthly bandwidth.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const total = Math.max(0, Number(monthly?.total_bytes) || 0)
  const included = Math.max(0, Number(monthly?.included_bytes) || 0)
  const usagePercent = included > 0 ? total / included * 100 : 0
  const services = Array.isArray(monthly?.services) ? monthly.services : []
  const coverage = monthly?.coverage_percent
  const hasRecords = Boolean(monthly && Number(monthly.recorded_service_hours) > 0)
  const breakdown = [
    ['HTTP Responses', monthly?.http_response_bytes],
    ['Service-Initiated', monthly?.service_initiated_bytes],
    ['WebSocket Responses', monthly?.websocket_response_bytes],
    ['Private Link', monthly?.private_link_bytes],
  ]

  return (
    <section className="rmb" aria-label="Render monthly bandwidth">
      <style>{styles}</style>
      <div className="rmb-head">
        <div>
          <div className="rmb-title">Render Monthly Bandwidth &amp; Cost</div>
          <div className="rmb-sub">
            {monthly?.period_start ? new Date(monthly.period_start).toLocaleDateString([], { month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Current month'}
            {' · '}UTC reporting month · Stored Render metrics, not a live invoice
          </div>
        </div>
        <button className="rmb-button" type="button" disabled={loading} onClick={() => load()}>
          {loading ? 'Loading…' : 'Reload Monthly'}
        </button>
      </div>

      {error ? <div className="rmb-error">{error}</div> : null}
      {!monthly && !error ? <div className="rmb-foot">{loading ? 'Loading recorded bandwidth…' : 'Monthly bandwidth not loaded.'}</div> : null}
      {monthly ? (
        <>
          {monthly.incomplete || !hasRecords ? (
            <div className="rmb-warning">
              {hasRecords
                ? `Partial history · ${coverage == null ? 'unknown' : `${coverage}%`} service-hour coverage. Monthly totals may be lower than Render Billing. New Render metrics can arrive with a delay.`
                : 'No hourly history recorded for this month yet. Zero recorded data does not mean zero Render usage or charges.'}
            </div>
          ) : null}

          <div className="rmb-grid">
            <div className="rmb-card">
              <div className="rmb-label">Recorded This Month</div>
              <div className="rmb-value">{hasRecords ? readableBytes(total) : '—'}</div>
              <div className="rmb-note">{Number(monthly.recorded_service_hours) || 0} service-hours</div>
            </div>
            <div className="rmb-card">
              <div className="rmb-label">Included Allowance</div>
              <div className="rmb-value">{Number(monthly.included_gb).toLocaleString()} GB</div>
              <div className="rmb-note">Workspace setting · verify your Render plan</div>
            </div>
            <div className="rmb-card">
              <div className="rmb-label">Recorded Overage</div>
              <div className="rmb-value">{hasRecords ? `${Number(monthly.recorded_overage_gb || 0).toFixed(2)} GB` : '—'}</div>
              <div className="rmb-note">Based on stored metrics only</div>
            </div>
            <div className="rmb-card">
              <div className="rmb-label">Illustrative Egress Estimate</div>
              <div className="rmb-value">{hasRecords ? `$${Number(monthly.illustrative_public_egress_cost_usd || 0).toFixed(2)}` : '—'}</div>
              <div className="rmb-note">Assumes $0.15/GB public egress · excludes other charges · not an invoice</div>
            </div>
          </div>

          {hasRecords ? (
            <>
              <div className="rmb-track" role="progressbar" aria-label="Recorded bandwidth against allowance" aria-valuenow={Math.round(usagePercent)} aria-valuemin={0} aria-valuemax={Math.max(100, Math.round(usagePercent))}>
                <div className="rmb-fill" style={{ width: `${Math.min(100, usagePercent)}%` }} />
              </div>
              <div className="rmb-foot">{usagePercent.toFixed(1)}% of the configured included allowance recorded. Values may be incomplete.</div>
            </>
          ) : null}

          <div className="rmb-scroll">
            <table className="rmb-table">
              <thead><tr><th>Traffic Type</th><th>Recorded Bandwidth</th></tr></thead>
              <tbody>
                {breakdown.map(([label, bytes]) => (
                  <tr key={label}><td>{label}</td><td>{readableBytes(bytes)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rmb-scroll">
            <table className="rmb-table">
              <thead><tr><th>Render Service</th><th>Usage</th><th>Hours</th><th>Last Hour</th></tr></thead>
              <tbody>
                {services.length ? services.map((service) => (
                  <tr key={service.service_id}>
                    <td>{service.service_id}</td>
                    <td>{readableBytes(service.total_bytes)}</td>
                    <td>{Number(service.recorded_hours) || 0}</td>
                    <td>{dateText(service.last_hour)}</td>
                  </tr>
                )) : <tr><td colSpan={4}>No stored service metrics yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="rmb-foot">
            Coverage: {coverage == null ? 'Unknown' : `${coverage}%`} · Configured services: {monthly.configured_services || 0} · Missing category breakdown hours: {monthly.missing_breakdown_hours || 0} · Last stored hour: {dateText(monthly.last_hour)} · Checked: {dateText(monthly.measured_at)}.
            {' '}Render Billing is authoritative. Monthly summaries are cached on the backend for 15 minutes. Opening this panel does not trigger a Render Metrics poll. Render Billing remains authoritative.
          </div>
        </>
      ) : null}
    </section>
  )
}
