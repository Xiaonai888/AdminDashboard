import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const TIME_ZONE = 'Asia/Phnom_Penh'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function clearAdminSession() {
  sessionStorage.removeItem('shadow_admin_token')
  localStorage.removeItem('shadow_admin_token')
  sessionStorage.removeItem('shadow_admin_user')
  localStorage.removeItem('shadow_admin_user')
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function storyTypeLabel(value) {
  if (value === 'chat_story') return 'Chat Story'
  if (value === 'manga') return 'Manga'
  return 'Novel'
}

function lifecycleClass(value) {
  const key = String(value || '').toLowerCase()
  if (key === 'completed') return 'completed'
  if (key === 'ongoing') return 'ongoing'
  return 'new'
}

export default function StoryLibraryPanel({ onSelectStory }) {
  const [lifecycle, setLifecycle] = useState('new')
  const [sort, setSort] = useState('newest')
  const [storyType, setStoryType] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    stories: [],
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

    async function loadStories() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          tab: 'library',
          lifecycle,
          sort,
          story_type: storyType,
          q: debouncedSearch,
          page: String(page),
          limit: String(PAGE_SIZE),
        })

        const response = await fetch(`${API_URL}/api/admin/stories?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        })
        const responseData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          clearAdminSession()
          window.location.assign('/login')
          return
        }

        if (!response.ok || responseData.ok === false) {
          throw new Error(responseData.message || 'Failed to load story library')
        }

        if (!alive) return
        setData({
          stories: Array.isArray(responseData.stories) ? responseData.stories : [],
          page: responseData.page || 1,
          total: responseData.total || 0,
          total_pages: responseData.total_pages || 1,
          has_next: Boolean(responseData.has_next),
          has_prev: Boolean(responseData.has_prev),
        })
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'Failed to load story library')
        setData((current) => ({ ...current, stories: [] }))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadStories()

    return () => {
      alive = false
    }
  }, [lifecycle, sort, storyType, debouncedSearch, page, refreshKey])

  const stories = data.stories || []

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function copyStoryId(event, value) {
    event.stopPropagation()
    navigator.clipboard?.writeText(String(value || '')).catch(() => {})
  }

  return (
    <div className="story-library-panel">
      <style>{styles}</style>

      <div className="story-library-head">
        <div>
          <div className="story-library-kicker">Story Management</div>
          <h2>Story Library</h2>
          <p>Browse all current stories without deleted stories.</p>
        </div>

        <div className="story-library-lifecycle">
          <button
            type="button"
            className={lifecycle === 'new' ? 'active' : ''}
            onClick={() => changeFilter(setLifecycle, 'new')}
          >
            New
          </button>
          <button
            type="button"
            className={lifecycle === 'ongoing' ? 'active' : ''}
            onClick={() => changeFilter(setLifecycle, 'ongoing')}
          >
            Ongoing
          </button>
          <button
            type="button"
            className={lifecycle === 'completed' ? 'active' : ''}
            onClick={() => changeFilter(setLifecycle, 'completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="story-library-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, author, @username, Story ID, genre or language..."
        />

        <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most_views">Most Views</option>
        </select>

        <select value={storyType} onChange={(event) => changeFilter(setStoryType, event.target.value)}>
          <option value="all">All Types</option>
          <option value="novel">Novel</option>
          <option value="manga">Manga</option>
          <option value="chat_story">Chat Story</option>
        </select>

        <button type="button" className="story-library-refresh" onClick={() => setRefreshKey((value) => value + 1)}>
          Refresh
        </button>
      </div>

      {error ? <div className="story-library-alert">{error}</div> : null}

      <div className="story-library-table-wrap">
        {loading ? (
          <div className="story-library-state">
            <span className="story-library-spinner" />
            <strong>Loading stories...</strong>
          </div>
        ) : stories.length ? (
          <table className="story-library-table">
            <thead>
              <tr>
                <th>Story</th>
                <th>Author</th>
                <th>Lifecycle</th>
                <th>Type</th>
                <th>Episodes</th>
                <th>Views</th>
                <th>Published</th>
                <th>Last Updated</th>
                <th>Story ID</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} onClick={() => onSelectStory?.(story)}>
                  <td>
                    <div className="story-library-story">
                      <div className="story-library-cover">
                        {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
                      </div>
                      <div>
                        <strong>{story.title || 'Untitled Story'}</strong>
                        <span>{story.main_genre || '-'} · {story.story_language || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong className="story-library-author">{story.author_page?.page_name || 'Unknown'}</strong>
                    <span className="story-library-sub">@{story.author_page?.page_username || 'no_username'}</span>
                  </td>
                  <td>
                    <span className={`story-library-badge ${lifecycleClass(story.lifecycle)}`}>
                      {story.lifecycle || '-'}
                    </span>
                  </td>
                  <td>{storyTypeLabel(story.story_type)}</td>
                  <td>{formatNumber(story.total_episodes)}</td>
                  <td>{formatNumber(story.total_views)}</td>
                  <td>{formatDate(story.published_at)}</td>
                  <td>{formatDate(story.updated_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="story-library-id"
                      onClick={(event) => copyStoryId(event, story.id)}
                      title="Copy Story ID"
                    >
                      {story.id}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="story-library-state">
            <div className="story-library-empty-icon">📚</div>
            <strong>No stories found</strong>
            <span>Try another lifecycle, search or filter.</span>
          </div>
        )}
      </div>

      <div className="story-library-pagination">
        <div>
          Page {data.page} of {data.total_pages} · {formatNumber(data.total)} stories
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
  )
}

const styles = `
  .story-library-panel { background: #fff; }
  .story-library-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px; border-bottom: 1px solid #E2E8F0; }
  .story-library-kicker { color: #4F46E5; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: .7px; }
  .story-library-head h2 { margin: 4px 0 4px; color: #0F172A; font-size: 21px; }
  .story-library-head p { margin: 0; color: #64748B; font-size: 13px; font-weight: 700; }
  .story-library-lifecycle { display: inline-flex; gap: 4px; padding: 4px; border: 1px solid #E2E8F0; border-radius: 13px; background: #F8FAFC; }
  .story-library-lifecycle button { border: 0; background: transparent; color: #64748B; border-radius: 9px; padding: 9px 16px; font-weight: 900; cursor: pointer; }
  .story-library-lifecycle button.active { background: #fff; color: #4F46E5; box-shadow: 0 1px 4px rgba(15,23,42,.08); }
  .story-library-toolbar { display: grid; grid-template-columns: minmax(260px, 1fr) 150px 150px auto; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #E2E8F0; background: #FCFCFF; }
  .story-library-toolbar input, .story-library-toolbar select { min-width: 0; border: 1px solid #E2E8F0; background: #fff; color: #0F172A; border-radius: 11px; padding: 10px 12px; font-weight: 750; outline: none; }
  .story-library-toolbar input:focus, .story-library-toolbar select:focus { border-color: #818CF8; box-shadow: 0 0 0 3px rgba(99,102,241,.09); }
  .story-library-refresh, .story-library-pagination button { border: 0; border-radius: 11px; background: #EEF2FF; color: #4F46E5; padding: 10px 14px; font-weight: 900; cursor: pointer; }
  .story-library-alert { margin: 14px 20px 0; border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 12px; padding: 11px 13px; font-size: 13px; font-weight: 850; }
  .story-library-table-wrap { min-height: 430px; overflow-x: auto; }
  .story-library-table { width: 100%; min-width: 1160px; border-collapse: collapse; }
  .story-library-table th { padding: 12px 14px; background: #F8FAFC; color: #64748B; border-bottom: 1px solid #E2E8F0; text-align: left; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: .5px; }
  .story-library-table td { padding: 13px 14px; border-bottom: 1px solid #F1F5F9; color: #334155; font-size: 13px; font-weight: 750; vertical-align: middle; }
  .story-library-table tbody tr { cursor: pointer; }
  .story-library-table tbody tr:hover td { background: #F8FAFC; }
  .story-library-story { display: flex; align-items: center; gap: 11px; min-width: 235px; }
  .story-library-story strong, .story-library-author { display: block; color: #0F172A; font-weight: 950; }
  .story-library-story span, .story-library-sub { display: block; margin-top: 3px; color: #64748B; font-size: 12px; font-weight: 750; }
  .story-library-cover { width: 42px; height: 56px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 9px; background: #EEF2FF; color: #4F46E5; font-size: 20px; }
  .story-library-cover img { width: 100%; height: 100%; object-fit: cover; }
  .story-library-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 950; }
  .story-library-badge.new { background: #DBEAFE; color: #1D4ED8; }
  .story-library-badge.ongoing { background: #FEF3C7; color: #B45309; }
  .story-library-badge.completed { background: #DCFCE7; color: #15803D; }
  .story-library-id { max-width: 125px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 0; border-radius: 8px; background: #F8FAFC; color: #475569; padding: 6px 8px; font-weight: 800; cursor: pointer; }
  .story-library-state { min-height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: #64748B; text-align: center; }
  .story-library-state strong { color: #0F172A; }
  .story-library-state span { font-size: 13px; }
  .story-library-empty-icon { font-size: 34px; }
  .story-library-spinner { width: 24px; height: 24px; border: 3px solid #E0E7FF; border-top-color: #4F46E5; border-radius: 50%; animation: storyLibrarySpin .8s linear infinite; }
  .story-library-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 850; }
  .story-library-pagination > div:last-child { display: flex; gap: 8px; }
  .story-library-pagination button:disabled { opacity: .5; cursor: not-allowed; }
  @keyframes storyLibrarySpin { to { transform: rotate(360deg); } }
  @media (max-width: 900px) {
    .story-library-head { align-items: stretch; flex-direction: column; }
    .story-library-lifecycle { width: 100%; }
    .story-library-lifecycle button { flex: 1; }
    .story-library-toolbar { grid-template-columns: 1fr 1fr; }
    .story-library-toolbar input { grid-column: 1 / -1; }
  }
  @media (max-width: 620px) {
    .story-library-head { padding: 16px 12px; }
    .story-library-toolbar { grid-template-columns: 1fr; padding: 12px; }
    .story-library-toolbar input { grid-column: auto; }
    .story-library-lifecycle button { padding: 9px 8px; font-size: 12px; }
    .story-library-pagination { align-items: stretch; flex-direction: column; padding: 12px; }
    .story-library-pagination > div:last-child { display: grid; grid-template-columns: 1fr 1fr; }
    .story-library-pagination button { width: 100%; }
  }
`
