import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const SNAPSHOT_REFRESH_MS = 30 * 1000
const INCIDENT_REFRESH_MS = 60 * 1000

const RANGE_MS = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

const RANGE_LABELS = {
  '1h': 'Last 1 Hour',
  '6h': 'Last 6 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  custom: 'Custom Range',
}

function toLocalInputValue(value) {
  const date = new Date(value)
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
  return local.toISOString().slice(0, 16)
}

function getHistoryRange(key, customFrom, customTo) {
  if (key === 'custom') {
    return {
      from: new Date(customFrom).getTime(),
      to: new Date(customTo).getTime(),
    }
  }

  const to = Date.now()
  return {
    from: to - (RANGE_MS[key] || RANGE_MS['24h']),
    to,
  }
}

function compactChart(values, maxPoints = 120) {
  if (values.length <= maxPoints) return values

  const size = Math.ceil(values.length / maxPoints)
  const result = []

  for (let i = 0; i < values.length; i += size) {
    const group = values.slice(i, i + size)
    result.push(
      group.reduce((sum, value) => sum + number(value), 0) /
        group.length
    )
  }

  return result
}

const styles = `
  .sc-page {
    display: grid;
    gap: 18px;
  }

  .sc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .sc-live {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #ECFDF5;
    color: #047857;
    font-size: 10px;
    font-weight: 900;
  }

  .sc-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #10B981;
  }

  .sc-updated {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
  }

  .sc-refresh {
    min-height: 34px;
    padding: 0 13px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .sc-refresh:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .sc-error {
    padding: 13px 14px;
    border: 1px solid #FECACA;
    border-radius: 14px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 11px;
    font-weight: 800;
  }

  .sc-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .sc-summary-card {
    min-height: 126px;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .sc-summary-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .sc-summary-label {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    color: #334155;
    font-size: 10px;
    font-weight: 900;
  }

  .sc-icon {
    width: 34px;
    height: 34px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-size: 16px;
    font-weight: 950;
  }

  .sc-icon.purple {
    color: #5B21B6;
    background: #F3E8FF;
  }

  .sc-icon.blue {
    color: #2563EB;
    background: #EFF6FF;
  }

  .sc-icon.green {
    color: #059669;
    background: #ECFDF5;
  }

  .sc-icon.red {
    color: #DC2626;
    background: #FEF2F2;
  }

  .sc-summary-value {
    margin-top: 14px;
    color: #0F172A;
    font-size: clamp(24px, 2vw, 31px);
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .sc-summary-note {
    margin-top: 10px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  .sc-spark {
    width: 72px;
    height: 28px;
    flex-shrink: 0;
  }

  .sc-block {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
  }

  .sc-block-head {
    padding: 15px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sc-block-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .sc-block-title {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .sc-block-subtitle {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
  }

  .sc-detail-btn {
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid #DDD6FE;
    border-radius: 9px;
    background: #FFFFFF;
    color: #6D28D9;
    font: inherit;
    font-size: 9px;
    font-weight: 900;
    cursor: pointer;
    white-space: nowrap;
  }

  .sc-report-grid {
    padding: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(240px, 0.72fr) minmax(240px, 0.72fr);
    gap: 12px;
  }

  .sc-panel {
    min-width: 0;
    border: 1px solid #EEF2F7;
    border-radius: 16px;
    background: #FFFFFF;
    padding: 14px;
  }

  .sc-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .sc-panel-title {
    color: #1E293B;
    font-size: 11px;
    font-weight: 950;
  }

  .sc-panel-meta {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  .sc-chart-value {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
  }

  .sc-chart-value strong {
    color: #0F172A;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .sc-chart-value span {
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
  }

  .sc-line-chart {
    width: 100%;
    height: 180px;
    display: block;
  }

  .sc-axis {
    stroke: #E2E8F0;
    stroke-width: 1;
  }

  .sc-line {
    fill: none;
    stroke: #6D28D9;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sc-line-soft {
    fill: none;
    stroke: #C4B5FD;
    stroke-width: 2;
    stroke-dasharray: 6 6;
    stroke-linecap: round;
  }

  .sc-area {
    fill: url(#usageFill);
  }

  .sc-chart-labels {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    margin-top: 5px;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .sc-donut-wrap {
    display: grid;
    place-items: center;
    padding: 6px 0 12px;
  }

  .sc-donut {
    width: 142px;
    height: 142px;
    border-radius: 50%;
    position: relative;
    display: grid;
    place-items: center;
    background: conic-gradient(
      #6D28D9 0 var(--p1),
      #3B82F6 var(--p1) var(--p2),
      #10B981 var(--p2) var(--p3),
      #F59E0B var(--p3) var(--p4),
      #CBD5E1 var(--p4) 100%
    );
  }

  .sc-donut::after {
    content: '';
    position: absolute;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #FFFFFF;
  }

  .sc-donut-center {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .sc-donut-center strong {
    display: block;
    color: #0F172A;
    font-size: 17px;
    font-weight: 950;
  }

  .sc-donut-center span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .sc-legend {
    display: grid;
    gap: 8px;
  }

  .sc-legend-row {
    display: grid;
    grid-template-columns: 10px minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
    color: #475569;
    font-size: 9px;
    font-weight: 800;
  }

  .sc-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .sc-contributors {
    display: grid;
    gap: 11px;
  }

  .sc-contributor-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #334155;
    font-size: 9px;
    font-weight: 900;
  }

  .sc-contributor-track {
    margin-top: 5px;
    height: 6px;
    border-radius: 999px;
    background: #F1F5F9;
    overflow: hidden;
  }

  .sc-contributor-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #6D28D9, #A78BFA);
  }

  .sc-problems-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sc-problems {
    padding: 4px 14px 12px;
  }

  .sc-problem-header,
  .sc-problem-row {
    display: grid;
    grid-template-columns: 110px minmax(120px, 0.8fr) minmax(220px, 1.6fr) 130px 120px 110px;
    gap: 10px;
    align-items: center;
  }

  .sc-problem-header {
    padding: 9px 10px;
    border-radius: 9px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .sc-problem-row {
    min-height: 48px;
    padding: 0 10px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 9px;
    font-weight: 800;
  }

  .sc-problem-row:last-child {
    border-bottom: 0;
  }

  .sc-pill {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 950;
  }

  .sc-pill.high {
    background: #FEF2F2;
    color: #DC2626;
  }

  .sc-pill.medium {
    background: #FFF7ED;
    color: #C2410C;
  }

  .sc-pill.low {
    background: #EFF6FF;
    color: #2563EB;
  }

  .sc-pill.open {
    background: #FFF7ED;
    color: #C2410C;
  }

  .sc-pill.resolved {
    background: #ECFDF5;
    color: #047857;
  }

  .sc-open {
    border: 0;
    background: transparent;
    color: #6D28D9;
    font: inherit;
    font-size: 9px;
    font-weight: 950;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }

  .sc-empty {
    padding: 28px 16px;
    text-align: center;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
  }

  @media (max-width: 1180px) {
    .sc-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sc-report-grid {
      grid-template-columns: 1fr 1fr;
    }

    .sc-panel:first-child {
      grid-column: 1 / -1;
    }

    .sc-problem-header,
    .sc-problem-row {
      grid-template-columns: 90px minmax(100px, 0.8fr) minmax(180px, 1.4fr) 110px 105px 90px;
    }
  }

  @media (max-width: 760px) {
    .sc-summary {
      grid-template-columns: 1fr;
    }

    .sc-report-grid {
      grid-template-columns: 1fr;
    }

    .sc-panel:first-child {
      grid-column: auto;
    }

    .sc-block-head {
      align-items: flex-start;
    }

    .sc-detail-btn {
      display: none;
    }

    .sc-problems {
      overflow-x: auto;
    }

    .sc-problem-header,
    .sc-problem-row {
      min-width: 760px;
    }
  }
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

function formatMb(value) {
  const amount = number(value)
  return amount >= 100 ? amount.toFixed(0) : amount >= 10 ? amount.toFixed(1) : amount.toFixed(2)
}

function formatUsage(value) {
  const mb = number(value)

  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(mb >= 10240 ? 0 : 1)} GB`
  }

  return `${formatMb(mb)} MB`
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativeTime(value) {
  if (!value) return '—'

  const diff = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(diff) || diff < 0) return 'now'

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}

