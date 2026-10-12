import React, { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BASE = `${API}/api/admin/device-offline`
const PAGE_SIZE = 10

const styles = `
  .doc-page{display:grid;gap:15px;color:#0f172a;max-width:1450px;margin:0 auto}
  .doc-card{background:#fff;border:1px solid #dfe6f2;border-radius:15px;padding:18px 20px;min-width:0}
  .doc-emergency{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.62fr);gap:22px;background:linear-gradient(110deg,#f7f8ff,#fff);border-color:#dcdfff;align-items:center}
  .doc-global-main{display:flex;align-items:flex-start;gap:16px;min-width:0}
  .doc-global-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:13px;background:#4f46e5;color:#fff;font-size:26px;flex-shrink:0}
  .doc-h2{margin:0;font-size:16px;font-weight:850;color:#17213b}
  .doc-help{font-size:12px;color:#71819c;line-height:1.55;margin:5px 0 0}
  .doc-global-switch{display:flex;gap:12px;align-items:center;margin-top:9px;flex-wrap:wrap}
  .doc-switch{position:relative;width:51px;height:29px;border:0;background:#a8b3c7;border-radius:100px;cursor:pointer;transition:background .18s}
  .doc-switch.active{background:#4f46e5}
  .doc-switch:after{content:'';position:absolute;top:4px;left:4px;width:21px;height:21px;background:#fff;border-radius:50%;transition:transform .18s;box-shadow:0 1px 4px #0002}
  .doc-switch.active:after{transform:translateX(22px)}
  .doc-switch:disabled{opacity:.5;cursor:wait}
  .doc-status{display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:800;background:#dcfce7;color:#047857}
  .doc-status.paused{background:#fff1cb;color:#9a5904}
  .doc-global-controls{display:grid;gap:10px;border-left:1px solid #e1e4f1;padding-left:22px}
  .doc-label{font-size:12px;font-weight:800;color:#455572}
  .doc-radio-row{display:flex;gap:15px;align-items:center;flex-wrap:wrap}
  .doc-radio{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:650;color:#334155;cursor:pointer}
  .doc-radio input{accent-color:#4f46e5;width:15px;height:15px}
  .doc-tabs{display:flex;align-items:center;gap:5px}
  .doc-tab{height:42px;border:1px solid #dde4ef;background:#fff;padding:0 22px;border-radius:9px;font-size:13px;font-weight:800;color:#65748c;cursor:pointer}
  .doc-tab.active{background:#4f46e5;color:white;border-color:#4f46e5}
  .doc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
  .doc-input,.doc-select,.doc-textarea{border:1px solid #cdd8e8;border-radius:9px;background:#fff;color:#1e293b;padding:10px 12px;min-height:40px;font:inherit;font-size:12px;outline:none;min-width:0}
  .doc-input:focus,.doc-select:focus,.doc-textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 3px #4f46e51a}
  .doc-input{width:100%}
  .doc-search-row{display:flex;gap:9px}
  .doc-search-row .doc-input{flex:1}
  .doc-button{border:1px solid #cdd8e8;border-radius:9px;background:#fff;color:#334155;padding:9px 13px;font:inherit;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}
  .doc-button.primary{background:#4f46e5;color:#fff;border-color:#4f46e5}
  .doc-button:disabled{opacity:.46;cursor:not-allowed}
  .doc-alert{font-size:12px;border-radius:10px;padding:11px 13px;border:1px solid #fecaca;background:#fff1f2;color:#b91c1c;line-height:1.5}
  .doc-success{border-color:#bbf7d0;background:#f0fdf4;color:#166534}
  .doc-placeholder{padding:25px 10px;text-align:center;font-size:12px;color:#8190a8}
  .doc-reader{border:1px solid #e2e8f0;border-radius:12px;margin-top:8px;overflow:hidden}
  .doc-reader.active{border-color:#a5b4fc}
  .doc-reader-head{display:flex;align-items:center;gap:12px;width:100%;padding:12px;background:#fff;border:0;cursor:pointer;text-align:left;color:#17213b}
  .doc-avatar{display:grid;place-items:center;width:39px;height:39px;border-radius:50%;background:#ede9fe;color:#4f46e5;font-size:15px;font-weight:900;flex-shrink:0}
  .doc-reader-name{font-size:13px;font-weight:850}
  .doc-reader-meta{font-size:11px;color:#8190a8;margin-top:3px;overflow-wrap:anywhere}
  .doc-reader-right{margin-left:auto;font-size:11px;color:#71819c;text-align:right;white-space:nowrap}
  .doc-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .doc-table{width:100%;border-collapse:collapse;min-width:930px}
  .doc-table th{font-size:11px;color:#63738d;background:#f8faff;text-align:left;padding:11px 12px;font-weight:850;white-space:nowrap}
  .doc-table td{font-size:12px;color:#334155;padding:10px 12px;border-top:1px solid #eff2f7;vertical-align:middle}
  .doc-device-buttons{display:flex;gap:6px;flex-wrap:nowrap}
  .doc-device-buttons .doc-button{font-size:10px;padding:7px 9px}
  .doc-pill{border-radius:999px;padding:4px 8px;background:#edf2f7;color:#64748b;font-size:10px;font-weight:800;white-space:nowrap}
  .doc-pill.online{background:#dcfce7;color:#15803d}
  .doc-pill.global{background:#ede9fe;color:#6d28d9}
  .doc-pill.individual{background:#dbeafe;color:#1d4ed8}
  .doc-page-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:15px;font-size:11px;color:#7c899e}
  .doc-page-buttons{display:flex;gap:7px;align-items:center}
  .doc-filter-row{display:grid;grid-template-columns:150px minmax(200px,1fr) 190px;gap:12px;align-items:end}
  .doc-field{display:grid;gap:6px}
  .doc-report-table{min-width:1050px}
  .doc-modal-backdrop{position:fixed;inset:0;background:#10192a99;z-index:1500;display:grid;place-items:center;padding:16px}
  .doc-modal{width:min(460px,100%);background:#fff;border-radius:17px;padding:23px;box-shadow:0 25px 90px #0003;display:grid;gap:12px}
  .doc-modal h3{font-size:17px;font-weight:900;margin:0}
  .doc-modal-actions{display:flex;justify-content:flex-end;gap:9px}
  .doc-textarea{resize:vertical;min-height:73px;width:100%}
  @media(max-width:900px){.doc-emergency{grid-template-columns:1fr}.doc-global-controls{border-left:0;border-top:1px solid #e1e4f1;padding-left:0;padding-top:15px}.doc-filter-row{grid-template-columns:1fr 1fr}.doc-filter-row .doc-field:nth-child(2){grid-column:span 2;grid-row:2}.doc-reader-right{white-space:normal}}
  @media(max-width:600px){.doc-card{padding:14px}.doc-reader-head{align-items:flex-start}.doc-reader-right{display:none}.doc-filter-row{grid-template-columns:1fr}.doc-filter-row .doc-field:nth-child(2){grid-column:auto;grid-row:auto}.doc-tab{padding:0 13px}.doc-global-main{gap:10px}.doc-global-icon{width:43px;height:43px}.doc-radio-row{gap:10px}}
`

function adminHeaders() {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok !== true) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }
  return data
}

