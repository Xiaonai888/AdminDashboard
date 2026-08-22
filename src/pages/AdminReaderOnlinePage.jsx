import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const TIME_ZONE = 'Asia/Phnom_Penh'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDateOnly(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '-'
  return `${match[2]}/${match[3]}/${match[1]}`
}

function formatDuration(value) {
  const minutes = Math.max(0, Number(value || 0))

  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.floor(minutes)} min`

  const hours = Math.floor(minutes / 60)
  const rest = Math.floor(minutes % 60)

  if (!rest) return `${hours}h`
  return `${hours}h ${rest}m`
}

function formatRelativeTime(value) {
  if (!value) return 'Never'

  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return 'Never'

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

function formatGender(gender, customGender) {
  const value = String(gender || '').toLowerCase()

  if (value === 'female') return 'Female'
  if (value === 'male') return 'Male'
  if (value === 'custom') return customGender || 'Custom'

  return 'Not provided'
}

function getInitial(item) {
  return String(item?.name || item?.username || 'R').trim().slice(0, 1).toUpperCase()
}

function getDeviceLabel(userAgent) {
  const value = String(userAgent || '')

  if (!value) return 'Unknown'
  if (/ipad|tablet/i.test(value)) return 'Tablet'
  if (/iphone|android.+mobile|mobile/i.test(value)) return 'Mobile'

  return 'Desktop'
}

function getBrowserLabel(userAgent) {
  const value = String(userAgent || '')

  if (!value) return 'Unknown'
  if (/edg\//i.test(value)) return 'Edge'
  if (/opr\//i.test(value)) return 'Opera'
  if (/chrome\//i.test(value) && !/edg\//i.test(value)) return 'Chrome'
  if (/firefox\//i.test(value)) return 'Firefox'
  if (/safari\//i.test(value) && !/chrome\//i.test(value)) return 'Safari'

  return 'Other'
}

function statusLabel(value) {
  if (value === 'online') return 'Online'
  if (value === 'idle') return 'Idle'
  return 'Offline'
}

function Avatar({ item, large = false }) {
  const [failed, setFailed] = useState(false)
  const showImage = item?.avatar_url && !failed

  return (
    <div className={`reader-online-avatar ${large ? 'large' : ''}`}>
      {showImage ? (
        <img
          src={item.avatar_url}
          alt={item.name || item.username || 'Reader'}
          onError={() => setFailed(true)}
        />
      ) : (
        getInitial(item)
      )}
    </div>
  )
}

function StoryCover({ story }) {
  const [failed, setFailed] = useState(false)
  const showImage = story?.cover_url && !failed

  return (
    <div className="reader-online-story-cover">
      {showImage ? (
        <img
          src={story.cover_url}
          alt={story.title || 'Story'}
          onError={() => setFailed(true)}
        />
      ) : (
        '📖'
      )}
    </div>
  )
}

function SummaryCard({ label, value, text, tone = '' }) {
  return (
    <div className={`reader-online-summary-card ${tone}`}>
      <div className="reader-online-summary-label">{label}</div>
      <div className="reader-online-summary-value">{value}</div>
      <div className="reader-online-summary-text">{text}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="reader-online-detail-item">
      <div className="reader-online-detail-label">{label}</div>
      <div className="reader-online-detail-value">{value ?? '-'}</div>
    </div>
  )
}

function ReaderOnlineDrawer({ item, onClose }) {
  if (!item) return null

  const story = item.last_story || {}
  const episode = item.last_episode || {}

  return (
    <div className="reader-online-drawer-layer" onMouseDown={onClose}>
      <aside className="reader-online-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="reader-online-drawer-top">
          <div>
            <div className="reader-online-kicker">Reader Presence</div>
            <h3>Reader online details</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="reader-online-profile">
          <Avatar item={item} large />
          <div>
            <div className="reader-online-profile-name">{item.name || 'Reader'}</div>
            <div className="reader-online-muted">@{item.username || 'no_username'}</div>
            <div className="reader-online-badges">
              <span className={`reader-online-status ${item.presence_status || 'offline'}`}>
                <span />
                {statusLabel(item.presence_status)}
              </span>
              {item.is_author ? <span className="reader-online-role author">Author</span> : null}
              <span className="reader-online-role reader">Reader</span>
            </div>
          </div>
        </div>

        <div className="reader-online-section-title">Presence</div>
        <div className="reader-online-detail-grid">
          <DetailItem label="Status" value={statusLabel(item.presence_status)} />
          <DetailItem label="Session Time" value={formatDuration(item.session_minutes)} />
          <DetailItem label="Session Started" value={formatDateTime(item.session_started_at)} />
          <DetailItem label="Last Seen" value={formatDateTime(item.last_seen_at)} />
          <DetailItem label="Last Activity" value={formatDateTime(item.last_activity_at)} />
          <DetailItem label="Current / Last Page" value={item.current_path || '-'} />
          <DetailItem label="Tab Visibility" value={item.visibility_state || '-'} />
          <DetailItem label="Session ID" value={item.session_id || '-'} />
        </div>

        <div className="reader-online-section-title">Reading Activity</div>
        <div className="reader-online-detail-grid">
          <DetailItem label="Stories Read Today" value={formatNumber(item.stories_read_today)} />
          <DetailItem label="Stories With Progress" value={formatNumber(item.stories_read)} />
          <DetailItem label="Last Read" value={formatDateTime(item.last_read_at)} />
          <DetailItem
            label="Last Episode"
            value={
              episode.id
                ? `EP ${episode.episode_number || '-'} · ${episode.title || '-'}`
                : '-'
            }
          />
        </div>

        {story.id ? (
          <div className="reader-online-last-story">
            <StoryCover story={story} />
            <div>
              <div className="reader-online-story-name">{story.title || 'Untitled story'}</div>
              <div className="reader-online-muted">
                {episode.id ? `EP ${episode.episode_number || '-'} · ${episode.title || '-'}` : 'No episode data'}
              </div>
              <div className="reader-online-progress-text">
                Progress {Math.max(0, Math.min(100, Number(episode.reading_percent || 0)))}%
              </div>
            </div>
          </div>
        ) : null}

        <div className="reader-online-section-title">Reader Profile</div>
        <div className="reader-online-detail-grid">
          <DetailItem label="Email" value={item.email || '-'} />
          <DetailItem label="Date of Birth" value={formatDateOnly(item.date_of_birth)} />
          <DetailItem
            label="Age"
            value={item.age !== null && item.age !== undefined && Number.isFinite(Number(item.age)) ? `${Number(item.age)} years old` : 'Not provided'}
          />
          <DetailItem label="Gender" value={formatGender(item.gender, item.custom_gender)} />
          <DetailItem label="Role" value={item.is_author ? 'Reader + Author' : 'Reader'} />
          <DetailItem label="Joined" value={formatDateTime(item.joined_at)} />
          <DetailItem label="Account Status" value={item.account_active ? 'Active' : 'Inactive'} />
          <DetailItem label="Device" value={`${getDeviceLabel(item.user_agent)} · ${getBrowserLabel(item.user_agent)}`} />
        </div>

        <div className="reader-online-section-title">IDs & Device</div>
        <div className="reader-online-id-box">
          <div><span>User ID</span><strong>{item.user_id || '-'}</strong></div>
          <div><span>Story ID</span><strong>{story.id || '-'}</strong></div>
          <div><span>Episode ID</span><strong>{episode.id || '-'}</strong></div>
          <div><span>User Agent</span><strong>{item.user_agent || '-'}</strong></div>
        </div>
      </aside>
    </div>
  )
}

export default function AdminReaderOnlinePage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('last_active')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [data, setData] = useState({
    summary: {},
    items: [],
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    total_pages: 1,
    has_prev: false,
    has_next: false,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [status, sort])

  useEffect(() => {
    let alive = true

    async function loadReaderPresence() {
      try {
        setLoading(true)
        setError('')

        const token = getAdminToken()
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
          status,
          sort,
        })

        const response = await fetch(
          `${API_URL}/api/admin/community/reader-presence?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const responseData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          sessionStorage.removeItem('shadow_admin_token')
          localStorage.removeItem('shadow_admin_token')
          sessionStorage.removeItem('shadow_admin_user')
          localStorage.removeItem('shadow_admin_user')
          window.location.assign('/login')
          return
        }

        if (!response.ok || responseData.ok === false) {
          throw new Error(responseData.message || 'Failed to load reader presence')
        }

        if (!alive) return

        setData({
          summary: responseData.summary || {},
          items: Array.isArray(responseData.items) ? responseData.items : [],
          page: Number(responseData.page || 1),
          limit: Number(responseData.limit || PAGE_SIZE),
          total: Number(responseData.total || 0),
          total_pages: Number(responseData.total_pages || 1),
          has_prev: Boolean(responseData.has_prev),
          has_next: Boolean(responseData.has_next),
        })
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'Failed to load reader presence')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadReaderPresence()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch, status, sort, refreshKey])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return
      setRefreshKey((value) => value + 1)
    }, 60000)

    return () => window.clearInterval(timer)
  }, [])

  const summary = data.summary || {}
  const items = Array.isArray(data.items) ? data.items : []

  return (
    <AdminLayout
      title="Reader Online"
      subtitle="Live reader presence, session time, reading activity, and offline status."
    >
      <style>{styles}</style>

      <div className="reader-online-page">
        {error ? <div className="reader-online-alert">{error}</div> : null}

        <div className="reader-online-summary">
          <SummaryCard
            label="Online Now"
            value={formatNumber(summary.online)}
            text="Active readers on the website"
            tone="online"
          />
          <SummaryCard
            label="Idle"
            value={formatNumber(summary.idle)}
            text="Recently connected but inactive"
            tone="idle"
          />
          <SummaryCard
            label="Offline"
            value={formatNumber(summary.offline)}
            text="Readers not currently connected"
            tone="offline"
          />
          <SummaryCard
            label="Average Session"
            value={formatDuration(summary.average_session_minutes)}
            text="Average current online/idle session"
            tone="session"
          />
        </div>

        <div className="reader-online-panel">
          <div className="reader-online-toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, username, email, or User ID..."
            />

            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="idle">Idle</option>
              <option value="offline">Offline</option>
            </select>

            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="last_active">Recently Active</option>
              <option value="online_longest">Online Longest</option>
              <option value="most_stories_today">Most Stories Today</option>
              <option value="most_stories">Most Stories Overall</option>
              <option value="name">Name A–Z</option>
            </select>

            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
              Refresh
            </button>
          </div>

          <div className="reader-online-table-wrap">
            {loading ? (
              <div className="reader-online-loading">
                <span className="reader-online-spinner" />
                <span>Loading reader presence...</span>
              </div>
            ) : items.length ? (
              <table className="reader-online-table">
                <thead>
                  <tr>
                    <th>Reader</th>
                    <th>Status</th>
                    <th>Session</th>
                    <th>Current / Last Page</th>
                    <th>Stories</th>
                    <th>Last Story</th>
                    <th>Last Active</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const story = item.last_story || {}
                    const episode = item.last_episode || {}

                    return (
                      <tr key={item.user_id} onClick={() => setSelectedItem(item)}>
                        <td>
                          <div className="reader-online-person">
                            <Avatar item={item} />
                            <div>
                              <strong>{item.name || 'Reader'}</strong>
                              <span>@{item.username || 'no_username'}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`reader-online-status ${item.presence_status || 'offline'}`}>
                            <span />
                            {statusLabel(item.presence_status)}
                          </span>
                        </td>

                        <td>
                          <div className="reader-online-session-cell">
                            <strong>{formatDuration(item.session_minutes)}</strong>
                            <span>{item.session_started_at ? `Started ${formatRelativeTime(item.session_started_at)}` : 'No session yet'}</span>
                          </div>
                        </td>

                        <td>
                          <div className="reader-online-path-cell">
                            <strong>{item.current_path || '-'}</strong>
                            <span>{item.visibility_state || '-'}</span>
                          </div>
                        </td>

                        <td>
                          <div className="reader-online-story-count">
                            <strong>{formatNumber(item.stories_read_today)} today</strong>
                            <span>{formatNumber(item.stories_read)} total</span>
                          </div>
                        </td>

                        <td>
                          {story.id ? (
                            <div className="reader-online-story-cell">
                              <StoryCover story={story} />
                              <div>
                                <strong>{story.title || 'Untitled story'}</strong>
                                <span>
                                  {episode.id
                                    ? `EP ${episode.episode_number || '-'} · ${episode.title || '-'}`
                                    : 'No episode data'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="reader-online-muted">No reading data</span>
                          )}
                        </td>

                        <td>
                          <div className="reader-online-active-cell">
                            <strong>{formatRelativeTime(item.last_seen_at)}</strong>
                            <span>{formatDateTime(item.last_seen_at)}</span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="reader-online-detail-button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedItem(item)
                            }}
                          >
                            +
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="reader-online-empty">
                <div>👥</div>
                <strong>No readers found</strong>
                <span>Try changing the search, status, or sort filter.</span>
              </div>
            )}
          </div>

          <div className="reader-online-pagination">
            <div>
              Page {data.page || 1} of {data.total_pages || 1} · {formatNumber(data.total)} readers
            </div>

            <div>
              <button
                type="button"
                disabled={!data.has_prev || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!data.has_next || loading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReaderOnlineDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </AdminLayout>
  )
}