function dependencyLabel(value) {
  const key = String(value || 'OTHER').toUpperCase()

  if (key === 'SUPABASE') return 'Supabase'
  if (key === 'CLOUDFLARE_R2') return 'R2'
  if (key === 'CLIENT') return 'Reader'
  if (key === 'TELEGRAM') return 'Telegram'
  if (key === 'IPWHO') return 'IPWho'

  return key === 'UNKNOWN' ? 'Other' : key
}

function aggregate(rows, keySelector) {
  const map = new Map()

  for (const row of rows) {
    const key = keySelector(row)
    const current = map.get(key) || {
      key,
      count: 0,
      bytes: 0,
      errors: 0,
    }

    current.count += number(row.count)
    current.bytes += number(row.bytes)
    current.errors += number(row.errors)

    map.set(key, current)
  }

  return [...map.values()].sort(
    (a, b) => b.bytes - a.bytes || b.count - a.count
  )
}

function polylinePoints(values, width = 100, height = 28) {
  const safe = values.map(number)
  if (!safe.length) return ''

  const max = Math.max(...safe, 1)
  const min = Math.min(...safe)
  const range = Math.max(max - min, 1)

  return safe
    .map((value, index) => {
      const x = safe.length === 1
        ? width / 2
        : (index / (safe.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function Sparkline({ values = [], tone = 'purple' }) {
  const stroke =
    tone === 'red'
      ? '#EF4444'
      : tone === 'green'
        ? '#10B981'
        : '#6D28D9'

  return (
    <svg className="sc-spark" viewBox="0 0 100 28" aria-hidden="true">
      <polyline
        points={polylinePoints(values)}
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SummaryCard({ tone, icon, label, value, note, spark, onClick }) {
  return (
    <div className="sc-summary-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="sc-summary-head">
        <div className="sc-summary-label">
          <span className={`sc-icon ${tone}`}>{icon}</span>
          <span>{label}</span>
        </div>
        <Sparkline
          values={spark}
          tone={tone === 'red' ? 'red' : tone === 'green' ? 'green' : 'purple'}
        />
      </div>

      <div>
        <div className="sc-summary-value">{value}</div>
        <div className="sc-summary-note">{note}</div>
      </div>
    </div>
  )
}

function LineChart({ values = [] }) {
  const safe = values.length >= 2 ? values : [0, 0]
  const width = 720
  const height = 180
  const max = Math.max(...safe, 1)
  const min = 0
  const range = Math.max(max - min, 1)

  const points = safe.map((value, index) => {
    const x = (index / (safe.length - 1)) * width
    const y = height - 22 - ((number(value) - min) / range) * (height - 44)
    return [x, y]
  })

  const pointString = points
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  const areaPath = points.length
    ? `M ${points[0][0]} ${height - 22} L ${points
        .map(([x, y]) => `${x} ${y}`)
        .join(' L ')} L ${points[points.length - 1][0]} ${height - 22} Z`
    : ''

  const previous = safe.map((value, index) =>
    Math.max(0, number(value) * (0.72 + ((index % 4) * 0.04)))
  )

  const previousPoints = previous
    .map((value, index) => {
      const x = (index / (previous.length - 1)) * width
      const y = height - 22 - ((value - min) / range) * (height - 44)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <>
      <svg className="sc-line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="usageFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[32, 72, 112, 152].map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} className="sc-axis" />
        ))}

        <path d={areaPath} className="sc-area" />
        <polyline points={previousPoints} className="sc-line-soft" />
        <polyline points={pointString} className="sc-line" />
      </svg>

      <div className="sc-chart-labels">
        <span>Earlier</span>
        <span>Recent measured traffic</span>
        <span>Now</span>
      </div>
    </>
  )
}

function severityFor(incident) {
  const severity = String(incident?.severity || '').toLowerCase()

  if (severity === 'critical' || severity === 'high') return 'high'
  if (severity === 'medium') return 'medium'
  return 'low'
}

function statusClass(status) {
  return String(status || '').toUpperCase() === 'RESOLVED'
    ? 'resolved'
    : 'open'
}

export default function AdminSystemControlPage() {
  const navigate = useNavigate()
  const [usage, setUsage] = useState(null)
  const [anomaly, setAnomaly] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadSnapshot = useCallback(async () => {
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
        throw new Error(data?.message || 'System Control snapshot failed.')
      }

      const nextUsage = data.usage || null
      setUsage(nextUsage)
      setAnomaly(data.anomaly || null)
      setUpdatedAt(Date.now())
      setError('')

      const measuredMb = number(nextUsage?.minute?.mb)
      setHistory((current) => {
        const next = [...current, measuredMb]
        return next.slice(-MAX_HISTORY)
      })
    } catch (loadError) {
      setError(loadError?.message || 'System Control snapshot failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadIncidents = useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(
        `${API_URL}/api/admin/system-control/incidents?limit=4`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.message || 'System Control incidents failed.')
      }

      setIncidents(Array.isArray(data.incidents) ? data.incidents : [])
    } catch (loadError) {
      setError(loadError?.message || 'System Control incidents failed.')
    }
  }, [])

  useEffect(() => {
    loadSnapshot()
    loadIncidents()

    const snapshotTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadSnapshot()
      }
    }, SNAPSHOT_REFRESH_MS)

    const incidentTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadIncidents()
      }
    }, INCIDENT_REFRESH_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSnapshot()
        loadIncidents()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(snapshotTimer)
      clearInterval(incidentTimer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadIncidents, loadSnapshot])

  const rows = useMemo(
    () => (Array.isArray(usage?.minute?.rows) ? usage.minute.rows : []),
    [usage]
  )

  const providers = useMemo(
    () => aggregate(rows, (row) => dependencyLabel(row.dependency)).slice(0, 5),
    [rows]
  )

  const features = useMemo(
    () => aggregate(rows, (row) => String(row.feature || 'Other')).slice(0, 5),
    [rows]
  )

  const externalRows = useMemo(
    () => rows.filter((row) => row.kind === 'external_request'),
    [rows]
  )

  const totalMb = number(usage?.minute?.mb)
  const renderMb = externalRows.reduce(
    (sum, row) => sum + number(row.mb),
    0
  )
  const supabaseCalls = rows
    .filter((row) => String(row.dependency || '').toUpperCase() === 'SUPABASE')
    .reduce((sum, row) => sum + number(row.count), 0)

  const activeProblems = incidents.filter(
    (incident) => String(incident.status || '').toUpperCase() !== 'RESOLVED'
  ).length

  const providerTotal = providers.reduce(
    (sum, item) => sum + item.bytes,
    0
  )

  let runningPercent = 0
  const donutStops = providers.map((item) => {
    const share = providerTotal > 0
      ? (item.bytes / providerTotal) * 100
      : 0
    runningPercent += share
    return runningPercent
  })

  const p1 = donutStops[0] || 0
  const p2 = donutStops[1] || p1
  const p3 = donutStops[2] || p2
  const p4 = donutStops[3] || p3

  const maxFeatureBytes = Math.max(
    ...features.map((item) => item.bytes),
    1
  )

  const sparkBase = history.length >= 4
    ? history.slice(-10)
    : [1, 1.4, 1.1, 1.8, 1.5, 2.2, 1.9, 2.7]

  const anomalyStatus = String(anomaly?.status || 'learning').toLowerCase()
  const summaryNote =
    anomalyStatus === 'active'
      ? 'Anomaly active now'
      : anomalyStatus === 'suspect'
        ? 'Potential anomaly detected'
        : anomalyStatus === 'learning'
          ? 'Learning normal baseline'
          : 'Current measured window'

  return (
    <AdminLayout
      title="System Control"
      subtitle="Monitor data usage, detect anomalies, and keep Shadow infrastructure healthy."
    >
      <style>{styles}</style>

      <div className="sc-page">
        <div className="sc-topbar">
          <div className="sc-live">
            <span className="sc-live-dot" />
            Live System Control
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span className="sc-updated">Updated {formatTime(updatedAt)}</span>
            <button type="button" className="sc-refresh" onClick={() => navigate('/alerts/system-control/manage')}>
  Manage
</button>
            <button
              type="button"
              className="sc-refresh"
              disabled={loading}
              onClick={() => {
                loadSnapshot()
                loadIncidents()
              }}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? <div className="sc-error">{error}</div> : null}

        <section className="sc-summary">
          <SummaryCard
            tone="purple"
            icon="◉"
            label="Total Data Usage"
            value={formatUsage(totalMb)}
            note={summaryNote}
            spark={sparkBase}
            onClick={() => navigate('/alerts/system-control/usage')}
          />

          <SummaryCard
            tone="blue"
            icon="☁"
            label="Render Usage"
            value={formatUsage(renderMb)}
            note="Measured external traffic"
            spark={sparkBase.map((value, index) => value * (0.74 + index * 0.02))}
            onClick={() => navigate('/alerts/system-control/render')}
          />

          <SummaryCard
            tone="green"
            icon="▤"
            label="Supabase Activity"
            value={formatNumber(supabaseCalls)}
            note="Calls in current measured window"
            spark={sparkBase.map((value, index) => value * (0.64 + (index % 3) * 0.09))}
            onClick={() => navigate('/alerts/system-control/supabase')}
          />

          <SummaryCard
            tone="red"
            icon="!"
            label="Active Problems"
            value={formatNumber(activeProblems)}
            note={activeProblems > 0 ? 'Needs attention' : 'No active incident'}
            spark={incidents.length
              ? incidents.map((incident, index) =>
                  String(incident.status || '').toUpperCase() === 'RESOLVED'
                    ? Math.max(1, incidents.length - index - 1)
                    : incidents.length - index + 1
                )
              : [1, 1, 1, 1]
            }
            onClick={() => navigate('/alerts/system-control/problems')}
          />
        </section>

        <section className="sc-block">
          <div className="sc-block-head">
            <div className="sc-block-title-wrap">
              <span className="sc-icon purple">▥</span>
              <div>
                <div className="sc-block-title">Usage Report</div>
                <div className="sc-block-subtitle">
                  Simple live usage summary. Detailed analytics will open in its own page.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="sc-detail-btn"
              onClick={() => navigate('/alerts/system-control/usage')}
            >
              Detailed Analytics →
            </button>
          </div>

          <div className="sc-report-grid">
            <div className="sc-panel">
              <div className="sc-panel-head">
                <div className="sc-panel-title">Total Data Usage</div>
                <div className="sc-panel-meta">Live session</div>
              </div>

              <div className="sc-chart-value">
                <strong>{formatUsage(totalMb)}</strong>
                <span>current minute</span>
              </div>

              <LineChart values={history.length >= 2 ? history : sparkBase} />
            </div>

            <div className="sc-panel">
              <div className="sc-panel-head">
                <div className="sc-panel-title">Usage by Provider</div>
                <div className="sc-panel-meta">Current window</div>
              </div>

              <div className="sc-donut-wrap">
                <div
                  className="sc-donut"
                  style={{
                    '--p1': `${p1}%`,
                    '--p2': `${p2}%`,
                    '--p3': `${p3}%`,
                    '--p4': `${p4}%`,
                  }}
                >
                  <div className="sc-donut-center">
                    <strong>{formatUsage(totalMb)}</strong>
                    <span>Total measured</span>
                  </div>
                </div>
              </div>

              <div className="sc-legend">
                {providers.length > 0 ? providers.map((item, index) => {
                  const colors = ['#6D28D9', '#3B82F6', '#10B981', '#F59E0B', '#CBD5E1']
                  const share = providerTotal > 0
                    ? (item.bytes / providerTotal) * 100
                    : 0

                  return (
                    <div className="sc-legend-row" key={item.key}>
                      <span
                        className="sc-legend-dot"
                        style={{ background: colors[index] }}
                      />
                      <span>{item.key}</span>
                      <span>{share.toFixed(1)}%</span>
                    </div>
                  )
                }) : (
                  <div className="sc-empty" style={{ padding: 10 }}>
                    Waiting for provider traffic.
                  </div>
                )}
              </div>
            </div>

            <div className="sc-panel">
              <div className="sc-panel-head">
                <div className="sc-panel-title">Top Data Contributors</div>
                <div className="sc-panel-meta">Current window</div>
              </div>

              <div className="sc-contributors">
                {features.length > 0 ? features.map((item) => {
                  const width = Math.max(
                    4,
                    Math.min(100, (item.bytes / maxFeatureBytes) * 100)
                  )

                  return (
                    <div key={item.key}>
                      <div className="sc-contributor-top">
                        <span>{item.key}</span>
                        <span>{formatUsage(item.bytes / 1024 / 1024)}</span>
                      </div>
                      <div className="sc-contributor-track">
                        <div
                          className="sc-contributor-fill"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                }) : (
                  <div className="sc-empty" style={{ padding: 18 }}>
                    Waiting for feature traffic.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="sc-block">
          <div className="sc-block-head">
            <div className="sc-problems-head">
              <span className="sc-icon red">!</span>
              <div>
                <div className="sc-block-title">Recent Problems</div>
                <div className="sc-block-subtitle">
                  Only the latest abnormal events are loaded on this overview.
                </div>
              </div>
            </div>

            <button
              type="button"
              className="sc-detail-btn"
              onClick={() => navigate('/alerts/system-control/problems')}
            >
              View All Incidents →
            </button>
          </div>

          <div className="sc-problems">
            <div className="sc-problem-header">
              <span>Severity</span>
              <span>Feature</span>
              <span>Cause</span>
              <span>First Seen</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {incidents.length > 0 ? incidents.map((incident) => {
              const evidence = incident?.evidence || {}
              const signals = Array.isArray(evidence?.signals)
                ? evidence.signals
                : []
              const cause = signals.length
                ? signals.join(' · ').replaceAll('_', ' ')
                : evidence?.top_driver?.source_route ||
                  incident.source_route ||
                  'Usage anomaly detected'

              return (
                <div className="sc-problem-row" key={incident.id}>
                  <span className={`sc-pill ${severityFor(incident)}`}>
                    {String(incident.severity || 'Info')}
                  </span>
                  <span>{incident.feature || 'Unknown'}</span>
                  <span style={{ textTransform: 'capitalize' }}>{cause}</span>
                  <span>{relativeTime(incident.first_seen_at)}</span>
                  <span className={`sc-pill ${statusClass(incident.status)}`}>
                    {incident.status || 'OPEN'}
                  </span>
                  <button
                    type="button"
                    className="sc-open"
                    onClick={() => navigate(`/alerts/system-control/problems/${incident.id}`)}
                  >
                    Open Report →
                  </button>
                </div>
              )
            }) : (
              <div className="sc-empty">
                No recent abnormal events.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
