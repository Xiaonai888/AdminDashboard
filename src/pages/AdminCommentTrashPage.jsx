import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

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
  .act-page {
    width: min(1280px, 100%);
    margin: 0 auto;
    padding-bottom: 40px;
  }

  .act-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .act-btn {
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .act-btn.primary {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .act-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .act-hero {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    border-radius: 24px;
    background: linear-gradient(135deg, #111827, #312E81);
    color: #FFFFFF;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
  }

  .act-hero h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 950;
  }

  .act-hero p {
    max-width: 720px;
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.72);
    font-size: 13px;
    font-weight: 650;
    line-height: 1.7;
  }

  .act-limit {
    min-width: 180px;
    height: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.08);
    padding: 15px;
  }

  .act-limit small {
    display: block;
    color: rgba(255, 255, 255, 0.62);
    font-weight: 850;
    text-transform: uppercase;
  }

  .act-limit strong {
    display: block;
    margin-top: 7px;
    font-size: 22px;
  }

  .act-tools {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    padding: 15px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  .act-search {
    flex: 1;
    max-width: 520px;
  }

  .act-search input {
    width: 100%;
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #F8FAFC;
    color: #0F172A;
    padding: 0 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
    outline: none;
  }

  .act-search input:focus {
    border-color: #4F46E5;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .act-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .act-filter {
    height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .act-filter.active {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .act-message {
    width: 100%;
    margin-top: 16px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #334155;
    padding: 12px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 850;
    text-align: left;
    cursor: pointer;
  }

  .act-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 22px 0 12px;
  }

  .act-summary h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 950;
  }

  .act-count {
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    padding: 6px 11px;
    font-size: 12px;
    font-weight: 900;
  }

  .act-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .act-card {
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.035);
  }

  .act-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .act-tags {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }

  .act-tag {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4338CA;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 950;
  }

  .act-tag.reply {
    background: #F1F5F9;
    color: #64748B;
  }

  .act-days {
    border-radius: 999px;
    background: #FEF3C7;
    color: #92400E;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
  }

  .act-context {
    margin-top: 10px;
    overflow: hidden;
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .act-text {
    min-height: 66px;
    margin-top: 10px;
    border-radius: 14px;
    background: #F8FAFC;
    color: #334155;
    padding: 12px;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .act-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 12px;
  }

  .act-meta div {
    color: #94A3B8;
    font-size: 10.5px;
    font-weight: 750;
  }

  .act-meta strong {
    display: block;
    margin-top: 3px;
    color: #475569;
    font-size: 11.5px;
  }

  .act-reason {
    margin-top: 10px;
    border: 1px solid #FFEDD5;
    border-radius: 12px;
    background: #FFF7ED;
    color: #9A3412;
    padding: 9px;
    font-size: 11.5px;
    font-weight: 800;
  }

  .act-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
  }

  .act-source {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 750;
  }

  .act-recover {
    height: 38px;
    border: 0;
    border-radius: 12px;
    background: #111827;
    color: #FFFFFF;
    padding: 0 15px;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .act-recover:disabled {
    background: #CBD5E1;
    cursor: not-allowed;
  }

  .act-empty {
    margin-top: 18px;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    color: #64748B;
    padding: 46px 24px;
    text-align: center;
    font-size: 13px;
    font-weight: 850;
  }

  @media (max-width: 900px) {
    .act-page {
      min-width: 0;
    }

    .act-hero,
    .act-tools {
      flex-direction: column;
    }

    .act-limit,
    .act-search {
      width: 100%;
      max-width: none;
      min-width: 0;
      box-sizing: border-box;
    }

    .act-search input {
      box-sizing: border-box;
    }

    .act-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .act-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: stretch;
      gap: 10px;
    }

    .act-btn {
      width: 100%;
      min-width: 0;
    }

    .act-hero {
      gap: 16px;
      border-radius: 20px;
      padding: 20px 16px;
    }

    .act-hero > div {
      min-width: 0;
    }

    .act-hero h1 {
      font-size: 24px;
      overflow-wrap: anywhere;
    }

    .act-hero p,
    .act-message,
    .act-context,
    .act-reason,
    .act-source,
    .act-meta strong {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .act-limit {
      min-width: 0;
      padding: 14px;
    }

    .act-tools {
      gap: 13px;
      border-radius: 18px;
      padding: 13px;
    }

    .act-filters {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .act-filters::-webkit-scrollbar {
      display: none;
    }

    .act-filter {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .act-message {
      padding: 12px;
    }

    .act-summary {
      gap: 12px;
      margin-top: 18px;
    }

    .act-summary h2 {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .act-count {
      flex-shrink: 0;
    }

    .act-card {
      min-width: 0;
      border-radius: 18px;
      padding: 14px;
    }

    .act-top {
      min-width: 0;
    }

    .act-context {
      white-space: normal;
      text-overflow: clip;
    }

    .act-text {
      min-height: 0;
      padding: 11px;
    }

    .act-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .act-recover {
      width: 100%;
      min-height: 40px;
    }

    .act-empty {
      border-radius: 18px;
      padding: 40px 16px;
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 480px) {
    .act-actions {
      grid-template-columns: 1fr;
    }

    .act-top {
      flex-direction: column;
    }

    .act-days {
      width: fit-content;
    }

    .act-meta {
      grid-template-columns: 1fr;
    }

    .act-summary {
      align-items: flex-start;
    }
  }
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
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Cannot connect to backend.'
          : error.message || 'Failed to load comment trash'
      )
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
        current.filter(
          (record) =>
            !(
              record.source === item.source &&
              String(record.comment_id) === String(item.comment_id)
            )
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
    <AdminLayout
      title="Comment Trash"
      subtitle="Recover deleted comments before their 30-day retention period ends."
    >
      <style>{styles}</style>

      <div className="act-page">
        <div className="act-actions">
          <button className="act-btn" type="button" onClick={() => navigate('/comments')}>
            ← Comments
          </button>

          <button
            className="act-btn primary"
            type="button"
            onClick={loadTrash}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <section className="act-hero">
          <div>
            <h1>Deleted Comments</h1>
            <p>
              Deleted comments remain recoverable for 30 days. Admins may recover every
              comment. Manual permanent deletion is unavailable.
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
                    <div>
                      Reader
                      <strong>{userName}</strong>
                    </div>
                    <div>
                      Deleted
                      <strong>{formatDate(item.deleted_at)}</strong>
                    </div>
                    <div>
                      Deleted by
                      <strong>{item.deleted_by_type || 'Unknown'}</strong>
                    </div>
                    <div>
                      Expires
                      <strong>{formatDate(item.delete_expires_at)}</strong>
                    </div>
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
      </div>
    </AdminLayout>
  )
}
