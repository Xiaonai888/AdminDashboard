import React, { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AdminReaderBlockPanel from '../components/AdminReaderBlockPanel'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const WORDS_PAGE_SIZE = 10
const RECORDS_PAGE_SIZE = 20

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
  .block-list-page {
    width: min(1240px, 100%);
    min-width: 0;
    margin: 0 auto;
  }

  .block-list-head {
    margin-bottom: 18px;
  }

  .block-list-title {
    margin: 0;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -.04em;
  }

  .block-list-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.6;
  }

  .block-list-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .block-list-tab {
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    padding: 0 15px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .block-list-tab.active {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .block-list-card,
  .block-list-record-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 8px 28px rgba(15, 23, 42, .05);
  }

  .block-list-record-card {
    margin-top: 18px;
  }

  .block-list-card-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .block-list-card-head > div {
    min-width: 0;
  }

  .block-list-card-title {
    margin: 0;
    color: #0F172A;
    font-size: 17px;
    font-weight: 950;
  }

  .block-list-card-desc {
    margin-top: 5px;
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
  }

  .block-list-add-btn,
  .block-list-refresh {
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 16px;
    font: inherit;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .block-list-add-btn {
    border: 0;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .block-list-head-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .block-list-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .block-list-system-status {
    display: inline-flex;
    height: 27px;
    align-items: center;
    border-radius: 999px;
    padding: 0 11px;
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .4px;
  }

  .block-list-system-status.active {
    background: #D1FAE5;
    color: #047857;
  }

  .block-list-system-status.disabled {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .block-list-bulk-btn {
    height: 40px;
    border-radius: 13px;
    padding: 0 16px;
    font: inherit;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
    transition: .18s ease;
  }

  .block-list-bulk-btn.disable {
    border: 1px solid #FDBA74;
    background: #FFF7ED;
    color: #C2410C;
  }

  .block-list-bulk-btn.enable {
    border: 1px solid #86EFAC;
    background: #ECFDF5;
    color: #047857;
  }

  .block-list-bulk-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .block-list-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 170px 150px 120px;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .block-list-input,
  .block-list-select {
    width: 100%;
    min-width: 0;
    height: 40px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #F8FAFC;
    color: #0F172A;
    padding: 0 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    outline: none;
  }

  .block-list-input:focus,
  .block-list-select:focus {
    border-color: #4F46E5;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .block-list-message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  .block-list-message.success {
    background: #D1FAE5;
    color: #047857;
  }

  .block-list-message.error {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .block-list-table-wrap {
    width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
  }

  .block-list-table {
    width: 100%;
    min-width: 860px;
    border-collapse: collapse;
  }

  .block-list-table th {
    padding: 13px 16px;
    border-bottom: 1px solid #E2E8F0;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: .6px;
  }

  .block-list-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    vertical-align: middle;
  }

  .block-list-word {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .block-list-pill,
  .block-list-status {
    display: inline-flex;
    height: 25px;
    align-items: center;
    border-radius: 999px;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .35px;
  }

  .block-list-pill.adult,
  .block-list-pill.high {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .block-list-pill.violence {
    background: #FFEDD5;
    color: #C2410C;
  }

  .block-list-pill.hate {
    background: #FCE7F3;
    color: #BE185D;
  }

  .block-list-pill.spam,
  .block-list-pill.medium {
    background: #FEF3C7;
    color: #B45309;
  }

  .block-list-pill.custom {
    background: #E0E7FF;
    color: #4338CA;
  }

  .block-list-pill.low {
    background: #E0F2FE;
    color: #0369A1;
  }

  .block-list-status.active {
    background: #D1FAE5;
    color: #047857;
  }

  .block-list-status.disabled {
    background: #F1F5F9;
    color: #475569;
  }

  .block-list-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .block-list-action {
    height: 32px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #334155;
    padding: 0 11px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .block-list-action.disable {
    border-color: #FED7AA;
    background: #FFF7ED;
    color: #C2410C;
  }

  .block-list-action.enable {
    border-color: #BBF7D0;
    background: #ECFDF3;
    color: #047857;
  }

  .block-list-action.delete {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .block-list-empty {
    padding: 44px 20px;
    color: #64748B;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .block-list-pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 20px;
    border-top: 1px solid #E2E8F0;
    background: #FFFFFF;
  }

  .block-list-page-info {
    min-width: 0;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .block-list-page-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .block-list-page-btn {
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
  }

  .block-list-current-page {
    display: inline-flex;
    min-width: 42px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 950;
  }

  .block-list-record-list {
    padding: 10px 18px 2px;
  }

  .block-list-record-row {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid #F1F5F9;
  }

  .block-list-record-row > div {
    min-width: 0;
  }

  .block-list-record-action {
    justify-self: start;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 13px;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .block-list-record-action.create,
  .block-list-record-action.enable {
    background: #ECFDF3;
    color: #047857;
  }

  .block-list-record-action.disable {
    background: #FFF7ED;
    color: #C2410C;
  }

  .block-list-record-action.delete {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .block-list-record-title {
    color: #111827;
    font-size: 13px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .block-list-record-meta {
    margin-top: 4px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 700;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .block-list-record-date {
    color: #64748B;
    font-size: 11.5px;
    font-weight: 750;
    white-space: nowrap;
  }

  .block-list-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, .42);
    padding: 18px;
  }

  .block-list-modal {
    width: min(560px, 100%);
    overflow: hidden;
    border-radius: 22px;
    background: #FFFFFF;
    box-shadow: 0 24px 70px rgba(15, 23, 42, .28);
  }

  .block-list-modal-head {
    padding: 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .block-list-modal-title {
    margin: 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
  }

  .block-list-modal-desc {
    margin-top: 6px;
    color: #64748B;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.6;
  }

  .block-list-modal-body {
    display: grid;
    gap: 14px;
    padding: 20px;
  }

  .block-list-field {
    display: grid;
    gap: 8px;
  }

  .block-list-label {
    color: #334155;
    font-size: 12px;
    font-weight: 950;
  }

  .block-list-textarea {
    width: 100%;
    min-width: 0;
    min-height: 86px;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #F8FAFC;
    color: #0F172A;
    padding: 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    outline: none;
  }

  .block-list-textarea:focus {
    border-color: #4F46E5;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .block-list-modal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .block-list-modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #E2E8F0;
  }

  .block-list-cancel,
  .block-list-save {
    height: 40px;
    border-radius: 12px;
    padding: 0 14px;
    font: inherit;
    font-weight: 950;
    cursor: pointer;
  }

  .block-list-cancel {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
  }

  .block-list-save {
    border: 0;
    background: #4F46E5;
    color: #FFFFFF;
    padding: 0 16px;
  }

  .block-list-save:disabled,
  .block-list-cancel:disabled,
  .block-list-action:disabled,
  .block-list-add-btn:disabled,
  .block-list-refresh:disabled,
  .block-list-bulk-btn:disabled,
  .block-list-page-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 900px) {
    .block-list-toolbar,
    .block-list-reader-search-toolbar,
    .block-list-reader-selected-toolbar {
      grid-template-columns: 1fr !important;
    }

    .block-list-modal-grid {
      grid-template-columns: 1fr;
    }

    .block-list-record-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .block-list-record-date {
      white-space: normal;
    }
  }

  @media (max-width: 700px) {
    .block-list-title {
      font-size: 24px;
      overflow-wrap: anywhere;
    }

    .block-list-subtitle,
    .block-list-card-desc,
    .block-list-modal-desc {
      overflow-wrap: anywhere;
    }

    .block-list-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      margin-right: -16px;
      padding-right: 16px;
      padding-bottom: 5px;
      scrollbar-width: none;
    }

    .block-list-tabs::-webkit-scrollbar {
      display: none;
    }

    .block-list-tab {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .block-list-card,
    .block-list-record-card {
      border-radius: 19px;
    }

    .block-list-card-head {
      align-items: stretch;
      flex-direction: column;
      padding: 16px;
    }

    .block-list-head-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }

    .block-list-head-actions button,
    .block-list-card-head > .block-list-refresh {
      width: 100%;
      min-width: 0;
    }

    .block-list-title-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .block-list-toolbar {
      padding: 13px 16px;
    }

    .block-list-refresh,
    .block-list-add-btn,
    .block-list-bulk-btn {
      width: 100%;
      min-width: 0;
    }

    .block-list-message {
      margin: 13px 16px 0;
    }

    .block-list-table {
      min-width: 800px;
    }

    .block-list-record-list {
      padding: 8px 16px 2px;
    }

    .block-list-record-row > .block-list-page-btn {
      width: 100%;
      min-height: 38px;
    }

    .block-list-pagination {
      align-items: stretch;
      flex-direction: column;
      padding: 14px 16px;
    }

    .block-list-page-info {
      text-align: center;
    }

    .block-list-page-buttons {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      width: 100%;
    }

    .block-list-page-btn {
      width: 100%;
      min-width: 0;
      padding: 0 9px;
    }

    .block-list-reader-selected {
      padding: 16px !important;
    }

    .block-list-reader-tabs {
      margin-right: 0;
      padding-right: 0;
    }

    .block-list-modal-backdrop {
      align-items: flex-end;
      padding: 8px;
    }

    .block-list-modal {
      width: 100%;
      max-height: calc(100dvh - 16px);
      overflow-y: auto;
      border-radius: 20px;
    }

    .block-list-modal-head,
    .block-list-modal-body {
      padding: 16px;
    }

    .block-list-modal-foot {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 14px 16px;
      background: #FFFFFF;
    }

    .block-list-modal-foot button {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 460px) {
    .block-list-head-actions,
    .block-list-modal-foot {
      grid-template-columns: 1fr;
    }

    .block-list-page-buttons {
      grid-template-columns: 1fr;
    }

    .block-list-current-page {
      order: -1;
      width: 100%;
      box-sizing: border-box;
    }

    .block-list-record-action {
      width: fit-content;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '-'
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
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [globalWordStats, setGlobalWordStats] = useState({
    total: 0,
    active: 0,
    disabled: 0,
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [authExpired, setAuthExpired] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [recordsPage, setRecordsPage] = useState(1)
  const [pageMeta, setPageMeta] = useState({
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [recordsMeta, setRecordsMeta] = useState({
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || 'Block List'
  const allWordsDisabled = globalWordStats.total > 0 && globalWordStats.active === 0

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

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Request failed')
    }

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
      const nextTotalPages = Math.max(1, Number(data.total_pages || 1))
      const safePage = Math.min(Number(data.page || targetPage), nextTotalPages)

      setWords(data.words || [])
      setGlobalWordStats({
        total: Number(data.global_total || 0),
        active: Number(data.global_active_total || 0),
        disabled: Number(data.global_disabled_total || 0),
      })
      setPage(safePage)
      setPageMeta({
        total: Number(data.total || 0),
        total_pages: nextTotalPages,
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (error) {
      setWords([])
      setPageMeta({
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
      showMessage(error.message || 'Failed to load blocked words', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecords(targetPage = recordsPage) {
    try {
      setRecordsLoading(true)

      const params = new URLSearchParams()
      params.set('page', String(targetPage))
      params.set('limit', String(RECORDS_PAGE_SIZE))

      const data = await apiFetch(`/api/admin/block-list/records?${params.toString()}`)
      const nextTotalPages = Math.max(1, Number(data.total_pages || 1))
      const safePage = Math.min(Number(data.page || targetPage), nextTotalPages)

      setRecords(data.records || [])
      setRecordsPage(safePage)
      setRecordsMeta({
        total: Number(data.total || 0),
        total_pages: nextTotalPages,
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch {
      setRecords([])
      setRecordsMeta({
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
    } finally {
      setRecordsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'words') {
      fetchWords(1)
      fetchRecords(1)
    }
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

      const targetPage = editingWord ? page : 1
      closeModal()
      await fetchWords(targetPage)
      await fetchRecords(1)
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
      await fetchRecords(1)
    } catch (error) {
      showMessage(error.message || 'Failed to update status', 'error')
    }
  }

  async function toggleAllWords() {
    const nextActive = allWordsDisabled
    const action = nextActive ? 'Enable' : 'Disable'

    if (!window.confirm(`${action} all blocked words?`)) return

    try {
      setBulkUpdating(true)

      await apiFetch('/api/admin/block-list/words/toggle-all', {
        method: 'PATCH',
        body: JSON.stringify({ is_active: nextActive }),
      })

      showMessage(`All blocked words ${nextActive ? 'enabled' : 'disabled'}.`)
      await Promise.all([fetchWords(1), fetchRecords(1)])
    } catch (error) {
      showMessage(error.message || 'Failed to update all blocked words', 'error')
    } finally {
      setBulkUpdating(false)
    }
  }

  async function deleteWord(item) {
    if (!window.confirm(`Delete blocked word "${item.word}"?`)) return

    try {
      await apiFetch(`/api/admin/block-list/words/${item.id}`, {
        method: 'DELETE',
      })

      showMessage('Blocked word deleted.')
      const nextPage = words.length === 1 && page > 1 ? page - 1 : page
      await fetchWords(nextPage)
      await fetchRecords(1)
    } catch (error) {
      showMessage(error.message || 'Failed to delete blocked word', 'error')
    }
  }

  if (authExpired) return <Navigate to="/login" replace />

  return (
    <AdminLayout
      title="Block List"
      subtitle="Manage blocked words and future account/story restrictions."
    >
      <style>{styles}</style>

      {modalOpen ? (
        <div className="block-list-modal-backdrop">
          <div className="block-list-modal">
            <div className="block-list-modal-head">
              <h2 className="block-list-modal-title">
                {editingWord ? 'Edit Block Word' : 'Add Block Word'}
              </h2>
              <div className="block-list-modal-desc">
                Duplicate words are blocked automatically. Extra spaces and uppercase/lowercase are treated as the same word.
              </div>
            </div>

            <div className="block-list-modal-body">
              <div className="block-list-field">
                <label className="block-list-label">Blocked Word</label>
                <input
                  className="block-list-input"
                  value={form.word}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    word: event.target.value,
                  }))}
                  placeholder="Enter blocked word..."
                  autoFocus
                />
              </div>

              <div className="block-list-modal-grid">
                <div className="block-list-field">
                  <label className="block-list-label">Category</label>
                  <select
                    className="block-list-select"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))}
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="block-list-field">
                  <label className="block-list-label">Severity</label>
                  <select
                    className="block-list-select"
                    value={form.severity}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      severity: event.target.value,
                    }))}
                  >
                    {severities.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="block-list-field">
                <label className="block-list-label">Admin Note</label>
                <textarea
                  className="block-list-textarea"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))}
                  placeholder="Optional note..."
                />
              </div>
            </div>

            <div className="block-list-modal-foot">
              <button
                type="button"
                className="block-list-cancel"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="block-list-save"
                onClick={saveWord}
                disabled={saving || !form.word.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="block-list-page">
        <div className="block-list-head">
          <h1 className="block-list-title">Block List</h1>
          <div className="block-list-subtitle">
            {globalWordStats.total === 0
              ? 'No blocked words configured yet.'
              : allWordsDisabled
                ? 'Block Words protection is disabled.'
                : `Block Words protection is active with ${globalWordStats.active} active words.`}
          </div>
        </div>

        <div className="block-list-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`block-list-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="block-list-card">
          <div className="block-list-card-head">
            <div>
              <div className="block-list-title-row">
                <h2 className="block-list-card-title">{activeLabel}</h2>

                {activeTab === 'words' ? (
                  <span className={`block-list-system-status ${allWordsDisabled ? 'disabled' : 'active'}`}>
                    {allWordsDisabled ? 'Protection Disabled' : 'Protection Active'}
                  </span>
                ) : null}
              </div>

              <div className="block-list-card-desc">
                {activeTab === 'words'
                  ? `Total ${stats.total} · Showing ${stats.pageCount} · Page ${page} of ${pageMeta.total_pages}`
                  : 'This tab is ready. We will build it later.'}
              </div>
            </div>

            {activeTab === 'words' ? (
              <div className="block-list-head-actions">
                <button
                  type="button"
                  className={`block-list-bulk-btn ${allWordsDisabled ? 'enable' : 'disable'}`}
                  onClick={toggleAllWords}
                  disabled={bulkUpdating || loading || globalWordStats.total === 0}
                >
                  {bulkUpdating
                    ? 'Updating...'
                    : allWordsDisabled
                      ? 'Enable All'
                      : 'Disable All'}
                </button>

                <button
                  type="button"
                  className="block-list-add-btn"
                  onClick={openCreateModal}
                  disabled={bulkUpdating}
                >
                  Add Block Word
                </button>
              </div>
            ) : null}
          </div>

          {activeTab === 'words' ? (
            <>
              <div className="block-list-toolbar">
                <input
                  className="block-list-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearchSubmit()
                  }}
                  placeholder="Search blocked words..."
                />

                <select
                  className="block-list-select"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setPage(1)
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                <select
                  className="block-list-select"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value)
                    setPage(1)
                  }}
                >
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  className="block-list-refresh"
                  onClick={handleSearchSubmit}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </div>

              {message ? (
                <div className={`block-list-message ${messageType}`}>{message}</div>
              ) : null}

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
                            <td>
                              <span className={`block-list-status ${item.is_active ? 'active' : 'disabled'}`}>
                                {item.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>{item.created_by || 'Admin'}</td>
                            <td>{formatDate(item.created_at)}</td>
                            <td>
                              <div className="block-list-actions">
                                <button
                                  type="button"
                                  className="block-list-action"
                                  onClick={() => openEditModal(item)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={`block-list-action ${item.is_active ? 'disable' : 'enable'}`}
                                  onClick={() => toggleStatus(item)}
                                >
                                  {item.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  type="button"
                                  className="block-list-action delete"
                                  onClick={() => deleteWord(item)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block-list-pagination">
                    <div className="block-list-page-info">
                      Showing page {page} of {pageMeta.total_pages} · {pageMeta.total} total records · {WORDS_PAGE_SIZE} words per page
                    </div>
                    <div className="block-list-page-buttons">
                      <button
                        type="button"
                        className="block-list-page-btn"
                        onClick={() => fetchWords(page - 1)}
                        disabled={!pageMeta.has_prev || loading}
                      >
                        Previous
                      </button>
                      <span className="block-list-current-page">{page}</span>
                      <button
                        type="button"
                        className="block-list-page-btn"
                        onClick={() => fetchWords(page + 1)}
                        disabled={!pageMeta.has_next || loading}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="block-list-empty">
                  No blocked words found. Click Add Block Word to add a new restricted word.
                </div>
              )}
            </>
          ) : activeTab === 'readers' ? (
            <AdminReaderBlockPanel />
          ) : (
            <div className="block-list-empty">Coming soon.</div>
          )}
        </section>

        {activeTab === 'words' ? (
          <section className="block-list-record-card">
            <div className="block-list-card-head">
              <div>
                <h2 className="block-list-card-title">Block Word Records</h2>
                <div className="block-list-card-desc">
                  Recent Block Word actions. Records are shown 20 per page.
                </div>
              </div>

              <button
                type="button"
                className="block-list-refresh"
                onClick={() => fetchRecords(recordsPage)}
                disabled={recordsLoading}
              >
                {recordsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {recordsLoading ? (
              <div className="block-list-empty">Loading records...</div>
            ) : records.length ? (
              <>
                <div className="block-list-record-list">
                  {records.map((record) => (
                    <div className="block-list-record-row" key={record.id}>
                      <div className={`block-list-record-action ${String(record.action || '').toLowerCase()}`}>
                        {record.action}
                      </div>
                      <div>
                        <div className="block-list-record-title">
                          {record.details || `${record.action} blocked word: ${record.word}`}
                        </div>
                        <div className="block-list-record-meta">
                          Word: {record.word || '-'} · Category: {record.category || '-'} · Severity: {record.severity || '-'} · By: {record.actor || 'Admin'}
                        </div>
                      </div>
                      <div className="block-list-record-date">{formatDate(record.created_at)}</div>
                    </div>
                  ))}
                </div>

                <div className="block-list-pagination">
                  <div className="block-list-page-info">
                    Record page {recordsPage} of {recordsMeta.total_pages} · {recordsMeta.total} total records
                  </div>
                  <div className="block-list-page-buttons">
                    <button
                      type="button"
                      className="block-list-page-btn"
                      onClick={() => fetchRecords(recordsPage - 1)}
                      disabled={!recordsMeta.has_prev || recordsLoading}
                    >
                      Previous
                    </button>
                    <span className="block-list-current-page">{recordsPage}</span>
                    <button
                      type="button"
                      className="block-list-page-btn"
                      onClick={() => fetchRecords(recordsPage + 1)}
                      disabled={!recordsMeta.has_next || recordsLoading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="block-list-empty">
                No block word records yet. New records will appear after add, edit, enable, disable, or delete actions.
              </div>
            )}
          </section>
        ) : null}
      </div>
    </AdminLayout>
  )
}
