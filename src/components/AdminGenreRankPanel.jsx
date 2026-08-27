import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
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

export default function AdminGenreRankPanel() {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [meta, setMeta] = useState({ generated_at: null, cached: false, cache_ttl_seconds: 900 })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let alive = true

    async function loadGenreRanking() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/api/admin/ranking/genres`, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load genre ranking')
        }

        if (!alive) return

        setGenres(data.genres || data.rankings || [])
        setEnabled(data.enabled !== false)
        setMeta({
          generated_at: data.generated_at || null,
          cached: Boolean(data.cached),
          cache_ttl_seconds: Number(data.cache_ttl_seconds || 900),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load genre ranking')
        setGenres([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadGenreRanking()

    return () => {
      alive = false
    }
  }, [refreshKey])

  if (loading) {
    return (
      <div className="ranking-loading">
        <span className="ranking-spinner" />
        <div className="ranking-empty-title">Loading Genre Rank...</div>
        <div className="ranking-empty-text">Loading real story genre data.</div>
      </div>
    )
  }

  return (
    <>
      {error ? <div className="ranking-alert" style={{ margin: 16 }}>{error}</div> : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
        <div>
          <div className="ranking-title">
            {enabled ? 'Main Genre popularity by total story views' : 'Genre Rank is disabled'}
          </div>
          <div className="ranking-muted">
            {enabled
              ? `Updated ${formatDateTime(meta.generated_at)} · Cache ${Math.round(meta.cache_ttl_seconds / 60)} min · ${meta.cached ? 'Cached data' : 'Fresh data'}`
              : 'Enable Genre Rank from Ranking Settings to show results.'}
          </div>
        </div>
        <button type="button" className="ranking-btn" style={{ padding: '0 16px' }} onClick={() => setRefreshKey((value) => value + 1)}>
          Refresh
        </button>
      </div>

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Main Genre</th>
              <th>Stories</th>
              <th>Total Views</th>
              <th>Avg Views</th>
              <th>View Share</th>
              <th>Likes</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.genre}>
                <td><span className="ranking-rank">#{genre.rank}</span></td>
                <td>
                  <div className="ranking-title">{genre.genre}</div>
                  <div className="ranking-muted">Main Genre</div>
                </td>
                <td>{formatNumber(genre.story_count)}</td>
                <td><span className="ranking-score">{formatNumber(genre.total_views)}</span></td>
                <td>{formatNumber(genre.average_views)}</td>
                <td>{Number(genre.view_share_percent || 0).toFixed(2)}%</td>
                <td>{formatNumber(genre.total_likes)}</td>
                <td>{formatNumber(genre.total_comments)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!genres.length && !error ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">🏆</div>
            <div className="ranking-empty-title">{enabled ? 'No Genre Rank data' : 'Genre Rank is disabled'}</div>
            <div className="ranking-empty-text">
              {enabled
                ? 'No published Main Genre data was found.'
                : 'Enable Genre Rank from Ranking Settings to show results.'}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
