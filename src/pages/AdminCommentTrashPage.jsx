import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  const date = new Date(value || '')
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function daysLeft(value) {
  const date = new Date(value || '')
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000))
}

function typeLabel(item) {
  if (item.content_type === 'author_post') return 'Author Post'
  if (item.content_type === 'episode') return 'Episode'
  return 'Story'
}

function contextTitle(item) {
  if (item.content_type === 'author_post') {
    return item.context?.post_excerpt || 'Author Page post'
  }

  return item.context?.title || 'Untitled Story'
}

const styles = `
  *{box-sizing:border-box}
  body{margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a}
  .act-page{min-height:100vh;background:#f8fafc}
  .act-header{position:sticky;top:0;z-index:20;height:70px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center}
  .act-header-inner{width:min(1280px,100%);margin:auto;padding:0 28px;display:flex;align-items:center;justify-content:space-between;gap:14px}
  .act-btn{height:40px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:0 14px;font-weight:800;cursor:pointer}
  .act-btn.primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
  .act-btn:disabled{opacity:.55;cursor:not-allowed}
  .act-title{font-size:18px;font-weight:900}
  .act-main{width:min(1280px,100%);margin:auto;padding:28px}
  .act-hero{display:flex;justify-content:space-between;gap:20px;background:linear-gradient(135deg,#111827,#312e81);color:#fff;border-radius:24px;padding:24px;box-shadow:0 18px 45px rgba(15,23,42,.14)}
  .act-hero h1{margin:0;font-size:28px;font-weight:900}
  .act-hero p{margin:8px 0 0;max-width:720px;color:#ffffffb3;font-size:13px;line-height:1.7;font-weight:600}
  .act-limit{min-width:180px;border:1px solid #ffffff24;background:#ffffff12;border-radius:18px;padding:15px}
  .act-limit small{display:block;color:#ffffff99;font-weight:800;text-transform:uppercase}
  .act-limit strong{display:block;margin-top:7px;font-size:22px}
  .act-tools{margin-top:18px;background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:15px;display:flex;justify-content:space-between;gap:12px;box-shadow:0 8px 24px rgba(15,23,42,.04)}
  .act-search{flex:1;max-width:520px}
  .act-search input{width:100%;height:42px;border:1px solid #e2e8f0;border-radius:13px;padding:0 14px;outline:none;font-weight:700}
  .act-filters{display:flex;gap:8px;flex-wrap:wrap}
  .act-filter{height:38px;border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:0 14px;color:#64748b;font-weight:800;cursor:pointer}
  .act-filter.active{background:#4f46e5;border-color:#4f46e5;color:#fff}
  .act-message{margin-top:16px;border-radius:14px;padding:12px 14px;font-size:13px;font-weight:800;background:#fff;border:1px solid #e2e8f0}
  .act-summary{margin:22px 0 12px;display:flex;justify-content:space-between;align-items:center}
  .act-summary h2{margin:0;font-size:17px}
  .act-count{background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:6px 11px;color:#64748b;font-size:12px;font-weight:900}
  .act-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .act-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:16px;box-shadow:0 8px 24px rgba(15,23,42,.035)}
  .act-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .act-tags{display:flex;gap:7px;flex-wrap:wrap}
  .act-tag{border-radius:999px;padding:6px 10px;background:#eef2ff;color:#4338ca;font-size:10px;font-weight:900}
  .act-tag.reply{background:#f1f5f9;color:#64748b}
  .act-days{border-radius:999px;padding:6px 10px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:900;white-space:nowrap}
  .act-context{margin-top:10px;font-size:13px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .act-text{margin-top:10px;min-height:66px;background:#f8fafc;border-radius:14px;padding:12px;font-size:13px;line-height:1.6;color:#334155;white-space:pre-wrap;word-break:break-word}
  .act-meta{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:9px}
  .act-meta div{font-size:10.5px;color:#94a3b8;font-weight:700}
  .act-meta strong{display:block;margin-top:3px;color:#475569;font-size:11.5px}
  .act-reason{margin-top:10px;background:#fff7ed;border:1px solid #ffedd5;border-radius:12px;padding:9px;color:#9a3412;font-size:11.5px;font-weight:750}
  .act-footer{margin-top:14px;display:flex;justify-content:space-between;align-items:center}
  .act-source{font-size:11px;color:#94a3b8;font-weight:700}
  .act-recover{height:38px;border:0;border-radius:12px;background:#111827;color:#fff;padding:0 15px;font-size:12px;font-weight:900;cursor:pointer}
  .act-recover:disabled{background:#cbd5e1;cursor:not-allowed}
  .act-empty{margin-top:18px;background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:46px 24px;text-align:center;color:#64748b;font-weight:800}
  @media(max-width:900px){.act-main{padding:20px 16px}.act-header-inner{padding:0 16px}.act-hero,.act-tools{flex-direction:column}.act-limit{min-width:0}.act-search{max-width:none}.act-grid{grid-template-columns:1fr}}
`

