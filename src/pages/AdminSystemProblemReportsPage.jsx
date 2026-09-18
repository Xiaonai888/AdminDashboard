import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'INVESTIGATING', label: 'Investigating' },
  { key: 'FIX_APPLIED', label: 'Fix Applied' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'ARCHIVED', label: 'Archived' },
]

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function auth() {
  return {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }
}

function labelize(value) {
  return String(value || '—')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function severityTone(value) {
  const severity = String(value || '').toLowerCase()

  if (['critical', 'high'].includes(severity)) return 'high'
  if (severity === 'medium') return 'medium'
  return 'low'
}

function statusTone(value) {
  const status = String(value || '').toUpperCase()

  if (status === 'OPEN') return 'open'
  if (status === 'INVESTIGATING') return 'investigating'
  if (status === 'FIX_APPLIED') return 'fix-applied'
  if (status === 'VERIFIED') return 'verified'
  if (status === 'RESOLVED') return 'resolved'
  if (status === 'ARCHIVED') return 'archived'
  return 'neutral'
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : '—'
}

const css = `
  .pr-page {
    display: grid;
    gap: 18px;
  }

  .pr-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pr-tools {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pr-search,
  .pr-select,
  .pr-btn {
    min-height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 800;
  }

  .pr-search {
    width: min(360px, 78vw);
    padding: 0 11px;
    outline: none;
  }

  .pr-search:focus,
  .pr-select:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px #F3E8FF;
  }

  .pr-select {
    padding: 0 10px;
    outline: none;
  }

  .pr-btn {
    padding: 0 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .pr-btn:hover {
    background: #F8FAFC;
  }

  .pr-btn:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .pr-meta {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 850;
  }

  .pr-error {
    padding: 12px 14px;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 10px;
    font-weight: 850;
  }

  .pr-cards {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
  }

  .pr-card {
    min-width: 0;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    background: #FFFFFF;
    padding: 13px;
    cursor: pointer;
    text-align: left;
  }

  .pr-card:hover {
    border-color: #C4B5FD;
    background: #FCFAFF;
  }

  .pr-card.active {
    border-color: #A78BFA;
    background: #F5F3FF;
    box-shadow: 0 0 0 2px #F3E8FF;
  }

  .pr-card-label {
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pr-card-value {
    margin-top: 7px;
    color: #0F172A;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
  }

  .pr-block {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .pr-head {
    padding: 15px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pr-head-title {
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
  }

  .pr-head-sub {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .pr-list {
    padding: 12px;
    display: grid;
    gap: 8px;
  }

  .pr-header,
  .pr-item {
    display: grid;
    grid-template-columns:
      92px
      minmax(130px, 0.8fr)
      minmax(220px, 1.5fr)
      minmax(110px, 0.7fr)
      116px
      150px;
    gap: 10px;
    align-items: center;
  }

  .pr-header {
    padding: 9px 11px;
    border-radius: 9px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .pr-item {
    min-height: 54px;
    padding: 10px 11px;
    border: 1px solid #EEF2F7;
    border-radius: 11px;
    color: #334155;
    font-size: 9px;
    font-weight: 800;
    cursor: pointer;
  }

  .pr-item:hover {
    border-color: #DDD6FE;
    background: #FCFAFF;
  }

  .pr-feature {
    font-weight: 950;
    color: #1E293B;
  }

  .pr-route {
    word-break: break-word;
  }

  .pr-pill {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .pr-pill.high {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .pr-pill.medium {
    background: #FFF7ED;
    color: #C2410C;
  }

  .pr-pill.low {
    background: #EFF6FF;
    color: #2563EB;
  }

  .pr-pill.open {
    background: #FFF7ED;
    color: #C2410C;
  }

  .pr-pill.investigating {
    background: #FFF7ED;
    color: #9A3412;
  }

  .pr-pill.fix-applied {
    background: #F5F3FF;
    color: #6D28D9;
  }

  .pr-pill.verified {
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .pr-pill.resolved {
    background: #ECFDF5;
    color: #047857;
  }

  .pr-pill.archived {
    background: #F1F5F9;
    color: #475569;
  }

  .pr-empty {
    padding: 32px 16px;
    text-align: center;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 850;
  }

  @media (max-width: 1250px) {
    .pr-cards {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .pr-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pr-list {
      overflow-x: auto;
    }

    .pr-header,
    .pr-item {
      min-width: 860px;
    }
  }

  @media (max-width: 620px) {
    .pr-search {
      width: 100%;
    }

    .pr-tools {
      width: 100%;
    }

    .pr-select {
      flex: 1;
    }
  }
`

export default function AdminSystemProblemReportsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/incidents?limit=50`,
        auth()
      )

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload?.ok !== true) {
        throw new Error(
          payload?.message || 'Failed to load incident reports.'
        )
      }

      setItems(
        Array.isArray(payload.incidents)
          ? payload.incidents
          : []
      )
      setUpdatedAt(new Date())
      setError('')
    } catch (loadError) {
      setError(
        loadError?.message || 'Failed to load incident reports.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load()
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [load])

  const countByStatus = useCallback(
    (status) => {
      if (status === 'ALL') return items.length

      return items.filter(
        (item) =>
          String(item.status || '').toUpperCase() === status
      ).length
    },
    [items]
  )

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()

    return items.filter((item) => {
      const status = String(
        item.status || 'OPEN'
      ).toUpperCase()

      if (
        statusFilter !== 'ALL' &&
        status !== statusFilter
      ) {
        return false
      }

      if (!search) return true

      return [
        item.id,
        item.feature,
        item.source_route,
        item.dependency,
        item.status,
        item.severity,
        item.fix_summary,
        item.fix_commit,
        item.fix_version,
        item?.evidence?.classification,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(search)
      )
    })
  }, [items, query, statusFilter])

  const selectedLabel =
    STATUS_OPTIONS.find(
      (option) => option.key === statusFilter
    )?.label || 'All'

  return (
    <AdminLayout
      title="Problem Reports"
      subtitle="System Control incidents, investigation workflow, and retained archive."
    >
      <style>{css}</style>

      <div className="pr-page">
        <div className="pr-top">
          <div className="pr-tools">
            <input
              className="pr-search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search ID, feature, route, provider, fix…"
              aria-label="Search problem reports"
            />

            <select
              className="pr-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Problem report status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.key}
                  value={option.key}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pr-tools">
            <span className="pr-meta">
              Latest 50 · Updated{' '}
              {updatedAt
                ? updatedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </span>

            <button
              type="button"
              className="pr-btn"
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="pr-error">{error}</div>
        ) : null}

        <div className="pr-cards">
          {STATUS_OPTIONS.map((option) => (
            <button
              type="button"
              className={`pr-card ${
                statusFilter === option.key
                  ? 'active'
                  : ''
              }`}
              key={option.key}
              onClick={() =>
                setStatusFilter(option.key)
              }
            >
              <div className="pr-card-label">
                {option.label}
              </div>
              <div className="pr-card-value">
                {countByStatus(option.key)}
              </div>
            </button>
          ))}
        </div>

        <section className="pr-block">
          <div className="pr-head">
            <div>
              <div className="pr-head-title">
                Incident Archive
              </div>
              <div className="pr-head-sub">
                {selectedLabel} · {visible.length} matching report
                {visible.length === 1 ? '' : 's'}
              </div>
            </div>

            <span className="pr-meta">
              Click a report to open full evidence and workflow.
            </span>
          </div>

          <div className="pr-list">
            <div className="pr-header">
              <span>Severity</span>
              <span>Feature</span>
              <span>Route</span>
              <span>Provider</span>
              <span>Status</span>
              <span>Last Seen</span>
            </div>

            {visible.map((item) => (
              <div
                className="pr-item"
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(
                    `/alerts/system-control/problems/${item.id}`
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    navigate(
                      `/alerts/system-control/problems/${item.id}`
                    )
                  }
                }}
              >
                <span
                  className={`pr-pill ${severityTone(
                    item.severity
                  )}`}
                >
                  {item.severity || 'info'}
                </span>

                <span className="pr-feature">
                  {item.feature || 'unknown'}
                </span>

                <span className="pr-route">
                  {item.source_route || 'UNKNOWN'}
                </span>

                <span>
                  {item.dependency || 'UNKNOWN'}
                </span>

                <span
                  className={`pr-pill ${statusTone(
                    item.status
                  )}`}
                >
                  {labelize(item.status || 'OPEN')}
                </span>

                <span>
                  {formatDate(item.last_seen_at)}
                </span>
              </div>
            ))}

            {!visible.length ? (
              <div className="pr-empty">
                No matching incident reports.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
