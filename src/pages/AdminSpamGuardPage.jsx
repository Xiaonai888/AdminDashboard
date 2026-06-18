import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token')
    || localStorage.getItem('shadow_admin_token')
    || ''
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDateTime(value) {
  if (!value) return '-'

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0))

  if (total >= 86400) return `${Math.ceil(total / 86400)} day`
  if (total >= 3600) return `${Math.ceil(total / 3600)} hour`
  if (total >= 60) return `${Math.ceil(total / 60)} min`

  return `${total} sec`
}

function normalizeScope(value) {
  const scope = String(value || '').toLowerCase()

  if (scope === 'visitor_tracking') return 'Visitor Tracking'
  if (scope === 'account_access') return 'Account Access'
  if (scope === 'reader_actions') return 'Reader Actions'
  if (scope === 'payment_actions') return 'Payment Actions'

  return value || 'Global'
}

function scopeClass(value) {
  const scope = String(value || '').toLowerCase()

  if (scope === 'visitor_tracking') return 'visitor'
  if (scope === 'account_access') return 'account'
  if (scope === 'reader_actions') return 'reader'
  if (scope === 'payment_actions') return 'payment'

  return 'global'
}

function scoreClass(value) {
  const score = Number(value || 0)

  if (score >= 90) return 'danger'
  if (score >= 70) return 'warning'
  if (score >= 50) return 'watch'

  return 'normal'
}

async function readApiResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(
      [data.message, data.error].filter(Boolean).join(' — ')
      || `Request failed (${response.status})`
    )
  }

  return data
}

async function apiRequest(path, options = {}) {
  const token = getAdminToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  return readApiResponse(response)
}

function SummaryCard({ label, value, note, tone }) {
  return (
    <div className={`spam-summary-card ${tone}`}>
      <div className="spam-summary-label">{label}</div>
      <div className="spam-summary-value">{formatNumber(value)}</div>
      <div className="spam-summary-note">{note}</div>
    </div>
  )
}

function StatusBadge({ state }) {
  return state.is_in_cooldown ? (
    <span className="spam-status-badge cooldown">In Cooldown</span>
  ) : (
    <span className="spam-status-badge allowed">Allowed</span>
  )
}

function ScopeBadge({ value }) {
  return (
    <span className={`spam-scope-badge ${scopeClass(value)}`}>
      {normalizeScope(value)}
    </span>
  )
}

function ScoreBadge({ value }) {
  return (
    <span className={`spam-score-badge ${scoreClass(value)}`}>
      {Number(value || 0)}/100
    </span>
  )
}

function DetailDrawer({ item, type, onClose, onRelease, releasing }) {
  if (!item) return null

  const isState = type === 'states'

  return (
    <div className="spam-drawer-layer" onMouseDown={onClose}>
      <aside
        className="spam-drawer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="spam-drawer-header">
          <div>
            <div className="spam-drawer-kicker">
              {isState ? 'Spam Guard State' : 'Spam Guard Event'}
            </div>
            <h3>{isState ? 'Request protection details' : 'Cooldown event details'}</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="spam-drawer-badges">
          <ScopeBadge value={item.scope} />
          <ScoreBadge value={item.spam_score} />
          {isState ? <StatusBadge state={item} /> : (
            <span className="spam-status-badge event">{item.action || 'Event'}</span>
          )}
        </div>

        <div className="spam-detail-grid">
          <div>
            <span>Guard Key</span>
            <strong>{item.guard_key || '-'}</strong>
          </div>
          <div>
            <span>IP Address</span>
            <strong>{item.ip_address || '-'}</strong>
          </div>
          <div>
            <span>Visitor ID</span>
            <strong>{item.visitor_id || '-'}</strong>
          </div>
          <div>
            <span>Account ID</span>
            <strong>{item.account_id || '-'}</strong>
          </div>
          <div>
            <span>Request Count</span>
            <strong>{formatNumber(item.request_count)}</strong>
          </div>
          <div>
            <span>Offense Count</span>
            <strong>{formatNumber(item.offense_count)}</strong>
          </div>
          <div>
            <span>Spam Score</span>
            <strong>{Number(item.spam_score || 0)}/100</strong>
          </div>
          <div>
            <span>Cooldown Until</span>
            <strong>{formatDateTime(item.cooldown_until)}</strong>
          </div>
          <div>
            <span>Endpoint</span>
            <strong>{item.last_endpoint || item.endpoint || '-'}</strong>
          </div>
          <div>
            <span>Method</span>
            <strong>{item.last_method || item.method || '-'}</strong>
          </div>
          <div>
            <span>First Seen</span>
            <strong>{formatDateTime(item.first_seen_at || item.created_at)}</strong>
          </div>
          <div>
            <span>Last Seen</span>
            <strong>{formatDateTime(item.last_seen_at || item.occurred_at)}</strong>
          </div>
        </div>

        <div className="spam-reason-box">
          <span>Reason</span>
          <p>{item.last_reason || item.reason || 'No reason recorded.'}</p>
        </div>

        {isState && item.is_in_cooldown ? (
          <button
            type="button"
            className="spam-release-main"
            onClick={() => onRelease(item)}
            disabled={releasing}
          >
            {releasing ? 'Releasing...' : 'Release Temporary Cooldown'}
          </button>
        ) : null}
      </aside>
    </div>
  )
}

