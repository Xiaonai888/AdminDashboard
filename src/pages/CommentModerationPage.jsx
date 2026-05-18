import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function Icon({ d, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ minWidth: size, flexShrink: 0 }}
    >
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

function statusLabel(comment) {
  return comment?.is_hidden ? 'Hidden' : 'Visible'
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg:#F8FAFC;
    --card:#FFFFFF;
    --text:#0F172A;
    --muted:#64748B;
    --soft:#94A3B8;
    --border:#E2E8F0;
    --primary:#4F46E5;
    --primaryLight:#EEF2FF;
    --success:#16A34A;
    --successBg:#DCFCE7;
    --danger:#EF4444;
    --dangerBg:#FEE2E2;
    --warning:#F59E0B;
    --warningBg:#FEF3C7;
    --side:80px;
    --sideOpen:260px;
  }

  * {
    box-sizing:border-box;
  }

  body {
    margin:0;
    background:var(--bg);
    font-family:Inter, sans-serif;
    color:var(--text);
  }

  .comment-shell {
    height:100vh;
    min-height:100vh;
    display:flex;
    background:var(--bg);
    overflow:hidden;
  }

  .comment-sidebar {
    width:var(--side);
    background:#fff;
    border-right:1px solid var(--border);
    padding:20px 14px;
    overflow:auto;
    overflow-x:hidden;
    transition:.25s ease;
    flex-shrink:0;
  }

  .comment-sidebar:hover {
    width:var(--sideOpen);
    box-shadow:10px 0 30px rgba(15,23,42,.06);
  }

  .comment-sidebar::-webkit-scrollbar {
    width:0;
  }

  .comment-logo {
    height:40px;
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:28px;
    padding-left:10px;
    color:var(--primary);
  }

  .comment-logo-text {
    opacity:0;
    white-space:nowrap;
    color:var(--primary);
    font-weight:900;
    font-size:18px;
    transition:.2s;
  }

  .comment-sidebar:hover .comment-logo-text,
  .comment-sidebar:hover .comment-nav-text,
  .comment-sidebar:hover .comment-nav-label {
    opacity:1;
  }

  .comment-nav-label {
    opacity:0;
    display:block;
    margin:18px 0 8px 12px;
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:1px;
    color:var(--soft);
    white-space:nowrap;
    transition:.2s;
  }

  .comment-nav-item {
    height:44px;
    display:flex;
    align-items:center;
    border-radius:12px;
    padding:0 12px;
    color:var(--muted);
    cursor:pointer;
    margin-bottom:2px;
    font-weight:700;
    white-space:nowrap;
    transition:.18s ease;
  }

  .comment-nav-item:hover,
  .comment-nav-item.active {
    background:var(--primaryLight);
    color:var(--primary);
    transform:translateX(2px);
  }

  .comment-nav-text {
    opacity:0;
    margin-left:14px;
    transition:.2s;
  }

  .comment-main {
    flex:1;
    overflow:auto;
  }

  .comment-header {
    height:70px;
    background:#fff;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0 36px;
    position:sticky;
    top:0;
    z-index:10;
  }

  .comment-header h2 {
    margin:0;
    font-size:17px;
    font-weight:900;
  }

  .comment-content {
    padding:28px 36px 50px;
    max-width:1600px;
    margin:0 auto;
  }

  .comment-page-top {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:18px;
    margin-bottom:22px;
  }

  .comment-page-top h1 {
    margin:0;
    font-size:28px;
    font-weight:950;
    letter-spacing:-.04em;
  }

  .comment-page-top p {
    margin:7px 0 0;
    color:var(--muted);
    font-size:13.5px;
    font-weight:700;
    line-height:1.6;
  }

  .comment-refresh-btn {
    height:42px;
    padding:0 16px;
    border:none;
    border-radius:13px;
    background:var(--primary);
    color:white;
    font-weight:950;
    cursor:pointer;
    box-shadow:0 12px 24px rgba(79,70,229,.22);
  }

  .comment-refresh-btn:disabled {
    opacity:.6;
    cursor:not-allowed;
  }

  .comment-stats {
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:14px;
    margin-bottom:18px;
  }

  .comment-stat-card {
    background:#fff;
    border:1px solid var(--border);
    border-radius:20px;
    padding:17px 18px;
    box-shadow:0 6px 22px rgba(15,23,42,.04);
  }

  .comment-stat-label {
    color:var(--muted);
    font-size:11px;
    font-weight:950;
    text-transform:uppercase;
    letter-spacing:.07em;
  }

  .comment-stat-value {
    margin-top:8px;
    font-size:25px;
    font-weight:950;
  }

  .comment-panel {
    background:#fff;
    border:1px solid var(--border);
    border-radius:24px;
    box-shadow:0 8px 28px rgba(15,23,42,.05);
    overflow:hidden;
    margin-bottom:22px;
  }

  .comment-panel-head {
    padding:18px 20px;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
  }

  .comment-panel-head h3 {
    margin:0;
    font-size:16px;
    font-weight:950;
  }

  .comment-panel-head p {
    margin:4px 0 0;
    color:var(--muted);
    font-size:12.5px;
    font-weight:700;
  }

  .comment-toolbar {
    padding:16px 20px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    border-bottom:1px solid var(--border);
    background:#fff;
  }

  .comment-search {
    position:relative;
    width:min(520px, 100%);
  }

  .comment-search span {
    position:absolute;
    left:13px;
    top:50%;
    transform:translateY(-50%);
    color:var(--soft);
    font-size:14px;
  }

  .comment-search input {
    width:100%;
    height:42px;
    border:1px solid var(--border);
    border-radius:13px;
    padding:0 14px 0 38px;
    outline:none;
    font-weight:750;
    color:var(--text);
  }

  .comment-filter-row {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
  }

  .comment-filter-btn {
    height:34px;
    border-radius:999px;
    padding:0 12px;
    border:1px solid var(--border);
    background:#fff;
    color:var(--muted);
    font-size:12px;
    font-weight:950;
    cursor:pointer;
  }

  .comment-filter-btn.active,
  .comment-filter-btn:hover {
    background:var(--primary);
    color:#fff;
    border-color:var(--primary);
  }

  .comment-table-wrap {
    overflow:auto;
  }

  .comment-table {
    width:100%;
    border-collapse:collapse;
    font-size:13.5px;
  }

  .comment-table th {
    text-align:left;
    padding:13px 14px;
    background:#F8FAFC;
    color:#64748B;
    font-size:11.5px;
    text-transform:uppercase;
    letter-spacing:.06em;
    font-weight:950;
    white-space:nowrap;
  }

  .comment-table td {
    padding:15px 14px;
    border-top:1px solid #F1F5F9;
    vertical-align:top;
  }

  .comment-text {
    max-width:480px;
    font-weight:700;
    line-height:1.55;
    color:#334155;
  }

  .comment-story {
    font-weight:950;
    color:var(--text);
  }

  .comment-muted {
    margin-top:3px;
    color:var(--muted);
    font-weight:700;
    font-size:12px;
  }

  .comment-user {
    font-weight:950;
    color:var(--text);
  }

  .comment-badge {
    display:inline-flex;
    align-items:center;
    height:26px;
    border-radius:999px;
    padding:0 10px;
    font-size:11.5px;
    font-weight:950;
  }

  .comment-badge.visible {
    background:var(--successBg);
    color:var(--success);
  }

  .comment-badge.hidden {
    background:var(--warningBg);
    color:#B45309;
  }

  .comment-actions {
    display:flex;
    justify-content:flex-end;
    gap:8px;
    flex-wrap:wrap;
  }

  .comment-small-btn {
    height:34px;
    border-radius:10px;
    padding:0 11px;
    font-size:12px;
    font-weight:950;
    cursor:pointer;
    transition:.16s ease;
  }

  .comment-small-btn.hide {
    background:#fff;
    border:1px solid #FCD34D;
    color:#B45309;
  }

  .comment-small-btn.unhide {
    background:#fff;
    border:1px solid #86EFAC;
    color:#15803D;
  }

  .comment-small-btn.ban {
    background:#fff;
    border:1px solid #FCA5A5;
    color:#DC2626;
  }

  .comment-small-btn.delete {
    background:var(--dangerBg);
    border:1px solid #FCA5A5;
    color:#DC2626;
  }

  .comment-small-btn:disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .comment-empty {
    padding:34px;
    text-align:center;
    color:var(--muted);
    font-weight:850;
  }

  .comment-record-list {
    display:grid;
    gap:10px;
    padding:18px 20px 20px;
  }

  .comment-record-item {
    display:flex;
    gap:12px;
    align-items:flex-start;
    padding:13px;
    border:1px solid #F1F5F9;
    border-radius:14px;
    background:#fff;
  }

  .comment-record-icon {
    width:34px;
    height:34px;
    border-radius:12px;
    background:#EEF2FF;
    color:var(--primary);
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:950;
    flex-shrink:0;
  }

  .comment-record-title {
    font-weight:950;
    color:var(--text);
    font-size:13px;
  }

  .comment-record-sub {
    margin-top:3px;
    color:var(--muted);
    font-weight:650;
    font-size:12px;
    line-height:1.5;
  }

  .comment-message {
    padding:12px 14px;
    border-radius:14px;
    margin-bottom:16px;
    font-size:13px;
    font-weight:850;
  }

  .comment-message.success {
    background:var(--successBg);
    color:var(--success);
  }

  .comment-message.error {
    background:var(--dangerBg);
    color:var(--danger);
  }

  @media (max-width:1180px) {
    .comment-stats {
      grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .comment-toolbar {
      flex-direction:column;
      align-items:stretch;
    }
  }

  @media (max-width:760px) {
    .comment-header {
      padding:0 18px;
    }

    .comment-content {
      padding:22px 18px 40px;
    }

    .comment-page-top {
      flex-direction:column;
      align-items:stretch;
    }

    .comment-stats {
      grid-template-columns:1fr;
    }
  }
`

export default function CommentModerationPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [comments, setComments] = useState([])
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(true)
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

  const stats = useMemo(() => {
    const total = comments.length
    const visible = comments.filter((comment) => !comment.is_hidden).length
    const hidden = comments.filter((comment) => comment.is_hidden).length
    const users = new Set(comments.map((comment) => comment.user_id).filter(Boolean)).size

    return [
      { label: 'Total Comments', value: total },
      { label: 'Visible', value: visible },
      { label: 'Hidden', value: hidden },
      { label: 'Users', value: users },
    ]
  }, [comments])

  const loadComments = async () => {
    setLoading(true)
    setMessage('')

    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status,
        limit: '80',
      })

      const response = await fetch(`${API_URL}/api/admin/comments?${params.toString()}`, {
        headers: requestHeaders,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load comments')
      }

      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch (error) {
      setComments([])
      setMessage(error.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const loadRecords = async () => {
    setRecordsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/comments/records?limit=30`, {
        headers: requestHeaders,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load owner report')
      }

      setRecords(Array.isArray(data.records) ? data.records : [])
    } catch {
      setRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  const reloadAll = async () => {
    await Promise.all([loadComments(), loadRecords()])
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComments()
    }, 260)

    return () => clearTimeout(timer)
  }, [searchQuery, status])

  useEffect(() => {
    loadRecords()
  }, [])

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

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Action failed')
      }

      setMessage(data.message || 'Action completed')
      await reloadAll()
    } catch (error) {
      setMessage(error.message || 'Action failed')
    } finally {
      setBusyId('')
    }
  }

  const renderGroup = (items) =>
    items.map((item) => (
      <div
        key={item.path}
        className={`comment-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        onClick={() => navigate(item.path)}
      >
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
          <button type="button" className="comment-refresh-btn" onClick={reloadAll} disabled={loading}>
            Refresh
          </button>
        </header>

        <section className="comment-content">
          <div className="comment-page-top">
            <div>
              <h1>Comment Moderation</h1>
              <p>Search, hide, unhide, delete, and ban users from story comments.</p>
            </div>
          </div>

          {message ? (
            <div className={`comment-message ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('required') ? 'error' : 'success'}`}>
              {message}
            </div>
          ) : null}

          <div className="comment-stats">
            {stats.map((item) => (
              <div className="comment-stat-card" key={item.label}>
                <div className="comment-stat-label">{item.label}</div>
                <div className="comment-stat-value">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="comment-panel">
            <div className="comment-panel-head">
              <div>
                <h3>Comments</h3>
                <p>Manage reader comments across all stories.</p>
              </div>
            </div>

            <div className="comment-toolbar">
              <div className="comment-search">
                <span>⌕</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search comment, story title, username..."
                />
              </div>

              <div className="comment-filter-row">
                {['all', 'visible', 'hidden'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`comment-filter-btn ${status === item ? 'active' : ''}`}
                    onClick={() => setStatus(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="comment-table-wrap">
              <table className="comment-table">
                <thead>
                  <tr>
                    <th>Comment</th>
                    <th>User</th>
                    <th>Story</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6">
                        <div className="comment-empty">Loading comments...</div>
                      </td>
                    </tr>
                  ) : comments.length ? (
                    comments.map((comment) => (
                      <tr key={comment.id}>
                        <td>
                          <div className="comment-text">{comment.text || '-'}</div>
                          {comment.is_spoiler ? <div className="comment-muted">Spoiler marked</div> : null}
                        </td>

                        <td>
                          <div className="comment-user">{comment.user?.name || 'Reader'}</div>
                          <div className="comment-muted">@{comment.user?.username || 'reader'}</div>
                        </td>

                        <td>
                          <div className="comment-story">{comment.story?.title || 'Unknown Story'}</div>
                          <div className="comment-muted">{comment.story_id}</div>
                        </td>

                        <td>
                          <span className={`comment-badge ${comment.is_hidden ? 'hidden' : 'visible'}`}>
                            {statusLabel(comment)}
                          </span>
                        </td>

                        <td>
                          <div className="comment-muted">{formatDate(comment.created_at)}</div>
                        </td>

                        <td>
                          <div className="comment-actions">
                            {comment.is_hidden ? (
                              <button
                                type="button"
                                className="comment-small-btn unhide"
                                disabled={busyId === comment.id}
                                onClick={() => runAction(comment, 'unhide')}
                              >
                                Unhide
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="comment-small-btn hide"
                                disabled={busyId === comment.id}
                                onClick={() => runAction(comment, 'hide')}
                              >
                                Hide
                              </button>
                            )}

                            <button
                              type="button"
                              className="comment-small-btn ban"
                              disabled={busyId === comment.id}
                              onClick={() => runAction(comment, 'ban')}
                            >
                              Ban
                            </button>

                            <button
                              type="button"
                              className="comment-small-btn delete"
                              disabled={busyId === comment.id}
                              onClick={() => runAction(comment, 'delete')}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="comment-empty">No comments found.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
