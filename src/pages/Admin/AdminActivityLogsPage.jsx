import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const LOGS_PER_PAGE = 20
const CACHE_TTL_MS = 60 * 1000
const ACTION_OPTIONS = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'SECURITY']
const DAY_OPTIONS = [7, 30, 90]

const styles = `
  .history-page {
    min-height: 100%;
    padding: 4px 0 28px;
  }

  .history-shell {
    max-width: 1440px;
    margin: 0 auto;
  }

  .history-heading-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .history-heading h2 {
    margin: 0;
    color: #0F172A;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .history-heading p {
    margin: 7px 0 0;
    color: #64748B;
    font-size: 13px;
    font-weight: 650;
  }

  .retention-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #DDD6FE;
    border-radius: 999px;
    background: #F5F3FF;
    color: #6D28D9;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .summary-card {
    min-height: 118px;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  .summary-card.total { background: linear-gradient(135deg, #FFFFFF, #F5F3FF); }
  .summary-card.security { background: linear-gradient(135deg, #FFFFFF, #EFF6FF); }
  .summary-card.payment { background: linear-gradient(135deg, #FFFFFF, #ECFDF5); }
  .summary-card.critical { background: linear-gradient(135deg, #FFFFFF, #FFF1F2); }

  .summary-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .summary-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 27px;
    font-weight: 950;
    line-height: 1;
  }

  .summary-note {
    margin-top: 9px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 700;
  }

  .filters-card {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 15px;
    margin-bottom: 16px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.035);
  }

  .filters-main {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 170px 170px auto;
    gap: 10px;
    align-items: center;
  }

  .history-search-wrap {
    display: flex;
    min-width: 0;
  }

  .history-search {
    width: 100%;
    min-width: 0;
    height: 42px;
    border: 1px solid #CBD5E1;
    border-right: 0;
    border-radius: 12px 0 0 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 13px;
    font: inherit;
    font-size: 13px;
    outline: none;
  }

  .history-search:focus {
    border-color: #8B5CF6;
    box-shadow: inset 0 0 0 1px #8B5CF6;
  }

  .search-btn,
  .refresh-btn {
    height: 42px;
    border: 0;
    background: #6D5DFB;
    color: #FFFFFF;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .search-btn {
    min-width: 76px;
    border-radius: 0 12px 12px 0;
  }

  .refresh-btn {
    min-width: 84px;
    border-radius: 12px;
  }

  .search-btn:disabled,
  .refresh-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .history-select {
    width: 100%;
    height: 42px;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 11px;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    outline: none;
  }

  .days-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .day-btn {
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  .day-btn.active {
    border-color: #8B5CF6;
    background: #F5F3FF;
    color: #6D28D9;
  }

  .history-table-card {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  .history-table-scroll {
    overflow-x: auto;
  }

  .history-head,
  .history-row {
    display: grid;
    grid-template-columns: 150px 120px 150px minmax(190px, 1fr) minmax(260px, 1.35fr) 145px;
    gap: 14px;
    align-items: center;
    min-width: 1040px;
  }

  .history-head {
    padding: 13px 18px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .35px;
    text-transform: uppercase;
  }

  .history-row {
    padding: 15px 18px;
    border-bottom: 1px solid #F1F5F9;
  }

  .history-row:last-child {
    border-bottom: 0;
  }

  .history-row:hover {
    background: #FCFCFF;
  }

  .actor {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .actor-avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 50%;
    background: #EDE9FE;
    color: #6D28D9;
    font-size: 12px;
    font-weight: 950;
  }

  .actor-name {
    overflow: hidden;
    color: #0F172A;
    font-size: 12.5px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    max-width: 100%;
    min-width: 78px;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 10.5px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .action-pill.create { background: #F3E8FF; color: #7E22CE; }
  .action-pill.update { background: #DBEAFE; color: #1D4ED8; }
  .action-pill.delete { background: #FEE2E2; color: #DC2626; }
  .action-pill.payment { background: #D1FAE5; color: #047857; }
  .action-pill.security { background: #EDE9FE; color: #6D28D9; }
  .action-pill.visibility { background: #FEF3C7; color: #B45309; }
  .action-pill.default { background: #F1F5F9; color: #475569; }

  .module-text,
  .target-text,
  .details-text {
    min-width: 0;
    color: #334155;
    font-size: 12.5px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .module-text {
    font-weight: 850;
  }

  .target-text {
    color: #0F172A;
    font-weight: 850;
  }

  .time-text {
    color: #64748B;
    font-size: 11.5px;
    line-height: 1.45;
    text-align: right;
  }

  .empty-state {
    padding: 46px 20px;
    color: #64748B;
    font-size: 13px;
    font-weight: 750;
    text-align: center;
  }

  .history-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 16px;
    border-top: 1px solid #E2E8F0;
    background: #FFFFFF;
  }

  .footer-note {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 700;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-btn {
    min-width: 38px;
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 11px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .page-btn.current {
    border-color: #8B5CF6;
    background: #8B5CF6;
    color: #FFFFFF;
  }

  .page-btn:disabled {
    opacity: .42;
    cursor: not-allowed;
  }

  .error-box {
    margin-bottom: 14px;
    border: 1px solid #FECACA;
    border-radius: 13px;
    background: #FEF2F2;
    color: #B91C1C;
    padding: 11px 13px;
    font-size: 12px;
    font-weight: 800;
  }

  @media (max-width: 1050px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filters-main {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 700px) {
    .history-heading-row {
      flex-direction: column;
    }

    .history-heading h2 {
      font-size: 25px;
    }

    .summary-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .summary-card {
      min-height: 104px;
      padding: 14px;
    }

    .summary-value {
      font-size: 23px;
    }

    .filters-main {
      grid-template-columns: 1fr;
    }

    .refresh-btn {
      width: 100%;
    }

    .history-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .pagination {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (max-width: 480px) {
    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function cacheKey({ page, action, actor, search, days }) {
  return `shadow_admin_history:${page}:${action}:${actor}:${search}:${days}`
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed.data || null
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    return
  }
}

function getActionClass(record) {
  const action = String(record?.action || '').toLowerCase()
  const section = String(record?.section_key || '').toLowerCase()

  if (action.includes('security') || section.includes('security') || section.includes('guard')) return 'security'
  if (action.includes('payment') || action.includes('payout') || action.includes('withdraw')) return 'payment'
  if (action.includes('delete') || action.includes('remove') || action.includes('hide')) return 'delete'
  if (action.includes('create') || action.includes('add')) return 'create'
  if (action.includes('update') || action.includes('edit') || action.includes('change')) return 'update'
  if (action.includes('visibility')) return 'visibility'
  return 'default'
}

function getActorInitial(name) {
  return String(name || 'A').trim().charAt(0).toUpperCase() || 'A'
}

function formatModule(value) {
  const clean = String(value || 'system').replace(/[_-]+/g, ' ').trim()
  return clean.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value) {
  if (!value) return { date: '-', time: '' }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: '-', time: '' }

  return {
    date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

function defaultSummary() {
  return {
    total: 0,
    security: 0,
    payment: 0,
    critical: 0,
  }
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [actors, setActors] = useState([])
  const [summary, setSummary] = useState(defaultSummary())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('ALL')
  const [actor, setActor] = useState('ALL')
  const [days, setDays] = useState(90)
  const [error, setError] = useState('')

  const applyResponse = useCallback((data, fallbackPage = 1) => {
    setLogs(Array.isArray(data?.records) ? data.records : [])
    setActors(Array.isArray(data?.actors) ? data.actors : [])
    setSummary(data?.summary || defaultSummary())
    setPage(Number(data?.page || fallbackPage))
    setTotalPages(Math.max(Number(data?.total_pages || data?.totalPages || 1), 1))
  }, [])

  const fetchLogs = useCallback(async ({
    nextPage = 1,
    nextAction = action,
    nextActor = actor,
    nextSearch = search,
    nextDays = days,
    force = false,
  } = {}) => {
    const request = {
      page: nextPage,
      action: nextAction,
      actor: nextActor,
      search: nextSearch,
      days: nextDays,
    }

    const key = cacheKey(request)

    if (!force) {
      const cached = readCache(key)
      if (cached) {
        applyResponse(cached, nextPage)
        setError('')
        return
      }
    }

    try {
      setLoading(true)
      setError('')

      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(LOGS_PER_PAGE),
        action: nextAction,
        actor: nextActor,
        search: nextSearch,
        days: String(nextDays),
      })

      if (force) params.set('refresh', '1')

      const response = await fetch(`${API_URL}/api/admin/activity-logs?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || 'Failed to load history')
      }

      writeCache(key, data)
      applyResponse(data, nextPage)
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [action, actor, search, days, applyResponse])

  useEffect(() => {
    fetchLogs({
      nextPage: 1,
      nextAction: action,
      nextActor: actor,
      nextSearch: search,
      nextDays: days,
    })
  }, [action, actor, search, days, fetchLogs])

  const visiblePages = useMemo(() => {
    const pages = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, start + 4)

    for (let value = start; value <= end; value += 1) {
      pages.push(value)
    }

    return pages
  }, [page, totalPages])

  const submitSearch = () => {
    const nextSearch = searchInput.trim()
    setPage(1)
    setSearch(nextSearch)
  }

  const changeAction = (event) => {
    setPage(1)
    setAction(event.target.value)
  }

  const changeActor = (event) => {
    setPage(1)
    setActor(event.target.value)
  }

  const changeDays = (value) => {
    setPage(1)
    setDays(value)
  }

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return

    fetchLogs({
      nextPage,
      nextAction: action,
      nextActor: actor,
      nextSearch: search,
      nextDays: days,
    })
  }

  const refresh = () => {
    fetchLogs({
      nextPage: page,
      nextAction: action,
      nextActor: actor,
      nextSearch: search,
      nextDays: days,
      force: true,
    })
  }

  return (
    <AdminLayout
      title="History"
      subtitle="Admin activity history"
    >
      <style>{styles}</style>

      <div className="history-page">
        <div className="history-shell">
          <div className="history-heading-row">
            <div className="history-heading">
              <h2>Admin History</h2>
              <p>Track recent admin activity without realtime polling.</p>
            </div>

            <div className="retention-pill">
              <span>◷</span>
              <span>Retention: 90 days</span>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card total">
              <div className="summary-label">Total Records</div>
              <div className="summary-value">{summary.total || 0}</div>
              <div className="summary-note">Selected period</div>
            </div>

            <div className="summary-card security">
              <div className="summary-label">Security Actions</div>
              <div className="summary-value">{summary.security || 0}</div>
              <div className="summary-note">Access and security activity</div>
            </div>

            <div className="summary-card payment">
              <div className="summary-label">Payment & Payout</div>
              <div className="summary-value">{summary.payment || 0}</div>
              <div className="summary-note">Financial admin activity</div>
            </div>

            <div className="summary-card critical">
              <div className="summary-label">Critical Changes</div>
              <div className="summary-value">{summary.critical || 0}</div>
              <div className="summary-note">Delete, security and payment changes</div>
            </div>
          </div>

          <div className="filters-card">
            <div className="filters-main">
              <div className="history-search-wrap">
                <input
                  className="history-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') submitSearch()
                  }}
                  placeholder="Search admin, action, target..."
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={submitSearch}
                  disabled={loading}
                >
                  Search
                </button>
              </div>

              <select className="history-select" value={actor} onChange={changeActor}>
                <option value="ALL">All Admins</option>
                {actors.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select className="history-select" value={action} onChange={changeAction}>
                {ACTION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item === 'ALL' ? 'All Actions' : item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="refresh-btn"
                onClick={refresh}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="days-row">
              {DAY_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`day-btn ${days === value ? 'active' : ''}`}
                  onClick={() => changeDays(value)}
                >
                  {value} Days
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <section className="history-table-card">
            <div className="history-table-scroll">
              <div className="history-head">
                <div>Admin</div>
                <div>Action</div>
                <div>Module</div>
                <div>Target</div>
                <div>Details</div>
                <div style={{ textAlign: 'right' }}>Time</div>
              </div>

              {loading && logs.length === 0 ? (
                <div className="empty-state">Loading history...</div>
              ) : logs.length === 0 ? (
                <div className="empty-state">No history found.</div>
              ) : (
                logs.map((record) => {
                  const actorName = record?.actor || 'Admin'
                  const time = formatDate(record?.created_at)

                  return (
                    <div className="history-row" key={record.id}>
                      <div className="actor">
                        <div className="actor-avatar">{getActorInitial(actorName)}</div>
                        <div className="actor-name" title={actorName}>{actorName}</div>
                      </div>

                      <div>
                        <span className={`action-pill ${getActionClass(record)}`}>
                          {record?.action || 'LOG'}
                        </span>
                      </div>

                      <div className="module-text">
                        {formatModule(record?.section_key)}
                      </div>

                      <div className="target-text">
                        {record?.slide_title || 'System activity'}
                      </div>

                      <div className="details-text">
                        {record?.details || '—'}
                      </div>

                      <div className="time-text">
                        <div>{time.time}</div>
                        <div>{time.date}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="history-footer">
              <div className="footer-note">
                20 records per page · Loaded on demand
              </div>

              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(page - 1)}
                >
                  ‹
                </button>

                {visiblePages.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`page-btn ${value === page ? 'current' : ''}`}
                    disabled={loading}
                    onClick={() => goToPage(value)}
                  >
                    {value}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-btn"
                  disabled={page >= totalPages || loading}
                  onClick={() => goToPage(page + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
