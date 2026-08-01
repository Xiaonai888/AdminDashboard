import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const emptyCategoryForm = {
  name: '',
  slug: '',
  icon: 'circle-help',
  color: '#7458E8',
  display_order: 0,
  is_active: true,
}

const emptyArticleForm = {
  category_id: '',
  question: '',
  answer: '',
  search_keywords: '',
  display_order: 0,
  is_popular: false,
  status: 'draft',
  is_active: true,
}

const iconPaths = {
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z',
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z',
  folder: 'M3 5h6l2 3h10v11H3z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2z',
  check: 'M20 6L9 17l-5-5',
  close: 'M18 6L6 18M6 6l12 12',
  refresh: 'M20 11a8 8 0 10-2.34 5.66M20 4v7h-7',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2 3M6.6 6.6C3.2 8.5 1 12 1 12s4 8 11 8c1.8 0 3.4-.5 4.8-1.2',
}

const styles = `
  .hc-page{max-width:1500px;margin:0 auto;padding-bottom:48px;color:#0F172A}
  .hc-actions{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
  .hc-actions-copy h1{font-size:27px;line-height:1.15;font-weight:900;letter-spacing:-.04em;margin:0}
  .hc-actions-copy p{font-size:13px;line-height:1.6;color:#64748B;margin:7px 0 0}
  .hc-actions-buttons{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
  .hc-button{border:0;border-radius:13px;padding:11px 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:12.5px;font-weight:850;cursor:pointer;transition:.18s ease;white-space:nowrap}
  .hc-button:hover{transform:translateY(-1px)}
  .hc-button:disabled{opacity:.55;cursor:not-allowed;transform:none}
  .hc-button-primary{background:#4F46E5;color:#fff;box-shadow:0 10px 24px rgba(79,70,229,.22)}
  .hc-button-secondary{background:#fff;color:#334155;border:1px solid #E2E8F0}
  .hc-button-danger{background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA}
  .hc-button-quiet{background:#F8FAFC;color:#475569;border:1px solid #E2E8F0;padding:8px 10px}
  .hc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
  .hc-stat{background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:18px;display:flex;align-items:center;gap:14px;box-shadow:0 6px 20px rgba(15,23,42,.04)}
  .hc-stat-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .hc-stat-value{font-size:23px;font-weight:950;letter-spacing:-.04em}
  .hc-stat-label{font-size:11.5px;color:#64748B;font-weight:700;margin-top:2px}
  .hc-panel{background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 8px 28px rgba(15,23,42,.05);overflow:hidden}
  .hc-tabs{display:flex;gap:7px;padding:8px;background:#F1F5F9;border-radius:15px;width:max-content;margin-bottom:16px}
  .hc-tab{border:0;border-radius:10px;background:transparent;color:#64748B;padding:9px 17px;font:inherit;font-size:12.5px;font-weight:850;cursor:pointer}
  .hc-tab.active{background:#fff;color:#4F46E5;box-shadow:0 3px 10px rgba(15,23,42,.08)}
  .hc-toolbar{display:grid;grid-template-columns:minmax(240px,1fr) 220px 160px auto;gap:10px;padding:17px;border-bottom:1px solid #E2E8F0;align-items:center}
  .hc-search{position:relative}
  .hc-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94A3B8}
  .hc-input,.hc-select,.hc-textarea{width:100%;border:1px solid #DCE3EC;background:#F8FAFC;border-radius:12px;padding:11px 12px;font:inherit;font-size:12.5px;color:#0F172A;outline:none;transition:.18s ease}
  .hc-search .hc-input{padding-left:40px}
  .hc-input:focus,.hc-select:focus,.hc-textarea:focus{background:#fff;border-color:#4F46E5;box-shadow:0 0 0 4px rgba(79,70,229,.08)}
  .hc-textarea{min-height:160px;resize:vertical;line-height:1.65}
  .hc-table-wrap{overflow:auto}
  .hc-table{width:100%;border-collapse:collapse;min-width:980px}
  .hc-table th{padding:13px 16px;text-align:left;background:#F8FAFC;color:#64748B;font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;font-weight:900;border-bottom:1px solid #E2E8F0}
  .hc-table td{padding:14px 16px;border-bottom:1px solid #EEF2F7;vertical-align:middle;font-size:12.5px}
  .hc-table tr:last-child td{border-bottom:0}
  .hc-question{max-width:420px;font-weight:850;color:#0F172A;line-height:1.45}
  .hc-keywords{max-width:420px;color:#94A3B8;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px}
  .hc-category-pill,.hc-status{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 9px;font-size:10.5px;font-weight:850;white-space:nowrap}
  .hc-status.published{background:#DCFCE7;color:#15803D}
  .hc-status.draft{background:#F1F5F9;color:#64748B}
  .hc-row-actions{display:flex;gap:7px;justify-content:flex-end}
  .hc-icon-button{width:34px;height:34px;border-radius:10px;border:1px solid #E2E8F0;background:#fff;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .hc-icon-button:hover{background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE}
  .hc-icon-button.danger:hover{background:#FEF2F2;color:#DC2626;border-color:#FECACA}
  .hc-switch{width:43px;height:24px;border:0;border-radius:999px;background:#CBD5E1;padding:3px;cursor:pointer;transition:.18s ease}
  .hc-switch.on{background:#4F46E5}
  .hc-switch span{display:block;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(15,23,42,.25);transition:.18s ease}
  .hc-switch.on span{transform:translateX(19px)}
  .hc-empty{padding:70px 20px;text-align:center;color:#94A3B8}
  .hc-empty-icon{width:58px;height:58px;border-radius:18px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;margin:0 auto 13px;color:#64748B}
  .hc-empty-title{font-size:14px;font-weight:900;color:#334155}
  .hc-empty-text{font-size:12px;margin-top:5px}
  .hc-loading{padding:64px 20px;text-align:center;color:#64748B;font-size:13px;font-weight:800}
  .hc-spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#4F46E5;border-radius:50%;animation:hc-spin .7s linear infinite;margin:0 auto 12px}
  @keyframes hc-spin{to{transform:rotate(360deg)}}
  .hc-categories{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
  .hc-category-card{background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:17px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
  .hc-category-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .hc-category-info{display:flex;align-items:center;gap:12px;min-width:0}
  .hc-category-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#4F46E5;font-size:16px;font-weight:950;flex-shrink:0}
  .hc-category-name{font-size:13.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-category-slug{font-size:10.5px;color:#94A3B8;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-category-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid #EEF2F7}
  .hc-category-count{font-size:11.5px;color:#64748B;font-weight:750}
  .hc-category-actions{display:flex;gap:7px}
  .hc-toast{position:fixed;right:24px;bottom:24px;z-index:1500;max-width:390px;border-radius:14px;padding:13px 16px;font-size:12.5px;font-weight:850;box-shadow:0 18px 45px rgba(15,23,42,.2)}
  .hc-toast.success{background:#052E24;color:#D1FAE5}
  .hc-toast.error{background:#450A0A;color:#FEE2E2}
  .hc-modal-layer{position:fixed;inset:0;z-index:1400;display:flex;align-items:center;justify-content:center;padding:20px}
  .hc-modal-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.52);backdrop-filter:blur(3px)}
  .hc-modal{position:relative;width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:22px;box-shadow:0 30px 90px rgba(15,23,42,.32)}
  .hc-modal.small{width:min(560px,100%)}
  .hc-modal-header{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-bottom:1px solid #E2E8F0;background:#fff}
  .hc-modal-title{font-size:18px;font-weight:950;letter-spacing:-.02em}
  .hc-modal-subtitle{font-size:11.5px;color:#64748B;margin-top:4px}
  .hc-modal-close{width:36px;height:36px;border:0;border-radius:11px;background:#F1F5F9;color:#64748B;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .hc-modal-body{padding:21px 22px}
  .hc-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}
  .hc-field{display:flex;flex-direction:column;gap:7px}
  .hc-field.full{grid-column:1/-1}
  .hc-label{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:#64748B;font-weight:900}
  .hc-toggle-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .hc-toggle-card{border:1px solid #E2E8F0;background:#F8FAFC;border-radius:13px;padding:12px 13px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .hc-toggle-title{font-size:12px;font-weight:850}
  .hc-toggle-subtitle{font-size:10.5px;color:#94A3B8;margin-top:2px}
  .hc-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px 20px;border-top:1px solid #EEF2F7}
  @media(max-width:1100px){
    .hc-page{min-width:0}
    .hc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
    .hc-categories{grid-template-columns:repeat(2,minmax(0,1fr))}
    .hc-toolbar{grid-template-columns:1fr 1fr}
    .hc-toolbar .hc-search{grid-column:1/-1}
    .hc-table-wrap{overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
  }

  @media(max-width:720px){
    .hc-page{padding-bottom:38px}
    .hc-actions{align-items:stretch;flex-direction:column;margin-bottom:18px}
    .hc-actions-copy{min-width:0}
    .hc-actions-copy h1{font-size:23px;overflow-wrap:anywhere}
    .hc-actions-copy p{overflow-wrap:anywhere}
    .hc-actions-buttons{display:grid;grid-template-columns:1fr 1fr;width:100%;justify-content:stretch}
    .hc-actions-buttons .hc-button{width:100%;min-width:0;padding-left:10px;padding-right:10px}
    .hc-stats{grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
    .hc-stat{min-width:0;padding:14px;gap:10px}
    .hc-stat-icon{width:38px;height:38px}
    .hc-stat-value{font-size:19px}
    .hc-stat-label{overflow-wrap:anywhere}
    .hc-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%;box-sizing:border-box}
    .hc-tab{width:100%;min-width:0}
    .hc-panel{min-width:0;border-radius:18px}
    .hc-toolbar{grid-template-columns:1fr;padding:13px}
    .hc-toolbar .hc-search{grid-column:auto}
    .hc-toolbar .hc-button{width:100%}
    .hc-input,.hc-select,.hc-textarea{min-width:0;box-sizing:border-box}
    .hc-table{min-width:900px}
    .hc-table th,.hc-table td{padding-left:13px;padding-right:13px}
    .hc-question,.hc-keywords{overflow-wrap:anywhere}
    .hc-categories{grid-template-columns:1fr}
    .hc-category-card{min-width:0;padding:15px}
    .hc-category-top,.hc-category-info{min-width:0}
    .hc-category-name,.hc-category-slug{white-space:normal;overflow-wrap:anywhere}
    .hc-category-meta{align-items:flex-start}
    .hc-category-count{min-width:0;overflow-wrap:anywhere}
    .hc-form-grid,.hc-toggle-grid{grid-template-columns:1fr}
    .hc-field.full,.hc-toggle-grid{grid-column:auto}
    .hc-modal-layer{padding:0;align-items:flex-end}
    .hc-modal,.hc-modal.small{width:100%;max-height:94dvh;border-radius:22px 22px 0 0}
    .hc-modal-header{padding:17px 16px}
    .hc-modal-header>div{min-width:0}
    .hc-modal-title,.hc-modal-subtitle{overflow-wrap:anywhere}
    .hc-modal-close{flex-shrink:0}
    .hc-modal-body{padding:17px 16px}
    .hc-modal-footer{position:sticky;bottom:0;z-index:2;padding:14px 16px;background:#fff}
    .hc-modal-footer .hc-button{flex:1;min-width:0;padding-left:9px;padding-right:9px}
    .hc-toggle-card{min-width:0}
    .hc-toggle-card>div{min-width:0}
    .hc-toggle-title,.hc-toggle-subtitle{overflow-wrap:anywhere}
    .hc-toast{left:14px;right:14px;bottom:14px;max-width:none;overflow-wrap:anywhere}
  }

  @media(max-width:480px){
    .hc-actions-buttons{grid-template-columns:1fr}
    .hc-stats{grid-template-columns:1fr}
    .hc-stat{min-height:72px}
    .hc-category-top{gap:9px}
    .hc-category-meta{align-items:stretch;flex-direction:column}
    .hc-category-actions{justify-content:flex-end}
    .hc-modal-footer{display:grid;grid-template-columns:1fr}
    .hc-modal-footer .hc-button{width:100%}
    .hc-empty,.hc-loading{padding-left:16px;padding-right:16px}
  }
`

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
      <path d={iconPaths[name] || iconPaths.book} />
    </svg>
  )
}

