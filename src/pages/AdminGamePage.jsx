import React, { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

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

  .game-admin-copy {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
  }

  .game-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .game-admin-card {
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
  }

  .game-admin-card-top {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .game-admin-profile {
    width: 96px;
    height: 96px;
    flex: 0 0 96px;
    overflow: hidden;
    display: grid;
    place-items: center;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #F8FAFC;
    color: #4F46E5;
    font-size: 34px;
    font-weight: 950;
  }

  .game-admin-profile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .game-admin-meta {
    min-width: 0;
    flex: 1;
  }

  .game-admin-key {
    margin-top: 5px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
  }

  .game-admin-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .game-admin-badge {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 5px 8px;
    font-size: 9px;
    font-weight: 900;
  }

  .game-admin-badge.warning {
    background: #FFF7ED;
    color: #C2410C;
  }

  .game-admin-badge.danger {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .game-admin-field {
    margin-top: 16px;
  }

  .game-admin-label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 10px;
    font-weight: 900;
  }

  .game-admin-input {
    width: 100%;
    min-height: 42px;
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

  .game-admin-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
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
  }

  .game-admin-btn:hover {
    background: #F8FAFC;
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
    opacity: 0.55;
    cursor: not-allowed;
  }

  .game-admin-file {
    display: none;
  }

  .game-admin-status {
    border-radius: 13px;
    background: #F8FAFC;
    color: #64748B;
    padding: 12px 14px;
    font-size: 11px;
    font-weight: 750;
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
    .game-admin-head {
      align-items: stretch;
      flex-direction: column;
    }

    .game-admin-grid {
      grid-template-columns: 1fr;
    }

    .game-admin-profile {
      width: 82px;
      height: 82px;
      flex-basis: 82px;
      border-radius: 19px;
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

function GameProfile({ game }) {
  if (game.profile) {
    return (
      <img
        src={game.profile}
        alt={game.name}
        loading="lazy"
      />
    )
  }

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
}) {
  const [name, setName] = useState(game.name || '')
  const fileRef = useRef(null)
  const busy = busyKey === game.gameKey

  useEffect(() => {
    setName(game.name || '')
  }, [game.name])

  function chooseProfile() {
    if (!busy) fileRef.current?.click()
  }

  function handleProfileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      onUploadProfile(game.gameKey, file)
    }
  }

  return (
    <article className="game-admin-card">
      <div className="game-admin-card-top">
        <button
          type="button"
          className="game-admin-profile"
          onClick={chooseProfile}
          disabled={busy}
          title="Change profile"
        >
          <GameProfile game={game} />
        </button>

        <div className="game-admin-meta">
          <strong>{game.name}</strong>
          <div className="game-admin-key">
            Game key: {game.gameKey}
          </div>

          <div className="game-admin-badges">
            <span className="game-admin-badge">
              Existing game
            </span>

            {game.hidden && (
              <span className="game-admin-badge warning">
                Hidden
              </span>
            )}

            {game.disabled && (
              <span className="game-admin-badge danger">
                Disabled
              </span>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        className="game-admin-file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleProfileChange}
      />

      <div className="game-admin-field">
        <label className="game-admin-label">
          Game name
        </label>

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
          className="game-admin-btn"
          disabled={busy}
          onClick={chooseProfile}
        >
          Change Profile
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
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function uploadProfile(gameKey, file) {
    if (!file?.type?.startsWith('image/')) {
      setError('Please choose an image file.')
      return
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
    } catch (requestError) {
      setError(requestError.message)
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
            <strong>Game Management</strong>
            <div className="game-admin-copy">
              Games come from code. Admin can only change
              profile, name, visibility and availability.
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

        {error && (
          <div className="game-admin-status error">
            {error}
          </div>
        )}

        {notice && (
          <div className="game-admin-status">
            {notice}
          </div>
        )}

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
                onToggleDisabled={(
                  gameKey,
                  disabled
                ) =>
                  updateGame(
                    gameKey,
                    { disabled },
                    disabled
                      ? 'Game disabled.'
                      : 'Game enabled.'
                  )
                }
                onUploadProfile={uploadProfile}
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
