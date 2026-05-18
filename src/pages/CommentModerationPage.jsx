import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: size, flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function isErrorMessage(value) {
  const text = String(value || '').toLowerCase()
  return text.includes('failed') || text.includes('required') || text.includes('not found') || text.includes('invalid') || text.includes('error')
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F8FAFC;--card:#fff;--text:#0F172A;--muted:#64748B;--soft:#94A3B8;--border:#E2E8F0;--primary:#4F46E5;--primaryLight:#EEF2FF;--success:#16A34A;--successBg:#DCFCE7;--danger:#EF4444;--dangerBg:#FEE2E2;--warning:#F59E0B;--warningBg:#FEF3C7;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);font-family:Inter,sans-serif;color:var(--text)}
  .comment-shell{height:100vh;min-height:100vh;display:flex;background:var(--bg);overflow:hidden}
  .comment-sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s ease;flex-shrink:0}
  .comment-sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.06)}.comment-sidebar::-webkit-scrollbar{width:0}
  .comment-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px;color:var(--primary)}
  .comment-logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px;transition:.2s}
  .comment-sidebar:hover .comment-logo-text,.comment-sidebar:hover .comment-nav-text,.comment-sidebar:hover .comment-nav-label{opacity:1}
  .comment-nav-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--soft);white-space:nowrap;transition:.2s}
  .comment-nav-item{height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:700;white-space:nowrap;transition:.18s ease}
  .comment-nav-item:hover,.comment-nav-item.active{background:var(--primaryLight);color:var(--primary)}
  .comment-nav-text{opacity:0;margin-left:14px;transition:.2s}.comment-main{flex:1;overflow:auto}
  .comment-header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 36px;position:sticky;top:0;z-index:10}
  .comment-header h2{margin:0;font-size:17px;font-weight:900}.comment-content{padding:28px 36px 50px;max-width:1300px;margin:0 auto}
  .comment-page-top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:22px}.comment-page-top h1{margin:0;font-size:28px;font-weight:950;letter-spacing:-.04em}
  .comment-page-top p{margin:7px 0 0;color:var(--muted);font-size:13.5px;font-weight:700;line-height:1.6}
  .comment-back-btn,.comment-search-btn{height:42px;padding:0 16px;border:none;border-radius:13px;background:var(--primary);color:white;font-weight:950;cursor:pointer;box-shadow:0 12px 24px rgba(79,70,229,.22)}
  .comment-back-btn{background:#fff;color:var(--text);border:1px solid var(--border);box-shadow:none}.comment-search-btn:disabled{opacity:.6;cursor:not-allowed}
  .comment-panel{background:#fff;border:1px solid var(--border);border-radius:24px;box-shadow:0 8px 28px rgba(15,23,42,.05);overflow:visible;margin-bottom:22px}
  .comment-panel-head{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:14px}
  .comment-panel-head h3{margin:0;font-size:16px;font-weight:950}.comment-panel-head p{margin:4px 0 0;color:var(--muted);font-size:12.5px;font-weight:700}
  .comment-search-wrap{padding:20px}.comment-search-row{display:flex;gap:10px;max-width:760px}
  .comment-search{position:relative;flex:1}.comment-search span{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--soft);font-size:14px}
  .comment-search input{width:100%;height:46px;border:1px solid var(--border);border-radius:14px;padding:0 14px 0 38px;outline:none;font-weight:750;color:var(--text)}
  .comment-message{padding:12px 14px;border-radius:14px;margin-bottom:16px;font-size:13px;font-weight:850}.comment-message.success{background:var(--successBg);color:var(--success)}.comment-message.error{background:var(--dangerBg);color:var(--danger)}
  .story-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 20px 20px}.story-card{display:flex;gap:14px;padding:12px;border:1px solid var(--border);border-radius:18px;background:#fff;cursor:pointer;text-align:left;transition:.16s ease;width:100%}
  .story-card:hover{transform:translateY(-2px);border-color:#C7D2FE;box-shadow:0 10px 24px rgba(79,70,229,.08)}
  .story-cover{width:70px;aspect-ratio:2/3;border-radius:14px;overflow:hidden;background:#EEF2FF;flex-shrink:0}.story-cover img{width:100%;height:100%;object-fit:cover}
  .story-cover-empty{height:100%;display:flex;align-items:center;justify-content:center;color:var(--primary)}
  .story-title{font-size:15px;font-weight:950;color:var(--text);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .story-meta{margin-top:5px;color:var(--muted);font-size:12px;font-weight:750}.story-pill-row{margin-top:10px;display:flex;gap:7px;flex-wrap:wrap}
  .story-pill{height:26px;display:inline-flex;align-items:center;border-radius:999px;padding:0 10px;background:#F8FAFC;border:1px solid var(--border);font-size:11.5px;font-weight:900;color:var(--muted)}
  .selected-story{display:flex;gap:16px;align-items:center;padding:18px 20px;border-bottom:1px solid var(--border);background:#fff;border-radius:24px 24px 0 0}
  .selected-story-cover{width:74px;aspect-ratio:2/3;border-radius:16px;overflow:hidden;background:#EEF2FF;flex-shrink:0}.selected-story-cover img{width:100%;height:100%;object-fit:cover}
  .selected-story h3{margin:0;font-size:22px;font-weight:950;line-height:1.25}.selected-story p{margin:6px 0 0;color:var(--muted);font-size:12.5px;font-weight:800}
  .comment-control-bar{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff}
  .comment-control-search{position:relative;width:min(420px,100%)}.comment-control-search span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--soft)}
  .comment-control-search input{width:100%;height:40px;border:1px solid var(--border);border-radius:12px;padding:0 12px 0 34px;outline:none;font-weight:750;color:var(--text)}
  .sort-row{display:flex;gap:8px;flex-wrap:wrap}.sort-btn{height:34px;border:1px solid var(--border);background:#fff;border-radius:999px;padding:0 13px;color:var(--muted);font-size:12px;font-weight:950;cursor:pointer}.sort-btn.active,.sort-btn:hover{background:var(--primary);border-color:var(--primary);color:#fff}
  .comment-list{padding:18px 20px;display:grid;gap:12px;overflow:visible}.comment-card{display:flex;gap:12px;padding:14px;border:1px solid #F1F5F9;border-radius:18px;background:#fff;position:relative;overflow:visible}
  .comment-avatar{width:42px;height:42px;border-radius:50%;overflow:hidden;background:#111827;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:950;flex-shrink:0}.comment-avatar img{width:100%;height:100%;object-fit:cover}
  .comment-body{min-width:0;flex:1}.comment-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.comment-user{font-size:13.5px;font-weight:950;color:var(--text)}.comment-date{margin-top:2px;color:var(--muted);font-size:11.5px;font-weight:750}
  .comment-text{margin-top:9px;color:#334155;font-size:13.5px;font-weight:700;line-height:1.6;white-space:pre-wrap;word-break:break-word}
  .comment-badge{display:inline-flex;align-items:center;height:24px;border-radius:999px;padding:0 9px;font-size:11px;font-weight:950}.comment-badge.visible{background:var(--successBg);color:var(--success)}.comment-badge.hidden{background:var(--warningBg);color:#B45309}
  .dot-btn{width:34px;height:34px;border-radius:50%;border:none;background:#F8FAFC;color:var(--muted);cursor:pointer;font-weight:950}
  .dot-menu{position:absolute;right:12px;top:54px;width:190px;border:1px solid var(--border);background:#fff;border-radius:14px;box-shadow:0 22px 45px rgba(15,23,42,.18);overflow:hidden;z-index:50}
  .dot-menu button{width:100%;height:44px;border:none;background:#fff;text-align:left;padding:0 14px;font-weight:900;color:var(--text);cursor:pointer}.dot-menu button:hover{background:#F8FAFC}.dot-menu button.danger{color:var(--danger)}
  .comment-empty{padding:36px;text-align:center;color:var(--muted);font-weight:850}
  .comment-record-list{display:grid;gap:10px;padding:18px 20px 20px}.comment-record-item{display:flex;gap:12px;align-items:flex-start;padding:13px;border:1px solid #F1F5F9;border-radius:14px;background:#fff}
  .comment-record-icon{width:34px;height:34px;border-radius:12px;background:#EEF2FF;color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:950;flex-shrink:0}
  .comment-record-title{font-weight:950;color:var(--text);font-size:13px}.comment-record-sub{margin-top:3px;color:var(--muted);font-weight:650;font-size:12px;line-height:1.5}
  @media(max-width:900px){.story-grid{grid-template-columns:1fr}.comment-search-row,.comment-control-bar{flex-direction:column;align-items:stretch}.comment-content{padding:22px 18px 40px}.comment-header{padding:0 18px}.selected-story{align-items:flex-start}.selected-story h3{font-size:18px}.comment-control-search{width:100%}}
`

export default function CommentModerationPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [searchInput, setSearchInput] = useState('')
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [comments, setComments] = useState([])
  const [records, setRecords] = useState([])
  const [commentSearch, setCommentSearch] = useState('')
  const [sortMode, setSortMode] = useState('new')
  const [loadingStories, setLoadingStories] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [openMenuId, setOpenMenuId] = useState('')
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')

  const navItems = {
    overview: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
      { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    ],
    visualMedia: [
      { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
      { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
      { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
      { path: '/comments', label: 'Comments', icon: 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' },
      { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
      { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    ],
    systemAdmin: [
      { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
      { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
      { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
    ],
    finance: [
      { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
      { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
      { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
    ],
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
    'X-Admin-Name': 'Admin',
  }

  const filteredComments = useMemo(() => {
    const keyword = commentSearch.trim().toLowerCase()

    let list = [...comments]

    if (keyword) {
      list = list.filter((comment) => {
        const values = [
          comment.text,
          comment.user?.name,
          comment.user?.username,
        ]

        return values.some((value) => String(value || '').toLowerCase().includes(keyword))
      })
    }

    if (sortMode === 'old') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortMode === 'most') {
      list.sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return list
  }, [comments, commentSearch, sortMode])

  const totalVisible = useMemo(() => comments.filter((comment) => !comment.is_hidden).length, [comments])
  const totalHidden = useMemo(() => comments.filter((comment) => comment.is_hidden).length, [comments])

  const loadRecords = async () => {
    setRecordsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/comments/records?limit=30`, {
        headers: requestHeaders,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load owner report')

      setRecords(Array.isArray(data.records) ? data.records : [])
    } catch {
      setRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const searchStories = async () => {
    const value = searchInput.trim()

    setMessage('')
    setSelectedStory(null)
    setComments([])
    setCommentSearch('')
    setOpenMenuId('')

    if (!value) {
      setStories([])
      setMessage('Please enter a story title to search.')
      return
    }

    setLoadingStories(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/comments/stories?search=${encodeURIComponent(value)}&limit=20`, {
        headers: requestHeaders,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to search stories')

      setStories(Array.isArray(data.stories) ? data.stories : [])
    } catch (error) {
      setStories([])
      setMessage(error.message || 'Failed to search stories')
    } finally {
      setLoadingStories(false)
    }
  }

  const openStoryComments = async (story) => {
    if (!story?.id) return

    setSelectedStory(story)
    setStories([])
    setComments([])
    setCommentSearch('')
    setOpenMenuId('')
    setMessage('')
    setLoadingComments(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/comments/story/${story.id}?status=all&limit=200`, {
        headers: requestHeaders,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load story comments')

      setSelectedStory(data.story || story)
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch (error) {
      setComments([])
      setMessage(error.message || 'Failed to load story comments')
    } finally {
      setLoadingComments(false)
    }
  }

  const runAction = async (comment, action) => {
    if (!comment?.id || busyId) return

    const confirmText =
      action === 'delete'
        ? 'Delete this comment? This cannot be undone.'
        : action === 'ban'
          ? 'Ban this user from commenting on this story?'
          : ''

    if (confirmText && !window.confirm(confirmText)) return

    setBusyId(comment.id)
    setOpenMenuId('')
    setMessage('')

    try {
      let response

      if (action === 'delete') {
        response = await fetch(`${API_URL}/api/admin/comments/${comment.id}`, {
          method: 'DELETE',
          headers: requestHeaders,
        })
      } else if (action === 'ban') {
        response = await fetch(`${API_URL}/api/admin/comments/${comment.id}/ban-user`, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({ reason: 'Admin moderation' }),
        })
      } else {
        response = await fetch(`${API_URL}/api/admin/comments/${comment.id}/moderate`, {
          method: 'PATCH',
          headers: requestHeaders,
          body: JSON.stringify({ action }),
        })
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) throw new Error(data.message || 'Action failed')

      setMessage(data.message || 'Action completed')
      if (selectedStory) await openStoryComments(selectedStory)
      await loadRecords()
    } catch (error) {
      setMessage(error.message || 'Action failed')
    } finally {
      setBusyId('')
    }
  }

  const goBackToSearch = () => {
    setSelectedStory(null)
    setComments([])
    setCommentSearch('')
    setOpenMenuId('')
    setMessage('')
  }

  const renderGroup = (items) =>
    items.map((item) => (
      <div key={item.path} className={`comment-nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
        <Icon d={item.icon} size={20} />
        <span className="comment-nav-text">{item.label}</span>
      </div>
    ))

  return (
    <div className="comment-shell">
      <style>{styles}</style>

      <aside className="comment-sidebar">
        <div className="comment-logo">
          <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <span className="comment-logo-text">Shadow Exclusive</span>
        </div>

        <span className="comment-nav-label">Overview</span>
        {renderGroup(navItems.overview)}

        <span className="comment-nav-label">Visual Media</span>
        {renderGroup(navItems.visualMedia)}

        <span className="comment-nav-label">System Admin</span>
        {renderGroup(navItems.systemAdmin)}

        <span className="comment-nav-label">Finance & Growth</span>
        {renderGroup(navItems.finance)}
      </aside>

      <main className="comment-main">
        <header className="comment-header">
          <h2>Comment Moderation</h2>
          {selectedStory ? (
            <button type="button" className="comment-back-btn" onClick={goBackToSearch}>
              Back to Search
            </button>
          ) : null}
        </header>

        <section className="comment-content">
          <div className="comment-page-top">
            <div>
              <h1>Comment Moderation</h1>
              <p>Search a story, open its comments, then use the 3-dot menu to hide, ban, or delete.</p>
            </div>
          </div>

          {message ? <div className={`comment-message ${isErrorMessage(message) ? 'error' : 'success'}`}>{message}</div> : null}

          {!selectedStory ? (
            <div className="comment-panel">
              <div className="comment-panel-head">
                <div>
                  <h3>Search Story</h3>
                  <p>Find the story you want to moderate.</p>
                </div>
              </div>

              <div className="comment-search-wrap">
                <div className="comment-search-row">
                  <div className="comment-search">
                    <span>⌕</span>
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') searchStories()
                      }}
                      placeholder="Search story title..."
                    />
                  </div>

                  <button type="button" className="comment-search-btn" onClick={searchStories} disabled={loadingStories}>
                    {loadingStories ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {loadingStories ? (
                <div className="comment-empty">Searching stories...</div>
              ) : stories.length ? (
                <div className="story-grid">
                  {stories.map((story) => (
                    <button key={story.id} type="button" className="story-card" onClick={() => openStoryComments(story)}>
                      <div className="story-cover">
                        {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : <div className="story-cover-empty"><Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></div>}
                      </div>

                      <div>
                        <div className="story-title">{story.title || 'Untitled Story'}</div>
                        <div className="story-meta">{story.main_genre || 'Story'} • {story.status || 'Status'}</div>
                        <div className="story-pill-row">
                          <span className="story-pill">{story.total_comments || 0} comments</span>
                          <span className="story-pill">{story.total_views || 0} views</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="comment-empty">Search a story to manage its comments.</div>
              )}
            </div>
          ) : (
            <div className="comment-panel">
              <div className="selected-story">
                <div className="selected-story-cover">
                  {selectedStory.cover_url ? <img src={selectedStory.cover_url} alt={selectedStory.title} /> : <div className="story-cover-empty"><Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" /></div>}
                </div>

                <div>
                  <h3>{selectedStory.title || 'Untitled Story'}</h3>
                  <p>{selectedStory.main_genre || 'Story'} • {comments.length} comments • {totalVisible} visible • {totalHidden} hidden</p>
                </div>
              </div>

              <div className="comment-control-bar">
                <div className="comment-control-search">
                  <span>⌕</span>
                  <input
                    value={commentSearch}
                    onChange={(event) => setCommentSearch(event.target.value)}
                    placeholder="Search comment in this story..."
                  />
                </div>

                <div className="sort-row">
                  <button type="button" className={`sort-btn ${sortMode === 'new' ? 'active' : ''}`} onClick={() => setSortMode('new')}>
                    New
                  </button>
                  <button type="button" className={`sort-btn ${sortMode === 'old' ? 'active' : ''}`} onClick={() => setSortMode('old')}>
                    Old
                  </button>
                  <button type="button" className={`sort-btn ${sortMode === 'most' ? 'active' : ''}`} onClick={() => setSortMode('most')}>
                    Most
                  </button>
                </div>
              </div>

              <div className="comment-list">
                {loadingComments ? (
                  <div className="comment-empty">Loading comments...</div>
                ) : filteredComments.length ? (
                  filteredComments.map((comment) => (
                    <div className="comment-card" key={comment.id}>
                      <div className="comment-avatar">
                        {comment.user?.avatar_url ? <img src={comment.user.avatar_url} alt={comment.user?.name || 'Reader'} /> : (comment.user?.name || 'R').charAt(0).toUpperCase()}
                      </div>

                      <div className="comment-body">
                        <div className="comment-top">
                          <div>
                            <div className="comment-user">{comment.user?.name || 'Reader'}</div>
                            <div className="comment-date">@{comment.user?.username || 'reader'} • {formatDate(comment.created_at)}</div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`comment-badge ${comment.is_hidden ? 'hidden' : 'visible'}`}>
                              {comment.is_hidden ? 'Hidden' : 'Visible'}
                            </span>

                            <button type="button" className="dot-btn" onClick={() => setOpenMenuId(openMenuId === comment.id ? '' : comment.id)}>
                              ⋯
                            </button>
                          </div>
                        </div>

                        <div className="comment-text">{comment.text || '-'}</div>

                        {openMenuId === comment.id ? (
                          <div className="dot-menu">
                            {comment.is_hidden ? (
                              <button type="button" disabled={busyId === comment.id} onClick={() => runAction(comment, 'unhide')}>Unhide Comment</button>
                            ) : (
                              <button type="button" disabled={busyId === comment.id} onClick={() => runAction(comment, 'hide')}>Hide Comment</button>
                            )}
                            <button type="button" className="danger" disabled={busyId === comment.id} onClick={() => runAction(comment, 'ban')}>Ban User</button>
                            <button type="button" className="danger" disabled={busyId === comment.id} onClick={() => runAction(comment, 'delete')}>Delete Comment</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="comment-empty">No comments found for this story.</div>
                )}
              </div>
            </div>
          )}

          <div className="comment-panel">
            <div className="comment-panel-head">
              <div>
                <h3>Owner Report</h3>
                <p>Recent admin actions for comment moderation.</p>
              </div>
            </div>

            <div className="comment-record-list">
              {recordsLoading ? (
                <div className="comment-empty">Loading owner report...</div>
              ) : records.length ? (
                records.map((record) => (
                  <div className="comment-record-item" key={record.id}>
                    <div className="comment-record-icon">•</div>
                    <div>
                      <div className="comment-record-title">{record.action || 'Action'}</div>
                      <div className="comment-record-sub">{record.details || '-'}</div>
                      <div className="comment-record-sub">{record.actor || 'Admin'} • {formatDate(record.created_at)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="comment-empty">No owner report yet.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
