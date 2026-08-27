import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminGenreRankPanel from '../components/AdminGenreRankPanel'
import AdminAuthorRankPanel from '../components/AdminAuthorRankPanel'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

const styles = `
  .ranking-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ranking-hero {
    background: linear-gradient(135deg, #111827, #312E81);
    color: white;
    border-radius: 22px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    overflow: hidden;
    position: relative;
  }

  .ranking-hero::after {
    content: '';
    width: 180px;
    height: 180px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    position: absolute;
    right: -48px;
    top: -72px;
  }

  .ranking-kicker {
    font-size: 11px;
    font-weight: 950;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C7D2FE;
    margin-bottom: 8px;
  }

  .ranking-hero h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .ranking-hero p {
    margin: 8px 0 0;
    max-width: 680px;
    color: #E0E7FF;
    font-size: 13px;
    line-height: 1.7;
    font-weight: 650;
  }

  .ranking-hero-badge {
    height: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 999px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
    z-index: 1;
  }

  .ranking-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 10px;
  }

  .ranking-tab {
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: #64748B;
    padding: 10px 13px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ranking-tab.active {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .ranking-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #CBD5E1;
  }

  .ranking-tab.active .ranking-dot {
    background: #4F46E5;
  }

  .ranking-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(150px, 190px)) 110px;
    gap: 10px;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 14px;
  }

  .ranking-toolbar input,
  .ranking-toolbar select {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #0F172A;
    border-radius: 13px;
    height: 42px;
    padding: 0 13px;
    outline: none;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
  }

  .ranking-toolbar input:focus,
  .ranking-toolbar select:focus {
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .ranking-btn {
    height: 42px;
    border: 0;
    border-radius: 13px;
    background: #4F46E5;
    color: white;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
  }

  .ranking-btn.light {
    background: #F1F5F9;
    color: #475569;
  }

  .ranking-panel {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    overflow: hidden;
  }

  .ranking-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .ranking-panel-title {
    font-size: 16px;
    font-weight: 950;
    color: #0F172A;
  }

  .ranking-panel-subtitle {
    margin-top: 3px;
    font-size: 12px;
    font-weight: 750;
    color: #64748B;
  }

  .ranking-pill {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    font-size: 11px;
    font-weight: 950;
    padding: 8px 12px;
    white-space: nowrap;
  }

  .ranking-pill.live {
    background: #DCFCE7;
    color: #15803D;
  }

  .ranking-pill.private {
    background: #FEF3C7;
    color: #B45309;
  }

  .ranking-alert {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 13px;
    font-weight: 850;
  }

  .ranking-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .ranking-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1060px;
  }

  .ranking-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 13px 14px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }

  .ranking-table td {
    padding: 15px 14px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 750;
    vertical-align: middle;
  }

  .ranking-table tr:last-child td {
    border-bottom: 0;
  }

  .ranking-rank {
    min-width: 42px;
    height: 30px;
    border-radius: 10px;
    background: #EEF2FF;
    color: #4F46E5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 950;
  }

  .ranking-story-cell {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 260px;
  }

  .ranking-cover {
    width: 42px;
    height: 56px;
    border-radius: 10px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 19px;
    font-weight: 950;
  }

  .ranking-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ranking-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ranking-muted {
    margin-top: 3px;
    color: #64748B;
    font-size: 11px;
    font-weight: 750;
  }

  .ranking-id-btn {
    border: 0;
    background: #F8FAFC;
    color: #475569;
    border-radius: 999px;
    padding: 7px 10px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 950;
    max-width: 132px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ranking-score {
    color: #4F46E5;
    font-weight: 950;
  }

  .ranking-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    text-transform: capitalize;
  }

  .ranking-status.green {
    background: #DCFCE7;
    color: #15803D;
  }

  .ranking-status.yellow {
    background: #FEF3C7;
    color: #B45309;
  }

  .ranking-status.red {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .ranking-status.gray {
    background: #F1F5F9;
    color: #475569;
  }

  .ranking-actions {
    display: flex;
    gap: 7px;
    align-items: center;
  }

  .ranking-actions button {
    border: 0;
    background: #F1F5F9;
    color: #475569;
    border-radius: 10px;
    height: 32px;
    padding: 0 10px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
  }

  .ranking-empty,
  .ranking-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    text-align: center;
    padding: 28px;
    color: #64748B;
  }

  .ranking-empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 14px;
  }

  .ranking-empty-title {
    color: #0F172A;
    font-size: 16px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ranking-empty-text {
    max-width: 520px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
  }

  .ranking-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #E0E7FF;
    border-top-color: #4F46E5;
    border-radius: 999px;
    animation: rankingSpin 0.8s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes rankingSpin {
    to { transform: rotate(360deg); }
  }

  .ranking-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 18px;
    border-top: 1px solid #E2E8F0;
  }

  .ranking-pagination span {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .ranking-pagination button {
    border: 0;
    background: #F1F5F9;
    color: #475569;
    border-radius: 10px;
    height: 34px;
    padding: 0 12px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
  }

  .ranking-pagination button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .ranking-settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    padding: 18px;
  }

  .ranking-setting-card {
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    border-radius: 16px;
    padding: 16px;
  }

  .ranking-setting-card strong {
    display: block;
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ranking-setting-card span {
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.6;
  }


  .ranking-danger-btn {
    background: #FEF2F2 !important;
    color: #DC2626 !important;
  }

  .ranking-success-btn {
    background: #DCFCE7 !important;
    color: #15803D !important;
  }

  .ranking-modal-layer {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.42);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .ranking-modal {
    width: min(520px, 100%);
    background: white;
    border-radius: 22px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
    padding: 20px;
  }

  .ranking-modal-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .ranking-modal-top h3 {
    margin: 3px 0 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
  }

  .ranking-modal-close {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    cursor: pointer;
    font-size: 18px;
    font-weight: 950;
  }

  .ranking-modal-story {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 14px;
  }

  .ranking-modal-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 12px;
  }

  .ranking-modal-field span {
    color: #475569;
    font-size: 12px;
    font-weight: 950;
  }

  .ranking-modal-field textarea {
    width: 100%;
    min-height: 92px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #F8FAFC;
    color: #0F172A;
    padding: 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
    outline: none;
    resize: vertical;
  }

  .ranking-modal-field textarea:focus {
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .ranking-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }

  .ranking-modal-actions button {
    height: 38px;
    border: 0;
    border-radius: 12px;
    padding: 0 14px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
  }

  .ranking-modal-actions button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 980px) {
    .ranking-page {
      min-width: 0;
    }

    .ranking-hero {
      flex-direction: column;
    }

    .ranking-hero > div {
      min-width: 0;
    }

    .ranking-toolbar {
      grid-template-columns: 1fr;
    }

    .ranking-toolbar input,
    .ranking-toolbar select,
    .ranking-btn {
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }

    .ranking-table-wrap {
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }
  }

  @media (max-width: 760px) {
    .ranking-page {
      gap: 14px;
    }

    .ranking-hero {
      border-radius: 20px;
      padding: 18px 16px;
    }

    .ranking-hero h2 {
      font-size: 22px;
      overflow-wrap: anywhere;
    }

    .ranking-hero p,
    .ranking-alert,
    .ranking-panel-subtitle,
    .ranking-empty-text,
    .ranking-setting-card span,
    .ranking-modal-top h3,
    .ranking-muted {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .ranking-hero-badge {
      align-self: flex-start;
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
      text-align: center;
    }

    .ranking-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      border-radius: 16px;
    }

    .ranking-tabs::-webkit-scrollbar {
      display: none;
    }

    .ranking-tab {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .ranking-toolbar {
      padding: 12px;
      border-radius: 16px;
    }

    .ranking-panel {
      min-width: 0;
      border-radius: 18px;
    }

    .ranking-panel-top {
      align-items: flex-start;
      padding: 15px;
    }

    .ranking-panel-top > div {
      min-width: 0;
    }

    .ranking-pill {
      flex-shrink: 0;
      max-width: 46%;
      white-space: normal;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .ranking-table {
      min-width: 980px;
    }

    .ranking-table th,
    .ranking-table td {
      padding-left: 12px;
      padding-right: 12px;
    }

    .ranking-title {
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .ranking-story-cell {
      min-width: 220px;
    }

    .ranking-actions {
      flex-wrap: wrap;
      min-width: 190px;
    }

    .ranking-actions button {
      min-height: 36px;
      height: auto;
      padding-top: 7px;
      padding-bottom: 7px;
      line-height: 1.25;
    }

    .ranking-empty,
    .ranking-loading {
      min-height: 230px;
      padding: 24px 16px;
    }

    .ranking-pagination {
      display: grid;
      grid-template-columns: 1fr 1fr;
      justify-content: stretch;
      padding: 14px 15px;
    }

    .ranking-pagination span {
      grid-column: 1 / -1;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .ranking-pagination button {
      width: 100%;
      min-width: 0;
      min-height: 40px;
    }

    .ranking-settings-grid {
      grid-template-columns: 1fr;
      padding: 14px;
    }

    .ranking-setting-card {
      min-width: 0;
    }

    .ranking-modal-layer {
      align-items: flex-end;
      padding: 0;
    }

    .ranking-modal {
      width: 100%;
      max-height: 94dvh;
      overflow-y: auto;
      border-radius: 22px 22px 0 0;
      padding: 17px 16px 20px;
    }

    .ranking-modal-top > div {
      min-width: 0;
    }

    .ranking-modal-close {
      flex-shrink: 0;
    }

    .ranking-modal-story {
      min-width: 0;
    }

    .ranking-modal-story > div:last-child {
      min-width: 0;
    }

    .ranking-modal-field textarea {
      min-width: 0;
      box-sizing: border-box;
    }

    .ranking-modal-actions {
      position: sticky;
      bottom: -20px;
      z-index: 2;
      background: white;
      margin-left: -16px;
      margin-right: -16px;
      margin-bottom: -20px;
      padding: 14px 16px 20px;
      border-top: 1px solid #E2E8F0;
    }

    .ranking-modal-actions button {
      flex: 1;
      min-width: 0;
      height: auto;
      min-height: 40px;
      padding: 8px 10px;
      line-height: 1.3;
    }
  }

  @media (max-width: 480px) {
    .ranking-hero {
      padding-left: 14px;
      padding-right: 14px;
    }

    .ranking-panel-top {
      flex-direction: column;
    }

    .ranking-pill {
      max-width: 100%;
    }

    .ranking-pagination {
      grid-template-columns: 1fr;
    }

    .ranking-pagination span {
      grid-column: auto;
      order: -1;
    }

    .ranking-modal-actions {
      flex-direction: column;
    }

    .ranking-modal-actions button {
      width: 100%;
    }
  }
`

