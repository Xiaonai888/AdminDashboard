import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const durations = [
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

const styles = `
  .cm-page {
    max-width: 1380px;
    min-width: 0;
    margin: 0 auto;
  }

  .cm-head {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }

  .cm-head > div {
    min-width: 0;
  }

  .cm-title {
    margin: 0;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -.04em;
  }

  .cm-desc {
    max-width: 760px;
    margin: 7px 0 0;
    color: #64748B;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.65;
  }

  .cm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .cm-btn {
    min-height: 42px;
    border: 1px solid #DDE3EC;
    border-radius: 13px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 15px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .cm-btn.primary {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .cm-btn.danger {
    border-color: #DC2626;
    background: #DC2626;
    color: #FFFFFF;
  }

  .cm-btn:disabled,
  .cm-small:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .cm-msg {
    margin-bottom: 16px;
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .cm-msg.success {
    background: #ECFDF5;
    color: #047857;
  }

  .cm-msg.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .cm-panel {
    overflow: hidden;
    min-width: 0;
    margin-bottom: 18px;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 10px 32px rgba(15, 23, 42, .05);
  }

  .cm-panel-head {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    border-bottom: 1px solid #E2E8F0;
    padding: 17px 19px;
  }

  .cm-panel-head > div {
    min-width: 0;
  }

  .cm-panel-title {
    margin: 0;
    color: #0F172A;
    font-size: 16px;
    font-weight: 950;
  }

  .cm-note {
    margin: 5px 0 0;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .cm-search-row {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 120px;
    gap: 10px;
    padding: 18px;
  }

  .cm-input,
  .cm-select,
  .cm-textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #DDE3EC;
    border-radius: 13px;
    background: #F8FAFC;
    color: #0F172A;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    outline: none;
    box-sizing: border-box;
  }

  .cm-input,
  .cm-select {
    height: 42px;
    padding: 0 12px;
  }

  .cm-textarea {
    min-height: 98px;
    resize: vertical;
    padding: 11px 12px;
    line-height: 1.55;
  }

  .cm-input:focus,
  .cm-select:focus,
  .cm-textarea:focus {
    border-color: #818CF8;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .11);
  }

  .cm-story-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 18px 18px;
  }

  .cm-story {
    display: flex;
    width: 100%;
    min-width: 0;
    gap: 13px;
    border: 1px solid #E2E8F0;
    border-radius: 17px;
    background: #FFFFFF;
    padding: 12px;
    text-align: left;
    cursor: pointer;
  }

  .cm-story:hover {
    border-color: #A5B4FC;
    box-shadow: 0 10px 24px rgba(79, 70, 229, .08);
  }

  .cm-story > div:last-child {
    min-width: 0;
  }

  .cm-cover {
    width: 64px;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    flex-shrink: 0;
    border-radius: 13px;
    background: #EEF2FF;
  }

  .cm-cover.selected {
    width: 72px;
  }

  .cm-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cm-cover-empty {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: #4F46E5;
    font-size: 24px;
    font-weight: 950;
  }

  .cm-story-title {
    display: -webkit-box;
    overflow: hidden;
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow-wrap: anywhere;
  }

  .cm-meta {
    margin-top: 5px;
    color: #64748B;
    font-size: 11px;
    font-weight: 750;
    overflow-wrap: anywhere;
  }

  .cm-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 9px;
  }

  .cm-pill {
    display: inline-flex;
    min-height: 24px;
    align-items: center;
    border-radius: 999px;
    background: #F8FAFC;
    color: #64748B;
    padding: 0 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .cm-empty {
    padding: 42px 20px;
    color: #94A3B8;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .cm-selected {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 17px 18px;
    border-bottom: 1px solid #E2E8F0;
  }

  .cm-selected > div:last-child {
    min-width: 0;
  }

  .cm-selected h2 {
    margin: 0;
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
    letter-spacing: -.025em;
    overflow-wrap: anywhere;
  }

  .cm-toolbar {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 390px;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #E2E8F0;
    padding: 14px 18px;
  }

  .cm-sort {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 7px;
  }

  .cm-sort-btn {
    height: 34px;
    border: 1px solid #DDE3EC;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    padding: 0 12px;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
  }

  .cm-sort-btn.active {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .cm-list {
    display: grid;
    gap: 11px;
    padding: 17px;
  }

  .cm-card {
    display: flex;
    min-width: 0;
    gap: 12px;
    border: 1px solid #EEF2F7;
    border-radius: 17px;
    background: #FFFFFF;
    padding: 14px;
  }

  .cm-avatar {
    display: flex;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 999px;
    background: #111827;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 950;
  }

  .cm-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cm-body {
    min-width: 0;
    flex: 1;
  }

  .cm-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .cm-top > div {
    min-width: 0;
  }

  .cm-user {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .cm-date {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
    overflow-wrap: anywhere;
  }

  .cm-text {
    margin-top: 9px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .cm-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 12px;
  }

  .cm-small {
    min-height: 31px;
    border: 1px solid #DDE3EC;
    border-radius: 10px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 10px;
    font: inherit;
    font-size: 9px;
    font-weight: 950;
    cursor: pointer;
  }

  .cm-small.restrict {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .cm-small.delete {
    border-color: #DC2626;
    background: #DC2626;
    color: #FFFFFF;
  }

  .cm-badge {
    display: inline-flex;
    min-height: 24px;
    flex-shrink: 0;
    align-items: center;
    border-radius: 999px;
    padding: 0 9px;
    font-size: 9px;
    font-weight: 950;
  }

  .cm-badge.visible {
    background: #DCFCE7;
    color: #15803D;
  }

  .cm-badge.hidden {
    background: #FEF3C7;
    color: #B45309;
  }

  .cm-reports {
    display: grid;
    gap: 9px;
    padding: 16px 18px 18px;
  }

  .cm-report {
    min-width: 0;
    border: 1px solid #EEF2F7;
    border-radius: 14px;
    background: #FFFFFF;
    padding: 12px;
  }

  .cm-report-title {
    color: #0F172A;
    font-size: 11px;
    font-weight: 950;
    text-transform: capitalize;
  }

  .cm-report-details {
    margin-top: 5px;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .cm-report-meta {
    margin-top: 6px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
    overflow-wrap: anywhere;
  }

  .cm-layer {
    position: fixed;
    inset: 0;
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, .45);
    padding: 18px;
  }

  .cm-modal {
    width: min(500px, 100%);
    max-height: calc(100dvh - 36px);
    overflow-y: auto;
    border-radius: 21px;
    background: #FFFFFF;
    box-shadow: 0 28px 80px rgba(15, 23, 42, .25);
  }

  .cm-modal-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #E2E8F0;
    padding: 18px;
  }

  .cm-modal-head > div {
    min-width: 0;
  }

  .cm-modal-title {
    margin: 0;
    color: #0F172A;
    font-size: 17px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .cm-close {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #0F172A;
    font: inherit;
    font-size: 20px;
    cursor: pointer;
  }

  .cm-modal-body {
    display: grid;
    gap: 11px;
    padding: 18px;
  }

  .cm-reader {
    border-radius: 13px;
    background: #F8FAFC;
    padding: 11px 12px;
    color: #334155;
    font-size: 11px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .cm-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid #E2E8F0;
    padding: 14px 18px;
  }

  @media (max-width: 880px) {
    .cm-head {
      flex-direction: column;
    }

    .cm-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .cm-actions .cm-btn {
      width: 100%;
    }

    .cm-story-grid {
      grid-template-columns: 1fr;
    }

    .cm-toolbar {
      grid-template-columns: 1fr;
    }

    .cm-sort {
      justify-content: flex-start;
    }
  }

  @media (max-width: 560px) {
    .cm-title {
      font-size: 24px;
    }

    .cm-desc {
      overflow-wrap: anywhere;
    }

    .cm-actions {
      grid-template-columns: 1fr;
    }

    .cm-panel {
      border-radius: 19px;
    }

    .cm-panel-head {
      padding: 15px;
    }

    .cm-search-row {
      grid-template-columns: 1fr;
      padding: 15px;
    }

    .cm-search-row .cm-btn {
      width: 100%;
    }

    .cm-story-grid {
      padding: 0 12px 12px;
    }

    .cm-story {
      gap: 10px;
      padding: 10px;
    }

    .cm-cover {
      width: 56px;
    }

    .cm-cover.selected {
      width: 62px;
    }

    .cm-selected {
      align-items: flex-start;
      padding: 14px;
    }

    .cm-selected h2 {
      font-size: 18px;
    }

    .cm-toolbar {
      padding: 12px 14px;
    }

    .cm-sort {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .cm-sort::-webkit-scrollbar {
      display: none;
    }

    .cm-sort-btn {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .cm-list {
      padding: 12px;
    }

    .cm-card {
      gap: 10px;
      padding: 12px;
    }

    .cm-top {
      align-items: flex-start;
    }

    .cm-card-actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .cm-small {
      width: 100%;
      min-width: 0;
      min-height: 36px;
      padding: 5px;
    }

    .cm-reports {
      padding: 12px;
    }

    .cm-layer {
      align-items: flex-end;
      padding: 8px;
    }

    .cm-modal {
      width: 100%;
      max-height: calc(100dvh - 16px);
      border-radius: 20px;
    }

    .cm-modal-head,
    .cm-modal-body {
      padding: 16px;
    }

    .cm-modal-actions {
      position: sticky;
      bottom: 0;
      z-index: 2;
      flex-direction: column-reverse;
      padding: 14px 16px;
      background: #FFFFFF;
    }

    .cm-modal-actions .cm-btn {
      width: 100%;
    }
  }

  @media (max-width: 400px) {
    .cm-story {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
    }

    .cm-card {
      flex-direction: column;
    }

    .cm-top {
      gap: 8px;
    }

    .cm-card-actions {
      grid-template-columns: 1fr;
    }
  }
`

function token() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '-'
  return date.toLocaleString('en-US')
}

