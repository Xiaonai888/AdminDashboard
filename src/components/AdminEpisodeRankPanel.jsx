import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function shortId(value) {
  const text = String(value || '')
  if (text.length <= 10) return text
  return `${text.slice(0, 8)}...`
}

function copyText(value) {
  if (!value) return
  navigator.clipboard?.writeText(String(value)).catch(() => {})
}

export default function AdminEpisodeRankPanel() {
  const [episodes, setEpisodes] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cached, setCached] = useState(false)
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

    async function loadEpisodeRanking() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/episodes?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load episode ranking')
        }

        if (!alive) return

        setEpisodes(data.episodes || data.rankings || [])
        setCached(Boolean(data.cached))
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load episode ranking')
        setEpisodes([])
        setPagination({
          page: 1,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        })
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadEpisodeRanking()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch, refreshKey])

  return (
    <>
      {error ? <div className="ranking-alert" style={{ margin: 16 }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 10, padding: 14, borderBottom: '1px solid #E2E8F0' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search episode, story, author, or ID..."
          style={{
            width: '100%',
            height: 42,
            boxSizing: 'border-box',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            color: '#0F172A',
            borderRadius: 13,
            padding: '0 13px',
            outline: 'none',
            font: 'inherit',
            fontSize: 13,
            fontWeight: 750,
          }}
        />
        <button
          type="button"
          className="ranking-btn"
          style={{ padding: '0 16px' }}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </div>

      <div style={{ padding: '10px 18px', borderBottom: '1px solid #E2E8F0' }}>
        <div className="ranking-muted">
          All-time real data · 15 min cache · {cached ? 'Cached data' : 'Fresh data'} · Score = Views + Likes × 5 + Comments × 10
        </div>
      </div>

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 1120 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Episode</th>
              <th>Episode ID</th>
              <th>Story</th>
              <th>Author</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && episodes.map((episode) => (
              <tr key={episode.id}>
                <td><span className="ranking-rank">#{episode.rank}</span></td>
                <td>
                  <div className="ranking-title">{episode.title || 'Untitled Episode'}</div>
                  <div className="ranking-muted">Episode {formatNumber(episode.episode_number)}</div>
                </td>
                <td>
                  <button type="button" className="ranking-id-btn" onClick={() => copyText(episode.id)}>
                    {shortId(episode.id)}
                  </button>
                </td>
                <td>
                  <div className="ranking-title">{episode.story_title || 'Untitled Story'}</div>
                  <div className="ranking-muted">Story ID: {shortId(episode.story_id)}</div>
                </td>
                <td>
                  <div className="ranking-title">{episode.author_name || 'Unknown Author'}</div>
                  <div className="ranking-muted">@{episode.author_username || 'no_username'}</div>
                </td>
                <td>{formatNumber(episode.total_views)}</td>
                <td>{formatNumber(episode.total_likes)}</td>
                <td>{formatNumber(episode.total_comments)}</td>
                <td><span className="ranking-score">{formatNumber(episode.score)}</span></td>
                <td>
                  <div className="ranking-actions">
                    <button type="button" onClick={() => copyText(episode.id)}>Copy ID</button>
                    <button type="button" onClick={() => copyText(episode.story_id)}>Story ID</button>
                    <button type="button" onClick={() => copyText(episode.author_id)}>Author ID</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="ranking-loading">
            <span className="ranking-spinner" />
            <div className="ranking-empty-title">Loading Episode Rank...</div>
            <div className="ranking-empty-text">Loading real episode ranking data.</div>
          </div>
        ) : !episodes.length && !error ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">🏆</div>
            <div className="ranking-empty-title">No Episode Rank data</div>
            <div className="ranking-empty-text">No published episodes from visible ranking stories were found.</div>
          </div>
        ) : null}
      </div>

      <div className="ranking-pagination">
        <span>{formatNumber(pagination.total)} episodes · Page {pagination.page} of {pagination.total_pages}</span>
        <button
          type="button"
          disabled={!pagination.has_prev || loading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.has_next || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </>
  )
}
