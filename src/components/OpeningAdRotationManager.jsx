import React, { useEffect, useMemo, useRef, useState } from 'react'
import ImageCropModal, { createCroppedImageFile } from './ImageCropModal'
import ImageDropZone from './common/ImageDropZone'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const SHADOW_LOGO_URL = 'https://shadowerabook.site/assets/Icons/Logo%20Shadow%202.svg'
const BRAND_TEXT = 'STORIES LIVE IN THE SHADOWS.'

const openingStyles = `
  .opening-rotation-shell {
    display:grid;
    grid-template-columns:minmax(0,1fr) 390px;
    gap:24px;
    align-items:start;
  }

  .opening-toolbar {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
  }

  .opening-section {
    margin-top:16px;
    padding:16px;
    border:1px solid var(--border);
    border-radius:16px;
    background:#F8FAFC;
  }

  .opening-section:first-child {
    margin-top:0;
  }

  .opening-section-title {
    font-size:13px;
    font-weight:900;
    color:#0F172A;
  }

  .opening-section-help {
    margin-top:4px;
    font-size:11.5px;
    line-height:1.5;
    color:var(--muted);
  }

  .opening-mode {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px;
    margin-top:12px;
  }

  .opening-mode-btn {
    border:1px solid var(--border);
    border-radius:13px;
    padding:11px 12px;
    background:#FFFFFF;
    color:#475569;
    font-family:inherit;
    font-size:12.5px;
    font-weight:900;
    cursor:pointer;
  }

  .opening-mode-btn.active {
    border-color:var(--primary);
    background:var(--primary);
    color:#FFFFFF;
    box-shadow:0 8px 18px rgba(79,70,229,.16);
  }

  .opening-stats {
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-top:12px;
  }

  .opening-stat {
    display:inline-flex;
    align-items:center;
    min-height:28px;
    padding:5px 9px;
    border:1px solid var(--border);
    border-radius:999px;
    background:#FFFFFF;
    color:#475569;
    font-size:11px;
    font-weight:900;
  }

  .opening-stat.live {
    border-color:#A7F3D0;
    background:#ECFDF5;
    color:#047857;
  }

  .opening-stat.next {
    border-color:#C7D2FE;
    background:#EEF2FF;
    color:#4338CA;
  }

  .opening-library-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    margin-top:16px;
  }

  .opening-library-title {
    font-size:14px;
    font-weight:900;
  }

  .opening-library-list {
    display:grid;
    gap:9px;
    margin-top:10px;
  }

  .opening-ad-row {
    display:grid;
    grid-template-columns:26px 48px minmax(0,1fr) auto;
    gap:10px;
    align-items:center;
    padding:10px;
    border:1px solid var(--border);
    border-radius:14px;
    background:#FFFFFF;
    cursor:pointer;
  }

  .opening-ad-row.selected {
    border-color:var(--primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.08);
  }

  .opening-ad-row.archived {
    opacity:.72;
    background:#F8FAFC;
  }

  .opening-drag {
    display:flex;
    align-items:center;
    justify-content:center;
    width:26px;
    height:34px;
    border:none;
    background:transparent;
    color:#94A3B8;
    font-size:18px;
    cursor:grab;
    user-select:none;
  }

  .opening-thumb {
    width:48px;
    height:66px;
    border-radius:9px;
    background:#E2E8F0;
    object-fit:cover;
  }

  .opening-thumb.empty {
    display:flex;
    align-items:center;
    justify-content:center;
    color:#94A3B8;
    font-size:9px;
    font-weight:900;
    text-align:center;
  }

  .opening-ad-name {
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:12.5px;
    font-weight:900;
    color:#0F172A;
  }

  .opening-ad-meta {
    display:flex;
    flex-wrap:wrap;
    gap:5px;
    margin-top:5px;
  }

  .opening-mini {
    display:inline-flex;
    align-items:center;
    min-height:22px;
    padding:3px 7px;
    border-radius:999px;
    background:#F1F5F9;
    color:#64748B;
    font-size:9.5px;
    font-weight:900;
  }

  .opening-mini.live {
    background:#D1FAE5;
    color:#047857;
  }

  .opening-mini.next {
    background:#E0E7FF;
    color:#4338CA;
  }

  .opening-mini.editing {
    background:#E0F2FE;
    color:#0369A1;
  }

  .opening-mini.off {
    background:#FEE2E2;
    color:#B91C1C;
  }

  .opening-row-actions {
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:6px;
  }

  .opening-small-btn {
    border:1px solid var(--border);
    border-radius:9px;
    padding:6px 8px;
    background:#FFFFFF;
    color:#475569;
    font-family:inherit;
    font-size:10px;
    font-weight:900;
    cursor:pointer;
    white-space:nowrap;
  }

  .opening-small-btn.primary {
    border-color:#C7D2FE;
    background:#EEF2FF;
    color:#4338CA;
  }

  .opening-small-btn.danger {
    border-color:#FECACA;
    background:#FEF2F2;
    color:#B91C1C;
  }

  .opening-small-btn.success {
    border-color:#A7F3D0;
    background:#ECFDF5;
    color:#047857;
  }

  .opening-small-btn:disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .opening-loop-check {
    display:flex;
    align-items:center;
    gap:5px;
    font-size:10px;
    font-weight:900;
    color:#475569;
  }

  .opening-loop-check input {
    width:15px;
    height:15px;
    accent-color:var(--primary);
  }

  .opening-order-buttons {
    display:flex;
    gap:4px;
  }

  .opening-order-buttons button {
    width:28px;
    height:26px;
    border:1px solid var(--border);
    border-radius:8px;
    background:#FFFFFF;
    color:#475569;
    font-weight:900;
    cursor:pointer;
  }

  .opening-order-buttons button:disabled {
    opacity:.35;
    cursor:not-allowed;
  }

  .opening-divider {
    height:1px;
    background:var(--border);
    margin:18px 0;
  }

  .opening-editor-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }

  .opening-editor-title {
    font-size:14px;
    font-weight:900;
  }

  .opening-warning {
    margin-top:12px;
    padding:11px 12px;
    border:1px solid #FDE68A;
    border-radius:12px;
    background:#FFFBEB;
    color:#92400E;
    font-size:11.5px;
    font-weight:800;
    line-height:1.5;
  }

  .opening-inline-actions {
    display:flex;
    justify-content:flex-end;
    flex-wrap:wrap;
    gap:8px;
    margin-top:12px;
  }

  .opening-archived {
    margin-top:14px;
  }

  .opening-archived summary {
    cursor:pointer;
    color:#64748B;
    font-size:12px;
    font-weight:900;
  }

  .opening-preview-labels {
    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    gap:7px;
    margin-top:12px;
  }

  .opening-preview-badge {
    padding:5px 8px;
    border-radius:999px;
    background:#F1F5F9;
    color:#475569;
    font-size:10px;
    font-weight:900;
  }

  .opening-preview-badge.live {
    background:#D1FAE5;
    color:#047857;
  }

  @media(max-width:1100px) {
    .opening-rotation-shell {
      grid-template-columns:1fr;
    }
  }

  @media(max-width:760px) {
    .opening-ad-row {
      grid-template-columns:24px 42px minmax(0,1fr);
    }

    .opening-row-actions {
      grid-column:1 / -1;
      flex-direction:row;
      justify-content:flex-end;
      flex-wrap:wrap;
    }

    .opening-thumb {
      width:42px;
      height:58px;
    }

    .opening-mode {
      grid-template-columns:1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function createEditor() {
  return {
    id: null,
    name: 'New Opening Ad',
    enabled: true,
    imageUrl: '',
    linkUrl: '',
    badge: 'NEW',
    durationSeconds: 5,
    closeAfterSeconds: 3,
    frequency: 'once_per_session',
    inLoop: false,
    sortOrder: null,
    isArchived: false,
  }
}

function itemToEditor(item) {
  return {
    id: item.id,
    name: item.name || `Opening Ad ${item.id}`,
    enabled: Boolean(item.enabled),
    imageUrl: item.image_url || '',
    linkUrl: item.link_url || '',
    badge: item.badge || '',
    durationSeconds: Number(item.duration_seconds ?? 5),
    closeAfterSeconds: Number(item.close_after_seconds ?? 3),
    frequency: item.frequency || 'once_per_session',
    inLoop: Boolean(item.in_loop),
    sortOrder: Number(item.sort_order || 1),
    isArchived: Boolean(item.is_archived),
  }
}

function normalizeSettings(settings) {
  return {
    enabled: Boolean(settings?.enabled),
    mode: settings?.mode === 'auto' ? 'auto' : 'manual',
    manualAdId: settings?.manual_ad_id || null,
    rotateEverySeconds: Math.max(60, Number(settings?.rotate_every_seconds || 3600)),
    maxAds: Math.max(1, Number(settings?.max_ads || 1)),
    rotationStartedAt: settings?.rotation_started_at || null,
  }
}

function intervalParts(seconds) {
  const value = Math.max(60, Number(seconds || 3600))
  if (value % 3600 === 0) {
    return { value: value / 3600, unit: 'hours' }
  }
  return { value: Math.max(1, Math.round(value / 60)), unit: 'minutes' }
}

function intervalSeconds(value, unit) {
  const number = Math.max(1, Number(value || 1))
  return unit === 'hours' ? Math.round(number * 3600) : Math.round(number * 60)
}

async function request(path, options = {}) {
  const token = getAdminToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export default function OpeningAdRotationManager({ onChanged }) {
  const fileInputRef = useRef(null)
  const dragIdRef = useRef(null)
  const [settings, setSettings] = useState(normalizeSettings(null))
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState('new')
  const [editor, setEditor] = useState(createEditor())
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [intervalValue, setIntervalValue] = useState(1)
  const [intervalUnit, setIntervalUnit] = useState('hours')
  const [cropOpen, setCropOpen] = useState(false)
  const [cropImage, setCropImage] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [now, setNow] = useState(Date.now())

  const activeItems = useMemo(
    () =>
      items
        .filter((item) => !item.is_archived)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(a.id) - Number(b.id)),
    [items],
  )

  const archivedItems = useMemo(
    () => items.filter((item) => item.is_archived),
    [items],
  )

  const loopItems = useMemo(
    () =>
      activeItems
        .filter((item) => item.enabled && item.in_loop)
        .slice(0, Math.max(1, Number(settings.maxAds || 1))),
    [activeItems, settings.maxAds],
  )

  const manualSelectedItem = useMemo(
    () =>
      settings.manualAdId
        ? activeItems.find((item) => Number(item.id) === Number(settings.manualAdId)) || null
        : null,
    [activeItems, settings.manualAdId],
  )

  const liveInfo = useMemo(() => {
    if (!settings.enabled) {
      return { liveId: null, nextId: null, remaining: 0 }
    }

    if (settings.mode === 'manual') {
      return {
        liveId: manualSelectedItem?.enabled ? Number(manualSelectedItem.id) : null,
        nextId: null,
        remaining: 0,
      }
    }

    if (!loopItems.length) {
      return { liveId: null, nextId: null, remaining: 0 }
    }

    const started = new Date(settings.rotationStartedAt || now).getTime()
    const step = Math.max(60, Number(settings.rotateEverySeconds || 3600)) * 1000
    const elapsed = Math.max(0, now - started)
    const index = Math.floor(elapsed / step) % loopItems.length
    const remaining = Math.max(0, Math.ceil((step - (elapsed % step)) / 1000))

    return {
      liveId: Number(loopItems[index]?.id || 0) || null,
      nextId: loopItems.length > 1 ? Number(loopItems[(index + 1) % loopItems.length]?.id || 0) : null,
      remaining,
    }
  }, [settings, loopItems, manualSelectedItem, now])

  const previewImage = previewUrl || editor.imageUrl || ''
  const selectedIsLive = editor.id && Number(editor.id) === Number(liveInfo.liveId)
  const selectedIsNext = editor.id && Number(editor.id) === Number(liveInfo.nextId)

  async function loadRotation(preferredId = null) {
    try {
      setLoading(true)
      setError('')

      const data = await request('/api/advertisements/admin/opening-rotation')
      const nextSettings = normalizeSettings(data.settings)
      const nextItems = Array.isArray(data.items) ? data.items : []
      const parts = intervalParts(nextSettings.rotateEverySeconds)

      setSettings(nextSettings)
      setItems(nextItems)
      setIntervalValue(parts.value)
      setIntervalUnit(parts.unit)

      const wantedId = preferredId === 'new' ? null : Number(preferredId || 0)
      const wanted = wantedId ? nextItems.find((item) => Number(item.id) === wantedId) : null
      const manual = nextSettings.manualAdId
        ? nextItems.find((item) => Number(item.id) === Number(nextSettings.manualAdId) && !item.is_archived)
        : null
      const first = nextItems.find((item) => !item.is_archived)

      const nextSelected = wanted || manual || first
      if (nextSelected) {
        setSelectedId(nextSelected.id)
        setEditor(itemToEditor(nextSelected))
      } else {
        setSelectedId('new')
        setEditor(createEditor())
      }

      setSelectedFile(null)
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    } catch (requestError) {
      setError(requestError.message || 'Failed to load Opening Ad rotation')
    } finally {
      setLoading(false)
    }
  }

  function selectItem(item) {
    setSelectedId(item.id)
    setEditor(itemToEditor(item))
    setSelectedFile(null)
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setMessage('')
    setError('')
  }

  function newItem() {
    setSelectedId('new')
    setEditor(createEditor())
    setSelectedFile(null)
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setMessage('')
    setError('')
  }

  function updateEditor(field, value) {
    setEditor((previous) => ({ ...previous, [field]: value }))
    setMessage('')
    setError('')
  }

  function updateLocalSettings(field, value) {
    setSettings((previous) => ({ ...previous, [field]: value }))
    setMessage('')
    setError('')
  }

  async function restartAutoClock() {
    const data = await request('/api/advertisements/admin/opening-rotation/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restart_rotation: true }),
    })

    const next = normalizeSettings(data.settings)
    setSettings((previous) => ({
      ...previous,
      rotationStartedAt: next.rotationStartedAt,
    }))
    setNow(Date.now())
    return next
  }

  async function handleRestartAutoClock() {
    try {
      setSaving(true)
      setMessage('')
      setError('')
      await restartAutoClock()
      setMessage('Auto Rotation restarted from Ad #1.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to restart Auto Rotation')
    } finally {
      setSaving(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      setMessage('')
      setError('')

      const rotateEverySeconds = intervalSeconds(intervalValue, intervalUnit)

      const data = await request('/api/advertisements/admin/opening-rotation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: settings.enabled,
          mode: settings.mode,
          manual_ad_id: settings.manualAdId,
          rotate_every_seconds: rotateEverySeconds,
          max_ads: Math.max(1, Number(settings.maxAds || 1)),
        }),
      })

      const next = normalizeSettings(data.settings)
      const parts = intervalParts(next.rotateEverySeconds)
      setSettings(next)
      setIntervalValue(parts.value)
      setIntervalUnit(parts.unit)
      setMessage('Opening Ad settings saved.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to save Opening Ad settings')
    } finally {
      setSaving(false)
    }
  }

  async function setManualLive(item) {
    if (!item.enabled) {
      setError('Enable this Ad before setting it LIVE.')
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const data = await request('/api/advertisements/admin/opening-rotation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: settings.enabled,
          mode: 'manual',
          manual_ad_id: item.id,
          rotate_every_seconds: intervalSeconds(intervalValue, intervalUnit),
          max_ads: Math.max(1, Number(settings.maxAds || 1)),
        }),
      })

      setSettings(normalizeSettings(data.settings))
      setMessage(`${item.name || 'Ad'} is now the Manual LIVE Ad.`)
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to set Manual LIVE Ad')
    } finally {
      setSaving(false)
    }
  }

  async function updateItemField(item, field, value) {
    try {
      setSaving(true)
      setMessage('')
      setError('')

      const formData = new FormData()
      formData.append(field, String(value))

      await request(`/api/advertisements/admin/opening-rotation/items/${item.id}`, {
        method: 'PUT',
        body: formData,
      })

      const eligibilityChanged =
        settings.mode === 'auto' &&
        field === 'in_loop' &&
        Boolean(item.enabled) &&
        Boolean(item.in_loop) !== Boolean(value)

      if (eligibilityChanged) await restartAutoClock()
      await loadRotation(selectedId)
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to update Ad')
    } finally {
      setSaving(false)
    }
  }

  async function saveEditor() {
    try {
      setSaving(true)
      setMessage('')
      setError('')

      if (!String(editor.name || '').trim()) {
        throw new Error('Ad name is required.')
      }

      if (!selectedFile && !String(editor.imageUrl || '').trim()) {
        throw new Error('Upload an image before saving this Ad.')
      }

      const existingItem = editor.id
        ? items.find((item) => Number(item.id) === Number(editor.id)) || null
        : null
      const formData = new FormData()
      if (selectedFile) formData.append('image', selectedFile)

      formData.append('name', String(editor.name || '').trim())
      formData.append('enabled', String(Boolean(editor.enabled)))
      formData.append('image_url', editor.imageUrl || '')
      formData.append('link_url', editor.linkUrl || '')
      formData.append('badge', editor.badge || '')
      formData.append('duration_seconds', String(Math.max(1, Number(editor.durationSeconds || 1))))
      formData.append('close_after_seconds', String(Math.max(0, Number(editor.closeAfterSeconds || 0))))
      formData.append('frequency', editor.frequency || 'once_per_session')
      formData.append('in_loop', String(Boolean(editor.inLoop)))

      if (editor.id && editor.sortOrder) {
        formData.append('sort_order', String(editor.sortOrder))
      }

      const isNew = selectedId === 'new'
      const path = isNew
        ? '/api/advertisements/admin/opening-rotation/items'
        : `/api/advertisements/admin/opening-rotation/items/${editor.id}`

      const data = await request(path, {
        method: isNew ? 'POST' : 'PUT',
        body: formData,
      })

      const savedId = data.item?.id || editor.id
      const wasEligible = Boolean(existingItem?.enabled && existingItem?.in_loop)
      const willBeEligible = Boolean(editor.enabled && editor.inLoop)
      const shouldRestartAuto =
        settings.mode === 'auto' &&
        (isNew ? willBeEligible : wasEligible !== willBeEligible)

      if (shouldRestartAuto) await restartAutoClock()

      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
      setSelectedFile(null)
      setMessage(isNew ? 'New Opening Ad created.' : 'Opening Ad saved.')
      await loadRotation(savedId)
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to save Opening Ad')
    } finally {
      setSaving(false)
    }
  }

  async function archiveItem(item) {
    if (!item) return
    if (!window.confirm(`Archive "${item.name || 'this Ad'}"?`)) return

    try {
      setSaving(true)
      setMessage('')
      setError('')

      await request(`/api/advertisements/admin/opening-rotation/items/${item.id}`, {
        method: 'DELETE',
      })

      await loadRotation(null)
      setMessage('Ad archived. Manual mode will show no Ad until another enabled Ad is set LIVE.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to archive Ad')
    } finally {
      setSaving(false)
    }
  }

  async function restoreItem(item) {
    try {
      setSaving(true)
      setMessage('')
      setError('')

      const data = await request(`/api/advertisements/admin/opening-rotation/items/${item.id}/restore`, {
        method: 'POST',
      })

      await loadRotation(data.item?.id || item.id)
      setMessage('Ad restored. It is restored as Disabled and outside the loop.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to restore Ad')
    } finally {
      setSaving(false)
    }
  }

  async function duplicateItem(item) {
    if (!item) return

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const formData = new FormData()
      formData.append('name', `${item.name || `Opening Ad ${item.id}`} Copy`)
      formData.append('enabled', 'false')
      formData.append('image_url', item.image_url || '')
      formData.append('link_url', item.link_url || '')
      formData.append('badge', item.badge || '')
      formData.append('duration_seconds', String(Number(item.duration_seconds ?? 5)))
      formData.append('close_after_seconds', String(Number(item.close_after_seconds ?? 3)))
      formData.append('frequency', item.frequency || 'once_per_session')
      formData.append('in_loop', 'false')

      const data = await request('/api/advertisements/admin/opening-rotation/items', {
        method: 'POST',
        body: formData,
      })

      await loadRotation(data.item?.id || null)
      setMessage('Ad duplicated as Disabled and outside the loop.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to duplicate Ad')
    } finally {
      setSaving(false)
    }
  }

  async function persistOrder(nextItems) {
    const changed = nextItems.filter((item, index) => Number(item.sort_order || 0) !== index + 1)
    if (!changed.length) return

    await Promise.all(
      changed.map((item) => {
        const actualIndex = nextItems.findIndex((candidate) => Number(candidate.id) === Number(item.id))
        const formData = new FormData()
        formData.append('sort_order', String(actualIndex + 1))
        return request(`/api/advertisements/admin/opening-rotation/items/${item.id}`, {
          method: 'PUT',
          body: formData,
        })
      }),
    )
  }

  async function moveItem(itemId, direction) {
    const currentIndex = activeItems.findIndex((item) => Number(item.id) === Number(itemId))
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= activeItems.length) return

    const next = [...activeItems]
    const [moved] = next.splice(currentIndex, 1)
    next.splice(targetIndex, 0, moved)

    try {
      setSaving(true)
      setError('')
      await persistOrder(next)
      if (settings.mode === 'auto') await restartAutoClock()
      await loadRotation(selectedId)
      setMessage(settings.mode === 'auto' ? 'Ad order updated. Auto Rotation restarted from #1.' : 'Ad order updated.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to reorder Ads')
    } finally {
      setSaving(false)
    }
  }

  async function handleDrop(targetId) {
    const sourceId = dragIdRef.current
    dragIdRef.current = null
    if (!sourceId || Number(sourceId) === Number(targetId)) return

    const sourceIndex = activeItems.findIndex((item) => Number(item.id) === Number(sourceId))
    const targetIndex = activeItems.findIndex((item) => Number(item.id) === Number(targetId))
    if (sourceIndex < 0 || targetIndex < 0) return

    const next = [...activeItems]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)

    try {
      setSaving(true)
      setError('')
      await persistOrder(next)
      if (settings.mode === 'auto') await restartAutoClock()
      await loadRotation(selectedId)
      setMessage(settings.mode === 'auto' ? 'Ad order updated. Auto Rotation restarted from #1.' : 'Ad order updated.')
      if (typeof onChanged === 'function') onChanged()
    } catch (requestError) {
      setError(requestError.message || 'Failed to reorder Ads')
    } finally {
      setSaving(false)
    }
  }

  function openCropForFile(file) {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    if (cropImage?.startsWith('blob:')) URL.revokeObjectURL(cropImage)
    setCropImage(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropOpen(true)
    setMessage('')
    setError('')
  }

  function closeCropEditor() {
    if (cropImage?.startsWith('blob:')) URL.revokeObjectURL(cropImage)
    setCropOpen(false)
    setCropImage('')
    setCroppedAreaPixels(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function saveCrop() {
    if (!cropImage || !croppedAreaPixels) return

    try {
      const croppedFile = await createCroppedImageFile(
        cropImage,
        croppedAreaPixels,
        1080,
        'opening-ad',
        1920,
      )

      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      setSelectedFile(croppedFile)
      setPreviewUrl(URL.createObjectURL(croppedFile))
      closeCropEditor()
    } catch (cropError) {
      setError(cropError.message || 'Failed to crop image.')
    }
  }

  useEffect(() => {
    loadRotation()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      if (cropImage?.startsWith('blob:')) URL.revokeObjectURL(cropImage)
    }
  }, [previewUrl, cropImage])

  const remainingMinutes = liveInfo.remaining
    ? `${Math.floor(liveInfo.remaining / 60)}m ${liveInfo.remaining % 60}s`
    : ''

  return (
    <>
      <style>{openingStyles}</style>

      <div className="opening-rotation-shell">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Opening Ad</h3>
              <p>Manage Manual or Auto Rotation without deleting old advertisements.</p>
            </div>

            <button type="button" className="btn-primary" onClick={newItem} disabled={saving}>
              + New Ad
            </button>
          </div>

          <div className="panel-body">
            <div className="opening-section">
              <div className="toggle-row" style={{ marginTop: 0 }}>
                <div>
                  <div className="toggle-title">Enable Opening Ad</div>
                  <div className="toggle-help">Master switch for this placement.</div>
                </div>

                <button
                  type="button"
                  className={`switch ${settings.enabled ? 'on' : ''}`}
                  onClick={() => updateLocalSettings('enabled', !settings.enabled)}
                  aria-pressed={settings.enabled}
                >
                  <span className="switch-thumb" />
                </button>
              </div>

              <div className="opening-section-title" style={{ marginTop: 16 }}>Ad Mode</div>
              <div className="opening-section-help">Manual and Auto are mutually exclusive. Only one mode can run.</div>

              <div className="opening-mode">
                <button
                  type="button"
                  className={`opening-mode-btn ${settings.mode === 'manual' ? 'active' : ''}`}
                  onClick={() => updateLocalSettings('mode', 'manual')}
                >
                  Manual
                </button>

                <button
                  type="button"
                  className={`opening-mode-btn ${settings.mode === 'auto' ? 'active' : ''}`}
                  onClick={() => updateLocalSettings('mode', 'auto')}
                >
                  Auto Rotation
                </button>
              </div>

              {settings.mode === 'auto' ? (
                <div className="grid">
                  <div>
                    <label className="field-label">Rotate Every</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={intervalValue}
                      onChange={(event) => setIntervalValue(Math.max(1, Number(event.target.value || 1)))}
                    />
                  </div>

                  <div>
                    <label className="field-label">Unit</label>
                    <select
                      className="input"
                      value={intervalUnit}
                      onChange={(event) => setIntervalUnit(event.target.value)}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="field-label">Max Ads in Loop</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.maxAds}
                      onChange={(event) => updateLocalSettings('maxAds', Math.max(1, Number(event.target.value || 1)))}
                    />
                  </div>
                </div>
              ) : null}

              <div className="opening-stats">
                <span className={`opening-stat ${liveInfo.liveId ? 'live' : ''}`}>
                  {settings.enabled ? `Current: ${liveInfo.liveId ? `Ad #${liveInfo.liveId}` : 'None'}` : 'Placement Disabled'}
                </span>

                {settings.mode === 'auto' ? (
                  <>
                    <span className="opening-stat">{loopItems.length} Ad(s) in active loop</span>
                    {liveInfo.nextId ? <span className="opening-stat next">Next: Ad #{liveInfo.nextId}</span> : null}
                    {remainingMinutes ? <span className="opening-stat">Changes in {remainingMinutes}</span> : null}
                  </>
                ) : null}
              </div>

              {settings.mode === 'auto' && settings.enabled && loopItems.length === 0 ? (
                <div className="opening-warning">
                  Auto is enabled but no eligible Ad is in the loop. Opening Ad will not show until an enabled Ad is checked In Loop.
                </div>
              ) : null}

              {settings.mode === 'manual' && settings.enabled && !manualSelectedItem?.enabled ? (
                <div className="opening-warning">
                  Manual mode has no enabled LIVE Ad. Choose an enabled Ad and click Set Live.
                </div>
              ) : null}

              {settings.mode === 'auto' ? (
                <div className="opening-inline-actions">
                  <button
                    type="button"
                    className="opening-small-btn primary"
                    onClick={handleRestartAutoClock}
                    disabled={saving || loopItems.length === 0}
                  >
                    Restart From #1
                  </button>
                </div>
              ) : null}

              <div className="btn-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => loadRotation(selectedId)}
                  disabled={loading || saving}
                >
                  {loading ? 'Loading...' : 'Reload'}
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={saveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Rotation Settings'}
                </button>
              </div>
            </div>

            <div className="opening-library-head">
              <div>
                <div className="opening-library-title">Ad Library ({activeItems.length})</div>
                <div className="opening-section-help">
                  Drag rows or use arrows to change order. Auto mode uses the first checked Ads up to Max Ads.
                </div>
              </div>
            </div>

            <div className="opening-library-list">
              {activeItems.length === 0 ? (
                <div className="record-empty">No Opening Ads yet. Click + New Ad.</div>
              ) : (
                activeItems.map((item, index) => {
                  const isSelected = Number(selectedId) === Number(item.id)
                  const isLive = Number(liveInfo.liveId) === Number(item.id)
                  const isNext = Number(liveInfo.nextId) === Number(item.id)

                  return (
                    <div
                      key={item.id}
                      className={`opening-ad-row ${isSelected ? 'selected' : ''}`}
                      draggable={!saving}
                      onDragStart={() => {
                        dragIdRef.current = item.id
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(item.id)}
                      onClick={() => selectItem(item)}
                    >
                      <div className="opening-drag">⋮⋮</div>

                      {item.image_url ? (
                        <img className="opening-thumb" src={item.image_url} alt="" />
                      ) : (
                        <div className="opening-thumb empty">NO IMAGE</div>
                      )}

                      <div>
                        <div className="opening-ad-name">{item.name || `Opening Ad ${item.id}`}</div>
                        <div className="opening-ad-meta">
                          <span className="opening-mini">#{index + 1}</span>
                          <span className={`opening-mini ${item.enabled ? '' : 'off'}`}>
                            {item.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          {item.in_loop ? <span className="opening-mini">In Loop</span> : null}
                          {isSelected ? <span className="opening-mini editing">EDITING</span> : null}
                          {isLive ? <span className="opening-mini live">LIVE</span> : null}
                          {isNext ? <span className="opening-mini next">NEXT</span> : null}
                        </div>
                      </div>

                      <div className="opening-row-actions" onClick={(event) => event.stopPropagation()}>
                        {settings.mode === 'auto' ? (
                          <label className="opening-loop-check">
                            <input
                              type="checkbox"
                              checked={Boolean(item.in_loop)}
                              disabled={saving}
                              onChange={(event) => updateItemField(item, 'in_loop', event.target.checked)}
                            />
                            In Loop
                          </label>
                        ) : (
                          <button
                            type="button"
                            className={`opening-small-btn ${isLive ? 'success' : 'primary'}`}
                            disabled={saving || isLive || !item.enabled}
                            onClick={() => setManualLive(item)}
                          >
                            {isLive ? 'LIVE' : 'Set Live'}
                          </button>
                        )}

                        <button
                          type="button"
                          className="opening-small-btn"
                          disabled={saving}
                          onClick={() => duplicateItem(item)}
                        >
                          Duplicate
                        </button>

                        <div className="opening-order-buttons">
                          <button
                            type="button"
                            disabled={saving || index === 0}
                            onClick={() => moveItem(item.id, -1)}
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={saving || index === activeItems.length - 1}
                            onClick={() => moveItem(item.id, 1)}
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {archivedItems.length ? (
              <details className="opening-archived">
                <summary>Archived Ads ({archivedItems.length})</summary>

                <div className="opening-library-list">
                  {archivedItems.map((item) => (
                    <div key={item.id} className="opening-ad-row archived">
                      <div className="opening-drag">—</div>

                      {item.image_url ? (
                        <img className="opening-thumb" src={item.image_url} alt="" />
                      ) : (
                        <div className="opening-thumb empty">NO IMAGE</div>
                      )}

                      <div>
                        <div className="opening-ad-name">{item.name || `Opening Ad ${item.id}`}</div>
                        <div className="opening-ad-meta">
                          <span className="opening-mini off">Archived</span>
                        </div>
                      </div>

                      <div className="opening-row-actions">
                        <button
                          type="button"
                          className="opening-small-btn success"
                          disabled={saving}
                          onClick={() => restoreItem(item)}
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}

            <div className="opening-divider" />

            <div className="opening-editor-head">
              <div>
                <div className="opening-editor-title">
                  {selectedId === 'new' ? 'Create New Ad' : `Edit Ad #${editor.id}`}
                </div>
                <div className="opening-section-help">
                  User Frequency controls how often one reader can see this Ad. It is separate from Auto Rotation.
                </div>
              </div>
            </div>

            <label className="field-label">Ad Name</label>
            <input
              className="input"
              value={editor.name}
              disabled={editor.isArchived}
              onChange={(event) => updateEditor('name', event.target.value)}
              placeholder="Example: September Manga Promo"
            />

            <div className="toggle-row">
              <div>
                <div className="toggle-title">Enable This Ad</div>
                <div className="toggle-help">Disabled Ads are skipped even when checked In Loop.</div>
              </div>

              <button
                type="button"
                className={`switch ${editor.enabled ? 'on' : ''}`}
                disabled={editor.isArchived}
                onClick={() => updateEditor('enabled', !editor.enabled)}
                aria-pressed={editor.enabled}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <label className="field-label">Image URL</label>
            <input
              className="input"
              value={editor.imageUrl}
              readOnly
              placeholder="Auto-filled after upload"
            />

            <ImageDropZone
              label="Drop image here"
              onFiles={(files) => openCropForFile(files[0])}
            >
              <label className="upload-box">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => openCropForFile(event.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                <div className="upload-title">Drop image here or click to choose</div>
                <div className="upload-help">
                  Auto crop: 9:16 · Output: 1080×1920 · Saved to R2 when you click Save Ad.
                </div>
              </label>
            </ImageDropZone>

            <label className="field-label">Badge</label>
            <select
              className="input"
              value={editor.badge}
              onChange={(event) => updateEditor('badge', event.target.value)}
            >
              <option value="">No Badge</option>
              <option value="NEW">New</option>
              <option value="HOT">Hot</option>
              <option value="TOP">Top</option>
              <option value="END">End</option>
              <option value="UP">Up</option>
            </select>

            <label className="field-label">Click Link URL</label>
            <input
              className="input"
              value={editor.linkUrl}
              onChange={(event) => updateEditor('linkUrl', event.target.value)}
              placeholder="https://shadowerabook.site/..."
            />

            <div className="grid">
              <div>
                <label className="field-label">Duration Seconds</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={editor.durationSeconds}
                  onChange={(event) => updateEditor('durationSeconds', Math.max(1, Number(event.target.value || 1)))}
                />
              </div>

              <div>
                <label className="field-label">Close After Seconds</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={editor.closeAfterSeconds}
                  onChange={(event) => updateEditor('closeAfterSeconds', Math.max(0, Number(event.target.value || 0)))}
                />
              </div>
            </div>

            <label className="field-label">User Frequency</label>
            <select
              className="input"
              value={editor.frequency}
              onChange={(event) => updateEditor('frequency', event.target.value)}
            >
              <option value="once_per_session">Once per session</option>
              <option value="once_per_day">Once per day</option>
              <option value="every_visit">Every visit</option>
              <option value="every_unlock">Every Unlock & Read</option>
            </select>

            {settings.mode === 'auto' ? (
              <div className="toggle-row">
                <div>
                  <div className="toggle-title">In Loop</div>
                  <div className="toggle-help">Only enabled Ads checked here can participate in Auto Rotation.</div>
                </div>

                <button
                  type="button"
                  className={`switch ${editor.inLoop ? 'on' : ''}`}
                  onClick={() => updateEditor('inLoop', !editor.inLoop)}
                  aria-pressed={editor.inLoop}
                >
                  <span className="switch-thumb" />
                </button>
              </div>
            ) : null}

            {message ? <div className="saved">{message}</div> : null}
            {error ? <div className="error-box">{error}</div> : null}

            <div className="btn-row">
              {selectedId !== 'new' ? (
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => archiveItem(items.find((item) => Number(item.id) === Number(editor.id)))}
                >
                  Archive
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={newItem} disabled={saving}>
                  Clear
                </button>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={saveEditor}
                disabled={saving || editor.isArchived}
              >
                {saving ? 'Saving...' : selectedId === 'new' ? 'Create Ad' : 'Save Ad'}
              </button>
            </div>
          </div>
        </section>

        <aside className="panel preview-panel">
          <div className="panel-header">
            <div>
              <h3>Mobile Preview</h3>
              <p>Preview the Ad currently selected in the library.</p>
            </div>
          </div>

          <div className="panel-body">
            <div className="phone-preview">
              <div className="phone-screen">
                {previewImage ? (
                  <>
                    <div className="ad-preview-image">
                      <img src={previewImage} alt="Advertisement preview" />
                      <div className="phone-shadow-top" />

                      {editor.badge ? (
                        <span className={`ad-badge ${String(editor.badge).toLowerCase()}`}>
                          {editor.badge}
                        </span>
                      ) : null}

                      {editor.closeAfterSeconds > 0 ? (
                        <span className="close-pill">
                          <span className="close-pill-count">{editor.closeAfterSeconds}S</span>
                          <span>Skip</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="ad-brand-footer">
                      <img className="ad-brand-logo" src={SHADOW_LOGO_URL} alt="Shadow" />
                      <div className="ad-brand-text">{BRAND_TEXT}</div>
                    </div>
                  </>
                ) : (
                  <div className="preview-empty">Upload an image to preview this advertisement.</div>
                )}
              </div>
            </div>

            <div className="opening-preview-labels">
              <span className="opening-preview-badge">
                {selectedId === 'new' ? 'NEW DRAFT' : `Ad #${editor.id}`}
              </span>
              {selectedIsLive ? <span className="opening-preview-badge live">LIVE</span> : null}
              {selectedIsNext ? <span className="opening-preview-badge">NEXT</span> : null}
              <span className="opening-preview-badge">
                {editor.enabled ? 'Enabled' : 'Disabled'}
              </span>
              {settings.mode === 'auto' && editor.inLoop ? (
                <span className="opening-preview-badge">In Loop</span>
              ) : null}
            </div>

            <div className="note-box">
              Mode: {settings.mode === 'auto' ? 'Auto Rotation' : 'Manual'} · Placement:{' '}
              {settings.enabled ? 'Enabled' : 'Disabled'}.
            </div>
          </div>
        </aside>
      </div>

      <ImageCropModal
        open={cropOpen}
        image={cropImage}
        crop={crop}
        zoom={zoom}
        croppedAreaPixels={croppedAreaPixels}
        title="Crop Opening Ad"
        helper="Move and zoom the image inside the 9:16 frame."
        aspect={9 / 16}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        onClose={closeCropEditor}
        onSave={saveCrop}
      />
    </>
  )
}
