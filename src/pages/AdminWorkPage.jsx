import React, { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 50

const styles = `
  .work-page {
    display: grid;
    gap: 18px;
  }

  .work-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .work-tabs,
  .work-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .work-tab,
  .work-source,
  .work-refresh,
  .work-page-button {
    min-height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 13px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
  }

  .work-tab,
  .work-refresh,
  .work-page-button {
    cursor: pointer;
  }

  .work-tab.active {
    border-color: #C7D2FE;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .work-refresh:disabled,
  .work-page-button:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  .work-summary {
    padding: 14px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .work-list {
    display: grid;
    gap: 12px;
  }

  .work-card {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 14px;
    padding: 17px;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
  }

  .work-status-shape {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #FFFFFF;
    font-size: 22px;
    font-weight: 950;
  }

  .work-status-shape.active {
    background: #DC2626;
  }

  .work-status-shape.resolved {
    background: #2563EB;
  }

  .work-card-main {
    min-width: 0;
  }

  .work-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .work-endpoint {
    margin: 0;
    color: #0F172A;
    font-size: 15px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .work-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .work-badge {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 5px 8px;
    font-size: 10px;
    font-weight: 900;
  }

  .work-badge.active {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .work-badge.resolved {
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .work-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .work-meta-item {
    padding: 10px 12px;
    border-radius: 13px;
    background: #F8FAFC;
  }

  .work-meta-label {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .work-meta-value {
    margin-top: 4px;
    color: #334155;
    font-size: 11px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .work-empty,
  .work-error {
    padding: 40px 20px;
    border: 1px dashed #CBD5E1;
    border-radius: 20px;
    background: #FFFFFF;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 800;
  }

  .work-error {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .work-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .work-page-number {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
  }

  @media (max-width: 680px) {
    .work-card {
      grid-template-columns: 44px minmax(0, 1fr);
      padding: 14px;
    }

    .work-status-shape {
      width: 40px;
      height: 40px;
      border-radius: 13px;
    }

    .work-toolbar,
    .work-actions {
      align-items: stretch;
    }

    .work-source,
    .work-refresh {
      flex: 1;
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

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString()
}

function statusLabel(status) {
  return status === 'resolved' ? 'Resolved' : 'Active'
}

export default function AdminWorkPage() {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadIncidents = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    const params = new URLSearchParams({
      status,
      page: String(page),
      limit: String(PAGE_SIZE),
    })

    if (source) params.set('source', source)

    try {
      setLoading(true)
      setError('')

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

      setIncidents(Array.isArray(data.incidents) ? data.incidents : [])
      setPagination({
        page: Number(data.pagination?.page || page),
        limit: Number(data.pagination?.limit || PAGE_SIZE),
        total: Number(data.pagination?.total || 0),
        has_more: Boolean(data.pagination?.has_more),
      })
    } catch (loadError) {
      setIncidents([])
      setError(loadError?.message || 'Failed to load Work incidents')
    } finally {
      setLoading(false)
    }
  }, [page, source, status])

  useEffect(() => {
    loadIncidents()
  }, [loadIncidents])

  function changeStatus(nextStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  function changeSource(event) {
    setSource(event.target.value)
    setPage(1)
  }

  return (
    <AdminLayout
      title="Work"
      subtitle="Request loop incidents detected by Shadow Work Monitor."
    >
      <style>{styles}</style>

      <div className="work-page">
        <div className="work-toolbar">
          <div className="work-tabs">
            {[
              ['active', '✕ Active'],
              ['resolved', '✓ Resolved'],
              ['all', 'All'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`work-tab ${status === key ? 'active' : ''}`}
                onClick={() => changeStatus(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="work-actions">
            <select
              className="work-source"
              value={source}
              onChange={changeSource}
            >
              <option value="">All Sources</option>
              <option value="WEB">WEB</option>
              <option value="ADMIN">ADMIN</option>
              <option value="BACKEND">BACKEND</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>

            <button
              type="button"
              className="work-refresh"
              disabled={loading}
              onClick={loadIncidents}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="work-summary">
          {pagination.total} incident{pagination.total === 1 ? '' : 's'} · Page {pagination.page}
        </div>

        {error ? (
          <div className="work-error">{error}</div>
        ) : null}

        {!error && !loading && incidents.length === 0 ? (
          <div className="work-empty">
            {status === 'active'
              ? '✓ No active loop incident detected.'
              : 'No incident record in this filter.'}
          </div>
        ) : null}

        <div className="work-list">
          {incidents.map((incident) => {
            const resolved = incident.status === 'resolved'

            return (
              <article className="work-card" key={incident.id}>
                <div
                  className={`work-status-shape ${resolved ? 'resolved' : 'active'}`}
                  title={resolved ? 'Resolved' : 'Active'}
                >
                  {resolved ? '✓' : '✕'}
                </div>

                <div className="work-card-main">
                  <div className="work-card-head">
                    <div>
                      <h2 className="work-endpoint">
                        {incident.method} {incident.path}
                      </h2>

                      <div className="work-badges">
                        <span className={`work-badge ${resolved ? 'resolved' : 'active'}`}>
                          {statusLabel(incident.status)}
                        </span>
                        <span className="work-badge">{incident.source}</span>
                        {Number(incident.reopen_count || 0) > 0 ? (
                          <span className="work-badge">
                            Reopened {incident.reopen_count}×
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="work-meta">
                    <div className="work-meta-item">
                      <div className="work-meta-label">Peak</div>
                      <div className="work-meta-value">
                        {Number(incident.peak_requests_per_minute || 0).toLocaleString()} req/min
                      </div>
                    </div>

                    <div className="work-meta-item">
                      <div className="work-meta-label">First Detected</div>
                      <div className="work-meta-value">
                        {formatDate(incident.first_detected_at)}
                      </div>
                    </div>

                    <div className="work-meta-item">
                      <div className="work-meta-label">
                        {resolved ? 'Resolved' : 'Last Detected'}
                      </div>
                      <div className="work-meta-value">
                        {formatDate(
                          resolved
                            ? incident.resolved_at
                            : incident.last_detected_at
                        )}
                      </div>
                    </div>

                    <div className="work-meta-item">
                      <div className="work-meta-label">Occurrences</div>
                      <div className="work-meta-value">
                        {Number(incident.occurrence_count || 1)}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="work-pagination">
          <button
            type="button"
            className="work-page-button"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
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
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