const tabs = [
  {
    key: 'stories',
    label: 'Story Rank',
    subtitle: 'Public story ranking control and monitoring.',
    empty: 'No story ranking data found. Try changing filters or search.',
    columns: ['Rank', 'Cover', 'Story', 'Story ID', 'Author', 'Genre', 'Views', 'Likes', 'Comments', 'Score', 'Status', 'Action'],
  },
  {
    key: 'genres',
    label: 'Genre Rank',
    subtitle: 'See which Main Genres readers view the most.',
    empty: '',
    columns: [],
  },
  {
    key: 'authors',
    label: 'Author Rank',
    subtitle: 'Track top authors by engagement and growth.',
    empty: 'Author ranking data will connect after Story Rank.',
    columns: ['Rank', 'Author', 'Author ID', 'Username', 'Stories', 'Followers', 'Views', 'Likes', 'Score', 'Action'],
  },
  {
    key: 'episodes',
    label: 'Episode Rank',
    subtitle: 'Monitor top performing episodes.',
    empty: 'Episode ranking data will connect after Author Rank.',
    columns: ['Rank', 'Episode', 'Episode ID', 'Story', 'Author', 'Views', 'Likes', 'Comments', 'Score', 'Action'],
  },
  {
    key: 'income',
    label: 'Income Rank',
    subtitle: 'Private admin-only author income ranking.',
    empty: 'Income Rank will connect to your existing Income system later.',
    columns: ['Rank', 'Author', 'Author ID', 'Username', 'Total Income', 'This Month', 'Pending', 'Paid', 'Status', 'Action'],
  },
  {
    key: 'hidden',
    label: 'Hidden Rank',
    subtitle: 'Stories, authors, or episodes hidden from public ranking.',
    empty: 'No hidden ranking records found.',
    columns: ['Type', 'Name', 'ID', 'Hidden Reason', 'Hidden By', 'Hidden Date', 'Status', 'Action'],
  },
  {
    key: 'settings',
    label: 'Settings',
    subtitle: 'Ranking rules, score formula, and safety settings.',
    empty: '',
    columns: [],
  },
]

