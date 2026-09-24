import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function authHeaders() {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminAuthorStoreExcelButton({ status, query }) {
  const [month, setMonth] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  async function download() {
    if (working) return
    setWorking(true)
    setError('')
    try {
      const params = new URLSearchParams({ status: status || 'in_review' })
      if (month) params.set('month', month)
      if (query.trim()) params.set('q', query.trim())
      const response = await fetch(`${API_URL}/api/admin/income/author-store-withdrawals/excel?${params}`, {
        headers: authHeaders(), cache: 'no-store',
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.message || `Excel export failed (${response.status})`)
      }
      const blob = await response.blob()
      if (!blob.size) throw new Error('The Excel file was empty')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `author-store-withdrawals-${month || 'all'}-${status || 'in_review'}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (caught) {
      setError(caught.message || 'Could not download Author Store Excel')
    } finally {
      setWorking(false)
    }
  }

  return (
    <section aria-label="Author Store withdrawal Excel export" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 10, marginTop: 14 }}>
      <label style={{ display: 'grid', gap: 5, color: '#64748b', fontSize: 12, fontWeight: 800 }}>
        Request month · blank = all dates
        <input className="input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} style={{ minWidth: 175 }} />
      </label>
      <button type="button" onClick={() => setMonth('')} disabled={working} style={{ minHeight: 42, borderRadius: 12, padding: '0 12px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 800 }}>All dates</button>
      <button type="button" onClick={download} disabled={working} style={{ minHeight: 42, borderRadius: 12, padding: '0 14px', border: 0, background: '#166534', color: '#fff', fontWeight: 900, cursor: working ? 'wait' : 'pointer' }}>
        {working ? 'Preparing Excel…' : 'Download Author Store Excel · All rows'}
      </button>
      <span style={{ flexBasis: '100%', color: '#64748b', fontSize: 12 }}>Uses the selected request status and search. Downloads all matching requests, not only the current 20 rows.</span>
      {error ? <span role="alert" style={{ flexBasis: '100%', color: '#b91c1c', fontSize: 12 }}>{error}</span> : null}
    </section>
  )
}
