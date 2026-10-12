import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isFuture(value) {
  return Boolean(value && new Date(value).getTime() > Date.now())
}

function getStatus(row) {
  if (!row) return 'allowed'
  if (row.is_permanent_blocked || row.block_status === 'permanent_block') return 'permanent_block'
  if (isFuture(row.blocked_until)) return row.block_status || 'temporary_block'
  return 'allowed'
}

function statusLabel(status) {
  if (status === 'permanent_block') return 'Permanent'
  if (status === 'seven_day_block') return '7 Days'
  if (status === 'day_block') return '24 Hours'
  if (status === 'one_hour_block') return '1 Hour'
  if (status === 'temporary_block') return '15 Min'
  return 'Allowed'
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAdminToken()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error([data.message, data.error].filter(Boolean).join(' — ') || `Request failed (${response.status})`)
  }

  return data
}

function SummaryCard({ label, value, note, tone }) {
  return (
    <div className={`alg-summary-card ${tone || ''}`}>
      <div className="alg-summary-label">{label}</div>
      <div className="alg-summary-value">{formatNumber(value)}</div>
      <div className="alg-summary-note">{note}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`alg-badge ${status || 'allowed'}`}>{statusLabel(status)}</span>
}

function ResultBadge({ value }) {
  const result = String(value || 'event').toLowerCase()
  return <span className={`alg-result ${result}`}>{result}</span>
}

