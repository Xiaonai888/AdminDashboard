import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BORDER = '1px solid #E2E8F0'
const INK = '#0F172A'
const MUTED = '#64748B'

const STAGES = {
  CROP: ['Image crop', 'The selected image could not be prepared before saving.'],
  LOCAL_DRAFT: ['Local image save', 'The image or draft could not be saved on this device.'],
  UPLOAD_QUEUE: ['Local upload queue', 'The selected image could not be queued for online upload.'],
  IMAGE_PROCESS: ['Image preparation', 'The image could not be prepared for upload.'],
  ONLINE_UPLOAD: ['Online image upload', 'The image could not be sent online.'],
  CREATE_STORY: ['Story creation', 'The story creation request could not be completed.'],
  RESTORE_DRAFT: ['Restore local draft', 'An existing draft could not be loaded from this device.'],
  UPDATE_STORY: ['Update story', 'The story changes could not be saved.'],
}

const ERROR_HINTS = {
  STORAGE_FULL: 'Device or browser storage may be full.',
  IMAGE_SAVE_FAILED: 'Local image storage failed. Storage capacity or browser storage behavior may be involved.',
  STORAGE_BLOCKED: 'The browser may be blocking local storage.',
  STORAGE_INTERRUPTED: 'The local storage operation was interrupted.',
  IMAGE_TOO_LARGE: 'The image may exceed the supported size limit.',
  IMAGE_UNREADABLE: 'The image could not be opened or decoded.',
  NETWORK_FAILED: 'The internet connection may have been interrupted.',
  LOGIN_REQUIRED: 'The author may need to sign in again.',
  SERVER_UNAVAILABLE: 'The online service may have been temporarily unavailable.',
}

const count = (value) => Math.max(0, Number(value) || 0).toLocaleString()
const safeDate = (value) => {
  if (!value) return '—'
  const time = new Date(value)
  return Number.isFinite(time.getTime()) ? time.toLocaleString() : '—'
}
const storyName = (type) => type === 'chat_story' ? 'Chat Story' : type === 'manga' ? 'Manga' : 'Novel'
const deviceName = (item) => [item.os, item.browser, item.device].filter(Boolean).join(' · ')

function VerifiedUsers({ users, uniqueCount }) {
  if (uniqueCount > 10 || uniqueCount < 1) return null
  const verified = Array.isArray(users) ? users.slice(0, 10) : []
  if (!verified.length) return <div style={{ fontSize: 10, color: MUTED }}>No verified account names available.</div>
  return (
    <div style={{ display: 'grid', gap: 9 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: INK }}>Verified affected accounts ({count(uniqueCount)})</div>
      {verified.map((person) => (
        <div key={person.user_id} style={{ display: 'flex', flexWrap: 'wrap', columnGap: 12, rowGap: 3, fontSize: 11 }}>
          <strong style={{ color: INK }}>@{person.username || 'username-unavailable'}</strong>
          {person.name ? <span style={{ color: MUTED }}>{person.name}</span> : null}
          <code style={{ overflowWrap: 'anywhere', fontSize: 10, color: MUTED }}>{person.user_id}</code>
        </div>
      ))}
    </div>
  )
}

