import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import './AdminChatEvidencePage.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://shadow-backend-kucw.onrender.com')

const STATES = [
  ['active', 'Active Retention'],
  ['legal_hold', 'Legal Hold'],
  ['expired', 'Expired'],
  ['purged', 'Purged'],
  ['all', 'All Evidence'],
]

const TYPES = [
  ['all', 'All Types'],
  ['conversation', 'Conversations'],
  ['message', 'Messages'],
]

const SCOPES = [
  ['all', 'All Delete Scopes'],
  ['for_me', 'Delete For Me'],
  ['for_both', 'Delete For Both'],
  ['for_everyone', 'Delete For Everyone'],
]

const REPORT_STATUSES = [
  ['pending', 'Pending'],
  ['reviewing', 'Reviewing'],
  ['resolved', 'Resolved'],
  ['dismissed', 'Dismissed'],
]

const ICONS = {
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5',
  search: 'M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
  refresh: 'M20 11a8 8 0 0 0-15.5-2M4 4v5h5 M4 13a8 8 0 0 0 15.5 2M20 20v-5h-5',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  unlock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 7.5-2',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v6 M14 11v6',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  copy: 'M8 8h11v11H8z M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1',
  close: 'M18 6L6 18 M6 6l12 12',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  flag: 'M4 21V5m0 0h11l-1 4 1 4H4 M4 5V3',
  alert: 'M10.3 2.8 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.8a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  pin: 'M12 17v5 M5 12h14 M7 3h10l-1 5 3 4H5l3-4-1-5z',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z',
}

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] || ICONS.shield} />
    </svg>
  )
}

class EvidenceApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'EvidenceApiError'
    this.status = status
    this.code = code
  }
}

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function getAdminActor() {
  try {
    const user = JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
        localStorage.getItem('shadow_admin_user') ||
        '{}'
    )

    return (
      user.email ||
      user.username ||
      user.name ||
      user.full_name ||
      'Admin'
    )
  } catch {
    return 'Admin'
  }
}