export default function AdminCommentTrashPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  async function loadTrash() {
    const token = getAdminToken()

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/comment-trash/admin?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load comment trash')
      }

      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (error) {
      setItems([])
      setMessage(error.message === 'Failed to fetch' ? 'Cannot connect to backend.' : error.message || 'Failed to load comment trash')
    } finally {
      setLoading(false)
    }
  }

  async function recoverComment(item) {
    const token = getAdminToken()

    if (!token) {
      navigate('/login')
      return
    }

    const key = `${item.source}:${item.comment_id}`

    try {
      setBusyId(key)
      setMessage('')

      const response = await fetch(
        `${API_URL}/api/comment-trash/admin/${encodeURIComponent(item.source)}/${encodeURIComponent(item.comment_id)}/recover`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to recover comment')
      }

      setItems((current) =>
        current.filter((record) =>
          !(record.source === item.source && String(record.comment_id) === String(item.comment_id))
        )
      )
      setMessage('Comment recovered successfully.')
    } catch (error) {
      setMessage(error.message || 'Failed to recover comment')
    } finally {
      setBusyId('')
    }
  }

  useEffect(() => {
    loadTrash()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items.filter((item) => {
      if (filter !== 'all' && item.content_type !== filter) return false
      if (!query) return true

      return [
        item.text,
        item.user?.name,
        item.user?.username,
        contextTitle(item),
        item.delete_reason,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    })
  }, [items, search, filter])

  return (
    <div className="act-page">
      <style>{styles}</style>

      <header className="act-header">
        <div className="act-header-inner">
          <button className="act-btn" type="button" onClick={() => navigate('/comments')}>
            ← Comments
          </button>
          <div className="act-title">Comment Trash</div>
          <button className="act-btn primary" type="button" onClick={loadTrash} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="act-main">
        <section className="act-hero">
          <div>
            <h1>Deleted Comments</h1>
            <p>
              Deleted comments remain recoverable for 30 days. Admins may recover every comment. Manual permanent deletion is unavailable.
            </p>
          </div>
          <div className="act-limit">
            <small>Admin delete limit</small>
            <strong>100 / hour</strong>
          </div>
        </section>

        <section className="act-tools">
          <div className="act-search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search comment, reader, story..."
            />
          </div>

          <div className="act-filters">
            {[
              ['all', 'All'],
              ['story', 'Story'],
              ['episode', 'Episode'],
              ['author_post', 'Author Post'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`act-filter ${filter === value ? 'active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {message ? (
          <button className="act-message" type="button" onClick={() => setMessage('')}>
            {message}
          </button>
        ) : null}

        <div className="act-summary">
          <h2>Recovery Items</h2>
          <span className="act-count">{filteredItems.length}</span>
        </div>

        {loading ? <div className="act-empty">Loading comment trash...</div> : null}

        {!loading && !filteredItems.length ? (
          <div className="act-empty">No deleted comments found.</div>
        ) : null}

        {!loading && filteredItems.length ? (
          <section className="act-grid">
            {filteredItems.map((item) => {
              const key = `${item.source}:${item.comment_id}`
              const remaining = daysLeft(item.delete_expires_at)
              const userName = item.user?.name || item.user?.username || 'Reader'

              return (
                <article className="act-card" key={key}>
                  <div className="act-top">
                    <div className="act-tags">
                      <span className="act-tag">{typeLabel(item)}</span>
                      {item.parent_id ? <span className="act-tag reply">Reply</span> : null}
                    </div>
                    <span className="act-days">{remaining} days left</span>
                  </div>

                  <div className="act-context">{contextTitle(item)}</div>
                  <div className="act-text">{item.text || 'Empty comment'}</div>

                  <div className="act-meta">
                    <div>Reader<strong>{userName}</strong></div>
                    <div>Deleted<strong>{formatDate(item.deleted_at)}</strong></div>
                    <div>Deleted by<strong>{item.deleted_by_type || 'Unknown'}</strong></div>
                    <div>Expires<strong>{formatDate(item.delete_expires_at)}</strong></div>
                  </div>

                  {item.delete_reason ? (
                    <div className="act-reason">Reason: {item.delete_reason}</div>
                  ) : null}

                  <div className="act-footer">
                    <span className="act-source">{item.source}</span>
                    <button
                      type="button"
                      className="act-recover"
                      disabled={remaining <= 0 || busyId === key}
                      onClick={() => recoverComment(item)}
                    >
                      {busyId === key ? 'Recovering...' : 'Recover'}
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        ) : null}
      </main>
    </div>
  )
}
