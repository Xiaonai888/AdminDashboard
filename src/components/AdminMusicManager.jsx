import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .amm-wrap {
    display: grid;
    gap: 12px;
    margin: -8px 0 20px;
  }

  .amm-card {
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
    padding: 16px;
  }

  .amm-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .amm-title {
    margin: 0;
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
  }

  .amm-subtitle {
    margin-top: 4px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.45;
  }

  .amm-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .amm-field {
    min-width: 0;
  }

  .amm-field.full {
    grid-column: 1 / -1;
  }

  .amm-label {
    display: block;
    margin-bottom: 6px;
    color: #334155;
    font-size: 10px;
    font-weight: 850;
  }

  .amm-input,
  .amm-select,
  .amm-textarea {
    width: 100%;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .amm-input,
  .amm-select {
    min-height: 42px;
  }

  .amm-textarea {
    min-height: 86px;
    padding-top: 10px;
    padding-bottom: 10px;
    resize: vertical;
  }

  .amm-input:focus,
  .amm-select:focus,
  .amm-textarea:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
  }

  .amm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .amm-btn {
    min-height: 39px;
    border-radius: 10px;
    padding: 0 13px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    transition: transform .15s ease, background .15s ease, border-color .15s ease;
  }

  .amm-btn:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  .amm-btn.primary {
    border-color: #3B82F6;
    background: #3B82F6;
    color: #FFFFFF;
  }

  .amm-btn.primary:hover {
    border-color: #2563EB;
    background: #2563EB;
  }

  .amm-btn.danger {
    border-color: #FECACA;
    background: #FFF7F7;
    color: #B91C1C;
  }

  .amm-btn.danger:hover {
    border-color: #FCA5A5;
    background: #FEF2F2;
  }

  .amm-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .amm-check {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    color: #334155;
    font-size: 10px;
    font-weight: 850;
  }

  .amm-check input {
    width: 16px;
    height: 16px;
    accent-color: #3B82F6;
  }

  .amm-preview {
    display: grid;
    grid-template-columns: 74px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    margin-top: 12px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #F8FAFC;
    padding: 10px;
  }

  .amm-avatar {
    width: 74px;
    height: 74px;
    border-radius: 999px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #475569, #111827);
    color: #FFFFFF;
    font-size: 22px;
    font-weight: 900;
  }

  .amm-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .amm-preview-name {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
  }

  .amm-preview-subtitle {
    margin-top: 4px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
  }

  .amm-release-preview {
    width: 74px;
    height: 74px;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #334155, #0F172A);
    color: #FFFFFF;
    font-size: 22px;
  }

  .amm-release-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .amm-status {
    margin-top: 10px;
    border-radius: 10px;
    padding: 9px 11px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 10px;
    font-weight: 750;
    line-height: 1.45;
  }

  .amm-status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .amm-empty {
    border: 1px dashed #CBD5E1;
    border-radius: 12px;
    padding: 18px;
    color: #64748B;
    text-align: center;
    font-size: 10px;
    font-weight: 750;
  }

  .amm-video {
    position: relative;
    aspect-ratio: 16 / 9;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 13px;
    background: #000000;
  }

  .amm-video iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  @media (max-width: 640px) {
    .amm-card {
      padding: 13px;
    }

    .amm-grid {
      grid-template-columns: 1fr;
    }

    .amm-field.full {
      grid-column: auto;
    }

    .amm-preview {
      grid-template-columns: 62px minmax(0, 1fr);
    }

    .amm-avatar,
    .amm-release-preview {
      width: 62px;
      height: 62px;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function request(path, options = {}) {
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

function youtubeVideoId(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')
    let id = ''

    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v') || ''
      } else {
        const parts = url.pathname.split('/').filter(Boolean)
        if (['shorts', 'embed', 'live'].includes(parts[0])) id = parts[1] || ''
      }
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : ''
  } catch {
    return ''
  }
}

export default function AdminMusicManager({ data, onRefresh, onArtistDeleted }) {
  const sourceArtist = data?.artist || null
  const sourceReleases = Array.isArray(data?.releases) ? data.releases : []

  const [artist, setArtist] = useState(sourceArtist)
  const [releases, setReleases] = useState(sourceReleases)
  const [artistName, setArtistName] = useState(sourceArtist?.name || '')
  const [artistSubtitle, setArtistSubtitle] = useState(sourceArtist?.subtitle || '')
  const [artistBio, setArtistBio] = useState(sourceArtist?.bio || '')
  const [artistAvatarUrl, setArtistAvatarUrl] = useState(sourceArtist?.avatar_url || '')
  const [artistBannerUrl, setArtistBannerUrl] = useState(sourceArtist?.banner_url || '')
  const [artistActive, setArtistActive] = useState(sourceArtist?.is_active !== false)

  const [releaseId, setReleaseId] = useState(sourceReleases[0]?.id || '')
  const selectedRelease = useMemo(
    () => releases.find((release) => release.id === releaseId) || null,
    [releases, releaseId]
  )

  const [releaseTitle, setReleaseTitle] = useState(selectedRelease?.title || '')
  const [releaseType, setReleaseType] = useState(selectedRelease?.release_type || 'single')
  const [releaseYear, setReleaseYear] = useState(String(selectedRelease?.release_year || new Date().getFullYear()))
  const [releaseCoverUrl, setReleaseCoverUrl] = useState(selectedRelease?.cover_url || '')
  const [releaseActive, setReleaseActive] = useState(selectedRelease?.is_active !== false)

  const songs = Array.isArray(selectedRelease?.songs) ? selectedRelease.songs : []
  const [songId, setSongId] = useState(songs[0]?.id || '')
  const selectedSong = useMemo(
    () => songs.find((song) => song.id === songId) || null,
    [songs, songId]
  )

  const [songTitle, setSongTitle] = useState(selectedSong?.title || '')
  const [songYoutubeUrl, setSongYoutubeUrl] = useState(selectedSong?.youtube_url || '')
  const [songViews, setSongViews] = useState(String(selectedSong?.youtube_view_count || 0))
  const [songTrack, setSongTrack] = useState(String(selectedSong?.track_number || 1))
  const [songDuration, setSongDuration] = useState(String(selectedSong?.duration_seconds || 0))
  const [songActive, setSongActive] = useState(selectedSong?.is_active !== false)

  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setArtist(sourceArtist)
    setReleases(sourceReleases)
    setArtistName(sourceArtist?.name || '')
    setArtistSubtitle(sourceArtist?.subtitle || '')
    setArtistBio(sourceArtist?.bio || '')
    setArtistAvatarUrl(sourceArtist?.avatar_url || '')
    setArtistBannerUrl(sourceArtist?.banner_url || '')
    setArtistActive(sourceArtist?.is_active !== false)

    const nextReleaseId = sourceReleases.some((release) => release.id === releaseId)
      ? releaseId
      : sourceReleases[0]?.id || ''

    setReleaseId(nextReleaseId)
  }, [data])

  useEffect(() => {
    const release = releases.find((item) => item.id === releaseId) || null

    setReleaseTitle(release?.title || '')
    setReleaseType(release?.release_type || 'single')
    setReleaseYear(String(release?.release_year || new Date().getFullYear()))
    setReleaseCoverUrl(release?.cover_url || '')
    setReleaseActive(release?.is_active !== false)

    const releaseSongs = Array.isArray(release?.songs) ? release.songs : []
    setSongId(releaseSongs[0]?.id || '')
  }, [releaseId, releases])

  useEffect(() => {
    const release = releases.find((item) => item.id === releaseId) || null
    const releaseSongs = Array.isArray(release?.songs) ? release.songs : []
    const song = releaseSongs.find((item) => item.id === songId) || null

    setSongTitle(song?.title || '')
    setSongYoutubeUrl(song?.youtube_url || '')
    setSongViews(String(song?.youtube_view_count || 0))
    setSongTrack(String(song?.track_number || 1))
    setSongDuration(String(song?.duration_seconds || 0))
    setSongActive(song?.is_active !== false)
  }, [songId, releaseId, releases])

  async function saveArtist() {
    const name = artistName.trim()

    if (!artist?.id || !name) {
      setError('Artist name is required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const result = await request(`/api/music/admin/artists/${encodeURIComponent(artist.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          subtitle: artistSubtitle.trim(),
          bio: artistBio.trim(),
          avatar_url: artistAvatarUrl.trim(),
          banner_url: artistBannerUrl.trim(),
          is_active: artistActive,
        }),
      })

      setArtist(result.artist)
      setNotice('Artist updated.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteArtist() {
    if (!artist?.id) return
    if (!window.confirm(`Delete artist "${artist.name}" and all of its music?`)) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await request(`/api/music/admin/artists/${encodeURIComponent(artist.id)}`, {
        method: 'DELETE',
      })

      setNotice('Artist deleted.')
      await onArtistDeleted?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveRelease() {
    if (!selectedRelease?.id) {
      setError('Choose an Album/Single first.')
      return
    }

    const title = releaseTitle.trim()

    if (!title) {
      setError('Release title is required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const result = await request(`/api/music/admin/releases/${encodeURIComponent(selectedRelease.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          release_type: releaseType,
          cover_url: releaseCoverUrl.trim(),
          release_year: Number.parseInt(releaseYear, 10) || new Date().getFullYear(),
          is_active: releaseActive,
        }),
      })

      setReleases((current) =>
        current.map((release) =>
          release.id === selectedRelease.id
            ? { ...release, ...result.release, songs: release.songs || [] }
            : release
        )
      )

      setNotice('Album/Single updated.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRelease() {
    if (!selectedRelease?.id) return
    if (!window.confirm(`Delete "${selectedRelease.title}" and all songs inside it?`)) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await request(`/api/music/admin/releases/${encodeURIComponent(selectedRelease.id)}`, {
        method: 'DELETE',
      })

      const next = releases.filter((release) => release.id !== selectedRelease.id)
      setReleases(next)
      setReleaseId(next[0]?.id || '')
      setNotice('Album/Single deleted.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveSong() {
    if (!selectedSong?.id) {
      setError('Choose a song first.')
      return
    }

    const title = songTitle.trim()
    const youtubeUrl = songYoutubeUrl.trim()

    if (!title || !youtubeUrl) {
      setError('Song title and YouTube link are required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const result = await request(`/api/music/admin/songs/${encodeURIComponent(selectedSong.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          youtube_url: youtubeUrl,
          youtube_view_count: Math.max(0, Number.parseInt(songViews, 10) || 0),
          track_number: Math.max(1, Number.parseInt(songTrack, 10) || 1),
          duration_seconds: Math.max(0, Number.parseInt(songDuration, 10) || 0),
          is_active: songActive,
        }),
      })

      setReleases((current) =>
        current.map((release) => {
          if (release.id !== releaseId) return release

          return {
            ...release,
            songs: (release.songs || []).map((song) =>
              song.id === selectedSong.id ? result.song : song
            ),
          }
        })
      )

      setNotice('Song updated.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteSong() {
    if (!selectedSong?.id) return
    if (!window.confirm(`Delete song "${selectedSong.title}"?`)) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await request(`/api/music/admin/songs/${encodeURIComponent(selectedSong.id)}`, {
        method: 'DELETE',
      })

      let nextSongId = ''

      setReleases((current) =>
        current.map((release) => {
          if (release.id !== releaseId) return release

          const nextSongs = (release.songs || []).filter((song) => song.id !== selectedSong.id)
          nextSongId = nextSongs[0]?.id || ''

          return {
            ...release,
            songs: nextSongs,
          }
        })
      )

      setSongId(nextSongId)
      setNotice('Song deleted.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!artist) return null

  const videoId = youtubeVideoId(songYoutubeUrl)

  return (
    <>
      <style>{styles}</style>

      <div className="amm-wrap">
        <section className="amm-card">
          <div className="amm-head">
            <div>
              <h3 className="amm-title">Edit Artist</h3>
              <div className="amm-subtitle">Profile, banner and public artist information.</div>
            </div>
          </div>

          <div className="amm-grid">
            <div className="amm-field">
              <label className="amm-label" htmlFor="amm-artist-name">Artist name</label>
              <input
                id="amm-artist-name"
                className="amm-input"
                value={artistName}
                onChange={(event) => setArtistName(event.target.value)}
              />
            </div>

            <div className="amm-field">
              <label className="amm-label" htmlFor="amm-artist-subtitle">Subtitle</label>
              <input
                id="amm-artist-subtitle"
                className="amm-input"
                value={artistSubtitle}
                onChange={(event) => setArtistSubtitle(event.target.value)}
                placeholder="Shadow Music Artist"
              />
            </div>

            <div className="amm-field">
              <label className="amm-label" htmlFor="amm-artist-avatar">Avatar URL</label>
              <input
                id="amm-artist-avatar"
                className="amm-input"
                type="url"
                value={artistAvatarUrl}
                onChange={(event) => setArtistAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="amm-field">
              <label className="amm-label" htmlFor="amm-artist-banner">Banner URL</label>
              <input
                id="amm-artist-banner"
                className="amm-input"
                type="url"
                value={artistBannerUrl}
                onChange={(event) => setArtistBannerUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="amm-field full">
              <label className="amm-label" htmlFor="amm-artist-bio">Bio</label>
              <textarea
                id="amm-artist-bio"
                className="amm-textarea"
                value={artistBio}
                onChange={(event) => setArtistBio(event.target.value)}
              />
            </div>

            <label className="amm-check">
              <input
                type="checkbox"
                checked={artistActive}
                onChange={(event) => setArtistActive(event.target.checked)}
              />
              Active on Shadow Music
            </label>
          </div>

          <div className="amm-preview">
            <div className="amm-avatar">
              {artistAvatarUrl ? <img src={artistAvatarUrl} alt="" /> : '♫'}
            </div>
            <div>
              <div className="amm-preview-name">{artistName || artist.name}</div>
              <div className="amm-preview-subtitle">{artistSubtitle || 'Shadow Music Artist'}</div>
            </div>
          </div>

          <div className="amm-actions">
            <button type="button" className="amm-btn primary" disabled={saving} onClick={saveArtist}>
              Save Artist
            </button>
            <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteArtist}>
              Delete Artist
            </button>
          </div>
        </section>

        <section className="amm-card">
          <div className="amm-head">
            <div>
              <h3 className="amm-title">Edit Album / Single</h3>
              <div className="amm-subtitle">Change cover, title, type, year or visibility.</div>
            </div>
          </div>

          {releases.length ? (
            <>
              <div className="amm-field">
                <label className="amm-label" htmlFor="amm-release-select">Album / Single</label>
                <select
                  id="amm-release-select"
                  className="amm-select"
                  value={releaseId}
                  onChange={(event) => setReleaseId(event.target.value)}
                >
                  {releases.map((release) => (
                    <option key={release.id} value={release.id}>
                      {release.title} — {release.release_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="amm-grid" style={{ marginTop: 10 }}>
                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-release-title">Title</label>
                  <input
                    id="amm-release-title"
                    className="amm-input"
                    value={releaseTitle}
                    onChange={(event) => setReleaseTitle(event.target.value)}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-release-type">Type</label>
                  <select
                    id="amm-release-type"
                    className="amm-select"
                    value={releaseType}
                    onChange={(event) => setReleaseType(event.target.value)}
                  >
                    <option value="single">Single</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-release-year">Year</label>
                  <input
                    id="amm-release-year"
                    className="amm-input"
                    inputMode="numeric"
                    value={releaseYear}
                    onChange={(event) => setReleaseYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-release-cover">Square Cover URL</label>
                  <input
                    id="amm-release-cover"
                    className="amm-input"
                    type="url"
                    value={releaseCoverUrl}
                    onChange={(event) => setReleaseCoverUrl(event.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <label className="amm-check">
                  <input
                    type="checkbox"
                    checked={releaseActive}
                    onChange={(event) => setReleaseActive(event.target.checked)}
                  />
                  Active
                </label>
              </div>

              <div className="amm-preview">
                <div className="amm-release-preview">
                  {releaseCoverUrl ? <img src={releaseCoverUrl} alt="" /> : '♫'}
                </div>
                <div>
                  <div className="amm-preview-name">{releaseTitle || selectedRelease?.title}</div>
                  <div className="amm-preview-subtitle">
                    {releaseType === 'album' ? 'Album' : 'Single'} • {releaseYear || ''}
                  </div>
                </div>
              </div>

              <div className="amm-actions">
                <button type="button" className="amm-btn primary" disabled={saving} onClick={saveRelease}>
                  Save Album/Single
                </button>
                <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteRelease}>
                  Delete Album/Single
                </button>
              </div>
            </>
          ) : (
            <div className="amm-empty">No Album/Single to edit yet.</div>
          )}
        </section>

        <section className="amm-card">
          <div className="amm-head">
            <div>
              <h3 className="amm-title">Edit Song</h3>
              <div className="amm-subtitle">Update YouTube link, views, track number and visibility.</div>
            </div>
          </div>

          {songs.length ? (
            <>
              <div className="amm-field">
                <label className="amm-label" htmlFor="amm-song-select">Song</label>
                <select
                  id="amm-song-select"
                  className="amm-select"
                  value={songId}
                  onChange={(event) => setSongId(event.target.value)}
                >
                  {songs.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.track_number || 1}. {song.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="amm-grid" style={{ marginTop: 10 }}>
                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-song-title">Song title</label>
                  <input
                    id="amm-song-title"
                    className="amm-input"
                    value={songTitle}
                    onChange={(event) => setSongTitle(event.target.value)}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-song-youtube">YouTube Link</label>
                  <input
                    id="amm-song-youtube"
                    className="amm-input"
                    type="url"
                    value={songYoutubeUrl}
                    onChange={(event) => setSongYoutubeUrl(event.target.value)}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-song-views">YouTube Views</label>
                  <input
                    id="amm-song-views"
                    className="amm-input"
                    inputMode="numeric"
                    value={songViews}
                    onChange={(event) => setSongViews(event.target.value.replace(/\D/g, '').slice(0, 12))}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-song-track">Track Number</label>
                  <input
                    id="amm-song-track"
                    className="amm-input"
                    inputMode="numeric"
                    value={songTrack}
                    onChange={(event) => setSongTrack(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>

                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-song-duration">Duration Seconds</label>
                  <input
                    id="amm-song-duration"
                    className="amm-input"
                    inputMode="numeric"
                    value={songDuration}
                    onChange={(event) => setSongDuration(event.target.value.replace(/\D/g, '').slice(0, 5))}
                  />
                </div>

                <label className="amm-check">
                  <input
                    type="checkbox"
                    checked={songActive}
                    onChange={(event) => setSongActive(event.target.checked)}
                  />
                  Active
                </label>
              </div>

              {videoId ? (
                <div className="amm-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`}
                    title={songTitle || 'Music preview'}
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}

              <div className="amm-actions">
                <button type="button" className="amm-btn primary" disabled={saving} onClick={saveSong}>
                  Save Song
                </button>
                <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteSong}>
                  Delete Song
                </button>
              </div>
            </>
          ) : (
            <div className="amm-empty">No song to edit in this Album/Single.</div>
          )}
        </section>

        {(notice || error) ? (
          <div className={`amm-status${error ? ' error' : ''}`}>
            {error || notice}
          </div>
        ) : null}
      </div>
    </>
  )
}
