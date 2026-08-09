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
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDateOnly(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '-'
  return `${match[2]}/${match[3]}/${match[1]}`
}

function formatGender(gender, customGender) {
  const value = String(gender || '').toLowerCase()
  if (value === 'female') return 'Female'
  if (value === 'male') return 'Male'
  if (value === 'custom') return customGender || 'Custom'
  return 'Not provided'
}

function formatAgeGroup(value) {
  const labels = {
    under_13: 'Under 13',
    '13_17': '13–17',
    '18_24': '18–24',
    '25_34': '25–34',
    '35_44': '35–44',
    '45_54': '45–54',
    '55_plus': '55+',
    unknown: 'Unknown',
  }
  return labels[value] || 'Unknown'
}

function storyTypeLabel(value) {
  const type = String(value || '').toLowerCase()
  if (type === 'chat_story') return 'Chat Story'
  if (type === 'manga') return 'Manga'
  return 'Novel'
}

function getInitial(reader) {
  return String(reader?.name || reader?.username || 'R').trim().slice(0, 1).toUpperCase()
}

function SummaryCard({ label, value, text, tone = '' }) {
  return (
    <div className={`readers-today-summary-card ${tone}`}>
      <div className="readers-today-summary-label">{label}</div>
      <div className="readers-today-summary-value">{value}</div>
      <div className="readers-today-summary-text">{text}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="readers-today-detail-item">
      <div className="readers-today-detail-label">{label}</div>
      <div className="readers-today-detail-value">{value ?? '-'}</div>
    </div>
  )
}

function ReaderAvatar({ reader, large = false }) {
  const [failed, setFailed] = useState(false)
  const showImage = reader?.avatar_url && !failed

  return (
    <div className={`readers-today-avatar ${large ? 'large' : ''}`}>
      {showImage ? (
        <img
          src={reader.avatar_url}
          alt={reader.name || reader.username || 'Reader'}
          onError={() => setFailed(true)}
        />
      ) : (
        getInitial(reader)
      )}
    </div>
  )
}