function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`hc-switch ${checked ? 'on' : ''}`}
      onClick={onChange}
    >
      <span />
    </button>
  )
}

function Modal({ open, title, subtitle, small = false, onClose, children, footer }) {
  if (!open) return null

  return (
    <div className="hc-modal-layer">
      <button type="button" className="hc-modal-backdrop" aria-label="Close" onClick={onClose} />
      <section className={`hc-modal ${small ? 'small' : ''}`} role="dialog" aria-modal="true">
        <header className="hc-modal-header">
          <div>
            <div className="hc-modal-title">{title}</div>
            {subtitle ? <div className="hc-modal-subtitle">{subtitle}</div> : null}
          </div>
          <button type="button" className="hc-modal-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={17} />
          </button>
        </header>
        <div className="hc-modal-body">{children}</div>
        {footer ? <footer className="hc-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  )
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${getAdminToken()}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}

function normalizeOrder(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0
}

function categoryColor(category) {
  const value = String(category?.color || '#EEF2FF')
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#EEF2FF'
}

export default function HelpCenterManagementPage() {
  const [activeTab, setActiveTab] = useState('articles')
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [articleTotal, setArticleTotal] = useState(0)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [articleModalOpen, setArticleModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingArticle, setEditingArticle] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [articleForm, setArticleForm] = useState(emptyArticleForm)

  const stats = useMemo(() => {
    const published = articles.filter((article) => article.status === 'published').length
    const popular = articles.filter((article) => article.is_popular).length
    const hidden = articles.filter((article) => !article.is_active).length
    return { published, popular, hidden }
  }, [articles])

  function showToast(type, message) {
    setToast({ type, message })
  }

  async function loadCategories() {
    try {
      setLoadingCategories(true)
      const data = await apiRequest('/api/help-center/admin/categories')
      setCategories(data.categories || [])
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoadingCategories(false)
    }
  }

  async function loadArticles() {
    try {
      setLoadingArticles(true)
      const params = new URLSearchParams({ page: '1', limit: '100' })
      if (search.trim()) params.set('search', search.trim())
      if (categoryFilter) params.set('category', categoryFilter)
      if (statusFilter) params.set('status', statusFilter)

      const data = await apiRequest(`/api/help-center/admin/articles?${params.toString()}`)
      setArticles(data.articles || [])
      setArticleTotal(Number(data.total || 0))
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoadingArticles(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadArticles, 250)
    return () => window.clearTimeout(timer)
  }, [search, categoryFilter, statusFilter])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  function openCreateCategory() {
    setEditingCategory(null)
    setCategoryForm({
      ...emptyCategoryForm,
      display_order: categories.length + 1,
    })
    setCategoryModalOpen(true)
  }

  function openEditCategory(category) {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || 'circle-help',
      color: category.color || '#7458E8',
      display_order: Number(category.display_order || 0),
      is_active: Boolean(category.is_active),
    })
    setCategoryModalOpen(true)
  }

  function openCreateArticle() {
    setEditingArticle(null)
    setArticleForm({
      ...emptyArticleForm,
      category_id: categoryFilter || categories[0]?.id || '',
      display_order: articleTotal + 1,
    })
    setArticleModalOpen(true)
  }

  function openEditArticle(article) {
    setEditingArticle(article)
    setArticleForm({
      category_id: article.category_id || '',
      question: article.question || '',
      answer: article.answer || '',
      search_keywords: article.search_keywords || '',
      display_order: Number(article.display_order || 0),
      is_popular: Boolean(article.is_popular),
      status: article.status || 'draft',
      is_active: Boolean(article.is_active),
    })
    setArticleModalOpen(true)
  }

  async function saveCategory() {
    if (!categoryForm.name.trim()) {
      showToast('error', 'Category name is required')
      return
    }

    try {
      setSaving(true)
      const path = editingCategory
        ? `/api/help-center/admin/categories/${editingCategory.id}`
        : '/api/help-center/admin/categories'

      await apiRequest(path, {
        method: editingCategory ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...categoryForm,
          display_order: normalizeOrder(categoryForm.display_order),
        }),
      })

      setCategoryModalOpen(false)
      showToast('success', editingCategory ? 'Category updated' : 'Category created')
      await Promise.all([loadCategories(), loadArticles()])
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveArticle() {
    if (!articleForm.category_id || !articleForm.question.trim() || !articleForm.answer.trim()) {
      showToast('error', 'Category, question and answer are required')
      return
    }

    try {
      setSaving(true)
      const path = editingArticle
        ? `/api/help-center/admin/articles/${editingArticle.id}`
        : '/api/help-center/admin/articles'

      await apiRequest(path, {
        method: editingArticle ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...articleForm,
          display_order: normalizeOrder(articleForm.display_order),
        }),
      })

      setArticleModalOpen(false)
      showToast('success', editingArticle ? 'Article updated' : 'Article created')
      await Promise.all([loadCategories(), loadArticles()])
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateArticle(article, patch) {
    try {
      await apiRequest(`/api/help-center/admin/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
      showToast('success', 'Article updated')
      await loadArticles()
    } catch (error) {
      showToast('error', error.message)
    }
  }

  async function updateCategory(category, patch) {
    try {
      await apiRequest(`/api/help-center/admin/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      })
      showToast('success', 'Category updated')
      await Promise.all([loadCategories(), loadArticles()])
    } catch (error) {
      showToast('error', error.message)
    }
  }

  async function deleteArticle(article) {
    if (!window.confirm(`Delete “${article.question}”?`)) return

    try {
      await apiRequest(`/api/help-center/admin/articles/${article.id}`, { method: 'DELETE' })
      showToast('success', 'Article deleted')
      await Promise.all([loadCategories(), loadArticles()])
    } catch (error) {
      showToast('error', error.message)
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete “${category.name}”?`)) return

    try {
      await apiRequest(`/api/help-center/admin/categories/${category.id}`, { method: 'DELETE' })
      showToast('success', 'Category deleted')
      await loadCategories()
    } catch (error) {
      showToast('error', error.message)
    }
  }

  return (
    <AdminLayout title="Help Center" subtitle="Manage categories, questions, answers and visibility.">
      <style>{styles}</style>

      <div className="hc-page">
        <div className="hc-actions">
          <div className="hc-actions-copy">
            <h1>Help Center Management</h1>
            <p>Publish clear answers for readers without changing the Reader Website code.</p>
          </div>

          <div className="hc-actions-buttons">
            <button type="button" className="hc-button hc-button-secondary" onClick={openCreateCategory}>
              <Icon name="folder" size={16} />
              New Category
            </button>
            <button type="button" className="hc-button hc-button-primary" onClick={openCreateArticle} disabled={!categories.length}>
              <Icon name="plus" size={16} />
              New Article
            </button>
          </div>
        </div>

        <div className="hc-stats">
          <div className="hc-stat">
            <div className="hc-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Icon name="folder" />
            </div>
            <div>
              <div className="hc-stat-value">{categories.length}</div>
              <div className="hc-stat-label">Categories</div>
            </div>
          </div>
          <div className="hc-stat">
            <div className="hc-stat-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
              <Icon name="book" />
            </div>
            <div>
              <div className="hc-stat-value">{articleTotal}</div>
              <div className="hc-stat-label">Total Articles</div>
            </div>
          </div>
          <div className="hc-stat">
            <div className="hc-stat-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
              <Icon name="check" />
            </div>
            <div>
              <div className="hc-stat-value">{stats.published}</div>
              <div className="hc-stat-label">Published in View</div>
            </div>
          </div>
          <div className="hc-stat">
            <div className="hc-stat-icon" style={{ background: '#FEF9C3', color: '#CA8A04' }}>
              <Icon name="star" />
            </div>
            <div>
              <div className="hc-stat-value">{stats.popular}</div>
              <div className="hc-stat-label">Popular in View</div>
            </div>
          </div>
        </div>

        <div className="hc-tabs">
          <button type="button" className={`hc-tab ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>
            Articles
          </button>
          <button type="button" className={`hc-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            Categories
          </button>
        </div>

        {activeTab === 'articles' ? (
          <section className="hc-panel">
            <div className="hc-toolbar">
              <div className="hc-search">
                <Icon name="search" size={17} />
                <input
                  className="hc-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search question, answer or keywords..."
                />
              </div>

              <select className="hc-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select className="hc-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button type="button" className="hc-button hc-button-secondary" onClick={loadArticles}>
                <Icon name="refresh" size={15} />
                Refresh
              </button>
            </div>

            {loadingArticles ? (
              <div className="hc-loading">
                <div className="hc-spinner" />
                Loading articles...
              </div>
            ) : articles.length ? (
              <div className="hc-table-wrap">
                <table className="hc-table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Popular</th>
                      <th>Active</th>
                      <th>Order</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => {
                      const category = article.category || categories.find((item) => item.id === article.category_id)
                      return (
                        <tr key={article.id}>
                          <td>
                            <div className="hc-question">{article.question}</div>
                            <div className="hc-keywords">{article.search_keywords || 'No search keywords'}</div>
                          </td>
                          <td>
                            <span className="hc-category-pill" style={{ background: categoryColor(category), color: '#334155' }}>
                              {category?.name || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`hc-status ${article.status}`}
                              style={{ border: 0, cursor: 'pointer' }}
                              onClick={() => updateArticle(article, { status: article.status === 'published' ? 'draft' : 'published' })}
                            >
                              {article.status === 'published' ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td>
                            <Switch
                              checked={Boolean(article.is_popular)}
                              label="Popular"
                              onChange={() => updateArticle(article, { is_popular: !article.is_popular })}
                            />
                          </td>
                          <td>
                            <Switch
                              checked={Boolean(article.is_active)}
                              label="Active"
                              onChange={() => updateArticle(article, { is_active: !article.is_active })}
                            />
                          </td>
                          <td>{Number(article.display_order || 0)}</td>
                          <td>
                            <div className="hc-row-actions">
                              <button type="button" className="hc-icon-button" onClick={() => openEditArticle(article)} aria-label="Edit">
                                <Icon name="edit" size={15} />
                              </button>
                              <button type="button" className="hc-icon-button danger" onClick={() => deleteArticle(article)} aria-label="Delete">
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="hc-empty">
                <div className="hc-empty-icon"><Icon name="book" size={24} /></div>
                <div className="hc-empty-title">No Help Center articles found</div>
                <div className="hc-empty-text">Change the filters or create a new article.</div>
              </div>
            )}
          </section>
        ) : (
          loadingCategories ? (
            <div className="hc-panel hc-loading">
              <div className="hc-spinner" />
              Loading categories...
            </div>
          ) : categories.length ? (
            <div className="hc-categories">
              {categories.map((category) => (
                <article key={category.id} className="hc-category-card">
                  <div className="hc-category-top">
                    <div className="hc-category-info">
                      <div className="hc-category-icon" style={{ background: categoryColor(category) }}>
                        {String(category.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="hc-category-name">{category.name}</div>
                        <div className="hc-category-slug">{category.slug}</div>
                      </div>
                    </div>
                    <Switch
                      checked={Boolean(category.is_active)}
                      label="Category active"
                      onChange={() => updateCategory(category, { is_active: !category.is_active })}
                    />
                  </div>

                  <div className="hc-category-meta">
                    <div className="hc-category-count">
                      {Number(category.article_count || 0)} articles · Order {Number(category.display_order || 0)}
                    </div>
                    <div className="hc-category-actions">
                      <button type="button" className="hc-icon-button" onClick={() => openEditCategory(category)} aria-label="Edit">
                        <Icon name="edit" size={15} />
                      </button>
                      <button type="button" className="hc-icon-button danger" onClick={() => deleteCategory(category)} aria-label="Delete">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hc-panel hc-empty">
              <div className="hc-empty-icon"><Icon name="folder" size={24} /></div>
              <div className="hc-empty-title">No categories found</div>
              <div className="hc-empty-text">Create a category before adding articles.</div>
            </div>
          )
        )}
      </div>

      <Modal
        open={categoryModalOpen}
        small
        title={editingCategory ? 'Edit Category' : 'New Category'}
        subtitle="Categories organize Help Center articles on the Reader Website."
        onClose={() => !saving && setCategoryModalOpen(false)}
        footer={(
          <>
            <button type="button" className="hc-button hc-button-secondary" onClick={() => setCategoryModalOpen(false)} disabled={saving}>Cancel</button>
            <button type="button" className="hc-button hc-button-primary" onClick={saveCategory} disabled={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </>
        )}
      >
        <div className="hc-form-grid">
          <label className="hc-field full">
            <span className="hc-label">Category Name</span>
            <input className="hc-input" value={categoryForm.name} onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value }))} placeholder="Account & Profile" />
          </label>
          <label className="hc-field full">
            <span className="hc-label">Slug</span>
            <input className="hc-input" value={categoryForm.slug} onChange={(event) => setCategoryForm((form) => ({ ...form, slug: event.target.value }))} placeholder="account-and-profile" />
          </label>
          <label className="hc-field">
            <span className="hc-label">Icon Name</span>
            <input className="hc-input" value={categoryForm.icon} onChange={(event) => setCategoryForm((form) => ({ ...form, icon: event.target.value }))} placeholder="circle-help" />
          </label>
          <label className="hc-field">
            <span className="hc-label">Display Order</span>
            <input className="hc-input" type="number" min="0" value={categoryForm.display_order} onChange={(event) => setCategoryForm((form) => ({ ...form, display_order: event.target.value }))} />
          </label>
          <label className="hc-field">
            <span className="hc-label">Pastel Color</span>
            <input className="hc-input" type="color" value={categoryForm.color} onChange={(event) => setCategoryForm((form) => ({ ...form, color: event.target.value }))} style={{ height: 43, padding: 5 }} />
          </label>
          <div className="hc-toggle-card">
            <div>
              <div className="hc-toggle-title">Active</div>
              <div className="hc-toggle-subtitle">Show on Reader Website</div>
            </div>
            <Switch checked={categoryForm.is_active} label="Active" onChange={() => setCategoryForm((form) => ({ ...form, is_active: !form.is_active }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={articleModalOpen}
        title={editingArticle ? 'Edit Help Article' : 'New Help Article'}
        subtitle="Create a clear question and a short helpful answer."
        onClose={() => !saving && setArticleModalOpen(false)}
        footer={(
          <>
            <button type="button" className="hc-button hc-button-secondary" onClick={() => setArticleModalOpen(false)} disabled={saving}>Cancel</button>
            <button type="button" className="hc-button hc-button-primary" onClick={saveArticle} disabled={saving}>
              {saving ? 'Saving...' : 'Save Article'}
            </button>
          </>
        )}
      >
        <div className="hc-form-grid">
          <label className="hc-field">
            <span className="hc-label">Category</span>
            <select className="hc-select" value={articleForm.category_id} onChange={(event) => setArticleForm((form) => ({ ...form, category_id: event.target.value }))}>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="hc-field">
            <span className="hc-label">Status</span>
            <select className="hc-select" value={articleForm.status} onChange={(event) => setArticleForm((form) => ({ ...form, status: event.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="hc-field full">
            <span className="hc-label">Question</span>
            <input className="hc-input" value={articleForm.question} onChange={(event) => setArticleForm((form) => ({ ...form, question: event.target.value }))} placeholder="How do I reset my password?" />
          </label>
          <label className="hc-field full">
            <span className="hc-label">Answer</span>
            <textarea className="hc-textarea" value={articleForm.answer} onChange={(event) => setArticleForm((form) => ({ ...form, answer: event.target.value }))} placeholder="Write a clear answer..." />
          </label>
          <label className="hc-field full">
            <span className="hc-label">Search Keywords</span>
            <input className="hc-input" value={articleForm.search_keywords} onChange={(event) => setArticleForm((form) => ({ ...form, search_keywords: event.target.value }))} placeholder="password reset login account" />
          </label>
          <label className="hc-field">
            <span className="hc-label">Display Order</span>
            <input className="hc-input" type="number" min="0" value={articleForm.display_order} onChange={(event) => setArticleForm((form) => ({ ...form, display_order: event.target.value }))} />
          </label>
          <div className="hc-toggle-card">
            <div>
              <div className="hc-toggle-title">Active</div>
              <div className="hc-toggle-subtitle">Available when published</div>
            </div>
            <Switch checked={articleForm.is_active} label="Active" onChange={() => setArticleForm((form) => ({ ...form, is_active: !form.is_active }))} />
          </div>
          <div className="hc-toggle-card">
            <div>
              <div className="hc-toggle-title">Popular Help</div>
              <div className="hc-toggle-subtitle">Feature near the top</div>
            </div>
            <Switch checked={articleForm.is_popular} label="Popular" onChange={() => setArticleForm((form) => ({ ...form, is_popular: !form.is_popular }))} />
          </div>
        </div>
      </Modal>

      {toast ? <div className={`hc-toast ${toast.type}`}>{toast.message}</div> : null}
    </AdminLayout>
  )
}
