import React, { useRef, useState } from 'react'
import {
  makeExcelReport,
  makeWordReport,
  makePdfReport,
  saveIncomeReport,
} from './adminAuthorIncomeFileFormats'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const layout = {
  display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end',
}

const inputStyle = {
  height: 37, border: '1px solid #CBD5E1', background: '#FFFFFF',
  borderRadius: 10, padding: '0 10px', color: '#0F172A', fontSize: 12,
  maxWidth: '100%',
}

const buttonStyle = {
  ...inputStyle, cursor: 'pointer', fontWeight: 800,
  borderColor: '#C7D2FE', background: '#EEF2FF', color: '#4338CA',
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') || ''
}

export default function AdminAuthorIncomeExportBar({ authorId, status = 'all', shareSource = '' }) {
  const [period, setPeriod] = useState('month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const cache = useRef({ key: '', value: null, time: 0 })

  const previewMode = period === 'year' || period === 'all' ? 'Summary' :
    period === 'custom' && from && to && (Date.parse(to) - Date.parse(from)) / 86400000 + 1 > 31
      ? 'Summary' : 'Detailed transactions'

  async function download(format) {
    if (!authorId || working) return
    if (period === 'custom' && (!from || !to || from > to)) {
      setError('Choose a valid Custom start and end date')
      return
    }
    setError('')
    setNotice('')
    setWorking(format)
    let timer
    try {
      const token = getAdminToken()
      if (!token) throw new Error('Please log in to Admin Dashboard again')
      const params = new URLSearchParams({ period, status, share_source: shareSource })
      if (period === 'custom') {
        params.set('from', from)
        params.set('to', to)
      }
      const key = `${authorId}:${params.toString()}`
      let report = cache.current.key === key && Date.now() - cache.current.time < 60000
        ? cache.current.value : null
      if (!report) {
        const controller = new AbortController()
        timer = setTimeout(() => controller.abort(), 60000)
        const response = await fetch(
          `${API_URL}/api/admin/income/author-income/${encodeURIComponent(authorId)}/export-data?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, cache: 'no-store' }
        )
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.ok) {
          throw new Error(result?.message || `Could not prepare export (${response.status})`)
        }
        if (!Array.isArray(result.rows) || !result.totals) throw new Error('Invalid report data')
        report = result
        cache.current = { key, value: result, time: Date.now() }
      }
      const blob = format === 'xlsx' ? makeExcelReport(report)
        : format === 'docx' ? makeWordReport(report)
          : await makePdfReport(report)
      if (!blob?.size) throw new Error('The generated file is empty')
      saveIncomeReport(blob, report, format)
      setNotice(`${format.toUpperCase()} ready · ${report.mode === 'summary' ? 'Summary' : 'Detailed transactions'} · ${Number(report.totals.transaction_count || 0).toLocaleString()} transactions`)
    } catch (caught) {
      setError(caught.name === 'AbortError'
        ? 'The report request timed out. Please try a shorter Custom range.'
        : caught.message || 'Report download failed')
    } finally {
      clearTimeout(timer)
      setWorking('')
    }
  }

  return (
    <section aria-label="Author income report downloads" style={{
      padding: 14, marginBottom: 16, border: '1px solid #E2E8F0',
      borderRadius: 15, background: '#FFFFFF', display: 'grid', gap: 12,
    }}>
      <div style={{ ...layout, justifyContent: 'space-between' }}>
        <div style={{ display: 'grid', gap: 5 }}>
          <strong style={{ fontSize: 13, color: '#0F172A' }}>Download Income Report</strong>
          <span style={{ fontSize: 11, color: '#64748B' }}>Select a date range and format</span>
        </div>
        <label style={{ display: 'grid', gap: 5, color: '#475569', fontSize: 11, fontWeight: 700 }}>
          Date Range
          <select style={inputStyle} value={period} disabled={Boolean(working)} onChange={event => {
            setPeriod(event.target.value)
            setError('')
            setNotice('')
          }}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom</option>
            <option value="all">All Time</option>
          </select>
        </label>
      </div>
      {period === 'custom' ? (
        <div style={layout}>
          <label style={{ display: 'grid', gap: 5, fontSize: 11, color: '#475569' }}>
            From
            <input type="date" value={from} max={to || undefined} style={inputStyle} disabled={Boolean(working)} onChange={event => setFrom(event.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 11, color: '#475569' }}>
            To
            <input type="date" value={to} min={from || undefined} style={inputStyle} disabled={Boolean(working)} onChange={event => setTo(event.target.value)} />
          </label>
        </div>
      ) : null}
      <div style={{ ...layout, justifyContent: 'space-between' }}>
        <div style={layout}>
          {[
            ['docx', 'Word'],
            ['xlsx', 'Excel'],
            ['pdf', 'PDF'],
          ].map(([format, label]) => (
            <button key={format} type="button" style={buttonStyle} disabled={Boolean(working) || !authorId} onClick={() => download(format)}>
              {working === format ? 'Preparing…' : `Download ${label}`}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{previewMode}</span>
      </div>
      <div style={{ fontSize: 11, color: '#64748B' }}>
        Up to 31 days: complete detailed transactions (max 500). Longer periods: database summaries. All Time: annual and monthly summaries.
      </div>
      {error ? <div role="alert" style={{ fontSize: 12, color: '#B91C1C' }}>{error}</div> : null}
      {notice ? <div role="status" style={{ fontSize: 12, color: '#047857' }}>{notice}</div> : null}
    </section>
  )
}