const settingItems = [
  ['Score Formula', 'Views + Likes × 5 + Comments × 10 + Episodes × 3.'],
  ['Minimum Activity', 'Control minimum views, likes, or episodes before an item can rank.'],
  ['Public Safety', 'Deleted stories stay excluded, and Admin can hide a story from public Ranking without deleting it.'],
  ['Income Privacy', 'Income Rank stays admin-only and never appears on the reader website.'],
  ['Suspicious Activity', 'Later stage can detect abnormal views, likes, comments, or spam growth.'],
  ['Manual Control', 'Hide and unhide are live now. Pin, feature, and ranking flags can be added later.'],
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function shortId(value) {
  const text = String(value || '')
  if (text.length <= 10) return text
  return `${text.slice(0, 8)}...`
}

function copyText(value) {
  if (!value) return
  navigator.clipboard?.writeText(String(value)).catch(() => {})
}

function statusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'published' || value === 'active' || value === 'visible') return 'green'
  if (value === 'restricted' || value === 'ready' || value === 'scheduled') return 'yellow'
  if (value === 'disabled' || value === 'deleted' || value === 'hidden') return 'red'
  return 'gray'
}

function StatusBadge({ status }) {
  return <span className={`ranking-status ${statusClass(status)}`}>{status || '-'}</span>
}

