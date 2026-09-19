import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import CriticalCanaryPanel from '../components/CriticalCanaryPanel'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 50

const styles = `
  .kill-page {
    display: grid;
    gap: 18px;
  }

  .kill-panel {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
  }

  .kill-panel-title {
    margin: 0;
    color: #0F172A;
    font-size: 15px;
    font-weight: 950;
  }

  .kill-panel-subtitle {
    margin-top: 5px;
    color: #64748B;
    font-size: 11px;
    font-weight: 750;
  }

  .kill-form {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .kill-field {
    display: grid;
    gap: 6px;
  }

  .kill-field.span-2 { grid-column: span 2; }
  .kill-field.span-3 { grid-column: span 3; }
  .kill-field.span-4 { grid-column: span 4; }
  .kill-field.span-6 { grid-column: span 6; }
  .kill-field.span-12 { grid-column: span 12; }

  .kill-label {
    color: #64748B;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .kill-input,
  .kill-select {
    min-height: 40px;
    width: 100%;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    outline: none;
  }

  .kill-input:focus,
  .kill-select:focus {
    border-color: #818CF8;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .10);
  }

  .kill-submit {
    min-height: 42px;
    border: 0;
    border-radius: 13px;
    background: #DC2626;
    color: #FFFFFF;
    padding: 0 16px;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .kill-submit:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  .kill-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .kill-tabs,
  .kill-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .kill-tab,
  .kill-filter,
  .kill-refresh,
  .kill-page-button {
    min-height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 13px;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
  }

  .kill-tab,
  .kill-refresh,
  .kill-page-button {
    cursor: pointer;
  }

  .kill-tab.active {
    border-color: #C7D2FE;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .kill-refresh:disabled,
  .kill-page-button:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  .kill-summary {
    padding: 14px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .kill-summary strong {
    color: #DC2626;
  }

  .kill-list {
    display: grid;
    gap: 12px;
  }

  .kill-card {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: start;
    padding: 17px;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, .04);
  }

  .kill-state {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 950;
  }

  .kill-state.on {
    background: #DC2626;
  }

  .kill-state.off {
    background: #64748B;
  }

  .kill-main {
    min-width: 0;
  }

  .kill-path {
    margin: 0;
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .kill-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .kill-badge {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 5px 8px;
    font-size: 10px;
    font-weight: 900;
  }

  .kill-badge.on {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .kill-badge.off {
    background: #F1F5F9;
    color: #64748B;
  }

  .kill-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
    gap: 9px;
    margin-top: 13px;
  }

  .kill-meta-item {
    padding: 10px 11px;
    border-radius: 12px;
    background: #F8FAFC;
  }

  .kill-meta-label {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .kill-meta-value {
    margin-top: 4px;
    color: #334155;
    font-size: 11px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .kill-toggle {
    min-width: 76px;
    min-height: 38px;
    border: 0;
    border-radius: 12px;
    padding: 0 13px;
    font: inherit;
    font-size: 11px;
    font-weight: 950;
    cursor: pointer;
  }

  .kill-toggle.turn-off {
    background: #111827;
    color: #FFFFFF;
  }

  .kill-toggle.turn-on {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .kill-toggle:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  .kill-empty,
  .kill-error,
  .kill-success {
    padding: 16px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 850;
  }

  .kill-empty {
    padding: 40px 20px;
    border: 1px dashed #CBD5E1;
    background: #FFFFFF;
    color: #64748B;
    text-align: center;
  }

  .kill-error {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .kill-success {
    border: 1px solid #BBF7D0;
    background: #F0FDF4;
    color: #166534;
  }

  .kill-pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .kill-page-number {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
  }

  @media (max-width: 820px) {
    .kill-field.span-2,
    .kill-field.span-3,
    .kill-field.span-4,
    .kill-field.span-6 {
      grid-column: span 6;
    }

    .kill-card {
      grid-template-columns: 44px minmax(0, 1fr);
    }

    .kill-card > .kill-toggle {
      grid-column: 1 / -1;
      width: 100%;
    }
  }

  @media (max-width: 560px) {
    .kill-field.span-2,
    .kill-field.span-3,
    .kill-field.span-4,
    .kill-field.span-6,
    .kill-field.span-12 {
      grid-column: span 12;
    }

    .kill-toolbar,
    .kill-actions {
      align-items: stretch;
    }

    .kill-filter,
    .kill-refresh {
      flex: 1;
    }
  }
`

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString()
}

