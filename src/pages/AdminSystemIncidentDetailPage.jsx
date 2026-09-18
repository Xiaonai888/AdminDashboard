import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function auth() {
  return {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }
}

function num(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function formatNumber(value) {
  return num(value).toLocaleString()
}

function formatDataFromBytes(value) {
  const bytes = num(value)

  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  }

  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(2)} MB`
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  return `${Math.round(bytes)} B`
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : '—'
}

function labelize(value) {
  return String(value || '—')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function confidenceTone(value) {
  const level = String(value || '').toLowerCase()

  if (level === 'high') return 'high'
  if (level === 'medium') return 'medium'
  return 'low'
}


function canManageSystemControl() {
  let admin = {}

  try {
    admin = JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
      localStorage.getItem('shadow_admin_user') ||
      '{}'
    )
  } catch {
    admin = {}
  }

  const role = String(admin?.role || '')
    .trim()
    .toLowerCase()

  return (
    admin?.has_all_permissions === true ||
    role === 'owner' ||
    role === 'admin' ||
    (
      Array.isArray(admin?.permission_keys) &&
      admin.permission_keys.includes(
        'system_control.manage'
      )
    )
  )
}

const css = `
  .id-page {
    display: grid;
    gap: 18px;
  }

  .id-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .id-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .id-btn {
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .id-btn:hover {
    background: #F8FAFC;
  }

  .id-btn:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .id-error {
    padding: 12px 14px;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 10px;
    font-weight: 850;
  }

  .id-hero,
  .id-block {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .id-hero {
    padding: 18px;
  }

  .id-kicker {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .id-title-row {
    margin-top: 7px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .id-title {
    color: #0F172A;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.025em;
  }

  .id-sub {
    margin-top: 7px;
    color: #64748B;
    font-size: 10px;
    font-weight: 800;
    word-break: break-word;
  }

  .id-pill {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .id-pill.open {
    background: #FFF7ED;
    color: #C2410C;
  }

  .id-pill.resolved {
    background: #ECFDF5;
    color: #047857;
  }

  .id-pill.critical,
  .id-pill.high {
    background: #FEF2F2;
    color: #DC2626;
  }

  .id-pill.medium {
    background: #FFF7ED;
    color: #C2410C;
  }

  .id-pill.info {
    background: #EFF6FF;
    color: #2563EB;
  }

  .id-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .id-head {
    padding: 15px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
  }

  .id-body {
    padding: 14px 16px;
  }

  .id-kv {
    display: grid;
    grid-template-columns: 145px minmax(0, 1fr);
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #F1F5F9;
  }

  .id-kv:last-child {
    border-bottom: 0;
  }

  .id-key {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 900;
  }

  .id-val {
    color: #334155;
    font-size: 9px;
    font-weight: 850;
    word-break: break-word;
  }

  .id-workflow {
    border-color: #DDE7F2;
    background: linear-gradient(180deg, #FBFDFF 0, #FFFFFF 120px);
  }

  .id-workflow-track {
    padding: 14px 16px 4px;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 7px;
  }

  .id-workflow-step {
    min-width: 0;
    padding: 9px 7px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #F8FAFC;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 950;
    text-align: center;
  }

  .id-workflow-step.done {
    border-color: #C7D2FE;
    background: #EEF2FF;
    color: #4338CA;
  }

  .id-workflow-step.current {
    border-color: #A78BFA;
    background: #F5F3FF;
    color: #6D28D9;
    box-shadow: 0 0 0 2px #F3E8FF;
  }

  .id-workflow-body {
    padding: 12px 16px 16px;
    display: grid;
    gap: 12px;
  }

  .id-workflow-form {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(160px, 0.6fr) minmax(150px, 0.5fr);
    gap: 9px;
  }

  .id-field {
    display: grid;
    gap: 6px;
  }

  .id-field.full {
    grid-column: 1 / -1;
  }

  .id-field label {
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .id-input,
  .id-textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 750;
    outline: none;
  }

  .id-input {
    min-height: 38px;
    padding: 0 10px;
  }

  .id-textarea {
    min-height: 86px;
    resize: vertical;
    padding: 10px;
    line-height: 1.55;
  }

  .id-input:focus,
  .id-textarea:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px #F3E8FF;
  }

  .id-workflow-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .id-readonly {
    padding: 10px 12px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 9px;
    font-weight: 850;
  }

  .id-action {
    min-height: 36px;
    padding: 0 13px;
    border: 1px solid #DDD6FE;
    border-radius: 10px;
    background: #F5F3FF;
    color: #6D28D9;
    font: inherit;
    font-size: 9px;
    font-weight: 950;
    cursor: pointer;
  }

  .id-action.primary {
    border-color: #6D28D9;
    background: #6D28D9;
    color: #FFFFFF;
  }

  .id-action.success {
    border-color: #A7F3D0;
    background: #ECFDF5;
    color: #047857;
  }

  .id-action.archive {
    border-color: #CBD5E1;
    background: #F8FAFC;
    color: #475569;
  }

  .id-action:disabled {
    cursor: wait;
    opacity: 0.58;
  }

  .id-success {
    padding: 10px 12px;
    border: 1px solid #A7F3D0;
    border-radius: 10px;
    background: #ECFDF5;
    color: #047857;
    font-size: 9px;
    font-weight: 850;
  }

  .id-resolution {
    padding: 12px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #F8FAFC;
  }

  .id-resolution-title {
    color: #334155;
    font-size: 9px;
    font-weight: 950;
  }

  .id-resolution-text {
    margin-top: 6px;
    color: #64748B;
    font-size: 9px;
    line-height: 1.55;
    font-weight: 750;
  }

  .id-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .id-compare-card {
    padding: 11px;
    border: 1px solid #EEF2F7;
    border-radius: 11px;
    background: #FFFFFF;
  }

  .id-compare-card strong {
    display: block;
    color: #334155;
    font-size: 9px;
    font-weight: 950;
  }

  .id-compare-card span {
    display: block;
    margin-top: 6px;
    color: #64748B;
    font-size: 8px;
    line-height: 1.55;
    font-weight: 800;
  }

  .id-advisor {
    border-color: #DDD6FE;
    background:
      linear-gradient(180deg, #FCFAFF 0, #FFFFFF 116px);
  }

  .id-advisor-title {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .id-advisor-icon {
    width: 31px;
    height: 31px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #F3E8FF;
    color: #6D28D9;
    font-size: 14px;
    font-weight: 950;
  }

  .id-confidence {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .id-confidence-badge {
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .id-confidence-badge.high {
    background: #ECFDF5;
    color: #047857;
  }

  .id-confidence-badge.medium {
    background: #FFF7ED;
    color: #C2410C;
  }

  .id-confidence-badge.low {
    background: #F1F5F9;
    color: #64748B;
  }

  .id-advisor-notice {
    margin: 0 16px 14px;
    padding: 10px 12px;
    border: 1px solid #DDD6FE;
    border-radius: 11px;
    background: #F5F3FF;
    color: #6D28D9;
    font-size: 9px;
    font-weight: 900;
  }

  .id-advisor-grid {
    padding: 0 16px 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .id-advisor-card {
    border: 1px solid #EEF2F7;
    border-radius: 13px;
    padding: 13px;
    background: #FFFFFF;
  }

  .id-advisor-card.full {
    grid-column: 1 / -1;
  }

  .id-advisor-label {
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .id-advisor-text {
    margin-top: 7px;
    color: #334155;
    font-size: 10px;
    line-height: 1.65;
    font-weight: 750;
  }

  .id-fix-list {
    margin: 8px 0 0;
    padding-left: 20px;
    color: #334155;
    font-size: 10px;
    line-height: 1.65;
    font-weight: 750;
  }

  .id-fix-list li + li {
    margin-top: 6px;
  }

  .id-evidence-grid {
    margin-top: 9px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .id-evidence-item {
    min-width: 0;
    padding: 10px;
    border: 1px solid #F1F5F9;
    border-radius: 10px;
    background: #F8FAFC;
  }

  .id-evidence-item span {
    display: block;
    color: #94A3B8;
    font-size: 7px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .id-evidence-item strong {
    display: block;
    margin-top: 5px;
    color: #1E293B;
    font-size: 9px;
    font-weight: 900;
    word-break: break-word;
  }

  .id-advisor-empty {
    margin: 0 16px 16px;
    padding: 16px;
    border: 1px dashed #CBD5E1;
    border-radius: 12px;
    color: #64748B;
    background: #F8FAFC;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.6;
  }

  .id-code {
    max-height: 420px;
    overflow: auto;
    margin: 0;
    padding: 14px;
    border-radius: 12px;
    background: #0F172A;
    color: #E2E8F0;
    font-size: 10px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  @media (max-width: 900px) {
    .id-grid,
    .id-advisor-grid,
    .id-workflow-form,
    .id-compare {
      grid-template-columns: 1fr;
    }

    .id-field.full {
      grid-column: auto;
    }

    .id-workflow-track {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .id-advisor-card.full {
      grid-column: auto;
    }

    .id-evidence-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .id-kv {
      grid-template-columns: 1fr;
      gap: 5px;
    }

    .id-evidence-grid {
      grid-template-columns: 1fr;
    }
  }
`

export default function AdminSystemIncidentDetailPage() {
  const { incidentId } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fixSummary, setFixSummary] = useState('')
  const [fixCommit, setFixCommit] = useState('')
  const [fixVersion, setFixVersion] = useState('')
  const [resolutionSummary, setResolutionSummary] = useState('')

  const canManage = useMemo(
    () => canManageSystemControl(),
    []
  )

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/incidents/${incidentId}`,
        auth()
      )

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload?.ok !== true) {
        throw new Error(
          payload?.message || 'Failed to load incident.'
        )
      }

      const found = payload.incident || null

      if (!found) {
        throw new Error('Incident not found.')
      }

      setItem(found)
      setFixSummary(found.fix_summary || '')
      setFixCommit(found.fix_commit || '')
      setFixVersion(found.fix_version || '')
      setResolutionSummary(
        found?.resolution_summary?.summary || ''
      )
      setSuccess('')
      setError('')
    } catch (loadError) {
      setError(
        loadError?.message || 'Failed to load incident.'
      )
    } finally {
      setLoading(false)
    }
  }, [incidentId])

  useEffect(() => {
    load()
  }, [load])

  const runAction = useCallback(async (action, body = {}) => {
    try {
      if (!canManage) {
        throw new Error(
          'Permission required: system_control.manage'
        )
      }

      setActionLoading(action)
      setError('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/system-control/incidents/${incidentId}/${action}`,
        {
          ...auth(),
          method: 'POST',
          headers: {
            ...auth().headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload?.ok !== true) {
        throw new Error(
          payload?.message || `Incident ${action} failed.`
        )
      }

      const next = payload.incident || null

      if (next) {
        setItem(next)
        setFixSummary(next.fix_summary || '')
        setFixCommit(next.fix_commit || '')
        setFixVersion(next.fix_version || '')
        setResolutionSummary(
          next?.resolution_summary?.summary || ''
        )
      }

      const messages = {
        fix: 'Fix marked as applied.',
        verify: 'Incident verified.',
        resolve: 'Incident resolved.',
        archive: 'Incident archived.',
      }

      setSuccess(
        messages[action] || 'Incident updated.'
      )
    } catch (actionError) {
      setError(
        actionError?.message || 'Incident action failed.'
      )
    } finally {
      setActionLoading('')
    }
  }, [incidentId, canManage])

  const evidence = item?.evidence || {}
  const advisor = evidence?.advisor || null
  const advisorEvidence = advisor?.evidence || {}
  const confidence = advisor?.confidence || {}
  const fixes = Array.isArray(advisor?.recommended_fix)
    ? advisor.recommended_fix
    : []
  const raw = useMemo(
    () =>
      item
        ? JSON.stringify(item, null, 2)
        : '',
    [item]
  )

  const status = String(
    item?.status || 'OPEN'
  ).toLowerCase()

  const severity = String(
    item?.severity || 'info'
  ).toLowerCase()

  const workflow = [
    'OPEN',
    'INVESTIGATING',
    'FIX_APPLIED',
    'VERIFIED',
    'RESOLVED',
    'ARCHIVED',
  ]

  const statusUpper = String(
    item?.status || 'OPEN'
  ).toUpperCase()

  const workflowIndex = Math.max(
    0,
    workflow.indexOf(statusUpper)
  )

  const canApplyFix =
    canManage &&
    [
      'OPEN',
      'INVESTIGATING',
      'FIX_APPLIED',
    ].includes(statusUpper)

  const canVerify =
    canManage &&
    statusUpper === 'FIX_APPLIED'

  const canResolve =
    canManage &&
    statusUpper === 'VERIFIED'

  const canArchive =
    canManage &&
    statusUpper === 'RESOLVED'

  const before = item?.verification_before || {}
  const after = item?.verification_after || {}
  const resolution = item?.resolution_summary || {}

  return (
    <AdminLayout
      title="Incident Detail"
      subtitle="Root cause, protection, optimization guidance, and retained evidence."
    >
      <style>{css}</style>

      <div className="id-page">
        <div className="id-top">
          <button
            type="button"
            className="id-btn"
            onClick={() =>
              navigate('/alerts/system-control/problems')
            }
          >
            ← Problem Reports
          </button>

          <div className="id-actions">
            <button
              type="button"
              className="id-btn"
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>

            <button
              type="button"
              className="id-btn"
              disabled={!item}
              onClick={() =>
                navigator.clipboard?.writeText(raw)
              }
            >
              Copy Evidence
            </button>
          </div>
        </div>

        {error ? (
          <div className="id-error">{error}</div>
        ) : null}

        {success ? (
          <div className="id-success">{success}</div>
        ) : null}

        {item ? (
          <>
            <section className="id-hero">
              <div className="id-kicker">
                Incident #{item.id}
              </div>

              <div className="id-title-row">
                <div className="id-title">
                  {item.feature || 'Unknown Feature'}
                </div>

                <span className={`id-pill ${status}`}>
                  {item.status || 'OPEN'}
                </span>

                <span className={`id-pill ${severity}`}>
                  {item.severity || 'info'}
                </span>
              </div>

              <div className="id-sub">
                {item.source_route || 'UNKNOWN'} ·{' '}
                {item.dependency || 'UNKNOWN'} · Evidence{' '}
                {evidence.retention_tier || 'full'}
              </div>
            </section>

            <section className="id-block id-workflow">
              <div className="id-head">
                <span>Incident Workflow</span>
                <span className={`id-pill ${status}`}>
                  {item.status || 'OPEN'}
                </span>
              </div>

              <div className="id-workflow-track">
                {workflow.map((step, index) => (
                  <div
                    className={`id-workflow-step ${
                      index < workflowIndex
                        ? 'done'
                        : index === workflowIndex
                          ? 'current'
                          : ''
                    }`}
                    key={step}
                  >
                    {labelize(step)}
                  </div>
                ))}
              </div>

              <div className="id-workflow-body">
                {!canManage ? (
                  <div className="id-readonly">
                    Read-only access — system_control.manage is required for Apply Fix, Verify, Resolve, and Archive.
                  </div>
                ) : null}

                {canApplyFix ? (
                  <>
                    <div className="id-workflow-form">
                      <div className="id-field full">
                        <label>Fix Summary</label>
                        <textarea
                          className="id-textarea"
                          value={fixSummary}
                          onChange={(event) =>
                            setFixSummary(event.target.value)
                          }
                          placeholder="Describe exactly what was changed to fix this incident."
                        />
                      </div>

                      <div className="id-field">
                        <label>Commit</label>
                        <input
                          className="id-input"
                          value={fixCommit}
                          onChange={(event) =>
                            setFixCommit(event.target.value)
                          }
                          placeholder="Optional commit SHA"
                        />
                      </div>

                      <div className="id-field">
                        <label>Version</label>
                        <input
                          className="id-input"
                          value={fixVersion}
                          onChange={(event) =>
                            setFixVersion(event.target.value)
                          }
                          placeholder="Optional version"
                        />
                      </div>
                    </div>

                    <div className="id-workflow-actions">
                      <button
                        type="button"
                        className="id-action primary"
                        disabled={
                          Boolean(actionLoading) ||
                          !fixSummary.trim()
                        }
                        onClick={() =>
                          runAction('fix', {
                            fix_summary: fixSummary.trim(),
                            fix_commit:
                              fixCommit.trim() || null,
                            fix_version:
                              fixVersion.trim() || null,
                          })
                        }
                      >
                        {actionLoading === 'fix'
                          ? 'Saving…'
                          : statusUpper === 'FIX_APPLIED'
                            ? 'Update Fix'
                            : 'Apply Fix'}
                      </button>

                      {canVerify ? (
                        <button
                          type="button"
                          className="id-action success"
                          disabled={Boolean(actionLoading)}
                          onClick={() =>
                            runAction('verify')
                          }
                        >
                          {actionLoading === 'verify'
                            ? 'Verifying…'
                            : 'Verify Recovery'}
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {canResolve ? (
                  <>
                    <div className="id-field">
                      <label>Resolution Summary</label>
                      <textarea
                        className="id-textarea"
                        value={resolutionSummary}
                        onChange={(event) =>
                          setResolutionSummary(
                            event.target.value
                          )
                        }
                        placeholder="Optional final resolution note."
                      />
                    </div>

                    <div className="id-workflow-actions">
                      <button
                        type="button"
                        className="id-action primary"
                        disabled={Boolean(actionLoading)}
                        onClick={() =>
                          runAction('resolve', {
                            summary:
                              resolutionSummary.trim() ||
                              undefined,
                          })
                        }
                      >
                        {actionLoading === 'resolve'
                          ? 'Resolving…'
                          : 'Resolve Incident'}
                      </button>
                    </div>
                  </>
                ) : null}

                {canArchive ? (
                  <div className="id-workflow-actions">
                    <button
                      type="button"
                      className="id-action archive"
                      disabled={Boolean(actionLoading)}
                      onClick={() =>
                        runAction('archive')
                      }
                    >
                      {actionLoading === 'archive'
                        ? 'Archiving…'
                        : 'Archive Incident'}
                    </button>
                  </div>
                ) : null}

                {statusUpper === 'ARCHIVED' ? (
                  <div className="id-resolution">
                    <div className="id-resolution-title">
                      Archived Resolution
                    </div>
                    <div className="id-resolution-text">
                      This incident is archived and retained as a compact resolution record.
                    </div>
                  </div>
                ) : null}

                {item.fix_applied_at ||
                item.verified_at ||
                item.resolved_at ||
                item.archived_at ? (
                  <div className="id-grid">
                    <div className="id-resolution">
                      <div className="id-resolution-title">
                        Workflow Timestamps
                      </div>
                      <div className="id-resolution-text">
                        Fix Applied: {formatDate(item.fix_applied_at)}
                        <br />
                        Verified: {formatDate(item.verified_at)}
                        <br />
                        Resolved: {formatDate(item.resolved_at)}
                        <br />
                        Archived: {formatDate(item.archived_at)}
                      </div>
                    </div>

                    <div className="id-resolution">
                      <div className="id-resolution-title">
                        Saved Fix
                      </div>
                      <div className="id-resolution-text">
                        {item.fix_summary || '—'}
                        <br />
                        Commit: {item.fix_commit || '—'}
                        <br />
                        Version: {item.fix_version || '—'}
                      </div>
                    </div>
                  </div>
                ) : null}

                {Object.keys(before).length ||
                Object.keys(after).length ? (
                  <div className="id-compare">
                    <div className="id-compare-card">
                      <strong>Before Fix</strong>
                      <span>
                        Requests: {formatNumber(before?.current?.count)}
                        <br />
                        Data: {formatDataFromBytes(before?.current?.bytes)}
                        <br />
                        Errors: {formatNumber(before?.current?.errors)}
                      </span>
                    </div>

                    <div className="id-compare-card">
                      <strong>After Verification</strong>
                      <span>
                        Requests: {formatNumber(after?.current?.count)}
                        <br />
                        Data: {formatDataFromBytes(after?.current?.bytes)}
                        <br />
                        Errors: {formatNumber(after?.current?.errors)}
                      </span>
                    </div>
                  </div>
                ) : null}

                {resolution?.summary ? (
                  <div className="id-resolution">
                    <div className="id-resolution-title">
                      Final Resolution
                    </div>
                    <div className="id-resolution-text">
                      {resolution.summary}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="id-grid">
              <section className="id-block">
                <div className="id-head">
                  Root Cause
                </div>

                <div className="id-body">
                  <div className="id-kv">
                    <div className="id-key">
                      Classification
                    </div>
                    <div className="id-val">
                      {labelize(evidence.classification)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Signals
                    </div>
                    <div className="id-val">
                      {Array.isArray(evidence.signals) &&
                      evidence.signals.length
                        ? evidence.signals
                            .map(labelize)
                            .join(', ')
                        : '—'}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Top Driver
                    </div>
                    <div className="id-val">
                      {evidence?.top_driver?.source_route ||
                        item.source_route ||
                        '—'}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Dependency
                    </div>
                    <div className="id-val">
                      {evidence?.top_driver?.dependency ||
                        item.dependency ||
                        '—'}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Current Requests
                    </div>
                    <div className="id-val">
                      {formatNumber(
                        evidence?.current?.count
                      )}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Current Data
                    </div>
                    <div className="id-val">
                      {formatDataFromBytes(
                        evidence?.current?.bytes
                      )}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Error Rate
                    </div>
                    <div className="id-val">
                      {num(
                        evidence?.current
                          ?.error_rate_percent
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>
              </section>

              <section className="id-block">
                <div className="id-head">
                  History
                </div>

                <div className="id-body">
                  <div className="id-kv">
                    <div className="id-key">
                      First Seen
                    </div>
                    <div className="id-val">
                      {formatDate(item.first_seen_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Last Seen
                    </div>
                    <div className="id-val">
                      {formatDate(item.last_seen_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Fix Applied
                    </div>
                    <div className="id-val">
                      {formatDate(item.fix_applied_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Verified
                    </div>
                    <div className="id-val">
                      {formatDate(item.verified_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Resolved
                    </div>
                    <div className="id-val">
                      {formatDate(item.resolved_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Archived
                    </div>
                    <div className="id-val">
                      {formatDate(item.archived_at)}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Recurrence
                    </div>
                    <div className="id-val">
                      {formatNumber(
                        item.recurrence_count
                      )}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Evidence Tier
                    </div>
                    <div className="id-val">
                      {labelize(
                        evidence.retention_tier ||
                          'full'
                      )}
                    </div>
                  </div>

                  <div className="id-kv">
                    <div className="id-key">
                      Compacted At
                    </div>
                    <div className="id-val">
                      {formatDate(
                        evidence.compacted_at
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="id-block">
              <div className="id-head">
                Protection
              </div>

              <div className="id-body">
                <div className="id-kv">
                  <div className="id-key">
                    Status
                  </div>
                  <div className="id-val">
                    {labelize(
                      evidence?.protection?.status ||
                        'inactive'
                    )}
                  </div>
                </div>

                <div className="id-kv">
                  <div className="id-key">
                    Type
                  </div>
                  <div className="id-val">
                    {labelize(
                      evidence?.protection?.kind
                    )}
                  </div>
                </div>

                <div className="id-kv">
                  <div className="id-key">
                    Target
                  </div>
                  <div className="id-val">
                    {evidence?.protection?.method ||
                      evidence?.protection?.plan
                        ?.method ||
                      '—'}{' '}
                    {evidence?.protection?.path ||
                      evidence?.protection?.plan
                        ?.path ||
                      ''}
                  </div>
                </div>

                <div className="id-kv">
                  <div className="id-key">
                    Reason
                  </div>
                  <div className="id-val">
                    {labelize(
                      evidence?.protection?.plan
                        ?.reason
                    )}
                  </div>
                </div>

                <div className="id-kv">
                  <div className="id-key">
                    Released
                  </div>
                  <div className="id-val">
                    {formatDate(
                      evidence?.protection
                        ?.released_at
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="id-block id-advisor">
              <div className="id-head">
                <div className="id-advisor-title">
                  <span className="id-advisor-icon">
                    ✦
                  </span>
                  <span>Optimization Advisor</span>
                </div>

                {advisor ? (
                  <div className="id-confidence">
                    <span
                      className={`id-confidence-badge ${confidenceTone(
                        confidence.level
                      )}`}
                    >
                      {confidence.level || 'low'} confidence
                    </span>

                    <span className="id-pill">
                      {Math.round(
                        num(confidence.score) * 100
                      )}
                      %
                    </span>
                  </div>
                ) : null}
              </div>

              {advisor ? (
                <>
                  <div className="id-advisor-notice">
                    {advisor.notice ||
                      'Suggestion only — Review before apply.'}
                  </div>

                  <div className="id-advisor-grid">
                    <div className="id-advisor-card">
                      <div className="id-advisor-label">
                        What Happened
                      </div>
                      <div className="id-advisor-text">
                        {advisor.what_happened || '—'}
                      </div>
                    </div>

                    <div className="id-advisor-card">
                      <div className="id-advisor-label">
                        Likely Cause
                      </div>
                      <div className="id-advisor-text">
                        {advisor.likely_cause || '—'}
                      </div>
                    </div>

                    <div className="id-advisor-card full">
                      <div className="id-advisor-label">
                        Recommended Fix
                      </div>

                      {fixes.length ? (
                        <ol className="id-fix-list">
                          {fixes.map((fix, index) => (
                            <li key={`${index}-${fix}`}>
                              {fix}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="id-advisor-text">
                          No recommendation was saved.
                        </div>
                      )}
                    </div>

                    <div className="id-advisor-card">
                      <div className="id-advisor-label">
                        Why It Helps
                      </div>
                      <div className="id-advisor-text">
                        {advisor.why_it_helps || '—'}
                      </div>
                    </div>

                    <div className="id-advisor-card">
                      <div className="id-advisor-label">
                        Expected Impact
                      </div>
                      <div className="id-advisor-text">
                        {advisor.expected_impact || '—'}
                      </div>
                    </div>

                    <div className="id-advisor-card full">
                      <div className="id-advisor-label">
                        Evidence
                      </div>

                      <div className="id-evidence-grid">
                        <div className="id-evidence-item">
                          <span>Feature</span>
                          <strong>
                            {advisorEvidence.feature ||
                              item.feature ||
                              '—'}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Route</span>
                          <strong>
                            {advisorEvidence.route ||
                              item.source_route ||
                              '—'}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Dependency</span>
                          <strong>
                            {advisorEvidence.dependency ||
                              item.dependency ||
                              '—'}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Method</span>
                          <strong>
                            {advisorEvidence.method ||
                              '—'}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Request Ratio</span>
                          <strong>
                            {advisorEvidence.request_ratio ===
                            null ||
                            advisorEvidence.request_ratio ===
                              undefined
                              ? '—'
                              : `${advisorEvidence.request_ratio}×`}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Byte Ratio</span>
                          <strong>
                            {advisorEvidence.byte_ratio ===
                            null ||
                            advisorEvidence.byte_ratio ===
                              undefined
                              ? '—'
                              : `${advisorEvidence.byte_ratio}×`}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Error Ratio</span>
                          <strong>
                            {advisorEvidence.error_ratio ===
                            null ||
                            advisorEvidence.error_ratio ===
                              undefined
                              ? '—'
                              : `${advisorEvidence.error_ratio}×`}
                          </strong>
                        </div>

                        <div className="id-evidence-item">
                          <span>Driver Avg</span>
                          <strong>
                            {num(
                              advisorEvidence.driver_avg_ms
                            ).toFixed(1)}
                            ms
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="id-advisor-empty">
                  No Optimization Advisor was saved for
                  this incident. Older incidents created
                  before the Advisor was enabled may not
                  contain optimization guidance.
                </div>
              )}
            </section>

            <section className="id-block">
              <div className="id-head">
                Evidence Archive Copy
              </div>

              <div className="id-body">
                <pre className="id-code">
                  {raw}
                </pre>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}
