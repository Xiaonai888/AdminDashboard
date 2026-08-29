import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .admin-music-page {
    --am-primary: #3B82F6;
    --am-primary-hover: #2563EB;
    --am-text: #0F172A;
    --am-muted: #64748B;
    --am-soft: #94A3B8;
    --am-border: #E2E8F0;
    --am-card: #FFFFFF;
    color: var(--am-text);
  }

  .am-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .am-intro {
    max-width: 560px;
  }

  .am-intro-title {
    margin: 0;
    font-size: 20px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .am-intro-text {
    margin-top: 5px;
    color: var(--am-muted);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.55;
  }

  .am-primary-btn,
  .am-secondary-btn,
  .am-manage-btn {
    min-height: 40px;
    border-radius: 11px;
    padding: 0 14px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: transform .16s ease, background .16s ease, border-color .16s ease;
  }

  .am-primary-btn {
    border: 1px solid var(--am-primary);
    background: var(--am-primary);
    color: #FFFFFF;
  }

  .am-primary-btn:hover {
    background: var(--am-primary-hover);
    border-color: var(--am-primary-hover);
  }

  .am-primary-btn:disabled,
  .am-secondary-btn:disabled,
  .am-manage-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .am-secondary-btn,
  .am-manage-btn {
    border: 1px solid var(--am-border);
    background: #FFFFFF;
    color: var(--am-text);
  }

  .am-secondary-btn:hover,
  .am-manage-btn:hover {
    border-color: #CBD5E1;
    background: #F8FAFC;
  }

  .am-primary-btn:active,
  .am-secondary-btn:active,
  .am-manage-btn:active {
    transform: scale(.98);
  }

  .am-label {
    display: block;
    margin: 0 0 7px;
    color: #334155;
    font-size: 10px;
    font-weight: 850;
  }

  .am-input,
  .am-select {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--am-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--am-text);
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .am-input::placeholder {
    color: var(--am-soft);
  }

  .am-input:focus,
  .am-select:focus {
    border-color: var(--am-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
  }

  .am-search-wrap {
    margin-bottom: 14px;
  }

  .am-card {
    border: 1px solid var(--am-border);
    border-radius: 16px;
    background: var(--am-card);
  }

  .am-create-card,
  .am-song-card,
  .am-release-card {
    padding: 16px;
    margin-bottom: 20px;
  }

  .am-card-title {
    margin: 0;
    font-size: 13px;
    font-weight: 950;
  }

  .am-card-subtitle {
    margin-top: 4px;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .am-form-space {
    margin-top: 14px;
  }

  .am-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }

  .am-form-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 10px;
  }

  .am-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 10px;
  }

  .am-section-title {
    margin: 0;
    font-size: 13px;
    font-weight: 950;
  }

  .am-section-count {
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .am-artist-list {
    display: grid;
    gap: 10px;
    margin-bottom: 20px;
  }

  .am-artist-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 11px;
    border: 1px solid var(--am-border);
    border-radius: 15px;
    background: #FFFFFF;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .am-artist-row:hover {
    border-color: #CBD5E1;
    box-shadow: 0 3px 12px rgba(15, 23, 42, .04);
  }

  .am-avatar {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #4B5563, #17191B);
    color: #FFFFFF;
    flex-shrink: 0;
    overflow: hidden;
  }

  .am-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .am-artist-name {
    margin: 0;
    color: var(--am-text);
    font-size: 12px;
    font-weight: 950;
  }

  .am-artist-meta {
    margin-top: 4px;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 650;
  }

  .am-manage-card {
    margin: -10px 0 20px;
    padding: 14px;
    border: 1px solid #BFDBFE;
    border-radius: 15px;
    background: #F8FBFF;
  }

  .am-manage-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .am-manage-name {
    color: #1D4ED8;
    font-size: 12px;
    font-weight: 950;
  }

  .am-manage-meta {
    margin-top: 4px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
  }

  .am-mini-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .am-mini-card {
    border: 1px solid #DBEAFE;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 10px;
  }

  .am-mini-label {
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .am-mini-value {
    margin-top: 3px;
    font-size: 13px;
    font-weight: 950;
  }

  .am-release-list {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .am-release-row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    border: 1px solid #DBEAFE;
    border-radius: 12px;
    background: #FFFFFF;
    padding: 8px;
  }

  .am-release-cover {
    width: 42px;
    height: 42px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #334155, #0F172A);
    color: #FFFFFF;
    overflow: hidden;
  }

  .am-release-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .am-release-title {
    font-size: 11px;
    font-weight: 950;
  }

  .am-release-meta {
    margin-top: 3px;
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 700;
  }

  .am-song-card {
    padding: 16px;
  }

  .am-song-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .am-play-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--am-text);
    background: #F8FAFC;
    border: 1px solid var(--am-border);
  }

  .am-song-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  .am-field-card {
    min-width: 0;
    border: 1px solid var(--am-border);
    border-radius: 11px;
    padding: 10px;
    background: #FFFFFF;
  }

  .am-field-label {
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .am-field-value {
    margin-top: 3px;
    font-size: 11px;
    font-weight: 950;
  }

  .am-preview-btn {
    width: 100%;
    margin-top: 10px;
  }

  .am-notice {
    margin-top: 12px;
    border-radius: 11px;
    padding: 10px 12px;
    background: #F8FAFC;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
    line-height: 1.5;
  }

  .am-notice.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .am-empty,
  .am-loading {
    border: 1px dashed var(--am-border);
    border-radius: 14px;
    padding: 22px;
    color: var(--am-muted);
    text-align: center;
    font-size: 11px;
    font-weight: 750;
  }

  @media (max-width: 640px) {
    .am-toolbar {
      gap: 10px;
    }

    .am-intro-title {
      font-size: 17px;
    }

    .am-primary-btn,
    .am-secondary-btn,
    .am-manage-btn {
      min-height: 38px;
      padding: 0 12px;
    }

    .am-create-card,
    .am-song-card,
    .am-release-card {
      padding: 13px;
    }

    .am-artist-row {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 9px;
      padding: 10px;
    }

    .am-avatar {
      width: 44px;
      height: 44px;
    }

    .am-manage-btn {
      font-size: 10px;
      padding: 0 11px;
    }

    .am-form-grid {
      grid-template-columns: 1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function musicRequest(path, options = {}) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin login required')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Music request failed')
  }

  return data
}