function DetailRow({ label, value, wide }) {
  return (
    <div className={wide ? 'alg-detail-row wide' : 'alg-detail-row'}>
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="alg-empty">
      <div>🛡️</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function AttackerInvestigation({ item }) {
  const metadata = item?.metadata && typeof item.metadata === 'object' && !Array.isArray(item.metadata)
    ? item.metadata
    : {}
  const userAgent = String(item?.user_agent || '')
  const ip = String(item?.ip_address || '').trim()
  const country = item?.country_name || metadata.country_name || item?.country_code || metadata.country_code || 'Not recorded'
  const hasValidIp = (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) && ip.split('.').every((part) => Number(part) <= 255)) || (/^[0-9a-f:]+$/i.test(ip) && ip.includes(':'))

  let os = 'Unknown'
  if (/Windows NT/i.test(userAgent)) os = 'Windows'
  else if (/Android/i.test(userAgent)) os = `Android ${userAgent.match(/Android\s+([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = `iOS ${userAgent.match(/(?:iPhone OS|CPU OS)\s+([\d_]+)/i)?.[1]?.replaceAll('_', '.') || ''}`.trim()
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = 'macOS'
  else if (/Linux/i.test(userAgent)) os = 'Linux'

  let browser = 'Unknown'
  if (/FBAN|FBAV|FB_IAB/i.test(userAgent)) browser = 'Facebook in-app browser'
  else if (/Edg(?:A|iOS)?\/([\d.]+)/i.test(userAgent)) browser = `Microsoft Edge ${userAgent.match(/Edg(?:A|iOS)?\/([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/OPR\/([\d.]+)/i.test(userAgent)) browser = `Opera ${userAgent.match(/OPR\/([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/Firefox\/([\d.]+)/i.test(userAgent)) browser = `Firefox ${userAgent.match(/Firefox\/([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/CriOS\/([\d.]+)/i.test(userAgent)) browser = `Chrome ${userAgent.match(/CriOS\/([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/Chrome\/([\d.]+)/i.test(userAgent)) browser = `Chrome ${userAgent.match(/Chrome\/([\d.]+)/i)?.[1] || ''}`.trim()
  else if (/Safari/i.test(userAgent)) browser = `Safari ${userAgent.match(/Version\/([\d.]+)/i)?.[1] || ''}`.trim()

  return (
    <>
      <DetailRow label="Country (IP estimate)" value={country} />
      <DetailRow label="Operating System (claimed)" value={os} />
      <DetailRow label="Browser (claimed)" value={browser} />
      <DetailRow label="Trusted Login Device" value={item?.is_trusted_device === undefined ? 'Not recorded' : item.is_trusted_device ? 'Yes' : 'No'} />
      <DetailRow
        label="IP Investigation: City / ISP / ASN / Proxy"
        wide
        value={hasValidIp ? (
          <a
            href={`https://ipinfo.io/${encodeURIComponent(ip)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Investigate {ip} on IPinfo (external site)
          </a>
        ) : 'Public IP not verified'}
      />
    </>
  )
}

function AttackHistoryPanel({ logins, signals, loading, message, filter, setFilter, onOpenLogin }) {
  const [expanded, setExpanded] = useState('')
  const entries = [
    ...logins.map((entry) => ({
      id: `login-${entry.id}`,
      category: 'login',
      title: String(entry.action || 'Admin login event').replaceAll('_', ' '),
      source: 'Admin Login Guard',
      severity: entry.result === 'blocked' ? 'high' : entry.result === 'failed' ? 'medium' : 'info',
      time: entry.occurred_at || entry.created_at,
      detail: entry.reason || entry.result || 'Login event',
      ip: entry.ip_address || '',
      country: entry.country_name || entry.country_code || '',
      result: entry.result || '',
      action: entry.action || '',
      userAgent: entry.user_agent || '',
      device: entry.device_id || '',
      original: entry,
    })),
    ...signals.map((signal) => ({
      id: `backend-${signal.id}`,
      category: 'backend',
      title: signal.title || signal.type || 'Backend security signal',
      source: `Backend · ${signal.source || 'Security'}`,
      severity: signal.severity || 'info',
      time: signal.created_at,
      detail: signal.detail || '',
      ip: signal.ip_address || '',
      country: signal.country_name || '',
      result: '',
      action: signal.type || '',
      userAgent: '',
      device: '',
      original: null,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 80)

  const visible = entries.filter((entry) => {
    if (filter === 'login') return entry.category === 'login'
    if (filter === 'backend') return entry.category === 'backend'
    if (filter === 'attention') return ['medium', 'high', 'critical'].includes(entry.severity)
    return true
  })

  return (
    <div className="alg-history">
      <div className="alg-history-intro">
        <div>
          <h3>Attack History</h3>
          <p>Admin login records and recent backend defense signals, ordered by time.</p>
        </div>
        <span className="alg-history-count">{visible.length} events</span>
      </div>
      <div className="alg-history-filters">
        {[
          ['all', 'All'],
          ['attention', 'Needs review'],
          ['login', 'Login'],
          ['backend', 'Backend'],
        ].map(([key, label]) => (
          <button key={key} type="button" className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      <p className="alg-history-note">Login events are stored in Supabase. Backend signals are temporary (up to 8 recent signals) and may disappear after a Render restart. Cloudflare events are not imported. A record here does not prove an attack.</p>
      {message ? <div className="alg-history-warning">{message}</div> : null}
      {loading ? <EmptyState title="Loading attack history..." text="Gathering available login and backend security events." /> : visible.length === 0 ? <EmptyState title="No matching history" text="No events match this filter or the available history window." /> : (
        <div className="alg-history-list">
          {visible.map((entry) => (
            <article className="alg-history-item" key={entry.id}>
              <button className="alg-history-item-head" type="button" onClick={() => setExpanded(expanded === entry.id ? '' : entry.id)} aria-expanded={expanded === entry.id}>
                <span className={`alg-history-dot alg-history-${entry.severity}`} />
                <span className="alg-history-item-copy">
                  <strong>{entry.title}</strong>
                  <small>{entry.source} · {entry.ip || 'IP not recorded'} · {formatDate(entry.time)}</small>
                </span>
                <span className={`alg-history-severity alg-history-${entry.severity}`}>{entry.severity}</span>
                <span className="alg-history-chevron">{expanded === entry.id ? '−' : '+'}</span>
              </button>
              {expanded === entry.id ? (
                <div className="alg-history-expanded">
                  <div className="alg-detail-grid">
                    <DetailRow label="Evidence source" value={entry.source} />
                    <DetailRow label="Action / Signal" value={entry.action} />
                    <DetailRow label="Date & Time" value={formatDate(entry.time)} />
                    <DetailRow label="Result" value={entry.result || entry.severity} />
                    <DetailRow label="IP Address" value={entry.ip || 'Not included in signal'} />
                    <DetailRow label="Country" value={entry.country || 'Not recorded'} />
                    <DetailRow label="Details" value={entry.detail} wide />
                    {entry.userAgent ? <DetailRow label="User Agent (claimed)" value={entry.userAgent} wide /> : null}
                    {entry.device ? <DetailRow label="Device ID" value={entry.device} wide /> : null}
                  </div>
                  {entry.original ? <button className="alg-history-more" type="button" onClick={() => onOpenLogin(entry.original)}>Open Login Event Details</button> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function Drawer({ item, type, onClose, onRelease, onPermanentBlock, onUnblock, onRevokeDevice, onRevokeIp, workingKey }) {
  if (!item) return null

  const status = getStatus(item)
  const isState = type === 'states'
  const isEvent = type === 'events'
  const isDevice = type === 'devices'
  const isIp = type === 'ips'
  const isWorking = workingKey.startsWith(`${item.id}:`)

  return (
    <div className="alg-drawer-layer" onMouseDown={onClose}>
      <aside className="alg-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="alg-drawer-header">
          <div>
            <div className="alg-kicker">
              {isState ? 'Admin Login Identity' : isEvent ? 'Login Event' : isDevice ? 'Trusted Device' : 'Trusted IP'}
            </div>
            <h3>{item.ip_address || item.attempted_email || item.admin_email || item.device_label || item.action || 'Admin Login Guard'}</h3>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="alg-drawer-badges">
          {isState ? <StatusBadge status={status} /> : null}
          {isEvent ? <ResultBadge value={item.result} /> : null}
          {isDevice || isIp ? <ResultBadge value={item.is_active ? 'active' : 'revoked'} /> : null}
        </div>

        <div className="alg-detail-grid">
          {isState ? (
            <>
              <DetailRow label="IP Address" value={item.ip_address} />
              <DetailRow label="Attempted Email" value={item.attempted_email || item.admin_email} />
              <DetailRow label="Failed Count" value={String(item.failed_count || 0)} />
              <DetailRow label="Success Count" value={String(item.success_count || 0)} />
              <DetailRow label="Block Until" value={formatDate(item.blocked_until)} />
              <DetailRow label="Last Failed" value={formatDate(item.last_failed_at)} />
              <DetailRow label="Last Success" value={formatDate(item.last_success_at)} />
              <DetailRow label="First Seen" value={formatDate(item.first_seen_at)} />
              <DetailRow label="Guard Key" value={item.guard_key} wide />
              <DetailRow label="Device ID" value={item.device_id} wide />
              <DetailRow label="User Agent" value={item.user_agent} wide />
              <DetailRow label="Reason" value={item.last_reason || item.permanent_block_reason} wide />
            </>
          ) : null}

          {isEvent ? (
            <>
              <DetailRow label="Action" value={item.action} />
              <DetailRow label="Result" value={item.result} />
              <DetailRow label="IP Address" value={item.ip_address} />
              <DetailRow label="Email" value={item.attempted_email || item.admin_email} />
              <DetailRow label="Failed Count" value={String(item.failed_count || 0)} />
              <DetailRow label="Time" value={formatDate(item.occurred_at || item.created_at)} />
              <DetailRow label="Device ID" value={item.device_id} wide />
              <DetailRow label="User Agent" value={item.user_agent} wide />
              <DetailRow label="Reason" value={item.reason} wide />
            </>
          ) : null}

          {isDevice ? (
            <>
              <DetailRow label="Admin Email" value={item.admin_email} />
              <DetailRow label="IP Address" value={item.ip_address} />
              <DetailRow label="Trusted At" value={formatDate(item.trusted_at)} />
              <DetailRow label="Last Seen" value={formatDate(item.last_seen_at)} />
              <DetailRow label="Device ID" value={item.device_id} wide />
              <DetailRow label="User Agent" value={item.user_agent} wide />
              <DetailRow label="Revoked Reason" value={item.revoked_reason} wide />
            </>
          ) : null}

          {isIp ? (
            <>
              <DetailRow label="IP Address" value={item.ip_address} />
              <DetailRow label="Label" value={item.label} />
              <DetailRow label="Trusted At" value={formatDate(item.trusted_at)} />
              <DetailRow label="Last Seen" value={formatDate(item.last_seen_at)} />
              <DetailRow label="Admin Email" value={item.admin_email} wide />
              <DetailRow label="Revoked Reason" value={item.revoked_reason} wide />
            </>
          ) : null}
          <AttackerInvestigation item={item} />
        </div>

        {isState ? (
          <div className="alg-drawer-actions">
            {status !== 'allowed' && status !== 'permanent_block' ? (
              <button type="button" disabled={isWorking} onClick={() => onRelease(item)}>Release Block</button>
            ) : null}
            {status !== 'permanent_block' ? (
              <button type="button" className="danger" disabled={isWorking} onClick={() => onPermanentBlock(item)}>Permanent Block</button>
            ) : (
              <button type="button" disabled={isWorking} onClick={() => onUnblock(item)}>Unblock</button>
            )}
          </div>
        ) : null}

        {isDevice && item.is_active ? (
          <div className="alg-drawer-actions">
            <button type="button" className="danger" disabled={isWorking} onClick={() => onRevokeDevice(item)}>Revoke Device</button>
          </div>
        ) : null}

        {isIp && item.is_active ? (
          <div className="alg-drawer-actions">
            <button type="button" className="danger" disabled={isWorking} onClick={() => onRevokeIp(item)}>Revoke IP</button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

export default function AdminLoginGuardPage() {
  const [tab, setTab] = useState('states')
  const [summary, setSummary] = useState({})
  const [states, setStates] = useState([])
  const [events, setEvents] = useState([])
  const [devices, setDevices] = useState([])
  const [ips, setIps] = useState([])
  const [historyLogins, setHistoryLogins] = useState([])
  const [historySignals, setHistorySignals] = useState([])
  const [historyFilter, setHistoryFilter] = useState('all')
  const [historyMessage, setHistoryMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedType, setSelectedType] = useState('states')
  const [workingKey, setWorkingKey] = useState('')
  const [trustedIp, setTrustedIp] = useState('')
  const [trustedIpLabel, setTrustedIpLabel] = useState('Trusted admin IP')

  const tabs = [
    { key: 'states', label: 'Blocked / Identities' },
    { key: 'events', label: 'Login Events' },
    { key: 'history', label: 'Attack History' },
    { key: 'devices', label: 'Trusted Devices' },
    { key: 'ips', label: 'Trusted IPs' },
  ]

  async function loadOverview() {
    const data = await apiRequest('/api/admin/login-guard/overview')
    setSummary(data.summary || {})
  }

  async function loadStates() {
    const params = new URLSearchParams({ page: '1', limit: '30', filter })
    if (query.trim()) params.set('q', query.trim())
    const data = await apiRequest(`/api/admin/login-guard/states?${params.toString()}`)
    setStates(data.states || [])
  }

  async function loadEvents() {
    const params = new URLSearchParams({ page: '1', limit: '30' })
    if (filter !== 'all') params.set('result', filter)
    if (query.trim()) params.set('q', query.trim())
    const data = await apiRequest(`/api/admin/login-guard/events?${params.toString()}`)
    setEvents(data.events || [])
  }

  async function loadDevices() {
    const data = await apiRequest('/api/admin/login-guard/trusted-devices?page=1&limit=30&filter=active')
    setDevices(data.devices || [])
  }

  async function loadIps() {
    const data = await apiRequest('/api/admin/login-guard/trusted-ips')
    setIps(data.ips || [])
  }

  async function loadAttackHistory() {
    const [loginResult, signalResult] = await Promise.allSettled([
      apiRequest('/api/admin/login-guard/events?page=1&limit=50'),
      apiRequest('/api/admin/work/security-center'),
    ])

    setHistoryLogins(loginResult.status === 'fulfilled' ? loginResult.value.events || [] : [])
    setHistorySignals(signalResult.status === 'fulfilled' ? signalResult.value.recent_signals || [] : [])
    const warnings = []
    if (loginResult.status === 'rejected') warnings.push('Login events could not be loaded.')
    if (signalResult.status === 'rejected') warnings.push('Backend signals could not be loaded.')
    setHistoryMessage(warnings.join(' '))
  }

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      await loadOverview()
      if (tab === 'states') await loadStates()
      if (tab === 'events') await loadEvents()
      if (tab === 'devices') await loadDevices()
      if (tab === 'ips') await loadIps()
      if (tab === 'history') await loadAttackHistory()
    } catch (err) {
      setError(err.message || 'Failed to load Admin Login Guard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab, filter])

  function openDrawer(item, type) {
    setSelected(item)
    setSelectedType(type)
  }

  async function runStateAction(item, key, path, body) {
    try {
      setWorkingKey(`${item.id}:${key}`)
      await apiRequest(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
      setSelected(null)
      await loadData()
    } catch (err) {
      setError(err.message || 'Action failed')
    } finally {
      setWorkingKey('')
    }
  }

  async function handleRelease(item) {
    await runStateAction(item, 'release', `/api/admin/login-guard/states/${item.id}/release`)
  }

  async function handlePermanentBlock(item) {
    const reason = window.prompt('Reason for permanent block?', item.last_reason || 'Repeated admin login attack')
    if (!reason || !reason.trim()) return
    await runStateAction(item, 'permanent', `/api/admin/login-guard/states/${item.id}/permanent-block`, { reason: reason.trim() })
  }

  async function handleUnblock(item) {
    const reason = window.prompt('Reason for unblock?', 'Manual unblock by admin')
    if (!reason || !reason.trim()) return
    await runStateAction(item, 'unblock', `/api/admin/login-guard/states/${item.id}/unblock`, { reason: reason.trim() })
  }

  async function handleRevokeDevice(item) {
    const reason = window.prompt('Reason for revoking this trusted device?', 'Manual revoke by admin')
    if (!reason || !reason.trim()) return

    try {
      setWorkingKey(`${item.id}:device`)
      await apiRequest(`/api/admin/login-guard/trusted-devices/${item.id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason.trim() }),
      })
      setSelected(null)
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to revoke device')
    } finally {
      setWorkingKey('')
    }
  }

  async function handleAddTrustedIp(event) {
    event.preventDefault()

    if (!trustedIp.trim()) {
      setError('Trusted IP is required')
      return
    }

    try {
      setWorkingKey('add-ip')
      await apiRequest('/api/admin/login-guard/trusted-ips', {
        method: 'POST',
        body: JSON.stringify({
          ip_address: trustedIp.trim(),
          label: trustedIpLabel.trim() || 'Trusted admin IP',
        }),
      })
      setTrustedIp('')
      setTrustedIpLabel('Trusted admin IP')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to add trusted IP')
    } finally {
      setWorkingKey('')
    }
  }

  async function handleRevokeIp(item) {
    const reason = window.prompt('Reason for revoking this trusted IP?', 'Manual revoke by admin')
    if (!reason || !reason.trim()) return

    try {
      setWorkingKey(`${item.id}:ip`)
      await apiRequest(`/api/admin/login-guard/trusted-ips/${item.id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason.trim() }),
      })
      setSelected(null)
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to revoke trusted IP')
    } finally {
      setWorkingKey('')
    }
  }

  return (
    <AdminLayout title="Admin Login Guard" subtitle="Monitor admin login attempts, blocks, devices, and trusted IPs.">
      <style>{styles}</style>

      <div className="alg-page">
        <div className="alg-hero">
          <div>
            <div className="alg-kicker">Security Shield</div>
            <h2>Admin Login Watch</h2>
            <p>Protect admin login from repeated failed attempts, unknown devices, and suspicious IP addresses.</p>
          </div>
          <div className="alg-hero-actions">
            <button type="button" onClick={() => { setTab('history'); setFilter('all'); setSelected(null) }}>View Attack History</button>
            <button type="button" onClick={loadData} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          </div>
        </div>

        <div className="alg-summary-grid">
          <SummaryCard label="Tracked" value={summary.total_tracked} note="IP/device identities" />
          <SummaryCard label="Active Blocks" value={summary.active_blocks} note="Temporary blocks now" tone="warning" />
          <SummaryCard label="Permanent" value={summary.permanent_blocks} note="Manual permanent blocks" tone="danger" />
          <SummaryCard label="Failed Today" value={summary.failed_today} note="Wrong login attempts" tone="warning" />
          <SummaryCard label="Blocked Today" value={summary.blocked_today} note="Blocked attempts" tone="danger" />
          <SummaryCard label="Trusted Devices" value={summary.trusted_devices} note="Owner safe devices" tone="success" />
        </div>

        {error ? <div className="alg-error">{error}</div> : null}

        <section className="alg-panel">
          <div className="alg-toolbar">
            <div className="alg-tabs">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={tab === item.key ? 'active' : ''}
                  onClick={() => {
                    setTab(item.key)
                    setFilter('all')
                    setSelected(null)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {(tab === 'states' || tab === 'events') ? (
              <form className="alg-search" onSubmit={(event) => { event.preventDefault(); loadData() }}>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search IP, email, browser..." />
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  {tab === 'states' ? (
                    <>
                      <option value="all">All</option>
                      <option value="blocked">Blocked</option>
                      <option value="permanent">Permanent</option>
                      <option value="failed">Failed</option>
                      <option value="success">Success</option>
                      <option value="allowed">Allowed</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="blocked">Blocked</option>
                      <option value="released">Released</option>
                    </>
                  )}
                </select>
                <button type="submit">Search</button>
              </form>
            ) : null}
          </div>

          {tab === 'states' ? (
            <div className="alg-table-wrap">
              {loading ? <EmptyState title="Loading states..." text="Please wait while Admin Login Guard data loads." /> : states.length === 0 ? <EmptyState title="No login identities found" text="Admin Login Guard has not recorded login attempts yet." /> : (
                <table className="alg-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>IP</th>
                      <th>Email</th>
                      <th>Failed</th>
                      <th>Block Until</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {states.map((state) => {
                      const status = getStatus(state)

                      return (
                        <tr key={state.id} onClick={() => openDrawer(state, 'states')}>
                          <td><StatusBadge status={status} /></td>
                          <td>{state.ip_address || '-'}</td>
                          <td>{state.attempted_email || state.admin_email || '-'}</td>
                          <td>{state.failed_count || 0}</td>
                          <td>{formatDate(state.blocked_until)}</td>
                          <td className="alg-reason">{state.last_reason || state.permanent_block_reason || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}

          {tab === 'events' ? (
            <div className="alg-table-wrap">
              {loading ? <EmptyState title="Loading events..." text="Please wait while login events load." /> : events.length === 0 ? <EmptyState title="No login events found" text="No admin login events match this search." /> : (
                <table className="alg-table">
                  <thead>
                    <tr>
                      <th>Result</th>
                      <th>Action</th>
                      <th>IP</th>
                      <th>Email</th>
                      <th>Failed</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} onClick={() => openDrawer(event, 'events')}>
                        <td><ResultBadge value={event.result} /></td>
                        <td>{event.action || '-'}</td>
                        <td>{event.ip_address || '-'}</td>
                        <td>{event.attempted_email || event.admin_email || '-'}</td>
                        <td>{event.failed_count || 0}</td>
                        <td>{formatDate(event.occurred_at || event.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}

          {tab === 'devices' ? (
            <div className="alg-table-wrap">
              {loading ? <EmptyState title="Loading trusted devices..." text="Please wait while trusted devices load." /> : devices.length === 0 ? <EmptyState title="No trusted devices" text="Trusted devices are created automatically after successful admin login." /> : (
                <table className="alg-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Admin Email</th>
                      <th>IP</th>
                      <th>Trusted At</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} onClick={() => openDrawer(device, 'devices')}>
                        <td><ResultBadge value={device.is_active ? 'active' : 'revoked'} /></td>
                        <td>{device.admin_email || '-'}</td>
                        <td>{device.ip_address || '-'}</td>
                        <td>{formatDate(device.trusted_at)}</td>
                        <td>{formatDate(device.last_seen_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}

          {tab === 'history' ? (
            <AttackHistoryPanel
              logins={historyLogins}
              signals={historySignals}
              loading={loading}
              message={historyMessage}
              filter={historyFilter}
              setFilter={setHistoryFilter}
              onOpenLogin={(item) => openDrawer(item, 'events')}
            />
          ) : null}

          {tab === 'ips' ? (
            <div>
              <form className="alg-ip-form" onSubmit={handleAddTrustedIp}>
                <input value={trustedIp} onChange={(event) => setTrustedIp(event.target.value)} placeholder="Trusted IP address" />
                <input value={trustedIpLabel} onChange={(event) => setTrustedIpLabel(event.target.value)} placeholder="Label" />
                <button type="submit" disabled={workingKey === 'add-ip'}>Add Trusted IP</button>
              </form>

              <div className="alg-table-wrap">
                {loading ? <EmptyState title="Loading trusted IPs..." text="Please wait while trusted IPs load." /> : ips.length === 0 ? <EmptyState title="No trusted IPs" text="You can add a trusted office or home IP here." /> : (
                  <table className="alg-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>IP</th>
                        <th>Label</th>
                        <th>Trusted At</th>
                        <th>Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ips.map((ip) => (
                        <tr key={ip.id} onClick={() => openDrawer(ip, 'ips')}>
                          <td><ResultBadge value={ip.is_active ? 'active' : 'revoked'} /></td>
                          <td>{ip.ip_address || '-'}</td>
                          <td>{ip.label || '-'}</td>
                          <td>{formatDate(ip.trusted_at)}</td>
                          <td>{formatDate(ip.last_seen_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Drawer
        item={selected}
        type={selectedType}
        onClose={() => setSelected(null)}
        onRelease={handleRelease}
        onPermanentBlock={handlePermanentBlock}
        onUnblock={handleUnblock}
        onRevokeDevice={handleRevokeDevice}
        onRevokeIp={handleRevokeIp}
        workingKey={workingKey}
      />
    </AdminLayout>
  )
}

const styles = `
  .alg-history { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
  .alg-history-intro { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .alg-history-intro h3 { font-size: 19px; font-weight: 950; margin: 0; color: #0F172A; }
  .alg-history-intro p, .alg-history-note { margin: 5px 0 0; font-size: 12px; line-height: 1.6; color: #64748B; }
  .alg-history-count { background: #EEF2FF; color: #4338CA; border-radius: 999px; padding: 7px 11px; font-size: 12px; font-weight: 850; }
  .alg-history-filters { display: flex; gap: 8px; flex-wrap: wrap; }
  .alg-history-filters button { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 13px; border-radius: 999px; color: #475569; font-size: 12px; font-weight: 800; cursor: pointer; }
  .alg-history-filters button.active { color: #4338CA; border-color: #C7D2FE; background: #EEF2FF; }
  .alg-history-note { margin: 0; }
  .alg-history-warning { padding: 10px 12px; border-radius: 12px; border: 1px solid #FDE68A; background: #FFFBEB; color: #92400E; font-size: 12px; }
  .alg-history-list { display: flex; flex-direction: column; gap: 8px; }
  .alg-history-item { border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 14px; overflow: hidden; }
  .alg-history-item-head { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
  .alg-history-item-head:hover { background: #F8FAFC; }
  .alg-history-dot { width: 9px; height: 9px; border-radius: 50%; flex: 0 0 auto; background: #94A3B8; }
  .alg-history-dot.alg-history-medium { background: #D97706; }
  .alg-history-dot.alg-history-high, .alg-history-dot.alg-history-critical { background: #DC2626; }
  .alg-history-item-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .alg-history-item-copy strong { font-size: 13px; font-weight: 850; color: #0F172A; overflow-wrap: anywhere; text-transform: capitalize; }
  .alg-history-item-copy small { font-size: 11px; color: #64748B; overflow-wrap: anywhere; }
  .alg-history-severity { font-size: 10px; text-transform: uppercase; font-weight: 850; color: #64748B; background: #F1F5F9; padding: 5px 8px; border-radius: 999px; }
  .alg-history-severity.alg-history-medium { color: #92400E; background: #FEF3C7; }
  .alg-history-severity.alg-history-high, .alg-history-severity.alg-history-critical { color: #B91C1C; background: #FEE2E2; }
  .alg-history-chevron { font-size: 21px; font-weight: 500; color: #94A3B8; width: 15px; text-align: center; }
  .alg-history-expanded { background: #F8FAFC; padding: 14px; border-top: 1px solid #E2E8F0; }
  .alg-history-more { margin-top: 12px; border: 0; border-radius: 11px; padding: 10px 12px; background: #4F46E5; color: #FFFFFF; font-size: 12px; font-weight: 850; cursor: pointer; }
  @media (max-width: 760px) { .alg-history { padding: 12px; } .alg-history-item-head { gap: 8px; } .alg-history-severity { display: none; } }
  .alg-hero-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .alg-page { display: flex; flex-direction: column; gap: 18px; }
  .alg-hero { border: 1px solid #E2E8F0; border-radius: 22px; padding: 24px; background: linear-gradient(135deg, #FFFFFF, #F8FAFC); box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; }
  .alg-kicker { color: #4F46E5; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 8px; }
  .alg-hero h2 { margin: 0; font-size: 26px; font-weight: 950; color: #0F172A; }
  .alg-hero p { max-width: 700px; margin: 8px 0 0; color: #64748B; line-height: 1.65; font-size: 14px; font-weight: 650; }
  .alg-hero button, .alg-search button, .alg-ip-form button, .alg-drawer-actions button { border: 0; border-radius: 13px; background: #4F46E5; color: #FFFFFF; font-weight: 900; padding: 11px 15px; cursor: pointer; box-shadow: 0 10px 22px rgba(79, 70, 229, 0.18); }
  .alg-hero button:disabled, .alg-ip-form button:disabled, .alg-drawer-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
  .alg-summary-grid { display: grid; grid-template-columns: repeat(6, minmax(140px, 1fr)); gap: 14px; }
  .alg-summary-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 18px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .alg-summary-card.success { border-color: #BBF7D0; background: #F0FDF4; }
  .alg-summary-card.warning { border-color: #FDE68A; background: #FFFBEB; }
  .alg-summary-card.danger { border-color: #FECACA; background: #FEF2F2; }
  .alg-summary-label { color: #64748B; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.75px; }
  .alg-summary-value { margin-top: 9px; font-size: 28px; font-weight: 950; color: #0F172A; }
  .alg-summary-note { margin-top: 6px; color: #64748B; font-size: 12px; font-weight: 750; }
  .alg-error { border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 16px; padding: 13px 15px; font-size: 13px; font-weight: 850; }
  .alg-panel { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 22px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); overflow: hidden; }
  .alg-toolbar { padding: 16px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
  .alg-tabs { display: flex; gap: 7px; flex-wrap: wrap; }
  .alg-tabs button { border: 1px solid #E2E8F0; background: #F8FAFC; color: #64748B; border-radius: 999px; padding: 9px 13px; font-size: 12px; font-weight: 900; cursor: pointer; }
  .alg-tabs button.active { border-color: #C7D2FE; background: #EEF2FF; color: #4F46E5; }
  .alg-search, .alg-ip-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .alg-search input, .alg-search select, .alg-ip-form input { height: 40px; border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 12px; padding: 0 12px; outline: none; color: #0F172A; font-size: 13px; font-weight: 750; }
  .alg-search input { width: 270px; }
  .alg-ip-form { padding: 16px; border-bottom: 1px solid #E2E8F0; }
  .alg-table-wrap { overflow-x: auto; }
  .alg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .alg-table th { text-align: left; color: #64748B; background: #F8FAFC; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.7px; padding: 12px 16px; border-bottom: 1px solid #E2E8F0; }
  .alg-table td { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; color: #334155; font-weight: 750; vertical-align: middle; }
  .alg-table tr { cursor: pointer; }
  .alg-table tbody tr:hover td { background: #FAFBFF; }
  .alg-reason { max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .alg-badge, .alg-result { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 10px; font-size: 11px; font-weight: 950; white-space: nowrap; }
  .alg-badge.allowed, .alg-result.success, .alg-result.active { background: #DCFCE7; color: #15803D; }
  .alg-badge.temporary_block, .alg-badge.one_hour_block, .alg-badge.day_block, .alg-badge.seven_day_block, .alg-result.blocked, .alg-result.failed { background: #FEF2F2; color: #B91C1C; }
  .alg-badge.permanent_block { background: #111827; color: #FFFFFF; }
  .alg-result.released { background: #EEF2FF; color: #4F46E5; }
  .alg-result.revoked, .alg-result.event { background: #F1F5F9; color: #475569; }
  .alg-empty { padding: 55px 20px; text-align: center; }
  .alg-empty div { font-size: 34px; margin-bottom: 9px; }
  .alg-empty h3 { margin: 0; color: #0F172A; font-size: 17px; font-weight: 950; }
  .alg-empty p { margin: 7px auto 0; max-width: 420px; color: #64748B; font-size: 13px; font-weight: 700; line-height: 1.6; }
  .alg-drawer-layer { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.35); z-index: 2000; display: flex; justify-content: flex-end; }
  .alg-drawer { width: min(540px, 100%); height: 100%; overflow-y: auto; background: #FFFFFF; box-shadow: -16px 0 45px rgba(15, 23, 42, 0.22); padding: 24px; }
  .alg-drawer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 16px; }
  .alg-drawer-header h3 { margin: 4px 0 0; color: #0F172A; font-size: 21px; font-weight: 950; word-break: break-word; }
  .alg-drawer-header button { border: 1px solid #E2E8F0; background: #F8FAFC; color: #0F172A; border-radius: 12px; width: 38px; height: 38px; font-size: 24px; cursor: pointer; }
  .alg-drawer-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .alg-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .alg-detail-row { border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; background: #F8FAFC; min-width: 0; }
  .alg-detail-row.wide { grid-column: 1 / -1; }
  .alg-detail-row span { display: block; color: #64748B; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.65px; margin-bottom: 6px; }
  .alg-detail-row strong { display: block; color: #0F172A; font-size: 13px; font-weight: 850; line-height: 1.5; overflow-wrap: anywhere; }
  .alg-drawer-actions { margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; }
  .alg-drawer-actions button.danger { background: #EF4444; box-shadow: 0 10px 22px rgba(239, 68, 68, 0.16); }
  @media (max-width: 1100px) {
    .alg-page { min-width: 0; }
    .alg-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .alg-summary-card { min-width: 0; }
    .alg-table-wrap { overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; }
  }

  @media (max-width: 760px) {
    .alg-page { gap: 14px; }
    .alg-hero, .alg-toolbar { align-items: stretch; flex-direction: column; }
    .alg-hero { min-width: 0; border-radius: 20px; padding: 18px 16px; }
    .alg-hero > div { min-width: 0; }
    .alg-hero h2 { font-size: 23px; overflow-wrap: anywhere; }
    .alg-hero p, .alg-summary-note, .alg-error, .alg-empty p { overflow-wrap: anywhere; word-break: break-word; }
    .alg-hero-actions { width: 100%; flex-direction: column; }
    .alg-hero button { width: 100%; min-height: 42px; }
    .alg-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .alg-summary-card { padding: 15px; }
    .alg-summary-value { font-size: 25px; overflow-wrap: anywhere; }
    .alg-panel { min-width: 0; border-radius: 20px; }
    .alg-toolbar { padding: 14px; }
    .alg-tabs { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
    .alg-tabs::-webkit-scrollbar { display: none; }
    .alg-tabs button { flex: 0 0 auto; white-space: nowrap; }
    .alg-search, .alg-ip-form { align-items: stretch; flex-direction: column; width: 100%; }
    .alg-search input, .alg-search select, .alg-search button, .alg-ip-form input, .alg-ip-form button {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      min-height: 42px;
    }
    .alg-ip-form { padding: 14px; }
    .alg-table { min-width: 760px; }
    .alg-table th, .alg-table td { padding-left: 12px; padding-right: 12px; }
    .alg-table td { overflow-wrap: anywhere; }
    .alg-reason { max-width: 260px; }
    .alg-empty { padding: 42px 16px; }
    .alg-drawer { width: 100%; padding: 18px 16px 28px; }
    .alg-drawer-header > div { min-width: 0; }
    .alg-drawer-header h3 { font-size: 19px; overflow-wrap: anywhere; }
    .alg-drawer-header button { flex-shrink: 0; }
    .alg-detail-grid { grid-template-columns: 1fr; }
    .alg-detail-row.wide { grid-column: auto; }
    .alg-drawer-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .alg-drawer-actions button { width: 100%; min-width: 0; min-height: 42px; }
  }

  @media (max-width: 480px) {
    .alg-summary-grid { grid-template-columns: 1fr; }
    .alg-summary-card { padding: 14px; }
    .alg-drawer-actions { grid-template-columns: 1fr; }
  }
`