export default function AdminSpamGuardPage() {
  const [activeTab, setActiveTab] = useState('states')
  const [summary, setSummary] = useState({
    total_tracked: 0,
    active_cooldowns: 0,
    offenses_today: 0,
    high_spam_score: 0,
    visitor_tracking_cooldowns: 0,
    account_access_cooldowns: 0,
    reader_action_cooldowns: 0,
    payment_cooldowns: 0,
  })
  const [states, setStates] = useState([])
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [scope, setScope] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [releasing, setReleasing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadOverview() {
      try {
        setSummaryLoading(true)
        const data = await apiRequest('/api/admin/spam-guard/overview')

        if (!alive) return
        setSummary(data.summary || {})
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load Spam Guard overview')
      } finally {
        if (alive) setSummaryLoading(false)
      }
    }

    loadOverview()

    return () => {
      alive = false
    }
  }, [refreshKey])

  useEffect(() => {
    let alive = true

    async function loadList() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          page: String(page),
          limit: '20',
        })

        if (scope) params.set('scope', scope)
        if (debouncedSearch) params.set('q', debouncedSearch)

        if (activeTab === 'states') {
          params.set('filter', filter)
        } else if (filter !== 'all') {
          params.set('action', filter)
        }

        const endpoint =
          activeTab === 'states'
            ? '/api/admin/spam-guard/states'
            : '/api/admin/spam-guard/events'

        const data = await apiRequest(`${endpoint}?${params.toString()}`)

        if (!alive) return

        if (activeTab === 'states') {
          setStates(Array.isArray(data.states) ? data.states : [])
        } else {
          setEvents(Array.isArray(data.events) ? data.events : [])
        }

        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load Spam Guard data')
        setStates([])
        setEvents([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadList()

    return () => {
      alive = false
    }
  }, [
    activeTab,
    page,
    filter,
    scope,
    debouncedSearch,
    refreshKey,
  ])

  const currentRows = activeTab === 'states' ? states : events

  const stateFilters = [
    { key: 'all', label: 'All' },
    { key: 'cooldown', label: 'In Cooldown' },
    { key: 'released', label: 'Allowed' },
    { key: 'high_score', label: 'High Score' },
    { key: 'repeat_offender', label: 'Repeat Offender' },
  ]

  const eventFilters = [
    { key: 'all', label: 'All Events' },
    { key: 'cooldown_started', label: 'Cooldown Started' },
    { key: 'cooldown_released', label: 'Cooldown Released' },
  ]

  const currentFilters =
    activeTab === 'states' ? stateFilters : eventFilters

  const quickScopeStats = useMemo(() => [
    {
      label: 'Visitor Tracking',
      value: summary.visitor_tracking_cooldowns,
    },
    {
      label: 'Account Access',
      value: summary.account_access_cooldowns,
    },
    {
      label: 'Reader Actions',
      value: summary.reader_action_cooldowns,
    },
    {
      label: 'Payment Actions',
      value: summary.payment_cooldowns,
    },
  ], [summary])

  async function releaseCooldown(item) {
    const confirmed = window.confirm(
      'Release this temporary cooldown now?'
    )

    if (!confirmed) return

    try {
      setReleasing(true)
      setError('')

      await apiRequest(
        `/api/admin/spam-guard/states/${item.id}/release`,
        {
          method: 'PATCH',
          body: JSON.stringify({}),
        }
      )

      setSelectedItem(null)
      setRefreshKey((current) => current + 1)
    } catch (err) {
      setError(err.message || 'Failed to release cooldown')
    } finally {
      setReleasing(false)
    }
  }

  function changeTab(tab) {
    setActiveTab(tab)
    setFilter('all')
    setScope('')
    setSearch('')
    setPage(1)
    setSelectedItem(null)
  }

  return (
    <AdminLayout
      title="Spam Guard"
      subtitle="Monitor request volume, temporary cooldowns, and repeat offenders."
    >
      <style>{styles}</style>

      <div className="spam-page">
        <section className="spam-hero">
          <div>
            <div className="spam-kicker">Persistent Protection</div>
            <h2>Spam Guard monitoring</h2>
            <p>
              Request counters are stored in Supabase and remain active after
              Backend restarts or deployments.
            </p>
          </div>

          <button
            type="button"
            className="spam-refresh"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Refresh
          </button>
        </section>

        <section className="spam-summary-grid">
          <SummaryCard
            label="Tracked Identities"
            value={summaryLoading ? '...' : summary.total_tracked}
            note="IP, visitor, or account keys"
            tone="blue"
          />
          <SummaryCard
            label="Active Cooldowns"
            value={summaryLoading ? '...' : summary.active_cooldowns}
            note="Blocked temporarily now"
            tone="red"
          />
          <SummaryCard
            label="Offenses Today"
            value={summaryLoading ? '...' : summary.offenses_today}
            note="Cooldown events today"
            tone="purple"
          />
          <SummaryCard
            label="High Spam Score"
            value={summaryLoading ? '...' : summary.high_spam_score}
            note="Score 90 or higher"
            tone="orange"
          />
        </section>

        <section className="spam-scope-grid">
          {quickScopeStats.map((item) => (
            <div className="spam-scope-stat" key={item.label}>
              <span>{item.label}</span>
              <strong>{formatNumber(item.value)}</strong>
            </div>
          ))}
        </section>

        <section className="spam-panel">
          <div className="spam-panel-top">
            <div className="spam-tabs">
              <button
                type="button"
                className={activeTab === 'states' ? 'active' : ''}
                onClick={() => changeTab('states')}
              >
                Current States
              </button>
              <button
                type="button"
                className={activeTab === 'events' ? 'active' : ''}
                onClick={() => changeTab('events')}
              >
                Event History
              </button>
            </div>

            <div className="spam-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search IP, visitor ID, account ID, endpoint..."
              />
            </div>
          </div>

          <div className="spam-controls">
            <select
              value={scope}
              onChange={(event) => {
                setScope(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Scopes</option>
              <option value="visitor_tracking">Visitor Tracking</option>
              <option value="account_access">Account Access</option>
              <option value="reader_actions">Reader Actions</option>
              <option value="payment_actions">Payment Actions</option>
            </select>

            <div className="spam-filters">
              {currentFilters.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className={filter === item.key ? 'active' : ''}
                  onClick={() => {
                    setFilter(item.key)
                    setPage(1)
                    setSelectedItem(null)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="spam-alert">
              <strong>API error:</strong> {error}
            </div>
          ) : null}

          <div className="spam-table-wrap">
            <table className="spam-table">
              <thead>
                {activeTab === 'states' ? (
                  <tr>
                    <th>Identity</th>
                    <th>Scope</th>
                    <th>Requests</th>
                    <th>Offenses</th>
                    <th>Score</th>
                    <th>Cooldown Until</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Identity</th>
                    <th>Scope</th>
                    <th>Action</th>
                    <th>Requests</th>
                    <th>Offenses</th>
                    <th>Cooldown Until</th>
                    <th>Occurred</th>
                    <th>Action</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">
                      <div className="spam-loading">
                        Loading Spam Guard data...
                      </div>
                    </td>
                  </tr>
                ) : currentRows.length ? (
                  currentRows.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                    >
                      <td>
                        <div className="spam-identity">
                          <strong>{item.ip_address || item.guard_key || '-'}</strong>
                          <span>
                            {item.account_id
                              ? `Account: ${item.account_id}`
                              : item.visitor_id
                                ? `Visitor: ${item.visitor_id}`
                                : item.guard_key || '-'}
                          </span>
                        </div>
                      </td>
                      <td><ScopeBadge value={item.scope} /></td>
                      {activeTab === 'states' ? (
                        <>
                          <td>{formatNumber(item.request_count)}</td>
                          <td>{formatNumber(item.offense_count)}</td>
                          <td><ScoreBadge value={item.spam_score} /></td>
                          <td>{formatDateTime(item.cooldown_until)}</td>
                          <td><StatusBadge state={item} /></td>
                          <td>
                            <div className="spam-actions">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedItem(item)
                                }}
                              >
                                View
                              </button>
                              {item.is_in_cooldown ? (
                                <button
                                  type="button"
                                  className="release"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    releaseCooldown(item)
                                  }}
                                >
                                  Release
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <span className="spam-event-badge">
                              {item.action || '-'}
                            </span>
                          </td>
                          <td>{formatNumber(item.request_count)}</td>
                          <td>{formatNumber(item.offense_count)}</td>
                          <td>{formatDateTime(item.cooldown_until)}</td>
                          <td>{formatDateTime(item.occurred_at)}</td>
                          <td>
                            <button
                              type="button"
                              className="spam-view-button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedItem(item)
                              }}
                            >
                              View
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="spam-empty">
                        <strong>No Spam Guard data found</strong>
                        <span>
                          Data appears after protected API requests reach the Backend.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="spam-pagination">
            <button
              type="button"
              disabled={!pagination.has_prev || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.total_pages}
              {' · '}
              {formatNumber(pagination.total)} records
            </span>
            <button
              type="button"
              disabled={!pagination.has_next || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      <DetailDrawer
        item={selectedItem}
        type={activeTab}
        onClose={() => setSelectedItem(null)}
        onRelease={releaseCooldown}
        releasing={releasing}
      />
    </AdminLayout>
  )
}

const styles = `
  .spam-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .spam-hero {
    background: linear-gradient(135deg, #FFFFFF, #F8FAFF);
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.045);
  }

  .spam-kicker {
    color: #4F46E5;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-bottom: 8px;
  }

  .spam-hero h2 {
    margin: 0;
    color: #0F172A;
    font-size: 25px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .spam-hero p {
    margin: 8px 0 0;
    color: #64748B;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.55;
  }

  .spam-refresh {
    height: 40px;
    border: 0;
    border-radius: 13px;
    background: #4F46E5;
    color: #FFFFFF;
    padding: 0 18px;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .spam-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .spam-summary-card {
    min-height: 126px;
    border-radius: 18px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  }

  .spam-summary-card.blue { border-top: 4px solid #2563EB; }
  .spam-summary-card.red { border-top: 4px solid #DC2626; }
  .spam-summary-card.purple { border-top: 4px solid #7C3AED; }
  .spam-summary-card.orange { border-top: 4px solid #EA580C; }

  .spam-summary-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 900;
  }

  .spam-summary-value {
    margin-top: 8px;
    color: #0F172A;
    font-size: 29px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .spam-summary-note {
    margin-top: 10px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 750;
  }

  .spam-scope-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .spam-scope-stat {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    min-height: 62px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .spam-scope-stat span {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
  }

  .spam-scope-stat strong {
    color: #0F172A;
    font-size: 19px;
    font-weight: 950;
  }

  .spam-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.045);
  }

  .spam-panel-top {
    padding: 16px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .spam-tabs {
    background: #F8FAFC;
    border: 1px solid #D8E2EF;
    border-radius: 15px;
    padding: 4px;
    display: flex;
    gap: 4px;
  }

  .spam-tabs button {
    border: 0;
    background: transparent;
    height: 36px;
    border-radius: 12px;
    padding: 0 17px;
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .spam-tabs button.active {
    background: #4F46E5;
    color: #FFFFFF;
  }

  .spam-search {
    width: min(500px, 100%);
    height: 42px;
    border: 1px solid #D8E2EF;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 13px;
    color: #94A3B8;
  }

  .spam-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
  }

  .spam-controls {
    padding: 12px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .spam-controls select {
    height: 34px;
    border: 1px solid #D8E2EF;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 0 12px;
    color: #334155;
    font-size: 12px;
    font-weight: 850;
  }

  .spam-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .spam-filters button {
    height: 32px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    padding: 0 12px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-filters button.active {
    border-color: #4F46E5;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .spam-alert {
    margin: 15px;
    padding: 13px 15px;
    border-radius: 14px;
    background: #FEF2F2;
    color: #DC2626;
    font-size: 12px;
    font-weight: 850;
  }

  .spam-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .spam-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1180px;
  }

  .spam-table th {
    text-align: left;
    padding: 13px 15px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid #E2E8F0;
  }

  .spam-table td {
    padding: 14px 15px;
    border-bottom: 1px solid #EEF2F7;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    vertical-align: middle;
  }

  .spam-table tbody tr {
    cursor: pointer;
  }

  .spam-table tbody tr:hover {
    background: #F8FAFC;
  }

  .spam-identity {
    min-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .spam-identity strong {
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
    word-break: break-all;
  }

  .spam-identity span {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
    word-break: break-all;
  }

  .spam-scope-badge,
  .spam-score-badge,
  .spam-status-badge,
  .spam-event-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    border-radius: 999px;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 950;
    white-space: nowrap;
  }

  .spam-scope-badge.visitor { background: #EFF6FF; color: #2563EB; }
  .spam-scope-badge.account { background: #F5F3FF; color: #7C3AED; }
  .spam-scope-badge.reader { background: #ECFDF5; color: #059669; }
  .spam-scope-badge.payment { background: #FFF7ED; color: #EA580C; }
  .spam-scope-badge.global { background: #F1F5F9; color: #475569; }

  .spam-score-badge.normal { background: #ECFDF5; color: #059669; }
  .spam-score-badge.watch { background: #FFFBEB; color: #D97706; }
  .spam-score-badge.warning { background: #FFF7ED; color: #EA580C; }
  .spam-score-badge.danger { background: #FEF2F2; color: #DC2626; }

  .spam-status-badge.allowed { background: #ECFDF5; color: #059669; }
  .spam-status-badge.cooldown { background: #FEF2F2; color: #DC2626; }
  .spam-status-badge.event,
  .spam-event-badge { background: #EEF2FF; color: #4F46E5; }

  .spam-actions {
    display: flex;
    gap: 7px;
  }

  .spam-actions button,
  .spam-view-button {
    height: 30px;
    border: 1px solid #D8E2EF;
    border-radius: 9px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-actions button.release {
    border-color: #FCA5A5;
    color: #DC2626;
    background: #FEF2F2;
  }

  .spam-loading,
  .spam-empty {
    min-height: 170px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 7px;
    color: #64748B;
  }

  .spam-empty strong {
    color: #0F172A;
    font-size: 14px;
  }

  .spam-empty span {
    font-size: 11px;
  }

  .spam-pagination {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .spam-pagination button {
    height: 34px;
    border: 1px solid #D8E2EF;
    border-radius: 11px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 14px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-pagination button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .spam-pagination span {
    color: #64748B;
    font-size: 11px;
    font-weight: 850;
  }

  .spam-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.32);
    display: flex;
    justify-content: flex-end;
  }

  .spam-drawer {
    width: min(560px, 100%);
    height: 100%;
    background: #FFFFFF;
    padding: 22px;
    overflow-y: auto;
    box-shadow: -14px 0 40px rgba(15, 23, 42, 0.18);
  }

  .spam-drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E2E8F0;
  }

  .spam-drawer-kicker {
    color: #4F46E5;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .spam-drawer-header h3 {
    margin: 6px 0 0;
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .spam-drawer-header button {
    width: 34px;
    height: 34px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    font-size: 20px;
    cursor: pointer;
  }

  .spam-drawer-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 18px 0;
  }

  .spam-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .spam-detail-grid > div {
    min-height: 75px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    padding: 11px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .spam-detail-grid span,
  .spam-reason-box span {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .spam-detail-grid strong {
    color: #0F172A;
    font-size: 11px;
    line-height: 1.45;
    word-break: break-all;
  }

  .spam-reason-box {
    margin-top: 12px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    padding: 13px;
  }

  .spam-reason-box p {
    margin: 7px 0 0;
    color: #334155;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.6;
  }

  .spam-release-main {
    width: 100%;
    height: 42px;
    margin-top: 14px;
    border: 0;
    border-radius: 13px;
    background: #DC2626;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .spam-release-main:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media (max-width: 1050px) {
    .spam-summary-grid,
    .spam-scope-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 650px) {
    .spam-hero {
      align-items: flex-start;
      flex-direction: column;
    }

    .spam-summary-grid,
    .spam-scope-grid,
    .spam-detail-grid {
      grid-template-columns: 1fr;
    }

    .spam-panel-top {
      align-items: stretch;
      flex-direction: column;
    }

    .spam-search {
      width: 100%;
    }

    .spam-pagination {
      flex-direction: column;
    }
  }
`
