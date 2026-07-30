import React, { useEffect, useMemo, useState } from 'react'

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

function formatRange(period) {
  if (!period?.start || !period?.end) return 'Loading period...'

  const start = new Date(period.start)
  const end = new Date(new Date(period.end).getTime() - 1)
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth()
  const startOptions = sameMonth
    ? { timeZone: TIME_ZONE, month: 'short', day: 'numeric' }
    : { timeZone: TIME_ZONE, year: sameYear ? undefined : 'numeric', month: 'short', day: 'numeric' }
  const endOptions = { timeZone: TIME_ZONE, year: 'numeric', month: 'short', day: 'numeric' }

  return `${new Intl.DateTimeFormat('en-US', startOptions).format(start)} – ${new Intl.DateTimeFormat('en-US', endOptions).format(end)}`
}

function storyTypeLabel(value) {
  if (value === 'chat_story') return 'Chat Story'
  if (value === 'manga') return 'Manga'
  return 'Novel'
}

function SummaryCard({ label, value, text, tone = '' }) {
  return (
    <div className={`story-update-card ${tone}`}>
      <div className="story-update-card-label">{label}</div>
      <div className="story-update-card-value">{value}</div>
      <div className="story-update-card-text">{text}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="story-update-empty">
      <div className="story-update-empty-icon">📚</div>
      <strong>No story updates found</strong>
      <span>Try another period or change the filters.</span>
    </div>
  )
}