const styles = `
  .reader-online-page { display: flex; flex-direction: column; gap: 18px; }
  .reader-online-alert { border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 850; }
  .reader-online-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .reader-online-summary-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .reader-online-summary-card.online { background: #F0FDF4; border-color: #BBF7D0; }
  .reader-online-summary-card.idle { background: #FFFBEB; border-color: #FDE68A; }
  .reader-online-summary-card.offline { background: #F8FAFC; border-color: #E2E8F0; }
  .reader-online-summary-card.session { background: #EEF2FF; border-color: #C7D2FE; }
  .reader-online-summary-label { color: #64748B; font-size: 12px; font-weight: 900; }
  .reader-online-summary-value { margin-top: 8px; color: #0F172A; font-size: 27px; font-weight: 950; }
  .reader-online-summary-text { margin-top: 4px; color: #64748B; font-size: 12px; font-weight: 750; }
  .reader-online-panel { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .reader-online-toolbar { display: grid; grid-template-columns: minmax(240px, 1fr) 160px 190px auto; gap: 10px; padding: 14px; border-bottom: 1px solid #E2E8F0; }
  .reader-online-toolbar input, .reader-online-toolbar select { min-width: 0; border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 12px; padding: 11px 12px; color: #0F172A; font-weight: 750; outline: none; }
  .reader-online-toolbar input:focus, .reader-online-toolbar select:focus { border-color: #4F46E5; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .reader-online-toolbar button, .reader-online-pagination button { border: 0; border-radius: 12px; background: #EEF2FF; color: #4F46E5; padding: 10px 13px; font-weight: 900; cursor: pointer; }
  .reader-online-table-wrap { min-height: 440px; overflow-x: auto; }
  .reader-online-table { width: 100%; min-width: 1260px; border-collapse: collapse; }
  .reader-online-table th { background: #F8FAFC; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; text-align: left; padding: 12px 14px; border-bottom: 1px solid #E2E8F0; }
  .reader-online-table td { padding: 13px 14px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; color: #334155; font-size: 13px; font-weight: 700; }
  .reader-online-table tbody tr { cursor: pointer; }
  .reader-online-table tbody tr:hover td { background: #F8FAFC; }
  .reader-online-person, .reader-online-story-cell { display: flex; align-items: center; gap: 10px; min-width: 180px; }
  .reader-online-person strong, .reader-online-story-cell strong, .reader-online-session-cell strong, .reader-online-path-cell strong, .reader-online-story-count strong, .reader-online-active-cell strong { display: block; color: #0F172A; font-weight: 950; }
  .reader-online-person span, .reader-online-story-cell span, .reader-online-session-cell span, .reader-online-path-cell span, .reader-online-story-count span, .reader-online-active-cell span { display: block; margin-top: 3px; color: #64748B; font-size: 11.5px; font-weight: 750; }
  .reader-online-avatar { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #EEF2FF; color: #4F46E5; font-weight: 950; }
  .reader-online-avatar.large { width: 68px; height: 68px; font-size: 22px; }
  .reader-online-avatar img, .reader-online-story-cover img { width: 100%; height: 100%; object-fit: cover; }
  .reader-online-status { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 950; white-space: nowrap; }
  .reader-online-status > span { width: 8px; height: 8px; border-radius: 50%; }
  .reader-online-status.online { background: #DCFCE7; color: #15803D; }
  .reader-online-status.online > span { background: #22C55E; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14); }
  .reader-online-status.idle { background: #FEF3C7; color: #B45309; }
  .reader-online-status.idle > span { background: #F59E0B; }
  .reader-online-status.offline { background: #F1F5F9; color: #64748B; }
  .reader-online-status.offline > span { background: #94A3B8; }
  .reader-online-story-cover { width: 38px; height: 50px; border-radius: 8px; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #F1F5F9; font-size: 18px; }
  .reader-online-story-cell { max-width: 260px; }
  .reader-online-story-cell > div:last-child { min-width: 0; }
  .reader-online-story-cell strong, .reader-online-story-cell span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .reader-online-path-cell { min-width: 150px; max-width: 220px; }
  .reader-online-path-cell strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .reader-online-detail-button { width: 32px; height: 32px; border: 0; border-radius: 10px; background: #EEF2FF; color: #4F46E5; font-size: 18px; font-weight: 950; cursor: pointer; }
  .reader-online-loading, .reader-online-empty { min-height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #64748B; font-weight: 850; }
  .reader-online-empty div { font-size: 34px; }
  .reader-online-empty strong { color: #0F172A; font-size: 16px; }
  .reader-online-empty span { font-size: 13px; }
  .reader-online-spinner { width: 24px; height: 24px; border: 3px solid #E0E7FF; border-top-color: #4F46E5; border-radius: 50%; animation: readerOnlineSpin 0.8s linear infinite; }
  .reader-online-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 850; }
  .reader-online-pagination > div:last-child { display: flex; gap: 8px; }
  .reader-online-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  .reader-online-drawer-layer { position: fixed; inset: 0; z-index: 1300; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, 0.38); }
  .reader-online-drawer { width: min(680px, 100%); height: 100vh; overflow-y: auto; background: #FFFFFF; padding: 22px; box-shadow: -20px 0 50px rgba(15, 23, 42, 0.16); }
  .reader-online-drawer-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
  .reader-online-drawer-top h3 { margin: 3px 0 0; color: #0F172A; font-size: 20px; }
  .reader-online-drawer-top button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #F1F5F9; color: #475569; font-size: 22px; cursor: pointer; }
  .reader-online-kicker { color: #4F46E5; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.7px; }
  .reader-online-profile { display: flex; align-items: center; gap: 16px; padding: 15px; border: 1px solid #E2E8F0; border-radius: 18px; background: #F8FAFC; }
  .reader-online-profile-name, .reader-online-story-name { color: #0F172A; font-size: 17px; font-weight: 950; }
  .reader-online-muted { color: #64748B; font-size: 12px; font-weight: 750; margin-top: 3px; }
  .reader-online-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
  .reader-online-role { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; font-size: 10.5px; font-weight: 900; }
  .reader-online-role.reader { background: #EFF6FF; color: #2563EB; }
  .reader-online-role.author { background: #F5F3FF; color: #7C3AED; }
  .reader-online-section-title { margin: 20px 0 10px; color: #0F172A; font-size: 14px; font-weight: 950; }
  .reader-online-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .reader-online-detail-item { min-width: 0; padding: 12px; border: 1px solid #E2E8F0; border-radius: 14px; background: #FFFFFF; }
  .reader-online-detail-label { color: #64748B; font-size: 10.5px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.4px; }
  .reader-online-detail-value { margin-top: 5px; color: #0F172A; font-size: 13px; font-weight: 900; word-break: break-word; }
  .reader-online-last-story { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 12px; border: 1px solid #E2E8F0; border-radius: 14px; background: #F8FAFC; }
  .reader-online-progress-text { margin-top: 7px; color: #4F46E5; font-size: 11px; font-weight: 900; }
  .reader-online-id-box { border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
  .reader-online-id-box > div { display: grid; grid-template-columns: 95px minmax(0, 1fr); gap: 12px; padding: 11px 12px; border-bottom: 1px solid #F1F5F9; }
  .reader-online-id-box > div:last-child { border-bottom: 0; }
  .reader-online-id-box span { color: #64748B; font-size: 11px; font-weight: 900; }
  .reader-online-id-box strong { color: #0F172A; font-size: 12px; word-break: break-all; }
  @keyframes readerOnlineSpin { to { transform: rotate(360deg); } }

  @media (max-width: 1050px) {
    .reader-online-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .reader-online-toolbar { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .reader-online-summary { grid-template-columns: 1fr; }
    .reader-online-toolbar { grid-template-columns: 1fr; }
    .reader-online-pagination { flex-direction: column; align-items: flex-start; }
    .reader-online-detail-grid { grid-template-columns: 1fr; }
    .reader-online-drawer { padding: 18px; }
  }
`