function toIsoOrNull(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

function buildPayload(record, enabled) {
  return {
    target_type: record.target_type,
    source: record.source,
    method: record.target_type === 'api' ? record.method : null,
    path: record.path,
    enabled,
    mode: record.mode || 'manual',
    reason: record.reason || '',
    incident_id: record.incident_id || null,
    expires_at: enabled ? record.expires_at || null : null,
  }
}

export default function AdminKillSwitchPage() {
  const [status, setStatus] = useState('all')
  const [source, setSource] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [switches, setSwitches] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    has_more: false,
  })
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    target_type: 'api',
    source: 'WEB',
    method: 'GET',
    path: '',
    mode: 'manual',
    reason: '',
    expires_at: '',
  })

  const formMethodRequired = form.target_type === 'api'

  const canCreate = useMemo(() => {
    if (!form.path.trim().startsWith('/')) return false
    if (formMethodRequired && !form.method) return false
    return true
  }, [form.path, form.method, formMethodRequired])

  const loadSwitches = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    const params = new URLSearchParams({
      status,
      page: String(page),
      limit: String(PAGE_SIZE),
    })

    if (source) params.set('source', source)
    if (targetTypeFilter) params.set('target_type', targetTypeFilter)

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/admin/work/kill-switches?${params.toString()}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Kill Switch records')
      }

      setSwitches(Array.isArray(data.switches) ? data.switches : [])
      setActiveCount(Number(data.active_count || 0))
      setPagination({
        page: Number(data.pagination?.page || page),
        limit: Number(data.pagination?.limit || PAGE_SIZE),
        total: Number(data.pagination?.total || 0),
        has_more: Boolean(data.pagination?.has_more),
      })
    } catch (loadError) {
      setSwitches([])
      setError(loadError?.message || 'Failed to load Kill Switch records')
    } finally {
      setLoading(false)
    }
  }, [page, source, status, targetTypeFilter])

  useEffect(() => {
    loadSwitches()
  }, [loadSwitches])

  async function saveSwitch(payload, id = '') {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return false
    }

    try {
      if (id) {
        setSavingId(id)
      } else {
        setCreating(true)
      }

      setError('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/work/kill-switches`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update Kill Switch')
      }

      return true
    } catch (saveError) {
      setError(saveError?.message || 'Failed to update Kill Switch')
      return false
    } finally {
      setSavingId('')
      setCreating(false)
    }
  }

  async function createSwitch(event) {
    event.preventDefault()

    if (!canCreate) return

    const ok = await saveSwitch({
      target_type: form.target_type,
      source: form.source,
      method: form.target_type === 'api' ? form.method : null,
      path: form.path.trim(),
      enabled: true,
      mode: form.mode,
      reason: form.reason.trim(),
      incident_id: null,
      expires_at: toIsoOrNull(form.expires_at),
    })

    if (!ok) return

    setSuccess('Kill Switch enabled.')
    setForm((current) => ({
      ...current,
      path: '',
      reason: '',
      expires_at: '',
    }))
    setStatus('all')
    setPage(1)
    await loadSwitches()
  }

  async function toggleSwitch(record) {
    const nextEnabled = !record.enabled
    const ok = await saveSwitch(
      buildPayload(record, nextEnabled),
      record.id
    )

    if (!ok) return

    setSuccess(
      nextEnabled
        ? 'Kill Switch enabled.'
        : 'Kill Switch disabled.'
    )
    await loadSwitches()
  }

  function changeStatus(nextStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  return (
    <AdminLayout
      title="Kill Switch"
      subtitle="Emergency circuit control for exact Shadow API endpoints and pages."
    >
      <style>{styles}</style>

      <div className="kill-page">
        <section className="kill-panel">
          <h2 className="kill-panel-title">Create Kill Switch</h2>
          <div className="kill-panel-subtitle">
            Blocks only the exact API pattern or page path you choose.
          </div>

          <form className="kill-form" onSubmit={createSwitch}>
            <label className="kill-field span-2">
              <span className="kill-label">Target</span>
              <select
                className="kill-select"
                value={form.target_type}
                onChange={(event) => {
                  const targetType = event.target.value
                  setForm((current) => ({
                    ...current,
                    target_type: targetType,
                    method: targetType === 'api' ? current.method || 'GET' : '',
                  }))
                }}
              >
                <option value="api">API</option>
                <option value="page">Page</option>
              </select>
            </label>

            <label className="kill-field span-2">
              <span className="kill-label">Source</span>
              <select
                className="kill-select"
                value={form.source}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }}
              >
                <option value="WEB">WEB</option>
                <option value="ADMIN">ADMIN</option>
                <option value="BACKEND">BACKEND</option>
                <option value="ALL">ALL</option>
              </select>
            </label>

            <label className="kill-field span-2">
              <span className="kill-label">Method</span>
              <select
                className="kill-select"
                value={form.method}
                disabled={!formMethodRequired}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    method: event.target.value,
                  }))
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>

            <label className="kill-field span-2">
              <span className="kill-label">Mode</span>
              <select
                className="kill-select"
                value={form.mode}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    mode: event.target.value,
                  }))
                }}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </label>

            <label className="kill-field span-4">
              <span className="kill-label">Expires</span>
              <input
                className="kill-input"
                type="datetime-local"
                value={form.expires_at}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    expires_at: event.target.value,
                  }))
                }}
              />
            </label>

            <label className="kill-field span-6">
              <span className="kill-label">Path</span>
              <input
                className="kill-input"
                type="text"
                value={form.path}
                placeholder="/api/stories/:id"
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    path: event.target.value,
                  }))
                }}
              />
            </label>

            <label className="kill-field span-6">
              <span className="kill-label">Reason</span>
              <input
                className="kill-input"
                type="text"
                value={form.reason}
                placeholder="Request loop / maintenance"
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }}
              />
            </label>

            <div className="kill-field span-12">
              <button
                type="submit"
                className="kill-submit"
                disabled={!canCreate || creating}
              >
                {creating ? 'Enabling…' : 'Enable Kill Switch'}
              </button>
            </div>
          </form>
        </section>

        {error ? <div className="kill-error">{error}</div> : null}
        {success ? <div className="kill-success">{success}</div> : null}

        <div className="kill-toolbar">
          <div className="kill-tabs">
            {[
              ['all', 'All'],
              ['active', 'ON'],
              ['inactive', 'OFF'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`kill-tab ${status === key ? 'active' : ''}`}
                onClick={() => changeStatus(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="kill-actions">
            <select
              className="kill-filter"
              value={source}
              onChange={(event) => {
                setSource(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Sources</option>
              <option value="WEB">WEB</option>
              <option value="ADMIN">ADMIN</option>
              <option value="BACKEND">BACKEND</option>
              <option value="ALL">ALL</option>
            </select>

            <select
              className="kill-filter"
              value={targetTypeFilter}
              onChange={(event) => {
                setTargetTypeFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Targets</option>
              <option value="api">API</option>
              <option value="page">Page</option>
            </select>

            <button
              type="button"
              className="kill-refresh"
              disabled={loading}
              onClick={loadSwitches}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="kill-summary">
          <strong>{activeCount} active</strong> · {pagination.total} record
          {pagination.total === 1 ? '' : 's'} · Page {pagination.page}
        </div>

        {!error && !loading && switches.length === 0 ? (
          <div className="kill-empty">
            No Kill Switch record in this filter.
          </div>
        ) : null}

        <div className="kill-list">
          {switches.map((record) => (
            <article className="kill-card" key={record.id}>
              <div className={`kill-state ${record.enabled ? 'on' : 'off'}`}>
                {record.enabled ? 'ON' : 'OFF'}
              </div>

              <div className="kill-main">
                <h2 className="kill-path">
                  {record.target_type === 'api' ? `${record.method} ` : ''}
                  {record.path}
                </h2>

                <div className="kill-badges">
                  <span className={`kill-badge ${record.enabled ? 'on' : 'off'}`}>
                    {record.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <span className="kill-badge">{record.target_type}</span>
                  <span className="kill-badge">{record.source}</span>
                  <span className="kill-badge">{record.mode}</span>
                </div>

                <div className="kill-meta">
                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Reason</div>
                    <div className="kill-meta-value">
                      {record.reason || '—'}
                    </div>
                  </div>

                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Activated</div>
                    <div className="kill-meta-value">
                      {formatDate(record.activated_at)}
                    </div>
                  </div>

                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Expires</div>
                    <div className="kill-meta-value">
                      {formatDate(record.expires_at)}
                    </div>
                  </div>

                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Blocked</div>
                    <div className="kill-meta-value">
                      {Number(record.blocked_requests || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Last Triggered</div>
                    <div className="kill-meta-value">
                      {formatDate(record.last_triggered_at)}
                    </div>
                  </div>

                  <div className="kill-meta-item">
                    <div className="kill-meta-label">Activations</div>
                    <div className="kill-meta-value">
                      {Number(record.activation_count || 0)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`kill-toggle ${record.enabled ? 'turn-off' : 'turn-on'}`}
                disabled={savingId === record.id}
                onClick={() => toggleSwitch(record)}
              >
                {savingId === record.id
                  ? 'Saving…'
                  : record.enabled
                    ? 'Turn OFF'
                    : 'Turn ON'}
              </button>
            </article>
          ))}
        </div>

        <div className="kill-pagination">
          <button
            type="button"
            className="kill-page-button"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>

          <span className="kill-page-number">
            Page {pagination.page}
          </span>

          <button
            type="button"
            className="kill-page-button"
            disabled={loading || !pagination.has_more}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
