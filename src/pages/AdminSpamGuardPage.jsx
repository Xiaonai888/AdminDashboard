import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20

const restrictionDurations = [
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
]

const scopeOptions = [
  { value: '', label: 'All scopes' },
  { value: 'reader_read', label: 'Reader Read' },
  { value: 'community_write', label: 'Community Write' },
  { value: 'episode_views', label: 'Episode Views' },
  { value: 'reading_progress', label: 'Reading Progress' },
  { value: 'task_progress', label: 'Task Progress' },
  { value: 'reward_actions', label: 'Reward Actions' },
  { value: 'gift_actions', label: 'Gift Actions' },
  { value: 'support_actions', label: 'Support Actions' },
  { value: 'report_actions', label: 'Report Actions' },
  { value: 'author_content', label: 'Author Content' },
  { value: 'media_upload', label: 'Media Upload' },
  { value: 'visitor_tracking', label: 'Visitor Tracking' },
  { value: 'account_access', label: 'Account Access' },
  { value: 'reader_actions', label: 'Reader Actions' },
  { value: 'payment_actions', label: 'Payment Actions' },
]

const stateFilters = [
  { value: 'all', label: 'All' },
  { value: 'cooldown', label: 'Cooldown' },
  { value: 'restriction', label: 'Restricted' },
  { value: 'blocked', label: 'All Active' },
  { value: 'released', label: 'Released' },
  { value: 'high_score', label: 'Risk 50+' },
  { value: 'repeat_offender', label: 'Repeat Offender' },
]