function dateText(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { hour12: false })
}

function readableMode(value) {
  if (value === 'force_online') return 'Force Online'
  if (value === 'auto_offline') return 'Auto Offline'
  if (value === 'inherit') return 'Default'
  if (value === 'paused') return 'Paused for all'
  if (value === 'normal') return 'Normal'
  return String(value || 'Default').replace(/_/g, ' ')
}

function Pager({ page, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return (
    <div className="doc-page-foot">
      <span>Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
      <div className="doc-page-buttons">
        <button className="doc-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span>Page {page} / {pages}</span>
        <button className="doc-button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}

export default function AdminDeviceOfflineControlPage() {
  const [tab, setTab] = useState('devices')
  const [globalState, setGlobalState] = useState(null)
  const [globalError, setGlobalError] = useState('')
  const [pauseDuration, setPauseDuration] = useState('60')
  const [globalLoading, setGlobalLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [searchPage, setSearchPage] = useState(1)
  const [readers, setReaders] = useState([])
  const [readerTotal, setReaderTotal] = useState(0)
  const [readersLoading, setReadersLoading] = useState(false)
  const [readerError, setReaderError] = useState('')
  const [expandedId, setExpandedId] = useState('')
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [deviceError, setDeviceError] = useState('')
  const [reportInput, setReportInput] = useState('')
  const [reportQuery, setReportQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [reportStatus, setReportStatus] = useState('all')
  const [reportPage, setReportPage] = useState(1)
  const [reports, setReports] = useState([])
  const [reportTotal, setReportTotal] = useState(0)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [modal, setModal] = useState(null)
  const [pin, setPin] = useState('')
  const [note, setNote] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const deviceRequestId = useRef(0)
  const searchRequestId = useRef(0)
  const reportRequestId = useRef(0)
  const globalPaused = Boolean(globalState?.paused)

  const loadGlobal = useCallback(async () => {
    setGlobalLoading(true)
    setGlobalError('')
    try {
      const data = await request('/global')
      setGlobalState(data.global)
    } catch (error) {
      setGlobalError(error.message)
    } finally {
      setGlobalLoading(false)
    }
  }, [])

  useEffect(() => { void loadGlobal() }, [loadGlobal])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput.trim())
      setSearchPage(1)
      setExpandedId('')
      setDevices([])
    }, 450)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReportQuery(reportInput.trim())
      setReportPage(1)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [reportInput])

  const loadReaders = useCallback(async () => {
    const id = ++searchRequestId.current
    if (query.length < 2 || tab !== 'devices') {
      setReaders([])
      setReaderTotal(0)
      setReadersLoading(false)
      setReaderError('')
      return
    }
    setReadersLoading(true)
    setReaderError('')
    try {
      const params = new URLSearchParams({ q: query, page: String(searchPage), limit: String(PAGE_SIZE) })
      const data = await request(`/readers?${params}`)
      if (id !== searchRequestId.current) return
      setReaders(Array.isArray(data.items) ? data.items.slice(0, PAGE_SIZE) : [])
      setReaderTotal(Math.max(0, Number(data.total) || 0))
    } catch (error) {
      if (id !== searchRequestId.current) return
      setReaderError(error.message)
      setReaders([])
      setReaderTotal(0)
    } finally {
      if (id === searchRequestId.current) setReadersLoading(false)
    }
  }, [query, searchPage, tab])

  useEffect(() => { void loadReaders(); return () => { searchRequestId.current++ } }, [loadReaders])

  const loadDevices = useCallback(async (userId) => {
    const id = ++deviceRequestId.current
    setDevicesLoading(true)
    setDeviceError('')
    try {
      const data = await request(`/readers/${encodeURIComponent(userId)}/devices`)
      if (id !== deviceRequestId.current) return
      setDevices(Array.isArray(data.items) ? data.items.slice(0, 10) : [])
    } catch (error) {
      if (id !== deviceRequestId.current) return
      setDeviceError(error.message)
      setDevices([])
    } finally {
      if (id === deviceRequestId.current) setDevicesLoading(false)
    }
  }, [])

  const loadReport = useCallback(async () => {
    const id = ++reportRequestId.current
    if (tab !== 'report') return
    setReportLoading(true)
    setReportError('')
    try {
      const params = new URLSearchParams({ q: reportQuery, scope, status: reportStatus, page: String(reportPage), limit: String(PAGE_SIZE) })
      const data = await request(`/report?${params}`)
      if (id !== reportRequestId.current) return
      setReports(Array.isArray(data.items) ? data.items.slice(0, PAGE_SIZE) : [])
      setReportTotal(Math.max(0, Number(data.total) || 0))
    } catch (error) {
      if (id !== reportRequestId.current) return
      setReportError(error.message)
      setReports([])
      setReportTotal(0)
    } finally {
      if (id === reportRequestId.current) setReportLoading(false)
    }
  }, [tab, reportQuery, scope, reportStatus, reportPage])

  useEffect(() => { void loadReport(); return () => { reportRequestId.current++ } }, [loadReport])

  const openModal = (action) => {
    setPin('')
    setNote('')
    setMutationError('')
    setModal(action)
  }

  const saveChange = async (event) => {
    event.preventDefault()
    if (!modal || !/^\d{6}$/.test(pin) || saving) return
    setSaving(true)
    setMutationError('')
    setSuccess('')
    try {
      if (modal.scope === 'global') {
        await request('/global', {
          method: 'PATCH',
          body: JSON.stringify({ paused: modal.paused, duration_minutes: modal.paused ? (pauseDuration === 'manual' ? null : Number(pauseDuration)) : null, note: note.trim(), pin }),
        })
        await loadGlobal()
      } else {
        await request(`/devices/${encodeURIComponent(modal.deviceId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ user_id: modal.userId, mode: modal.mode, note: note.trim(), pin }),
        })
        await loadDevices(modal.userId)
      }
      setModal(null)
      setPin('')
      setSuccess('Changes saved successfully.')
      if (tab === 'report') void loadReport()
    } catch (error) {
      setMutationError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const changeTab = (next) => {
    setTab(next)
    setSuccess('')
  }

  return (
    <AdminLayout title="Device Offline Control" subtitle="Manage reader device connectivity and offline recovery">
      <style>{styles}</style>
      <div className="doc-page">
        <section className="doc-card doc-emergency">
          <div className="doc-global-main">
            <div className="doc-global-icon">◎</div>
            <div>
              <h2 className="doc-h2">Global Auto Offline Control</h2>
              <div className="doc-global-switch">
                <button
                  className={`doc-switch ${globalPaused ? 'active' : ''}`}
                  type="button"
                  role="switch"
                  aria-label="Pause Auto Offline for All"
                  aria-checked={globalPaused}
                  disabled={globalLoading || !globalState}
                  onClick={() => openModal({ scope: 'global', paused: !globalPaused })}
                />
                <strong style={{ fontSize: 13 }}>Pause Auto Offline for All</strong>
                {globalState ? <span className={`doc-status ${globalPaused ? 'paused' : ''}`}>{globalPaused ? 'Paused for all' : 'Normal'}</span> : null}
              </div>
              <p className="doc-help">Individual device settings remain saved when global pause is enabled.</p>
              {globalState?.pause_until && globalPaused ? <p className="doc-help">Pause expires: {dateText(globalState.pause_until)}</p> : null}
              {globalLoading ? <p className="doc-help">Loading global status...</p> : null}
              {globalError ? <div className="doc-alert" role="alert">{globalError} <button className="doc-button" onClick={() => void loadGlobal()}>Retry</button></div> : null}
            </div>
          </div>
          <div className="doc-global-controls">
            <span className="doc-label">Pause Duration</span>
            <div className="doc-radio-row">
              {[['60', '1 hour'], ['360', '6 hours'], ['manual', 'Until manually resumed']].map(([value, label]) => (
                <label key={value} className="doc-radio"><input type="radio" name="doc-duration" checked={pauseDuration === value} onChange={() => setPauseDuration(value)} />{label}</label>
              ))}
            </div>
            <div><button type="button" className="doc-button primary" disabled={globalLoading || !globalState} onClick={() => openModal({ scope: 'global', paused: !globalPaused })}>{globalPaused ? 'Resume Auto Offline' : 'Apply Global Pause'}</button></div>
          </div>
        </section>

        <div className="doc-tabs" role="tablist" aria-label="Device offline management tabs">
          <button role="tab" aria-selected={tab === 'devices'} className={`doc-tab ${tab === 'devices' ? 'active' : ''}`} onClick={() => changeTab('devices')}>▣ Device Control</button>
          <button role="tab" aria-selected={tab === 'report'} className={`doc-tab ${tab === 'report' ? 'active' : ''}`} onClick={() => changeTab('report')}>▥ Report</button>
        </div>
        {success ? <div className="doc-alert doc-success" role="status">{success}</div> : null}

        {tab === 'devices' ? (
          <>
            <section className="doc-card">
              <div className="doc-head"><div><h2 className="doc-h2">Search Reader</h2><p className="doc-help">Search by Name, Username, Page Name or Account ID.</p></div></div>
              <input className="doc-input" type="search" placeholder="Enter name, username, page name or account ID..." maxLength={80} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
            </section>
            <section className="doc-card">
              <div className="doc-head"><div><h2 className="doc-h2">Search Results</h2><p className="doc-help">{query.length < 2 ? 'Enter at least 2 characters to search.' : `${readerTotal} readers found`}</p></div><span className="doc-pill">10 / page</span></div>
              {readerError ? <div className="doc-alert" role="alert">{readerError} <button className="doc-button" onClick={() => void loadReaders()}>Retry</button></div> : null}
              {readersLoading ? <div className="doc-placeholder">Searching readers...</div> : null}
              {!readersLoading && !readerError && query.length >= 2 && readers.length === 0 ? <div className="doc-placeholder">No matching readers.</div> : null}
              {!readersLoading && !readerError && readers.map((reader) => {
                const userId = String(reader.id || '')
                const expanded = expandedId === userId
                return (
                  <article className={`doc-reader ${expanded ? 'active' : ''}`} key={userId}>
                    <button className="doc-reader-head" type="button" aria-expanded={expanded} onClick={() => { if (expanded) { setExpandedId(''); setDevices([]); deviceRequestId.current++ } else { setExpandedId(userId); setDevices([]); void loadDevices(userId) } }}>
                      <span style={{ fontSize: 14, color: '#64748b' }}>{expanded ? '⌄' : '›'}</span>
                      <span className="doc-avatar">{String(reader.name || reader.username || 'R').slice(0, 1).toUpperCase()}</span>
                      <span style={{ flex: 1, minWidth: 0 }}><span className="doc-reader-name">{reader.name || reader.username || 'Reader'}</span><span className="doc-reader-meta" style={{ display: 'block' }}>@{reader.username || '—'} · Page: {reader.page_name || '—'} · Account ID: {userId}</span></span>
                      <span className="doc-reader-right">{Number(reader.device_count) || 0} devices · {dateText(reader.last_seen_at)}</span>
                    </button>
                    {expanded ? (
                      <div className="doc-table-scroll">
                        {devicesLoading ? <div className="doc-placeholder">Loading devices...</div> : deviceError ? <div className="doc-alert" role="alert">{deviceError} <button className="doc-button" onClick={() => void loadDevices(userId)}>Retry</button></div> : devices.length ? (
                          <table className="doc-table"><thead><tr><th>Device Label</th><th>OS</th><th>Browser</th><th>Last Seen</th><th>Saved Mode</th><th>Actions</th></tr></thead><tbody>
                            {devices.map((device) => (
                              <tr key={device.id}>
                                <td style={{ fontWeight: 800 }}>{device.device_label || 'Unknown device'}</td>
                                <td>{device.os_name || '—'}</td>
                                <td>{device.browser_name || '—'}</td>
                                <td>{dateText(device.last_seen_at)}</td>
                                <td><span className={`doc-pill ${device.mode === 'force_online' ? 'online' : ''}`}>{readableMode(device.mode)}</span>{globalPaused ? <span className="doc-pill global" style={{ marginLeft: 5 }}>Global Pause</span> : null}</td>
                                <td><div className="doc-device-buttons">
                                  <button className="doc-button" disabled={device.mode === 'force_online'} onClick={() => openModal({ scope: 'device', deviceId: device.id, userId, deviceLabel: device.device_label, mode: 'force_online' })}>Force Online</button>
                                  <button className="doc-button" disabled={device.mode === 'auto_offline'} onClick={() => openModal({ scope: 'device', deviceId: device.id, userId, deviceLabel: device.device_label, mode: 'auto_offline' })}>Auto Offline</button>
                                  <button className="doc-button" disabled={!device.mode || device.mode === 'inherit'} onClick={() => openModal({ scope: 'device', deviceId: device.id, userId, deviceLabel: device.device_label, mode: 'inherit' })}>Clear Override</button>
                                </div></td>
                              </tr>
                            ))}
                          </tbody></table>
                        ) : <div className="doc-placeholder">No active devices found for this account.</div>}
                      </div>
                    ) : null}
                  </article>
                )
              })}
              {query.length >= 2 && !readersLoading && !readerError ? <Pager page={searchPage} total={readerTotal} onChange={(next) => { setSearchPage(next); setExpandedId(''); setDevices([]) }} /> : null}
            </section>
          </>
        ) : (
          <>
            <section className="doc-card">
              <div className="doc-head"><div><h2 className="doc-h2">Report History</h2><p className="doc-help">Global and individual device changes.</p></div><span className="doc-pill">10 / page</span></div>
              <div className="doc-filter-row">
                <label className="doc-field"><span className="doc-label">Scope</span><select className="doc-select" value={scope} onChange={(e) => { setScope(e.target.value); setReportPage(1) }}><option value="all">All</option><option value="global">Global</option><option value="individual">Individual</option></select></label>
                <label className="doc-field"><span className="doc-label">Search</span><input className="doc-input" type="search" maxLength={80} placeholder="Reader, device or note..." value={reportInput} onChange={(e) => setReportInput(e.target.value)} /></label>
                <label className="doc-field"><span className="doc-label">Status</span><select className="doc-select" value={reportStatus} onChange={(e) => { setReportStatus(e.target.value); setReportPage(1) }}><option value="all">All</option><option value="force_online">Force Online</option><option value="auto_offline">Auto Offline</option><option value="inherit">Clear Override</option><option value="paused">Global Paused</option><option value="normal">Global Normal</option></select></label>
              </div>
            </section>
            <section className="doc-card">
              <div className="doc-head"><h2 className="doc-h2">History Records ({reportTotal})</h2></div>
              {reportError ? <div className="doc-alert" role="alert">{reportError} <button className="doc-button" onClick={() => void loadReport()}>Retry</button></div> : null}
              {reportLoading ? <div className="doc-placeholder">Loading report...</div> : !reportError ? (
                <div className="doc-table-scroll"><table className="doc-table doc-report-table"><thead><tr><th>Time</th><th>Scope</th><th>Reader</th><th>Device</th><th>Previous State</th><th>New State</th><th>By Admin</th><th>Note</th></tr></thead><tbody>
                  {reports.map((row) => <tr key={row.id}><td>{dateText(row.created_at)}</td><td><span className={`doc-pill ${row.scope === 'global' ? 'global' : 'individual'}`}>{row.scope === 'global' ? 'Global' : 'Individual'}</span></td><td>{row.reader_name || (row.scope === 'global' ? 'All readers' : '—')}</td><td>{row.device_label || '—'}</td><td>{readableMode(row.previous_mode)}</td><td><span className={`doc-pill ${row.next_mode === 'force_online' ? 'online' : ''}`}>{readableMode(row.next_mode)}</span></td><td>{row.admin_name || '—'}</td><td>{row.note || '—'}</td></tr>)}
                </tbody></table>{reports.length === 0 ? <div className="doc-placeholder">No report records found.</div> : null}</div>
              ) : null}
              {!reportLoading && !reportError ? <Pager page={reportPage} total={reportTotal} onChange={setReportPage} /> : null}
            </section>
          </>
        )}
      </div>

      {modal ? <div className="doc-modal-backdrop" role="presentation"><form className="doc-modal" onSubmit={saveChange} role="dialog" aria-modal="true" aria-label="Confirm device offline settings change">
        <h3>{modal.scope === 'global' ? (modal.paused ? 'Pause Auto Offline for All' : 'Resume Auto Offline for All') : `${readableMode(modal.mode)} · ${modal.deviceLabel || 'Device'}`}</h3>
        <p className="doc-help">{modal.scope === 'global' ? 'This change affects all readers temporarily. Saved individual settings will not be removed.' : 'Only the selected reader device setting will be changed.'}</p>
        <label className="doc-field"><span className="doc-label">Reason / Note (optional)</span><textarea className="doc-textarea" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} /></label>
        <label className="doc-field"><span className="doc-label">Admin Passkey PIN (6 digits)</span><input className="doc-input" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="off" maxLength={6} required pattern="[0-9]{6}" /></label>
        {mutationError ? <div className="doc-alert" role="alert">{mutationError}</div> : null}
        <div className="doc-modal-actions"><button type="button" className="doc-button" disabled={saving} onClick={() => setModal(null)}>Cancel</button><button type="submit" className="doc-button primary" disabled={saving || pin.length !== 6}>{saving ? 'Saving...' : 'Confirm Change'}</button></div>
      </form></div> : null}
    </AdminLayout>
  )
}
