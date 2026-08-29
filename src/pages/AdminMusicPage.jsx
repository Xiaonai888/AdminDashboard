import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const initialArtists = [
  { id: 1, name: 'Skye Hart', albums: 2, singles: 8, songs: 31 },
  { id: 2, name: 'Becki Alexander', albums: 1, singles: 12, songs: 28 },
]

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

  .am-input {
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

  .am-input:focus {
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

  .am-create-card {
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
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
    line-height: 1.5;
  }

  .am-empty {
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
    .am-song-card {
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
  }

  @media (max-width: 390px) {
    .am-toolbar {
      align-items: stretch;
    }

    .am-intro-text {
      max-width: 210px;
    }

    .am-mini-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`

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
  const [artists, setArtists] = useState(initialArtists)
  const [query, setQuery] = useState('')
  const [showArtistForm, setShowArtistForm] = useState(true)
  const [artistName, setArtistName] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState(null)
  const [youtubeLink, setYoutubeLink] = useState('')
  const [notice, setNotice] = useState('')

  const filteredArtists = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return artists
    return artists.filter((artist) => artist.name.toLowerCase().includes(keyword))
  }, [artists, query])

  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId) || null

  function addArtist() {
    const name = artistName.trim()
    if (!name) {
      setNotice('Enter an artist name first.')
      return
    }

    const newArtist = {
      id: Date.now(),
      name,
      albums: 0,
      singles: 0,
      songs: 0,
    }

    setArtists((current) => [newArtist, ...current])
    setArtistName('')
    setShowArtistForm(false)
    setNotice(`${name} is ready in this UI preview.`)
  }

  function previewSong() {
    const link = youtubeLink.trim()
    if (!link) {
      setNotice('Paste a YouTube link first.')
      return
    }

    setNotice('YouTube preview is ready for the next backend stage.')
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

          <button
            type="button"
            className="am-primary-btn"
            onClick={() => setShowArtistForm(true)}
          >
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
            placeholder="Search Skye Hart..."
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
              <button type="button" className="am-primary-btn" onClick={addArtist}>Save</button>
              <button type="button" className="am-secondary-btn" onClick={() => setShowArtistForm(false)}>Cancel</button>
            </div>
          </div>
        ) : null}

        <div className="am-section-head">
          <h3 className="am-section-title">Artists</h3>
          <div className="am-section-count">{artists.length} artists</div>
        </div>

        <div className="am-artist-list">
          {filteredArtists.length ? filteredArtists.map((artist) => (
            <div className="am-artist-row" key={artist.id}>
              <div className="am-avatar"><MusicIcon /></div>
              <div>
                <h4 className="am-artist-name">{artist.name}</h4>
                <div className="am-artist-meta">{artist.albums} Albums • {artist.singles} Singles • {artist.songs} Songs</div>
              </div>
              <button
                type="button"
                className="am-manage-btn"
                onClick={() => setSelectedArtistId((current) => current === artist.id ? null : artist.id)}
              >
                Manage
              </button>
            </div>
          )) : (
            <div className="am-empty">No artist found.</div>
          )}
        </div>

        {selectedArtist ? (
          <div className="am-manage-card">
            <div className="am-manage-top">
              <div>
                <div className="am-manage-name">Manage Artist → {selectedArtist.name}</div>
                <div className="am-manage-meta">Albums / Singles / Songs</div>
              </div>
              <button type="button" className="am-secondary-btn" onClick={() => setSelectedArtistId(null)}>Close</button>
            </div>

            <div className="am-mini-grid">
              <div className="am-mini-card">
                <div className="am-mini-label">Albums</div>
                <div className="am-mini-value">{selectedArtist.albums}</div>
              </div>
              <div className="am-mini-card">
                <div className="am-mini-label">Singles</div>
                <div className="am-mini-value">{selectedArtist.singles}</div>
              </div>
              <div className="am-mini-card">
                <div className="am-mini-label">Songs</div>
                <div className="am-mini-value">{selectedArtist.songs}</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="am-card am-song-card">
          <div className="am-song-head">
            <div>
              <h3 className="am-card-title">Add Song</h3>
              <div className="am-card-subtitle">YouTube is the media source</div>
            </div>
            <div className="am-play-icon"><PlayIcon /></div>
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

          <div className="am-song-grid">
            <div className="am-field-card">
              <div className="am-field-label">Type</div>
              <div className="am-field-value">Single</div>
            </div>
            <div className="am-field-card">
              <div className="am-field-label">Cover</div>
              <div className="am-field-value">1:1 Square</div>
            </div>
          </div>

          <button type="button" className="am-secondary-btn am-preview-btn" onClick={previewSong}>Preview Song</button>
        </div>

        <div className="am-notice">{notice || 'UI only. No backend data is saved in this stage.'}</div>
      </div>
    </AdminLayout>
  )
}
