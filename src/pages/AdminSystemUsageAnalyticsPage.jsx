import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const HISTORY_LIMIT = 40

const css = `
  .sua-page{display:grid;gap:18px}
  .sua-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  .sua-live{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#ECFDF5;color:#047857;font-size:10px;font-weight:900}
  .sua-dot{width:7px;height:7px;border-radius:50%;background:#10B981}
  .sua-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .sua-muted{color:#94A3B8;font-size:10px;font-weight:800}
  .sua-btn{min-height:34px;padding:0 12px;border:1px solid #E2E8F0;border-radius:10px;background:#fff;color:#334155;font:inherit;font-size:10px;font-weight:900;cursor:pointer}
  .sua-error{padding:13px 14px;border:1px solid #FECACA;border-radius:14px;background:#FEF2F2;color:#B91C1C;font-size:11px;font-weight:800}
  .sua-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .sua-card{border:1px solid #E2E8F0;border-radius:18px;background:#fff;padding:16px}
  .sua-card-label{color:#64748B;font-size:10px;font-weight:900}
  .sua-card-value{margin-top:8px;color:#0F172A;font-size:28px;font-weight:950;letter-spacing:-.035em}
  .sua-card-note{margin-top:8px;color:#94A3B8;font-size:9px;font-weight:800}
  .sua-block{overflow:hidden;border:1px solid #E2E8F0;border-radius:20px;background:#fff}
  .sua-head{padding:15px 16px;border-bottom:1px solid #EEF2F7;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .sua-title{color:#0F172A;font-size:14px;font-weight:950}
  .sua-sub{margin-top:3px;color:#94A3B8;font-size:9px;font-weight:750}
  .sua-tabs{display:flex;gap:4px;padding:4px;border-radius:10px;background:#F8FAFC}
  .sua-tab{border:0;border-radius:8px;background:transparent;padding:7px 10px;color:#64748B;font:inherit;font-size:9px;font-weight:900;cursor:pointer}
  .sua-tab.active{background:#fff;color:#6D28D9;box-shadow:0 1px 3px rgba(15,23,42,.08)}
  .sua-chart-wrap{padding:16px}
  .sua-chart-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:10px}
  .sua-chart-value{color:#0F172A;font-size:28px;font-weight:950}
  .sua-chart-meta{color:#94A3B8;font-size:9px;font-weight:800}
  .sua-chart{width:100%;height:230px;display:block}
  .sua-grid-line{stroke:#E2E8F0;stroke-width:1}
  .sua-line{fill:none;stroke:#6D28D9;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
  .sua-area{fill:url(#suaFill)}
  .sua-axis{display:flex;justify-content:space-between;color:#94A3B8;font-size:8px;font-weight:800;margin-top:5px}
  .sua-content{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.75fr);gap:12px;padding:12px}
  .sua-list{display:grid;gap:10px}
  .sua-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:11px 12px;border:1px solid #EEF2F7;border-radius:12px}
  .sua-row-main{min-width:0}
  .sua-row-name{color:#334155;font-size:10px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sua-row-note{margin-top:4px;color:#94A3B8;font-size:8px;font-weight:750}
  .sua-row-value{text-align:right;color:#0F172A;font-size:10px;font-weight:950}
  .sua-track{margin-top:7px;height:6px;border-radius:999px;background:#F1F5F9;overflow:hidden}
  .sua-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#6D28D9,#A78BFA)}
  .sua-table-wrap{overflow-x:auto}
  .sua-table{width:100%;min-width:760px;border-collapse:collapse}
  .sua-table th{padding:10px 12px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;color:#64748B;font-size:8px;font-weight:950;text-align:left;text-transform:uppercase}
  .sua-table td{padding:11px 12px;border-bottom:1px solid #F1F5F9;color:#334155;font-size:9px;font-weight:800}
  .sua-pill{display:inline-flex;padding:5px 8px;border-radius:999px;background:#F1F5F9;color:#475569;font-size:8px;font-weight:950}
  .sua-empty{padding:28px;text-align:center;color:#94A3B8;font-size:10px;font-weight:800}
  @media(max-width:1100px){.sua-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.sua-content{grid-template-columns:1fr}}
  @media(max-width:700px){.sua-summary{grid-template-columns:1fr}.sua-head{align-items:flex-start;flex-direction:column}.sua-tabs{width:100%;overflow-x:auto}.sua-tab{white-space:nowrap}}
`

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function n(value) {
  const x = Number(value)
  return Number.isFinite(x) ? Math.max(0, x) : 0
}

