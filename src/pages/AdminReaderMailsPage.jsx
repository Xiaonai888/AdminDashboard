import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { compressImage } from '../utils/compressImage'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const TARGET_OPTIONS = [
  { key: 'single', label: 'Single Reader' },
  { key: 'all', label: 'All Readers' },
]

const MAIL_TYPES = [
  { key: 'admin', label: 'Admin Mail' },
  { key: 'system', label: 'System' },
  { key: 'reward', label: 'Reward' },
  { key: 'coupon', label: 'Coupon' },
  { key: 'event', label: 'Event' },
  { key: 'payment', label: 'Payment' },
]

const REWARD_TYPES = [
  { key: '', label: 'No reward' },
  { key: 'coins', label: 'Coins' },
  { key: 'gems', label: 'Gems' },
  { key: 'diamonds', label: 'Diamonds' },
  { key: 'voucher', label: 'Voucher' },
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

function mailTypeLabel(value) {
  return MAIL_TYPES.find((item) => item.key === value)?.label || 'Admin Mail'
}

function senderLabel(value) {
  return value === 'admin' ? 'Admin' : 'System Auto'
}

const styles = `
  .reader-mail-page {
    max-width: 1480px;
    margin: 0 auto;
  }

  .reader-mail-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .reader-mail-kicker {
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

  .reader-mail-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
    color: #0F172A;
  }

  .reader-mail-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    max-width: 720px;
  }

  .reader-mail-refresh {
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

 .reader-mail-activity-card {
  grid-column: 1 / -1;
}

  .reader-mail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}

  .reader-mail-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .reader-mail-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid #E2E8F0;
  }

  .reader-mail-card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
    color: #0F172A;
  }

  .reader-mail-card-note {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .reader-mail-form {
    padding: 20px 22px 22px;
  }

  .reader-mail-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .reader-mail-field {
    margin-bottom: 14px;
  }

  .reader-mail-label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .reader-mail-input,
  .reader-mail-select,
  .reader-mail-textarea {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    border-radius: 14px;
    padding: 12px 13px;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    outline: none;
  }

  .reader-mail-textarea {
    min-height: 96px;
    resize: vertical;
    line-height: 1.55;
  }

  .reader-mail-input:focus,
  .reader-mail-select:focus,
  .reader-mail-textarea:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, .1);
  }

  .reader-mail-targets {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }

  .reader-mail-target {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #64748B;
    border-radius: 15px;
    padding: 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .reader-mail-target.active {
    border-color: #4F46E5;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .reader-mail-button {
    width: 100%;
    border: 0;
    background: #111827;
    color: #FFFFFF;
    height: 46px;
    border-radius: 15px;
    font: inherit;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .reader-mail-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .reader-mail-message {
    margin-bottom: 14px;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 850;
  }

  .reader-mail-message.success {
    background: #ECFDF5;
    color: #047857;
  }

  .reader-mail-message.error {
  background: #FEF2F2;
  color: #DC2626;
}

.reader-mail-upload-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 10px;
}

.reader-mail-upload-button {
  border: 0;
  background: #4F46E5;
  color: #FFFFFF;
  border-radius: 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
}

.reader-mail-upload-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.reader-mail-upload-note {
  margin-top: 8px;
  color: #64748B;
  font-size: 11px;
  font-weight: 800;
}

.reader-mail-image-preview {
  margin-top: 10px;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
}

.reader-mail-thumb {
  width: 58px;
  height: 42px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
}

.reader-mail-history {
  overflow-x: auto;
}
  .reader-mail-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 820px;
  }

  .reader-mail-table th,
  .reader-mail-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #E2E8F0;
    text-align: left;
    vertical-align: top;
  }

  .reader-mail-table th {
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .06em;
    background: #F8FAFC;
  }

  .reader-mail-table td {
    color: #334155;
    font-size: 12px;
    font-weight: 650;
  }

  .reader-mail-mail-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    margin-bottom: 4px;
  }

  .reader-mail-mail-message {
    color: #64748B;
    font-size: 12px;
    line-height: 1.45;
    max-width: 340px;
  }

  .reader-mail-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 900;
    background: #F1F5F9;
    color: #475569;
  }

  .reader-mail-pill.unread {
    background: #FEF2F2;
    color: #DC2626;
  }

  .reader-mail-pill.claimed {
    background: #ECFDF5;
    color: #047857;
  }

.reader-mail-delete-button {
  border: 1px solid #FECACA;
  background: #FEF2F2;
  color: #DC2626;
  border-radius: 10px;
  padding: 7px 10px;
  font: inherit;
  font-size: 11px;
  font-weight: 950;
  cursor: pointer;
}

.reader-mail-delete-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.reader-mail-record-list {
  display: grid;
  gap: 0;
}

.reader-mail-record-item {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px 18px;
  border-top: 1px solid #E2E8F0;
}

.reader-mail-record-image {
  width: 72px;
  height: 46px;
  border-radius: 12px;
  overflow: hidden;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  font-size: 12px;
  font-weight: 900;
}

.reader-mail-record-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reader-mail-record-main {
  min-width: 0;
}

.reader-mail-record-title {
  color: #0F172A;
  font-size: 13px;
  font-weight: 950;
  line-height: 1.25;
}

.reader-mail-record-sub {
  margin-top: 4px;
  color: #64748B;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.4;
}

.reader-mail-record-meta {
  margin-top: 7px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.reader-mail-record-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 720px) {
  .reader-mail-record-item {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .reader-mail-record-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }

  .reader-mail-record-image {
    width: 58px;
    height: 38px;
  }
}

.reader-mail-activity-list {
  display: grid;
  gap: 0;
}

.reader-mail-activity-item {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px 18px;
  border-top: 1px solid #E2E8F0;
}

.reader-mail-activity-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 8px 10px;
  border-radius: 999px;
  background: #EEF2FF;
  color: #4F46E5;
  font-size: 11px;
  font-weight: 950;
}

.reader-mail-activity-main {
  min-width: 0;
}

.reader-mail-activity-title {
  color: #0F172A;
  font-size: 13px;
  font-weight: 950;
  line-height: 1.25;
}

.reader-mail-activity-sub {
  margin-top: 4px;
  color: #64748B;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.4;
}

.reader-mail-activity-meta {
  margin-top: 5px;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}

.reader-mail-activity-date {
  color: #64748B;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .reader-mail-activity-item {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .reader-mail-activity-date {
    grid-column: 1 / -1;
    text-align: right;
  }
}

  .reader-mail-empty {
    padding: 34px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 700;
  }

.reader-mail-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.reader-mail-edit-button {
  border: 1px solid #C7D2FE;
  background: #EEF2FF;
  color: #4F46E5;
  border-radius: 10px;
  padding: 7px 10px;
  font: inherit;
  font-size: 11px;
  font-weight: 950;
  cursor: pointer;
}

  @media (max-width: 980px) {
    .reader-mail-grid {
      grid-template-columns: 1fr;
    }

    .reader-mail-head {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`

const initialForm = {
  target: 'single',
  email: '',
  sender_type: 'admin',
  mail_type: 'admin',
  title: '',
  message: '',
  detail: '',
  action_type: '',
  reward_type: '',
  reward_amount: '',
  image_url: '',
  link: '',
}

export default function AdminReaderMailsPage() {
  const [form, setForm] = useState(initialForm)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [sending, setSending] = useState(false)
  const [deletingMailId, setDeletingMailId] = useState('')
  const [editingMailId, setEditingMailId] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })

  const isRewardMail = form.mail_type === 'reward' || form.action_type === 'claim'

  const canSend = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return false
    if (form.target === 'single' && !form.email.trim()) return false
    if (isRewardMail && (!form.reward_type || Number(form.reward_amount || 0) <= 0)) return false
    return true
  }, [form, isRewardMail])

  const updateForm = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'mail_type' && value === 'reward') {
        next.action_type = 'claim'
        next.sender_type = 'system'
        if (!next.reward_type) next.reward_type = 'coins'
      }

      if (key === 'mail_type' && value !== 'reward' && current.mail_type === 'reward') {
        next.action_type = ''
        next.reward_type = ''
        next.reward_amount = ''
      }

      return next
    })
  }

  async function loadHistory() {
    try {
      setLoadingHistory(true)

      const response = await fetch(`${API_URL}/api/admin/mails/history?limit=5`, {
        headers: getAdminHeaders(),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to load mail history')
      }

      setHistory(data.mails || [])
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to load mail history' })
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
  loadHistory()
  loadLogs()
}, [])

  async function loadLogs() {
  try {
    setLoadingLogs(true)

    const response = await fetch(`${API_URL}/api/admin/mails/logs?limit=20`, {
      headers: getAdminHeaders(),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Failed to load mail records')
    }

    setLogs(data.logs || [])
  } catch (error) {
    setStatus({ type: 'error', message: error.message || 'Failed to load mail records' })
    setLogs([])
  } finally {
    setLoadingLogs(false)
  }
}

  async function uploadReaderMailImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_URL}/api/admin/mails/upload-image`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.ok || !data.image_url) {
    throw new Error(data.message || 'Failed to upload image')
  }

  return data.image_url
}

  async function handleUploadImage() {
  if (!imageFile || uploadingImage) return

  try {
    setUploadingImage(true)
    setStatus({ type: '', message: '' })

    const imageUrl = await uploadReaderMailImage(imageFile)

    updateForm('image_url', imageUrl)
    setStatus({ type: 'success', message: 'Image uploaded successfully.' })
  } catch (error) {
    setStatus({ type: 'error', message: error.message || 'Failed to upload image' })
  } finally {
    setUploadingImage(false)
  }
}

function handleEditMail(mail) {
  if (!mail) return

  setEditingMailId(mail.id)
  setImageFile(null)
  setImagePreviewUrl(mail.image_url || '')

  setForm({
    target: 'single',
    email: mail.user?.username || mail.user?.email || '',
    sender_type: mail.sender_type || 'admin',
    mail_type: mail.mail_type || 'admin',
    title: mail.title || '',
    message: mail.message || '',
    detail: mail.detail || '',
    action_type: mail.action_type || '',
    reward_type: mail.reward_type || '',
    reward_amount: mail.reward_amount || '',
    image_url: mail.image_url || '',
    link: mail.link || '',
  })

  setStatus({ type: 'success', message: 'Mail loaded for editing. After editing, click Update Mail.' })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
  
  async function handleDeleteMail(mailId) {
  if (!mailId || deletingMailId) return

  const confirmed = window.confirm('Delete this mail from history?')
  if (!confirmed) return

  try {
    setDeletingMailId(mailId)
    setStatus({ type: '', message: '' })

    const response = await fetch(`${API_URL}/api/admin/mails/${mailId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Failed to delete mail')
    }

    setHistory((current) => current.filter((mail) => mail.id !== mailId))
    setStatus({ type: 'success', message: 'Mail deleted successfully.' })
  } catch (error) {
    setStatus({ type: 'error', message: error.message || 'Failed to delete mail' })
  } finally {
    setDeletingMailId('')
  }
}

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canSend || sending) return

    try {
      setSending(true)
      setStatus({ type: '', message: '' })

     const endpoint = editingMailId
  ? `${API_URL}/api/admin/mails/${editingMailId}`
  : form.target === 'all'
    ? `${API_URL}/api/admin/mails/send-all`
    : `${API_URL}/api/admin/mails/send`
      
      let finalImageUrl = form.image_url.trim()

if (imageFile && !finalImageUrl) {
  try {
    setUploadingImage(true)
    finalImageUrl = await uploadReaderMailImage(imageFile)
    updateForm('image_url', finalImageUrl)
  } finally {
    setUploadingImage(false)
  }
}

      const payload = {
        email: form.email.trim(),
        sender_type: form.sender_type,
        mail_type: form.mail_type,
        title: form.title.trim(),
        message: form.message.trim(),
        detail: form.detail.trim(),
        action_type: form.action_type,
        reward_type: form.reward_type,
        reward_amount: Number(form.reward_amount || 0),
        link: form.link.trim(),
        image_url: finalImageUrl,
      }

      const response = await fetch(endpoint, {
        method: editingMailId ? 'PUT' : 'POST',
        headers: getAdminHeaders(true),
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to send mail')
      }

      setStatus({
        type: 'success',
        message: editingMailId ? 'Mail updated successfully.' : form.target === 'all' ? `Mail sent to ${data.sent_count || 0} readers.` : 'Mail sent successfully.',
      })
      setForm(initialForm)
      setEditingMailId('')
      setImageFile(null)
      setImagePreviewUrl('')
      loadHistory()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to send mail' })
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminLayout
      title="Reader Mail"
      subtitle="Send Inbox mail to readers, including Admin Mail, System Mail, Reward Mail, Coupon, Event, and Payment messages."
    >
      <style>{styles}</style>

      <div className="reader-mail-page">
        <div className="reader-mail-head">
          <div>
            <div className="reader-mail-kicker">Inbox System</div>
            <h2 className="reader-mail-title">Reader Mail Center</h2>
            <div className="reader-mail-subtitle">
              Send direct mail to one reader or broadcast mail to all reader accounts. Reward mail can be claimed inside the Reader Inbox.
            </div>
          </div>

          <button
  type="button"
  className="reader-mail-refresh"
  onClick={() => {
    loadHistory()
    loadLogs()
  }}
  disabled={loadingHistory || loadingLogs}
>
    {loadingHistory || loadingLogs ? 'Loading...' : 'Refresh'}
</button>
</div>

        <div className="reader-mail-grid">
        <section className="reader-mail-card reader-mail-activity-card">
  <div className="reader-mail-card-head">
    <h3 className="reader-mail-card-title">Mail Activity Records</h3>
              <div className="reader-mail-card-note">Use Single Reader for testing first. Use All Readers only for real announcements.</div>
            </div>

            <form className="reader-mail-form" onSubmit={handleSubmit}>
              {status.message ? (
                <div className={`reader-mail-message ${status.type}`}>
                  {status.message}
                </div>
              ) : null}

              <div className="reader-mail-targets">
                {TARGET_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`reader-mail-target ${form.target === item.key ? 'active' : ''}`}
                    onClick={() => updateForm('target', item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {form.target === 'single' ? (
                <div className="reader-mail-field">
                  <label className="reader-mail-label">Reader Username / Email</label>
<input
  className="reader-mail-input"
  value={form.email}
  onChange={(event) => updateForm('email', event.target.value)}
  placeholder="username or reader@email.com"
/>
                </div>
              ) : null}

              <div className="reader-mail-row">
                <div className="reader-mail-field">
                  <label className="reader-mail-label">Sender</label>
                  <select className="reader-mail-select" value={form.sender_type} onChange={(event) => updateForm('sender_type', event.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="system">System Auto</option>
                  </select>
                </div>

                <div className="reader-mail-field">
                  <label className="reader-mail-label">Mail Type</label>
                  <select className="reader-mail-select" value={form.mail_type} onChange={(event) => updateForm('mail_type', event.target.value)}>
                    {MAIL_TYPES.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="reader-mail-field">
                <label className="reader-mail-label">Title</label>
                <input
                  className="reader-mail-input"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="Mail title"
                />
              </div>

              <div className="reader-mail-field">
                <label className="reader-mail-label">Short Message</label>
                <textarea
                  className="reader-mail-textarea"
                  value={form.message}
                  onChange={(event) => updateForm('message', event.target.value)}
                  placeholder="Short message shown in Inbox list"
                />
              </div>

              <div className="reader-mail-field">
                <label className="reader-mail-label">Detail Message</label>
                <textarea
                  className="reader-mail-textarea"
                  value={form.detail}
                  onChange={(event) => updateForm('detail', event.target.value)}
                  placeholder="Full message shown when reader opens the mail"
                />
              </div>

              <div className="reader-mail-row">
                <div className="reader-mail-field">
                  <label className="reader-mail-label">Reward Type</label>
                  <select className="reader-mail-select" value={form.reward_type} onChange={(event) => updateForm('reward_type', event.target.value)}>
                    {REWARD_TYPES.map((item) => (
                      <option key={item.key} value={item.key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="reader-mail-field">
                  <label className="reader-mail-label">Reward Amount</label>
                  <input
                    className="reader-mail-input"
                    type="number"
                    min="0"
                    value={form.reward_amount}
                    onChange={(event) => updateForm('reward_amount', event.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
<div className="reader-mail-field">
  <label className="reader-mail-label">Link</label>
  <input
    className="reader-mail-input"
    value={form.link}
    onChange={(event) => updateForm('link', event.target.value)}
    placeholder="/event or https://..."
  />
</div>

<div className="reader-mail-field">
  <label className="reader-mail-label">Upload Image</label>
  <div className="reader-mail-upload-row">
    <input
      className="reader-mail-input"
      type="file"
      accept="image/*"
      onChange={async (event) => {
  const file = event.target.files?.[0] || null
  if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)

  if (!file) {
    setImageFile(null)
    setImagePreviewUrl('')
    return
  }

  try {
    setStatus({ type: '', message: '' })

    const compressedFile = await compressImage(file, {
      aspectRatio: 16 / 9,
      maxSizeKB: 300,
      maxWidth: 1280,
    })

    setImageFile(compressedFile)
    setImagePreviewUrl(URL.createObjectURL(compressedFile))
  } catch (error) {
    setImageFile(null)
    setImagePreviewUrl('')
    setStatus({ type: 'error', message: error.message || 'Failed to compress image.' })
  }
}}
    />
    <button
      type="button"
      className="reader-mail-upload-button"
      onClick={handleUploadImage}
      disabled={!imageFile || uploadingImage}
    >
      {uploadingImage ? 'Uploading...' : 'Upload'}
    </button>
  </div>
 <div className="reader-mail-upload-note">Recommended: 16:9 image, max 300KB.</div>
{imagePreviewUrl || form.image_url ? (
  <img
    className="reader-mail-image-preview"
    src={imagePreviewUrl || form.image_url}
    alt="Mail preview"
  />
) : null}
</div>
              

              <button type="submit" className="reader-mail-button" disabled={!canSend || sending}>
                {sending ? 'Saving...' : editingMailId ? 'Update Mail' : form.target === 'all' ? 'Send to All Readers' : 'Send Mail'}
              </button>
            </form>
          </section>

          <section className="reader-mail-card">
            <div className="reader-mail-card-head">
              <h3 className="reader-mail-card-title">Mail Records</h3>
              <div className="reader-mail-card-note">Recent reader mail actions. Records are shown 5 per page.</div>
            </div>

            <div className="reader-mail-history">
              {loadingHistory ? (
  <div className="reader-mail-empty">Loading mail history...</div>
) : history.length ? (
  <div className="reader-mail-record-list">
    {history.map((mail) => (
      <div className="reader-mail-record-item" key={mail.id}>
        <div className="reader-mail-record-image">
          {mail.image_url ? (
            <img src={mail.image_url} alt="Mail" />
          ) : (
            '-'
          )}
        </div>

        <div className="reader-mail-record-main">
          <div className="reader-mail-record-title">{mail.title}</div>
          <div className="reader-mail-record-sub">{mail.message}</div>
          <div className="reader-mail-record-sub">
            Reader: {mail.user?.name || 'Reader'} · {mail.user?.email || '-'}
          </div>
          <div className="reader-mail-record-meta">
            <span className="reader-mail-pill">{mailTypeLabel(mail.mail_type)}</span>
            <span className="reader-mail-pill">{senderLabel(mail.sender_type)}</span>
            {mail.reward_type ? (
              <span className="reader-mail-pill">{mail.reward_amount || 0} {mail.reward_type}</span>
            ) : null}
            {mail.claimed_at ? (
              <span className="reader-mail-pill claimed">Claimed</span>
            ) : mail.is_read ? (
              <span className="reader-mail-pill">Read</span>
            ) : (
              <span className="reader-mail-pill unread">Unread</span>
            )}
            <span className="reader-mail-record-sub">{formatDate(mail.created_at)}</span>
          </div>
        </div>

        <div className="reader-mail-record-actions">
          <button
            type="button"
            className="reader-mail-edit-button"
            onClick={() => handleEditMail(mail)}
          >
            Edit
          </button>
          <button
            type="button"
            className="reader-mail-delete-button"
            onClick={() => handleDeleteMail(mail.id)}
            disabled={deletingMailId === mail.id}
          >
            {deletingMailId === mail.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="reader-mail-empty">No mail history yet.</div>
)}
            </div>
          </section>
          <section className="reader-mail-card">
  <div className="reader-mail-card-head">
    <h3 className="reader-mail-card-title">Mail Activity Records</h3>
    <div className="reader-mail-card-note">Recent reader mail actions. Records are shown 20 per page.</div>
  </div>

  <div className="reader-mail-activity-list">
    {loadingLogs ? (
      <div className="reader-mail-empty">Loading mail records...</div>
    ) : logs.length ? (
      logs.map((item) => (
        <div className="reader-mail-activity-item" key={item.id}>
          <div className="reader-mail-activity-badge">{item.action || 'RECORD'}</div>

          <div className="reader-mail-activity-main">
            <div className="reader-mail-activity-title">{item.title || 'Untitled mail'}</div>
            <div className="reader-mail-activity-sub">{item.message || 'No message'}</div>
            <div className="reader-mail-activity-meta">
              Reader: {item.reader_name || 'Reader'} {item.reader_email ? `· ${item.reader_email}` : ''}
            </div>
            <div className="reader-mail-activity-meta">By: {item.admin_name || 'Admin'}</div>
          </div>

          <div className="reader-mail-activity-date">{formatDate(item.created_at)}</div>
        </div>
      ))
    ) : (
      <div className="reader-mail-empty">No mail activity records yet.</div>
    )}
  </div>
</section>
        </div>
      </div>
    </AdminLayout>
  )
}
