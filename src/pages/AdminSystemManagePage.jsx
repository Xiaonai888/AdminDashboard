import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const css = `
  .scm-page{display:grid;gap:18px}
  .scm-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .scm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .scm-btn{min-height:34px;padding:0 12px;border:1px solid #E2E8F0;border-radius:10px;background:#fff;color:#334155;font:inherit;font-size:10px;font-weight:900;cursor:pointer}
  .scm-btn.primary{border-color:#DDD6FE;color:#6D28D9}
  .scm-error{padding:13px 14px;border:1px solid #FECACA;border-radius:14px;background:#FEF2F2;color:#B91C1C;font-size:11px;font-weight:800}
  .scm-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .scm-card,.scm-block{border:1px solid #E2E8F0;border-radius:18px;background:#fff}
  .scm-card{padding:16px}
  .scm-label{color:#64748B;font-size:10px;font-weight:900}
  .scm-value{margin-top:8px;color:#0F172A;font-size:26px;font-weight:950;letter-spacing:-.03em}
  .scm-note{margin-top:7px;color:#94A3B8;font-size:9px;font-weight:800;line-height:1.5}
  .scm-head{padding:15px 16px;border-bottom:1px solid #EEF2F7}
  .scm-title{color:#0F172A;font-size:14px;font-weight:950}
  .scm-sub{margin-top:3px;color:#94A3B8;font-size:9px;font-weight:750}
  .scm-grid{padding:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .scm-link{padding:14px;border:1px solid #EEF2F7;border-radius:14px;background:#fff;text-align:left;cursor:pointer}
  .scm-link:hover{border-color:#DDD6FE;background:#FCFAFF}
  .scm-link-title{color:#1E293B;font-size:11px;font-weight:950}
  .scm-link-note{margin-top:5px;color:#94A3B8;font-size:9px;font-weight:800;line-height:1.5}
  .scm-policy{padding:12px;display:grid;gap:8px}
  .scm-row{display:grid;grid-template-columns:minmax(170px,.8fr) minmax(0,1.5fr) auto;gap:12px;align-items:center;padding:11px 12px;border:1px solid #EEF2F7;border-radius:12px}
  .scm-row strong{color:#334155;font-size:10px}
  .scm-row span{color:#64748B;font-size:9px;font-weight:800}
  .scm-pill{padding:5px 8px;border-radius:999px;background:#ECFDF5;color:#047857;font-size:8px;font-weight:950}
  @media(max-width:1000px){.scm-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.scm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:650px){.scm-summary,.scm-grid{grid-template-columns:1fr}.scm-row{grid-template-columns:1fr}}
`

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function number(value) {
  const result = Number(value)
  return Number.isFinite(result) ? Math.max(0, result) : 0
}

function formatNumber(value) {
  return number(value).toLocaleString()
}

function formatMs(value) {
  return `${formatNumber(value)} ms`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

export default function AdminSystemManagePage() {
  const navigate = useNavigate()
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/snapshot`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.message || 'System Control management snapshot failed.')
      }

      setUsage(data.usage || null)
      setError('')
    } catch (loadError) {
      setError(loadError?.message || 'System Control management snapshot failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const monitor = usage?.monitor || {}

  const runtime = useMemo(
    () => [
      ['Events Recorded', formatNumber(monitor.events_recorded), 'Telemetry samples recorded by the runtime monitor.'],
      ['Dropped Keys', formatNumber(monitor.dropped_keys), 'Overflow protection for high-cardinality telemetry.'],
      ['Processing Time', formatMs(monitor.processing_ms), 'Total monitor processing time since startup.'],
      ['Monitor Started', formatDate(monitor.started_at), 'Current backend runtime monitor start time.'],
    ],
    [monitor]
  )

  const links = [
    ['/alerts/system-control/usage', 'Usage Analytics', 'Provider, feature, route and background-worker usage.'],
    ['/alerts/system-control/render', 'Render Detail', 'Measured backend traffic and service-initiated activity.'],
    ['/alerts/system-control/supabase', 'Supabase Detail', 'Supabase calls, transferred data and errors.'],
    ['/alerts/system-control/problems', 'Problem Reports', 'Open, investigating and resolved incidents.'],
    ['/alerts/kill-switch', 'Kill Switch', 'Manual and automatic containment controls.'],
    ['/alerts/security-center', 'Security Center', 'Security evidence and response controls.'],
  ]

  const policies = [
    ['Live detection window', '15 seconds', 'Active'],
    ['Minute aggregation', '60 seconds', 'Active'],
    ['Persistent usage snapshot', 'Every 15 minutes', 'Active'],
    ['Provider reconciliation', 'Every 60 minutes when configured', 'Active'],
    ['Usage detail retention', '7 days', 'Active'],
    ['Resolved incident retention', '7 days', 'Active'],
  ]

  return (
    <AdminLayout
      title="System Control Manage"
      subtitle="Monitoring runtime, advanced navigation and retention policy."
    >
      <style>{css}</style>

      <div className="scm-page">
        <div className="scm-top">
          <button
            type="button"
            className="scm-btn"
            onClick={() => navigate('/alerts/system-control')}
          >
            ← System Control
          </button>

          <div className="scm-actions">
            <button
              type="button"
              className="scm-btn primary"
              disabled={loading}
              onClick={load}
            >
              {loading ? 'Refreshing…' : 'Refresh Runtime'}
            </button>
          </div>
        </div>

        {error ? <div className="scm-error">{error}</div> : null}

        <section className="scm-summary">
          {runtime.map(([label, value, note]) => (
            <div className="scm-card" key={label}>
              <div className="scm-label">{label}</div>
              <div className="scm-value">{value}</div>
              <div className="scm-note">{note}</div>
            </div>
          ))}
        </section>

        <section className="scm-block">
          <div className="scm-head">
            <div className="scm-title">System Control Pages</div>
            <div className="scm-sub">
              Advanced pages load only when you open them.
            </div>
          </div>

          <div className="scm-grid">
            {links.map(([path, title, note]) => (
              <button
                type="button"
                className="scm-link"
                key={path}
                onClick={() => navigate(path)}
              >
                <div className="scm-link-title">{title}</div>
                <div className="scm-link-note">{note}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="scm-block">
          <div className="scm-head">
            <div className="scm-title">Monitoring & Retention</div>
            <div className="scm-sub">
              Current System Control backend policy.
            </div>
          </div>

          <div className="scm-policy">
            {policies.map(([name, value, status]) => (
              <div className="scm-row" key={name}>
                <strong>{name}</strong>
                <span>{value}</span>
                <span className="scm-pill">{status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
