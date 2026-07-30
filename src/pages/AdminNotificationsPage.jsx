import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const TARGET_OPTIONS = [
  { key: 'all', label: 'All readers', note: 'Send to every reader account.' },
  { key: 'single', label: 'Single reader', note: 'Send to one reader by email or username.' },
  { key: 'selected', label: 'Selected readers', note: 'Send to multiple readers only.' },
]

const TABS = [
  { key: 'compose', label: 'Compose' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'records', label: 'Records' },
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getAdminHeaders(json = false) {
  const token = getAdminToken()

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

function targetLabel(value) {
  if (value === 'single') return 'Single reader'
  if (value === 'selected') return 'Selected readers'
  return 'All readers'
}

function actionLabel(value) {
  const action = String(value || '').toUpperCase()
  if (action === 'UPDATE') return 'Update'
  if (action === 'DELETE') return 'Delete'
  if (action === 'SEND') return 'Send'
  return action || 'Record'
}

const styles = `
  .notification-admin-page {
    max-width: 1480px;
    margin: 0 auto;
  }

  .notification-admin-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .notification-admin-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .notification-admin-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
    color: #0F172A;
  }

  .notification-admin-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    max-width: 720px;
  }

  .notification-admin-refresh {
    height: 42px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .notification-admin-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .notification-admin-stat {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  }

  .notification-admin-stat-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .notification-admin-stat-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .notification-admin-tabs {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 7px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    margin-bottom: 18px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  }

  .notification-admin-tab {
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: #64748B;
    min-width: 138px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .notification-admin-tab.active {
    background: #111827;
    color: #FFFFFF;
    box-shadow: 0 12px 22px rgba(17, 24, 39, .16);
  }

  .notification-admin-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .notification-admin-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .notification-admin-card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
    color: #0F172A;
  }

  .notification-admin-card-note {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .notification-admin-grid {
    display: grid;
    grid-template-columns: minmax(340px, 460px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .notification-admin-form {
    padding: 20px 22px 22px;
  }

  .notification-admin-target-grid {
    display: grid;
    gap: 9px;
    margin-bottom: 16px;
  }

  .notification-admin-target-button {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    border-radius: 16px;
    padding: 12px 13px;
    text-align: left;
    font-family: inherit;
    cursor: pointer;
  }

  .notification-admin-target-button.active {
    border-color: #4F46E5;
    background: linear-gradient(135deg, #EEF2FF, #FFFFFF);
    color: #0F172A;
    box-shadow: 0 10px 22px rgba(79, 70, 229, .09);
  }

  .notification-admin-target-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    font-weight: 900;
  }

  .notification-admin-target-note {
    margin-top: 4px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 650;
    line-height: 1.45;
  }

  .notification-admin-target-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #CBD5E1;
  }

  .notification-admin-target-button.active .notification-admin-target-dot {
    background: #4F46E5;
  }

  .notification-admin-field {
    display: block;
    margin-bottom: 15px;
  }

  .notification-admin-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .notification-admin-limit {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 800;
  }

  .notification-admin-input,
  .notification-admin-textarea {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    border-radius: 14px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    transition: border-color .15s, box-shadow .15s;
  }

  .notification-admin-input {
    height: 44px;
    padding: 0 12px;
  }

  .notification-admin-textarea {
    min-height: 138px;
    padding: 12px;
    resize: vertical;
    line-height: 1.6;
  }

  .notification-admin-recipient-box {
    min-height: 92px;
  }

  .notification-admin-help {
    margin-top: -7px;
    margin-bottom: 14px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 650;
    line-height: 1.5;
  }

  .notification-admin-preview {
    margin-top: 6px;
    border: 1px dashed #CBD5E1;
    background: #F8FAFC;
    border-radius: 18px;
    padding: 13px;
  }

  .notification-admin-preview-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 9px;
  }

  .notification-admin-preview-card {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 18px;
    overflow: hidden;
  }

  .notification-admin-preview-image {
    aspect-ratio: 16 / 9;
    width: 100%;
    background: linear-gradient(135deg, #EEF2FF, #F8FAFC);
    object-fit: cover;
    display: block;
  }

  .notification-admin-preview-body {
    padding: 13px;
  }

  .notification-admin-preview-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
  }

  .notification-admin-preview-message {
    margin-top: 5px;
    color: #475569;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
  }

  .notification-admin-message {
    margin-top: 14px;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
  }

  .notification-admin-message.success {
    background: #D1FAE5;
    color: #047857;
  }

  .notification-admin-message.error {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .notification-admin-not-found {
    margin-top: 8px;
    color: #B45309;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.45;
  }

  .notification-admin-submit {
    width: 100%;
    height: 46px;
    margin-top: 16px;
    border: 0;
    border-radius: 999px;
    background: #111827;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 16px 28px rgba(17, 24, 39, .18);
  }

  .notification-admin-secondary {
    height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .notification-admin-danger {
    height: 34px;
    border: 1px solid #FECACA;
    border-radius: 999px;
    background: #FFF1F2;
    color: #DC2626;
    padding: 0 12px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .notification-admin-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px 20px;
  }

  .notification-admin-item {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 18px;
    padding: 16px;
    transition: .15s;
  }

  .notification-admin-item:hover {
    border-color: #CBD5E1;
    box-shadow: 0 10px 22px rgba(15, 23, 42, .05);
  }

  .notification-admin-item-grid {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .notification-admin-thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, #EEF2FF, #F8FAFC);
    border: 1px solid #E2E8F0;
  }

  .notification-admin-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .notification-admin-thumb-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #4F46E5;
    font-size: 22px;
  }

  .notification-admin-item-top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .notification-admin-item-title {
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    color: #0F172A;
  }

  .notification-admin-item-message {
    margin: 7px 0 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .notification-admin-link {
    display: inline-flex;
    margin-top: 10px;
    max-width: 100%;
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 900;
    word-break: break-all;
  }

  .notification-admin-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 11px;
  }

  .notification-admin-target-badge,
  .notification-admin-unread,
  .notification-admin-action-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 900;
  }

  .notification-admin-target-badge {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .notification-admin-unread {
    background: #FEF3C7;
    color: #92400E;
  }

  .notification-admin-action-badge {
    background: #F1F5F9;
    color: #334155;
  }

  .notification-admin-meta {
    margin-top: 13px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 800;
  }

  .notification-admin-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .notification-admin-empty {
    padding: 52px 24px;
    text-align: center;
    color: #64748B;
    font-weight: 800;
  }

  .notification-admin-empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .notification-admin-pagination {
    border-top: 1px solid #E2E8F0;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #64748B;
    font-size: 12px;
    font-weight: 900;
  }

  .notification-admin-table {
    width: 100%;
    border-collapse: collapse;
  }

  .notification-admin-table th,
  .notification-admin-table td {
    padding: 15px 16px;
    border-bottom: 1px solid #E2E8F0;
    text-align: left;
    vertical-align: top;
    font-size: 12px;
  }

  .notification-admin-table th {
    color: #64748B;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .08em;
    font-weight: 900;
    background: #F8FAFC;
  }

  .notification-admin-table td {
    color: #0F172A;
    font-weight: 800;
  }

  @media (max-width: 980px) {
    .notification-admin-grid {
      grid-template-columns: 1fr;
    }

    .notification-admin-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .notification-admin-item-grid {
      grid-template-columns: 1fr;
    }

    .notification-admin-tabs {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 7px;
      scrollbar-width: none;
    }

    .notification-admin-tabs::-webkit-scrollbar {
      display: none;
    }

    .notification-admin-tab {
      flex: 0 0 auto;
      min-width: 140px;
    }

    .notification-admin-table {
      min-width: 760px;
    }
  }

  @media (max-width: 760px) {
    .notification-admin-page {
      min-width: 0;
    }

    .notification-admin-head {
      align-items: stretch;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 18px;
    }

    .notification-admin-title {
      font-size: 24px;
    }

    .notification-admin-refresh {
      width: 100%;
    }

    .notification-admin-stats {
      gap: 12px;
    }

    .notification-admin-stat {
      padding: 16px;
    }

    .notification-admin-stat-value {
      font-size: 24px;
    }

    .notification-admin-card {
      border-radius: 20px;
    }

    .notification-admin-card-head {
      align-items: stretch;
      flex-direction: column;
      padding: 17px 16px;
    }

    .notification-admin-form {
      padding: 17px 16px 20px;
    }

    .notification-admin-list {
      padding: 16px;
    }

    .notification-admin-item {
      padding: 14px;
    }

    .notification-admin-meta {
      flex-direction: column;
      gap: 5px;
      overflow-wrap: anywhere;
    }

    .notification-admin-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .notification-admin-actions .notification-admin-secondary,
    .notification-admin-actions .notification-admin-danger {
      width: 100%;
    }

    .notification-admin-pagination {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      padding: 14px 16px;
    }

    .notification-admin-pagination .notification-admin-secondary {
      width: 100%;
      padding: 0 10px;
    }

    .notification-admin-pagination > span {
      text-align: center;
      white-space: nowrap;
    }

    .notification-admin-message {
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 520px) {
    .notification-admin-title {
      font-size: 22px;
    }

    .notification-admin-stats {
      grid-template-columns: 1fr;
    }

    .notification-admin-tab {
      min-width: 124px;
      padding: 11px 14px;
      font-size: 12px;
    }

    .notification-admin-label {
      align-items: flex-start;
    }

    .notification-admin-limit {
      flex-shrink: 0;
    }

    .notification-admin-target-title {
      align-items: flex-start;
    }

    .notification-admin-preview {
      padding: 10px;
    }

    .notification-admin-empty {
      padding: 40px 18px;
    }

    .notification-admin-pagination {
      grid-template-columns: 1fr;
    }

    .notification-admin-pagination > span {
      order: -1;
      white-space: normal;
    }
  }
`

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState('compose')
  const [targetType, setTargetType] = useState('all')
  const [recipient, setRecipient] = useState('')
  const [recipients, setRecipients] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [link, setLink] = useState('')
  const [editingReferenceId, setEditingReferenceId] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [records, setRecords] = useState([])
  const [totalReaders, setTotalReaders] = useState(0)
  const [announcementPage, setAnnouncementPage] = useState(1)
  const [announcementPager, setAnnouncementPager] = useState({
    page: 1,
    limit: 5,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [recordPage, setRecordPage] = useState(1)
  const [recordPager, setRecordPager] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState([])

  const selectedCount = useMemo(() => {
    return String(recipients || '')
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean).length
  }, [recipients])

  const stats = useMemo(() => {
    return {
      total: announcementPager.total || announcements.length,
      recipients: announcements.reduce((sum, item) => sum + Number(item.recipient_count || 0), 0),
      unread: announcements.reduce((sum, item) => sum + Number(item.unread_count || 0), 0),
    }
  }, [announcements, announcementPager.total])

  function resetForm() {
    setTargetType('all')
    setRecipient('')
    setRecipients('')
    setTitle('')
    setMessage('')
    setImageUrl('')
    setLink('')
    setEditingReferenceId('')
    setNotFound([])
    setError('')
    setNotice('')
  }

  async function loadAnnouncements(page = announcementPage) {
    try {
      setLoadingAnnouncements(true)
      setError('')

      const response = await fetch(`${API_URL}/api/admin/notifications/announcements?page=${page}&limit=5`, {
        headers: getAdminHeaders(),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load announcements')
      }

      setAnnouncements(data.announcements || [])
      setTotalReaders(Number(data.total_readers || 0))
      setAnnouncementPager({
        page: Number(data.page || page),
        limit: Number(data.limit || 5),
        total: Number(data.total || 0),
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (err) {
      setAnnouncements([])
      setTotalReaders(0)
      setError(err.message || 'Failed to load announcements')
    } finally {
      setLoadingAnnouncements(false)
    }
  }

  async function loadRecords(page = recordPage) {
    try {
      setLoadingRecords(true)
      setError('')

      const response = await fetch(`${API_URL}/api/admin/notifications/records?page=${page}&limit=20`, {
        headers: getAdminHeaders(),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load records')
      }

      setRecords(data.records || [])
      setRecordPager({
        page: Number(data.page || page),
        limit: Number(data.limit || 20),
        total: Number(data.total || 0),
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (err) {
      setRecords([])
      setError(err.message || 'Failed to load records')
    } finally {
      setLoadingRecords(false)
    }
  }

  async function uploadNotificationImage(file) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    setError('Only image files are allowed')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('Image must be under 5MB')
    return
  }

  try {
    setImageUploading(true)
    setError('')
    setNotice('')

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_URL}/api/admin/notifications/upload-image`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: formData,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Failed to upload image')
    }

    setImageUrl(data.image_url || '')
    setNotice('Image uploaded')
  } catch (err) {
    setError(err.message || 'Failed to upload image')
  } finally {
    setImageUploading(false)
  }
}

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    if (!editingReferenceId && targetType === 'single' && !recipient.trim()) {
      setError('Reader email or username is required')
      return
    }

    if (!editingReferenceId && targetType === 'selected' && selectedCount < 1) {
      setError('Add at least one reader email or username')
      return
    }

    try {
      setSending(true)
      setNotice('')
      setError('')
      setNotFound([])

      const endpoint = editingReferenceId
        ? `${API_URL}/api/admin/notifications/announcements/${encodeURIComponent(editingReferenceId)}`
        : `${API_URL}/api/admin/notifications/announcements`

      const response = await fetch(endpoint, {
        method: editingReferenceId ? 'PATCH' : 'POST',
        headers: getAdminHeaders(true),
        body: JSON.stringify({
          target_type: targetType,
          recipient,
          recipients,
          title,
          message,
          image_url: imageUrl,
          link,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        setNotFound(data.not_found || [])
        throw new Error(data.message || 'Failed to save announcement')
      }

      setNotice(data.message || (editingReferenceId ? 'Announcement updated' : 'Announcement sent'))
      resetForm()
      setActiveTab('announcements')
      await loadAnnouncements(1)
      setAnnouncementPage(1)
      await loadRecords(1)
      setRecordPage(1)
    } catch (err) {
      setError(err.message || 'Failed to save announcement')
    } finally {
      setSending(false)
    }
  }

  function startEdit(item) {
    setEditingReferenceId(item.reference_id || '')
    setTargetType(item.target_type || 'all')
    setTitle(item.title || '')
    setMessage(item.message || '')
    setImageUrl(item.image_url || '')
    setLink(item.link || '')
    setRecipient('')
    setRecipients('')
    setNotFound([])
    setNotice('')
    setError('')
    setActiveTab('compose')
  }

  async function deleteAnnouncement(item) {
    const referenceId = item.reference_id || ''

    if (!referenceId) return

    const confirmed = window.confirm(`Delete announcement: ${item.title}?`)

    if (!confirmed) return

    try {
      setError('')
      setNotice('')

      const response = await fetch(`${API_URL}/api/admin/notifications/announcements/${encodeURIComponent(referenceId)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete announcement')
      }

      setNotice(data.message || 'Announcement deleted')
      await loadAnnouncements(announcementPage)
      await loadRecords(1)
      setRecordPage(1)
    } catch (err) {
      setError(err.message || 'Failed to delete announcement')
    }
  }

  function changeAnnouncementPage(nextPage) {
    const page = Math.max(1, nextPage)
    setAnnouncementPage(page)
    loadAnnouncements(page)
  }

  function changeRecordPage(nextPage) {
    const page = Math.max(1, nextPage)
    setRecordPage(page)
    loadRecords(page)
  }

  async function refreshActive() {
    if (activeTab === 'records') {
      await loadRecords(recordPage)
    } else {
      await loadAnnouncements(announcementPage)
    }
  }

  useEffect(() => {
    loadAnnouncements(1)
    loadRecords(1)
  }, [])

  return (
    <AdminLayout title="Notifications" subtitle="Create announcements for readers">
      <style>{styles}</style>

      <div className="notification-admin-page">
        <div className="notification-admin-head">
          <div>
            <div className="notification-admin-kicker">Reader Announcements</div>
            <h1 className="notification-admin-title">Notification Center</h1>
            <p className="notification-admin-subtitle">
              Send official reader notifications to everyone, one reader, or selected readers only. Author Dashboard notifications stay separate.
            </p>
          </div>

          <button type="button" onClick={refreshActive} disabled={loadingAnnouncements || loadingRecords} className="notification-admin-refresh">
            {loadingAnnouncements || loadingRecords ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="notification-admin-stats">
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Announcements</div>
            <div className="notification-admin-stat-value">{stats.total}</div>
          </div>
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Page Recipients</div>
            <div className="notification-admin-stat-value">{stats.recipients}</div>
          </div>
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Page Unread</div>
            <div className="notification-admin-stat-value">{stats.unread}</div>
          </div>
        </div>

        <div className="notification-admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setError('')
                setNotice('')
              }}
              className={`notification-admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notice ? <div className="notification-admin-message success">{notice}</div> : null}
        {error ? <div className="notification-admin-message error">{error}</div> : null}

        {activeTab === 'compose' ? (
          <div className="notification-admin-grid">
            <section className="notification-admin-card">
              <div className="notification-admin-card-head">
                <div>
                  <h2 className="notification-admin-card-title">{editingReferenceId ? 'Edit Announcement' : 'New Announcement'}</h2>
                  <p className="notification-admin-card-note">
                    {editingReferenceId ? 'Update title, image, message, or link.' : 'Choose who receives this notification.'}
                  </p>
                </div>

                {editingReferenceId ? (
                  <button type="button" onClick={resetForm} className="notification-admin-secondary">
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <div className="notification-admin-form">
                <form onSubmit={handleSubmit}>
                  {!editingReferenceId ? (
                    <div className="notification-admin-field">
                      <span className="notification-admin-label">Send to</span>
                      <div className="notification-admin-target-grid">
                        {TARGET_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              setTargetType(option.key)
                              setError('')
                              setNotice('')
                              setNotFound([])
                            }}
                            className={`notification-admin-target-button ${targetType === option.key ? 'active' : ''}`}
                          >
                            <span className="notification-admin-target-title">
                              {option.label}
                              <span className="notification-admin-target-dot" />
                            </span>
                            <span className="notification-admin-target-note">{option.note}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!editingReferenceId && targetType === 'single' ? (
                    <label className="notification-admin-field">
                      <span className="notification-admin-label">Reader email or username</span>
                      <input
                        value={recipient}
                        onChange={(event) => setRecipient(event.target.value)}
                        placeholder="reader@gmail.com or username"
                        className="notification-admin-input"
                      />
                    </label>
                  ) : null}

                  {!editingReferenceId && targetType === 'selected' ? (
                    <label className="notification-admin-field">
                      <span className="notification-admin-label">
                        Reader emails or usernames
                        <span className="notification-admin-limit">{selectedCount} selected</span>
                      </span>
                      <textarea
                        value={recipients}
                        onChange={(event) => setRecipients(event.target.value)}
                        placeholder={'reader1@gmail.com\nreader_two\nreader3@gmail.com'}
                        className="notification-admin-textarea notification-admin-recipient-box"
                      />
                    </label>
                  ) : null}

                  {!editingReferenceId && targetType === 'all' ? (
                    <div className="notification-admin-help">
                      This will send to all current reader accounts. Current reader count: {totalReaders}
                    </div>
                  ) : null}

                  <label className="notification-admin-field">
                    <span className="notification-admin-label">
                      Title
                      <span className="notification-admin-limit">{title.length}/80</span>
                    </span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={80}
                      placeholder="Example: Maintenance notice"
                      className="notification-admin-input"
                    />
                  </label>

                  <label className="notification-admin-field">
  <span className="notification-admin-label">
    Image optional 16:9
    <span className="notification-admin-limit">{imageUploading ? 'Uploading...' : 'Max 5MB'}</span>
  </span>
  <input
    type="file"
    accept="image/*"
    disabled={imageUploading}
    onChange={(event) => uploadNotificationImage(event.target.files?.[0])}
    className="notification-admin-input"
  />
</label>

<label className="notification-admin-field">
  <span className="notification-admin-label">Image URL</span>
  <input
    value={imageUrl}
    onChange={(event) => setImageUrl(event.target.value)}
    placeholder="Uploaded image URL will appear here"
    className="notification-admin-input"
  />
</label>

                  <label className="notification-admin-field">
                    <span className="notification-admin-label">
                      Message
                      <span className="notification-admin-limit">{message.length}/240</span>
                    </span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={240}
                      rows={5}
                      placeholder="Write a short announcement..."
                      className="notification-admin-textarea"
                    />
                  </label>

                  <label className="notification-admin-field">
                    <span className="notification-admin-label">Link optional</span>
                    <input
                      value={link}
                      onChange={(event) => setLink(event.target.value)}
                      placeholder="/notifications"
                      className="notification-admin-input"
                    />
                  </label>

                  <div className="notification-admin-preview">
                    <div className="notification-admin-preview-label">Preview in reader notification</div>
                    <div className="notification-admin-preview-card">
                      {imageUrl.trim() ? (
                        <img src={imageUrl.trim()} alt="" className="notification-admin-preview-image" />
                      ) : (
                        <div className="notification-admin-preview-image" />
                      )}
                      <div className="notification-admin-preview-body">
                        <div className="notification-admin-preview-title">{title.trim() || 'Announcement title'}</div>
                        <div className="notification-admin-preview-message">{message.trim() || 'Announcement message will appear after reader opens it.'}</div>
                      </div>
                    </div>
                  </div>

                  {notFound.length ? (
                    <div className="notification-admin-not-found">
                      Not found: {notFound.slice(0, 8).join(', ')}{notFound.length > 8 ? ` +${notFound.length - 8} more` : ''}
                    </div>
                  ) : null}

                  <button type="submit" disabled={sending} className="notification-admin-submit">
                    {sending ? 'Saving...' : editingReferenceId ? 'Update Announcement' : 'Send Announcement'}
                  </button>
                </form>
              </div>
            </section>

            <section className="notification-admin-card">
              <div className="notification-admin-card-head">
                <div>
                  <h2 className="notification-admin-card-title">Reader Preview</h2>
                  <p className="notification-admin-card-note">Reader list shows image and title first. Full message opens after click.</p>
                </div>
              </div>

              <div className="notification-admin-list">
                <article className="notification-admin-item">
                  <div className="notification-admin-item-grid">
                    <div className="notification-admin-thumb">
                      {imageUrl.trim() ? (
                        <img src={imageUrl.trim()} alt="" />
                      ) : (
                        <div className="notification-admin-thumb-empty">
                          <i className="fas fa-bullhorn" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="notification-admin-item-title">{title.trim() || 'Announcement title'}</h3>
                      <p className="notification-admin-item-message">{message.trim() || 'Full announcement message will appear here after reader opens it.'}</p>
                      <div className="notification-admin-badges">
                        <span className="notification-admin-target-badge">{targetLabel(targetType)}</span>
                        <span className="notification-admin-unread">New</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'announcements' ? (
          <section className="notification-admin-card">
            <div className="notification-admin-card-head">
              <div>
                <h2 className="notification-admin-card-title">Announcements</h2>
                <p className="notification-admin-card-note">5 records per page. Admin can edit or delete sent announcements.</p>
              </div>
            </div>

            {loadingAnnouncements ? (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="fas fa-spinner" />
                </div>
                Loading announcements...
              </div>
            ) : announcements.length ? (
              <div className="notification-admin-list">
                {announcements.map((item) => (
                  <article key={item.reference_id} className="notification-admin-item">
                    <div className="notification-admin-item-grid">
                      <div className="notification-admin-thumb">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" />
                        ) : (
                          <div className="notification-admin-thumb-empty">
                            <i className="fas fa-bullhorn" />
                          </div>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div className="notification-admin-item-top">
                          <div style={{ minWidth: 0 }}>
                            <h3 className="notification-admin-item-title">{item.title}</h3>
                            <p className="notification-admin-item-message">{item.message}</p>
                            {item.link ? <span className="notification-admin-link">{item.link}</span> : null}
                          </div>
                        </div>

                        <div className="notification-admin-badges">
                          <span className="notification-admin-target-badge">{item.target_label || targetLabel(item.target_type)}</span>
                          <span className="notification-admin-unread">{item.unread_count} unread</span>
                          <span className="notification-admin-action-badge">{item.recipient_count} readers</span>
                        </div>

                        <div className="notification-admin-meta">
                          <span>{formatDate(item.created_at)}</span>
                          <span>{item.reference_id}</span>
                        </div>

                        <div className="notification-admin-actions">
                          <button type="button" onClick={() => startEdit(item)} className="notification-admin-secondary">
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteAnnouncement(item)} className="notification-admin-danger">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="far fa-bell" />
                </div>
                No announcements yet.
              </div>
            )}

            <div className="notification-admin-pagination">
              <button type="button" disabled={!announcementPager.has_prev} onClick={() => changeAnnouncementPage(announcementPager.page - 1)} className="notification-admin-secondary">
                Previous
              </button>
              <span>Page {announcementPager.page} / {announcementPager.total_pages} · {announcementPager.total} records</span>
              <button type="button" disabled={!announcementPager.has_next} onClick={() => changeAnnouncementPage(announcementPager.page + 1)} className="notification-admin-secondary">
                Next
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === 'records' ? (
          <section className="notification-admin-card">
            <div className="notification-admin-card-head">
              <div>
                <h2 className="notification-admin-card-title">Notification Records</h2>
                <p className="notification-admin-card-note">Records are shown 20 per page and old records are cleaned after 90 days.</p>
              </div>
            </div>

            {loadingRecords ? (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="fas fa-spinner" />
                </div>
                Loading records...
              </div>
            ) : records.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="notification-admin-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Title</th>
                      <th>Target</th>
                      <th>Recipients</th>
                      <th>Admin</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <span className="notification-admin-action-badge">{actionLabel(record.action)}</span>
                        </td>
                        <td>
                          <div>{record.title || 'Untitled'}</div>
                          <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>{record.reference_id}</div>
                        </td>
                        <td>{targetLabel(record.target_type)}</td>
                        <td>{record.recipient_count || 0}</td>
                        <td>{record.admin_email || record.admin_id || 'Admin'}</td>
                        <td>{formatDate(record.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="far fa-file-lines" />
                </div>
                No records yet.
              </div>
            )}

            <div className="notification-admin-pagination">
              <button type="button" disabled={!recordPager.has_prev} onClick={() => changeRecordPage(recordPager.page - 1)} className="notification-admin-secondary">
                Previous
              </button>
              <span>Page {recordPager.page} / {recordPager.total_pages} · {recordPager.total} records</span>
              <button type="button" disabled={!recordPager.has_next} onClick={() => changeRecordPage(recordPager.page + 1)} className="notification-admin-secondary">
                Next
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  )
}