function readerName(comment) {
  return comment?.user?.name || comment?.user?.username || 'Reader'
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}), 'X-Admin-Name': 'Admin' }
  const adminToken = token()
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

function Cover({ story, selected = false }) {
  return (
    <div className={`cm-cover ${selected ? 'selected' : ''}`}>
      {story?.cover_url ? <img src={story.cover_url} alt={story.title || 'Story'} /> : <div className="cm-cover-empty">S</div>}
    </div>
  )
}

export default function CommentModerationPage() {
  const [search, setSearch] = useState('')
  const [stories, setStories] = useState([])
  const [story, setStory] = useState(null)
  const [comments, setComments] = useState([])
  const [reports, setReports] = useState([])
  const [commentSearch, setCommentSearch] = useState('')
  const [sort, setSort] = useState('new')
  const [loadingStories, setLoadingStories] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [restrictComment, setRestrictComment] = useState(null)
  const [duration, setDuration] = useState('24h')
  const [reason, setReason] = useState('Admin moderation')

  const visible = useMemo(() => comments.filter((item) => !item.is_hidden).length, [comments])
  const hidden = useMemo(() => comments.filter((item) => item.is_hidden).length, [comments])
  const filtered = useMemo(() => {
    const keyword = commentSearch.trim().toLowerCase()
    const list = comments.filter((item) => !keyword || [item.text, item.user?.name, item.user?.username].some((value) => String(value || '').toLowerCase().includes(keyword)))
    list.sort((a, b) => {
      const first = new Date(a.created_at).getTime()
      const second = new Date(b.created_at).getTime()
      if (sort === 'old') return first - second
      if (sort === 'most') return Number(b.likes || 0) - Number(a.likes || 0) || second - first
      return second - first
    })
    return list
  }, [comments, commentSearch, sort])

  function show(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
  }

  async function loadReports() {
    try {
      setLoadingReports(true)
      const data = await api('/api/admin/comments/records?limit=30')
      setReports(Array.isArray(data.records) ? data.records : [])
    } catch {
      setReports([])
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function searchStories() {
    const value = search.trim()
    if (!value) return show('Please enter a story title to search.', 'error')

    try {
      setLoadingStories(true)
      setStory(null)
      setComments([])
      const data = await api(`/api/admin/comments/stories?search=${encodeURIComponent(value)}&limit=20`)
      setStories(Array.isArray(data.stories) ? data.stories : [])
    } catch (error) {
      setStories([])
      show(error.message || 'Failed to search stories', 'error')
    } finally {
      setLoadingStories(false)
    }
  }

  async function openStory(item) {
    if (!item?.id) return

    try {
      setLoadingComments(true)
      setStory(item)
      setStories([])
      setComments([])
      setCommentSearch('')
      const data = await api(`/api/admin/comments/story/${item.id}?status=all&limit=200`)
      setStory(data.story || item)
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch (error) {
      setComments([])
      show(error.message || 'Failed to load story comments', 'error')
    } finally {
      setLoadingComments(false)
    }
  }

  async function action(comment, name) {
    if (!comment?.id || busyId) return
    if (name === 'delete' && !window.confirm('Move this comment to Trash? It can be recovered for 30 days.')) return

    try {
      setBusyId(comment.id)
      const data = name === 'delete'
        ? await api(`/api/admin/comments/${comment.id}`, { method: 'DELETE' })
        : await api(`/api/admin/comments/${comment.id}/moderate`, {
          method: 'PATCH',
          body: JSON.stringify({ action: name }),
        })

      show(data.message || 'Action completed')
      if (story) await openStory(story)
      await loadReports()
    } catch (error) {
      show(error.message || 'Action failed', 'error')
    } finally {
      setBusyId('')
    }
  }

  function openRestriction(comment) {
    if (!comment?.user_id) return show('This comment does not have an active reader account.', 'error')
    setRestrictComment(comment)
    setDuration('24h')
    setReason('Admin moderation')
  }

  async function submitRestriction() {
    if (!restrictComment?.id || busyId || reason.trim().length < 3) return

    try {
      setBusyId(restrictComment.id)
      const data = await api(`/api/admin/comments/${restrictComment.id}/ban-user`, {
        method: 'POST',
        body: JSON.stringify({ duration, reason: reason.trim() }),
      })

      show(data.message || `Reader restricted for ${duration}`)
      setRestrictComment(null)
      if (story) await openStory(story)
      await loadReports()
    } catch (error) {
      show(error.message || 'Failed to apply restriction', 'error')
    } finally {
      setBusyId('')
    }
  }

  return (
    <AdminLayout title="Comment Moderation" subtitle="Moderate story comments and temporary reader restrictions">
      <style>{styles}</style>

      <div className="cm-page">
        <div className="cm-head">
          <div>
            <h1 className="cm-title">Comment Moderation</h1>
            <p className="cm-desc">
              Search a story, review comments, hide or delete content, and apply temporary story-specific comment restrictions. Permanent restrictions are disabled.
            </p>
          </div>

          <div className="cm-actions">
            {story ? (
              <button
                type="button"
                className="cm-btn"
                onClick={() => {
                  setStory(null)
                  setComments([])
                  setCommentSearch('')
                  setMessage('')
                }}
              >
                Back to Search
              </button>
            ) : null}

            <button type="button" className="cm-btn" onClick={loadReports} disabled={loadingReports}>
              {loadingReports ? 'Loading...' : 'Refresh Report'}
            </button>
          </div>
        </div>

        {message ? <div className={`cm-msg ${messageType}`}>{message}</div> : null}

        {!story ? (
          <section className="cm-panel">
            <div className="cm-panel-head">
              <div>
                <h2 className="cm-panel-title">Search Story</h2>
                <p className="cm-note">Find the story whose comments need moderation.</p>
              </div>
            </div>

            <div className="cm-search-row">
              <input
                className="cm-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') searchStories()
                }}
                placeholder="Search story title..."
              />

              <button type="button" className="cm-btn primary" onClick={searchStories} disabled={loadingStories}>
                {loadingStories ? 'Searching...' : 'Search'}
              </button>
            </div>

            {loadingStories ? (
              <div className="cm-empty">Searching stories...</div>
            ) : stories.length ? (
              <div className="cm-story-grid">
                {stories.map((item) => (
                  <button key={item.id} type="button" className="cm-story" onClick={() => openStory(item)}>
                    <Cover story={item} />
                    <div>
                      <div className="cm-story-title">{item.title || 'Untitled Story'}</div>
                      <div className="cm-meta">{item.main_genre || 'Story'} · {item.status || 'Status'}</div>
                      <div className="cm-pills">
                        <span className="cm-pill">{Number(item.total_comments || 0).toLocaleString('en-US')} comments</span>
                        <span className="cm-pill">{Number(item.total_views || 0).toLocaleString('en-US')} views</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="cm-empty">Search a story to manage its comments.</div>
            )}
          </section>
        ) : (
          <section className="cm-panel">
            <div className="cm-selected">
              <Cover story={story} selected />
              <div>
                <h2>{story.title || 'Untitled Story'}</h2>
                <div className="cm-meta">{comments.length} comments · {visible} visible · {hidden} hidden</div>
              </div>
            </div>

            <div className="cm-toolbar">
              <input
                className="cm-input"
                value={commentSearch}
                onChange={(event) => setCommentSearch(event.target.value)}
                placeholder="Search comments in this story..."
              />

              <div className="cm-sort">
                <button type="button" className={`cm-sort-btn ${sort === 'new' ? 'active' : ''}`} onClick={() => setSort('new')}>
                  New
                </button>
                <button type="button" className={`cm-sort-btn ${sort === 'old' ? 'active' : ''}`} onClick={() => setSort('old')}>
                  Old
                </button>
                <button type="button" className={`cm-sort-btn ${sort === 'most' ? 'active' : ''}`} onClick={() => setSort('most')}>
                  Most Likes
                </button>
                <button type="button" className="cm-sort-btn" onClick={() => openStory(story)} disabled={loadingComments}>
                  Refresh
                </button>
              </div>
            </div>

            {loadingComments ? (
              <div className="cm-empty">Loading comments...</div>
            ) : filtered.length ? (
              <div className="cm-list">
                {filtered.map((comment) => (
                  <article className="cm-card" key={comment.id}>
                    <div className="cm-avatar">
                      {comment.user?.avatar_url ? (
                        <img src={comment.user.avatar_url} alt={readerName(comment)} />
                      ) : (
                        readerName(comment).charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="cm-body">
                      <div className="cm-top">
                        <div>
                          <div className="cm-user">{readerName(comment)}</div>
                          <div className="cm-date">@{comment.user?.username || 'reader'} · {formatDate(comment.created_at)}</div>
                        </div>

                        <span className={`cm-badge ${comment.is_hidden ? 'hidden' : 'visible'}`}>
                          {comment.is_hidden ? 'Hidden' : 'Visible'}
                        </span>
                      </div>

                      <div className="cm-text">{comment.text || '-'}</div>

                      <div className="cm-card-actions">
                        <button
                          type="button"
                          className="cm-small"
                          disabled={busyId === comment.id}
                          onClick={() => action(comment, comment.is_hidden ? 'unhide' : 'hide')}
                        >
                          {comment.is_hidden ? 'Unhide' : 'Hide'}
                        </button>

                        <button
                          type="button"
                          className="cm-small restrict"
                          disabled={busyId === comment.id}
                          onClick={() => openRestriction(comment)}
                        >
                          Restrict Reader
                        </button>

                        <button
                          type="button"
                          className="cm-small delete"
                          disabled={busyId === comment.id}
                          onClick={() => action(comment, 'delete')}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cm-empty">No comments found for this story.</div>
            )}
          </section>
        )}

        <section className="cm-panel">
          <div className="cm-panel-head">
            <div>
              <h2 className="cm-panel-title">Owner Report</h2>
              <p className="cm-note">Recent admin actions for comment moderation.</p>
            </div>
          </div>

          {loadingReports ? (
            <div className="cm-empty">Loading owner report...</div>
          ) : reports.length ? (
            <div className="cm-reports">
              {reports.map((record) => (
                <div className="cm-report" key={record.id}>
                  <div className="cm-report-title">{record.action || 'Action'}</div>
                  <div className="cm-report-details">{record.details || '-'}</div>
                  <div className="cm-report-meta">{record.actor || 'Admin'} · {formatDate(record.created_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cm-empty">No owner report yet.</div>
          )}
        </section>
      </div>

      {restrictComment ? (
        <div
          className="cm-layer"
          onMouseDown={() => {
            if (!busyId) setRestrictComment(null)
          }}
        >
          <section className="cm-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="cm-modal-head">
              <div>
                <h2 className="cm-modal-title">Temporary Comment Restriction</h2>
                <p className="cm-note">This applies only to the selected story. Permanent restriction is disabled.</p>
              </div>

              <button
                type="button"
                className="cm-close"
                onClick={() => setRestrictComment(null)}
                disabled={Boolean(busyId)}
              >
                ×
              </button>
            </div>

            <div className="cm-modal-body">
              <div className="cm-reader">
                Reader: {readerName(restrictComment)}
                {restrictComment.user?.username ? ` (@${restrictComment.user.username})` : ''}
              </div>

              <select
                className="cm-select"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                disabled={Boolean(busyId)}
              >
                {durations.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <textarea
                className="cm-textarea"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason for this temporary restriction..."
                maxLength={500}
                disabled={Boolean(busyId)}
              />
            </div>

            <div className="cm-modal-actions">
              <button
                type="button"
                className="cm-btn"
                onClick={() => setRestrictComment(null)}
                disabled={Boolean(busyId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cm-btn danger"
                onClick={submitRestriction}
                disabled={Boolean(busyId) || reason.trim().length < 3}
              >
                {busyId ? 'Applying...' : `Restrict ${duration}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AdminLayout>
  )
}
