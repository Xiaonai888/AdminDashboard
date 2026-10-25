import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const token = () => sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
const states = ['under_review', 'awaiting_reader', 'released', 'refunded']
const usd = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0))

export default function AdminAuthorBookHoldsPage() {
  const [filter, setFilter] = useState('under_review')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    async function run() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API}/api/author-store/admin/books/holds?status=${filter}&page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token()}` },
          cache: 'no-store',
          signal: controller.signal,
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result.ok !== true || !Array.isArray(result.rows)) throw new Error(result.message || 'Could not load holds')
        if (!controller.signal.aborted) {
          setRows(result.rows)
          setTotal(Number(result.total || 0))
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause.message || 'Could not load holds')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void run()
    return () => controller.abort()
  }, [page, filter, revision])

  async function approve() {
    if (!selected || saving || !/^\d{6}$/.test(pin) || reason.trim().length < 15) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/author-store/admin/books/${encodeURIComponent(selected.order_id)}/approve-hold`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey_pin: pin, review_reason: reason.trim() }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.ok !== true) throw new Error(result.message || 'Approval failed')
      setSelected(null)
      setPin('')
      setReason('')
      reload()
    } catch (cause) {
      setError(cause.message || 'Approval failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Physical Book Holds" subtitle="Review shipping evidence before releasing author funds">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20, color: '#0F172A' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {states.map((status) => (
            <button key={status} type="button" onClick={() => { setFilter(status); setPage(1) }} style={{ borderRadius: 12, border: '1px solid #CBD5E1', padding: '10px 14px', fontWeight: 700, background: filter === status ? '#4F46E5' : '#FFF', color: filter === status ? '#FFF' : '#334155' }}>
              {status.replaceAll('_', ' ')}
            </button>
          ))}
          <button type="button" onClick={reload} style={{ marginLeft: 'auto', padding: '10px 16px', background: '#F1F5F9', border: 0, borderRadius: 12 }}>Refresh</button>
        </div>
        <p style={{ fontSize: 13, color: '#64748B' }}>{total} total • 10 per page • Only loads while this page is open</p>
        {error && <p role="alert" style={{ color: '#B91C1C', padding: 14, borderRadius: 12, background: '#FEE2E2' }}>{error}</p>}
        {loading ? <p>Loading holds...</p> : !rows.length ? <p>No holds in this status.</p> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((row) => (
              <article key={row.hold_id} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: 18, display: 'grid', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <strong>{row.title}</strong>
                  <strong style={{ color: '#4F46E5' }}>{usd(row.held_amount)}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', wordBreak: 'break-all' }}>Order: {row.order_number} • {row.status}</div>
                <div style={{ fontSize: 13 }}>Buyer: {row.buyer_name} • {row.delivery_company || 'No carrier'} • Tracking: {row.tracking_number || '—'}</div>
                <div style={{ fontSize: 12 }}>Payment: {row.payment_status} • Delivery: {row.order_status}</div>
                {(Array.isArray(row.proof_refs) ? row.proof_refs : []).map((proof, index) => {
                  const url = typeof proof === 'string' ? proof : proof?.url
                  return typeof url === 'string' && /^https:\/\//i.test(url) ? <a key={index} target="_blank" rel="noopener noreferrer" href={url} style={{ color: '#4F46E5', wordBreak: 'break-all' }}>View delivery proof {index + 1}</a> : null
                })}
                {row.status === 'under_review' && Array.isArray(row.proof_refs) && row.proof_refs.length > 0 && (
                  <button type="button" onClick={() => { setSelected(row); setPin(''); setReason(''); setError('') }} style={{ justifySelf: 'start', border: 0, borderRadius: 12, background: '#4F46E5', color: '#FFF', fontWeight: 800, padding: '10px 20px' }}>Review & Approve</button>
                )}
              </article>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'end', paddingTop: 20 }}>
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} style={{ padding: '10px 16px' }}>Previous</button>
          <span style={{ alignSelf: 'center' }}>Page {page}</span>
          <button type="button" disabled={page * 10 >= total || loading} onClick={() => setPage((value) => value + 1)} style={{ padding: '10px 16px' }}>Next</button>
        </div>
      </div>
      {selected && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,.5)', display: 'grid', placeItems: 'center', padding: 15 }}>
          <div role="dialog" aria-modal="true" aria-label="Approve physical book hold" style={{ width: 'min(520px,100%)', background: '#FFF', borderRadius: 22, padding: 24, display: 'grid', gap: 12, color: '#0F172A' }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>Approve {selected.order_number}</h2>
            <p style={{ fontSize: 13, margin: 0 }}>Only approve after independently checking shipping evidence. Funds become withdrawable immediately after release.</p>
            <textarea rows={4} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Approval reason (at least 15 characters)" style={{ width: '100%', padding: 12, border: '1px solid #CBD5E1', borderRadius: 12 }} />
            <input type="password" autoComplete="off" inputMode="numeric" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Owner passkey PIN (6 digits)" style={{ padding: 12, border: '1px solid #CBD5E1', borderRadius: 12 }} />
            {error && <p role="alert" style={{ color: '#B91C1C' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" disabled={saving} onClick={() => { setSelected(null); setPin(''); setError('') }} style={{ flex: 1, padding: 12, borderRadius: 12 }}>Cancel</button>
              <button type="button" disabled={saving || reason.trim().length < 15 || !/^\d{6}$/.test(pin)} onClick={() => void approve()} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#4F46E5', color: '#FFF', fontWeight: 800 }}>{saving ? 'Approving...' : 'Approve & Release'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
