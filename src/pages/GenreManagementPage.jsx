import React, { useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const styles = `
  

  :root {
    --bg:#F8FAFC;
    --card:#FFFFFF;
    --text:#0F172A;
    --muted:#64748B;
    --soft:#94A3B8;
    --border:#E2E8F0;
    --primary:#4F46E5;
    --primaryLight:#EEF2FF;
    --accent:#4F46E5;
    --accentLight:#EEF2FF;
    --dark:#0F172A;
    --success:#16A34A;
    --successBg:#DCFCE7;
    --danger:#EF4444;
    --dangerBg:#FEE2E2;
    --warning:#F59E0B;
    --warningBg:#FEF3C7;
  }

  * {
    box-sizing:border-box;
  }

  body {
    margin:0;
    background:var(--bg);
    color:var(--text);
  }

  .genre-admin-shell {
    min-height:100vh;
    height:100vh;
    display:flex;
    background:var(--bg);
    overflow:hidden;
  }

  .genre-main {
    flex:1;
    overflow:auto;
  }

  .genre-header {
    height:70px;
    background:#fff;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0 36px;
    position:sticky;
    top:0;
    z-index:10;
  }

  .genre-header h2 {
    font-size:17px;
    font-weight:900;
    margin:0;
  }

  .genre-content {
    padding:28px 36px 50px;
    max-width:1600px;
    margin:0 auto;
    animation:genreFade .28s ease;
  }

  @keyframes genreFade {
    from {
      opacity:0;
      transform:translateY(8px);
    }
    to {
      opacity:1;
      transform:translateY(0);
    }
  }

  .genre-page-top {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:18px;
    margin-bottom:22px;
  }

  .genre-page-top h1 {
    margin:0;
    font-size:28px;
    font-weight:950;
    letter-spacing:-.05em;
  }

  .genre-page-top p {
    margin:6px 0 0;
    color:var(--muted);
    font-size:13.5px;
    font-weight:600;
  }

  .genre-primary-btn,
  .genre-dark-btn,
  .genre-ghost-btn,
  .genre-danger-btn {
    border:0;
    border-radius:13px;
    height:42px;
    padding:0 16px;
    font-weight:900;
    cursor:pointer;
    transition:.18s ease;
    white-space:nowrap;
  }

  .genre-primary-btn {
    background:var(--primary);
    color:#fff;
    box-shadow:0 10px 24px rgba(79,70,229,.22);
  }

  .genre-dark-btn {
    background:linear-gradient(135deg, #4F46E5, #6D5DF6);
    color:#fff;
    box-shadow:0 10px 22px rgba(79,70,229,.24);
  }

  .genre-ghost-btn {
    background:#fff;
    color:var(--text);
    border:1px solid var(--border);
  }

  .genre-danger-btn {
    background:#fff;
    color:var(--danger);
    border:1px solid #FECACA;
  }

  .genre-primary-btn:hover,
  .genre-dark-btn:hover,
  .genre-ghost-btn:hover,
  .genre-danger-btn:hover {
    transform:translateY(-2px);
  }

  .genre-primary-btn:disabled,
  .genre-dark-btn:disabled,
  .genre-ghost-btn:disabled,
  .genre-danger-btn:disabled {
    opacity:.55;
    cursor:not-allowed;
    transform:none;
  }

  .genre-stat-grid {
    display:grid;
    grid-template-columns:repeat(4, minmax(0, 1fr));
    gap:14px;
    margin-bottom:18px;
  }

  .genre-stat-card {
    background:#fff;
    border:1px solid var(--border);
    border-radius:18px;
    padding:18px;
    transition:.2s ease;
    position:relative;
    overflow:hidden;
  }

  .genre-stat-card:before {
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(135deg, var(--statSoft), transparent 48%);
    opacity:.65;
    pointer-events:none;
  }

  .genre-stat-top {
    position:relative;
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
  }

  .genre-stat-icon {
    width:36px;
    height:36px;
    border-radius:12px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:var(--statBg);
    color:var(--statColor);
    font-size:15px;
    font-weight:950;
    flex-shrink:0;
  }

  .genre-stat-card:hover {
    transform:translateY(-2px);
    box-shadow:0 14px 36px rgba(15,23,42,.07);
  }

  .genre-stat-label {
    color:var(--muted);
    font-size:12px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.06em;
  }

  .genre-stat-value {
    position:relative;
    margin-top:10px;
    font-size:28px;
    font-weight:950;
    letter-spacing:-.04em;
  }

  .genre-stat-note {
    position:relative;
    margin-top:5px;
    color:var(--soft);
    font-size:12.5px;
    font-weight:700;
  }

  .genre-section-tabs {
    display:flex;
    gap:10px;
    margin:0 0 18px;
    padding:6px;
    width:max-content;
    max-width:100%;
    background:#EEF2FF;
    border:1px solid #E0E7FF;
    border-radius:16px;
    overflow:auto;
  }

  .genre-section-tab {
    border:0;
    height:38px;
    border-radius:12px;
    padding:0 16px;
    font-size:12.5px;
    font-weight:950;
    color:#475569;
    background:transparent;
    cursor:pointer;
    white-space:nowrap;
    transition:.16s ease;
  }

  .genre-section-tab.active {
    color:#fff;
    background:linear-gradient(135deg, #4F46E5, #6D5DF6);
    box-shadow:0 8px 18px rgba(79,70,229,.2);
  }

  .genre-control-grid {
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:18px;
    align-items:stretch;
    margin-bottom:18px;
  }

  .genre-control-grid .genre-card {
    height:100%;
  }

  .genre-stack {
    display:grid;
    gap:18px;
  }

  .genre-card {
    background:#fff;
    border:1px solid var(--border);
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 1px 2px rgba(15,23,42,.03);
    transition:.2s ease;
  }

  .genre-card:hover {
    box-shadow:0 12px 34px rgba(15,23,42,.06);
  }

  .genre-card-head {
    padding:18px 20px;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
  }

  .genre-card-head h3 {
    margin:0;
    font-size:17px;
    font-weight:950;
    letter-spacing:-.03em;
  }

  .genre-card-head p {
    margin:4px 0 0;
    color:var(--muted);
    font-size:12.5px;
    font-weight:650;
  }

  .genre-card-body {
    padding:20px;
  }

  .genre-field {
    margin-bottom:14px;
  }

  .genre-label {
    display:block;
    margin-bottom:7px;
    color:#334155;
    font-size:12.5px;
    font-weight:900;
  }

  .genre-input,
  .genre-select {
    width:100%;
    height:42px;
    border:1px solid #CBD5E1;
    border-radius:13px;
    background:#fff;
    color:var(--text);
    padding:0 13px;
    outline:none;
    font-weight:650;
    transition:.18s ease;
  }

  .genre-input:focus,
  .genre-select:focus {
    border-color:var(--primary);
    box-shadow:0 0 0 4px rgba(79,70,229,.1);
  }

  .genre-switch-row {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:12px 0 16px;
  }

  .genre-switch-label {
    font-weight:900;
    color:#334155;
    font-size:13px;
  }

  .genre-switch {
    position:relative;
    width:48px;
    height:26px;
  }

  .genre-switch input {
    opacity:0;
    width:0;
    height:0;
  }

  .genre-slider {
    position:absolute;
    inset:0;
    background:#CBD5E1;
    border-radius:999px;
    cursor:pointer;
    transition:.2s;
  }

  .genre-slider:before {
    content:'';
    position:absolute;
    width:20px;
    height:20px;
    left:3px;
    top:3px;
    background:#fff;
    border-radius:50%;
    transition:.2s;
    box-shadow:0 2px 8px rgba(15,23,42,.2);
  }

  .genre-switch input:checked + .genre-slider {
    background:#10B981;
    box-shadow:0 0 0 4px rgba(16,185,129,.12);
  }

  .genre-switch input:checked + .genre-slider:before {
    transform:translateX(22px);
  }

  .genre-form-actions {
    display:flex;
    gap:10px;
  }

  .genre-alert {
    background:#fff;
    border:1px solid var(--border);
    border-radius:16px;
    padding:14px 16px;
    color:#334155;
    font-size:13.5px;
    font-weight:850;
    margin-bottom:18px;
    display:flex;
    align-items:center;
    gap:10px;
  }

  .genre-tab-tools {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    margin-bottom:14px;
  }

  .genre-counter {
    display:inline-flex;
    align-items:center;
    height:30px;
    padding:0 11px;
    border-radius:999px;
    background:#F1F5F9;
    color:#475569;
    font-size:12px;
    font-weight:900;
  }

  .genre-chip-wrap {
    display:flex;
    flex-wrap:wrap;
    gap:10px;
  }

  .genre-chip {
    border:1px solid var(--border);
    background:#fff;
    color:var(--text);
    min-height:36px;
    border-radius:999px;
    padding:0 14px;
    font-size:12.5px;
    font-weight:950;
    cursor:pointer;
    transition:.16s ease;
  }

  .genre-chip:hover {
    transform:translateY(-2px);
    border-color:#94A3B8;
  }

  .genre-chip.selected {
    background:var(--accent);
    color:#fff;
    border-color:var(--accent);
    box-shadow:0 10px 22px rgba(79,70,229,.22);
  }

  .genre-chip.locked {
    background:#F8FAFC;
    color:var(--text);
    border-color:#CBD5E1;
    cursor:default;
  }

  .genre-chip.locked:hover {
    transform:none;
  }

  .genre-chip.disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .genre-toolbar {
    display:flex;
    gap:12px;
    align-items:center;
    justify-content:space-between;
    padding:16px 20px;
    border-bottom:1px solid var(--border);
    background:#fff;
  }

  .genre-search {
    position:relative;
    width:min(440px, 100%);
  }

  .genre-search span {
    position:absolute;
    left:13px;
    top:50%;
    transform:translateY(-50%);
    color:var(--soft);
    font-size:14px;
  }

  .genre-search input {
    width:100%;
    height:42px;
    border:1px solid var(--border);
    border-radius:13px;
    padding:0 14px 0 38px;
    outline:none;
    font-weight:700;
  }

  .genre-filter-row {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
  }

  .genre-filter-btn {
    height:34px;
    border-radius:999px;
    padding:0 12px;
    border:1px solid var(--border);
    background:#fff;
    color:var(--muted);
    font-size:12px;
    font-weight:900;
    cursor:pointer;
    transition:.16s ease;
  }

  .genre-filter-btn:hover,
  .genre-filter-btn.active {
    background:var(--accent);
    color:#fff;
    border-color:var(--accent);
    box-shadow:0 8px 18px rgba(79,70,229,.18);
  }

  .genre-table-wrap {
    overflow:auto;
  }

  .genre-table {
    width:100%;
    border-collapse:collapse;
    font-size:13.5px;
  }

  .genre-table th {
    text-align:left;
    padding:13px 14px;
    background:#F8FAFC;
    color:#64748B;
    font-size:11.5px;
    text-transform:uppercase;
    letter-spacing:.06em;
    font-weight:950;
    white-space:nowrap;
  }

  .genre-table td {
    padding:15px 14px;
    border-top:1px solid #F1F5F9;
    vertical-align:middle;
  }

  .genre-table tbody tr {
    transition:.16s ease;
  }

  .genre-table tbody tr:hover {
    background:#FAFBFF;
  }

  .genre-table tbody tr.editing {
    background:#EEF2FF;
  }

  .genre-name-cell {
    font-weight:950;
    color:var(--text);
  }

  .genre-muted {
    color:var(--muted);
    font-weight:650;
  }

  .genre-badge {
    display:inline-flex;
    align-items:center;
    height:26px;
    padding:0 10px;
    border-radius:999px;
    font-size:11.5px;
    font-weight:950;
  }

  .genre-badge.active {
    background:var(--successBg);
    color:var(--success);
  }

  .genre-badge.disabled {
    background:#F1F5F9;
    color:#64748B;
  }

  .genre-badge.featured {
    background:var(--accentLight);
    color:var(--accent);
  }

  .genre-row-actions {
    display:flex;
    justify-content:flex-end;
    gap:8px;
  }

  .genre-small-btn {
    height:34px;
    border-radius:10px;
    padding:0 11px;
    font-size:12px;
    font-weight:950;
    cursor:pointer;
    transition:.16s ease;
  }

  .genre-small-btn.edit {
    background:#fff;
    border:1px solid #CBD5E1;
    color:var(--text);
  }

  .genre-small-btn.delete {
    background:#fff;
    border:1px solid #FECACA;
    color:var(--danger);
  }

  .genre-small-btn:hover {
    transform:translateY(-2px);
  }

  .genre-small-btn:disabled {
    opacity:.45;
    cursor:not-allowed;
    transform:none;
  }

  .genre-table-footer {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:14px 20px;
    border-top:1px solid var(--border);
    background:#fff;
  }

  .genre-table-footer span {
    color:var(--muted);
    font-size:12.5px;
    font-weight:800;
  }

  .genre-record-list {
    display:grid;
    gap:10px;
  }

  .genre-record-item {
    display:flex;
    gap:12px;
    align-items:flex-start;
    padding:13px;
    border:1px solid #F1F5F9;
    border-radius:14px;
    background:#fff;
    transition:.16s ease;
  }

  .genre-record-item:hover {
    transform:translateY(-2px);
    border-color:#CBD5E1;
  }

  .genre-record-dot {
    width:32px;
    height:32px;
    border-radius:12px;
    background:#EEF2FF;
    color:var(--primary);
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:950;
    flex-shrink:0;
  }

  .genre-record-title {
    font-weight:950;
    color:var(--text);
    font-size:13px;
  }

  .genre-record-sub {
    margin-top:3px;
    color:var(--muted);
    font-weight:650;
    font-size:12px;
  }

  .genre-empty {
    padding:28px;
    text-align:center;
    color:var(--muted);
    font-weight:800;
  }

  .genre-image-grid {
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:18px;
  }

  .genre-image-card {
    background:#fff;
    border:1px solid var(--border);
    border-radius:20px;
    padding:16px;
    display:grid;
    gap:14px;
    box-shadow:0 1px 2px rgba(15,23,42,.03);
  }

  .genre-image-top {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:12px;
  }

  .genre-image-name {
    margin:0;
    font-size:16px;
    font-weight:950;
    color:var(--text);
  }

  .genre-image-slug {
    margin-top:3px;
    color:var(--muted);
    font-size:12px;
    font-weight:800;
  }

  .genre-image-preview-wrap {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:12px;
  }

  .genre-image-preview-label {
    margin-bottom:6px;
    color:#334155;
    font-size:11.5px;
    font-weight:950;
    text-transform:uppercase;
    letter-spacing:.05em;
  }

  .genre-image-preview {
    position:relative;
    aspect-ratio:4.25/1;
    overflow:hidden;
    border-radius:14px;
    background:linear-gradient(135deg, #FCE7F3, #EEF2FF);
    border:1px solid #E2E8F0;
  }

  .genre-image-preview.mobile {
    aspect-ratio:3.4/1;
  }

  .genre-image-preview img {
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
  }

  .genre-image-empty-preview {
    height:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#64748B;
    font-size:12px;
    font-weight:900;
  }

  .genre-image-fields {
    display:grid;
    gap:10px;
  }

  .genre-image-actions {
  display:grid;
  grid-template-columns:1fr;
}

.genre-image-actions .genre-dark-btn {
  width:100%;
  height:48px;
}


  .genre-image-search {
    position:relative;
    width:min(420px, 100%);
  }

  .genre-image-search i {
    position:absolute;
    left:14px;
    top:50%;
    transform:translateY(-50%);
    color:var(--soft);
    font-size:14px;
  }

  .genre-image-search input {
    width:100%;
    height:42px;
    border:1px solid var(--border);
    border-radius:999px;
    padding:0 16px 0 40px;
    outline:none;
    font-weight:800;
  }

  .genre-image-chip-panel {
    display:grid;
    gap:16px;
  }

  .genre-image-chip-wrap {
    display:flex;
    flex-wrap:wrap;
    gap:10px;
  }

  .genre-image-chip {
    min-height:36px;
    border:1px solid var(--border);
    border-radius:999px;
    background:#fff;
    color:var(--text);
    padding:0 14px;
    font-size:12.5px;
    font-weight:950;
    cursor:pointer;
    transition:.16s ease;
  }

  .genre-image-chip:hover,
  .genre-image-chip.active {
    background:var(--accent);
    color:#fff;
    border-color:var(--accent);
    box-shadow:0 10px 22px rgba(79,70,229,.22);
  }

  .genre-image-editor {
    display:grid;
    gap:16px;
  }

  .genre-image-editor-top {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:12px;
    padding:16px;
    border:1px solid var(--border);
    border-radius:18px;
    background:#fff;
  }

  .genre-image-editor-grid {
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:16px;
  }

  .genre-upload-btn {
    position:relative;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    height:42px;
    border:0;
    border-radius:13px;
    padding:0 16px;
    background:linear-gradient(135deg, #4F46E5, #6D5DF6);
    color:#fff;
    font-weight:950;
    cursor:pointer;
    box-shadow:0 10px 22px rgba(79,70,229,.24);
  }

  .genre-upload-btn input {
    position:absolute;
    inset:0;
    opacity:0;
    cursor:pointer;
  }

  @media (max-width:1100px) {
    .genre-stat-grid {
      grid-template-columns:repeat(2, minmax(0, 1fr));
    }

    .genre-control-grid,
    .genre-image-grid,
    .genre-image-editor-grid {
      grid-template-columns:1fr;
    }
  }

  @media (max-width:760px) {
    .genre-header {
      min-height:70px;
      height:auto;
      gap:8px;
      padding-top:12px;
      padding-right:12px;
      padding-bottom:12px;
      padding-left:70px !important;
    }

    .genre-header h2 {
      min-width:0;
      font-size:15px;
      line-height:1.25;
    }

    .genre-header .genre-dark-btn {
      height:38px;
      padding:0 12px;
      font-size:12px;
      flex-shrink:0;
    }

    .genre-content {
      padding:22px 16px 40px;
    }

    .genre-page-top,
    .genre-toolbar,
    .genre-tab-tools,
    .genre-table-footer,
    .genre-image-top,
    .genre-image-editor-top,
    .genre-card-head {
      flex-direction:column;
      align-items:stretch;
    }

    .genre-page-top {
      gap:14px;
      margin-bottom:18px;
    }

    .genre-page-top h1 {
      font-size:24px;
    }

    .genre-page-top .genre-ghost-btn,
    .genre-form-actions .genre-dark-btn,
    .genre-form-actions .genre-ghost-btn,
    .genre-table-footer .genre-ghost-btn {
      width:100%;
    }

    .genre-stat-grid {
      gap:12px;
    }

    .genre-stat-card {
      padding:16px;
    }

    .genre-section-tabs {
      width:100%;
      overflow-x:auto;
      scrollbar-width:none;
    }

    .genre-section-tabs::-webkit-scrollbar {
      display:none;
    }

    .genre-section-tab {
      flex:0 0 auto;
    }

    .genre-control-grid,
    .genre-stack {
      gap:14px;
    }

    .genre-card-head,
    .genre-card-body {
      padding:16px;
    }

    .genre-form-actions {
      display:grid;
      grid-template-columns:1fr;
      gap:10px;
    }

    .genre-toolbar {
      gap:12px;
      padding:16px;
    }

    .genre-search,
    .genre-image-search {
      width:100%;
    }

    .genre-filter-row {
      width:100%;
    }

    .genre-filter-btn {
      flex:1 1 auto;
    }

    .genre-table {
      min-width:780px;
    }

    .genre-table-footer {
      padding:14px 16px;
    }

    .genre-table-footer span {
      text-align:center;
    }

    .genre-record-item {
      min-width:0;
    }

    .genre-record-item > div:last-child {
      min-width:0;
      overflow-wrap:anywhere;
    }

    .genre-image-preview-wrap {
      grid-template-columns:1fr;
    }

    .genre-image-card {
      padding:14px;
    }

    .genre-image-actions .genre-dark-btn,
    .genre-upload-btn {
      width:100%;
    }

    .genre-alert {
      align-items:flex-start;
      overflow-wrap:anywhere;
    }
  }

  @media (max-width:520px) {
    .genre-stat-grid {
      grid-template-columns:1fr;
    }

    .genre-page-top h1 {
      font-size:22px;
    }

    .genre-chip-wrap,
    .genre-image-chip-wrap {
      gap:8px;
    }

    .genre-chip,
    .genre-image-chip {
      min-height:34px;
      padding:0 12px;
      font-size:12px;
    }

    .genre-row-actions {
      flex-direction:column;
      align-items:stretch;
    }

    .genre-small-btn {
      width:100%;
    }
  }
`

export default function GenreManagementPage() {
  const [genres, setGenres] = useState([])
  const [featuredTabs, setFeaturedTabs] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [activePanel, setActivePanel] = useState('manage')
  const [imageDrafts, setImageDrafts] = useState({})
  const [selectedImageGenreId, setSelectedImageGenreId] = useState('')
  const [genreImageSearch, setGenreImageSearch] = useState('')
  const [uploadingImage, setUploadingImage] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sort_order: 0,
    is_active: true,
    banner_image_url: '',
    mobile_banner_image_url: '',
  })

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
    'X-Admin-Name': 'Admin',
  }

  const selectedGenreIds = useMemo(() => {
    return featuredTabs
      .filter((tab) => !tab.is_locked && tab.genre_id)
      .map((tab) => tab.genre_id)
  }, [featuredTabs])

  const featuredIdSet = useMemo(() => new Set(selectedGenreIds), [selectedGenreIds])

  const stats = useMemo(() => {
    const total = genres.length
    const active = genres.filter((genre) => genre.is_active).length
    const storyCount = genres.reduce((sum, genre) => sum + Number(genre.story_count || 0), 0)

    return [
      {
        label: 'Total Genres',
        value: total,
        note: 'All created genres',
        icon: '▦',
        bg: '#EEF2FF',
        color: '#4F46E5',
        soft: '#F5F3FF',
      },
      {
        label: 'Active Genres',
        value: active,
        note: 'Available for stories',
        icon: '✓',
        bg: '#DCFCE7',
        color: '#16A34A',
        soft: '#F0FDF4',
      },
      {
        label: 'For You Tabs',
        value: `${selectedGenreIds.length + 1}/12`,
        note: 'Today plus selected genres',
        icon: '◆',
        bg: '#F3E8FF',
        color: '#7C3AED',
        soft: '#FAF5FF',
      },
      {
        label: 'Stories Using Genres',
        value: storyCount,
        note: 'Based on current story data',
        icon: '↗',
        bg: '#FEF3C7',
        color: '#D97706',
        soft: '#FFFBEB',
      },
    ]
  }, [genres, selectedGenreIds])

  const filteredGenres = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return genres.filter((genre) => {
      const matchKeyword =
        !keyword ||
        String(genre.name || '').toLowerCase().includes(keyword) ||
        String(genre.slug || '').toLowerCase().includes(keyword)

      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && genre.is_active) ||
        (filter === 'disabled' && !genre.is_active) ||
        (filter === 'featured' && featuredIdSet.has(genre.id))

      return matchKeyword && matchFilter
    })
  }, [genres, searchQuery, filter, featuredIdSet])

  const visibleGenres = showAllGenres ? filteredGenres : filteredGenres.slice(0, 5)

  function getDraft(genre) {
    return imageDrafts[genre.id] || {
      banner_image_url: genre.banner_image_url || '',
      mobile_banner_image_url: genre.mobile_banner_image_url || '',
    }
  }

  const selectedImageGenre = useMemo(() => {
    if (!genres.length) return null

    return genres.find((genre) => genre.id === selectedImageGenreId) || genres[0]
  }, [genres, selectedImageGenreId])

  const imageGenreOptions = useMemo(() => {
    const keyword = genreImageSearch.trim().toLowerCase()

    return genres.filter((genre) => {
      if (!keyword) return true

      return (
        String(genre.name || '').toLowerCase().includes(keyword) ||
        String(genre.slug || '').toLowerCase().includes(keyword)
      )
    })
  }, [genres, genreImageSearch])

  function pushRecord(title, detail) {
    setRecords((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        detail,
        time: 'Just now',
      },
      ...current,
    ].slice(0, 8))
  }

  async function loadData() {
    try {
      setLoading(true)

      const [genresRes, tabsRes] = await Promise.all([
        fetch(`${API_URL}/api/genres/admin/records`, { headers: requestHeaders }),
        fetch(`${API_URL}/api/genres/featured-tabs?include_inactive=true`, { headers: requestHeaders }),
      ])

      const genresData = await genresRes.json().catch(() => ({}))
      const tabsData = await tabsRes.json().catch(() => ({}))

      if (!genresRes.ok || genresData.ok === false) {
        throw new Error(genresData.message || 'Failed to load genres')
      }

      if (!tabsRes.ok || tabsData.ok === false) {
        throw new Error(tabsData.message || 'Failed to load featured tabs')
      }

      const nextGenres = genresData.genres || []
      const nextDrafts = {}

      nextGenres.forEach((genre) => {
        nextDrafts[genre.id] = {
          banner_image_url: genre.banner_image_url || '',
          mobile_banner_image_url: genre.mobile_banner_image_url || '',
        }
      })

      setGenres(nextGenres)
      setFeaturedTabs(tabsData.tabs || [])
      setImageDrafts(nextDrafts)
      setSelectedImageGenreId((current) => current || nextGenres[0]?.id || '')
    } catch (error) {
      setMessage(error.message || 'Failed to load genre data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm({
      name: '',
      slug: '',
      sort_order: 0,
      is_active: true,
      banner_image_url: '',
      mobile_banner_image_url: '',
    })
  }

  function handleNameChange(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingId ? current.slug : slugify(value),
    }))
  }

  function handleEdit(genre) {
    setEditingId(genre.id)
    setActivePanel('manage')
    setForm({
      name: genre.name || '',
      slug: genre.slug || '',
      sort_order: genre.sort_order || 0,
      is_active: Boolean(genre.is_active),
      banner_image_url: genre.banner_image_url || '',
      mobile_banner_image_url: genre.mobile_banner_image_url || '',
    })
    setMessage(`Editing ${genre.name}`)
  }

  function updateImageDraft(genreId, field, value) {
    setImageDrafts((current) => ({
      ...current,
      [genreId]: {
        ...(current[genreId] || {}),
        [field]: value,
      },
    }))
  }

  async function handleSaveGenreImages(genre) {
    try {
      setSaving(true)
      setMessage('')

      const draft = getDraft(genre)
      const payload = {
        banner_image_url: String(draft.banner_image_url || '').trim(),
        mobile_banner_image_url: String(draft.mobile_banner_image_url || '').trim(),
      }

      const res = await fetch(`${API_URL}/api/genres/admin/records/${genre.id}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save genre images')
      }

      setMessage(`${genre.name} images updated successfully`)
      pushRecord('Updated genre images', genre.name)
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to save genre images')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadGenreBanner(genre, type, file) {
    if (!genre || !file) return

    try {
      const uploadKey = `${genre.id}-${type}`
      setUploadingImage(uploadKey)
      setMessage('')

      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type)

      const res = await fetch(`${API_URL}/api/genres/admin/upload-banner`, {
        method: 'POST',
        headers: {
          ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
          'X-Admin-Name': 'Admin',
        },
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to upload banner')
      }

      const imageUrl = data.image_url || data.imageUrl || ''

setImageDrafts((current) => {
  const draft = current[genre.id] || {}
  const isMobile = type === 'mobile'

  return {
    ...current,
    [genre.id]: {
      ...draft,
      banner_image_url: isMobile ? (draft.banner_image_url || imageUrl) : imageUrl,
      mobile_banner_image_url: isMobile ? imageUrl : (draft.mobile_banner_image_url || imageUrl),
    },
  }
})

      setMessage(`${genre.name} ${type} banner uploaded`)
    } catch (error) {
      setMessage(error.message || 'Failed to upload banner')
    } finally {
      setUploadingImage('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')

      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active),
        banner_image_url: String(form.banner_image_url || '').trim(),
        mobile_banner_image_url: String(form.mobile_banner_image_url || '').trim(),
      }

      const url = editingId
        ? `${API_URL}/api/genres/admin/records/${editingId}`
        : `${API_URL}/api/genres/admin/records`

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save genre')
      }

      const action = editingId ? 'Updated genre' : 'Created genre'
      setMessage(editingId ? 'Genre updated successfully' : 'Genre created successfully')
      pushRecord(action, payload.name)
      resetForm()
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to save genre')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(genre) {
    if (Number(genre.story_count || 0) > 0) {
      setMessage('This genre has stories. Disable it instead.')
      return
    }

    const confirmed = window.confirm(`Delete ${genre.name}?`)
    if (!confirmed) return

    try {
      setSaving(true)
      setMessage('')

      const res = await fetch(`${API_URL}/api/genres/admin/records/${genre.id}`, {
        method: 'DELETE',
        headers: requestHeaders,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete genre')
      }

      setMessage('Genre deleted successfully')
      pushRecord('Deleted genre', genre.name)
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to delete genre')
    } finally {
      setSaving(false)
    }
  }

  function toggleFeaturedGenre(genreId) {
    const exists = selectedGenreIds.includes(genreId)

    if (exists) {
      setFeaturedTabs((current) => current.filter((tab) => tab.genre_id !== genreId))
      return
    }

    if (selectedGenreIds.length >= 11) {
      setMessage('For You can show only 11 custom genres plus Today')
      return
    }

    const genre = genres.find((item) => item.id === genreId)
    if (!genre || !genre.is_active) return

    setFeaturedTabs((current) => [
      ...current,
      {
        genre_id: genre.id,
        label: genre.name,
        slug: genre.slug,
        is_locked: false,
        is_active: true,
        sort_order: (current.length + 1) * 10,
        genre,
      },
    ])
  }

  async function saveFeaturedTabs() {
    try {
      setSaving(true)
      setMessage('')

      const res = await fetch(`${API_URL}/api/genres/admin/featured-tabs`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify({ genre_ids: selectedGenreIds }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save featured tabs')
      }

      setMessage('For You genre tabs updated successfully')
      pushRecord('Updated For You tabs', `${selectedGenreIds.length + 1} tabs active`)
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to save featured tabs')
    } finally {
      setSaving(false)
    }
  }

  function renderImagePreview(url, label, mobile = false) {
    return (
      <div>
        <div className="genre-image-preview-label">{label}</div>
        <div className={`genre-image-preview ${mobile ? 'mobile' : ''}`}>
          {url ? (
            <img src={url} alt={label} loading="lazy" />
          ) : (
            <div className="genre-image-empty-preview">No image</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="genre-admin-shell">
        <AdminSidebar />

        <main className="genre-main">
          <header className="genre-header">
            <h2>Genre Management</h2>
            {activePanel === 'manage' ? (
  <button className="genre-dark-btn" type="button" onClick={saveFeaturedTabs} disabled={saving}>
    {saving ? 'Saving...' : 'Save Tabs'}
  </button>
) : null}
          </header>

          <div className="genre-content">
            <div className="genre-page-top">
              <div>
                <h1>Genre Management</h1>
                <p>Manage story genres, active status, images, and the Novel tab genres shown on For You.</p>
              </div>
              <button className="genre-ghost-btn" type="button" onClick={loadData} disabled={loading || saving}>
                Refresh
              </button>
            </div>

            {message && (
              <div className="genre-alert">
                <span>●</span>
                <span>{message}</span>
              </div>
            )}

            <div className="genre-stat-grid">
              {stats.map((item) => (
                <div
                  className="genre-stat-card"
                  key={item.label}
                  style={{
                    '--statBg': item.bg,
                    '--statColor': item.color,
                    '--statSoft': item.soft,
                  }}
                >
                  <div className="genre-stat-top">
                    <div className="genre-stat-label">{item.label}</div>
                    <div className="genre-stat-icon">{item.icon}</div>
                  </div>
                  <div className="genre-stat-value">{item.value}</div>
                  <div className="genre-stat-note">{item.note}</div>
                </div>
              ))}
            </div>

            <div className="genre-section-tabs">
              <button
                className={`genre-section-tab ${activePanel === 'manage' ? 'active' : ''}`}
                type="button"
                onClick={() => setActivePanel('manage')}
              >
                Manage Genres
              </button>
              <button
                className={`genre-section-tab ${activePanel === 'images' ? 'active' : ''}`}
                type="button"
                onClick={() => setActivePanel('images')}
              >
                Genre Images
              </button>
            </div>

            {activePanel === 'manage' ? (
              <div className="genre-stack">
                <div className="genre-control-grid">
                  <div className="genre-card">
                    <div className="genre-card-head">
                      <div>
                        <h3>{editingId ? 'Edit Genre' : 'Create Genre'}</h3>
                        <p>{editingId ? 'Update selected genre information.' : 'Add a new story genre.'}</p>
                      </div>
                    </div>

                    <div className="genre-card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="genre-field">
                          <label className="genre-label">Name</label>
                          <input
                            className="genre-input"
                            value={form.name}
                            onChange={(event) => handleNameChange(event.target.value)}
                            placeholder="Romance"
                            required
                          />
                        </div>

                        <div className="genre-field">
                          <label className="genre-label">Slug</label>
                          <input
                            className="genre-input"
                            value={form.slug}
                            onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                            placeholder="romance"
                            required
                          />
                        </div>

                        <div className="genre-field">
                          <label className="genre-label">Sort Order</label>
                          <input
                            className="genre-input"
                            type="number"
                            value={form.sort_order}
                            onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                          />
                        </div>

                        <div className="genre-switch-row">
                          <span className="genre-switch-label">Active Genre</span>
                          <label className="genre-switch">
                            <input
                              type="checkbox"
                              checked={form.is_active}
                              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                            />
                            <span className="genre-slider" />
                          </label>
                        </div>

                        <div className="genre-form-actions">
                          <button className="genre-dark-btn" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editingId ? 'Update Genre' : 'Create Genre'}
                          </button>
                          {editingId && (
                            <button className="genre-ghost-btn" type="button" onClick={resetForm}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="genre-card">
                    <div className="genre-card-head">
                      <div>
                        <h3>For You Genre Tabs</h3>
                        <p>Today is locked. Choose up to 11 more genres for the Novel tab.</p>
                      </div>
                      <span className="genre-counter">{selectedGenreIds.length + 1}/12 Tabs</span>
                    </div>

                    <div className="genre-card-body">
                      <div className="genre-tab-tools">
                        <div className="genre-counter">Selected genres appear as black buttons</div>
                        <div className="genre-counter">Today + {selectedGenreIds.length} genres selected</div>
                      </div>

                      <div className="genre-chip-wrap">
                        <button className="genre-chip locked" type="button">
                          Today 🔒
                        </button>

                        {genres.map((genre) => {
                          const selected = selectedGenreIds.includes(genre.id)
                          return (
                            <button
                              key={genre.id}
                              type="button"
                              className={`genre-chip ${selected ? 'selected' : ''} ${!genre.is_active ? 'disabled' : ''}`}
                              onClick={() => toggleFeaturedGenre(genre.id)}
                              disabled={!genre.is_active}
                            >
                              {selected ? '✓ ' : ''}{genre.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="genre-card">
                  <div className="genre-card-head">
                    <div>
                      <h3>All Genres</h3>
                      <p>Search, filter, edit, disable, or delete unused genres.</p>
                    </div>
                  </div>

                  <div className="genre-toolbar">
                    <div className="genre-search">
                      <span>⌕</span>
                      <input
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value)
                          setShowAllGenres(false)
                        }}
                        placeholder="Search genre by name or slug..."
                      />
                    </div>

                    <div className="genre-filter-row">
                      {['all', 'active', 'disabled', 'featured'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`genre-filter-btn ${filter === item ? 'active' : ''}`}
                          onClick={() => {
                            setFilter(item)
                            setShowAllGenres(false)
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="genre-empty">Loading genres...</div>
                  ) : filteredGenres.length === 0 ? (
                    <div className="genre-empty">No genre found</div>
                  ) : (
                    <>
                      <div className="genre-table-wrap">
                        <table className="genre-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Slug</th>
                              <th>Stories</th>
                              <th>For You</th>
                              <th>Status</th>
                              <th>Sort</th>
                              <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleGenres.map((genre) => {
                              const isFeatured = featuredIdSet.has(genre.id)
                              const hasStories = Number(genre.story_count || 0) > 0

                              return (
                                <tr key={genre.id} className={editingId === genre.id ? 'editing' : ''}>
                                  <td className="genre-name-cell">{genre.name}</td>
                                  <td className="genre-muted">{genre.slug}</td>
                                  <td className="genre-muted">{genre.story_count || 0}</td>
                                  <td>
                                    {isFeatured ? (
                                      <span className="genre-badge featured">Featured</span>
                                    ) : (
                                      <span className="genre-muted">No</span>
                                    )}
                                  </td>
                                  <td>
                                    <span className={`genre-badge ${genre.is_active ? 'active' : 'disabled'}`}>
                                      {genre.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                  </td>
                                  <td className="genre-muted">{genre.sort_order || 0}</td>
                                  <td>
                                    <div className="genre-row-actions">
                                      <button className="genre-small-btn edit" type="button" onClick={() => handleEdit(genre)}>
                                        Edit
                                      </button>
                                      <button
                                        className="genre-small-btn delete"
                                        type="button"
                                        onClick={() => handleDelete(genre)}
                                        disabled={saving || hasStories}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="genre-table-footer">
                        <span>Showing {visibleGenres.length} of {filteredGenres.length} genres</span>
                        {filteredGenres.length > 5 && (
                          <button className="genre-ghost-btn" type="button" onClick={() => setShowAllGenres((current) => !current)}>
                            {showAllGenres ? 'Show Less' : 'View All Genres'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="genre-card">
                  <div className="genre-card-head">
                    <div>
                      <h3>Recent Genre Records</h3>
                      <p>Latest genre changes from this admin session.</p>
                    </div>
                  </div>

                  <div className="genre-card-body">
                    {records.length === 0 ? (
                      <div className="genre-empty">No recent genre records yet</div>
                    ) : (
                      <div className="genre-record-list">
                        {records.map((record) => (
                          <div className="genre-record-item" key={record.id}>
                            <div className="genre-record-dot">✓</div>
                            <div>
                              <div className="genre-record-title">{record.title}</div>
                              <div className="genre-record-sub">{record.detail} · {record.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {activePanel === 'images' ? (
              <div className="genre-card">
                <div className="genre-card-head">
                  <div>
                    <h3>Genre Images</h3>
                    <p>Select one genre, upload desktop and mobile banners, then save.</p>
                  </div>
                  <span className="genre-counter">{genres.length} Genres</span>
                </div>

                <div className="genre-card-body">
                  {loading ? (
                    <div className="genre-empty">Loading genres...</div>
                  ) : genres.length === 0 ? (
                    <div className="genre-empty">No genres found</div>
                  ) : (
                    <div className="genre-image-chip-panel">
          <div className="genre-image-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              value={genreImageSearch}
              onChange={(event) => setGenreImageSearch(event.target.value)}
              placeholder="Search genres..."
            />
          </div>

          <div className="genre-image-chip-wrap">
            {imageGenreOptions.map((genre) => (
              <button
                key={genre.id}
                className={`genre-image-chip ${selectedImageGenre?.id === genre.id ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedImageGenreId(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>

          {selectedImageGenre ? (
            <div className="genre-image-editor">
              <div className="genre-image-editor-top">
                <div>
                  <h4 className="genre-image-name">{selectedImageGenre.name}</h4>
                  <div className="genre-image-slug">{selectedImageGenre.slug}</div>
                </div>
                <span className={`genre-badge ${selectedImageGenre.is_active ? 'active' : 'disabled'}`}>
                  {selectedImageGenre.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="genre-image-editor-grid">
                <div className="genre-image-card">
                  {renderImagePreview(getDraft(selectedImageGenre).banner_image_url, 'Desktop Banner')}
                  <label className="genre-upload-btn">
                    {uploadingImage === `${selectedImageGenre.id}-desktop` ? 'Uploading...' : 'Upload Desktop Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploadingImage)}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        handleUploadGenreBanner(selectedImageGenre, 'desktop', file)
                      }}
                    />
                  </label>
                </div>

                <div className="genre-image-card">
                  {renderImagePreview(
  getDraft(selectedImageGenre).mobile_banner_image_url,
  'Mobile Banner',
  true
)}

                  <label className="genre-upload-btn">
                    {uploadingImage === `${selectedImageGenre.id}-mobile` ? 'Uploading...' : 'Upload Mobile Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploadingImage)}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        handleUploadGenreBanner(selectedImageGenre, 'mobile', file)
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="genre-image-actions">
                <button
                  className="genre-dark-btn"
                  type="button"
                  onClick={() => handleSaveGenreImages(selectedImageGenre)}
                  disabled={saving || Boolean(uploadingImage)}
                >
                  {saving ? 'Saving...' : 'Save Images'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  </div>
) : null}
          </div>
        </main>
      </div>
    </>
  )
}