function StoryCover({ story, large = false }) {
  const [failed, setFailed] = useState(false)
  const showImage = story?.cover_url && !failed

  return (
    <div className={`readers-today-cover ${large ? 'large' : ''}`}>
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

function ReaderDetailsDrawer({ item, onClose }) {
  if (!item) return null

  const reader = item.reader || {}
  const story = item.story || {}
  const episode = item.episode || {}

  return (
    <div className="readers-today-drawer-layer" onMouseDown={onClose}>
      <aside className="readers-today-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="readers-today-drawer-top">
          <div>
            <div className="readers-today-kicker">Reader Activity</div>
            <h3>Reading details</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="readers-today-reader-profile">
          <ReaderAvatar reader={reader} large />
          <div>
            <div className="readers-today-profile-name">{reader.name || 'Reader'}</div>
            <div className="readers-today-muted">@{reader.username || 'no_username'}</div>
            <div className="readers-today-profile-badges">
              <span className="readers-today-badge reader">Reader</span>
              {reader.is_author ? <span className="readers-today-badge author">Author</span> : null}
              {item.active_last_10_minutes ? <span className="readers-today-badge live">Active now</span> : null}
            </div>
          </div>
        </div>

        <div className="readers-today-section-title">Reader Profile</div>
        <div className="readers-today-detail-grid">
          <DetailItem label="Date of Birth" value={formatDateOnly(reader.date_of_birth)} />
          <DetailItem label="Age" value={Number.isFinite(reader.age) ? `${reader.age} years old` : 'Not provided'} />
          <DetailItem label="Age Group" value={formatAgeGroup(reader.age_group)} />
          <DetailItem label="Gender" value={formatGender(reader.gender, reader.custom_gender)} />
          <DetailItem label="Email" value={reader.email || '-'} />
          <DetailItem label="Role" value={reader.is_author ? 'Reader + Author' : 'Reader'} />
          <DetailItem label="Joined" value={formatDateTime(reader.joined_at)} />
          <DetailItem label="Account Status" value={reader.status || '-'} />
        </div>

        <div className="readers-today-section-title">Story Read Today</div>
        <div className="readers-today-story-profile">
          <StoryCover story={story} large />
          <div className="readers-today-story-profile-copy">
            <div className="readers-today-story-title">{story.title || 'Untitled story'}</div>
            <div className="readers-today-muted">
              {storyTypeLabel(story.story_type)} · {story.story_language || '-'} · {story.main_genre || '-'}
            </div>
            <div className="readers-today-story-tags">
              {story.is_adult ? <span className="readers-today-badge adult">18+</span> : <span className="readers-today-badge general">General</span>}
              <span className="readers-today-badge neutral">{story.status || '-'}</span>
            </div>
          </div>
        </div>

        <div className="readers-today-detail-grid">
          <DetailItem
            label="Latest Episode"
            value={episode.id ? `EP ${episode.episode_number || item.episode_number || '-'}: ${episode.title || '-'}` : `EP ${item.episode_number || '-'}`}
          />
          <DetailItem label="Last Read" value={formatDateTime(item.last_read_at)} />
          <DetailItem label="Reading Progress" value={`${Math.max(0, Math.min(100, Number(item.reading_percent || 0)))}%`} />
          <DetailItem label="Total Episodes" value={formatNumber(item.total_episodes)} />
        </div>

        <div className="readers-today-section-title">IDs</div>
        <div className="readers-today-id-list">
          <div><span>User ID</span><strong>{reader.id || '-'}</strong></div>
          <div><span>Story ID</span><strong>{story.id || '-'}</strong></div>
          <div><span>Episode ID</span><strong>{episode.id || '-'}</strong></div>
        </div>
      </aside>
    </div>
  )
}

export default function AdminReadersTodayPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [data, setData] = useState({
    summary: {},
    items: [],
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadReadersToday() {
      try {
        setLoading(true)
        setError('')

        const token = getAdminToken()
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/community/readers/today?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
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
          throw new Error(responseData.message || 'Failed to load readers today')
        }

        if (!alive) return

        setData({
          summary: responseData.summary || {},
          items: Array.isArray(responseData.items) ? responseData.items : [],
          page: Number(responseData.page || 1),
          total: Number(responseData.total || 0),
          total_pages: Number(responseData.total_pages || 1),
          has_next: Boolean(responseData.has_next),
          has_prev: Boolean(responseData.has_prev),
        })
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'Failed to load readers today')
        setData((current) => ({ ...current, items: [] }))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadReadersToday()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch, refreshKey])

  const summary = data.summary || {}
  const items = Array.isArray(data.items) ? data.items : []

  return (
    <AdminLayout
      title="Readers Today"
      subtitle="See who read stories today, what they read, and audience age data in Cambodia time."
    >
      <style>{styles}</style>

      <div className="readers-today-page">
        {error ? <div className="readers-today-alert">{error}</div> : null}

        <div className="readers-today-summary">
          <SummaryCard
            label="Readers Today"
            value={formatNumber(summary.readers_today)}
            text="Unique readers with reading activity"
          />
          <SummaryCard
            label="Active in 10 min"
            value={formatNumber(summary.active_readers_last_10_minutes)}
            text="Readers active recently"
            tone="green"
          />
          <SummaryCard
            label="Stories Read Today"
            value={formatNumber(summary.stories_read_today)}
            text="Different stories read today"
            tone="purple"
          />
          <SummaryCard
            label="Average Reader Age"
            value={summary.average_reader_age == null ? '-' : summary.average_reader_age}
            text={`${formatNumber(summary.age_known_readers)} readers with known age`}
            tone="yellow"
          />
        </div>

        <div className="readers-today-panel">
          <div className="readers-today-toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reader, username, email, story, episode, or ID..."
            />
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
              Refresh
            </button>
          </div>

          <div className="readers-today-table-wrap">
            {loading ? (
              <div className="readers-today-loading">
                <span className="readers-today-spinner" />
                <span>Loading readers today...</span>
              </div>
            ) : items.length ? (
              <table className="readers-today-table">
                <thead>
                  <tr>
                    <th>Reader</th>
                    <th>Story</th>
                    <th>Latest Episode</th>
                    <th>Birth / Age</th>
                    <th>Last Read</th>
                    <th>Progress</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const reader = item.reader || {}
                    const story = item.story || {}
                    const episode = item.episode || {}
                    const progress = Math.max(0, Math.min(100, Number(item.reading_percent || 0)))

                    return (
                      <tr key={`${reader.id || 'reader'}-${story.id || item.id}`} onClick={() => setSelectedItem(item)}>
                        <td>
                          <div className="readers-today-person-cell">
                            <ReaderAvatar reader={reader} />
                            <div>
                              <div className="readers-today-name-row">
                                <strong>{reader.name || 'Reader'}</strong>
                                {item.active_last_10_minutes ? <span className="readers-today-live-dot" title="Active in last 10 minutes" /> : null}
                              </div>
                              <span>@{reader.username || 'no_username'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="readers-today-story-cell">
                            <StoryCover story={story} />
                            <div>
                              <strong>{story.title || 'Untitled story'}</strong>
                              <span>{story.main_genre || '-'} · {story.story_language || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="readers-today-episode-cell">
                            <strong>EP {episode.episode_number || item.episode_number || '-'}</strong>
                            <span>{episode.title || '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="readers-today-age-cell">
                            <strong>{formatDateOnly(reader.date_of_birth)}</strong>
                            <span>{Number.isFinite(reader.age) ? `${reader.age} years old` : 'Age unknown'}</span>
                          </div>
                        </td>
                        <td>{formatDateTime(item.last_read_at)}</td>
                        <td>
                          <div className="readers-today-progress-cell">
                            <div><span style={{ width: `${progress}%` }} /></div>
                            <strong>{progress}%</strong>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="readers-today-detail-button"
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
              <div className="readers-today-empty">
                <div>📚</div>
                <strong>No readers found today</strong>
                <span>Reading activity will appear here when readers open stories.</span>
              </div>
            )}
          </div>

          <div className="readers-today-pagination">
            <div>
              Page {data.page || 1} of {data.total_pages || 1} · {formatNumber(data.total)} reading records
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

      <ReaderDetailsDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </AdminLayout>
  )
}

const styles = `
  .readers-today-page { display: flex; flex-direction: column; gap: 18px; }
  .readers-today-alert { border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 850; }
  .readers-today-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .readers-today-summary-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .readers-today-summary-card.green { background: #F0FDF4; border-color: #BBF7D0; }
  .readers-today-summary-card.purple { background: #F5F3FF; border-color: #DDD6FE; }
  .readers-today-summary-card.yellow { background: #FFFBEB; border-color: #FDE68A; }
  .readers-today-summary-label { color: #64748B; font-size: 12px; font-weight: 900; }
  .readers-today-summary-value { margin-top: 8px; color: #0F172A; font-size: 27px; font-weight: 950; }
  .readers-today-summary-text { margin-top: 4px; color: #64748B; font-size: 12px; font-weight: 750; }
  .readers-today-panel { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .readers-today-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; padding: 14px; border-bottom: 1px solid #E2E8F0; }
  .readers-today-toolbar input { min-width: 0; border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 12px; padding: 11px 12px; color: #0F172A; font-weight: 750; outline: none; }
  .readers-today-toolbar input:focus { border-color: #4F46E5; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .readers-today-toolbar button, .readers-today-pagination button { border: 0; border-radius: 12px; background: #EEF2FF; color: #4F46E5; padding: 10px 13px; font-weight: 900; cursor: pointer; }
  .readers-today-table-wrap { min-height: 420px; overflow-x: auto; }
  .readers-today-table { width: 100%; min-width: 1120px; border-collapse: collapse; }
  .readers-today-table th { background: #F8FAFC; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; text-align: left; padding: 12px 14px; border-bottom: 1px solid #E2E8F0; }
  .readers-today-table td { padding: 13px 14px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; color: #334155; font-size: 13px; font-weight: 700; }
  .readers-today-table tbody tr { cursor: pointer; }
  .readers-today-table tbody tr:hover td { background: #F8FAFC; }
  .readers-today-person-cell, .readers-today-story-cell { display: flex; align-items: center; gap: 11px; min-width: 190px; }
  .readers-today-person-cell strong, .readers-today-story-cell strong, .readers-today-episode-cell strong, .readers-today-age-cell strong { display: block; color: #0F172A; font-weight: 950; }
  .readers-today-person-cell span, .readers-today-story-cell span, .readers-today-episode-cell span, .readers-today-age-cell span { display: block; margin-top: 3px; color: #64748B; font-size: 11.5px; font-weight: 750; }
  .readers-today-avatar { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #EEF2FF; color: #4F46E5; font-size: 14px; font-weight: 950; }
  .readers-today-avatar.large { width: 68px; height: 68px; font-size: 22px; }
  .readers-today-avatar img, .readers-today-cover img { width: 100%; height: 100%; object-fit: cover; }
  .readers-today-cover { width: 42px; height: 56px; border-radius: 9px; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #F1F5F9; font-size: 20px; }
  .readers-today-cover.large { width: 76px; height: 102px; border-radius: 13px; font-size: 30px; }
  .readers-today-name-row { display: flex; align-items: center; gap: 7px; }
  .readers-today-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.13); }
  .readers-today-episode-cell { min-width: 165px; max-width: 230px; }
  .readers-today-episode-cell span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .readers-today-age-cell { min-width: 125px; }
  .readers-today-progress-cell { display: flex; align-items: center; gap: 9px; min-width: 105px; }
  .readers-today-progress-cell > div { width: 68px; height: 7px; border-radius: 999px; background: #E2E8F0; overflow: hidden; }
  .readers-today-progress-cell > div > span { display: block; height: 100%; border-radius: inherit; background: #4F46E5; }
  .readers-today-progress-cell strong { color: #4F46E5; font-size: 12px; }
  .readers-today-detail-button { width: 32px; height: 32px; border: 0; border-radius: 10px; background: #EEF2FF; color: #4F46E5; font-size: 18px; font-weight: 950; cursor: pointer; }
  .readers-today-loading, .readers-today-empty { min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #64748B; font-weight: 850; }
  .readers-today-empty div { font-size: 34px; }
  .readers-today-empty strong { color: #0F172A; font-size: 16px; }
  .readers-today-empty span { font-size: 13px; }
  .readers-today-spinner { width: 24px; height: 24px; border: 3px solid #E0E7FF; border-top-color: #4F46E5; border-radius: 50%; animation: readersTodaySpin 0.8s linear infinite; }
  .readers-today-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 850; }
  .readers-today-pagination > div:last-child { display: flex; gap: 8px; }
  .readers-today-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  .readers-today-drawer-layer { position: fixed; inset: 0; z-index: 1300; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, 0.38); }
  .readers-today-drawer { width: min(680px, 100%); height: 100vh; overflow-y: auto; background: #FFFFFF; padding: 22px; box-shadow: -20px 0 50px rgba(15, 23, 42, 0.16); }
  .readers-today-drawer-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
  .readers-today-drawer-top h3 { margin: 3px 0 0; color: #0F172A; font-size: 20px; }
  .readers-today-drawer-top button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #F1F5F9; color: #475569; font-size: 22px; cursor: pointer; }
  .readers-today-kicker { color: #4F46E5; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.7px; }
  .readers-today-reader-profile, .readers-today-story-profile { display: flex; align-items: center; gap: 16px; padding: 15px; border: 1px solid #E2E8F0; border-radius: 18px; background: #F8FAFC; }
  .readers-today-profile-name, .readers-today-story-title { color: #0F172A; font-size: 17px; font-weight: 950; }
  .readers-today-muted { color: #64748B; font-size: 12px; font-weight: 750; margin-top: 3px; }
  .readers-today-profile-badges, .readers-today-story-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
  .readers-today-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; font-size: 10.5px; font-weight: 900; }
  .readers-today-badge.reader { background: #EFF6FF; color: #2563EB; }
  .readers-today-badge.author { background: #F5F3FF; color: #7C3AED; }
  .readers-today-badge.live { background: #DCFCE7; color: #15803D; }
  .readers-today-badge.adult { background: #FEE2E2; color: #B91C1C; }
  .readers-today-badge.general { background: #ECFDF5; color: #047857; }
  .readers-today-badge.neutral { background: #F1F5F9; color: #475569; text-transform: capitalize; }
  .readers-today-section-title { margin: 20px 0 10px; color: #0F172A; font-size: 14px; font-weight: 950; }
  .readers-today-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .readers-today-detail-item { min-width: 0; padding: 12px; border: 1px solid #E2E8F0; border-radius: 14px; background: #FFFFFF; }
  .readers-today-detail-label { color: #64748B; font-size: 10.5px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.4px; }
  .readers-today-detail-value { margin-top: 5px; color: #0F172A; font-size: 13px; font-weight: 900; word-break: break-word; }
  .readers-today-story-profile-copy { min-width: 0; }
  .readers-today-id-list { border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
  .readers-today-id-list > div { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; padding: 11px 12px; border-bottom: 1px solid #F1F5F9; }
  .readers-today-id-list > div:last-child { border-bottom: 0; }
  .readers-today-id-list span { color: #64748B; font-size: 11px; font-weight: 900; }
  .readers-today-id-list strong { color: #0F172A; font-size: 12px; word-break: break-all; }
  @keyframes readersTodaySpin { to { transform: rotate(360deg); } }
  @media (max-width: 980px) {
    .readers-today-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .readers-today-summary { grid-template-columns: 1fr; }
    .readers-today-toolbar { grid-template-columns: 1fr; }
    .readers-today-pagination { align-items: flex-start; flex-direction: column; }
    .readers-today-detail-grid { grid-template-columns: 1fr; }
    .readers-today-drawer { padding: 18px; }
  }
`
