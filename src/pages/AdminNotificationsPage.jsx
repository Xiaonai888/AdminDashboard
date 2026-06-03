import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadAnnouncements() {
    try {
      setLoading(true)
      setError('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/notifications/announcements`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load announcements')
      }

      setAnnouncements(data.announcements || [])
    } catch (err) {
      setAnnouncements([])
      setError(err.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    try {
      setSending(true)
      setNotice('')
      setError('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          message,
          link,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to send announcement')
      }

      setTitle('')
      setMessage('')
      setLink('')
      setNotice(`Announcement sent to ${data.announcement?.recipient_count || 0} readers`)
      await loadAnnouncements()
    } catch (err) {
      setError(err.message || 'Failed to send announcement')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif', color: '#0F172A' }}>
      <div style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', padding: '18px 28px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer' }}
            >
              ‹
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Notifications</h1>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13, fontWeight: 600 }}>Create announcements for readers</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnnouncements}
            disabled={loading}
            style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: 12, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      </div>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 22, alignItems: 'start' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>New Announcement</h2>
            <p style={{ margin: '8px 0 18px', color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>This will appear in reader Notification under Announcements.</p>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8 }}>Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                placeholder="Example: Maintenance notice"
                style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none' }}
              />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', margin: '16px 0 8px' }}>Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={240}
                rows={5}
                placeholder="Write a short announcement..."
                style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'vertical' }}
              />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', margin: '16px 0 8px' }}>Link optional</label>
              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="/notifications"
                style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none' }}
              />

              {notice ? <div style={{ marginTop: 14, borderRadius: 12, background: '#ECFDF5', color: '#047857', padding: '10px 12px', fontSize: 13, fontWeight: 700 }}>{notice}</div> : null}
              {error ? <div style={{ marginTop: 14, borderRadius: 12, background: '#FEF2F2', color: '#DC2626', padding: '10px 12px', fontSize: 13, fontWeight: 700 }}>{error}</div> : null}

              <button
                type="submit"
                disabled={sending}
                style={{ width: '100%', marginTop: 18, border: 0, borderRadius: 999, background: '#111827', color: '#FFFFFF', padding: '13px 18px', fontSize: 14, fontWeight: 800, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.65 : 1 }}
              >
                {sending ? 'Sending...' : 'Send Announcement'}
              </button>
            </form>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: 22, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Recent Announcements</h2>
                <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: 13, fontWeight: 600 }}>{announcements.length} records</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 28, textAlign: 'center', color: '#64748B', fontWeight: 700 }}>Loading...</div>
            ) : announcements.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.map((item) => (
                  <article key={item.reference_id} style={{ border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{item.title}</h3>
                        <p style={{ margin: '7px 0 0', color: '#475569', fontSize: 13, lineHeight: 1.6 }}>{item.message}</p>
                        {item.link ? <div style={{ marginTop: 8, color: '#4F46E5', fontSize: 12, fontWeight: 800 }}>{item.link}</div> : null}
                      </div>
                      <span style={{ flexShrink: 0, height: 28, borderRadius: 999, background: '#FEF3C7', color: '#92400E', padding: '6px 10px', fontSize: 11, fontWeight: 900 }}>
                        {item.unread_count} unread
                      </span>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, color: '#94A3B8', fontSize: 11, fontWeight: 700 }}>
                      <span>{formatDate(item.created_at)}</span>
                      <span>{item.recipient_count} readers · {item.reference_id}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={{ padding: 28, textAlign: 'center', color: '#64748B', fontWeight: 700 }}>No announcements yet.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
