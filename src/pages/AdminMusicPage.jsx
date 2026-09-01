import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminMusicManager from '../components/AdminMusicManager'
import MusicImageUpload from '../components/MusicImageUpload'
import AdminMusicListenHistory from '../components/AdminMusicListenHistory'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .music-admin-page {
    --map-blue: #3B82F6;
    --map-blue-dark: #2563EB;
    --map-text: #0F172A;
    --map-muted: #64748B;
    --map-border: #E2E8F0;
    color: var(--map-text);
  }

  .map-topbar,
  .map-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 14px;
  }

  .map-topbar {
    margin-bottom: 18px;
  }

  .map-title {
    margin: 0;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -.035em;
  }

  .map-section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 950;
  }

  .map-copy {
    margin-top: 4px;
    color: var(--map-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .map-btn {
    min-height: 40px;
    border: 1px solid var(--map-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--map-text);
    padding: 0 14px;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    transition: background .16s ease, border-color .16s ease, transform .16s ease;
  }

  .map-btn:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  .map-btn.primary {
    border-color: var(--map-blue);
    background: var(--map-blue);
    color: #FFFFFF;
  }

  .map-btn.primary:hover {
    border-color: var(--map-blue-dark);
    background: var(--map-blue-dark);
  }

  .map-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .map-section {
    margin-bottom: 18px;
  }

  .map-search,
  .map-input {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--map-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--map-text);
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
  }

  .map-search {
    width: min(270px, 100%);
    min-height: 38px;
  }

  .map-search:focus,
  .map-input:focus {
    border-color: var(--map-blue);
    box-shadow: 0 0 0 3px rgba(59,130,246,.08);
  }

  .map-artists {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 3px 2px 9px;
    scrollbar-width: thin;
  }

  .map-artist {
    width: 114px;
    min-width: 114px;
    border: 1px solid var(--map-border);
    border-radius: 15px;
    background: #FFFFFF;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
  }

  .map-artist:hover {
    transform: translateY(-2px);
    border-color: #BFDBFE;
    box-shadow: 0 7px 20px rgba(15,23,42,.06);
  }

  .map-artist.active {
    border-color: var(--map-blue);
    background: #EFF6FF;
    box-shadow: 0 0 0 2px rgba(59,130,246,.08);
  }

  .map-avatar,
  .map-profile,
  .map-release-cover {
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg,#475569,#111827);
    color: #FFFFFF;
  }

  .map-avatar {
    width: 66px;
    height: 66px;
    margin: 0 auto;
    border-radius: 999px;
  }

  .map-avatar img,
  .map-profile img,
  .map-release-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .map-artist-name {
    margin-top: 8px;
    overflow: hidden;
    font-size: 10px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .map-artist-meta {
    margin-top: 3px;
    color: var(--map-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .map-add-artist {
    display: grid;
    place-items: center;
    align-content: center;
    min-height: 114px;
    border-style: dashed;
    border-color: #BFDBFE;
    background: #F8FBFF;
    color: #2563EB;
  }

  .map-add-plus {
    font-size: 24px;
    line-height: 1;
  }

  .map-new-artist {
    margin-top: 12px;
    border: 1px solid #DBEAFE;
    border-radius: 16px;
    background: #F8FBFF;
    padding: 14px;
  }

  .map-new-artist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .map-field {
    margin-top: 12px;
  }

  .map-label {
    display: block;
    margin-bottom: 6px;
    color: #334155;
    font-size: 9px;
    font-weight: 900;
  }

  .map-workspace {
    display: grid;
    grid-template-columns: minmax(330px,.82fr) minmax(0,1.18fr);
    gap: 16px;
    align-items: start;
  }

  .map-card {
    border: 1px solid var(--map-border);
    border-radius: 17px;
    background: #FFFFFF;
    overflow: hidden;
  }

  .map-card-pad {
    padding: 15px;
  }

  .map-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 14px;
    border-radius: 12px;
    background: #F1F5F9;
    padding: 4px;
  }

  .map-tab {
    min-height: 39px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #475569;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .map-tab.active {
    background: #FFFFFF;
    color: #2563EB;
    box-shadow: 0 2px 8px rgba(15,23,42,.08);
  }

  .map-actions {
    display: flex;
    gap: 8px;
    margin-top: 13px;
  }

  .map-actions .primary {
    flex: 1;
  }

  .map-album-builder {
    margin-top: 16px;
    border: 1px solid #DBEAFE;
    border-radius: 13px;
    background: #F8FBFF;
    padding: 12px;
  }

  .map-track-draft {
    margin-top: 10px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    padding: 10px;
  }

  .map-profile-head {
    display: grid;
    grid-template-columns: 62px minmax(0,1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 14px 15px;
    border-bottom: 1px solid var(--map-border);
  }

  .map-profile {
    width: 62px;
    height: 62px;
    border-radius: 999px;
  }

  .map-profile-name {
    font-size: 16px;
    font-weight: 950;
  }

  .map-listener-value {
    margin-top: 5px;
    font-size: 14px;
    font-weight: 950;
  }

  .map-listener-label {
    color: var(--map-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .map-metrics {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8px;
    padding: 12px 15px;
    border-bottom: 1px solid var(--map-border);
  }

  .map-metric {
    border: 1px solid var(--map-border);
    border-radius: 11px;
    background: #F8FAFC;
    padding: 9px;
  }

  .map-metric-label {
    color: var(--map-muted);
    font-size: 8px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .map-metric-value {
    margin-top: 3px;
    font-size: 14px;
    font-weight: 950;
  }

  .map-release-section {
    padding: 13px 15px;
    border-bottom: 1px solid var(--map-border);
  }

  .map-release-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 9px;
  }

  .map-release-title {
    font-size: 12px;
    font-weight: 950;
  }

  .map-release-list {
    display: grid;
    gap: 7px;
  }

  .map-release-row {
    width: 100%;
    display: grid;
    grid-template-columns: 48px minmax(0,1fr) auto;
    align-items: center;
    gap: 10px;
    border: 1px solid #EEF2F7;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 7px;
    color: var(--map-text);
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: border-color .16s ease, background .16s ease, transform .16s ease;
  }

  .map-release-row:hover {
    border-color: #BFDBFE;
    background: #F8FBFF;
    transform: translateY(-1px);
  }

  .map-release-row.active {
    border-color: var(--map-blue);
    background: #EFF6FF;
  }

  .map-release-cover {
    width: 48px;
    height: 48px;
    border-radius: 9px;
  }

  .map-release-name {
    overflow: hidden;
    font-size: 10px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .map-release-meta {
    margin-top: 3px;
    color: var(--map-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .map-views {
    color: #475569;
    font-size: 9px;
    font-weight: 900;
    white-space: nowrap;
  }

  .map-editor {
    margin-top: 16px;
  }

  .map-status {
    margin-top: 14px;
    border-radius: 11px;
    background: #F8FAFC;
    padding: 10px 12px;
    color: var(--map-muted);
    font-size: 10px;
    font-weight: 750;
  }

  .map-status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .map-empty {
    border: 1px dashed var(--map-border);
    border-radius: 11px;
    padding: 16px;
    color: var(--map-muted);
    text-align: center;
    font-size: 9px;
    font-weight: 750;
  }

  .map-history {
    margin-top: 18px;
  }

  @media (max-width: 980px) {
    .map-workspace,
    .map-new-artist-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .map-topbar,
    .map-head {
      align-items: stretch;
      flex-direction: column;
    }

    .map-search {
      width: 100%;
    }

    .map-profile-head {
      grid-template-columns: 54px minmax(0,1fr);
    }

    .map-profile-head > .map-btn {
      grid-column: 1 / -1;
      width: 100%;
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

function createAlbumTrackDraft() {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '',
    youtube_url: '',
  }
}

export default function AdminMusicPage() {
  const artistDetailCache = useRef({})
  const editorRef = useRef(null)

  const [artists, setArtists] = useState([])
  const [query, setQuery] = useState('')
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [artistName, setArtistName] = useState('')
  const [artistAvatarUrl, setArtistAvatarUrl] = useState('')
  const [artistBannerUrl, setArtistBannerUrl] = useState('')

  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [selectedArtistDetail, setSelectedArtistDetail] = useState(null)

  const [createMode, setCreateMode] = useState('single')
  const [soloTitle, setSoloTitle] = useState('')
  const [soloCoverUrl, setSoloCoverUrl] = useState('')
  const [soloYoutubeUrl, setSoloYoutubeUrl] = useState('')
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumCoverUrl, setAlbumCoverUrl] = useState('')
  const [albumYear, setAlbumYear] = useState(String(new Date().getFullYear()))
  const [albumTracks, setAlbumTracks] = useState(() => [createAlbumTrackDraft()])

  const [editorMode, setEditorMode] = useState('')
  const [selectedEditReleaseId, setSelectedEditReleaseId] = useState('')

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

  const loadArtist = useCallback(async (artistId, force = false) => {
    if (!artistId) {
      setSelectedArtistDetail(null)
      return
    }

    if (!force && artistDetailCache.current[artistId]) {
      setSelectedArtistDetail(artistDetailCache.current[artistId])
      return
    }

    try {
      const data = await musicRequest(`/api/music/admin/artists/${encodeURIComponent(artistId)}`)
      artistDetailCache.current[artistId] = data
      setSelectedArtistDetail(data)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!selectedArtistId && artists.length) {
      setSelectedArtistId(artists[0].id)
    }
  }, [artists, selectedArtistId])

  useEffect(() => {
    if (selectedArtistId) loadArtist(selectedArtistId)
  }, [selectedArtistId, loadArtist])

  const filteredArtists = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return artists
    return artists.filter((artist) => String(artist.name || '').toLowerCase().includes(keyword))
  }, [artists, query])

  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId) || null
  const releases = Array.isArray(selectedArtistDetail?.releases) ? selectedArtistDetail.releases : []
  const singles = useMemo(() => releases.filter((release) => release.release_type === 'single'), [releases])
  const albums = useMemo(() => releases.filter((release) => release.release_type === 'album'), [releases])

  async function refreshSelectedArtist() {
    if (!selectedArtistId) return
    delete artistDetailCache.current[selectedArtistId]
    await Promise.all([
      loadOverview(),
      loadArtist(selectedArtistId, true),
    ])
  }

  function selectArtist(artistId) {
    if (!artistId || artistId === selectedArtistId) return
    setSelectedArtistId(artistId)
    setEditorMode('')
    setSelectedEditReleaseId('')
    setNotice('')
    setError('')
  }

  function openEditor(mode, releaseId = '') {
    setEditorMode(mode)
    setSelectedEditReleaseId(releaseId)
    setNotice('')
    setError('')
    window.setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  function closeEditor() {
    setEditorMode('')
    setSelectedEditReleaseId('')
  }

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
        body: JSON.stringify({
          name,
          avatar_url: artistAvatarUrl.trim(),
          banner_url: artistBannerUrl.trim(),
        }),
      })
      setArtistName('')
      setArtistAvatarUrl('')
      setArtistBannerUrl('')
      setShowArtistForm(false)
      setNotice(`${data.artist?.name || name} created.`)
      await loadOverview()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function createSolo() {
    if (!selectedArtistId) return

    const title = soloTitle.trim()
    const youtubeUrl = soloYoutubeUrl.trim()
    if (!title || !youtubeUrl) {
      setError('Solo title and YouTube link are required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    let createdReleaseId = ''

    try {
      const releaseData = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: 'single',
          cover_url: soloCoverUrl.trim(),
          release_year: new Date().getFullYear(),
        }),
      })

      createdReleaseId = releaseData.release?.id || ''
      if (!createdReleaseId) throw new Error('Single release was not created')

      await musicRequest('/api/music/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          release_id: createdReleaseId,
          title,
          youtube_url: youtubeUrl,
          track_number: 1,
        }),
      })

      setSoloTitle('')
      setSoloCoverUrl('')
      setSoloYoutubeUrl('')
      setNotice(`${title} created as Solo.`)
      await refreshSelectedArtist()
    } catch (requestError) {
      if (createdReleaseId) {
        try {
          await musicRequest(`/api/music/admin/releases/${encodeURIComponent(createdReleaseId)}`, { method: 'DELETE' })
        } catch {
          void 0
        }
      }
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function addAlbumTrackRow() {
    setAlbumTracks((current) => [...current, createAlbumTrackDraft()])
  }

  function updateAlbumTrackRow(index, field, value) {
    setAlbumTracks((current) => current.map((track, trackIndex) =>
      trackIndex === index ? { ...track, [field]: value } : track
    ))
  }

  function removeAlbumTrackRow(index) {
    setAlbumTracks((current) => {
      if (current.length <= 1) return [createAlbumTrackDraft()]
      return current.filter((_, trackIndex) => trackIndex !== index)
    })
  }

  async function createAlbum() {
    if (!selectedArtistId) return

    const title = albumTitle.trim()
    const tracks = albumTracks.map((track) => ({
      title: track.title.trim(),
      youtube_url: track.youtube_url.trim(),
    }))

    if (!title) {
      setError('Album title is required.')
      return
    }

    if (!tracks.length || tracks.some((track) => !track.title || !track.youtube_url)) {
      setError('Every Album track needs a Song Title and YouTube Link.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    let createdReleaseId = ''

    try {
      const releaseData = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: 'album',
          cover_url: albumCoverUrl.trim(),
          release_year: Number(albumYear) || new Date().getFullYear(),
        }),
      })

      createdReleaseId = releaseData.release?.id || ''
      if (!createdReleaseId) throw new Error('Album was not created')

      for (let index = 0; index < tracks.length; index += 1) {
        await musicRequest('/api/music/admin/songs', {
          method: 'POST',
          body: JSON.stringify({
            release_id: createdReleaseId,
            title: tracks[index].title,
            youtube_url: tracks[index].youtube_url,
            track_number: index + 1,
          }),
        })
      }

      setAlbumTitle('')
      setAlbumCoverUrl('')
      setAlbumYear(String(new Date().getFullYear()))
      setAlbumTracks([createAlbumTrackDraft()])
      setNotice(`${title} created with ${tracks.length} track${tracks.length === 1 ? '' : 's'}.`)
      await refreshSelectedArtist()
    } catch (requestError) {
      if (createdReleaseId) {
        try {
          await musicRequest(`/api/music/admin/releases/${encodeURIComponent(createdReleaseId)}`, { method: 'DELETE' })
        } catch {
          void 0
        }
      }
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function totalReleaseViews(release) {
    return (release?.songs || []).reduce((total, song) => total + Number(song.view_count || 0), 0)
  }

  function formatViews(value) {
    const count = Number(value || 0)
    if (count >= 1000000) return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
    return String(count)
  }

  function renderReleaseRows(items, typeLabel) {
    if (!items.length) return <div className="map-empty">No {typeLabel} yet.</div>

    return (
      <div className="map-release-list">
        {items.map((release) => (
          <button
            type="button"
            className={`map-release-row${editorMode === 'release' && selectedEditReleaseId === release.id ? ' active' : ''}`}
            key={release.id}
            onClick={() => openEditor('release', release.id)}
          >
            <span className="map-release-cover">
              {release.cover_url ? <img src={release.cover_url} alt="" /> : <MusicIcon size={18} />}
            </span>
            <span>
              <span className="map-release-name">{release.title}</span>
              <span className="map-release-meta">
                {release.release_year || ''} • {release.release_type === 'album' ? `${release.songs?.length || 0} songs` : 'Solo'}
              </span>
            </span>
            <span className="map-views">{formatViews(totalReleaseViews(release))} Views</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <AdminLayout title="Music" subtitle="Create and manage Shadow artists, solos and albums.">
      <style>{styles}</style>

      <div className="music-admin-page">
        <div className="map-topbar">
          <div>
            <h2 className="map-title">Shadow Music</h2>
            <div className="map-copy">Select an artist, create music, or click an existing cover to edit it.</div>
          </div>
          <button type="button" className="map-btn primary" onClick={() => setShowArtistForm((current) => !current)}>+ New Artist</button>
        </div>

        <section className="map-section">
          <div className="map-head">
            <div>
              <h3 className="map-section-title">Select Artist</h3>
              <div className="map-copy">Hover or click an artist to switch workspace.</div>
            </div>
            <input className="map-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search artist..." />
          </div>

          <div className="map-artists">
            {loading ? (
              <div className="map-empty" style={{ minWidth: 220 }}>Loading artists...</div>
            ) : filteredArtists.map((artist) => (
              <button
                type="button"
                key={artist.id}
                className={`map-artist${artist.id === selectedArtistId ? ' active' : ''}`}
                onMouseEnter={() => selectArtist(artist.id)}
                onClick={() => selectArtist(artist.id)}
              >
                <div className="map-avatar">{artist.avatar_url ? <img src={artist.avatar_url} alt="" /> : <MusicIcon size={23} />}</div>
                <div className="map-artist-name">{artist.name}</div>
                <div className="map-artist-meta">{Number(artist.total_listeners || 0).toLocaleString()} listeners</div>
              </button>
            ))}

            <button type="button" className="map-artist map-add-artist" onClick={() => setShowArtistForm(true)}>
              <span className="map-add-plus">+</span>
              <span className="map-artist-name">Add Artist</span>
            </button>
          </div>

          {showArtistForm ? (
            <div className="map-new-artist">
              <div className="map-head">
                <div>
                  <h3 className="map-section-title">Create Artist</h3>
                  <div className="map-copy">Profile recommended. Artist Cover is optional.</div>
                </div>
                <button type="button" className="map-btn" onClick={() => setShowArtistForm(false)}>Close</button>
              </div>

              <div className="map-new-artist-grid">
                <div>
                  <div className="map-field">
                    <label className="map-label" htmlFor="map-artist-name">Artist Name</label>
                    <input id="map-artist-name" className="map-input" value={artistName} onChange={(event) => setArtistName(event.target.value)} placeholder="Artist name" />
                  </div>
                  <MusicImageUpload value={artistAvatarUrl} onChange={setArtistAvatarUrl} shape="circle" label="Artist Profile" disabled={saving} />
                </div>
                <div>
                  <MusicImageUpload value={artistBannerUrl} onChange={setArtistBannerUrl} shape="banner" label="Artist Cover (Optional)" disabled={saving} />
                  <div className="map-actions">
                    <button type="button" className="map-btn primary" disabled={saving} onClick={addArtist}>Create Artist</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {selectedArtist ? (
          <div className="map-workspace">
            <section className="map-card">
              <div className="map-card-pad">
                <h3 className="map-section-title">Create New Release</h3>
                <div className="map-copy">Selected artist: {selectedArtist.name}</div>

                <div className="map-tabs">
                  <button type="button" className={`map-tab${createMode === 'single' ? ' active' : ''}`} onClick={() => setCreateMode('single')}>Solo / Single</button>
                  <button type="button" className={`map-tab${createMode === 'album' ? ' active' : ''}`} onClick={() => setCreateMode('album')}>Album</button>
                </div>

                {createMode === 'single' ? (
                  <>
                    <div className="map-field">
                      <label className="map-label" htmlFor="map-solo-title">Title</label>
                      <input id="map-solo-title" className="map-input" value={soloTitle} onChange={(event) => setSoloTitle(event.target.value)} placeholder="Song title" />
                    </div>
                    <MusicImageUpload value={soloCoverUrl} onChange={setSoloCoverUrl} shape="square" label="Solo Cover" disabled={saving} />
                    <div className="map-field">
                      <label className="map-label" htmlFor="map-solo-youtube">YouTube Link</label>
                      <input id="map-solo-youtube" className="map-input" type="url" value={soloYoutubeUrl} onChange={(event) => setSoloYoutubeUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <div className="map-actions">
                      <button type="button" className="map-btn primary" disabled={saving} onClick={createSolo}>Create Solo</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="map-field">
                      <label className="map-label" htmlFor="map-album-title">Album Title</label>
                      <input id="map-album-title" className="map-input" value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} placeholder="Album title" />
                    </div>
                    <div className="map-field">
                      <label className="map-label" htmlFor="map-album-year">Year</label>
                      <input id="map-album-year" className="map-input" inputMode="numeric" value={albumYear} onChange={(event) => setAlbumYear(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2026" />
                    </div>
                    <MusicImageUpload value={albumCoverUrl} onChange={setAlbumCoverUrl} shape="square" label="Album Cover" disabled={saving} />

                    <div className="map-album-builder">
                      <div className="map-head">
                        <div>
                          <h3 className="map-section-title">Album Tracks</h3>
                          <div className="map-copy">One Album Cover is used for every track.</div>
                        </div>
                        <button type="button" className="map-btn" disabled={saving} onClick={addAlbumTrackRow}>+ Add Track</button>
                      </div>

                      {albumTracks.map((track, index) => (
                        <div className="map-track-draft" key={track.key}>
                          <div className="map-head">
                            <div className="map-release-title">Track {index + 1}</div>
                            <button type="button" className="map-btn" disabled={saving} onClick={() => removeAlbumTrackRow(index)}>Remove</button>
                          </div>
                          <div className="map-field">
                            <label className="map-label" htmlFor={`map-track-title-${index}`}>Song Title</label>
                            <input id={`map-track-title-${index}`} className="map-input" value={track.title} onChange={(event) => updateAlbumTrackRow(index, 'title', event.target.value)} placeholder="Song title" />
                          </div>
                          <div className="map-field">
                            <label className="map-label" htmlFor={`map-track-youtube-${index}`}>YouTube Link</label>
                            <input id={`map-track-youtube-${index}`} className="map-input" type="url" value={track.youtube_url} onChange={(event) => updateAlbumTrackRow(index, 'youtube_url', event.target.value)} placeholder="https://youtube.com/watch?v=..." />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="map-actions">
                      <button type="button" className="map-btn primary" disabled={saving} onClick={createAlbum}>Create Album</button>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="map-card">
              <div className="map-profile-head">
                <div className="map-profile">{selectedArtist.avatar_url ? <img src={selectedArtist.avatar_url} alt="" /> : <MusicIcon size={23} />}</div>
                <div>
                  <div className="map-profile-name">{selectedArtist.name}</div>
                  <div className="map-listener-value">{Number(selectedArtistDetail?.artist?.total_listeners ?? selectedArtist.total_listeners ?? 0).toLocaleString()}</div>
                  <div className="map-listener-label">Listeners (All Time)</div>
                </div>
                <button type="button" className="map-btn" onClick={() => openEditor('artist')}>Edit Artist</button>
              </div>

              <div className="map-metrics">
                <div className="map-metric"><div className="map-metric-label">Singles</div><div className="map-metric-value">{singles.length}</div></div>
                <div className="map-metric"><div className="map-metric-label">Albums</div><div className="map-metric-value">{albums.length}</div></div>
                <div className="map-metric"><div className="map-metric-label">Songs</div><div className="map-metric-value">{releases.reduce((total, release) => total + (release.songs?.length || 0), 0)}</div></div>
              </div>

              <div className="map-release-section">
                <div className="map-release-head"><div className="map-release-title">Singles / Solo</div><div className="map-copy">{singles.length}</div></div>
                {renderReleaseRows(singles, 'Solo releases')}
              </div>

              <div className="map-release-section">
                <div className="map-release-head"><div className="map-release-title">Albums</div><div className="map-copy">{albums.length}</div></div>
                {renderReleaseRows(albums, 'Albums')}
              </div>
            </section>
          </div>
        ) : (
          <div className="map-empty">Create or select an artist to begin.</div>
        )}

        {selectedArtist && editorMode ? (
          <div className="map-editor" ref={editorRef}>
            <AdminMusicManager
              data={selectedArtistDetail}
              mode={editorMode}
              selectedReleaseId={selectedEditReleaseId}
              onClose={closeEditor}
              onRefresh={refreshSelectedArtist}
              onReleaseDeleted={() => closeEditor()}
              onArtistDeleted={() => {
                artistDetailCache.current = {}
                setSelectedArtistId('')
                setSelectedArtistDetail(null)
                closeEditor()
                return loadOverview()
              }}
            />
          </div>
        ) : null}

        <div className={`map-status${error ? ' error' : ''}`}>{error || notice || 'Music data is connected to Shadow Backend.'}</div>
        <div className="map-history"><AdminMusicListenHistory /></div>
      </div>
    </AdminLayout>
  )
}
