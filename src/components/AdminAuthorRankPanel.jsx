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

export default function AdminAuthorRankPanel() {
  const [authors, setAuthors] = useState([])
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
  const [hideAuthor, setHideAuthor] = useState(null)
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

    async function loadAuthorRanking() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/authors?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load author ranking')
        }

        if (!alive) return

        setAuthors(data.authors || data.rankings || [])
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
        setError(err.message || 'Failed to load author ranking')
        setAuthors([])
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

    loadAuthorRanking()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch, refreshKey])

  function openHideModal(author) {
    setHideAuthor(author)
    setHideReason('')
    setHideNote('')
    setError('')
  }

  function closeHideModal() {
    if (saving) return
    setHideAuthor(null)
    setHideReason('')
    setHideNote('')
  }

  async function submitHideAuthor() {
    if (!hideAuthor?.id || hideReason.trim().length < 5) return

    try {
      setSaving(true)
      setError('')

      const response = await fetch(`${API_URL}/api/admin/ranking/authors/${hideAuthor.id}/visibility`, {
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
        throw new Error(data.message || 'Failed to hide author from ranking')
      }

      setHideAuthor(null)
      setHideReason('')
      setHideNote('')
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to hide author from ranking')
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
          placeholder="Search author name, username, or ID..."
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
          All-time real data · 15 min cache · {cached ? 'Cached data' : 'Fresh data'} · Score = Views + Likes × 5 + Comments × 10 + Followers × 20 + Stories × 3
        </div>
      </div>

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 1160 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Author</th>
              <th>Author ID</th>
              <th>Username</th>
              <th>Stories</th>
              <th>Followers</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && authors.map((author) => (
              <tr key={author.id}>
                <td><span className="ranking-rank">#{author.rank}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 190 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        overflow: 'hidden',
                        background: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {author.avatar_url
                        ? <img src={author.avatar_url} alt={author.page_name || 'Author'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'}
                    </div>
                    <div>
                      <div className="ranking-title">{author.page_name || 'Unknown Author'}</div>
                      <div className="ranking-muted">@{author.page_username || 'no_username'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <button type="button" className="ranking-id-btn" onClick={() => copyText(author.id)}>
                    {shortId(author.id)}
                  </button>
                </td>
                <td>@{author.page_username || '-'}</td>
                <td>{formatNumber(author.story_count)}</td>
                <td>{formatNumber(author.total_followers)}</td>
                <td>{formatNumber(author.total_views)}</td>
                <td>{formatNumber(author.total_likes)}</td>
                <td>{formatNumber(author.total_comments)}</td>
                <td><span className="ranking-score">{formatNumber(author.score)}</span></td>
                <td>
                  <div className="ranking-actions">
                    <button type="button" onClick={() => copyText(author.id)}>Copy ID</button>
                    <button type="button" onClick={() => copyText(author.user_id)}>User ID</button>
                    <button type="button" className="ranking-danger-btn" onClick={() => openHideModal(author)}>Hide</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="ranking-loading">
            <span className="ranking-spinner" />
            <div className="ranking-empty-title">Loading Author Rank...</div>
            <div className="ranking-empty-text">Loading real author ranking data.</div>
          </div>
        ) : !authors.length && !error ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">🏆</div>
            <div className="ranking-empty-title">No Author Rank data</div>
            <div className="ranking-empty-text">No active visible authors with published ranking stories were found.</div>
          </div>
        ) : null}
      </div>

      <div className="ranking-pagination">
        <span>{formatNumber(pagination.total)} authors · Page {pagination.page} of {pagination.total_pages}</span>
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

      {hideAuthor ? (
        <div className="ranking-modal-layer" onMouseDown={closeHideModal}>
          <div className="ranking-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="ranking-modal-top">
              <div>
                <div className="ranking-kicker">Ranking Visibility</div>
                <h3>Hide Author from Ranking</h3>
              </div>
              <button type="button" className="ranking-modal-close" onClick={closeHideModal}>×</button>
            </div>

            <div className="ranking-modal-story">
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {hideAuthor.avatar_url
                  ? <img src={hideAuthor.avatar_url} alt={hideAuthor.page_name || 'Author'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '👤'}
              </div>
              <div>
                <div className="ranking-title">{hideAuthor.page_name || 'Unknown Author'}</div>
                <div className="ranking-muted">@{hideAuthor.page_username || 'no_username'}</div>
              </div>
            </div>

            <label className="ranking-modal-field">
              <span>Hidden Reason</span>
              <textarea
                value={hideReason}
                onChange={(event) => setHideReason(event.target.value)}
                placeholder="Write why this author should be hidden from ranking..."
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
                onClick={submitHideAuthor}
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
