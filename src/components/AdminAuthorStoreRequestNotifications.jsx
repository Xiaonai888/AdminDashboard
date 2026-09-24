import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function adminHeaders() {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminAuthorStoreRequestNotifications() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 })
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_URL}/api/author-store/admin/withdrawal-notifications?page=${page}`, {
          headers: adminHeaders(), signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || data.ok === false) throw new Error(data.message || 'Unable to load withdrawal requests')
        if (controller.signal.aborted) return
        const pages = Math.max(1, Number(data.total_pages) || 1)
        if (page > pages) {
          setPage(pages)
          return
        }
        setRequests(Array.isArray(data.withdrawals) ? data.withdrawals : [])
        setMeta({ total: Number(data.total) || 0, total_pages: pages })
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught.message || 'Unable to load withdrawal requests')
          setRequests([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [page, revision])

  return (
    <section aria-label="Author Store withdrawal notifications" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 18, marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 850, margin: 0 }}>Author Store · New Withdrawal Requests</h2>
          <p style={{ color: '#64748b', fontSize: 12, margin: '6px 0' }}>Each request appears once by its unique ID. Open it to review in Withdraw Requests.</p>
        </div>
        <button type="button" onClick={() => setRevision(value => value + 1)} disabled={loading} style={{ padding: '9px 13px', border: '1px solid #cbd5e1', borderRadius: 10, background: '#f8fafc', cursor: 'pointer' }}>Refresh</button>
      </div>
      {error ? <p role="alert" style={{ color: '#b91c1c' }}>{error}</p> : null}
      {loading ? <p>Loading requests…</p> : requests.length === 0 ? <p style={{ color: '#64748b' }}>No new withdrawal requests.</p> : (
        <div style={{ display: 'grid', gap: 9, marginTop: 12 }}>
          {requests.map(request => (
            <button key={request.id} type="button" onClick={() => navigate(`/withdraw?withdrawal=${encodeURIComponent(request.id)}`)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ minWidth: 0 }}><strong>{request.author_page?.page_name || request.author_user?.name || request.author_page?.page_username || 'Author'}</strong><br /><small style={{ color: '#64748b' }}>{request.created_at ? new Date(request.created_at).toLocaleString() : ''} · Request {request.id}</small></span>
              <strong style={{ whiteSpace: 'nowrap' }}>${Number(request.amount_usd || 0).toFixed(2)} →</strong>
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 12, color: '#64748b' }}>
        <span>{meta.total} pending requests · Page {page} / {meta.total_pages}</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
          <button type="button" disabled={loading || page >= meta.total_pages} onClick={() => setPage(value => value + 1)}>Next</button>
        </span>
      </div>
    </section>
  )
}
