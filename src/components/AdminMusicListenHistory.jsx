import React, { useCallback, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

function UserAvatar({ user }) {
  const label = String(user?.name || user?.username || '?').trim().charAt(0).toUpperCase() || '?'

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt=""
        style={{
          width: 42,
          height: 42,
          borderRadius: 999,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        background: '#E2E8F0',
        color: '#334155',
        fontSize: 14,
        fontWeight: 900,
      }}
    >
      {label}
    </div>
  )
}

export default function AdminMusicListenHistory() {
  const [open, setOpen] = useState(false)
  const [listens, setListens] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const loadPage = useCallback(async (nextPage, append = false) => {
    const token = getAdminToken()

    if (!token) {
      setError('Admin login required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/music/admin/listens?page=${nextPage}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load listener history')
      }

      const rows = Array.isArray(data.listens) ? data.listens : []

      setListens((current) => append ? [...current, ...rows] : rows)
      setPage(Number(data.pagination?.page || nextPage))
      setTotal(Number(data.pagination?.total || 0))
      setHasMore(Boolean(data.pagination?.has_more))
      setLoaded(true)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load listener history')
    } finally {
      setLoading(false)
    }
  }, [])

  async function toggleOpen() {
    const nextOpen = !open
    setOpen(nextOpen)

    if (nextOpen && !loaded && !loading) {
      await loadPage(1, false)
    }
  }

  return (
    <section
      style={{
        marginBottom: 18,
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          width: '100%',
          minHeight: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          border: 0,
          background: '#FFFFFF',
          padding: '12px 14px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div
            style={{
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 950,
            }}
          >
            Listener History
          </div>
          <div
            style={{
              marginTop: 3,
              color: '#64748B',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            See which Shadow accounts listened to each song
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            flexShrink: 0,
          }}
        >
          {loaded ? (
            <span
              style={{
                color: '#64748B',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {total}
            </span>
          ) : null}

          <span
            style={{
              color: '#64748B',
              fontSize: 16,
              lineHeight: 1,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform .18s ease',
            }}
          >
            ⌄
          </span>
        </div>
      </button>

      {open ? (
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                color: '#64748B',
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              Latest valid-listen records
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => loadPage(1, false)}
              style={{
                minHeight: 34,
                border: '1px solid #E2E8F0',
                borderRadius: 9,
                background: '#FFFFFF',
                color: '#0F172A',
                padding: '0 11px',
                fontSize: 10,
                fontWeight: 850,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.55 : 1,
              }}
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div
              style={{
                borderRadius: 10,
                background: '#FEF2F2',
                color: '#B91C1C',
                padding: '10px 12px',
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              {error}
            </div>
          ) : null}

          {!error && loading && !listens.length ? (
            <div
              style={{
                border: '1px dashed #CBD5E1',
                borderRadius: 12,
                padding: 18,
                color: '#64748B',
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              Loading listener history...
            </div>
          ) : null}

          {!error && loaded && !listens.length ? (
            <div
              style={{
                border: '1px dashed #CBD5E1',
                borderRadius: 12,
                padding: 18,
                color: '#64748B',
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              No music listens yet.
            </div>
          ) : null}

          {listens.length ? (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {listens.map((listen) => {
                const user = listen.user
                const song = listen.song
                const username = user?.username ? `@${user.username}` : ''
                const releaseText = song?.release?.title || ''
                const artistText = song?.artist?.name || ''

                return (
                  <div
                    key={listen.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 11,
                      border: '1px solid #E2E8F0',
                      borderRadius: 13,
                      background: '#FFFFFF',
                      padding: 10,
                    }}
                  >
                    <UserAvatar user={user} />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: '#0F172A',
                          fontSize: 11,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user?.name || username || 'Unknown account'}
                        {user?.name && username ? (
                          <span
                            style={{
                              marginLeft: 5,
                              color: '#64748B',
                              fontSize: 9,
                              fontWeight: 700,
                            }}
                          >
                            {username}
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: '#334155',
                          fontSize: 10,
                          fontWeight: 850,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {song?.title || 'Unknown song'}
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          color: '#64748B',
                          fontSize: 9,
                          fontWeight: 650,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {[artistText, releaseText].filter(Boolean).join(' • ')}
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          color: '#94A3B8',
                          fontSize: 9,
                          fontWeight: 650,
                        }}
                      >
                        {formatDate(listen.created_at)}
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: 72,
                        textAlign: 'right',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 25,
                          borderRadius: 999,
                          padding: '0 9px',
                          background: listen.counted_view ? '#ECFDF5' : '#F8FAFC',
                          color: listen.counted_view ? '#047857' : '#64748B',
                          fontSize: 9,
                          fontWeight: 900,
                        }}
                      >
                        {listen.counted_view ? '+1 View' : 'History'}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          color: '#64748B',
                          fontSize: 9,
                          fontWeight: 750,
                        }}
                      >
                        {Number(song?.view_count || 0)} Views
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {hasMore ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => loadPage(page + 1, true)}
              style={{
                width: '100%',
                minHeight: 38,
                marginTop: 10,
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                background: '#F8FAFC',
                color: '#0F172A',
                fontSize: 10,
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.55 : 1,
              }}
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