function formatNumber(value) {
  return n(value).toLocaleString()
}

function formatData(mb) {
  const value = n(mb)
  if (value >= 1024) {
    const gb = value / 1024
    return `${gb >= 10 ? gb.toFixed(1) : gb.toFixed(2)} GB`
  }
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)} MB`
}

function formatMs(value) {
  return `${Math.round(n(value))} ms`
}

function depName(value) {
  const key = String(value || 'UNKNOWN').toUpperCase()
  if (key === 'SUPABASE') return 'Supabase'
  if (key === 'CLOUDFLARE_R2') return 'Cloudflare R2'
  if (key === 'CLIENT') return 'Reader'
  if (key === 'TELEGRAM') return 'Telegram'
  if (key === 'IPWHO') return 'IPWho'
  return key === 'UNKNOWN' ? 'Other' : key
}

function aggregate(rows, selector) {
  const map = new Map()

  for (const row of rows) {
    const key = selector(row)
    const current = map.get(key) || {
      key,
      count: 0,
      bytes: 0,
      errors: 0,
      weightedMs: 0,
    }

    const count = n(row.count)
    current.count += count
    current.bytes += n(row.bytes)
    current.errors += n(row.errors)
    current.weightedMs += n(row.avg_ms) * count
    map.set(key, current)
  }

  return [...map.values()]
    .map((item) => ({
      ...item,
      avgMs: item.count ? item.weightedMs / item.count : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes || b.count - a.count)
}

function toPoints(values, width = 900, height = 230) {
  const safe = values.map(n)
  if (!safe.length) return ''

  const max = Math.max(...safe, 1)
  const min = Math.min(...safe)
  const range = Math.max(max - min, 1)

  return safe
    .map((value, index) => {
      const x =
        safe.length === 1
          ? width / 2
          : (index / (safe.length - 1)) * width
      const y =
        height - 22 - ((value - min) / range) * (height - 44)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function areaPath(values, width = 900, height = 230) {
  const safe = values.map(n)
  if (!safe.length) return ''

  const max = Math.max(...safe, 1)
  const min = Math.min(...safe)
  const range = Math.max(max - min, 1)

  const points = safe.map((value, index) => {
    const x =
      safe.length === 1
        ? width / 2
        : (index / (safe.length - 1)) * width
    const y =
      height - 22 - ((value - min) / range) * (height - 44)
    return [x, y]
  })

  return `M ${points[0][0]} ${height - 22} L ${points
    .map(([x, y]) => `${x} ${y}`)
    .join(' L ')} L ${points.at(-1)[0]} ${height - 22} Z`
}

export default function AdminSystemUsageAnalyticsPage() {
  const [usage, setUsage] = useState(null)
  const [history, setHistory] = useState([])
  const [view, setView] = useState('provider')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const lastSnapshotAtRef = useRef(0)

  const load = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    try {
      lastSnapshotAtRef.current = Date.now()
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/snapshot`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok !== true) {
        throw new Error(
          data?.message || 'Usage analytics snapshot failed.'
        )
      }

      const next = data.usage || null
      setUsage(next)
      setUpdatedAt(Date.now())
      setError('')

      setHistory((current) => [
        ...current,
        n(next?.minute?.mb),
      ].slice(-HISTORY_LIMIT))
    } catch (loadError) {
      setError(
        loadError?.message || 'Usage analytics snapshot failed.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSnapshotAtRef.current >= 30_000) {
        load()
      }
    }

    document.addEventListener(
      'visibilitychange',
      onVisibility
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      )
    }
  }, [load])

  const rows = useMemo(
    () =>
      Array.isArray(usage?.minute?.rows)
        ? usage.minute.rows
        : [],
    [usage]
  )

  const providers = useMemo(
    () => aggregate(rows, (row) => depName(row.dependency)),
    [rows]
  )

  const features = useMemo(
    () =>
      aggregate(
        rows,
        (row) => String(row.feature || 'unknown')
      ),
    [rows]
  )

  const routes = useMemo(
    () =>
      aggregate(
        rows,
        (row) => String(row.source_route || 'UNKNOWN')
      ),
    [rows]
  )

  const workers = useMemo(
    () =>
      rows.filter(
        (row) =>
          String(row.source_method || '').toUpperCase() ===
            'WORKER' ||
          String(row.source_route || '')
            .toUpperCase()
            .startsWith('WORKER ')
      ),
    [rows]
  )

  const workerGroups = useMemo(
    () =>
      aggregate(
        workers,
        (row) =>
          `${row.feature || 'worker'} → ${depName(
            row.dependency
          )}`
      ),
    [workers]
  )

  const activeGroups =
    view === 'feature'
      ? features
      : view === 'route'
        ? routes
        : view === 'worker'
          ? workerGroups
          : providers

  const minuteMb = n(usage?.minute?.mb)
  const liveMb = n(usage?.live?.mb)
  const totalRequests = n(usage?.minute?.count)
  const totalErrors = n(usage?.minute?.errors)
  const externalMb = rows
    .filter((row) => row.kind === 'external_request')
    .reduce((sum, row) => sum + n(row.mb), 0)

  const maxBytes = Math.max(
    ...activeGroups.map((item) => item.bytes),
    1
  )

  const chartValues =
    history.length >= 2
      ? history
      : [0, minuteMb * 0.6, minuteMb * 0.8, minuteMb]

  return (
    <AdminLayout
      title="Usage Analytics"
      subtitle="Detailed Shadow data usage by provider, feature, route and background worker."
    >
      <style>{css}</style>

      <div className="sua-page">
        <div className="sua-toolbar">
          <div className="sua-live">
            <span className="sua-dot" />
            Live Usage
          </div>

          <div className="sua-actions">
            <span className="sua-muted">
              Updated{' '}
              {updatedAt
                ? new Date(updatedAt).toLocaleTimeString()
                : '—'}
            </span>
            <button
              type="button"
              className="sua-btn"
              disabled={loading}
              onClick={load}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? <div className="sua-error">{error}</div> : null}

        <section className="sua-summary">
          <div className="sua-card">
            <div className="sua-card-label">Current Minute Usage</div>
            <div className="sua-card-value">
              {formatData(minuteMb)}
            </div>
            <div className="sua-card-note">
              Measured HTTP + outbound data
            </div>
          </div>

          <div className="sua-card">
            <div className="sua-card-label">Live 15s Usage</div>
            <div className="sua-card-value">
              {formatData(liveMb)}
            </div>
            <div className="sua-card-note">
              Current live RAM window
            </div>
          </div>

          <div className="sua-card">
            <div className="sua-card-label">Requests</div>
            <div className="sua-card-value">
              {formatNumber(totalRequests)}
            </div>
            <div className="sua-card-note">
              Current minute requests
            </div>
          </div>

          <div className="sua-card">
            <div className="sua-card-label">External Traffic</div>
            <div className="sua-card-value">
              {formatData(externalMb)}
            </div>
            <div className="sua-card-note">
              Supabase / R2 / external services
            </div>
          </div>
        </section>

        <section className="sua-block">
          <div className="sua-head">
            <div>
              <div className="sua-title">Data Usage Trend</div>
              <div className="sua-sub">
                Builds a lightweight trend while this page is open.
              </div>
            </div>

            <span className="sua-pill">
              {formatNumber(totalErrors)} errors
            </span>
          </div>

          <div className="sua-chart-wrap">
            <div className="sua-chart-top">
              <div>
                <div className="sua-chart-value">
                  {formatData(minuteMb)}
                </div>
                <div className="sua-chart-meta">
                  Current measured minute
                </div>
              </div>
            </div>

            <svg
              className="sua-chart"
              viewBox="0 0 900 230"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="suaFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8B5CF6"
                    stopOpacity=".24"
                  />
                  <stop
                    offset="100%"
                    stopColor="#8B5CF6"
                    stopOpacity=".02"
                  />
                </linearGradient>
              </defs>

              {[42, 92, 142, 192].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="900"
                  y2={y}
                  className="sua-grid-line"
                />
              ))}

              <path
                d={areaPath(chartValues)}
                className="sua-area"
              />
              <polyline
                points={toPoints(chartValues)}
                className="sua-line"
              />
            </svg>

            <div className="sua-axis">
              <span>Earlier</span>
              <span>Current session</span>
              <span>Now</span>
            </div>
          </div>
        </section>

        <section className="sua-block">
          <div className="sua-head">
            <div>
              <div className="sua-title">Usage Breakdown</div>
              <div className="sua-sub">
                Find what is consuming the most data.
              </div>
            </div>

            <div className="sua-tabs">
              {[
                ['provider', 'By Provider'],
                ['feature', 'By Feature'],
                ['route', 'By Route'],
                ['worker', 'Background'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`sua-tab ${
                    view === key ? 'active' : ''
                  }`}
                  onClick={() => setView(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="sua-content">
            <div className="sua-list">
              {activeGroups.slice(0, 10).map((item) => {
                const percent = Math.max(
                  3,
                  Math.min(
                    100,
                    (item.bytes / maxBytes) * 100
                  )
                )

                return (
                  <div className="sua-row" key={item.key}>
                    <div className="sua-row-main">
                      <div className="sua-row-name">
                        {item.key}
                      </div>
                      <div className="sua-row-note">
                        {formatNumber(item.count)} requests ·{' '}
                        {formatNumber(item.errors)} errors ·{' '}
                        {formatMs(item.avgMs)}
                      </div>
                      <div className="sua-track">
                        <div
                          className="sua-fill"
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="sua-row-value">
                      {formatData(item.bytes / 1024 / 1024)}
                    </div>
                  </div>
                )
              })}

              {activeGroups.length === 0 ? (
                <div className="sua-empty">
                  Waiting for measured traffic.
                </div>
              ) : null}
            </div>

            <div className="sua-card">
              <div className="sua-card-label">
                Top Contributor
              </div>
              <div className="sua-card-value">
                {activeGroups[0]?.key || '—'}
              </div>
              <div className="sua-card-note">
                {activeGroups[0]
                  ? `${formatData(
                      activeGroups[0].bytes / 1024 / 1024
                    )} · ${formatNumber(
                      activeGroups[0].count
                    )} requests`
                  : 'No measured usage yet'}
              </div>
            </div>
          </div>
        </section>

        <section className="sua-block">
          <div className="sua-head">
            <div>
              <div className="sua-title">Top Routes</div>
              <div className="sua-sub">
                Highest measured routes in the current minute.
              </div>
            </div>
          </div>

          <div className="sua-table-wrap">
            <table className="sua-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Requests</th>
                  <th>Data</th>
                  <th>Errors</th>
                  <th>Avg ms</th>
                </tr>
              </thead>
              <tbody>
                {routes.slice(0, 12).map((item) => (
                  <tr key={item.key}>
                    <td>{item.key}</td>
                    <td>{formatNumber(item.count)}</td>
                    <td>
                      {formatData(
                        item.bytes / 1024 / 1024
                      )}
                    </td>
                    <td>{formatNumber(item.errors)}</td>
                    <td>{formatMs(item.avgMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {routes.length === 0 ? (
              <div className="sua-empty">
                Waiting for route traffic.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