function EmptyState({ title, text }) {
  return (
    <div className="ranking-empty">
      <div className="ranking-empty-icon">🏆</div>
      <div className="ranking-empty-title">{title}</div>
      <div className="ranking-empty-text">{text}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="ranking-loading">
      <span className="ranking-spinner" />
      <div className="ranking-empty-title">Loading ranking...</div>
      <div className="ranking-empty-text">Please wait while ranking data loads.</div>
    </div>
  )
}


function RankingVisibilityModal({ action, story, loading, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  if (!action || !story) return null

  const isHide = action === 'hide'

  return (
    <div className="ranking-modal-layer" onMouseDown={onClose}>
      <div className="ranking-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="ranking-modal-top">
          <div>
            <div className="ranking-kicker">Ranking Visibility</div>
            <h3>{isHide ? 'Hide Story from Ranking' : 'Unhide Story from Ranking'}</h3>
          </div>
          <button type="button" className="ranking-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ranking-modal-story">
          <div className="ranking-cover">
            {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
          </div>
          <div>
            <div className="ranking-title">{story.title || 'Untitled Story'}</div>
            <div className="ranking-muted">ID: {story.id}</div>
          </div>
        </div>

        {isHide ? (
          <label className="ranking-modal-field">
            <span>Hidden Reason</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Write why this story should be hidden from ranking..." />
          </label>
        ) : null}

        <label className="ranking-modal-field">
          <span>Admin Note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note..." />
        </label>

        <div className="ranking-modal-actions">
          <button type="button" className="ranking-btn light" onClick={onClose}>Cancel</button>
          <button type="button" className={isHide ? 'ranking-danger-btn' : 'ranking-success-btn'} disabled={loading || (isHide && reason.trim().length < 5)} onClick={() => onSubmit({ action, reason, note })}>
            {loading ? 'Saving...' : isHide ? 'Hide from Ranking' : 'Unhide'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminRankingPage() {
  const [activeTab, setActiveTab] = useState('stories')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [period, setPeriod] = useState('weekly')
  const [metric, setMetric] = useState('score')
  const [status, setStatus] = useState('published')
  const [page, setPage] = useState(1)
  const [stories, setStories] = useState([])
  const [hiddenItems, setHiddenItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [modalAction, setModalAction] = useState('')
  const [modalStory, setModalStory] = useState(null)
  const [saving, setSaving] = useState(false)

  const activeConfig = useMemo(() => tabs.find((tab) => tab.key === activeTab) || tabs[0], [activeTab])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [activeTab, period, metric, status])

  useEffect(() => {
    if (activeTab !== 'stories') return

    let alive = true

    async function loadStoryRanking() {
      try {
        setLoading(true)
        setError('')

        const token = getAdminToken()
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          period,
          metric,
          status,
          ranking_visibility: 'visible',
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/stories?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load story ranking')
        }

        if (!alive) return

        setStories(data.stories || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load story ranking')
        setStories([])
        setPagination({ page: 1, total: 0, total_pages: 1, has_next: false, has_prev: false })
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadStoryRanking()

    return () => {
      alive = false
    }
  }, [activeTab, page, period, metric, status, debouncedSearch, refreshKey])

  useEffect(() => {
    if (activeTab !== 'hidden') return

    let alive = true

    async function loadHiddenRanking() {
      try {
        setLoading(true)
        setError('')

        const token = getAdminToken()
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/hidden?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load hidden ranking')
        }

        if (!alive) return

        setHiddenItems(data.items || data.stories || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load hidden ranking')
        setHiddenItems([])
        setPagination({ page: 1, total: 0, total_pages: 1, has_next: false, has_prev: false })
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadHiddenRanking()

    return () => {
      alive = false
    }
  }, [activeTab, page, debouncedSearch, refreshKey])

  function openVisibilityModal(action, story) {
    setModalAction(action)
    setModalStory(story)
  }

  function closeVisibilityModal() {
    setModalAction('')
    setModalStory(null)
  }

  async function submitVisibility({ action, reason, note }) {
    if (!modalStory?.id) return

    try {
      setSaving(true)
      setError('')
      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/ranking/stories/${modalStory.id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ranking_visibility_status: action === 'hide' ? 'hidden' : 'visible',
          reason,
          note,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update ranking visibility')
      }

      closeVisibilityModal()
      setRefreshKey((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Failed to update ranking visibility')
    } finally {
      setSaving(false)
    }
  }

  const hasLiveData = activeTab === 'stories' || activeTab === 'hidden'
  const isGenreData = activeTab === 'genres'
  const isAuthorData = activeTab === 'authors'
  const showToolbar = !['settings', 'genres', 'authors'].includes(activeTab)

  return (
    <AdminLayout title="Ranking" subtitle="Ranking Control Center for public ranking, private income ranking, and ranking safety.">
      <style>{styles}</style>
      <div className="ranking-page">
        <section className="ranking-hero">
          <div>
            <div className="ranking-kicker">Admin Control Center</div>
            <h2>Ranking Management</h2>
            <p>Control story, genre, author, episode, income, hidden, and settings sections from one professional admin page. Public ranking does not show author income.</p>
          </div>
          <div className="ranking-hero-badge">
            {activeTab === 'stories'
  ? 'Story Rank · Live Data'
  : activeTab === 'genres'
    ? 'Genre Rank · Real Data'
    : activeTab === 'authors'
  ? 'Author Rank · Real Data'
  : activeTab === 'hidden'
    ? 'Hidden Rank · Live Data'
      : 'Prepared Section'}
          </div>
        </section>

        {error ? <div className="ranking-alert">{error}</div> : null}

        <div className="ranking-tabs">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" className={`ranking-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <span className="ranking-dot" />
              {tab.label}
            </button>
          ))}
        </div>

        {showToolbar ? (
          <div className="ranking-toolbar">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, genre, language, or story ID..." />
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="all_time">All Time</option>
            </select>
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              <option value="score">Score</option>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="income" disabled={activeTab !== 'income'}>Income</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="scheduled">Scheduled</option>
              <option value="restricted">Restricted</option>
              <option value="disabled">Disabled</option>
            </select>
            <button type="button" className="ranking-btn" onClick={() => setRefreshKey((value) => value + 1)}>Refresh</button>
          </div>
        ) : null}

        <section className="ranking-panel">
          <div className="ranking-panel-top">
            <div>
              <div className="ranking-panel-title">{activeConfig.label}</div>
              <div className="ranking-panel-subtitle">{activeConfig.subtitle}</div>
            </div>
            <div className={`ranking-pill ${hasLiveData || isGenreData || isAuthorData ? 'live' : activeTab === 'income' ? 'private' : ''}`}>
              {isGenreData || isAuthorData ? 'Real data · 15 min cache' : hasLiveData ? `${formatNumber(pagination.total)} records` : activeTab === 'income' ? 'Admin only' : 'Prepared'}
            </div>
          </div>

          {activeTab === 'settings' ? (
            <div className="ranking-settings-grid">
              {settingItems.map(([title, text]) => (
                <div key={title} className="ranking-setting-card">
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          ) : activeTab === 'genres' ? (
            <AdminGenreRankPanel />
      ) : activeTab === 'authors' ? (
  <AdminAuthorRankPanel />
          ) : activeTab === 'stories' ? (
            <>
              <div className="ranking-table-wrap">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      {activeConfig.columns.map((column) => <th key={column}>{column}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && stories.map((story, index) => (
                      <tr key={story.id}>
                        <td><span className="ranking-rank">#{story.rank || (pagination.page - 1) * PAGE_SIZE + index + 1}</span></td>
                        <td>
                          <div className="ranking-cover">
                            {story.cover_url ? <img src={story.cover_url} alt={story.title} /> : '📖'}
                          </div>
                        </td>
                        <td>
                          <div className="ranking-story-cell">
                            <div>
                              <div className="ranking-title">{story.title || 'Untitled Story'}</div>
                              <div className="ranking-muted">{story.story_language || '-'} · {story.total_episodes || 0} episodes</div>
                            </div>
                          </div>
                        </td>
                        <td><button type="button" className="ranking-id-btn" onClick={() => copyText(story.id)}>{shortId(story.id)}</button></td>
                        <td>
                          <div className="ranking-title">{story.author_page?.page_name || 'Unknown Author'}</div>
                          <div className="ranking-muted">@{story.author_page?.page_username || 'no_username'}</div>
                        </td>
                        <td>{story.main_genre || '-'}</td>
                        <td>{formatNumber(story.total_views)}</td>
                        <td>{formatNumber(story.total_likes)}</td>
                        <td>{formatNumber(story.total_comments)}</td>
                        <td><span className="ranking-score">{formatNumber(story.rank_score)}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <StatusBadge status={story.status} />
                            {story.admin_visibility_status && story.admin_visibility_status !== 'active' ? <StatusBadge status={story.admin_visibility_status} /> : null}
                          </div>
                        </td>
                        <td>
                          <div className="ranking-actions">
                            <button type="button" onClick={() => copyText(story.id)}>Copy ID</button>
                            <button type="button" onClick={() => copyText(story.author_id)}>Author ID</button>
                            {story.ranking_visibility_status === 'hidden' ? (
                              <button type="button" className="ranking-success-btn" onClick={() => openVisibilityModal('unhide', story)}>Unhide</button>
                            ) : (
                              <button type="button" className="ranking-danger-btn" onClick={() => openVisibilityModal('hide', story)}>Hide</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {loading ? <LoadingState /> : stories.length ? null : <EmptyState title="Story Rank is ready" text={activeConfig.empty} />}
              </div>

              <div className="ranking-pagination">
                <span>Page {pagination.page} of {pagination.total_pages}</span>
                <button type="button" disabled={!pagination.has_prev || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                <button type="button" disabled={!pagination.has_next || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
              </div>
            </>
          ) : activeTab === 'hidden' ? (
            <>
              <div className="ranking-table-wrap">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      {activeConfig.columns.map((column) => <th key={column}>{column}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && hiddenItems.map((item) => (
                      <tr key={item.id}>
                        <td>Story</td>
                        <td>
                          <div className="ranking-story-cell">
                            <div className="ranking-cover">
                              {item.cover_url ? <img src={item.cover_url} alt={item.title} /> : '📖'}
                            </div>
                            <div>
                              <div className="ranking-title">{item.title || 'Untitled Story'}</div>
                              <div className="ranking-muted">{item.author_page?.page_name || 'Unknown Author'} · @{item.author_page?.page_username || 'no_username'}</div>
                            </div>
                          </div>
                        </td>
                        <td><button type="button" className="ranking-id-btn" onClick={() => copyText(item.id)}>{shortId(item.id)}</button></td>
                        <td>{item.ranking_hidden_reason || '-'}</td>
                        <td>{item.ranking_hidden_by || '-'}</td>
                        <td>{formatDate(item.ranking_hidden_at)}</td>
                        <td><StatusBadge status="hidden" /></td>
                        <td>
                          <div className="ranking-actions">
                            <button type="button" className="ranking-success-btn" onClick={() => openVisibilityModal('unhide', item)}>Unhide</button>
                            <button type="button" onClick={() => copyText(item.id)}>Copy ID</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {loading ? <LoadingState /> : hiddenItems.length ? null : <EmptyState title="Hidden Rank is ready" text={activeConfig.empty} />}
              </div>

              <div className="ranking-pagination">
                <span>Page {pagination.page} of {pagination.total_pages}</span>
                <button type="button" disabled={!pagination.has_prev || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                <button type="button" disabled={!pagination.has_next || loading} onClick={() => setPage((value) => value + 1)}>Next</button>
              </div>
            </>
          ) : (
            <div className="ranking-table-wrap">
              <table className="ranking-table">
                <thead>
                  <tr>
                    {activeConfig.columns.map((column) => <th key={column}>{column}</th>)}
                  </tr>
                </thead>
              </table>
              <EmptyState title={`${activeConfig.label} is ready`} text={activeConfig.empty} />
            </div>
          )}
        </section>

        <RankingVisibilityModal action={modalAction} story={modalStory} loading={saving} onClose={closeVisibilityModal} onSubmit={submitVisibility} />
      </div>
    </AdminLayout>
  )
}
