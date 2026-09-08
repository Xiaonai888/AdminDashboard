import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function typeLabel(value) {
  if (value === 'manga') return 'Manga'
  if (value === 'chat_story') return 'Chat Story'
  return 'Novel'
}

export default function AuthorBooksModal({ author, onClose }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!author?.id) return undefined

    let alive = true

    async function loadStories() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/api/admin/stories?tab=active&page=1&limit=100&author_id=${encodeURIComponent(author.id)}`,
          {
            headers: {
              Authorization: `Bearer ${getAdminToken()}`,
            },
          }
        )

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load stories')
        }

        if (alive) setStories(Array.isArray(data.stories) ? data.stories : [])
      } catch (err) {
        if (!alive) return
        setStories([])
        setError(err.message || 'Failed to load stories')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadStories()

    return () => {
      alive = false
    }
  }, [author?.id])

  if (!author) return null

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(15,23,42,.48)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(560px,100%)',
          maxHeight: '80vh',
          overflow: 'hidden',
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 24px 70px rgba(15,23,42,.28)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: '18px 20px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#4F46E5' }}>
              AUTHOR BOOKS
            </div>
            <div style={{ marginTop: 3, fontSize: 20, fontWeight: 950 }}>
              {author.author_name || author.username || 'Author'}
            </div>
            <div style={{ marginTop: 2, fontSize: 12, color: '#64748B' }}>
              {stories.length.toLocaleString()} stories
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              background: '#fff',
              fontSize: 22,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto', padding: 16 }}>
          {loading ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#64748B', fontWeight: 800 }}>
              Loading stories...
            </div>
          ) : error ? (
            <div style={{ padding: 16, borderRadius: 12, background: '#FEF2F2', color: '#B91C1C', fontWeight: 800 }}>
              {error}
            </div>
          ) : stories.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {stories.map((story) => (
                <div
                  key={story.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 62,
                      flex: '0 0 46px',
                      overflow: 'hidden',
                      borderRadius: 9,
                      background: '#F1F5F9',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {story.cover_url ? (
                      <img
                        src={story.cover_url}
                        alt={story.title || 'Story'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '📖'
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {story.title || 'Untitled'}
                    </div>

                    <div style={{ marginTop: 5, fontSize: 12, color: '#64748B' }}>
                      {typeLabel(story.story_type)} · {story.status || '-'} · {Number(story.total_episodes || 0).toLocaleString()} EP
                    </div>

                    <div style={{ marginTop: 4, fontSize: 11, color: '#94A3B8' }}>
                      {story.main_genre || 'No genre'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 28, textAlign: 'center', color: '#64748B', fontWeight: 800 }}>
              No stories found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
