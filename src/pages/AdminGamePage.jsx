import React, { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ImageDropZone from '../components/common/ImageDropZone'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const MAX_PROFILE_BYTES = 20 * 1024 * 1024
const ALLOWED_PROFILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const styles = `
  .game-admin-page {
    display: grid;
    gap: 18px;
  }

  .game-admin-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .game-admin-title {
    margin: 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 900;
  }

  .game-admin-copy {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }

  .game-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 18px;
  }

  .game-admin-card {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }

  .game-admin-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 18px 14px;
    border-bottom: 1px solid #F1F5F9;
  }

  .game-admin-card-title-wrap {
    min-width: 0;
  }

  .game-admin-card-title {
    overflow: hidden;
    color: #0F172A;
    font-size: 17px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .game-admin-key {
    margin-top: 4px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
  }

  .game-admin-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }

  .game-admin-badge {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 5px 8px;
    font-size: 9px;
    font-weight: 900;
    white-space: nowrap;
  }

  .game-admin-badge.warning {
    background: #FFF7ED;
    color: #C2410C;
  }

  .game-admin-badge.danger {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .game-admin-card-body {
    padding: 18px;
  }

  .game-admin-section-label {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .game-admin-profile-editor {
    display: grid;
    grid-template-columns: 132px 1fr;
    gap: 14px;
    align-items: stretch;
  }

  .game-admin-drop {
    min-height: 132px;
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    background: #F8FAFC;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .game-admin-drop:hover {
    border-color: #818CF8;
    background: #F5F7FF;
  }

  .image-drop-zone {
    position: relative;
    border-radius: inherit;
  }

  .image-drop-zone.dragging {
    outline: 2px solid #4F46E5;
    outline-offset: 3px;
  }

  .image-drop-zone-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: inherit;
    background: rgba(79, 70, 229, 0.92);
    color: #FFFFFF;
    padding: 16px;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    pointer-events: none;
  }

  .game-admin-profile-picker {
    width: 100%;
    min-height: 132px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: inherit;
    background: transparent;
    padding: 10px;
    cursor: pointer;
  }

  .game-admin-profile-picker:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .game-admin-preview {
    width: 106px;
    height: 106px;
    overflow: hidden;
    display: grid;
    place-items: center;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    color: #4F46E5;
    font-size: 34px;
    font-weight: 950;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  }

  .game-admin-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .game-admin-profile-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .game-admin-profile-info strong {
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
  }

  .game-admin-profile-info p {
    margin: 5px 0 0;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.55;
  }

  .game-admin-pending {
    margin-top: 8px;
    overflow: hidden;
    color: #4F46E5;
    font-size: 10px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .game-admin-profile-actions,
  .game-admin-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .game-admin-field {
    margin-top: 18px;
  }

  .game-admin-input {
    width: 100%;
    min-height: 44px;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
  }

  .game-admin-input:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .game-admin-btn {
    min-height: 38px;
    border: 1px solid #CBD5E1;
    border-radius: 11px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 12px;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .game-admin-btn:hover:not(:disabled) {
    background: #F8FAFC;
  }

  .game-admin-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .game-admin-btn.primary {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .game-admin-btn.warning {
    border-color: #FDBA74;
    background: #FFF7ED;
    color: #C2410C;
  }

  .game-admin-btn.danger {
    border-color: #FCA5A5;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .game-admin-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .game-admin-file {
    display: none;
  }

  .game-admin-local-error {
    margin-top: 8px;
    border-radius: 10px;
    background: #FEF2F2;
    color: #B91C1C;
    padding: 8px 10px;
    font-size: 10px;
    font-weight: 800;
  }

  .game-admin-status {
    border-radius: 13px;
    background: #EEF2FF;
    color: #4338CA;
    padding: 12px 14px;
    font-size: 11px;
    font-weight: 800;
  }

  .game-admin-status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .game-admin-empty {
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 28px;
    color: #64748B;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
  }

  @media (max-width: 640px) {
    .game-admin-head,
    .game-admin-card-head {
      align-items: stretch;
      flex-direction: column;
    }

    .game-admin-badges {
      justify-content: flex-start;
    }

    .game-admin-grid {
      grid-template-columns: 1fr;
    }

    .game-admin-profile-editor {
      grid-template-columns: 112px 1fr;
    }

    .game-admin-drop,
    .game-admin-profile-picker {
      min-height: 112px;
    }

    .game-admin-preview {
      width: 90px;
      height: 90px;
      border-radius: 18px;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

async function adminGameRequest(path, options = {}) {
  const token = getAdminToken()

  if (!token) {
    throw new Error('Admin login required')
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Game request failed')
  }

  return data
}

function profileInitial(game) {
  return String(game.name || game.gameKey || 'G')
    .trim()
    .charAt(0)
    .toUpperCase()
}

function GameCard({
  game,
  busyKey,
  onSaveName,
  onToggleHidden,
  onToggleDisabled,
  onUploadProfile,
  onRemoveProfile,
}) {
  const [name, setName] = useState(game.name || '')
  const [pendingFile, setPendingFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [profileError, setProfileError] = useState('')
  const fileRef = useRef(null)
  const previewRef = useRef('')
  const busy = busyKey === game.gameKey

  useEffect(() => {
    setName(game.name || '')
  }, [game.name])

  useEffect(() => {
    previewRef.current = previewUrl
  }, [previewUrl])

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  function clearPendingProfile() {
    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current)
    }

    previewRef.current = ''
    setPreviewUrl('')
    setPendingFile(null)
    setProfileError('')
  }

  function stageProfile(file) {
    if (!file || busy) return

    if (!ALLOWED_PROFILE_TYPES.has(String(file.type || ''))) {
      setProfileError('Use JPEG, PNG, WEBP, GIF or AVIF.')
      return
    }

    if (file.size > MAX_PROFILE_BYTES) {
      setProfileError('Profile image must be 20 MB or smaller.')
      return
    }

    if (previewRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewRef.current)
    }

    const nextPreview = URL.createObjectURL(file)
    previewRef.current = nextPreview
    setPreviewUrl(nextPreview)
    setPendingFile(file)
    setProfileError('')
  }

  async function uploadPendingProfile() {
    if (!pendingFile || busy) return

    const uploaded = await onUploadProfile(
      game.gameKey,
      pendingFile
    )

    if (uploaded) {
      clearPendingProfile()
    }
  }

  const visibleProfile = previewUrl || game.profile || ''

  return (
    <article className="game-admin-card">
      <div className="game-admin-card-head">
        <div className="game-admin-card-title-wrap">
          <div className="game-admin-card-title">
            {game.name}
          </div>
          <div className="game-admin-key">
            Game key: {game.gameKey}
          </div>
        </div>

        <div className="game-admin-badges">
          <span className="game-admin-badge">
            Existing game
          </span>

          {game.hidden ? (
            <span className="game-admin-badge warning">
              Hidden
            </span>
          ) : null}

          {game.disabled ? (
            <span className="game-admin-badge danger">
              Disabled
            </span>
          ) : null}
        </div>
      </div>

      <div className="game-admin-card-body">
        <span className="game-admin-section-label">
          GAME PROFILE
        </span>

        <div className="game-admin-profile-editor">
          <ImageDropZone
            className="game-admin-drop"
            label="Drop game profile here"
            disabled={busy}
            onFiles={(files) => stageProfile(files[0])}
          >
            <button
              type="button"
              className="game-admin-profile-picker"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <div className="game-admin-preview">
                {visibleProfile ? (
                  <img
                    src={visibleProfile}
                    alt={`${game.name} profile preview`}
                  />
                ) : (
                  profileInitial(game)
                )}
              </div>
            </button>
          </ImageDropZone>

          <div className="game-admin-profile-info">
            <strong>
              {pendingFile
                ? 'Preview ready'
                : game.profile
                  ? 'Current profile'
                  : 'No profile image'}
            </strong>

            <p>
              Drop an image here or choose one. Nothing is uploaded
              until you press Upload Profile.
            </p>

            {pendingFile ? (
              <div className="game-admin-pending">
                {pendingFile.name}
              </div>
            ) : null}

            <div className="game-admin-profile-actions">
              <button
                type="button"
                className="game-admin-btn"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                Choose Image
              </button>

              {pendingFile ? (
                <>
                  <button
                    type="button"
                    className="game-admin-btn primary"
                    disabled={busy}
                    onClick={uploadPendingProfile}
                  >
                    {busy ? 'Uploading...' : 'Upload Profile'}
                  </button>

                  <button
                    type="button"
                    className="game-admin-btn"
                    disabled={busy}
                    onClick={clearPendingProfile}
                  >
                    Cancel
                  </button>
                </>
              ) : null}

              {game.profile && !pendingFile ? (
                <button
                  type="button"
                  className="game-admin-btn danger"
                  disabled={busy}
                  onClick={() => onRemoveProfile(game.gameKey)}
                >
                  Remove Profile
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          className="game-admin-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            stageProfile(file)
          }}
        />

        {profileError ? (
          <div className="game-admin-local-error">
            {profileError}
          </div>
        ) : null}

        <div className="game-admin-field">
          <span className="game-admin-section-label">
            GAME NAME
          </span>

          <input
            className="game-admin-input"
            value={name}
            maxLength={100}
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="game-admin-actions">
          <button
            type="button"
            className="game-admin-btn primary"
            disabled={
              busy ||
              !name.trim() ||
              name.trim() === game.name
            }
            onClick={() =>
              onSaveName(game.gameKey, name.trim())
            }
          >
            Save Name
          </button>

          <button
            type="button"
            className={`game-admin-btn ${
              game.hidden ? 'primary' : 'warning'
            }`}
            disabled={busy}
            onClick={() =>
              onToggleHidden(
                game.gameKey,
                !game.hidden
              )
            }
          >
            {game.hidden ? 'Show Game' : 'Hide Game'}
          </button>

          <button
            type="button"
            className={`game-admin-btn ${
              game.disabled ? 'primary' : 'danger'
            }`}
            disabled={busy}
            onClick={() =>
              onToggleDisabled(
                game.gameKey,
                !game.disabled
              )
            }
          >
            {game.disabled
              ? 'Enable Game'
              : 'Disable Game'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function AdminGamePage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const loadGames = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await adminGameRequest('/api/admin/games')
      setGames(
        Array.isArray(data.games) ? data.games : []
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGames()
  }, [loadGames])

  function replaceGame(updatedGame) {
    setGames((current) =>
      current.map((game) =>
        game.gameKey === updatedGame.gameKey
          ? updatedGame
          : game
      )
    )
  }

  async function updateGame(gameKey, patch, message) {
    setBusyKey(gameKey)
    setNotice('')
    setError('')

    try {
      const data = await adminGameRequest(
        `/api/admin/games/${encodeURIComponent(gameKey)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }
      )

      replaceGame(data.game)
      setNotice(message)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setBusyKey('')
    }
  }

  async function uploadProfile(gameKey, file) {
    if (
      !file ||
      !ALLOWED_PROFILE_TYPES.has(String(file.type || ''))
    ) {
      setError('Please choose a supported image file.')
      return false
    }

    if (file.size > MAX_PROFILE_BYTES) {
      setError('Profile image must be 20 MB or smaller.')
      return false
    }

    setBusyKey(gameKey)
    setNotice('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('profile', file)

      const data = await adminGameRequest(
        `/api/admin/games/${encodeURIComponent(gameKey)}/profile`,
        {
          method: 'POST',
          body: formData,
        }
      )

      replaceGame(data.game)
      setNotice('Game profile updated.')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setBusyKey('')
    }
  }

  return (
    <AdminLayout
      title="Game"
      subtitle="Manage existing games shown on the reader Me > Game page."
    >
      <style>{styles}</style>

      <div className="game-admin-page">
        <div className="game-admin-head">
          <div>
            <h2 className="game-admin-title">
              Game Management
            </h2>
            <div className="game-admin-copy">
              Games come from code. Change profile, name,
              visibility and availability here.
            </div>
          </div>

          <button
            type="button"
            className="game-admin-btn"
            onClick={loadGames}
            disabled={loading || Boolean(busyKey)}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="game-admin-status error">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="game-admin-status">
            {notice}
          </div>
        ) : null}

        {loading ? (
          <div className="game-admin-empty">
            Loading games...
          </div>
        ) : games.length ? (
          <div className="game-admin-grid">
            {games.map((game) => (
              <GameCard
                key={game.gameKey}
                game={game}
                busyKey={busyKey}
                onSaveName={(gameKey, name) =>
                  updateGame(
                    gameKey,
                    { name },
                    'Game name updated.'
                  )
                }
                onToggleHidden={(gameKey, hidden) =>
                  updateGame(
                    gameKey,
                    { hidden },
                    hidden
                      ? 'Game hidden.'
                      : 'Game visible.'
                  )
                }
                onToggleDisabled={(gameKey, disabled) =>
                  updateGame(
                    gameKey,
                    { disabled },
                    disabled
                      ? 'Game disabled.'
                      : 'Game enabled.'
                  )
                }
                onUploadProfile={uploadProfile}
                onRemoveProfile={(gameKey) =>
                  updateGame(
                    gameKey,
                    { profile: null },
                    'Game profile removed.'
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="game-admin-empty">
            No coded games were returned by the backend.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
