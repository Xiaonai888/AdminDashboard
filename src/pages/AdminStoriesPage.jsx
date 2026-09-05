import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import StoryUpdateActivityPanel from '../components/StoryUpdateActivityPanel'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function getAdminUser() {
  try {
    return JSON.parse(sessionStorage.getItem('shadow_admin_user') || localStorage.getItem('shadow_admin_user') || '{}')
  } catch {
    return {}
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function copyText(value) {
  if (!value) return
  navigator.clipboard?.writeText(String(value)).catch(() => {})
}

async function downloadStoryMedia(storyId, mediaType, mediaIndex, fallbackName) {
  const token = getAdminToken()
  const response = await fetch(
    `${API_URL}/api/admin/stories/${encodeURIComponent(storyId)}/media/${encodeURIComponent(mediaType)}/${Number(mediaIndex || 0)}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to download media')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition') || ''
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  const fileName = utf8Name
    ? decodeURIComponent(utf8Name)
    : plainName || fallbackName || 'story-media'
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'published' || value === 'active') return 'green'
  if (value === 'restricted' || value === 'ready' || value === 'scheduled') return 'yellow'
  if (value === 'disabled' || value === 'deleted') return 'red'
  return 'gray'
}

function StoryStatus({ label }) {
  return <span className={`story-admin-badge ${getStatusClass(label)}`}>{label || '-'}</span>
}

function SummaryCard({ label, value, tone, text }) {
  return (
    <div className={`story-admin-card ${tone || ''}`}>
      <div className="story-admin-card-label">{label}</div>
      <div className="story-admin-card-value">{formatNumber(value)}</div>
      <div className="story-admin-card-text">{text}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="story-admin-detail-item">
      <div className="story-admin-detail-label">{label}</div>
      <div className="story-admin-detail-value">{value || '-'}</div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="story-admin-empty">
      <div className="story-admin-empty-icon">📚</div>
      <div className="story-admin-empty-title">No stories found</div>
      <div className="story-admin-empty-text">{text || 'Try changing search or filters.'}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="story-admin-loading">
      <span className="story-admin-spinner" />
      <span>Loading stories...</span>
    </div>
  )
}

function ModerationModal({ action, story, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  if (!action || !story) return null

  const titleMap = {
    restrict: 'Restrict Story',
    disable: 'Disable Story',
    active: 'Remove Restriction',
    warning: 'Issue Warning',
    disableAuthor: 'Disable Author Page',
    enableAuthor: 'Enable Author Page',
  }

  const needsReason = !['active', 'enableAuthor'].includes(action)

  return (
    <div className="story-admin-modal-layer" onMouseDown={onClose}>
      <div className="story-admin-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="story-admin-modal-top">
          <div>
            <div className="story-admin-kicker">Moderation Action</div>
            <h3>{titleMap[action]}</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="story-admin-modal-story">
          <div className="story-admin-cover small">
            {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
          </div>
          <div>
            <div className="story-admin-title-small">{story.title}</div>
            <div className="story-admin-muted">ID: {story.id}</div>
          </div>
        </div>

        {needsReason ? (
          <label className="story-admin-field">
            <span>Reason</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Write the policy or legal reason..." rows={4} />
          </label>
        ) : null}

        <label className="story-admin-field">
          <span>Admin Note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note..." rows={3} />
        </label>

        <div className="story-admin-modal-actions">
          <button type="button" className="story-admin-btn light" onClick={onClose}>Cancel</button>
          <button type="button" className="story-admin-btn primary" disabled={loading || (needsReason && reason.trim().length < 5)} onClick={() => onSubmit({ action, reason, note })}>
            {loading ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function safeAdminImageUrl(value) {
  const source = String(value || '').trim()
  if (!source) return ''

  try {
    const url = new URL(source, window.location.origin)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function sanitizeAdminEpisodeHtml(value) {
  const source = String(value || '').trim()
  if (!source || typeof DOMParser === 'undefined') return source

  const documentValue = new DOMParser().parseFromString(`<div>${source}</div>`, 'text/html')
  const root = documentValue.body.firstElementChild
  if (!root) return ''

  const allowedTags = new Set(['P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I', 'IMG'])

  root.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((element) => element.remove())

  Array.from(root.querySelectorAll('*')).forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (!['src', 'alt'].includes(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName === 'IMG') {
      const imageUrl = safeAdminImageUrl(element.getAttribute('src'))
      if (imageUrl) {
        element.setAttribute('src', imageUrl)
        element.setAttribute('style', 'display:block;max-width:100%;height:auto;margin:16px auto;border-radius:12px;')
      } else {
        element.remove()
      }
    }
  })

  return root.innerHTML
}

function AdminEpisodePreview({ storyType, episode }) {
  const content = episode?.content || ''
  const pages = Array.isArray(episode?.pages) ? episode.pages : []

  const chatData = useMemo(() => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      return parsed?.format === 'shadow_chat_story_v1' ? parsed : null
    } catch {
      return null
    }
  }, [content])

  const normalizedType = String(
    storyType ||
    episode?.story_type ||
    episode?.storyType ||
    ''
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  const type = chatData
    ? 'chat_story'
    : pages.length || normalizedType.includes('manga')
      ? 'manga'
      : normalizedType.includes('chat')
        ? 'chat_story'
        : 'novel'

  const novelHtml = useMemo(
    () => sanitizeAdminEpisodeHtml(content),
    [content]
  )

  if (type === 'manga') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        {pages.length ? pages.map((page, index) => {
          const imageUrl = safeAdminImageUrl(page.image_url)

          return imageUrl ? (
            <img
              key={page.id || `${imageUrl}-${index}`}
              src={imageUrl}
              alt={`Manga page ${index + 1}`}
              loading="lazy"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          ) : null
        }) : <div className="story-admin-muted-box">No Manga pages found.</div>}
      </div>
    )
  }

  if (type === 'chat_story') {
    const characters = new Map(
      (Array.isArray(chatData?.characters) ? chatData.characters : [])
        .map((character) => [String(character.id || ''), character])
    )
    const messages = Array.isArray(chatData?.messages)
      ? [...chatData.messages].sort(
          (first, second) =>
            Number(first?.sort_order || 0) -
            Number(second?.sort_order || 0)
        )
      : []
    const leadCharacterId = String(
      chatData?.lead_character_id ||
      chatData?.leadCharacterId ||
      ''
    )

    if (!messages.length) {
      return <div className="story-admin-muted-box">No Chat Story messages found.</div>
    }

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {messages.map((message, index) => {
          const characterId = String(
            message?.character_id ||
            message?.characterId ||
            ''
          )
          const character = characters.get(characterId)
          const isRight =
            characterId === leadCharacterId ||
            character?.is_lead === true ||
            character?.chat_side === 'right'
          const imageUrl = safeAdminImageUrl(
            message?.image_url ||
            message?.imageUrl
          )
          const avatarUrl = safeAdminImageUrl(character?.avatar_url)
          const isCentered =
            message?.type === 'aside' ||
            message?.type === 'author_note'

          if (isCentered) {
            return (
              <div
                key={message.id || index}
                style={{
                  justifySelf: 'center',
                  maxWidth: '88%',
                  borderRadius: 16,
                  background: '#eef2f7',
                  padding: '10px 14px',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.text}
              </div>
            )
          }

          return (
            <div
              key={message.id || index}
              style={{
                display: 'flex',
                justifyContent: isRight ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              {!isRight && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}

              <div
                style={{
                  maxWidth: '76%',
                  textAlign: isRight ? 'right' : 'left',
                }}
              >
                {character?.nickname ? (
                  <div
                    style={{
                      marginBottom: 4,
                      fontSize: 11,
                      color: '#64748b',
                    }}
                  >
                    {character.nickname}
                  </div>
                ) : null}

                {message?.type === 'image' && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: '60vh',
                      borderRadius: 14,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'inline-block',
                      borderRadius: 18,
                      background: isRight ? '#6d4aff' : '#eef2f7',
                      color: isRight ? '#ffffff' : '#1e293b',
                      padding: '10px 14px',
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                    }}
                  >
                    {message?.text || ''}
                  </div>
                )}
              </div>

              {isRight && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return novelHtml ? (
    <div
      dangerouslySetInnerHTML={{ __html: novelHtml }}
      style={{ lineHeight: 1.9, fontSize: 16 }}
    />
  ) : <div className="story-admin-muted-box">No content found.</div>
}

function StoryDrawer({ story, details, loading, onClose, onAction, canManage }) {
  const [readingEpisode, setReadingEpisode] = useState(null)

  if (!story) return null

  const fullStory = details?.story || story
  const episodes = details?.episodes || []
  const logs = details?.moderation_logs || []
  const author = fullStory.author_page
  const slides = Array.isArray(details?.slides) ? details.slides : Array.isArray(fullStory.slides) ? fullStory.slides : []
  const mediaItems = [
    fullStory.cover_url
      ? {
          label: 'Cover',
          url: fullStory.cover_url,
          mediaType: 'cover',
          mediaIndex: 0,
          fileName: `${fullStory.title}-cover`,
        }
      : null,
    ...slides.slice(0, 5).map((slide, index) => ({
      label: `Slide ${index + 1}`,
      url: slide.image_url || slide.slide_url || slide.url || slide.cover_url,
      mediaType: 'slide',
      mediaIndex: index,
      fileName: `${fullStory.title}-slide-${index + 1}`,
    })),
  ].filter((item) => item?.url)

  return (
    <div className="story-admin-drawer-layer" onMouseDown={onClose}>
      <aside className="story-admin-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="story-admin-drawer-top">
          <div>
            <div className="story-admin-kicker">Story Details</div>
            <h3>{fullStory.title}</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        {loading ? <LoadingState /> : (
          <>
            <div className="story-admin-drawer-profile">
              <div className="story-admin-cover large">
                {fullStory.cover_url ? <img src={fullStory.cover_url} alt={fullStory.title} /> : '📖'}
              </div>
              <div>
                <div className="story-admin-title-large">{fullStory.title}</div>
                <div className="story-admin-muted">{author?.page_name || 'Unknown Author'} · @{author?.page_username || 'no_username'}</div>
                <div className="story-admin-status-row">
  <StoryStatus label={fullStory.story_type === 'chat_story' ? 'Chat Story' : fullStory.story_type === 'manga' ? 'Manga' : 'Novel'} />
  <StoryStatus label={fullStory.status} />
  <StoryStatus label={fullStory.admin_visibility_status} />
                  {fullStory.deleted_at ? <StoryStatus label="deleted" /> : null}
                </div>
              </div>
            </div>

            {mediaItems.length ? (
              <div className="story-admin-media-list">
                <div className="story-admin-media-title">Media Files</div>
                {mediaItems.map((item) => (
                  <div key={item.label} className="story-admin-media-row">
                    <span>{item.label}</span>
                    <button type="button" onClick={() => {
                        downloadStoryMedia(
                          fullStory.id,
                          item.mediaType,
                          item.mediaIndex,
                          item.fileName
                        ).catch((error) => window.alert(error.message))
                      }}
                      title={`Download ${item.label}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 3v11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="story-admin-action-grid">
              <button type="button" onClick={() => copyText(fullStory.id)}>Copy Story ID</button>
              <button type="button" onClick={() => copyText(fullStory.author_id)}>Copy Author ID</button>
              {canManage ? (
                <>
                  <button type="button" onClick={() => onAction('warning', fullStory)}>Warning</button>
                  {fullStory.admin_visibility_status === 'active'
                    ? <button type="button" onClick={() => onAction('restrict', fullStory)}>Restrict</button>
                    : <button type="button" onClick={() => onAction('active', fullStory)}>Remove Restriction</button>}
                  <button type="button" onClick={() => onAction('disable', fullStory)}>Disable Story</button>
                  {author?.admin_status === 'disabled'
                    ? <button type="button" onClick={() => onAction('enableAuthor', fullStory)}>Enable Author Page</button>
                    : <button type="button" onClick={() => onAction('disableAuthor', fullStory)}>Disable Author Page</button>}
                </>
              ) : null}
            </div>

            <div className="story-admin-detail-grid">
              <DetailItem label="Story ID" value={fullStory.id} />
              <DetailItem label="Author ID" value={fullStory.author_id} />
              <DetailItem label="Genre" value={fullStory.main_genre} />
              <DetailItem label="Language" value={fullStory.story_language} />
              <DetailItem label="Episodes" value={formatNumber(fullStory.total_episodes)} />
              <DetailItem label="Views" value={formatNumber(fullStory.total_views)} />
              <DetailItem label="Likes" value={formatNumber(fullStory.total_likes)} />
              <DetailItem label="Comments" value={formatNumber(fullStory.total_comments)} />
              <DetailItem label="Warnings" value={formatNumber(fullStory.policy_warning_count)} />
              <DetailItem label="Created" value={formatDateTime(fullStory.created_at)} />
              <DetailItem label="Updated" value={formatDateTime(fullStory.updated_at)} />
              <DetailItem label="Deleted" value={formatDateTime(fullStory.deleted_at)} />
              <DetailItem label="Author Restore Left" value={fullStory.author_restore_days_left === null ? '-' : `${fullStory.author_restore_days_left} days`} />
              <DetailItem label="Safety Archive Left" value={fullStory.admin_archive_days_left === null ? '-' : `${fullStory.admin_archive_days_left} days`} />
            </div>

            <div className="story-admin-section-title">Episodes</div>
            <div className="story-admin-mini-table">
              {episodes.length ? episodes.map((episode) => (
                <div key={episode.id} className="story-admin-mini-row">
                  <div>
                    <strong>EP {episode.episode_number}: {episode.title}</strong>
                    <span>{episode.id}</span>
                  </div>
                  <div className="story-admin-mini-right">
                    <StoryStatus label={episode.deleted_at ? 'deleted' : episode.status} />
                    <span>{formatNumber(episode.character_count)} chars</span>
                    <button
                      type="button"
                      className="story-admin-btn light"
                      onClick={() => setReadingEpisode(episode)}
                    >
                      Read
                    </button>
                  </div>
                </div>
              )) : <div className="story-admin-muted-box">No episodes found.</div>}
            </div>

            <div className="story-admin-section-title">Moderation History</div>
            <div className="story-admin-log-list">
              {logs.length ? logs.map((log) => (
                <div key={log.id} className="story-admin-log-item">
                  <div>
                    <strong>{log.action}</strong>
                    <span>{log.reason || '-'}</span>
                  </div>
                  <div>{formatDateTime(log.created_at)}</div>
                </div>
              )) : <div className="story-admin-muted-box">No moderation history yet.</div>}
            </div>
          </>
        )}
      </aside>

      {readingEpisode ? (
        <div className="story-admin-modal-layer" onMouseDown={() => setReadingEpisode(null)}>
          <div className="story-admin-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="story-admin-modal-top">
              <div>
                <div className="story-admin-kicker">Read Episode</div>
                <h3>EP {readingEpisode.episode_number}: {readingEpisode.title}</h3>
              </div>
              <button type="button" onClick={() => setReadingEpisode(null)}>×</button>
            </div>

            <div className="story-admin-status-row">
              <StoryStatus label={readingEpisode.deleted_at ? 'deleted' : readingEpisode.status} />
              <span className="story-admin-muted">{formatNumber(readingEpisode.character_count)} chars</span>
            </div>

            <div
              style={{
                marginTop: 16,
                maxHeight: '68vh',
                overflowY: 'auto',
                color: '#0f172a',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <AdminEpisodePreview
                storyType={fullStory.story_type}
                episode={readingEpisode}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function AdminStoriesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const adminUser = useMemo(getAdminUser, [])
  const adminRole = String(adminUser?.role || '').trim().toLowerCase()
  const canManageStories =
    adminUser?.has_all_permissions === true ||
    adminRole === 'owner' ||
    adminRole === 'admin' ||
    (
      Array.isArray(adminUser?.permission_keys) &&
      adminUser.permission_keys.includes('stories.manage')
    )

  function handleExpiredAdminToken(response, data) {
    if (response.status !== 401) return false
    sessionStorage.removeItem('shadow_admin_token')
    localStorage.removeItem('shadow_admin_token')
    sessionStorage.removeItem('shadow_admin_user')
    localStorage.removeItem('shadow_admin_user')
    navigate('/login', { replace: true })
    return true
  }

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'updates' ? 'updates' : 'active')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [visibility, setVisibility] = useState('all')
  const [genre, setGenre] = useState('all')
  const [storyType, setStoryType] = useState('all')
  const [page, setPage] = useState(1)
  const [summary, setSummary] = useState({})
  const [stories, setStories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStory, setSelectedStory] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [modalStory, setModalStory] = useState(null)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadSummary() {
      try {
        setSummaryLoading(true)
        const token = getAdminToken()
        const response = await fetch(`${API_URL}/api/admin/stories/overview`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json().catch(() => ({}))
        if (handleExpiredAdminToken(response, data)) return
if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load overview')
        if (!alive) return
        setSummary(data.summary || {})
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load overview')
      } finally {
        if (alive) setSummaryLoading(false)
      }
    }

    loadSummary()

    return () => {
      alive = false
    }
  }, [refreshKey])

  useEffect(() => {
    let alive = true

    async function loadStories() {
  if (activeTab === 'updates') {
    setLoading(false)
    return
  }

  try {
        setLoading(true)
        setError('')
        const token = getAdminToken()
        const params = new URLSearchParams({
          tab: activeTab,
          page: String(page),
          limit: String(PAGE_SIZE),
          status,
          visibility,
          genre,
          story_type: storyType,
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/stories?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json().catch(() => ({}))
        if (handleExpiredAdminToken(response, data)) return
if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load stories')
        if (!alive) return

        setStories(data.stories || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load stories')
        setStories([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadStories()

    return () => {
      alive = false
    }
  }, [activeTab, page, status, visibility, genre, storyType, debouncedSearch, refreshKey])

  useEffect(() => {
    if (!selectedStory?.id) return
    let alive = true

    async function loadDetails() {
      try {
        setDetailsLoading(true)
        const token = getAdminToken()
        const response = await fetch(`${API_URL}/api/admin/stories/${selectedStory.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json().catch(() => ({}))
        if (handleExpiredAdminToken(response, data)) return
if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load story details')
        if (!alive) return
        setDetails(data)
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load story details')
      } finally {
        if (alive) setDetailsLoading(false)
      }
    }

    loadDetails()

    return () => {
      alive = false
    }
  }, [selectedStory, refreshKey])

  const tabs = [
    { key: 'active', label: 'Active Stories', count: summary.active_stories },
    { key: 'restricted', label: 'Restricted', count: Number(summary.restricted_stories || 0) + Number(summary.disabled_stories || 0) },
    { key: 'deleted', label: 'Deleted by Authors', count: summary.deleted_by_authors },
    { key: 'warnings', label: 'Warnings', count: summary.warned_stories },
    { key: 'all', label: 'All Stories', count: summary.total_stories },
    { key: 'updates', label: 'Story Updates', count: null },
  ]

  const storyTypeTabs = [
    { key: 'all', label: 'All' },
    { key: 'novel', label: 'Novel' },
    { key: 'manga', label: 'Manga' },
    { key: 'chat_story', label: 'Chat Story' },
  ]

  const genreOptions = useMemo(() => {
    const values = stories.map((story) => story.main_genre).filter(Boolean)
    return ['all', ...Array.from(new Set(values))]
  }, [stories])

  function openAction(action, story) {
    if (!canManageStories) return
    setModalAction(action)
    setModalStory(story)
  }

  function closeAction() {
    setModalAction('')
    setModalStory(null)
  }

  async function submitAction({ action, reason, note }) {
    if (!modalStory) return

    try {
      setSaving(true)
      const token = getAdminToken()
      let endpoint = `${API_URL}/api/admin/stories/${modalStory.id}/visibility`
      let method = 'PATCH'
      let body = {}

      if (action === 'restrict') body = { visibility: 'restricted', reason, admin_note: note }
      if (action === 'disable') body = { visibility: 'disabled', reason, admin_note: note }
      if (action === 'active') body = { visibility: 'active', admin_note: note }
      if (action === 'warning') {
        endpoint = `${API_URL}/api/admin/stories/${modalStory.id}/warnings`
        method = 'POST'
        body = { reason, admin_note: note }
      }
      if (action === 'disableAuthor' || action === 'enableAuthor') {
        endpoint = `${API_URL}/api/admin/stories/authors/${modalStory.author_id}/status`
        body = { status: action === 'disableAuthor' ? 'disabled' : 'active', reason, admin_note: note }
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (handleExpiredAdminToken(response, data)) return
if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to save moderation action')

      closeAction()
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to save moderation action')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Stories" subtitle="View stories, protect deleted stories for 90 days, and enforce platform policy without deleting author work.">
      <style>{styles}</style>

      <div className="story-admin-page">
        {error ? <div className="story-admin-alert">{error}</div> : null}

        <div className="story-admin-summary">
          <SummaryCard label="Total Stories" value={summaryLoading ? 0 : summary.total_stories} text="All author stories" />
          <SummaryCard label="Active Stories" value={summaryLoading ? 0 : summary.active_stories} tone="green" text="Currently available in system" />
          <SummaryCard label="Deleted by Authors" value={summaryLoading ? 0 : summary.deleted_by_authors} tone="yellow" text="Protected archive period" />
          <SummaryCard label="Restricted / Disabled" value={summaryLoading ? 0 : Number(summary.restricted_stories || 0) + Number(summary.disabled_stories || 0)} tone="red" text="Policy enforcement" />
          <SummaryCard label="Warnings" value={summaryLoading ? 0 : summary.warned_stories} tone="purple" text="Policy warning records" />
        </div>

        <div className="story-admin-panel">
          <div className="story-admin-tabs">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" className={activeTab === tab.key ? 'active' : ''} onClick={() => { setActiveTab(tab.key); setPage(1) }}>
                {tab.label}
                {tab.count === null ? null : <span>{formatNumber(tab.count || 0)}</span>}
              </button>
            ))}
          </div>

          {activeTab !== 'updates' ? (
            <div className="story-admin-type-tabs">
              {storyTypeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={storyType === tab.key ? 'active' : ''}
                  onClick={() => {
                    setStoryType(tab.key)
                    setPage(1)
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}

          {activeTab === 'updates' ? <StoryUpdateActivityPanel /> : null}

          <div className="story-admin-toolbar" hidden={activeTab === 'updates'}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, genre, language, or exact Story ID..." />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <select value={visibility} onChange={(event) => { setVisibility(event.target.value); setPage(1) }}>
              <option value="all">All Visibility</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="disabled">Disabled</option>
            </select>
            <select value={genre} onChange={(event) => { setGenre(event.target.value); setPage(1) }}>
              {genreOptions.map((item) => <option key={item} value={item}>{item === 'all' ? 'All Genres' : item}</option>)}
            </select>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>Refresh</button>
          </div>

          <div className="story-admin-table-wrap" hidden={activeTab === 'updates'}>
            {loading ? <LoadingState /> : stories.length ? (
              <table className="story-admin-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Story</th>
                    <th>Story ID</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Status</th>
                    <th>Visibility</th>
                    <th>Episodes</th>
                    <th>Views</th>
                    <th>Warnings</th>
                    <th>Deleted / Archive</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story, index) => (
                    <tr
  key={story.id}
  className="story-admin-clickable-row"
  onClick={() => {
    setSelectedStory(story)
    setDetails(null)
  }}
>
                      <td>{(pagination.page - 1) * PAGE_SIZE + index + 1}</td>
                      <td>
                        <div className="story-admin-story-cell">
                          <div className="story-admin-cover">
                            {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
                          </div>
                          <div>
                            <div className="story-admin-story-title">{story.title}</div>
                            <div className="story-admin-muted">{story.story_language || '-'} · {story.is_adult ? '18+' : 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td><button type="button" className="story-admin-copy" onClick={(event) => { event.stopPropagation(); copyText(story.id) }}>{story.id}</button></td>
                      <td>
                        <div className="story-admin-author-name">{story.author_page?.page_name || 'Unknown'}</div>
                        <div className="story-admin-muted">@{story.author_page?.page_username || 'no_username'}</div>
                      </td>
                      <td>{story.main_genre || '-'}</td>
                      <td><StoryStatus label={story.status} /></td>
                      <td><StoryStatus label={story.admin_visibility_status} /></td>
                      <td>{formatNumber(story.total_episodes)}</td>
                      <td>{formatNumber(story.total_views)}</td>
                      <td>{formatNumber(story.policy_warning_count)}</td>
                      <td>
                        {story.deleted_at ? (
                          <div>
                            <div>{formatDate(story.deleted_at)}</div>
                            <div className="story-admin-muted">Archive left: {story.admin_archive_days_left ?? '-'} days</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td>{formatDate(story.updated_at)}</td>
                      <td>
                        <div className="story-admin-row-actions">
                          {canManageStories ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                openAction('warning', story)
                              }}
                            >
                              Warning
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState />}
          </div>

          <div className="story-admin-pagination" hidden={activeTab === 'updates'}>
            <div>Page {pagination.page} of {pagination.total_pages} · {formatNumber(pagination.total)} records</div>
            <div>
              <button type="button" disabled={!pagination.has_prev || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
              <button type="button" disabled={!pagination.has_next || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>

      <StoryDrawer
        story={selectedStory}
        details={details}
        loading={detailsLoading}
        onClose={() => {
          setSelectedStory(null)
          setDetails(null)
        }}
        onAction={openAction}
        canManage={canManageStories}
      />

      {canManageStories ? (
        <ModerationModal
          action={modalAction}
          story={modalStory}
          onClose={closeAction}
          onSubmit={submitAction}
          loading={saving}
        />
      ) : null}
    </AdminLayout>
  )
}

const styles = `
  .story-admin-page { display: flex; flex-direction: column; gap: 18px; }
  .story-admin-alert { border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 14px; padding: 12px 14px; font-weight: 850; font-size: 13px; }
  .story-admin-summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
  .story-admin-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 18px; padding: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .story-admin-card.green { background: #F0FDF4; border-color: #BBF7D0; }
  .story-admin-card.yellow { background: #FFFBEB; border-color: #FDE68A; }
  .story-admin-card.red { background: #FEF2F2; border-color: #FECACA; }
  .story-admin-card.purple { background: #F5F3FF; border-color: #DDD6FE; }
  .story-admin-card-label { color: #64748B; font-size: 12px; font-weight: 900; }
  .story-admin-card-value { margin-top: 8px; color: #0F172A; font-size: 26px; font-weight: 950; }
  .story-admin-card-text { margin-top: 4px; color: #64748B; font-size: 12px; font-weight: 750; }
  .story-admin-panel { background: #fff; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .story-admin-tabs { display: flex; gap: 8px; padding: 14px; border-bottom: 1px solid #E2E8F0; overflow-x: auto; }
  .story-admin-tabs button { border: 0; background: #F8FAFC; color: #475569; border-radius: 999px; padding: 10px 14px; cursor: pointer; font-weight: 900; display: flex; gap: 8px; align-items: center; white-space: nowrap; }
  .story-admin-tabs button.active { background: #EEF2FF; color: #4F46E5; }
  .story-admin-tabs span { background: rgba(255,255,255,0.75); padding: 2px 7px; border-radius: 999px; font-size: 11px; }
  .story-admin-type-tabs { display: flex; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #E2E8F0; overflow-x: auto; background: #FCFCFF; }
  .story-admin-type-tabs button { flex: 0 0 auto; border: 1px solid #E2E8F0; background: #FFFFFF; color: #475569; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-weight: 900; white-space: nowrap; }
  .story-admin-type-tabs button.active { border-color: #C7D2FE; background: #EEF2FF; color: #4F46E5; }
  .story-admin-toolbar { display: grid; grid-template-columns: 1fr 150px 160px 150px auto; gap: 10px; padding: 14px; border-bottom: 1px solid #E2E8F0; }
  .story-admin-toolbar input, .story-admin-toolbar select { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 12px; padding: 11px 12px; color: #0F172A; font-weight: 750; outline: none; min-width: 0; }
  .story-admin-toolbar input:focus, .story-admin-toolbar select:focus { border-color: #4F46E5; background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .story-admin-toolbar button, .story-admin-pagination button, .story-admin-row-actions button, .story-admin-action-grid button { border: 0; border-radius: 12px; background: #EEF2FF; color: #4F46E5; padding: 10px 12px; font-weight: 900; cursor: pointer; }
  .story-admin-table-wrap { overflow-x: auto; min-height: 420px; }
  .story-admin-table { width: 100%; border-collapse: collapse; min-width: 1320px; }
  .story-admin-table th { background: #F8FAFC; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; text-align: left; padding: 12px 14px; border-bottom: 1px solid #E2E8F0; }
  .story-admin-table td { padding: 13px 14px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; color: #334155; font-size: 13px; font-weight: 700; }
  .story-admin-clickable-row { cursor: pointer; }
  .story-admin-clickable-row:hover td { background: #F8FAFC; }
  .story-admin-story-cell { display: flex; gap: 11px; align-items: center; min-width: 230px; }
  .story-admin-cover { width: 42px; height: 56px; border-radius: 10px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; font-size: 20px; }
  .story-admin-cover.small { width: 38px; height: 50px; }
  .story-admin-cover.large { width: 82px; height: 112px; border-radius: 16px; font-size: 34px; }
  .story-admin-cover img { width: 100%; height: 100%; object-fit: cover; }
  .story-admin-story-title, .story-admin-author-name, .story-admin-title-small { color: #0F172A; font-weight: 950; }
  .story-admin-title-large { color: #0F172A; font-size: 18px; font-weight: 950; }
  .story-admin-muted { color: #64748B; font-size: 12px; font-weight: 750; margin-top: 3px; }
  .story-admin-copy { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 0; background: #F8FAFC; color: #475569; border-radius: 9px; padding: 6px 8px; cursor: pointer; font-weight: 800; }
  .story-admin-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 950; text-transform: capitalize; }
  .story-admin-badge.green { background: #DCFCE7; color: #15803D; }
  .story-admin-badge.yellow { background: #FEF3C7; color: #B45309; }
  .story-admin-badge.red { background: #FEE2E2; color: #B91C1C; }
  .story-admin-badge.gray { background: #F1F5F9; color: #475569; }
  .story-admin-row-actions { display: flex; gap: 7px; }
  .story-admin-pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 850; }
  .story-admin-pagination div:last-child { display: flex; gap: 8px; }
  .story-admin-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  .story-admin-loading, .story-admin-empty { min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #64748B; font-weight: 850; }
  .story-admin-spinner { width: 24px; height: 24px; border: 3px solid #E0E7FF; border-top-color: #4F46E5; border-radius: 999px; animation: storyAdminSpin 0.8s linear infinite; }
  .story-admin-empty-icon { font-size: 34px; }
  .story-admin-empty-title { color: #0F172A; font-size: 16px; font-weight: 950; }
  .story-admin-empty-text { font-size: 13px; }
  .story-admin-drawer-layer, .story-admin-modal-layer { position: fixed; inset: 0; z-index: 1000; background: rgba(15, 23, 42, 0.35); display: flex; justify-content: flex-end; }
  .story-admin-drawer { width: min(720px, 100%); height: 100vh; background: #fff; overflow-y: auto; padding: 22px; box-shadow: -20px 0 50px rgba(15, 23, 42, 0.16); }
  .story-admin-drawer-top, .story-admin-modal-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
  .story-admin-drawer-top h3, .story-admin-modal-top h3 { margin: 3px 0 0; font-size: 20px; color: #0F172A; }
  .story-admin-drawer-top button, .story-admin-modal-top button { border: 0; background: #F1F5F9; width: 34px; height: 34px; border-radius: 999px; cursor: pointer; color: #475569; font-size: 22px; }
  .story-admin-kicker { color: #4F46E5; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.7px; }
  .story-admin-drawer-profile, .story-admin-modal-story { display: flex; gap: 16px; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 18px; padding: 15px; margin-bottom: 14px; }
  .story-admin-status-row { margin-top: 9px; display: flex; flex-wrap: wrap; gap: 7px; }
  .story-admin-media-list { border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; margin: 12px 0 14px; background: #fff; }
  .story-admin-media-title { padding: 11px 12px; background: #F8FAFC; color: #4F46E5; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.4px; }
  .story-admin-media-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 12px; border-top: 1px solid #F1F5F9; color: #0F172A; font-size: 13px; font-weight: 900; }
  .story-admin-media-row button { width: 34px; height: 34px; border: 0; border-radius: 10px; background: #EEF2FF; color: #4F46E5; cursor: pointer; }
  .story-admin-action-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
  .story-admin-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 14px 0 20px; }
  .story-admin-detail-item { border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; background: #fff; }
  .story-admin-detail-label { color: #64748B; font-size: 11px; font-weight: 950; text-transform: uppercase; }
  .story-admin-detail-value { color: #0F172A; font-size: 13px; font-weight: 900; margin-top: 5px; word-break: break-word; }
  .story-admin-section-title { color: #0F172A; font-size: 14px; font-weight: 950; margin: 18px 0 10px; }
  .story-admin-mini-table, .story-admin-log-list { border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
  .story-admin-mini-row, .story-admin-log-item { display: flex; justify-content: space-between; gap: 12px; padding: 12px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
  .story-admin-mini-row:last-child, .story-admin-log-item:last-child { border-bottom: 0; }
  .story-admin-mini-row strong, .story-admin-log-item strong { display: block; color: #0F172A; font-weight: 950; }
  .story-admin-mini-row span, .story-admin-log-item span { display: block; color: #64748B; font-size: 12px; font-weight: 750; margin-top: 3px; }
  .story-admin-mini-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .story-admin-muted-box { padding: 14px; color: #64748B; font-weight: 800; }
  .story-admin-modal-layer { justify-content: center; align-items: center; }
  .story-admin-modal { width: min(520px, calc(100% - 24px)); background: #fff; border-radius: 22px; padding: 20px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22); }
  .story-admin-field { display: flex; flex-direction: column; gap: 7px; margin-top: 12px; color: #334155; font-size: 12px; font-weight: 950; }
  .story-admin-field textarea { border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; resize: vertical; font-family: inherit; outline: none; }
  .story-admin-field textarea:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .story-admin-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
  .story-admin-btn { border: 0; border-radius: 12px; padding: 11px 15px; font-weight: 950; cursor: pointer; }
  .story-admin-btn.light { background: #F1F5F9; color: #475569; }
  .story-admin-btn.primary { background: #4F46E5; color: white; }
  .story-admin-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  @keyframes storyAdminSpin { to { transform: rotate(360deg); } }
  @media (max-width: 1180px) {
    .story-admin-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .story-admin-toolbar {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 760px) {
    .story-admin-page {
      min-width: 0;
      gap: 14px;
    }

    .story-admin-alert {
      overflow-wrap: anywhere;
    }

    .story-admin-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .story-admin-card {
      min-width: 0;
      padding: 15px;
    }

    .story-admin-card-value {
      font-size: 23px;
    }

    .story-admin-card-text {
      overflow-wrap: anywhere;
    }

    .story-admin-panel {
      border-radius: 18px;
    }

    .story-admin-tabs {
      flex-wrap: nowrap;
      padding: 12px;
      scrollbar-width: none;
    }

    .story-admin-tabs::-webkit-scrollbar,
    .story-admin-type-tabs::-webkit-scrollbar {
      display: none;
    }

    .story-admin-type-tabs {
      padding: 10px 12px;
      scrollbar-width: none;
    }

    .story-admin-tabs button {
      flex: 0 0 auto;
      padding: 10px 13px;
      font-size: 12px;
    }

    .story-admin-toolbar {
      grid-template-columns: 1fr;
      padding: 12px;
    }

    .story-admin-toolbar input,
    .story-admin-toolbar select,
    .story-admin-toolbar button {
      width: 100%;
      min-height: 42px;
    }

    .story-admin-table-wrap {
      min-height: 360px;
      overscroll-behavior-x: contain;
    }

    .story-admin-table {
      min-width: 1180px;
    }

    .story-admin-pagination {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .story-admin-pagination > div:first-child {
      text-align: center;
      overflow-wrap: anywhere;
    }

    .story-admin-pagination div:last-child {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .story-admin-pagination button {
      width: 100%;
    }

    .story-admin-drawer {
      width: 100%;
      padding: 18px 16px 28px;
    }

    .story-admin-drawer-top h3,
    .story-admin-modal-top h3 {
      font-size: 18px;
      overflow-wrap: anywhere;
    }

    .story-admin-drawer-profile {
      align-items: flex-start;
    }

    .story-admin-drawer-profile > div:last-child,
    .story-admin-modal-story > div:last-child {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .story-admin-detail-grid {
      grid-template-columns: 1fr;
    }

    .story-admin-action-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .story-admin-action-grid button {
      min-height: 42px;
      overflow-wrap: anywhere;
    }

    .story-admin-mini-row,
    .story-admin-log-item {
      align-items: flex-start;
      flex-direction: column;
    }

    .story-admin-mini-right {
      width: 100%;
      align-items: flex-start;
    }

    .story-admin-mini-right .story-admin-btn {
      width: 100%;
    }

    .story-admin-media-row {
      gap: 12px;
    }

    .story-admin-media-row span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .story-admin-modal {
      width: calc(100% - 20px);
      max-height: calc(100vh - 20px);
      overflow-y: auto;
      padding: 17px;
      border-radius: 18px;
    }

    .story-admin-modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .story-admin-modal-actions .story-admin-btn {
      width: 100%;
    }

    .story-admin-field textarea {
      width: 100%;
    }

    .story-admin-empty,
    .story-admin-loading {
      min-height: 280px;
      padding: 24px 16px;
      text-align: center;
    }
  }

  @media (max-width: 520px) {
    .story-admin-summary {
      grid-template-columns: 1fr;
    }

    .story-admin-card {
      padding: 14px;
    }

    .story-admin-action-grid {
      grid-template-columns: 1fr;
    }

    .story-admin-drawer-profile,
    .story-admin-modal-story {
      align-items: flex-start;
      flex-direction: column;
    }

    .story-admin-cover.large {
      width: 72px;
      height: 98px;
    }

    .story-admin-modal-actions {
      grid-template-columns: 1fr;
    }

    .story-admin-pagination div:last-child {
      grid-template-columns: 1fr;
    }

    .story-admin-table {
      min-width: 1080px;
    }
  }
`
