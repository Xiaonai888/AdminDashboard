import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const DEFAULT_FORMULA = 'score = views*1 + likes*5 + comments*10'

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
  const [enabled, setEnabled] = useState(true)
  const [formula, setFormula] = useState(DEFAULT_FORMULA)
  const [minimumActivity, setMinimumActivity] = useState({ views: 0, likes: 0, comments: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const [hideEpisode, setHideEpisode] = useState(null)
  const [hideReason, setHideReason] = useState('')
  const [hideNote, setHideNote] = useState('')
  const [saving, setSaving] = useState(false)

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
        setEnabled(data.enabled !== false)
        setFormula(data.formula || DEFAULT_FORMULA)
        setMinimumActivity({
          views: Number(data.minimum_activity?.views ?? 0),
          likes: Number(data.minimum_activity?.likes ?? 0),
          comments: Number(data.minimum_activity?.comments ?? 0),
        })
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

  function openHideModal(episode) {
    setHideEpisode(episode)
    setHideReason('')
    setHideNote('')
    setError('')
  }

  function closeHideModal() {
    if (saving) return
    setHideEpisode(null)
    setHideReason('')
    setHideNote('')
  }

  async function submitHideEpisode() {
    if (!hideEpisode?.id || hideReason.trim().length < 5) return

    try {
      setSaving(true)
      setError('')

      const response = await fetch(`${API_URL}/api/admin/ranking/episodes/${hideEpisode.id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          ranking_visibility_status: 'hidden',
          reason: hideReason.trim(),
          note: hideNote.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to hide episode from ranking')
      }

      setHideEpisode(null)
      setHideReason('')
      setHideNote('')
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to hide episode from ranking')
    } finally {
      setSaving(false)
    }
  }

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
          {enabled
            ? `All-time real data · 15 min cache · ${cached ? 'Cached data' : 'Fresh data'} · ${formula} · Min: ${formatNumber(minimumActivity.views)} views / ${formatNumber(minimumActivity.likes)} likes / ${formatNumber(minimumActivity.comments)} comments`
            : 'Episode Rank is disabled in Ranking Settings.'}
        </div>
      </div>

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 1180 }}>
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
                    <button type="button" className="ranking-danger-btn" onClick={() => openHideModal(episode)}>Hide</button>
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
            <div className="ranking-empty-title">{enabled ? 'No Episode Rank data' : 'Episode Rank is disabled'}</div>
            <div className="ranking-empty-text">
              {enabled
                ? 'No published visible episodes matched the current ranking settings.'
                : 'Enable Episode Rank from Ranking Settings to show results.'}
            </div>
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

      {hideEpisode ? (
        <div className="ranking-modal-layer" onMouseDown={closeHideModal}>
          <div className="ranking-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="ranking-modal-top">
              <div>
                <div className="ranking-kicker">Ranking Visibility</div>
                <h3>Hide Episode from Ranking</h3>
              </div>
              <button type="button" className="ranking-modal-close" onClick={closeHideModal}>×</button>
            </div>

            <div className="ranking-modal-story">
              <div className="ranking-cover">{hideEpisode.cover_url ? <img src={hideEpisode.cover_url} alt={hideEpisode.title || 'Episode'} /> : '📖'}</div>
              <div>
                <div className="ranking-title">{hideEpisode.title || 'Untitled Episode'}</div>
                <div className="ranking-muted">{hideEpisode.story_title || 'Untitled Story'} · Episode {formatNumber(hideEpisode.episode_number)}</div>
              </div>
            </div>

            <label className="ranking-modal-field">
              <span>Hidden Reason</span>
              <textarea
                value={hideReason}
                onChange={(event) => setHideReason(event.target.value)}
                placeholder="Write why this episode should be hidden from ranking..."
              />
            </label>

            <label className="ranking-modal-field">
              <span>Admin Note</span>
              <textarea
                value={hideNote}
                onChange={(event) => setHideNote(event.target.value)}
                placeholder="Optional internal note..."
              />
            </label>

            <div className="ranking-modal-actions">
              <button type="button" className="ranking-btn light" disabled={saving} onClick={closeHideModal}>Cancel</button>
              <button
                type="button"
                className="ranking-danger-btn"
                disabled={saving || hideReason.trim().length < 5}
                onClick={submitHideEpisode}
              >
                {saving ? 'Saving...' : 'Hide from Ranking'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