const styles = `
  .spam-page {
    max-width: 1440px;
    margin: 0 auto;
  }

  .spam-page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
  }

  .spam-page-title {
    margin: 0;
    color: #0F172A;
    font-size: 27px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .spam-page-description {
    max-width: 760px;
    margin: 7px 0 0;
    color: #64748B;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.65;
  }

  .spam-refresh-btn {
    min-width: 106px;
    height: 42px;
    border: 1px solid #DDE3EC;
    border-radius: 13px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 16px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-refresh-btn:hover:not(:disabled) {
    border-color: #A5B4FC;
    color: #4338CA;
  }

  .spam-refresh-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .spam-summary-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .spam-summary-card {
    min-height: 120px;
    border: 1px solid #E2E8F0;
    border-radius: 19px;
    background: #FFFFFF;
    padding: 17px;
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.045);
  }

  .spam-summary-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.45px;
    text-transform: uppercase;
  }

  .spam-summary-value {
    margin-top: 12px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .spam-summary-note {
    margin-top: 5px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.45;
  }

  .spam-summary-card.cooldown {
    border-color: #FDE68A;
  }

  .spam-summary-card.restriction {
    border-color: #FECACA;
  }

  .spam-summary-card.risk {
    border-color: #FDBA74;
  }

  .spam-panel {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 10px 32px rgba(15, 23, 42, 0.05);
  }

  .spam-panel-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 15px 18px 0;
    border-bottom: 1px solid #E2E8F0;
  }

  .spam-tab-btn {
    height: 40px;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: #64748B;
    padding: 0 13px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-tab-btn.active {
    border-bottom-color: #4F46E5;
    color: #4338CA;
  }

  .spam-toolbar {
    display: grid;
    grid-template-columns: minmax(230px, 1fr) 210px 180px;
    gap: 10px;
    padding: 15px 18px;
    border-bottom: 1px solid #E2E8F0;
  }

  .spam-input,
  .spam-select,
  .spam-textarea {
    width: 100%;
    border: 1px solid #DDE3EC;
    border-radius: 13px;
    background: #F8FAFC;
    color: #0F172A;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    outline: none;
  }

  .spam-input,
  .spam-select {
    height: 42px;
    padding: 0 12px;
  }

  .spam-textarea {
    min-height: 92px;
    resize: vertical;
    padding: 11px 12px;
    line-height: 1.55;
  }

  .spam-input:focus,
  .spam-select:focus,
  .spam-textarea:focus {
    border-color: #818CF8;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.11);
  }

  .spam-message {
    margin: 14px 18px 0;
    border-radius: 13px;
    padding: 11px 13px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .spam-message.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .spam-message.success {
    background: #ECFDF5;
    color: #047857;
  }

  .spam-table-wrap {
    overflow-x: auto;
  }

  .spam-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
  }

  .spam-table th {
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #64748B;
    padding: 12px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.55px;
    text-transform: uppercase;
  }

  .spam-table td {
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    padding: 13px 14px;
    font-size: 12px;
    font-weight: 700;
    vertical-align: middle;
  }

  .spam-table tr:last-child td {
    border-bottom: 0;
  }

  .spam-table tbody tr {
    cursor: pointer;
    transition: background 0.16s ease;
  }

  .spam-table tbody tr:hover {
    background: #FAFAFF;
  }

  .spam-identity-main {
    max-width: 270px;
    overflow: hidden;
    color: #0F172A;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spam-identity-sub {
    max-width: 270px;
    overflow: hidden;
    margin-top: 4px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spam-badge {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    border-radius: 999px;
    padding: 0 9px;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.25px;
    white-space: nowrap;
  }

  .spam-badge.scope {
    background: #EEF2FF;
    color: #4338CA;
  }

  .spam-badge.allowed {
    background: #DCFCE7;
    color: #15803D;
  }

  .spam-badge.cooldown {
    background: #FEF3C7;
    color: #B45309;
  }

  .spam-badge.restriction {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .spam-badge.event {
    background: #E0F2FE;
    color: #0369A1;
  }

  .spam-score {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    height: 27px;
    border-radius: 9px;
    background: #F1F5F9;
    color: #475569;
    font-size: 11px;
    font-weight: 950;
  }

  .spam-score.watch {
    background: #FFF7ED;
    color: #C2410C;
  }

  .spam-score.danger {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .spam-empty {
    padding: 48px 20px;
    color: #94A3B8;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
  }

  .spam-loading {
    padding: 48px 20px;
    color: #64748B;
    text-align: center;
    font-size: 13px;
    font-weight: 850;
  }

  .spam-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 18px;
    border-top: 1px solid #E2E8F0;
  }

  .spam-pagination-info {
    color: #64748B;
    font-size: 11px;
    font-weight: 800;
  }

  .spam-pagination-actions {
    display: flex;
    gap: 8px;
  }

  .spam-page-btn {
    height: 36px;
    border: 1px solid #DDE3EC;
    border-radius: 11px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 13px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .spam-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .spam-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 400;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.38);
  }

  .spam-drawer {
    width: min(510px, 100%);
    height: 100%;
    overflow-y: auto;
    background: #FFFFFF;
    box-shadow: -18px 0 50px rgba(15, 23, 42, 0.18);
  }

  .spam-drawer-head {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    border-bottom: 1px solid #E2E8F0;
    background: rgba(255, 255, 255, 0.97);
    padding: 19px 20px;
    backdrop-filter: blur(12px);
  }

  .spam-drawer-kicker {
    color: #6366F1;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  .spam-drawer-title {
    margin: 5px 0 0;
    color: #0F172A;
    font-size: 19px;
    font-weight: 950;
    letter-spacing: -0.025em;
  }

  .spam-close-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #0F172A;
    font: inherit;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
  }

  .spam-drawer-body {
    padding: 19px 20px 34px;
  }

  .spam-drawer-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .spam-detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .spam-detail-item {
    min-width: 0;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #F8FAFC;
    padding: 12px;
  }

  .spam-detail-item span {
    display: block;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: 0.45px;
    text-transform: uppercase;
  }

  .spam-detail-item strong {
    display: block;
    overflow-wrap: anywhere;
    margin-top: 6px;
    color: #334155;
    font-size: 11px;
    font-weight: 850;
    line-height: 1.5;
  }

  .spam-reason-box {
    margin-top: 13px;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    background: #FFFFFF;
    padding: 13px;
  }

  .spam-reason-box span {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: 0.45px;
    text-transform: uppercase;
  }

  .spam-reason-box p {
    margin: 7px 0 0;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }

  .spam-action-card {
    margin-top: 16px;
    border: 1px solid #E2E8F0;
    border-radius: 17px;
    background: #F8FAFC;
    padding: 15px;
  }

  .spam-action-title {
    margin: 0;
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
  }

  .spam-action-note {
    margin: 5px 0 12px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.5;
  }

  .spam-action-grid {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 9px;
    margin-bottom: 9px;
  }

  .spam-drawer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 11px;
  }

  .spam-action-btn {
    min-height: 39px;
    border: 0;
    border-radius: 12px;
    padding: 0 14px;
    font: inherit;
    font-size: 11px;
    font-weight: 950;
    cursor: pointer;
  }

  .spam-action-btn.restrict {
    background: #DC2626;
    color: #FFFFFF;
  }

  .spam-action-btn.release {
    background: #059669;
    color: #FFFFFF;
  }

  .spam-action-btn.cooldown {
    background: #D97706;
    color: #FFFFFF;
  }

  .spam-action-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 1180px) {
    .spam-summary-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .spam-page-head {
      flex-direction: column;
    }

    .spam-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .spam-toolbar {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .spam-summary-grid {
      grid-template-columns: 1fr;
    }

    .spam-detail-grid,
    .spam-action-grid {
      grid-template-columns: 1fr;
    }

    .spam-pagination {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return '-'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function humanize(value) {
  return String(value || 'global')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isFuture(value) {
  return Boolean(
    value &&
    new Date(value).getTime() > Date.now()
  )
}

function getStateStatus(item) {
  if (!item) return 'allowed'

  if (
    item.is_in_restriction ||
    item.block_status === 'temporary_restriction' ||
    isFuture(item.quarantine_until)
  ) {
    return 'temporary_restriction'
  }

  if (
    item.is_in_cooldown ||
    item.block_status === 'temporary_cooldown' ||
    isFuture(item.cooldown_until)
  ) {
    return 'temporary_cooldown'
  }

  return 'allowed'
}

function getStatusLabel(status) {
  if (status === 'temporary_restriction') {
    return 'Restricted'
  }

  if (status === 'temporary_cooldown') {
    return 'Cooldown'
  }

  return 'Allowed'
}

function getStatusClass(status) {
  if (status === 'temporary_restriction') {
    return 'restriction'
  }

  if (status === 'temporary_cooldown') {
    return 'cooldown'
  }

  return 'allowed'
}

function getScoreClass(value) {
  const score = Number(value || 0)

  if (score >= 70) return 'danger'
  if (score >= 50) return 'watch'
  return ''
}

function getIdentity(item) {
  if (item?.account_id) {
    return {
      main: `Account: ${item.account_id}`,
      sub: item.guard_key || '',
    }
  }

  if (item?.visitor_id) {
    return {
      main: `Visitor: ${item.visitor_id}`,
      sub: item.ip_address
        ? `IP: ${item.ip_address}`
        : item.guard_key || '',
    }
  }

  if (item?.ip_address) {
    return {
      main: `IP: ${item.ip_address}`,
      sub: item.guard_key || '',
    }
  }

  return {
    main: item?.guard_key || 'Unknown identity',
    sub: '',
  }
}

function getReason(item) {
  return (
    item?.quarantine_reason ||
    item?.block_reason ||
    item?.last_reason ||
    item?.reason ||
    'No reason recorded.'
  )
}

async function readResponse(response) {
  const data = await response
    .json()
    .catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(
      [data.message, data.error]
        .filter(Boolean)
        .join(' — ') ||
      `Request failed (${response.status})`
    )
  }

  return data
}

async function apiRequest(path, options = {}) {
  const token = getAdminToken()

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }
  )

  return readResponse(response)
}

function SummaryCard({
  label,
  value,
  note,
  tone = '',
}) {
  return (
    <div className={`spam-summary-card ${tone}`}>
      <div className="spam-summary-label">
        {label}
      </div>
      <div className="spam-summary-value">
        {formatNumber(value)}
      </div>
      <div className="spam-summary-note">
        {note}
      </div>
    </div>
  )
}

function StatusBadge({ item }) {
  const status = getStateStatus(item)

  return (
    <span
      className={`spam-badge ${getStatusClass(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}

function ScoreBadge({ value }) {
  return (
    <span className={`spam-score ${getScoreClass(value)}`}>
      {Number(value || 0)}/100
    </span>
  )
}

function DetailDrawer({
  item,
  type,
  duration,
  reason,
  actionBusy,
  onDurationChange,
  onReasonChange,
  onClose,
  onRestrict,
  onReleaseCooldown,
  onReleaseRestriction,
}) {
  if (!item) return null

  const isState = type === 'states'
  const status = isState
    ? getStateStatus(item)
    : item.block_status || 'event'
  const identity = getIdentity(item)

  return (
    <div
      className="spam-drawer-layer"
      onMouseDown={onClose}
    >
      <aside
        className="spam-drawer"
        onMouseDown={(event) => {
          event.stopPropagation()
        }}
      >
        <div className="spam-drawer-head">
          <div>
            <div className="spam-drawer-kicker">
              {isState
                ? 'Spam Guard State'
                : 'Spam Guard Event'}
            </div>
            <h2 className="spam-drawer-title">
              {isState
                ? 'Request protection details'
                : 'Event details'}
            </h2>
          </div>

          <button
            type="button"
            className="spam-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="spam-drawer-body">
          <div className="spam-drawer-badges">
            <span className="spam-badge scope">
              {humanize(item.scope)}
            </span>
            <ScoreBadge value={item.spam_score} />
            {isState ? (
              <StatusBadge item={item} />
            ) : (
              <span className="spam-badge event">
                {humanize(item.action || 'event')}
              </span>
            )}
          </div>

          <div className="spam-detail-grid">
            <div className="spam-detail-item">
              <span>Identity</span>
              <strong>{identity.main}</strong>
            </div>

            <div className="spam-detail-item">
              <span>Guard Key</span>
              <strong>{item.guard_key || '-'}</strong>
            </div>

            <div className="spam-detail-item">
              <span>IP Address</span>
              <strong>{item.ip_address || '-'}</strong>
            </div>

            <div className="spam-detail-item">
              <span>Visitor ID</span>
              <strong>{item.visitor_id || '-'}</strong>
            </div>

            <div className="spam-detail-item">
              <span>Account ID</span>
              <strong>{item.account_id || '-'}</strong>
            </div>

            <div className="spam-detail-item">
              <span>Request Count</span>
              <strong>
                {formatNumber(item.request_count)}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Offense Count</span>
              <strong>
                {formatNumber(item.offense_count)}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Spam Score</span>
              <strong>
                {Number(item.spam_score || 0)}/100
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Cooldown Until</span>
              <strong>
                {formatDateTime(item.cooldown_until)}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Restriction Until</span>
              <strong>
                {formatDateTime(
                  item.restriction_until ||
                  item.quarantine_until ||
                  item.block_until
                )}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Endpoint</span>
              <strong>
                {item.last_endpoint ||
                  item.endpoint ||
                  '-'}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Method</span>
              <strong>
                {item.last_method ||
                  item.method ||
                  '-'}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>First Seen</span>
              <strong>
                {formatDateTime(
                  item.first_seen_at ||
                  item.created_at
                )}
              </strong>
            </div>

            <div className="spam-detail-item">
              <span>Last Seen</span>
              <strong>
                {formatDateTime(
                  item.last_seen_at ||
                  item.occurred_at
                )}
              </strong>
            </div>
          </div>

          <div className="spam-reason-box">
            <span>Reason</span>
            <p>{getReason(item)}</p>
          </div>

          {isState ? (
            <div className="spam-action-card">
              <h3 className="spam-action-title">
                Manual action
              </h3>
              <p className="spam-action-note">
                Permanent blocks are disabled. The maximum
                temporary restriction is 7 days.
              </p>

              <div className="spam-action-grid">
                <select
                  className="spam-select"
                  value={duration}
                  onChange={(event) => {
                    onDurationChange(event.target.value)
                  }}
                >
                  {restrictionDurations.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  className="spam-input"
                  value={reason}
                  onChange={(event) => {
                    onReasonChange(event.target.value)
                  }}
                  placeholder="Restriction or release reason"
                  maxLength={500}
                />
              </div>

              <div className="spam-drawer-actions">
                <button
                  type="button"
                  className="spam-action-btn restrict"
                  onClick={() => onRestrict(item)}
                  disabled={
                    actionBusy ||
                    reason.trim().length < 3
                  }
                >
                  {actionBusy
                    ? 'Working...'
                    : `Restrict ${duration}`}
                </button>

                {status === 'temporary_cooldown' ? (
                  <button
                    type="button"
                    className="spam-action-btn cooldown"
                    onClick={() => {
                      onReleaseCooldown(item)
                    }}
                    disabled={actionBusy}
                  >
                    {actionBusy
                      ? 'Working...'
                      : 'Release Cooldown'}
                  </button>
                ) : null}

                {status === 'temporary_restriction' ? (
                  <button
                    type="button"
                    className="spam-action-btn release"
                    onClick={() => {
                      onReleaseRestriction(item)
                    }}
                    disabled={actionBusy}
                  >
                    {actionBusy
                      ? 'Working...'
                      : 'Release Restriction'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

export default function AdminSpamGuardPage() {
  const [activeTab, setActiveTab] = useState('states')
  const [summary, setSummary] = useState({
    total_tracked: 0,
    active_cooldowns: 0,
    active_restrictions: 0,
    active_blocks: 0,
    offenses_today: 0,
    high_spam_score: 0,
  })
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] =
    useState('')
  const [filter, setFilter] = useState('all')
  const [scope, setScope] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] =
    useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] =
    useState('error')
  const [selectedItem, setSelectedItem] =
    useState(null)
  const [duration, setDuration] = useState('24h')
  const [reason, setReason] = useState('')
  const [actionBusy, setActionBusy] =
    useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const totalPages = Math.max(
    1,
    Number(pagination.total_pages || 1)
  )

  const listLabel = useMemo(() => {
    return activeTab === 'states'
      ? 'tracked identities'
      : 'events'
  }, [activeTab])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadOverview() {
      try {
        setOverviewLoading(true)
        const data = await apiRequest(
          '/api/admin/spam-guard/overview'
        )

        if (!alive) return

        setSummary({
          total_tracked:
            Number(data.summary?.total_tracked || 0),
          active_cooldowns:
            Number(data.summary?.active_cooldowns || 0),
          active_restrictions:
            Number(
              data.summary?.active_restrictions ||
              data.summary?.active_quarantines ||
              0
            ),
          active_blocks:
            Number(data.summary?.active_blocks || 0),
          offenses_today:
            Number(data.summary?.offenses_today || 0),
          high_spam_score:
            Number(data.summary?.high_spam_score || 0),
        })
      } catch (error) {
        if (!alive) return
        setMessage(
          error.message ||
          'Failed to load Spam Guard overview'
        )
        setMessageType('error')
      } finally {
        if (alive) setOverviewLoading(false)
      }
    }

    loadOverview()

    return () => {
      alive = false
    }
  }, [refreshKey])

  useEffect(() => {
    let alive = true

    async function loadItems() {
      try {
        setLoading(true)
        setMessage('')

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        })

        if (scope) params.set('scope', scope)
        if (debouncedSearch) {
          params.set('q', debouncedSearch)
        }

        if (activeTab === 'states') {
          params.set('filter', filter)
        }

        const data = await apiRequest(
          `/api/admin/spam-guard/${activeTab}?${params.toString()}`
        )

        if (!alive) return

        const nextItems =
          activeTab === 'states'
            ? data.states || []
            : data.events || []

        setItems(nextItems)
        setPagination({
          total: Number(data.total || 0),
          total_pages: Number(data.total_pages || 1),
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (error) {
        if (!alive) return
        setItems([])
        setMessage(
          error.message ||
          `Failed to load Spam Guard ${activeTab}`
        )
        setMessageType('error')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadItems()

    return () => {
      alive = false
    }
  }, [
    activeTab,
    debouncedSearch,
    filter,
    page,
    refreshKey,
    scope,
  ])

  function showSuccess(text) {
    setMessage(text)
    setMessageType('success')
  }

  function refreshAll() {
    setRefreshKey((value) => value + 1)
  }

  function changeTab(nextTab) {
    setActiveTab(nextTab)
    setPage(1)
    setSelectedItem(null)
  }

  function selectItem(item) {
    setSelectedItem(item)
    setDuration('24h')
    setReason('')
  }

  async function runStateAction(
    item,
    path,
    body,
    fallbackMessage
  ) {
    if (!item?.id || actionBusy) return

    try {
      setActionBusy(true)

      const data = await apiRequest(
        `/api/admin/spam-guard/states/${item.id}/${path}`,
        {
          method: 'PATCH',
          body: JSON.stringify(body),
        }
      )

      if (data.state) {
        setSelectedItem(data.state)
      }

      showSuccess(
        data.message || fallbackMessage
      )
      refreshAll()
    } catch (error) {
      setMessage(
        error.message || fallbackMessage
      )
      setMessageType('error')
    } finally {
      setActionBusy(false)
    }
  }

  function restrictIdentity(item) {
    if (reason.trim().length < 3) return

    runStateAction(
      item,
      'restrict',
      {
        duration,
        reason: reason.trim(),
      },
      'Failed to apply temporary restriction'
    )
  }

  function releaseCooldown(item) {
    runStateAction(
      item,
      'release',
      {
        reason:
          reason.trim() ||
          'Manual cooldown release',
      },
      'Failed to release cooldown'
    )
  }

  function releaseRestriction(item) {
    runStateAction(
      item,
      'release-restriction',
      {
        reason:
          reason.trim() ||
          'Manual restriction release',
      },
      'Failed to release restriction'
    )
  }

  return (
    <AdminLayout
      title="Spam Guard"
      subtitle="Temporary cooldowns, risk scoring, and request protection"
    >
      <style>{styles}</style>

      <div className="spam-page">
        <div className="spam-page-head">
          <div>
            <h1 className="spam-page-title">
              Spam Guard
            </h1>
            <p className="spam-page-description">
              Monitor request activity and apply temporary
              restrictions. Automatic permanent blocking is
              disabled, and every restriction expires within
              7 days.
            </p>
          </div>

          <button
            type="button"
            className="spam-refresh-btn"
            onClick={refreshAll}
            disabled={loading || overviewLoading}
          >
            {loading || overviewLoading
              ? 'Loading...'
              : 'Refresh'}
          </button>
        </div>

        <div className="spam-summary-grid">
          <SummaryCard
            label="Tracked"
            value={summary.total_tracked}
            note="All active Spam Guard identities"
          />
          <SummaryCard
            label="Cooldowns"
            value={summary.active_cooldowns}
            note="5, 10, or 15-minute cooldowns"
            tone="cooldown"
          />
          <SummaryCard
            label="Restrictions"
            value={summary.active_restrictions}
            note="Temporary restrictions up to 7 days"
            tone="restriction"
          />
          <SummaryCard
            label="Offenses Today"
            value={summary.offenses_today}
            note="New cooldown or restriction events"
          />
          <SummaryCard
            label="Risk 50+"
            value={summary.high_spam_score}
            note="Identities requiring closer review"
            tone="risk"
          />
        </div>

        <section className="spam-panel">
          <div className="spam-panel-tabs">
            <button
              type="button"
              className={`spam-tab-btn ${
                activeTab === 'states'
                  ? 'active'
                  : ''
              }`}
              onClick={() => changeTab('states')}
            >
              States
            </button>

            <button
              type="button"
              className={`spam-tab-btn ${
                activeTab === 'events'
                  ? 'active'
                  : ''
              }`}
              onClick={() => changeTab('events')}
            >
              Events
            </button>
          </div>

          <div className="spam-toolbar">
            <input
              className="spam-input"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
              }}
              placeholder="Search account, visitor, IP, endpoint, or reason"
            />

            <select
              className="spam-select"
              value={scope}
              onChange={(event) => {
                setScope(event.target.value)
                setPage(1)
              }}
            >
              {scopeOptions.map((option) => (
                <option
                  key={option.value || 'all'}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {activeTab === 'states' ? (
              <select
                className="spam-select"
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value)
                  setPage(1)
                }}
              >
                {stateFilters.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div />
            )}
          </div>

          {message ? (
            <div
              className={`spam-message ${messageType}`}
            >
              {message}
            </div>
          ) : null}

          {loading ? (
            <div className="spam-loading">
              Loading Spam Guard {listLabel}...
            </div>
          ) : items.length ? (
            <div className="spam-table-wrap">
              {activeTab === 'states' ? (
                <table className="spam-table">
                  <thead>
                    <tr>
                      <th>Identity</th>
                      <th>Scope</th>
                      <th>Status</th>
                      <th>Requests</th>
                      <th>Offenses</th>
                      <th>Score</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const identity =
                        getIdentity(item)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            selectItem(item)
                          }}
                        >
                          <td>
                            <div className="spam-identity-main">
                              {identity.main}
                            </div>
                            <div className="spam-identity-sub">
                              {identity.sub}
                            </div>
                          </td>
                          <td>
                            <span className="spam-badge scope">
                              {humanize(item.scope)}
                            </span>
                          </td>
                          <td>
                            <StatusBadge item={item} />
                          </td>
                          <td>
                            {formatNumber(
                              item.request_count
                            )}
                          </td>
                          <td>
                            {formatNumber(
                              item.offense_count
                            )}
                          </td>
                          <td>
                            <ScoreBadge
                              value={item.spam_score}
                            />
                          </td>
                          <td>
                            {formatDateTime(
                              item.last_seen_at
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="spam-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Identity</th>
                      <th>Scope</th>
                      <th>Endpoint</th>
                      <th>Score</th>
                      <th>Occurred</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const identity =
                        getIdentity(item)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            selectItem(item)
                          }}
                        >
                          <td>
                            <span className="spam-badge event">
                              {humanize(
                                item.action || 'event'
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="spam-identity-main">
                              {identity.main}
                            </div>
                            <div className="spam-identity-sub">
                              {identity.sub}
                            </div>
                          </td>
                          <td>
                            <span className="spam-badge scope">
                              {humanize(item.scope)}
                            </span>
                          </td>
                          <td>
                            <div className="spam-identity-main">
                              {item.endpoint || '-'}
                            </div>
                            <div className="spam-identity-sub">
                              {item.method || '-'}
                            </div>
                          </td>
                          <td>
                            <ScoreBadge
                              value={item.spam_score}
                            />
                          </td>
                          <td>
                            {formatDateTime(
                              item.occurred_at
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="spam-empty">
              No Spam Guard {listLabel} found.
            </div>
          )}

          <div className="spam-pagination">
            <div className="spam-pagination-info">
              Page {page} of {totalPages} ·{' '}
              {formatNumber(pagination.total)}{' '}
              {listLabel}
            </div>

            <div className="spam-pagination-actions">
              <button
                type="button"
                className="spam-page-btn"
                onClick={() => {
                  setPage((value) =>
                    Math.max(1, value - 1)
                  )
                }}
                disabled={
                  loading ||
                  page <= 1 ||
                  !pagination.has_prev
                }
              >
                Previous
              </button>

              <button
                type="button"
                className="spam-page-btn"
                onClick={() => {
                  setPage((value) =>
                    Math.min(
                      totalPages,
                      value + 1
                    )
                  )
                }}
                disabled={
                  loading ||
                  page >= totalPages ||
                  !pagination.has_next
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      <DetailDrawer
        item={selectedItem}
        type={activeTab}
        duration={duration}
        reason={reason}
        actionBusy={actionBusy}
        onDurationChange={setDuration}
        onReasonChange={setReason}
        onClose={() => {
          setSelectedItem(null)
          setReason('')
        }}
        onRestrict={restrictIdentity}
        onReleaseCooldown={releaseCooldown}
        onReleaseRestriction={releaseRestriction}
      />
    </AdminLayout>
  )
}
