import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 30

const styles = `
  .work-console {
    display: grid;
    gap: 18px;
    color: #0F172A;
  }

  .work-console-topline {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .work-health {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 13px;
    border: 1px solid #D1FAE5;
    border-radius: 999px;
    background: #ECFDF5;
    color: #047857;
    font-size: 11px;
    font-weight: 900;
  }

  .work-health-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .work-updated {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
  }

  .work-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .work-stat-card {
    min-height: 112px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
  }

  .work-stat-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 15px;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .work-stat-icon.red {
    background: #FEF2F2;
    color: #DC2626;
  }

  .work-stat-icon.green {
    background: #ECFDF5;
    color: #059669;
  }

  .work-stat-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
  }

  .work-stat-value {
    margin-top: 4px;
    color: #0F172A;
    font-size: 25px;
    line-height: 1.05;
    font-weight: 950;
  }

  .work-stat-note {
    margin-top: 7px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
  }

  .work-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .work-tabs,
  .work-source-chips,
  .work-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .work-tab,
  .work-chip,
  .work-refresh,
  .work-view-all,
  .work-page-button {
    min-height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 13px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: border-color .18s ease, background .18s ease, color .18s ease;
  }

  .work-tab.active {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .work-chip.active {
    border-color: #C7D2FE;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .work-refresh {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .work-refresh:disabled,
  .work-page-button:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .work-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.12fr) minmax(390px, .88fr);
    gap: 14px;
    align-items: stretch;
  }

  .work-panel {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
    overflow: hidden;
  }

  .work-panel-head {
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 15px;
    border-bottom: 1px solid #E2E8F0;
  }

  .work-panel-title {
    margin: 0;
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .work-panel-subtitle {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
  }

  .work-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .work-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
  }

  .work-table th {
    padding: 10px 12px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #64748B;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: .03em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .work-table td {
    padding: 12px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 10px;
    font-weight: 750;
    vertical-align: middle;
    white-space: nowrap;
  }

  .work-table tbody tr {
    cursor: pointer;
    transition: background .16s ease;
  }

  .work-table tbody tr:hover {
    background: #F8FAFC;
  }

  .work-table tbody tr.selected {
    background: #F5F3FF;
    box-shadow: inset 3px 0 0 #6366F1;
  }

  .work-endpoint-cell {
    max-width: 260px;
    color: #0F172A !important;
    font-weight: 900 !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .work-status-badge,
  .work-source-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 950;
  }

  .work-status-badge.active {
    background: #FEF2F2;
    color: #DC2626;
  }

  .work-status-badge.resolved {
    background: #ECFDF5;
    color: #047857;
  }

  .work-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  .work-source-badge.web {
    background: #EFF6FF;
    color: #2563EB;
  }

  .work-source-badge.admin {
    background: #F5F3FF;
    color: #7C3AED;
  }

  .work-source-badge.backend {
    background: #FFF7ED;
    color: #C2410C;
  }

  .work-source-badge.unknown {
    background: #F1F5F9;
    color: #64748B;
  }

  .work-list-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 14px;
    background: #FAFCFF;
  }

  .work-list-count {
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
  }

  .work-pagination {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .work-page-number {
    color: #64748B;
    font-size: 9px;
    font-weight: 900;
  }

  .work-page-button {
    min-height: 32px;
    padding: 0 10px;
    font-size: 9px;
  }

  .work-empty,
  .work-error {
    margin: 14px;
    padding: 42px 18px;
    border: 1px dashed #CBD5E1;
    border-radius: 15px;
    text-align: center;
    color: #64748B;
    font-size: 11px;
    font-weight: 850;
  }

  .work-error {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .work-detail {
    min-height: 100%;
  }

  .work-detail-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border-bottom: 1px solid #E2E8F0;
  }

  .work-detail-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .work-detail-id {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 850;
  }

  .work-detail-title {
    margin: 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .work-detail-note {
    margin-top: 5px;
    color: #64748B;
    font-size: 10px;
    font-weight: 750;
  }

  .work-kill-button {
    min-height: 40px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 0;
    border-radius: 12px;
    background: #4F46E5;
    color: #FFFFFF;
    padding: 0 15px;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
    box-shadow: 0 7px 18px rgba(79, 70, 229, .18);
  }

  .work-detail-body {
    display: grid;
    gap: 12px;
    padding: 14px;
  }

  .work-detail-section {
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 13px;
    background: #FFFFFF;
  }

  .work-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 11px;
    color: #0F172A;
    font-size: 11px;
    font-weight: 950;
  }

  .work-overview-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .work-info-label {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 950;
    letter-spacing: .03em;
    text-transform: uppercase;
  }

  .work-info-value {
    margin-top: 4px;
    color: #334155;
    font-size: 10px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .work-detail-lower {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
    gap: 12px;
  }

  .work-timeline {
    display: grid;
    gap: 0;
  }

  .work-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 16px 72px minmax(0, 1fr);
    gap: 8px;
    min-height: 51px;
  }

  .work-timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 16px;
    bottom: -1px;
    width: 1px;
    background: #E2E8F0;
  }

  .work-timeline-dot {
    width: 9px;
    height: 9px;
    margin-top: 4px;
    border-radius: 50%;
    background: #94A3B8;
    box-shadow: 0 0 0 3px #F8FAFC;
    z-index: 1;
  }

  .work-timeline-dot.red {
    background: #EF4444;
  }

  .work-timeline-dot.green {
    background: #10B981;
  }

  .work-timeline-time {
    color: #64748B;
    font-size: 8px;
    font-weight: 900;
  }

  .work-timeline-title {
    color: #1E293B;
    font-size: 9px;
    font-weight: 950;
  }

  .work-timeline-text {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 700;
    line-height: 1.45;
  }

  .work-state-list {
    display: grid;
    gap: 0;
  }

  .work-state-row {
    min-height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid #F1F5F9;
  }

  .work-state-row:last-child {
    border-bottom: 0;
  }

  .work-state-label {
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
  }

  .work-state-value {
    color: #0F172A;
    font-size: 10px;
    font-weight: 950;
  }

  .work-action-card {
    margin-top: 12px;
    border: 1px solid #FDE68A;
    border-radius: 14px;
    background: #FFFBEB;
    padding: 13px;
  }

  .work-action-title {
    color: #92400E;
    font-size: 10px;
    font-weight: 950;
  }

  .work-action-text {
    margin-top: 6px;
    color: #A16207;
    font-size: 9px;
    line-height: 1.55;
    font-weight: 750;
  }

  .work-action-button {
    width: 100%;
    min-height: 38px;
    margin-top: 11px;
    border: 0;
    border-radius: 11px;
    background: #4F46E5;
    color: #FFFFFF;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
  }

  .work-resolved-panel {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
    overflow: hidden;
  }

  .work-resolved-table {
    width: 100%;
    min-width: 650px;
    border-collapse: collapse;
  }

  .work-resolved-table th {
    padding: 9px 12px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-align: left;
    text-transform: uppercase;
  }

  .work-resolved-table td {
    padding: 10px 12px;
    border-top: 1px solid #F1F5F9;
    color: #475569;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
  }

  @media (max-width: 1180px) {
    .work-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .work-main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .work-stat-grid {
      grid-template-columns: 1fr;
    }

    .work-toolbar,
    .work-console-topline {
      align-items: stretch;
    }

    .work-source-chips,
    .work-tabs,
    .work-toolbar-right {
      width: 100%;
    }

    .work-tab,
    .work-chip {
      flex: 1;
    }

    .work-detail-head {
      flex-direction: column;
    }

    .work-kill-button {
      width: 100%;
    }

    .work-overview-grid,
    .work-detail-lower {
      grid-template-columns: 1fr;
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

function SvgIcon({ path, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  alert: 'M12 9v4 M12 17h.01 M10.3 3.7L2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0z',
  check: 'M20 6L9 17l-5-5',
  chart: 'M3 20h18 M6 16l4-5 4 3 4-7',
  database: 'M4 5c0-2 16-2 16 0s-16 2-16 0z M4 5v14c0 2 16 2 16 0V5 M4 12c0 2 16 2 16 0',
  refresh: 'M20 6v5h-5 M4 18v-5h5 M18.5 9A7 7 0 0 0 6.2 6.2L4 9 M5.5 15A7 7 0 0 0 17.8 17.8L20 15',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z M12 6v6l4 2',
  activity: 'M3 12h4l2-7 4 14 2-7h6',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString()
}

function formatShortDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(value) {
  if (!value) return '—'

  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return '—'

  const diff = Math.max(0, Date.now() - time)
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDuration(startValue, endValue) {
  if (!startValue) return '—'

  const start = new Date(startValue).getTime()
  const end = new Date(endValue || startValue).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) return '—'

  const diff = Math.max(0, end - start)
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  return `${days}d`
}

function sourceClass(source) {
  const value = String(source || 'UNKNOWN').toLowerCase()

  if (value === 'web') return 'web'
  if (value === 'admin') return 'admin'
  if (value === 'backend') return 'backend'
  return 'unknown'
}

function sourceLabel(source) {
  const value = String(source || 'UNKNOWN').toUpperCase()
  return ['WEB', 'ADMIN', 'BACKEND', 'UNKNOWN'].includes(value)
    ? value
    : 'UNKNOWN'
}

async function requestIncidents({
  token,
  status,
  source = '',
  page = 1,
  limit = PAGE_SIZE,
}) {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  })

  if (source) params.set('source', source)

  const response = await fetch(
    `${API_URL}/api/admin/work/incidents?${params.toString()}`,
    {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Failed to load Work incidents')
  }

  return {
    incidents: Array.isArray(data.incidents) ? data.incidents : [],
    pagination: {
      page: Number(data.pagination?.page || page),
      limit: Number(data.pagination?.limit || limit),
      total: Number(data.pagination?.total || 0),
      has_more: Boolean(data.pagination?.has_more),
    },
  }
}

export default function AdminWorkPage() {
  const navigate = useNavigate()

  const [status, setStatus] = useState('active')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)

  const [incidents, setIncidents] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    has_more: false,
  })

  const [activeTotal, setActiveTotal] = useState(0)
  const [resolvedTotal, setResolvedTotal] = useState(0)
  const [recentResolved, setRecentResolved] = useState([])

  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadCurrent = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const result = await requestIncidents({
        token,
        status,
        source,
        page,
        limit: PAGE_SIZE,
      })

      setIncidents(result.incidents)
      setPagination(result.pagination)
      setUpdatedAt(Date.now())
    } catch (loadError) {
      setIncidents([])
      setError(loadError?.message || 'Failed to load Work incidents')
    } finally {
      setLoading(false)
    }
  }, [page, source, status])

  const loadSummary = useCallback(async () => {
    const token = getToken()

    if (!token) return

    try {
      setSummaryLoading(true)

      const [activeResult, resolvedResult] = await Promise.all([
        requestIncidents({
          token,
          status: 'active',
          page: 1,
          limit: 30,
        }),
        requestIncidents({
          token,
          status: 'resolved',
          page: 1,
          limit: 5,
        }),
      ])

      setActiveTotal(activeResult.pagination.total)
      setResolvedTotal(resolvedResult.pagination.total)
      setRecentResolved(resolvedResult.incidents)
    } catch {
      setRecentResolved([])
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrent()
  }, [loadCurrent])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    if (incidents.length === 0) {
      setSelectedId('')
      return
    }

    const stillVisible = incidents.some(
      (incident) => String(incident.id) === String(selectedId)
    )

    if (!stillVisible) {
      setSelectedId(String(incidents[0].id))
    }
  }, [incidents, selectedId])

  const selectedIncident = useMemo(
    () =>
      incidents.find(
        (incident) => String(incident.id) === String(selectedId)
      ) || incidents[0] || null,
    [incidents, selectedId]
  )

  const highestPeak = useMemo(() => {
    if (incidents.length === 0) return 0

    return Math.max(
      ...incidents.map((incident) =>
        Number(incident.peak_requests_per_minute || 0)
      )
    )
  }, [incidents])

  const visibleSources = useMemo(() => {
    return [
      ...new Set(
        incidents.map((incident) => sourceLabel(incident.source))
      ),
    ]
  }, [incidents])

  const selectedDuration = selectedIncident
    ? formatDuration(
        selectedIncident.first_detected_at,
        selectedIncident.status === 'resolved'
          ? selectedIncident.resolved_at ||
              selectedIncident.last_detected_at
          : selectedIncident.last_detected_at || new Date().toISOString()
      )
    : '—'

  const selectedResolved =
    selectedIncident?.status === 'resolved'

  const refreshAll = async () => {
    await Promise.all([loadCurrent(), loadSummary()])
  }

  function changeStatus(nextStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  function changeSource(nextSource) {
    setSource(nextSource)
    setPage(1)
  }

  function openResolvedHistory() {
    setStatus('resolved')
    setSource('')
    setPage(1)
  }

  const summaryCards = [
    {
      label: 'Active Incidents',
      value: summaryLoading ? '…' : activeTotal.toLocaleString(),
      note: activeTotal > 0 ? 'Requiring attention' : 'No active incident',
      icon: ICONS.alert,
      tone: 'red',
    },
    {
      label: 'Resolved Records',
      value: summaryLoading ? '…' : resolvedTotal.toLocaleString(),
      note: 'Saved incident history',
      icon: ICONS.check,
      tone: 'green',
    },
    {
      label: 'Highest Peak',
      value: `${highestPeak.toLocaleString()} req/min`,
      note: 'Highest in current view',
      icon: ICONS.chart,
      tone: '',
    },
    {
      label: 'Sources Affected',
      value: `${visibleSources.length} / 4`,
      note:
        visibleSources.length > 0
          ? visibleSources.join(', ')
          : 'No source in current view',
      icon: ICONS.database,
      tone: '',
    },
  ]

  return (
    <AdminLayout
      title="Work"
      subtitle="Monitor and manage loop incidents detected by Shadow Work Monitor."
    >
      <style>{styles}</style>

      <div className="work-console">
        <div className="work-console-topline">
          <div className="work-health">
            <span className="work-health-dot" />
            {activeTotal > 0
              ? `${activeTotal} Active Incident${activeTotal === 1 ? '' : 's'}`
              : 'System Monitoring'}
          </div>

          <div className="work-updated">
            {updatedAt
              ? `Updated ${new Date(updatedAt).toLocaleString()}`
              : ''}
          </div>
        </div>

        <div className="work-stat-grid">
          {summaryCards.map((card) => (
            <div className="work-stat-card" key={card.label}>
              <div className={`work-stat-icon ${card.tone}`}>
                <SvgIcon path={card.icon} size={22} />
              </div>

              <div>
                <div className="work-stat-label">{card.label}</div>
                <div className="work-stat-value">{card.value}</div>
                <div className="work-stat-note">{card.note}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="work-toolbar">
          <div className="work-tabs">
            <button
              type="button"
              className={`work-tab ${status === 'active' ? 'active' : ''}`}
              onClick={() => changeStatus('active')}
            >
              Active Incidents ({activeTotal})
            </button>

            <button
              type="button"
              className={`work-tab ${status === 'resolved' ? 'active' : ''}`}
              onClick={() => changeStatus('resolved')}
            >
              Resolved History ({resolvedTotal})
            </button>
          </div>

          <div className="work-toolbar-right">
            <div className="work-source-chips">
              {[
                ['', 'All'],
                ['WEB', 'WEB'],
                ['ADMIN', 'ADMIN'],
                ['BACKEND', 'BACKEND'],
                ['UNKNOWN', 'UNKNOWN'],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  className={`work-chip ${source === value ? 'active' : ''}`}
                  onClick={() => changeSource(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="work-refresh"
              disabled={loading || summaryLoading}
              onClick={refreshAll}
            >
              <SvgIcon path={ICONS.refresh} size={15} />
              {loading || summaryLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? <div className="work-error">{error}</div> : null}

        <div className="work-main-grid">
          <section className="work-panel">
            <div className="work-panel-head">
              <div>
                <h2 className="work-panel-title">
                  {status === 'active'
                    ? 'Active Incidents'
                    : 'Resolved History'}
                </h2>
                <div className="work-panel-subtitle">
                  {status === 'active'
                    ? 'Select an incident to inspect details and response options.'
                    : 'Resolved incidents remain available as records.'}
                </div>
              </div>

              <div className="work-list-count">
                {pagination.total.toLocaleString()} record
                {pagination.total === 1 ? '' : 's'}
              </div>
            </div>

            {!error && !loading && incidents.length === 0 ? (
              <div className="work-empty">
                {status === 'active'
                  ? '✓ No active loop incident detected. Monitoring normally.'
                  : 'No resolved incident found in this filter.'}
              </div>
            ) : null}

            {incidents.length > 0 ? (
              <>
                <div className="work-table-wrap">
                  <table className="work-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Method / Path</th>
                        <th>Source</th>
                        <th>Peak Req/Min</th>
                        <th>First Seen</th>
                        <th>
                          {status === 'resolved'
                            ? 'Resolved'
                            : 'Last Seen'}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {incidents.map((incident) => {
                        const resolved =
                          incident.status === 'resolved'
                        const selected =
                          String(incident.id) === String(selectedId)

                        return (
                          <tr
                            key={incident.id}
                            className={selected ? 'selected' : ''}
                            onClick={() =>
                              setSelectedId(String(incident.id))
                            }
                          >
                            <td>
                              <span
                                className={`work-status-badge ${
                                  resolved ? 'resolved' : 'active'
                                }`}
                              >
                                <span className="work-status-dot" />
                                {resolved ? 'Resolved' : 'Active'}
                              </span>
                            </td>

                            <td
                              className="work-endpoint-cell"
                              title={`${incident.method} ${incident.path}`}
                            >
                              {incident.method} {incident.path}
                            </td>

                            <td>
                              <span
                                className={`work-source-badge ${sourceClass(
                                  incident.source
                                )}`}
                              >
                                {sourceLabel(incident.source)}
                              </span>
                            </td>

                            <td>
                              {Number(
                                incident.peak_requests_per_minute || 0
                              ).toLocaleString()}
                            </td>

                            <td>
                              {formatShortDate(
                                incident.first_detected_at
                              )}
                            </td>

                            <td>
                              {resolved
                                ? formatShortDate(
                                    incident.resolved_at
                                  )
                                : formatRelative(
                                    incident.last_detected_at
                                  )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="work-list-footer">
                  <div className="work-list-count">
                    Page {pagination.page} · Showing {incidents.length}
                  </div>

                  <div className="work-pagination">
                    <button
                      type="button"
                      className="work-page-button"
                      disabled={loading || page <= 1}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                    >
                      Previous
                    </button>

                    <span className="work-page-number">
                      Page {pagination.page}
                    </span>

                    <button
                      type="button"
                      className="work-page-button"
                      disabled={loading || !pagination.has_more}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </section>

          <section className="work-panel work-detail">
            {!selectedIncident ? (
              <div className="work-empty">
                Select an incident to view details.
              </div>
            ) : (
              <>
                <div className="work-detail-head">
                  <div>
                    <div className="work-detail-kicker">
                      <span
                        className={`work-status-badge ${
                          selectedResolved
                            ? 'resolved'
                            : 'active'
                        }`}
                      >
                        <span className="work-status-dot" />
                        {selectedResolved
                          ? 'Resolved Incident'
                          : 'Active Incident'}
                      </span>

                      <span className="work-detail-id">
                        #{String(selectedIncident.id).slice(0, 18)}
                      </span>
                    </div>

                    <h2 className="work-detail-title">
                      {selectedIncident.method}{' '}
                      {selectedIncident.path}
                    </h2>

                    <div className="work-detail-note">
                      {selectedResolved
                        ? 'This incident has been resolved and kept as a record.'
                        : 'Repeated request activity is still being monitored.'}
                    </div>
                  </div>

                  {!selectedResolved ? (
                    <button
                      type="button"
                      className="work-kill-button"
                      onClick={() =>
                        navigate('/alerts/kill-switch')
                      }
                    >
                      <SvgIcon path={ICONS.bolt} size={16} />
                      Open Kill Switch
                    </button>
                  ) : null}
                </div>

                <div className="work-detail-body">
                  <div className="work-detail-section">
                    <h3 className="work-section-title">
                      <SvgIcon path={ICONS.shield} size={16} />
                      Overview
                    </h3>

                    <div className="work-overview-grid">
                      <div>
                        <div className="work-info-label">
                          Method / Path
                        </div>
                        <div className="work-info-value">
                          {selectedIncident.method}{' '}
                          {selectedIncident.path}
                        </div>
                      </div>

                      <div>
                        <div className="work-info-label">Source</div>
                        <div className="work-info-value">
                          <span
                            className={`work-source-badge ${sourceClass(
                              selectedIncident.source
                            )}`}
                          >
                            {sourceLabel(
                              selectedIncident.source
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="work-info-label">
                          First Seen
                        </div>
                        <div className="work-info-value">
                          {formatDate(
                            selectedIncident.first_detected_at
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="work-info-label">
                          {selectedResolved
                            ? 'Resolved At'
                            : 'Last Seen'}
                        </div>
                        <div className="work-info-value">
                          {formatDate(
                            selectedResolved
                              ? selectedIncident.resolved_at
                              : selectedIncident.last_detected_at
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="work-info-label">
                          Peak Req/Min
                        </div>
                        <div className="work-info-value">
                          {Number(
                            selectedIncident.peak_requests_per_minute ||
                              0
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="work-info-label">
                          Occurrences
                        </div>
                        <div className="work-info-value">
                          {Number(
                            selectedIncident.occurrence_count || 1
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="work-detail-lower">
                    <div className="work-detail-section">
                      <h3 className="work-section-title">
                        <SvgIcon path={ICONS.clock} size={16} />
                        Detection Timeline
                      </h3>

                      <div className="work-timeline">
                        <div className="work-timeline-item">
                          <span className="work-timeline-dot red" />
                          <div className="work-timeline-time">
                            {formatShortDate(
                              selectedIncident.first_detected_at
                            )}
                          </div>
                          <div>
                            <div className="work-timeline-title">
                              Incident detected
                            </div>
                            <div className="work-timeline-text">
                              Shadow Work Monitor recorded the
                              repeated request pattern.
                            </div>
                          </div>
                        </div>

                        {Number(
                          selectedIncident.reopen_count || 0
                        ) > 0 ? (
                          <div className="work-timeline-item">
                            <span className="work-timeline-dot" />
                            <div className="work-timeline-time">
                              {Number(
                                selectedIncident.reopen_count || 0
                              )}
                              ×
                            </div>
                            <div>
                              <div className="work-timeline-title">
                                Incident reopened
                              </div>
                              <div className="work-timeline-text">
                                The same incident returned after
                                being previously resolved.
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="work-timeline-item">
                          <span
                            className={`work-timeline-dot ${
                              selectedResolved ? 'green' : ''
                            }`}
                          />
                          <div className="work-timeline-time">
                            {formatShortDate(
                              selectedResolved
                                ? selectedIncident.resolved_at
                                : selectedIncident.last_detected_at
                            )}
                          </div>
                          <div>
                            <div className="work-timeline-title">
                              {selectedResolved
                                ? 'Resolved'
                                : 'Still active'}
                            </div>
                            <div className="work-timeline-text">
                              {selectedResolved
                                ? 'The loop stopped and the incident moved to resolved history.'
                                : 'The latest detector update still shows this incident as active.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="work-detail-section">
                        <h3 className="work-section-title">
                          <SvgIcon path={ICONS.activity} size={16} />
                          Current State
                        </h3>

                        <div className="work-state-list">
                          <div className="work-state-row">
                            <span className="work-state-label">
                              Peak Req/Min
                            </span>
                            <span className="work-state-value">
                              {Number(
                                selectedIncident.peak_requests_per_minute ||
                                  0
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="work-state-row">
                            <span className="work-state-label">
                              Occurrences
                            </span>
                            <span className="work-state-value">
                              {Number(
                                selectedIncident.occurrence_count ||
                                  1
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="work-state-row">
                            <span className="work-state-label">
                              Reopened
                            </span>
                            <span className="work-state-value">
                              {Number(
                                selectedIncident.reopen_count || 0
                              )}
                              ×
                            </span>
                          </div>

                          <div className="work-state-row">
                            <span className="work-state-label">
                              Duration
                            </span>
                            <span className="work-state-value">
                              {selectedDuration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="work-action-card">
                        <div className="work-action-title">
                          {selectedResolved
                            ? 'Resolution Status'
                            : 'Recommended Action'}
                        </div>

                        <div className="work-action-text">
                          {selectedResolved
                            ? 'This incident resolved automatically. Keep the record for review and watch for a future reopen.'
                            : 'Review the endpoint and source. If the repeated request loop must be contained immediately, open Kill Switch and create a scoped block.'}
                        </div>

                        {!selectedResolved ? (
                          <button
                            type="button"
                            className="work-action-button"
                            onClick={() =>
                              navigate('/alerts/kill-switch')
                            }
                          >
                            Open Kill Switch
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="work-resolved-panel">
          <div className="work-panel-head">
            <div>
              <h2 className="work-panel-title">
                Recent Resolved
              </h2>
              <div className="work-panel-subtitle">
                Latest resolved incidents kept as records.
              </div>
            </div>

            <button
              type="button"
              className="work-view-all"
              onClick={openResolvedHistory}
            >
              View All
            </button>
          </div>

          {recentResolved.length === 0 ? (
            <div className="work-empty">
              No resolved incident record yet.
            </div>
          ) : (
            <div className="work-table-wrap">
              <table className="work-resolved-table">
                <thead>
                  <tr>
                    <th>Resolved At</th>
                    <th>Method / Path</th>
                    <th>Source</th>
                    <th>Peak Req/Min</th>
                    <th>Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {recentResolved.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        {formatShortDate(incident.resolved_at)}
                      </td>
                      <td>
                        {incident.method} {incident.path}
                      </td>
                      <td>
                        <span
                          className={`work-source-badge ${sourceClass(
                            incident.source
                          )}`}
                        >
                          {sourceLabel(incident.source)}
                        </span>
                      </td>
                      <td>
                        {Number(
                          incident.peak_requests_per_minute || 0
                        ).toLocaleString()}
                      </td>
                      <td>
                        {formatDuration(
                          incident.first_detected_at,
                          incident.resolved_at ||
                            incident.last_detected_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