export default function AdminStoryCreationErrorsPanel({ hours = 24, refreshIndex = 0 }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let token = ''
    try {
      token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
    } catch {}
    if (!token) {
      setError('Admin login is required to view these reports.')
      setReport(null)
      return () => controller.abort()
    }
    setLoading(true)
    setError('')
    fetch(`${API_URL}/api/admin/story-creation-errors?hours=${hours}${refreshIndex ? '&refresh=1' : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      signal: controller.signal,
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}))
      if (!response.ok || body.ok !== true) throw new Error(body.message || body.code || 'Error monitoring request failed')
      return body.report
    }).then((data) => {
      if (!controller.signal.aborted) setReport(data)
    }).catch((failure) => {
      if (!controller.signal.aborted) {
        setError(failure?.message || 'Error monitoring request failed')
        setReport(null)
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [hours, refreshIndex])

  const groups = Array.isArray(report?.groups) ? report.groups : []

  return (
    <div style={{ borderTop: BORDER, padding: 14, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: INK }}>Story Creation Errors</div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>Error-only, verified author accounts · Same time range as Reader Health · No extra polling</div>
        </div>
        <div style={{ fontSize: 10, color: MUTED }}>{loading ? 'Loading…' : report?.generated_at ? `Updated ${safeDate(report.generated_at)}` : ''}</div>
      </div>

      {error ? <div role="alert" style={{ fontSize: 11, color: '#B91C1C' }}>{error}</div> : null}
      {!error && report?.available === false ? (
        <div style={{ fontSize: 11, color: '#B91C1C' }}>Story error reports are unavailable. Check the Backend API and story creation SQL functions.</div>
      ) : null}
      {!error && report?.available === true ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: MUTED }}>
            <span><strong style={{ color: INK }}>{count(report.affected_users)}</strong> unique affected authors</span>
            <span><strong style={{ color: INK }}>{count(report.total_events)}</strong> accepted reports</span>
            <span><strong style={{ color: INK }}>{count(groups.length)}</strong> grouped issues</span>
          </div>
          {groups.length ? groups.map((group, index) => {
            const uniqueCount = Math.max(0, Number(group.user_count) || 0)
            const devices = Array.isArray(group.affected_devices) ? group.affected_devices : []
            const users = uniqueCount >= 1 && uniqueCount <= 10 && Array.isArray(group.users) ? group.users : []
            const names = users.map((person) => person.username ? `@${person.username}` : '').filter(Boolean).join(', ')
            const deviceSummary = devices.slice(0, 3).map((item) => `${item.os} ${item.browser} (${count(item.user_count)})`).join(', ')
            const stage = STAGES[group.stage] || [group.stage || 'Other', 'This operation did not complete.']
            const key = [group.story_type, group.stage, group.error_code, group.error_name, index].join(':')
            return (
              <details key={key} style={{ border: BORDER, borderRadius: 12, background: '#FFFFFF', minWidth: 0, overflow: 'hidden' }}>
                <summary style={{ listStylePosition: 'inside', cursor: 'pointer', padding: '12px 14px', color: INK }}>
                  <div style={{ display: 'inline-grid', verticalAlign: 'middle', gap: 5, maxWidth: 'calc(100% - 22px)', width: 'calc(100% - 22px)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 12 }}>{group.error_code || 'UNKNOWN_ERROR'}</strong>
                      <span style={{ color: MUTED, fontSize: 10 }}>{storyName(group.story_type)} → {stage[0]}</span>
                      <span style={{ color: '#B91C1C', fontSize: 10, fontWeight: 800 }}>{count(uniqueCount)} authors · {count(group.event_count)} reports</span>
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {uniqueCount <= 10 ? `Users: ${names || 'Verified usernames unavailable'}` : `Devices: ${deviceSummary || 'Breakdown unavailable'} · Names hidden (more than 10 authors)`}
                    </div>
                  </div>
                </summary>
                <div style={{ borderTop: BORDER, display: 'grid', gap: 12, padding: '12px 14px', fontSize: 11, color: INK }}>
                  <div><strong>Step:</strong> {stage[0]} · <strong>Observed impact:</strong> {stage[1]}</div>
                  <div><strong>Possible explanation:</strong> {ERROR_HINTS[group.error_code] || 'Cause is not known from this error code alone.'} This is a clue, not a confirmed root cause.</div>
                  <div><strong>Technical error:</strong> {group.error_name || 'Error'} · <strong>Code:</strong> {group.error_code || 'UNKNOWN'}</div>
                  <div><strong>First seen:</strong> {safeDate(group.first_seen_at)} · <strong>Last seen:</strong> {safeDate(group.last_seen_at)}</div>
                  <div>
                    <strong>Browser / OS / device breakdown</strong>
                    {devices.length ? (
                      <div style={{ marginTop: 7, display: 'grid', gap: 5 }}>
                        {devices.map((item, i) => (
                          <div key={`${deviceName(item)}:${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: MUTED }}>
                            <span>{deviceName(item)}</span><span>{count(item.user_count)} authors · {count(item.event_count)} reports</span>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ color: MUTED, marginTop: 6 }}>No device data recorded.</div>}
                  </div>
                  <VerifiedUsers users={users} uniqueCount={uniqueCount} />
                  {uniqueCount > 10 ? <div style={{ color: MUTED }}>More than 10 unique authors affected; individual names and IDs are intentionally hidden.</div> : null}
                </div>
              </details>
            )
          }) : <div style={{ fontSize: 11, color: MUTED, padding: '12px 0' }}>No story creation errors reported for this time range.</div>}
          <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.6 }}>
            Only successfully delivered reports are counted. Same-user repeats are limited, so report totals are not the number of every failure. Some offline or fully frozen devices cannot report. No image files, story content, or raw error messages are stored.
          </div>
        </>
      ) : null}
    </div>
  )
}