export default function StoryUpdateActivityPanel() {
  const [period, setPeriod] = useState('today')
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('episodes')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [storyType, setStoryType] = useState('all')
  const [language, setLanguage] = useState('all')
  const [genre, setGenre] = useState('all')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    period: null,
    summary: {},
    authors: [],
    filter_options: { story_types: [], languages: [], genres: [] },
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [expandedAuthors, setExpandedAuthors] = useState(() => new Set())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadActivity() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          period,
          offset: String(offset),
          sort,
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
          story_type: storyType,
          language,
          genre,
        })
        const token = getAdminToken()
        const response = await fetch(`${API_URL}/api/admin/stories/update-activity?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const responseData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          clearAdminSession()
          window.location.assign('/login')
          return
        }

        if (!response.ok || responseData.ok === false) {
          throw new Error(responseData.message || 'Failed to load story update activity')
        }

        if (!alive) return
        setData(responseData)
        setExpandedAuthors(new Set())
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'Failed to load story update activity')
        setData((current) => ({ ...current, authors: [] }))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadActivity()

    return () => {
      alive = false
    }
  }, [period, offset, sort, page, debouncedSearch, storyType, language, genre, refreshKey])

  const summary = data.summary || {}
  const authors = Array.isArray(data.authors) ? data.authors : []
  const filterOptions = data.filter_options || {}
  const topAuthor = summary.top_author
  const periodLabel = useMemo(() => formatRange(data.period), [data.period])

  function changePeriod(nextPeriod) {
    setPeriod(nextPeriod)
    setOffset(0)
    setPage(1)
  }

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function toggleAuthor(authorId) {
    setExpandedAuthors((current) => {
      const next = new Set(current)
      if (next.has(authorId)) next.delete(authorId)
      else next.add(authorId)
      return next
    })
  }

  return (
    <div className="story-update-panel">
      <style>{styles}</style>

      <div className="story-update-head">
        <div>
          <div className="story-update-kicker">Publishing Activity</div>
          <h2>Story Updates</h2>
          <p>See which authors published new episodes most actively.</p>
        </div>

        <div className="story-update-period-tabs">
          <button type="button" className={period === 'today' ? 'active' : ''} onClick={() => changePeriod('today')}>Today</button>
          <button type="button" className={period === 'week' ? 'active' : ''} onClick={() => changePeriod('week')}>This Week</button>
          <button type="button" className={period === 'month' ? 'active' : ''} onClick={() => changePeriod('month')}>This Month</button>
        </div>
      </div>

      <div className="story-update-range-row">
        <button type="button" className="story-update-arrow" onClick={() => { setOffset((value) => value - 1); setPage(1) }}>‹</button>
        <div>
          <strong>{periodLabel}</strong>
          <span>Cambodia time</span>
        </div>
        <button type="button" className="story-update-arrow" disabled={offset >= 0} onClick={() => { setOffset((value) => Math.min(0, value + 1)); setPage(1) }}>›</button>
      </div>

      {error ? <div className="story-update-alert">{error}</div> : null}

      <div className="story-update-summary">
        <SummaryCard label="Active Authors" value={formatNumber(summary.active_authors)} text="Authors who published episodes" />
        <SummaryCard label="Updated Stories" value={formatNumber(summary.updated_stories)} text="Different stories updated" tone="green" />
        <SummaryCard label="New Episodes" value={formatNumber(summary.new_episodes)} text="First-time published episodes" tone="purple" />
        <SummaryCard
          label="Top Author"
          value={topAuthor?.author?.page_name || '-'}
          text={topAuthor ? `${formatNumber(topAuthor.new_episodes)} episodes · ${formatNumber(topAuthor.active_days)} active days` : 'No activity in this period'}
          tone="yellow"
        />
      </div>

      <div className="story-update-toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search author, username, story, episode, or Story ID..." />
        <select value={storyType} onChange={(event) => changeFilter(setStoryType, event.target.value)}>
          <option value="all">All Story Types</option>
          {(filterOptions.story_types || []).map((item) => <option key={item} value={item}>{storyTypeLabel(item)}</option>)}
        </select>
        <select value={language} onChange={(event) => changeFilter(setLanguage, event.target.value)}>
          <option value="all">All Languages</option>
          {(filterOptions.languages || []).map((item) => <option key={item} value={String(item).toLowerCase()}>{item}</option>)}
        </select>
        <select value={genre} onChange={(event) => changeFilter(setGenre, event.target.value)}>
          <option value="all">All Genres</option>
          {(filterOptions.genres || []).map((item) => <option key={item} value={String(item).toLowerCase()}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
          <option value="episodes">Most Episodes</option>
          <option value="consistency">Most Consistent</option>
          <option value="latest">Latest Update</option>
        </select>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>Refresh</button>
      </div>

      <div className="story-update-table-wrap">
        {loading ? (
          <div className="story-update-loading"><span className="story-update-spinner" />Loading update activity...</div>
        ) : authors.length ? (
          <table className="story-update-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Author</th>
                <th>Stories Updated</th>
                <th>New Episodes</th>
                <th>Active Days</th>
                <th>Last Update</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((item) => {
                const author = item.author || {}
                const expanded = expandedAuthors.has(author.id)

                return (
                  <React.Fragment key={author.id || item.rank}>
                    <tr className="story-update-author-row" onClick={() => toggleAuthor(author.id)}>
                      <td><span className={`story-update-rank rank-${item.rank}`}>{item.rank}</span></td>
                      <td>
                        <div className="story-update-author-cell">
                          <div className="story-update-avatar">
                            {author.avatar_url ? <img src={author.avatar_url} alt={author.page_name || 'Author'} /> : String(author.page_name || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <strong>{author.page_name || 'Unknown Author'}</strong>
                            <span>@{author.page_username || 'no_username'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(item.stories_updated)}</td>
                      <td><strong className="story-update-episode-count">{formatNumber(item.new_episodes)}</strong></td>
                      <td>{formatNumber(item.active_days)}</td>
                      <td>{formatDateTime(item.last_update)}</td>
                      <td><button type="button" className="story-update-expand" aria-label={expanded ? 'Close details' : 'Open details'}>{expanded ? '−' : '+'}</button></td>
                    </tr>

                    {expanded ? (
                      <tr className="story-update-detail-row">
                        <td colSpan="7">
                          <div className="story-update-story-list">
                            {(item.stories || []).map((story) => (
                              <div key={story.id} className="story-update-story-item">
                                <div className="story-update-cover">
                                  {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
                                </div>
                                <div className="story-update-story-main">
                                  <strong>{story.title}</strong>
                                  <span>{storyTypeLabel(story.story_type)} · {story.story_language || '-'} · {story.main_genre || '-'}</span>
                                  <small>ID: {story.id}</small>
                                </div>
                                <div className="story-update-story-stat">
                                  <span>Episodes Published</span>
                                  <strong>{formatNumber(story.new_episodes)}</strong>
                                </div>
                                <div className="story-update-story-latest">
                                  <span>Latest Episode</span>
                                  <strong>EP {story.latest_episode?.episode_number || '-'}: {story.latest_episode?.title || '-'}</strong>
                                  <small>{formatDateTime(story.last_update)}</small>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        ) : <EmptyState />}
      </div>

      <div className="story-update-pagination">
        <div>Page {data.page || 1} of {data.total_pages || 1} · {formatNumber(data.total)} authors</div>
        <div>
          <button type="button" disabled={!data.has_prev || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button type="button" disabled={!data.has_next || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}

const styles = `
  .story-update-panel { border-top: 1px solid #E2E8F0; background: #FFFFFF; }
  .story-update-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 20px 20px 14px; }
  .story-update-kicker { color: #6D4AFF; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.7px; }
  .story-update-head h2 { margin: 4px 0 3px; color: #0F172A; font-size: 22px; }
  .story-update-head p { margin: 0; color: #64748B; font-size: 13px; font-weight: 700; }
  .story-update-period-tabs { display: flex; gap: 6px; padding: 4px; border: 1px solid #E2E8F0; border-radius: 13px; background: #F8FAFC; }
  .story-update-period-tabs button { border: 0; border-radius: 9px; padding: 9px 13px; background: transparent; color: #64748B; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .story-update-period-tabs button.active { background: #FFFFFF; color: #6D4AFF; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08); }
  .story-update-range-row { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 0 20px 18px; }
  .story-update-range-row > div { min-width: 230px; text-align: center; }
  .story-update-range-row strong { display: block; color: #0F172A; font-size: 14px; }
  .story-update-range-row span { display: block; margin-top: 3px; color: #64748B; font-size: 11px; font-weight: 800; }
  .story-update-arrow { width: 36px; height: 36px; border: 1px solid #E2E8F0; border-radius: 11px; background: #FFFFFF; color: #475569; font-size: 25px; line-height: 1; cursor: pointer; }
  .story-update-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
  .story-update-alert { margin: 0 20px 14px; border: 1px solid #FECACA; border-radius: 12px; background: #FEF2F2; color: #B91C1C; padding: 11px 13px; font-size: 13px; font-weight: 850; }
  .story-update-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 0 20px 18px; }
  .story-update-card { min-width: 0; border: 1px solid #E2E8F0; border-radius: 16px; background: #FFFFFF; padding: 15px; }
  .story-update-card.green { border-color: #BBF7D0; background: #F0FDF4; }
  .story-update-card.purple { border-color: #DDD6FE; background: #F5F3FF; }
  .story-update-card.yellow { border-color: #FDE68A; background: #FFFBEB; }
  .story-update-card-label { color: #64748B; font-size: 11px; font-weight: 950; }
  .story-update-card-value { margin-top: 7px; color: #0F172A; font-size: 22px; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .story-update-card-text { margin-top: 4px; color: #64748B; font-size: 11px; font-weight: 750; }
  .story-update-toolbar { display: grid; grid-template-columns: minmax(220px, 1fr) 150px 145px 145px 150px auto; gap: 9px; padding: 14px 20px; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; background: #FCFCFD; }
  .story-update-toolbar input, .story-update-toolbar select { min-width: 0; border: 1px solid #E2E8F0; border-radius: 11px; background: #FFFFFF; color: #0F172A; padding: 10px 11px; font-weight: 750; outline: none; }
  .story-update-toolbar input:focus, .story-update-toolbar select:focus { border-color: #6D4AFF; box-shadow: 0 0 0 3px rgba(109, 74, 255, 0.1); }
  .story-update-toolbar button, .story-update-pagination button { border: 0; border-radius: 11px; background: #F2EEFF; color: #6D4AFF; padding: 10px 13px; font-weight: 900; cursor: pointer; }
  .story-update-table-wrap { min-height: 360px; overflow-x: auto; }
  .story-update-table { width: 100%; min-width: 980px; border-collapse: collapse; }
  .story-update-table th { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; color: #64748B; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: 0.45px; }
  .story-update-table td { padding: 13px 14px; border-bottom: 1px solid #F1F5F9; color: #334155; font-size: 13px; font-weight: 750; vertical-align: middle; }
  .story-update-author-row { cursor: pointer; }
  .story-update-author-row:hover td { background: #FAFAFF; }
  .story-update-rank { display: inline-flex; width: 30px; height: 30px; align-items: center; justify-content: center; border-radius: 999px; background: #F1F5F9; color: #475569; font-weight: 950; }
  .story-update-rank.rank-1 { background: #FEF3C7; color: #A16207; }
  .story-update-rank.rank-2 { background: #E2E8F0; color: #475569; }
  .story-update-rank.rank-3 { background: #FFEDD5; color: #C2410C; }
  .story-update-author-cell { display: flex; align-items: center; gap: 10px; min-width: 210px; }
  .story-update-avatar { width: 42px; height: 42px; flex-shrink: 0; border-radius: 999px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #F2EEFF; color: #6D4AFF; font-weight: 950; }
  .story-update-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .story-update-author-cell strong { display: block; color: #0F172A; font-weight: 950; }
  .story-update-author-cell span { display: block; margin-top: 2px; color: #64748B; font-size: 11px; }
  .story-update-episode-count { color: #6D4AFF; font-size: 15px; }
  .story-update-expand { width: 32px; height: 32px; border: 0; border-radius: 10px; background: #F2EEFF; color: #6D4AFF; font-size: 20px; line-height: 1; cursor: pointer; }
  .story-update-detail-row td { padding: 0; background: #FAFAFC; }
  .story-update-story-list { padding: 10px 18px 16px 74px; }
  .story-update-story-item { display: grid; grid-template-columns: 44px minmax(220px, 1fr) 130px minmax(250px, 1fr); gap: 12px; align-items: center; padding: 12px; border: 1px solid #E7E3EF; border-radius: 14px; background: #FFFFFF; margin-top: 8px; }
  .story-update-cover { width: 42px; height: 56px; border-radius: 9px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #F2EEFF; color: #6D4AFF; }
  .story-update-cover img { width: 100%; height: 100%; object-fit: cover; }
  .story-update-story-main strong, .story-update-story-latest strong { display: block; color: #0F172A; font-weight: 950; }
  .story-update-story-main span, .story-update-story-latest span, .story-update-story-stat span { display: block; color: #64748B; font-size: 11px; font-weight: 750; margin-top: 3px; }
  .story-update-story-main small, .story-update-story-latest small { display: block; color: #94A3B8; font-size: 10px; margin-top: 4px; }
  .story-update-story-stat strong { display: block; margin-top: 4px; color: #6D4AFF; font-size: 18px; }
  .story-update-loading, .story-update-empty { min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: #64748B; font-weight: 850; }
  .story-update-loading { flex-direction: row; }
  .story-update-empty-icon { font-size: 32px; }
  .story-update-empty strong { color: #0F172A; font-size: 15px; }
  .story-update-empty span { font-size: 12px; }
  .story-update-spinner { width: 22px; height: 22px; border: 3px solid #E7E3EF; border-top-color: #6D4AFF; border-radius: 999px; animation: storyUpdateSpin 0.8s linear infinite; }
  .story-update-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 850; }
  .story-update-pagination > div:last-child { display: flex; gap: 8px; }
  .story-update-pagination button:disabled { opacity: 0.45; cursor: not-allowed; }
  @keyframes storyUpdateSpin { to { transform: rotate(360deg); } }
  @media (max-width: 1250px) {
    .story-update-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .story-update-toolbar { grid-template-columns: 1fr 1fr 1fr; }
  }
  @media (max-width: 760px) {
    .story-update-head { flex-direction: column; }
    .story-update-period-tabs { width: 100%; overflow-x: auto; }
    .story-update-summary, .story-update-toolbar { grid-template-columns: 1fr; }
    .story-update-story-list { padding: 8px 12px 14px; }
    .story-update-story-item { grid-template-columns: 44px 1fr; }
    .story-update-story-stat, .story-update-story-latest { grid-column: 2; }
    .story-update-pagination { align-items: flex-start; flex-direction: column; }
  }
`