async function evidenceRequest(path, options = {}) {
  const token = getAdminToken()

  if (!token) {
    throw new EvidenceApiError(
      401,
      'ADMIN_LOGIN_REQUIRED',
      'Admin login is required'
    )
  }

  const actor = getAdminActor()
  const response = await fetch(
    `${API_URL}/api/admin/chat-evidence${path}`,
    {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Admin-Actor': actor,
        'X-Admin-Name': actor,
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(options.body
        ? { body: JSON.stringify(options.body) }
        : {}),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new EvidenceApiError(
      response.status,
      data.code || 'CHAT_EVIDENCE_REQUEST_FAILED',
      data.message || data.error || 'Chat evidence request failed'
    )
  }

  return data
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function formatExpiry(value) {
  if (!value) return 'No expiry date'
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return 'Invalid expiry date'
  const difference = time - Date.now()
  const days = Math.ceil(Math.abs(difference) / 86400000)
  return difference <= 0
    ? `Expired ${days} day${days === 1 ? '' : 's'} ago`
    : `${days} day${days === 1 ? '' : 's'} remaining`
}

function shortId(value) {
  const text = String(value || '')
  return text.length > 18
    ? `${text.slice(0, 8)}…${text.slice(-6)}`
    : text || '-'
}

function label(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function userLabel(user) {
  if (!user) return 'Unknown User'
  const name = user.name || user.username || user.email || 'Unknown User'
  return user.username ? `${name} (@${user.username})` : name
}

async function copyText(value) {
  const text = String(value || '')
  if (!text) return

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function Badge({ kind = 'state', value }) {
  return (
    <span className={`ace-badge ${kind}-${value || 'active'}`}>
      {label(value)}
    </span>
  )
}

function Empty({ title, text }) {
  return (
    <div className="ace-empty">
      <div><Icon name="shield" size={28} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function ReasonModal({ dialog, reason, busy, onChange, onClose, onConfirm }) {
  if (!dialog) return null

  return (
    <div className="ace-overlay ace-reason-layer">
      <button
        type="button"
        className="ace-backdrop"
        aria-label="Close dialog"
        onClick={busy ? undefined : onClose}
      />
      <section className="ace-reason-modal" role="dialog" aria-modal="true">
        <div className={`ace-reason-icon ${dialog.danger ? 'danger' : ''}`}>
          <Icon
            name={
              dialog.type === 'purge'
                ? 'trash'
                : dialog.type === 'release'
                  ? 'unlock'
                  : dialog.type === 'hold'
                    ? 'lock'
                    : 'eye'
            }
            size={24}
          />
        </div>
        <h2>{dialog.title}</h2>
        <p>{dialog.description}</p>
        <label className="ace-field">
          <span>Reason</span>
          <textarea
            rows="4"
            value={reason}
            onChange={(event) => onChange(event.target.value.slice(0, 500))}
            placeholder="Enter a clear reason for the audit log…"
            autoFocus
            disabled={busy}
          />
          <small>{reason.trim().length}/500</small>
        </label>
        <div className="ace-modal-actions">
          <button type="button" className="ace-btn secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`ace-btn ${dialog.danger ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={busy || reason.trim().length < 5}
          >
            {busy ? <span className="ace-spinner small" /> : null}
            {dialog.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

function ReportEditor({ report, saving, onSave }) {
  const [status, setStatus] = useState(report.status || 'pending')
  const [note, setNote] = useState(report.resolution_note || '')

  useEffect(() => {
    setStatus(report.status || 'pending')
    setNote(report.resolution_note || '')
  }, [report.id, report.status, report.resolution_note])

  const changed =
    status !== report.status ||
    note.trim() !== String(report.resolution_note || '').trim()

  return (
    <article className="ace-report-card">
      <div className="ace-report-head">
        <div>
          <strong><Icon name="flag" size={16} /> {label(report.reason)}</strong>
          <span>Reported {formatDate(report.created_at)}</span>
        </div>
        <Badge kind="report" value={report.status} />
      </div>

      <div className="ace-report-grid">
        <div><span>Reporter</span><strong>{userLabel(report.reporter)}</strong></div>
        <div><span>Reported account</span><strong>{userLabel(report.reported_user)}</strong></div>
        <div><span>Message ID</span><strong title={report.message_id}>{shortId(report.message_id)}</strong></div>
        <div><span>Reviewed</span><strong>{formatDate(report.reviewed_at)}</strong></div>
      </div>

      {report.details ? <p className="ace-report-details">{report.details}</p> : null}

      <div className="ace-report-editor">
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
            {REPORT_STATUSES.map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Resolution note</span>
          <textarea
            rows="3"
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 2000))}
            placeholder="Optional internal review note…"
            disabled={saving}
          />
        </label>
        <button
          type="button"
          className="ace-btn primary"
          disabled={!changed || saving}
          onClick={() => onSave(report.id, status, note)}
        >
          {saving ? <span className="ace-spinner small" /> : null}
          Save Review
        </button>
      </div>
    </article>
  )
}

function EvidenceDetail({
  detail,
  tab,
  busy,
  savingReportId,
  onTab,
  onClose,
  onCopy,
  onSetHold,
  onReleaseHold,
  onSaveReport,
}) {
  if (!detail) return null

  const conversation = detail.conversation || {}
  const participants = detail.participants || []
  const messages = detail.messages || []
  const reports = detail.reports || []
  const retention = detail.retention_records || []
  const logs = detail.access_logs || []
  const holdActive = Boolean(
    conversation.legal_hold_at && !conversation.legal_hold_released_at
  )

  const tabs = [
    ['messages', 'Messages', messages.length],
    ['reports', 'Reports', reports.length],
    ['retention', 'Retention', retention.length],
    ['access', 'Access Logs', logs.length],
  ]

  return (
    <div className="ace-overlay ace-detail-layer">
      <button type="button" className="ace-backdrop" aria-label="Close evidence" onClick={onClose} />
      <section className="ace-detail" role="dialog" aria-modal="true">
        <header className="ace-detail-header">
          <div className="ace-detail-title">
            <div><Icon name="shield" size={22} /></div>
            <section>
              <h2>Chat Evidence</h2>
              <button type="button" onClick={() => onCopy(conversation.id)} title={conversation.id}>
                {shortId(conversation.id)} <Icon name="copy" size={13} />
              </button>
            </section>
          </div>
          <div className="ace-detail-actions">
            {holdActive ? (
              <button type="button" className="ace-btn warning" onClick={onReleaseHold} disabled={busy}>
                <Icon name="unlock" size={16} /> Release Hold
              </button>
            ) : (
              <button type="button" className="ace-btn primary" onClick={onSetHold} disabled={busy}>
                <Icon name="lock" size={16} /> Set Legal Hold
              </button>
            )}
            <button type="button" className="ace-icon-btn" onClick={onClose} disabled={busy} aria-label="Close evidence">
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <div className="ace-detail-scroll">
          <section className="ace-overview">
            <div className="ace-overview-grid">
              <div><span>Conversation</span><strong>{label(conversation.conversation_type)}</strong></div>
              <div><span>Request status</span><strong>{label(conversation.request_status)}</strong></div>
              <div><span>Messages</span><strong>{detail.message_count || 0}</strong></div>
              <div><span>Reports</span><strong>{reports.length}</strong></div>
              <div><span>Created</span><strong>{formatDate(conversation.created_at)}</strong></div>
              <div><span>Last message</span><strong>{formatDate(conversation.last_message_at)}</strong></div>
            </div>

            {holdActive ? (
              <div className="ace-hold-banner">
                <Icon name="lock" size={18} />
                <div>
                  <strong>Legal Hold Active</strong>
                  <span>{conversation.legal_hold_reason || 'Evidence is protected from purge.'}</span>
                </div>
              </div>
            ) : null}

            {detail.messages_truncated ? (
              <div className="ace-info-banner">
                <Icon name="alert" size={18} />
                Showing {detail.message_limit} of {detail.message_count} messages.
              </div>
            ) : null}

            <h3>Participants</h3>
            <div className="ace-participants">
              {participants.map((participant) => (
                <article key={participant.id}>
                  <div className="ace-avatar">
                    {participant.user?.avatar_url ? (
                      <img src={participant.user.avatar_url} alt="" />
                    ) : (
                      String(participant.user?.name || participant.user?.username || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <strong>{userLabel(participant.user)}</strong>
                    <span>{label(participant.participant_role)}</span>
                  </div>
                  <Badge kind="state" value={participant.deleted_at ? 'expired' : 'active'} />
                </article>
              ))}
            </div>

            {detail.author_page ? (
              <div className="ace-page-row">
                <Icon name="shield" size={17} />
                <span>Author Page</span>
                <strong>
                  {detail.author_page.page_name ||
                    detail.author_page.page_username ||
                    detail.author_page.page_slug}
                </strong>
              </div>
            ) : null}
          </section>

          <nav className="ace-tabs">
            {tabs.map(([value, text, count]) => (
              <button
                type="button"
                key={value}
                className={tab === value ? 'active' : ''}
                onClick={() => onTab(value)}
              >
                {text}<span>{count}</span>
              </button>
            ))}
          </nav>

          <section className="ace-tab-content">
            {tab === 'messages' ? (
              messages.length ? (
                <div className="ace-message-list">
                  {messages.map((message) => (
                    <article key={message.id} className={`ace-message ${message.deleted_at ? 'deleted' : ''}`}>
                      <div className="ace-message-head">
                        <div>
                          <strong>{userLabel(message.sender)}</strong>
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                        <div>
                          {message.is_pinned ? <span><Icon name="pin" size={12} />Pinned</span> : null}
                          {message.edited_at ? <span><Icon name="edit" size={12} />Edited</span> : null}
                          {message.deleted_at ? <span className="danger">Deleted</span> : null}
                        </div>
                      </div>

                      {message.forwarded_from ? (
                        <small className="ace-forwarded">Forwarded from {userLabel(message.forwarded_from)}</small>
                      ) : null}

                      <p>{message.body || (message.deleted_at ? 'Deleted message content is unavailable.' : 'No message text')}</p>

                      <footer>
                        <button type="button" onClick={() => onCopy(message.id)} title={message.id}>
                          ID: {shortId(message.id)} <Icon name="copy" size={12} />
                        </button>
                        <span>Type: {label(message.message_type)}</span>
                        {message.edit_history?.length ? <span>Edit versions: {message.edit_history.length}</span> : null}
                      </footer>

                      {message.edit_history?.length ? (
                        <details className="ace-edit-history">
                          <summary>View edit history</summary>
                          {message.edit_history.map((version) => (
                            <div key={version.id}>
                              <small>{formatDate(version.edited_at)}</small>
                              <p>{version.old_body}</p>
                              <strong>Changed to</strong>
                              <p>{version.new_body}</p>
                            </div>
                          ))}
                        </details>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="No messages available" text="No retained messages were returned for this conversation." />
              )
            ) : null}

            {tab === 'reports' ? (
              reports.length ? (
                <div className="ace-report-list">
                  {reports.map((report) => (
                    <ReportEditor
                      key={report.id}
                      report={report}
                      saving={savingReportId === report.id}
                      onSave={onSaveReport}
                    />
                  ))}
                </div>
              ) : (
                <Empty title="No message reports" text="This conversation has no submitted message reports." />
              )
            ) : null}

            {tab === 'retention' ? (
              retention.length ? (
                <div className="ace-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Scope</th>
                        <th>Deleted By</th>
                        <th>Deleted At</th>
                        <th>Retention Until</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retention.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <strong>{label(record.resource_type)}</strong>
                            <small title={record.message_id || record.conversation_id}>
                              {shortId(record.message_id || record.conversation_id)}
                            </small>
                          </td>
                          <td><Badge kind="scope" value={record.delete_scope} /></td>
                          <td>{userLabel(record.deleted_by)}</td>
                          <td>{formatDate(record.deleted_at)}</td>
                          <td>
                            <strong>{formatDate(record.retention_until)}</strong>
                            <small>{formatExpiry(record.retention_until)}</small>
                          </td>
                          <td><Badge kind="state" value={record.evidence_state} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty title="No retention records" text="No deletion or retention event is available for this conversation." />
              )
            ) : null}

            {tab === 'access' ? (
              logs.length ? (
                <div className="ace-access-list">
                  {logs.map((log) => (
                    <article key={log.id}>
                      <div><Icon name="eye" size={17} /></div>
                      <section>
                        <strong>{label(log.action)}</strong>
                        <span>{log.reason}</span>
                        <small>{log.admin_id} · {formatDate(log.created_at)}</small>
                      </section>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="No access logs" text="No previous Admin evidence access was recorded." />
              )
            ) : null}
          </section>
        </div>
      </section>
    </div>
  )
}

export default function AdminChatEvidencePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [records, setRecords] = useState([])
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [filters, setFilters] = useState({
    state: 'active',
    resourceType: 'all',
    deleteScope: 'all',
    search: '',
  })
  const [draftSearch, setDraftSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('messages')
  const [dialog, setDialog] = useState(null)
  const [reason, setReason] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [savingReportId, setSavingReportId] = useState('')
  const [notice, setNotice] = useState('')

  const handleError = useCallback(
    (requestError) => {
      if (requestError?.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      setError(requestError?.message || 'Failed to load chat evidence')
    },
    [navigate]
  )

  const loadStats = useCallback(async () => {
    const data = await evidenceRequest('/stats')
    setStats(data.stats || null)
  }, [])

  const loadRecords = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '25',
        state: filters.state,
        resource_type: filters.resourceType,
        delete_scope: filters.deleteScope,
      })

      if (filters.search) query.set('search', filters.search)

      const data = await evidenceRequest(`?${query.toString()}`)
      setRecords(Array.isArray(data.records) ? data.records : [])
      setPageInfo({
        page: Number(data.page || page),
        total: Number(data.total || 0),
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
      setError('')
    } catch (requestError) {
      handleError(requestError)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, handleError, page])

  const refreshAll = useCallback(async ({ silent = true } = {}) => {
    try {
      await Promise.all([loadStats(), loadRecords({ silent })])
    } catch (requestError) {
      handleError(requestError)
    }
  }, [handleError, loadRecords, loadStats])

  useEffect(() => {
    refreshAll({ silent: false })
  }, [refreshAll])

  useEffect(() => {
    setPage(1)
  }, [filters.state, filters.resourceType, filters.deleteScope, filters.search])

  const cards = useMemo(() => [
    ['active', 'Active Retention', stats?.states?.active || 0, `${stats?.retention_days || 90}-day evidence window`],
    ['legal_hold', 'Legal Hold', stats?.states?.legal_hold || 0, 'Protected from purge'],
    ['expired', 'Expired', stats?.states?.expired || 0, 'Waiting for cleanup'],
    ['purged', 'Purged Records', stats?.states?.purged || 0, 'Content removed'],
    ['all', 'Open Reports', stats?.reports?.open || 0, `${stats?.reports?.total || 0} total reports`],
  ], [stats])

  const openDialog = useCallback((nextDialog) => {
    setDialog(nextDialog)
    setReason('')
    setError('')
  }, [])

  const closeDialog = useCallback(() => {
    if (actionBusy) return
    setDialog(null)
    setReason('')
  }, [actionBusy])

  const loadDetail = useCallback(async (conversationId, accessReason) => {
    const query = new URLSearchParams({
      reason: accessReason,
      message_limit: '1000',
    })
    const data = await evidenceRequest(
      `/${encodeURIComponent(conversationId)}?${query.toString()}`
    )
    setDetail(data.evidence || null)
    setTab('messages')
    setError('')
  }, [])

  const submitDialog = useCallback(async () => {
    if (!dialog || actionBusy || reason.trim().length < 5) return
    setActionBusy(true)

    try {
      if (dialog.type === 'open') {
        await loadDetail(dialog.conversationId, reason.trim())
      }

      if (dialog.type === 'hold') {
        await evidenceRequest(`/${encodeURIComponent(dialog.conversationId)}/legal-hold`, {
          method: 'PATCH',
          body: { reason: reason.trim() },
        })
        await loadDetail(dialog.conversationId, 'Refresh after setting legal hold')
        await refreshAll()
      }

      if (dialog.type === 'release') {
        await evidenceRequest(`/${encodeURIComponent(dialog.conversationId)}/legal-hold`, {
          method: 'DELETE',
          body: { reason: reason.trim() },
        })
        await loadDetail(dialog.conversationId, 'Refresh after releasing legal hold')
        await refreshAll()
      }

      if (dialog.type === 'purge') {
        await evidenceRequest('/purge', {
          method: 'POST',
          body: { reason: reason.trim() },
        })
        setDetail(null)
        await refreshAll()
      }

      setDialog(null)
      setReason('')
    } catch (requestError) {
      handleError(requestError)
    } finally {
      setActionBusy(false)
    }
  }, [actionBusy, dialog, handleError, loadDetail, reason, refreshAll])

  const saveReport = useCallback(async (reportId, status, note) => {
    if (savingReportId) return
    setSavingReportId(reportId)

    try {
      await evidenceRequest(`/reports/${encodeURIComponent(reportId)}`, {
        method: 'PATCH',
        body: {
          status,
          resolution_note: note,
          reason: 'Review message report in Chat Evidence',
        },
      })

      if (detail?.conversation?.id) {
        await loadDetail(detail.conversation.id, 'Refresh after reviewing message report')
      }
      await refreshAll()
    } catch (requestError) {
      handleError(requestError)
    } finally {
      setSavingReportId('')
    }
  }, [detail?.conversation?.id, handleError, loadDetail, refreshAll, savingReportId])

  const handleCopy = useCallback(async (value) => {
    try {
      await copyText(value)
      setNotice('Copied')
      window.setTimeout(() => setNotice(''), 1400)
    } catch {
      setNotice('Copy failed')
    }
  }, [])

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, search: draftSearch.trim() }))
  }

  return (
    <AdminLayout
      title="Chat Evidence"
      subtitle="Review deleted chat evidence, message reports, legal holds, and Admin access logs."
    >
      <div className="ace-page">
        <div className="ace-toolbar">
          <div>
            <h2>90-Day Chat Retention</h2>
            <p>Deleted chat evidence stays available to authorized Admins until retention expires, unless a Legal Hold protects it.</p>
          </div>
          <section>
            <button type="button" className="ace-btn secondary" onClick={() => refreshAll({ silent: true })} disabled={refreshing || loading}>
              {refreshing ? <span className="ace-spinner small" /> : <Icon name="refresh" size={16} />}
              Refresh
            </button>
            <button
              type="button"
              className="ace-btn danger"
              onClick={() => openDialog({
                type: 'purge',
                title: 'Run Retention Cleanup',
                description: 'This permanently removes expired evidence that is not protected by a Legal Hold or an open report.',
                confirmLabel: 'Run Cleanup',
                danger: true,
              })}
            >
              <Icon name="trash" size={16} /> Purge Expired
            </button>
          </section>
        </div>

        <section className="ace-stats">
          {cards.map(([state, text, value, note]) => (
            <button
              type="button"
              key={text}
              className={filters.state === state ? 'active' : ''}
              onClick={() => setFilters((current) => ({ ...current, state }))}
            >
              <span>{text}</span><strong>{value}</strong><small>{note}</small>
            </button>
          ))}
        </section>

        <form className="ace-filters" onSubmit={submitSearch}>
          <div className="ace-search">
            <Icon name="search" size={17} />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Conversation, message, or user UUID"
            />
          </div>
          <select value={filters.state} onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}>
            {STATES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
          <select value={filters.resourceType} onChange={(event) => setFilters((current) => ({ ...current, resourceType: event.target.value }))}>
            {TYPES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
          <select value={filters.deleteScope} onChange={(event) => setFilters((current) => ({ ...current, deleteScope: event.target.value }))}>
            {SCOPES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
          <button type="submit" className="ace-btn primary"><Icon name="search" size={16} /> Search</button>
        </form>

        {error ? (
          <button type="button" className="ace-alert" onClick={() => setError('')}>
            <Icon name="alert" size={17} /> {error}
          </button>
        ) : null}

        {loading ? (
          <div className="ace-loading"><span className="ace-spinner" /> Loading chat evidence…</div>
        ) : records.length ? (
          <>
            <section className="ace-list">
              {records.map((record) => {
                const names = (record.participants || [])
                  .map((participant) => userLabel(participant.user))
                  .join(' ↔ ')

                return (
                  <article key={record.id} className="ace-record">
                    <div className="ace-record-main">
                      <header>
                        <strong>{label(record.resource_type)} Evidence</strong>
                        <Badge kind="state" value={record.evidence_state} />
                        {record.reports?.open ? <Badge kind="report" value="pending" /> : null}
                      </header>
                      <button type="button" onClick={() => handleCopy(record.conversation_id)} title={record.conversation_id}>
                        {shortId(record.conversation_id)} <Icon name="copy" size={12} />
                      </button>
                      <p>{names || record.author_page?.page_name || label(record.conversation?.conversation_type)}</p>
                    </div>
                    <div className="ace-record-cell"><span>Delete Scope</span><Badge kind="scope" value={record.delete_scope} /></div>
                    <div className="ace-record-cell"><span>Deleted</span><strong>{formatDate(record.deleted_at)}</strong><small>By {userLabel(record.deleted_by)}</small></div>
                    <div className="ace-record-cell"><span>Retention</span><strong>{formatDate(record.retention_until)}</strong><small>{formatExpiry(record.retention_until)}</small></div>
                    <button
                      type="button"
                      className="ace-btn primary"
                      disabled={record.evidence_state === 'purged'}
                      onClick={() => openDialog({
                        type: 'open',
                        conversationId: record.conversation_id,
                        title: 'Open Chat Evidence',
                        description: 'Your reason, Admin identity, IP address, and device will be saved in the access log.',
                        confirmLabel: 'Open Evidence',
                        danger: false,
                      })}
                    >
                      <Icon name="eye" size={16} /> {record.evidence_state === 'purged' ? 'Purged' : 'Open'}
                    </button>
                  </article>
                )
              })}
            </section>

            <footer className="ace-pagination">
              <p>Page {pageInfo.page} of {pageInfo.total_pages} · {pageInfo.total} records</p>
              <div>
                <button type="button" className="ace-btn secondary" disabled={!pageInfo.has_prev} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  <Icon name="left" size={16} /> Previous
                </button>
                <button type="button" className="ace-btn secondary" disabled={!pageInfo.has_next} onClick={() => setPage((current) => current + 1)}>
                  Next <Icon name="right" size={16} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <Empty title="No chat evidence found" text="No records match the selected retention state and filters." />
        )}
      </div>

      {notice ? <div className="ace-toast">{notice}</div> : null}

      <EvidenceDetail
        detail={detail}
        tab={tab}
        busy={actionBusy}
        savingReportId={savingReportId}
        onTab={setTab}
        onClose={() => { if (!actionBusy) setDetail(null) }}
        onCopy={handleCopy}
        onSetHold={() => openDialog({
          type: 'hold',
          conversationId: detail?.conversation?.id,
          title: 'Set Legal Hold',
          description: 'This prevents the conversation and its evidence from being purged until the hold is released.',
          confirmLabel: 'Set Legal Hold',
          danger: false,
        })}
        onReleaseHold={() => openDialog({
          type: 'release',
          conversationId: detail?.conversation?.id,
          title: 'Release Legal Hold',
          description: 'Expired evidence may be permanently removed by the next cleanup after this hold is released.',
          confirmLabel: 'Release Hold',
          danger: true,
        })}
        onSaveReport={saveReport}
      />

      <ReasonModal
        dialog={dialog}
        reason={reason}
        busy={actionBusy}
        onChange={setReason}
        onClose={closeDialog}
        onConfirm={submitDialog}
      />
    </AdminLayout>
  )
}
