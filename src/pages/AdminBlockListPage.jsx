import React, { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const WORDS_PAGE_SIZE = 10

const tabs = [
  { key: 'words', label: 'Block Words' },
  { key: 'readers', label: 'Readers' },
  { key: 'authors', label: 'Authors' },
  { key: 'author_pages', label: 'Author Pages' },
  { key: 'stories', label: 'Stories' },
]

const categories = [
  { value: 'adult', label: 'Adult' },
  { value: 'violence', label: 'Violence' },
  { value: 'hate', label: 'Hate' },
  { value: 'spam', label: 'Spam' },
  { value: 'custom', label: 'Custom' },
]

const severities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

const styles = `
  .block-list-page { max-width: 1240px; margin: 0 auto; }
  .block-list-head { margin-bottom: 18px; }
  .block-list-title { margin: 0; font-size: 28px; font-weight: 950; letter-spacing: -0.04em; color: #0F172A; }
  .block-list-subtitle { margin-top: 8px; color: #64748B; font-size: 14px; font-weight: 600; line-height: 1.6; }
  .block-list-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .block-list-tab { border: 1px solid #E2E8F0; background: #FFFFFF; color: #64748B; height: 40px; padding: 0 15px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer; }
  .block-list-tab.active { background: #4F46E5; border-color: #4F46E5; color: #FFFFFF; }
  .block-list-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 22px; box-shadow: 0 8px 28px rgba(15, 23, 42, 0.05); overflow: hidden; }
  .block-list-card-head { padding: 20px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .block-list-card-title { margin: 0; font-size: 17px; font-weight: 950; color: #0F172A; }
  .block-list-card-desc { margin-top: 5px; color: #64748B; font-size: 12px; font-weight: 700; line-height: 1.5; }
  .block-list-add-btn { height: 40px; border: 0; border-radius: 13px; background: #4F46E5; color: #FFFFFF; padding: 0 16px; font: inherit; font-size: 13px; font-weight: 950; cursor: pointer; }
  .block-list-toolbar { padding: 14px 20px; border-bottom: 1px solid #E2E8F0; display: grid; grid-template-columns: minmax(220px, 1fr) 170px 150px 120px; gap: 10px; align-items: center; }
  .block-list-input, .block-list-select { height: 40px; border: 1px solid #E2E8F0; border-radius: 13px; background: #F8FAFC; padding: 0 12px; font: inherit; font-size: 13px; font-weight: 700; color: #0F172A; outline: none; }
  .block-list-input:focus, .block-list-select:focus { background: #FFFFFF; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .block-list-refresh { height: 40px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #334155; border-radius: 13px; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer; }
  .block-list-message { margin: 14px 20px 0; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; line-height: 1.55; }
  .block-list-message.success { background: #D1FAE5; color: #047857; }
  .block-list-message.error { background: #FEE2E2; color: #B91C1C; }
  .block-list-table-wrap { overflow-x: auto; }
  .block-list-table { width: 100%; border-collapse: collapse; min-width: 860px; }
  .block-list-table th { padding: 13px 16px; text-align: left; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #E2E8F0; }
  .block-list-table td { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 700; color: #334155; vertical-align: middle; }
  .block-list-word { font-size: 14px; font-weight: 950; color: #0F172A; }
  .block-list-pill { display: inline-flex; align-items: center; height: 25px; border-radius: 999px; padding: 0 10px; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.35px; }
  .block-list-pill.adult { background: #FEE2E2; color: #B91C1C; }
  .block-list-pill.violence { background: #FFEDD5; color: #C2410C; }
  .block-list-pill.hate { background: #FCE7F3; color: #BE185D; }
  .block-list-pill.spam { background: #FEF3C7; color: #B45309; }
  .block-list-pill.custom { background: #E0E7FF; color: #4338CA; }
  .block-list-pill.low { background: #E0F2FE; color: #0369A1; }
  .block-list-pill.medium { background: #FEF3C7; color: #B45309; }
  .block-list-pill.high { background: #FEE2E2; color: #B91C1C; }
  .block-list-status { display: inline-flex; align-items: center; height: 25px; border-radius: 999px; padding: 0 10px; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.35px; }
  .block-list-status.active { background: #D1FAE5; color: #047857; }
  .block-list-status.disabled { background: #F1F5F9; color: #475569; }
  .block-list-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .block-list-action { height: 32px; border-radius: 999px; border: 1px solid #E2E8F0; background: #FFFFFF; padding: 0 11px; font: inherit; font-size: 11px; font-weight: 900; cursor: pointer; color: #334155; }
  .block-list-action.disable { border-color: #FED7AA; background: #FFF7ED; color: #C2410C; }
  .block-list-action.enable { border-color: #BBF7D0; background: #ECFDF3; color: #047857; }
  .block-list-action.delete { border-color: #FECACA; background: #FEF2F2; color: #B91C1C; }
  .block-list-empty { padding: 44px 20px; text-align: center; color: #64748B; font-size: 13px; font-weight: 700; line-height: 1.7; }
  .block-list-pagination { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 20px; border-top: 1px solid #E2E8F0; background: #FFFFFF; flex-wrap: wrap; }
  .block-list-page-info { font-size: 12px; font-weight: 800; color: #64748B; }
  .block-list-page-buttons { display: flex; align-items: center; gap: 8px; }
  .block-list-page-btn { height: 36px; border-radius: 999px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #0F172A; padding: 0 14px; font: inherit; font-size: 12px; font-weight: 950; cursor: pointer; }
  .block-list-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .block-list-current-page { height: 36px; min-width: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: #EEF2FF; color: #4F46E5; padding: 0 12px; font-size: 12px; font-weight: 950; }
  .block-list-modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.42); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 18px; }
  .block-list-modal { width: min(560px, 100%); background: #FFFFFF; border-radius: 22px; overflow: hidden; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28); }
  .block-list-modal-head { padding: 20px; border-bottom: 1px solid #E2E8F0; }
  .block-list-modal-title { margin: 0; font-size: 18px; font-weight: 950; color: #0F172A; }
  .block-list-modal-desc { margin-top: 6px; color: #64748B; font-size: 13px; line-height: 1.6; font-weight: 650; }
  .block-list-modal-body { padding: 20px; display: grid; gap: 14px; }
  .block-list-field { display: grid; gap: 8px; }
  .block-list-label { font-size: 12px; font-weight: 950; color: #334155; }
  .block-list-textarea { min-height: 86px; border: 1px solid #E2E8F0; border-radius: 14px; background: #F8FAFC; padding: 12px; font: inherit; font-size: 13px; font-weight: 650; color: #0F172A; resize: vertical; outline: none; }
  .block-list-textarea:focus { background: #FFFFFF; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .block-list-modal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .block-list-modal-foot { padding: 16px 20px; border-top: 1px solid #E2E8F0; display: flex; justify-content: flex-end; gap: 10px; }
  .block-list-cancel { height: 40px; border-radius: 12px; border: 1px solid #E2E8F0; background: #FFFFFF; padding: 0 14px; font: inherit; font-weight: 950; cursor: pointer; }
  .block-list-save { height: 40px; border-radius: 12px; border: 0; background: #4F46E5; color: #FFFFFF; padding: 0 16px; font: inherit; font-weight: 950; cursor: pointer; }
  .block-list-save:disabled, .block-list-cancel:disabled, .block-list-action:disabled, .block-list-add-btn:disabled, .block-list-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 900px) {
    .block-list-toolbar { grid-template-columns: 1fr; }
    .block-list-modal-grid { grid-template-columns: 1fr; }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function emptyForm() {
  return {
    word: '',
    category: 'adult',
    severity: 'medium',
    note: '',
  }
}

export default function AdminBlockListPage() {
  const [activeTab, setActiveTab] = useState('words')
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [authExpired, setAuthExpired] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageMeta, setPageMeta] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'Block List'

  const stats = useMemo(() => {
    return {
      total: pageMeta.total,
      pageCount: words.length,
    }
  }, [pageMeta.total, words.length])

  function showMessage(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
    window.setTimeout(() => setMessage(''), 4200)
  }

  async function apiFetch(path, options = {}) {
    const token = getAdminToken()
    const headers = { ...(options.headers || {}) }

    if (token) headers.Authorization = `Bearer ${token}`
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_token')
      setAuthExpired(true)
      throw new Error('Admin session expired. Please login again.')
    }

    if (!response.ok || data.ok === false) throw new Error(data.message || 'Request failed')
    return data
  }

  async function fetchWords(targetPage = page) {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('page', String(targetPage))
      params.set('limit', String(WORDS_PAGE_SIZE))
      if (search.trim()) params.set('q', search.trim())
      if (category !== 'all') params.set('category', category)
      if (status !== 'all') params.set('status', status)

      const data = await apiFetch(`/api/admin/block-list/words?${params.toString()}`)

      setWords(data.words || [])
      setPage(Number(data.page || targetPage))
      setPageMeta({
        total: Number(data.total || 0),
        total_pages: Math.max(1, Number(data.total_pages || 1)),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (error) {
      setWords([])
      setPageMeta({ total: 0, total_pages: 1, has_next: false, has_prev: false })
      showMessage(error.message || 'Failed to load blocked words', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'words') fetchWords(1)
  }, [activeTab, category, status])

  function handleSearchSubmit() {
    setPage(1)
    fetchWords(1)
  }

  function openCreateModal() {
    setEditingWord(null)
    setForm(emptyForm())
    setModalOpen(true)
    setMessage('')
  }

  function openEditModal(item) {
    setEditingWord(item)
    setForm({
      word: item.word || '',
      category: item.category || 'adult',
      severity: item.severity || 'medium',
      note: item.note || '',
    })
    setModalOpen(true)
    setMessage('')
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setEditingWord(null)
    setForm(emptyForm())
  }

  async function saveWord() {
    try {
      setSaving(true)

      const payload = {
        word: form.word,
        category: form.category,
        severity: form.severity,
        note: form.note,
      }

      if (editingWord) {
        await apiFetch(`/api/admin/block-list/words/${editingWord.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        showMessage('Blocked word updated.')
      } else {
        await apiFetch('/api/admin/block-list/words', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showMessage('Blocked word added.')
      }

      closeModal()
      await fetchWords(editingWord ? page : 1)
    } catch (error) {
      showMessage(error.message || 'Failed to save blocked word', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(item) {
    try {
      await apiFetch(`/api/admin/block-list/words/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      showMessage(item.is_active ? 'Blocked word disabled.' : 'Blocked word enabled.')
      await fetchWords(page)
    } catch (error) {
      showMessage(error.message || 'Failed to update status', 'error')
    }
  }

  async function deleteWord(item) {
    const confirmed = window.confirm(`Delete blocked word "${item.word}"?`)
    if (!confirmed) return

    try {
      await apiFetch(`/api/admin/block-list/words/${item.id}`, { method: 'DELETE' })
      showMessage('Blocked word deleted.')
      const nextPage = words.length === 1 && page > 1 ? page - 1 : page
      await fetchWords(nextPage)
    } catch (error) {
      showMessage(error.message || 'Failed to delete blocked word', 'error')
    }
  }

  if (authExpired) return <Navigate to="/login" replace />

  return (
    <AdminLayout title="Block List" subtitle="Manage blocked words and future account/story restrictions.">
      <style>{styles}</style>

      {modalOpen ? (
        <div className="block-list-modal-backdrop">
          <div className="block-list-modal">
            <div className="block-list-modal-head">
              <h2 className="block-list-modal-title">{editingWord ? 'Edit Block Word' : 'Add Block Word'}</h2>
              <div className="block-list-modal-desc">Duplicate words are blocked automatically. Extra spaces and uppercase/lowercase are treated as the same word.</div>
            </div>

            <div className="block-list-modal-body">
              <div className="block-list-field">
                <label className="block-list-label">Blocked Word</label>
                <input className="block-list-input" value={form.word} onChange={(event) => setForm((current) => ({ ...current, word: event.target.value }))} placeholder="Enter blocked word..." autoFocus />
              </div>

              <div className="block-list-modal-grid">
                <div className="block-list-field">
                  <label className="block-list-label">Category</label>
                  <select className="block-list-select" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                    {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>

                <div className="block-list-field">
                  <label className="block-list-label">Severity</label>
                  <select className="block-list-select" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}>
                    {severities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="block-list-field">
                <label className="block-list-label">Admin Note</label>
                <textarea className="block-list-textarea" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Optional note..." />
              </div>
            </div>

            <div className="block-list-modal-foot">
              <button type="button" className="block-list-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
              <button type="button" className="block-list-save" onClick={saveWord} disabled={saving || !form.word.trim()}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="block-list-page">
        <div className="block-list-head">
          <h1 className="block-list-title">Block List</h1>
          <div className="block-list-subtitle">Block Words is active now. Other block sections are prepared as empty tabs for later.</div>
        </div>

        <div className="block-list-tabs">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" className={`block-list-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>

        <section className="block-list-card">
          <div className="block-list-card-head">
            <div>
              <h2 className="block-list-card-title">{activeLabel}</h2>
              <div className="block-list-card-desc">
                {activeTab === 'words' ? `Total ${stats.total} · Showing ${stats.pageCount} · Page ${page} of ${pageMeta.total_pages}` : 'This tab is ready. We will build it later.'}
              </div>
            </div>

            {activeTab === 'words' ? <button type="button" className="block-list-add-btn" onClick={openCreateModal}>Add Block Word</button> : null}
          </div>

          {activeTab === 'words' ? (
            <>
              <div className="block-list-toolbar">
                <input className="block-list-input" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSearchSubmit() }} placeholder="Search blocked words..." />

                <select className="block-list-select" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}>
                  <option value="all">All Categories</option>
                  {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>

                <select className="block-list-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
                  {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>

                <button type="button" className="block-list-refresh" onClick={handleSearchSubmit} disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
              </div>

              {message ? <div className={`block-list-message ${messageType}`}>{message}</div> : null}

              {loading ? (
                <div className="block-list-empty">Loading blocked words...</div>
              ) : words.length ? (
                <>
                  <div className="block-list-table-wrap">
                    <table className="block-list-table">
                      <thead>
                        <tr>
                          <th>Word</th>
                          <th>Category</th>
                          <th>Severity</th>
                          <th>Status</th>
                          <th>Created By</th>
                          <th>Created Date</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {words.map((item) => (
                          <tr key={item.id}>
                            <td><div className="block-list-word">{item.word}</div></td>
                            <td><span className={`block-list-pill ${item.category}`}>{item.category}</span></td>
                            <td><span className={`block-list-pill ${item.severity}`}>{item.severity}</span></td>
                            <td><span className={`block-list-status ${item.is_active ? 'active' : 'disabled'}`}>{item.is_active ? 'Active' : 'Disabled'}</span></td>
                            <td>{item.created_by || 'Admin'}</td>
                            <td>{formatDate(item.created_at)}</td>
                            <td>
                              <div className="block-list-actions">
                                <button type="button" className="block-list-action" onClick={() => openEditModal(item)}>Edit</button>
                                <button type="button" className={`block-list-action ${item.is_active ? 'disable' : 'enable'}`} onClick={() => toggleStatus(item)}>{item.is_active ? 'Disable' : 'Enable'}</button>
                                <button type="button" className="block-list-action delete" onClick={() => deleteWord(item)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block-list-pagination">
                    <div className="block-list-page-info">Showing page {page} of {pageMeta.total_pages} · {pageMeta.total} total records · {WORDS_PAGE_SIZE} words per page</div>
                    <div className="block-list-page-buttons">
                      <button type="button" className="block-list-page-btn" onClick={() => fetchWords(page - 1)} disabled={!pageMeta.has_prev || loading}>Previous</button>
                      <span className="block-list-current-page">{page}</span>
                      <button type="button" className="block-list-page-btn" onClick={() => fetchWords(page + 1)} disabled={!pageMeta.has_next || loading}>Next</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="block-list-empty">No blocked words found. Click Add Block Word to add a new restricted word.</div>
              )}
            </>
          ) : (
            <div className="block-list-empty">Coming soon.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