function MusicIcon({ size = 23 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6c0 .92 1.02 1.48 1.8.98l10.1-6.8a1.16 1.16 0 0 0 0-1.96L9.8 4.22C9.02 3.72 8 4.28 8 5.2Z" />
    </svg>
  )
}

export default function AdminMusicPage() {
  const [artists, setArtists] = useState([])
  const [query, setQuery] = useState('')
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [artistName, setArtistName] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [selectedArtistDetail, setSelectedArtistDetail] = useState(null)
  const [releaseTitle, setReleaseTitle] = useState('')
  const [releaseType, setReleaseType] = useState('single')
  const [releaseCoverUrl, setReleaseCoverUrl] = useState('')
  const [releaseYear, setReleaseYear] = useState(String(new Date().getFullYear()))
  const [songReleaseId, setSongReleaseId] = useState('')
  const [songTitle, setSongTitle] = useState('')
  const [youtubeLink, setYoutubeLink] = useState('')
  const [youtubeViews, setYoutubeViews] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await musicRequest('/api/music/admin/artists')
      setArtists(Array.isArray(data.artists) ? data.artists : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadArtist = useCallback(async (artistId) => {
    if (!artistId) {
      setSelectedArtistDetail(null)
      setSongReleaseId('')
      return
    }

    setError('')

    try {
      const data = await musicRequest(`/api/music/admin/artists/${encodeURIComponent(artistId)}`)
      setSelectedArtistDetail(data)
      const releases = Array.isArray(data.releases) ? data.releases : []
      setSongReleaseId((current) => releases.some((release) => release.id === current) ? current : releases[0]?.id || '')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  const filteredArtists = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return artists
    return artists.filter((artist) => String(artist.name || '').toLowerCase().includes(keyword))
  }, [artists, query])

  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId) || null
  const releases = Array.isArray(selectedArtistDetail?.releases) ? selectedArtistDetail.releases : []

  async function addArtist() {
    const name = artistName.trim()
    if (!name) {
      setError('Enter an artist name first.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/artists', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      setArtistName('')
      setShowArtistForm(false)
      setNotice(`${data.artist?.name || name} created.`)
      await loadOverview()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function manageArtist(artistId) {
    if (selectedArtistId === artistId) {
      setSelectedArtistId('')
      setSelectedArtistDetail(null)
      setSongReleaseId('')
      return
    }

    setSelectedArtistId(artistId)
    await loadArtist(artistId)
  }

  async function createRelease() {
    if (!selectedArtistId) {
      setError('Choose an artist first.')
      return
    }

    const title = releaseTitle.trim()
    if (!title) {
      setError('Enter an album or single title first.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: releaseType,
          cover_url: releaseCoverUrl.trim(),
          release_year: Number(releaseYear) || new Date().getFullYear(),
        }),
      })

      setReleaseTitle('')
      setReleaseCoverUrl('')
      setSongReleaseId(data.release?.id || '')
      setNotice(`${data.release?.title || title} created.`)
      await Promise.all([loadOverview(), loadArtist(selectedArtistId)])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function addSong() {
    const title = songTitle.trim()
    const youtubeUrl = youtubeLink.trim()

    if (!songReleaseId) {
      setError('Create or choose an Album/Single first.')
      return
    }

    if (!title) {
      setError('Enter the song title first.')
      return
    }

    if (!youtubeUrl) {
      setError('Paste a YouTube link first.')
      return
    }

    const selectedRelease = releases.find((release) => release.id === songReleaseId)
    const nextTrack = (selectedRelease?.songs?.length || 0) + 1

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          release_id: songReleaseId,
          title,
          youtube_url: youtubeUrl,
          youtube_view_count: Math.max(0, Number.parseInt(youtubeViews, 10) || 0),
          track_number: nextTrack,
        }),
      })

      setSongTitle('')
      setYoutubeLink('')
      setYoutubeViews('0')
      setNotice(`${data.song?.title || title} added.`)
      await Promise.all([loadOverview(), loadArtist(selectedArtistId)])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout
      title="Music"
      subtitle="Create artists, albums, singles and connect YouTube songs."
    >
      <style>{styles}</style>

      <div className="admin-music-page">
        <div className="am-toolbar">
          <div className="am-intro">
            <h2 className="am-intro-title">Music</h2>
            <div className="am-intro-text">Create artists, albums, singles and connect YouTube songs.</div>
          </div>

          <button type="button" className="am-primary-btn" onClick={() => setShowArtistForm(true)}>
            + Artist
          </button>
        </div>

        <div className="am-search-wrap">
          <label className="am-label" htmlFor="admin-music-search">Search artist</label>
          <input
            id="admin-music-search"
            className="am-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artist..."
          />
        </div>

        {showArtistForm ? (
          <div className="am-card am-create-card">
            <h3 className="am-card-title">New Artist</h3>
            <div className="am-form-space">
              <label className="am-label" htmlFor="admin-music-artist-name">Artist name</label>
              <input
                id="admin-music-artist-name"
                className="am-input"
                value={artistName}
                onChange={(event) => setArtistName(event.target.value)}
                placeholder="Artist name"
              />
            </div>
            <div className="am-form-actions">
              <button type="button" className="am-primary-btn" disabled={saving} onClick={addArtist}>Save</button>
              <button type="button" className="am-secondary-btn" disabled={saving} onClick={() => setShowArtistForm(false)}>Cancel</button>
            </div>
          </div>
        ) : null}

        <div className="am-section-head">
          <h3 className="am-section-title">Artists</h3>
          <div className="am-section-count">{artists.length} artists</div>
        </div>

        <div className="am-artist-list">
          {loading ? (
            <div className="am-loading">Loading music...</div>
          ) : filteredArtists.length ? filteredArtists.map((artist) => (
            <div className="am-artist-row" key={artist.id}>
              <div className="am-avatar">
                {artist.avatar_url ? <img src={artist.avatar_url} alt="" /> : <MusicIcon />}
              </div>
              <div>
                <h4 className="am-artist-name">{artist.name}</h4>
                <div className="am-artist-meta">
                  {Number(artist.album_count || 0)} Albums • {Number(artist.single_count || 0)} Singles • {Number(artist.song_count || 0)} Songs
                </div>
              </div>
              <button type="button" className="am-manage-btn" onClick={() => manageArtist(artist.id)}>
                {selectedArtistId === artist.id ? 'Close' : 'Manage'}
              </button>
            </div>
          )) : (
            <div className="am-empty">No artist found.</div>
          )}
        </div>

        {selectedArtist ? (
          <>
            <div className="am-manage-card">
              <div className="am-manage-top">
                <div>
                  <div className="am-manage-name">Manage Artist → {selectedArtist.name}</div>
                  <div className="am-manage-meta">Albums / Singles / Songs</div>
                </div>
                <button type="button" className="am-secondary-btn" onClick={() => manageArtist(selectedArtist.id)}>Close</button>
              </div>

              <div className="am-mini-grid">
                <div className="am-mini-card">
                  <div className="am-mini-label">Albums</div>
                  <div className="am-mini-value">{Number(selectedArtist.album_count || 0)}</div>
                </div>
                <div className="am-mini-card">
                  <div className="am-mini-label">Singles</div>
                  <div className="am-mini-value">{Number(selectedArtist.single_count || 0)}</div>
                </div>
                <div className="am-mini-card">
                  <div className="am-mini-label">Songs</div>
                  <div className="am-mini-value">{Number(selectedArtist.song_count || 0)}</div>
                </div>
              </div>

              {releases.length ? (
                <div className="am-release-list">
                  {releases.map((release) => (
                    <div className="am-release-row" key={release.id}>
                      <div className="am-release-cover">
                        {release.cover_url ? <img src={release.cover_url} alt="" /> : <MusicIcon size={18} />}
                      </div>
                      <div>
                        <div className="am-release-title">{release.title}</div>
                        <div className="am-release-meta">
                          {release.release_type === 'album' ? 'Album' : 'Single'} • {release.release_year || ''} • {release.songs?.length || 0} Songs
                        </div>
                      </div>
                      <button type="button" className="am-manage-btn" onClick={() => setSongReleaseId(release.id)}>Use</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="am-card am-release-card">
              <h3 className="am-card-title">New Album / Single</h3>
              <div className="am-card-subtitle">Create the release before adding its YouTube song.</div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-release-title">Title</label>
                <input
                  id="admin-music-release-title"
                  className="am-input"
                  value={releaseTitle}
                  onChange={(event) => setReleaseTitle(event.target.value)}
                  placeholder="Album or single title"
                />
              </div>

              <div className="am-form-grid">
                <div>
                  <label className="am-label" htmlFor="admin-music-release-type">Type</label>
                  <select id="admin-music-release-type" className="am-select" value={releaseType} onChange={(event) => setReleaseType(event.target.value)}>
                    <option value="single">Single</option>
                    <option value="album">Album</option>
                  </select>
                </div>
                <div>
                  <label className="am-label" htmlFor="admin-music-release-year">Year</label>
                  <input
                    id="admin-music-release-year"
                    className="am-input"
                    inputMode="numeric"
                    value={releaseYear}
                    onChange={(event) => setReleaseYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-cover-url">Square Cover URL</label>
                <input
                  id="admin-music-cover-url"
                  className="am-input"
                  type="url"
                  value={releaseCoverUrl}
                  onChange={(event) => setReleaseCoverUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button type="button" className="am-primary-btn am-preview-btn" disabled={saving} onClick={createRelease}>Create Release</button>
            </div>

            <div className="am-card am-song-card">
              <div className="am-song-head">
                <div>
                  <h3 className="am-card-title">Add Song</h3>
                  <div className="am-card-subtitle">YouTube is the media source</div>
                </div>
                <div className="am-play-icon"><PlayIcon /></div>
              </div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-song-release">Album / Single</label>
                <select
                  id="admin-music-song-release"
                  className="am-select"
                  value={songReleaseId}
                  onChange={(event) => setSongReleaseId(event.target.value)}
                  disabled={!releases.length}
                >
                  {!releases.length ? <option value="">Create Album/Single first</option> : null}
                  {releases.map((release) => (
                    <option key={release.id} value={release.id}>{release.title} — {release.release_type}</option>
                  ))}
                </select>
              </div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-song-title">Song title</label>
                <input
                  id="admin-music-song-title"
                  className="am-input"
                  value={songTitle}
                  onChange={(event) => setSongTitle(event.target.value)}
                  placeholder="Song title"
                />
              </div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-youtube-link">YouTube Link</label>
                <input
                  id="admin-music-youtube-link"
                  className="am-input"
                  type="url"
                  value={youtubeLink}
                  onChange={(event) => setYoutubeLink(event.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="am-form-space">
                <label className="am-label" htmlFor="admin-music-youtube-views">YouTube Views</label>
                <input
                  id="admin-music-youtube-views"
                  className="am-input"
                  inputMode="numeric"
                  value={youtubeViews}
                  onChange={(event) => setYoutubeViews(event.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="0"
                />
              </div>

              <div className="am-song-grid">
                <div className="am-field-card">
                  <div className="am-field-label">Popular</div>
                  <div className="am-field-value">1K+ Views</div>
                </div>
                <div className="am-field-card">
                  <div className="am-field-label">Player</div>
                  <div className="am-field-value">YouTube Embed</div>
                </div>
              </div>

              <button type="button" className="am-primary-btn am-preview-btn" disabled={saving || !releases.length} onClick={addSong}>Save Song</button>
            </div>
          </>
        ) : null}

        <div className={`am-notice${error ? ' error' : ''}`}>
          {error || notice || 'Music data is connected to Shadow Backend.'}
        </div>
      </div>
    </AdminLayout>
  )
}
