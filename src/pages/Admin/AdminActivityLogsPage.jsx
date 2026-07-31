import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const LOGS_PER_PAGE = 20
const ADMIN_DISPLAY_NAME = 'Xiaonai Xiao'
const ADMIN_ROLE = 'Owner'
const FILTERS = ['ALL', 'CREATE', 'UPDATE', 'VISIBILITY', 'DELETE', 'PAYMENT', 'GENRE', 'COMMENT']

const styles = `
  .logs-page {
    min-height: 100%;
    background: radial-gradient(circle at top right, rgba(79, 70, 229, .08), transparent 28%), #F8FAFC;
    padding: 28px;
    border-radius: 24px;
  }

  .logs-shell {
    max-width: 1180px;
    margin: 0 auto;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
  }

  .page-title h1 {
    margin: 0;
    color: #0F172A;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -.04em;
    line-height: 1.15;
  }

  .page-title p {
    margin-top: 7px;
    color: #64748B;
    font-size: 14px;
  }

  .back-btn,
  .black-btn {
    border: 0;
    border-radius: 13px;
    background: #000000;
    color: #FFFFFF;
    padding: 12px 16px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 12px 26px rgba(0, 0, 0, .16);
    transition: transform .15s ease, opacity .15s ease;
  }

  .back-btn:hover,
  .black-btn:hover {
    opacity: .9;
    transform: translateY(-1px);
  }

  .black-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
    transform: none;
  }

  .tools-card {
    margin-bottom: 18px;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, .06);
  }

  .tools-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: center;
  }

  .search-box {
    width: 100%;
    border: 1px solid #CBD5E1;
    border-radius: 15px;
    background: #F8FAFC;
    color: #0F172A;
    padding: 14px 15px;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .search-box:focus {
    border-color: #111827;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(15, 23, 42, .08);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .filter-btn {
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #475569;
    padding: 10px 13px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease;
  }

  .filter-btn:hover {
    background: #F8FAFC;
  }

  .filter-btn.active {
    border-color: #000000;
    background: #000000;
    color: #FFFFFF;
  }

  .logs-card {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 10px 30px rgba(15, 23, 42, .06);
  }

  .logs-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 20px 22px;
    border-bottom: 1px solid #E2E8F0;
  }

  .logs-card-header h2 {
    margin: 0;
    color: #0F172A;
    font-size: 17px;
    font-weight: 900;
  }

  .logs-card-header p {
    margin-top: 4px;
    color: #64748B;
    font-size: 12.5px;
  }

  .count-pill {
    border-radius: 999px;
    background: #F1F5F9;
    color: #334155;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .table-head {
    display: grid;
    grid-template-columns: 150px minmax(280px, 1fr) 180px 190px;
    gap: 16px;
    align-items: center;
    padding: 12px 22px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .55px;
    text-transform: uppercase;
  }

  .log-row {
    display: grid;
    grid-template-columns: 150px minmax(280px, 1fr) 180px 190px;
    gap: 16px;
    align-items: center;
    padding: 17px 22px;
    border-bottom: 1px solid #F1F5F9;
    transition: background .15s ease;
  }

  .log-row:last-child {
    border-bottom: 0;
  }

  .log-row:hover {
    background: #FAFBFF;
  }

  .action-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    min-width: 94px;
    border-radius: 999px;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .35px;
    text-transform: uppercase;
  }

  .action-pill.create { background: #D1FAE5; color: #047857; }
  .action-pill.update { background: #EEF2FF; color: #4F46E5; }
  .action-pill.visibility { background: #FEF3C7; color: #B45309; }
  .action-pill.delete { background: #FEE2E2; color: #DC2626; }
  .action-pill.payment { background: #E0F2FE; color: #0369A1; }
  .action-pill.genre { background: #F3E8FF; color: #7E22CE; }
  .action-pill.comment { background: #F1F5F9; color: #334155; }
  .action-pill.default { background: #F1F5F9; color: #475569; }

  .activity-main strong {
    display: block;
    margin-bottom: 5px;
    color: #0F172A;
    font-size: 14px;
  }

  .activity-main span {
    display: block;
    color: #475569;
    font-size: 13px;
    line-height: 1.45;
  }

  .actor-box {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .actor-avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #111827, #4F46E5);
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 900;
  }

  .actor-name {
    overflow: hidden;
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-role {
    margin-top: 2px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 700;
  }

  .time {
    color: #64748B;
    font-size: 12px;
    line-height: 1.45;
    text-align: right;
  }

  .empty-state {
    padding: 34px 20px;
    color: #64748B;
    font-size: 14px;
    text-align: center;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #E2E8F0;
  }

  .page-btn {
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 10px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .page-btn.primary {
    border-color: #000000;
    background: #000000;
    color: #FFFFFF;
  }

  .page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .page-info {
    color: #475569;
    font-size: 12px;
    font-weight: 900;
  }

  @media (max-width: 980px) {
    .logs-page,
    .logs-shell {
      min-width: 0;
    }

    .logs-page {
      padding: 18px;
    }

    .top-row,
    .tools-grid,
    .logs-card-header {
      align-items: flex-start;
      grid-template-columns: 1fr;
    }

    .top-row,
    .logs-card-header {
      flex-direction: column;
    }

    .top-row > div,
    .logs-card-header > div {
      min-width: 0;
    }

    .page-title h1 {
      overflow-wrap: anywhere;
    }

    .page-title p,
    .logs-card-header p,
    .activity-main strong,
    .activity-main span,
    .time,
    .empty-state,
    .page-info {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .black-btn,
    .back-btn {
      width: 100%;
      min-width: 0;
    }

    .search-box {
      min-width: 0;
      box-sizing: border-box;
    }

    .filter-row {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .filter-row::-webkit-scrollbar {
      display: none;
    }

    .filter-btn {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .logs-card {
      min-width: 0;
    }

    .count-pill {
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .table-head {
      display: none;
    }

    .log-row {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .log-row > div {
      min-width: 0;
    }

    .actor-name {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .time {
      text-align: left;
    }

    .footer-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      justify-content: stretch;
    }

    .page-btn {
      width: 100%;
      min-width: 0;
      min-height: 40px;
    }

    .page-info {
      align-self: center;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .logs-page {
      padding: 14px;
      border-radius: 20px;
    }

    .page-title h1 {
      font-size: 24px;
    }

    .tools-card,
    .logs-card {
      border-radius: 18px;
    }

    .tools-card {
      padding: 14px;
    }

    .logs-card-header,
    .log-row {
      padding-left: 15px;
      padding-right: 15px;
    }

    .action-pill {
      max-width: 100%;
      min-width: 0;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .footer-row {
      grid-template-columns: 1fr;
      padding: 14px 15px;
    }

    .page-info {
      order: -1;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function getActionClass(record) {
  const action = String(record?.action || '').toLowerCase()
  const section = String(record?.section_key || '').toLowerCase()

  if (action.includes('payment')) return 'payment'
  if (section.includes('genre')) return 'genre'
  if (section === 'comments') return 'comment'
  if (action === 'create') return 'create'
  if (action === 'update') return 'update'
  if (action === 'delete') return 'delete'
  if (action === 'visibility') return 'visibility'

  return 'default'
}

function getActorInitial(name) {
  const cleanName = String(name || ADMIN_DISPLAY_NAME).trim()
  return cleanName.charAt(0).toUpperCase() || 'A'
}

function getDisplayActorName(actor) {
  if (!actor || actor === 'Admin') return ADMIN_DISPLAY_NAME
  return actor
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function formatMainTitle(record) {
  return record?.slide_title || (record?.order_index ? `Slide ${record.order_index}` : 'System activity')
}

export default function AdminActivityLogsPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const fetchLogs = async (
    nextPage = page,
    nextAction = actionFilter,
    nextSearch = searchText
  ) => {
    try {
      setLoading(true)

      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(LOGS_PER_PAGE),
        action: nextAction,
        search: nextSearch,
      })

      const response = await fetch(
        `${API_URL}/api/admin/activity-logs?${params.toString()}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-Admin-Name': ADMIN_DISPLAY_NAME,
          },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load logs')
      }

      setLogs(data.records || [])
      setPage(data.page || nextPage)
      setTotalPages(data.total_pages || data.totalPages || 1)
      setTotal(data.total || 0)
    } catch {
      setLogs([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1, actionFilter, searchText)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLogs(1, actionFilter, searchText)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchText, actionFilter])

  return (
    <AdminLayout
      title="Admin Activity Logs"
      subtitle="View actions across content, payments, moderation, and system activity."
    >
      <style>{styles}</style>

      <div className="logs-page">
        <div className="logs-shell">
          <div className="top-row">
            <div className="page-title">
              <h1>Admin Activity Logs</h1>
              <p>
                View admin actions across slides, comments, genres, payments, and recent
                system activity.
              </p>
            </div>

            <button
              className="back-btn"
              type="button"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <section className="tools-card">
            <div className="tools-grid">
              <input
                className="search-box"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search action, title, payment order, Trx ID, actor, or detail..."
              />

              <button
                className="black-btn"
                type="button"
                onClick={() => fetchLogs(page, actionFilter, searchText)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="filter-row">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-btn ${actionFilter === item ? 'active' : ''}`}
                  onClick={() => {
                    setActionFilter(item)
                    setPage(1)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="logs-card">
            <div className="logs-card-header">
              <div>
                <h2>All Logs</h2>
                <p>
                  Showing {logs.length} record(s). Full history is paginated by 20
                  records per page.
                </p>
              </div>

              <div className="count-pill">{total} total</div>
            </div>

            <div className="table-head">
              <div>Action</div>
              <div>Activity</div>
              <div>Actor</div>
              <div style={{ textAlign: 'right' }}>Time</div>
            </div>

            <div className="log-table">
              {loading ? (
                <div className="empty-state">Loading admin activity logs...</div>
              ) : logs.length === 0 ? (
                <div className="empty-state">No logs found.</div>
              ) : (
                logs.map((log) => {
                  const actorName = getDisplayActorName(log.actor)

                  return (
                    <div className="log-row" key={log.id}>
                      <div>
                        <span className={`action-pill ${getActionClass(log)}`}>
                          {log.action || 'LOG'}
                        </span>
                      </div>

                      <div className="activity-main">
                        <strong>{formatMainTitle(log)}</strong>
                        <span>{log.details || 'No detail'}</span>
                      </div>

                      <div className="actor-box">
                        <div className="actor-avatar">
                          {getActorInitial(actorName)}
                        </div>
                        <div>
                          <div className="actor-name">{actorName}</div>
                          <div className="actor-role">{ADMIN_ROLE}</div>
                        </div>
                      </div>

                      <div className="time">{formatTime(log.created_at)}</div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="footer-row">
              <button
                className="page-btn"
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchLogs(page - 1, actionFilter, searchText)}
              >
                Previous
              </button>

              <span className="page-info">
                Page {page} / {totalPages}
              </span>

              <button
                className="page-btn primary"
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => fetchLogs(page + 1, actionFilter, searchText)}
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
