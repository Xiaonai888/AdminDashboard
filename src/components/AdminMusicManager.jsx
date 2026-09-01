import React, { useEffect, useMemo, useState } from 'react'
import MusicImageUpload from './MusicImageUpload'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .amm-wrap {
    display: grid;
    gap: 12px;
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
    font-size: 14px;
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

  .amm-input {
    min-height: 42px;
  }

  .amm-textarea {
    min-height: 86px;
    padding-top: 10px;
    padding-bottom: 10px;
    resize: vertical;
  }

  .amm-input:focus,
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

  .amm-avatar img,
  .amm-release-preview img,
  .amm-track-cover img {
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

  .amm-track-list {
    display: grid;
    gap: 7px;
    margin-top: 12px;
  }

  .amm-track-row {
    width: 100%;
    display: grid;
    grid-template-columns: 42px minmax(0,1fr) auto;
    align-items: center;
    gap: 10px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 7px;
    color: #0F172A;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease;
  }

  .amm-track-row:hover {
    border-color: #BFDBFE;
    background: #F8FBFF;
  }

  .amm-track-row.active {
    border-color: #3B82F6;
    background: #EFF6FF;
  }

  .amm-track-cover {
    width: 42px;
    height: 42px;
    overflow: hidden;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg, #475569, #111827);
    color: #FFFFFF;
    font-size: 15px;
  }

  .amm-track-name {
    overflow: hidden;
    font-size: 10px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .amm-track-meta {
    margin-top: 3px;
    color: #64748B;
    font-size: 8px;
    font-weight: 700;
  }

  .amm-track-number {
    color: #64748B;
    font-size: 9px;
    font-weight: 900;
  }

  .amm-add-track {
    margin-top: 14px;
    border: 1px solid #DBEAFE;
    border-radius: 13px;
    background: #F8FBFF;
    padding: 12px;
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

  .amm-status {
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

export default function AdminMusicManager({
  data,
  mode = 'artist',
  selectedReleaseId = '',
  onClose,
  onRefresh,
  onArtistDeleted,
  onReleaseDeleted,
}) {
  const sourceArtist = data?.artist || null
  const sourceReleases = Array.isArray(data?.releases) ? data.releases : []
  const sourceRelease = useMemo(
    () => sourceReleases.find((release) => release.id === selectedReleaseId) || null,
    [sourceReleases, selectedReleaseId]
  )

  const [artist, setArtist] = useState(sourceArtist)
  const [artistName, setArtistName] = useState(sourceArtist?.name || '')
  const [artistBio, setArtistBio] = useState(sourceArtist?.bio || '')
  const [artistAvatarUrl, setArtistAvatarUrl] = useState(sourceArtist?.avatar_url || '')
  const [artistBannerUrl, setArtistBannerUrl] = useState(sourceArtist?.banner_url || '')
  const [artistActive, setArtistActive] = useState(sourceArtist?.is_active !== false)

  const [release, setRelease] = useState(sourceRelease)
  const [releaseTitle, setReleaseTitle] = useState(sourceRelease?.title || '')
  const [releaseYear, setReleaseYear] = useState(String(sourceRelease?.release_year || new Date().getFullYear()))
  const [releaseCoverUrl, setReleaseCoverUrl] = useState(sourceRelease?.cover_url || '')
  const [releaseActive, setReleaseActive] = useState(sourceRelease?.is_active !== false)

  const releaseSongs = Array.isArray(release?.songs) ? release.songs : []
  const singleSong = release?.release_type === 'single' ? releaseSongs[0] || null : null
  const [singleYoutubeUrl, setSingleYoutubeUrl] = useState(singleSong?.youtube_url || '')

  const [selectedTrackId, setSelectedTrackId] = useState('')
  const selectedTrack = useMemo(
    () => releaseSongs.find((song) => song.id === selectedTrackId) || null,
    [releaseSongs, selectedTrackId]
  )
  const [trackTitle, setTrackTitle] = useState('')
  const [trackYoutubeUrl, setTrackYoutubeUrl] = useState('')
  const [trackNumber, setTrackNumber] = useState('1')
  const [trackActive, setTrackActive] = useState(true)
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [newTrackYoutubeUrl, setNewTrackYoutubeUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setArtist(sourceArtist)
    setArtistName(sourceArtist?.name || '')
    setArtistBio(sourceArtist?.bio || '')
    setArtistAvatarUrl(sourceArtist?.avatar_url || '')
    setArtistBannerUrl(sourceArtist?.banner_url || '')
    setArtistActive(sourceArtist?.is_active !== false)
  }, [sourceArtist])

  useEffect(() => {
    setRelease(sourceRelease)
    setReleaseTitle(sourceRelease?.title || '')
    setReleaseYear(String(sourceRelease?.release_year || new Date().getFullYear()))
    setReleaseCoverUrl(sourceRelease?.cover_url || '')
    setReleaseActive(sourceRelease?.is_active !== false)
    setSingleYoutubeUrl(sourceRelease?.release_type === 'single' ? sourceRelease?.songs?.[0]?.youtube_url || '' : '')
    setSelectedTrackId((current) => sourceRelease?.songs?.some((song) => song.id === current) ? current : '')
    setNewTrackTitle('')
    setNewTrackYoutubeUrl('')
    setNotice('')
    setError('')
  }, [sourceRelease, selectedReleaseId])

  useEffect(() => {
    setTrackTitle(selectedTrack?.title || '')
    setTrackYoutubeUrl(selectedTrack?.youtube_url || '')
    setTrackNumber(String(selectedTrack?.track_number || 1))
    setTrackActive(selectedTrack?.is_active !== false)
  }, [selectedTrack])

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
      await onArtistDeleted?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveRelease() {
    if (!release?.id) return

    const title = releaseTitle.trim()
    const isSingle = release.release_type === 'single'
    const youtubeUrl = singleYoutubeUrl.trim()

    if (!title) {
      setError(isSingle ? 'Solo title is required.' : 'Album title is required.')
      return
    }

    if (isSingle && (!singleSong?.id || !youtubeUrl)) {
      setError('Solo YouTube link is required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    const originalRelease = release

    try {
      const releaseResult = await request(`/api/music/admin/releases/${encodeURIComponent(release.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          release_type: release.release_type,
          cover_url: releaseCoverUrl.trim(),
          release_year: isSingle
            ? Number(release.release_year || new Date().getFullYear())
            : Number.parseInt(releaseYear, 10) || new Date().getFullYear(),
          is_active: releaseActive,
        }),
      })

      let updatedSongs = release.songs || []

      if (isSingle) {
        try {
          const songResult = await request(`/api/music/admin/songs/${encodeURIComponent(singleSong.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({
              title,
              youtube_url: youtubeUrl,
              track_number: 1,
              duration_seconds: Number(singleSong.duration_seconds || 0),
              is_active: releaseActive,
            }),
          })
          updatedSongs = [songResult.song]
        } catch (songError) {
          try {
            await request(`/api/music/admin/releases/${encodeURIComponent(originalRelease.id)}`, {
              method: 'PATCH',
              body: JSON.stringify({
                title: originalRelease.title,
                release_type: originalRelease.release_type,
                cover_url: originalRelease.cover_url || '',
                release_year: Number(originalRelease.release_year || new Date().getFullYear()),
                is_active: originalRelease.is_active !== false,
              }),
            })
          } catch {
            void 0
          }
          throw songError
        }
      }

      setRelease({ ...release, ...releaseResult.release, songs: updatedSongs })
      setNotice(isSingle ? 'Solo updated.' : 'Album updated.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRelease() {
    if (!release?.id) return
    if (!window.confirm(`Delete "${release.title}" and all songs inside it?`)) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await request(`/api/music/admin/releases/${encodeURIComponent(release.id)}`, {
        method: 'DELETE',
      })
      await onReleaseDeleted?.(release.id)
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function addTrackToAlbum() {
    if (!release?.id || release.release_type !== 'album') return

    const title = newTrackTitle.trim()
    const youtubeUrl = newTrackYoutubeUrl.trim()
    if (!title || !youtubeUrl) {
      setError('New track needs a Song Title and YouTube Link.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const result = await request('/api/music/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          release_id: release.id,
          title,
          youtube_url: youtubeUrl,
          track_number: releaseSongs.length + 1,
        }),
      })

      const nextRelease = {
        ...release,
        songs: [...releaseSongs, result.song],
      }
      setRelease(nextRelease)
      setNewTrackTitle('')
      setNewTrackYoutubeUrl('')
      setSelectedTrackId(result.song?.id || '')
      setNotice(`${result.song?.title || title} added.`)
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveTrack() {
    if (!selectedTrack?.id) return

    const title = trackTitle.trim()
    const youtubeUrl = trackYoutubeUrl.trim()
    if (!title || !youtubeUrl) {
      setError('Song title and YouTube link are required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const result = await request(`/api/music/admin/songs/${encodeURIComponent(selectedTrack.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          youtube_url: youtubeUrl,
          track_number: Math.max(1, Number.parseInt(trackNumber, 10) || 1),
          duration_seconds: Number(selectedTrack.duration_seconds || 0),
          is_active: trackActive,
        }),
      })

      setRelease((current) => ({
        ...current,
        songs: (current?.songs || []).map((song) =>
          song.id === selectedTrack.id ? result.song : song
        ),
      }))
      setNotice('Track updated.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteTrack() {
    if (!selectedTrack?.id) return
    if (!window.confirm(`Delete song "${selectedTrack.title}"?`)) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await request(`/api/music/admin/songs/${encodeURIComponent(selectedTrack.id)}`, {
        method: 'DELETE',
      })
      setRelease((current) => ({
        ...current,
        songs: (current?.songs || []).filter((song) => song.id !== selectedTrack.id),
      }))
      setSelectedTrackId('')
      setNotice('Track deleted.')
      await onRefresh?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!sourceArtist) return null

  if (mode === 'artist') {
    return (
      <>
        <style>{styles}</style>
        <div className="amm-wrap">
          <section className="amm-card">
            <div className="amm-head">
              <div>
                <h3 className="amm-title">Edit Artist Profile</h3>
                <div className="amm-subtitle">Only artist profile information is edited here.</div>
              </div>
              <button type="button" className="amm-btn" onClick={onClose}>Close</button>
            </div>

            <div className="amm-grid">
              <div className="amm-field">
                <label className="amm-label" htmlFor="amm-artist-name">Artist Name</label>
                <input id="amm-artist-name" className="amm-input" value={artistName} onChange={(event) => setArtistName(event.target.value)} />
              </div>

              <div className="amm-field">
                <MusicImageUpload value={artistAvatarUrl} onChange={setArtistAvatarUrl} shape="circle" label="Artist Profile" disabled={saving} />
              </div>

              <div className="amm-field full">
                <MusicImageUpload value={artistBannerUrl} onChange={setArtistBannerUrl} shape="banner" label="Artist Cover (Optional)" disabled={saving} />
              </div>

              <div className="amm-field full">
                <label className="amm-label" htmlFor="amm-artist-bio">Bio</label>
                <textarea id="amm-artist-bio" className="amm-textarea" value={artistBio} onChange={(event) => setArtistBio(event.target.value)} />
              </div>

              <label className="amm-check">
                <input type="checkbox" checked={artistActive} onChange={(event) => setArtistActive(event.target.checked)} />
                Active on Shadow Music
              </label>
            </div>

            <div className="amm-preview">
              <div className="amm-avatar">{artistAvatarUrl ? <img src={artistAvatarUrl} alt="" /> : '♫'}</div>
              <div>
                <div className="amm-preview-name">{artistName || sourceArtist.name}</div>
                <div className="amm-preview-subtitle">{Number(sourceArtist.total_listeners || 0).toLocaleString()} Listeners</div>
              </div>
            </div>

            <div className="amm-actions">
              <button type="button" className="amm-btn primary" disabled={saving} onClick={saveArtist}>Save Artist</button>
              <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteArtist}>Delete Artist</button>
            </div>
          </section>

          {(notice || error) ? <div className={`amm-status${error ? ' error' : ''}`}>{error || notice}</div> : null}
        </div>
      </>
    )
  }

  if (!release) {
    return (
      <>
        <style>{styles}</style>
        <div className="amm-empty">The selected Solo or Album could not be found.</div>
      </>
    )
  }

  const isSingle = release.release_type === 'single'
  const singleVideoId = youtubeVideoId(singleYoutubeUrl)
  const trackVideoId = youtubeVideoId(trackYoutubeUrl)

  return (
    <>
      <style>{styles}</style>
      <div className="amm-wrap">
        <section className="amm-card">
          <div className="amm-head">
            <div>
              <h3 className="amm-title">{isSingle ? 'Edit Solo / Single' : 'Edit Album'}</h3>
              <div className="amm-subtitle">Editing only: {release.title}</div>
            </div>
            <button type="button" className="amm-btn" onClick={onClose}>Close</button>
          </div>

          <div className="amm-grid">
            <div className="amm-field">
              <label className="amm-label" htmlFor="amm-release-title">{isSingle ? 'Title' : 'Album Title'}</label>
              <input id="amm-release-title" className="amm-input" value={releaseTitle} onChange={(event) => setReleaseTitle(event.target.value)} />
            </div>

            {isSingle ? (
              <div className="amm-field">
                <label className="amm-label" htmlFor="amm-single-youtube">YouTube Link</label>
                <input id="amm-single-youtube" className="amm-input" type="url" value={singleYoutubeUrl} onChange={(event) => setSingleYoutubeUrl(event.target.value)} />
              </div>
            ) : (
              <div className="amm-field">
                <label className="amm-label" htmlFor="amm-album-year">Year</label>
                <input id="amm-album-year" className="amm-input" inputMode="numeric" value={releaseYear} onChange={(event) => setReleaseYear(event.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
            )}

            <div className="amm-field full">
              <MusicImageUpload value={releaseCoverUrl} onChange={setReleaseCoverUrl} shape="square" label={isSingle ? 'Solo Cover' : 'Album Cover'} disabled={saving} />
            </div>

            <label className="amm-check">
              <input type="checkbox" checked={releaseActive} onChange={(event) => setReleaseActive(event.target.checked)} />
              Active
            </label>
          </div>

          <div className="amm-preview">
            <div className="amm-release-preview">{releaseCoverUrl ? <img src={releaseCoverUrl} alt="" /> : '♫'}</div>
            <div>
              <div className="amm-preview-name">{releaseTitle || release.title}</div>
              <div className="amm-preview-subtitle">
                {isSingle ? `${Number(singleSong?.view_count || 0).toLocaleString()} Views • Solo` : `${releaseSongs.length} songs • Album`}
              </div>
            </div>
          </div>

          {isSingle && singleVideoId ? (
            <div className="amm-video">
              <iframe src={`https://www.youtube-nocookie.com/embed/${singleVideoId}?rel=0&playsinline=1`} title={releaseTitle || 'Solo preview'} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          ) : null}

          <div className="amm-actions">
            <button type="button" className="amm-btn primary" disabled={saving} onClick={saveRelease}>{isSingle ? 'Save Solo' : 'Save Album'}</button>
            <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteRelease}>{isSingle ? 'Delete Solo' : 'Delete Album'}</button>
          </div>
        </section>

        {!isSingle ? (
          <section className="amm-card">
            <div className="amm-head">
              <div>
                <h3 className="amm-title">Album Tracks</h3>
                <div className="amm-subtitle">Click one track below to edit only that track.</div>
              </div>
            </div>

            {releaseSongs.length ? (
              <div className="amm-track-list">
                {releaseSongs.map((song, index) => (
                  <button
                    type="button"
                    key={song.id}
                    className={`amm-track-row${song.id === selectedTrackId ? ' active' : ''}`}
                    onClick={() => setSelectedTrackId(song.id)}
                  >
                    <span className="amm-track-cover">{releaseCoverUrl ? <img src={releaseCoverUrl} alt="" /> : '♫'}</span>
                    <span>
                      <span className="amm-track-name">{song.title}</span>
                      <span className="amm-track-meta">{Number(song.view_count || 0).toLocaleString()} Views</span>
                    </span>
                    <span className="amm-track-number">#{song.track_number || index + 1}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="amm-empty">No songs in this Album yet.</div>
            )}

            {selectedTrack ? (
              <div className="amm-add-track">
                <div className="amm-title">Edit Track: {selectedTrack.title}</div>
                <div className="amm-grid" style={{ marginTop: 10 }}>
                  <div className="amm-field">
                    <label className="amm-label" htmlFor="amm-track-title">Song Title</label>
                    <input id="amm-track-title" className="amm-input" value={trackTitle} onChange={(event) => setTrackTitle(event.target.value)} />
                  </div>

                  <div className="amm-field">
                    <label className="amm-label" htmlFor="amm-track-youtube">YouTube Link</label>
                    <input id="amm-track-youtube" className="amm-input" type="url" value={trackYoutubeUrl} onChange={(event) => setTrackYoutubeUrl(event.target.value)} />
                  </div>

                  <div className="amm-field">
                    <label className="amm-label" htmlFor="amm-track-number">Track Number</label>
                    <input id="amm-track-number" className="amm-input" inputMode="numeric" value={trackNumber} onChange={(event) => setTrackNumber(event.target.value.replace(/\D/g, '').slice(0, 4))} />
                  </div>

                  <div className="amm-field">
                    <label className="amm-label">Shadow Views</label>
                    <input className="amm-input" value={String(selectedTrack.view_count || 0)} readOnly disabled />
                  </div>

                  <label className="amm-check">
                    <input type="checkbox" checked={trackActive} onChange={(event) => setTrackActive(event.target.checked)} />
                    Active
                  </label>
                </div>

                {trackVideoId ? (
                  <div className="amm-video">
                    <iframe src={`https://www.youtube-nocookie.com/embed/${trackVideoId}?rel=0&playsinline=1`} title={trackTitle || 'Track preview'} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  </div>
                ) : null}

                <div className="amm-actions">
                  <button type="button" className="amm-btn primary" disabled={saving} onClick={saveTrack}>Save Track</button>
                  <button type="button" className="amm-btn danger" disabled={saving} onClick={deleteTrack}>Delete Track</button>
                </div>
              </div>
            ) : null}

            <div className="amm-add-track">
              <div className="amm-title">Add Track</div>
              <div className="amm-subtitle">Add another song to this Album.</div>
              <div className="amm-grid" style={{ marginTop: 10 }}>
                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-new-track-title">Song Title</label>
                  <input id="amm-new-track-title" className="amm-input" value={newTrackTitle} onChange={(event) => setNewTrackTitle(event.target.value)} placeholder="Song title" />
                </div>
                <div className="amm-field">
                  <label className="amm-label" htmlFor="amm-new-track-youtube">YouTube Link</label>
                  <input id="amm-new-track-youtube" className="amm-input" type="url" value={newTrackYoutubeUrl} onChange={(event) => setNewTrackYoutubeUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
              <div className="amm-actions">
                <button type="button" className="amm-btn primary" disabled={saving} onClick={addTrackToAlbum}>Add Track</button>
              </div>
            </div>
          </section>
        ) : null}

        {(notice || error) ? <div className={`amm-status${error ? ' error' : ''}`}>{error || notice}</div> : null}
      </div>
    </>
  )
}
