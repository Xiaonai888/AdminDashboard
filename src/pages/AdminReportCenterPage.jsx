import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://shadow-backend-kucw.onrender.com')
const USE_LEGACY_SIDEBAR = false

const TYPE_FILTERS = [
  { value: 'all', label: 'All Reports' },
  { value: 'story', label: 'Stories' },
  { value: 'comment', label: 'Comments' },
  { value: 'author_page', label: 'Author Pages' },
  { value: 'author_post', label: 'Author Posts' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const TYPE_ICONS = {
  story: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z',
  comment: 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z',
  author_page: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  author_post: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h6',
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function Icon({ d, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ minWidth: size, flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  )
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString()
}

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || status || 'Pending'
}

function getReporterInitial(report) {
  return String(report?.reporter?.name || report?.reporter?.username || 'R')
    .charAt(0)
    .toUpperCase()
}

function isErrorMessage(value) {
  const text = String(value || '').toLowerCase()

  return (
    text.includes('failed') ||
    text.includes('error') ||
    text.includes('invalid') ||
    text.includes('required') ||
    text.includes('not found') ||
    text.includes('save or cancel') ||
    text.includes('unsaved')
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --report-bg: #F8FAFC;
    --report-card: #FFFFFF;
    --report-text: #0F172A;
    --report-muted: #64748B;
    --report-soft: #94A3B8;
    --report-border: #E2E8F0;
    --report-primary: #4F46E5;
    --report-primary-light: #EEF2FF;
    --report-danger: #DC2626;
    --report-success: #16A34A;
    --report-warning: #D97706;
    --report-side: 80px;
    --report-side-open: 260px;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--report-bg);
    font-family: Inter, sans-serif;
    color: var(--report-text);
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  .report-shell {
    display: flex;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    background: var(--report-bg);
  }

  .report-sidebar {
    width: var(--report-side);
    flex-shrink: 0;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid var(--report-border);
    background: #FFFFFF;
    padding: 20px 14px;
    transition: width .25s ease;
    z-index: 80;
  }

  .report-sidebar:hover {
    width: var(--report-side-open);
    box-shadow: 10px 0 30px rgba(15, 23, 42, .06);
  }

  .report-sidebar::-webkit-scrollbar {
    width: 0;
  }

  .report-logo {
    display: flex;
    height: 40px;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    padding-left: 10px;
    color: var(--report-primary);
  }

  .report-logo-text,
  .report-nav-text,
  .report-nav-label {
    opacity: 0;
    white-space: nowrap;
    transition: opacity .2s ease;
  }

  .report-logo-text {
    color: var(--report-primary);
    font-size: 18px;
    font-weight: 900;
  }

  .report-sidebar:hover .report-logo-text,
  .report-sidebar:hover .report-nav-text,
  .report-sidebar:hover .report-nav-label {
    opacity: 1;
  }

  .report-nav-label {
    display: block;
    margin: 18px 0 8px 12px;
    color: var(--report-soft);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .report-nav-item {
    display: flex;
    height: 44px;
    align-items: center;
    margin-bottom: 2px;
    border-radius: 12px;
    padding: 0 12px;
    color: var(--report-muted);
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    transition: .18s ease;
  }

  .report-nav-item:hover,
  .report-nav-item.active {
    background: var(--report-primary-light);
    color: var(--report-primary);
  }

  .report-nav-text {
    margin-left: 14px;
  }

  .report-main {
    min-width: 0;
    flex: 1;
    overflow-y: auto;
  }

  .report-header {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    height: 70px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--report-border);
    background: #FFFFFF;
    padding: 0 36px;
  }

  .report-header h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 900;
  }

  .report-refresh {
    display: inline-flex;
    height: 40px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--report-border);
    border-radius: 12px;
    background: #FFFFFF;
    padding: 0 14px;
    color: var(--report-text);
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 850;
  }

  .report-refresh:hover {
    border-color: #C7D2FE;
    color: var(--report-primary);
  }

  .report-content {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 28px 36px 50px;
  }

  .report-page-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .report-page-top h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -.04em;
  }

  .report-page-top p {
    max-width: 700px;
    margin: 7px 0 0;
    color: var(--report-muted);
    font-size: 13.5px;
    font-weight: 650;
    line-height: 1.6;
  }

  .report-message {
    margin-bottom: 16px;
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 850;
  }

  .report-message.success {
    background: #DCFCE7;
    color: var(--report-success);
  }

  .report-message.error {
    background: #FEE2E2;
    color: var(--report-danger);
  }

  .report-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .report-stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 112px;
    border: 1px solid var(--report-border);
    border-radius: 20px;
    background: #FFFFFF;
    padding: 18px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, .04);
  }

  .report-stat-icon {
    display: flex;
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
  }

  .report-stat-label {
    color: var(--report-muted);
    font-size: 11.5px;
    font-weight: 850;
    letter-spacing: .25px;
    text-transform: uppercase;
  }

  .report-stat-value {
    margin-top: 5px;
    color: var(--report-text);
    font-size: 26px;
    font-weight: 950;
  }

  .report-panel {
    overflow: hidden;
    border: 1px solid var(--report-border);
    border-radius: 24px;
    background: #FFFFFF;
    box-shadow: 0 8px 28px rgba(15, 23, 42, .05);
  }

  .report-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid var(--report-border);
    padding: 18px 20px;
  }

  .report-search {
    position: relative;
    width: min(460px, 100%);
  }

  .report-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    color: var(--report-soft);
    transform: translateY(-50%);
    pointer-events: none;
  }

  .report-search input {
    width: 100%;
    height: 44px;
    border: 1px solid var(--report-border);
    border-radius: 13px;
    outline: none;
    padding: 0 14px 0 40px;
    color: var(--report-text);
    font-size: 13px;
    font-weight: 700;
  }

  .report-search input:focus {
    border-color: var(--report-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .report-status-select {
    height: 44px;
    min-width: 170px;
    border: 1px solid var(--report-border);
    border-radius: 13px;
    outline: none;
    background: #FFFFFF;
    padding: 0 12px;
    color: var(--report-text);
    font-size: 12.5px;
    font-weight: 800;
  }

  .report-type-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    border-bottom: 1px solid var(--report-border);
    padding: 13px 20px;
  }

  .report-type-tabs::-webkit-scrollbar {
    height: 0;
  }

  .report-type-tab {
    height: 36px;
    flex-shrink: 0;
    border: 1px solid var(--report-border);
    border-radius: 999px;
    background: #FFFFFF;
    padding: 0 14px;
    color: var(--report-muted);
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }

  .report-type-tab:hover,
  .report-type-tab.active {
    border-color: var(--report-primary);
    background: var(--report-primary);
    color: #FFFFFF;
  }

  .report-list {
    display: grid;
    gap: 10px;
    padding: 16px;
  }

  .report-card {
    display: grid;
    grid-template-columns: 44px minmax(0, 1.5fr) minmax(180px, .8fr) 140px 42px;
    align-items: center;
    gap: 14px;
    border: 1px solid #EDF1F5;
    border-radius: 18px;
    background: #FFFFFF;
    padding: 14px;
    cursor: pointer;
    text-align: left;
    transition: .16s ease;
  }

  .report-card:hover {
    transform: translateY(-1px);
    border-color: #C7D2FE;
    box-shadow: 0 10px 24px rgba(79, 70, 229, .07);
  }

  .report-type-icon {
    display: flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: var(--report-primary-light);
    color: var(--report-primary);
  }

  .report-card-main {
    min-width: 0;
  }

  .report-card-title {
    overflow: hidden;
    color: var(--report-text);
    font-size: 14px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .report-card-excerpt {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 4px;
    color: var(--report-muted);
    font-size: 12px;
    font-weight: 650;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .report-card-type {
    margin-top: 6px;
    color: var(--report-soft);
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: .35px;
    text-transform: uppercase;
  }

  .report-reporter {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
  }

  .report-avatar {
    display: flex;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    background: #111827;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 950;
  }

  .report-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .report-reporter-name {
    overflow: hidden;
    color: var(--report-text);
    font-size: 12px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .report-reporter-date {
    margin-top: 2px;
    color: var(--report-soft);
    font-size: 10.5px;
    font-weight: 700;
  }

  .report-status {
    display: inline-flex;
    min-height: 28px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 0 10px;
    font-size: 10.5px;
    font-weight: 950;
    white-space: nowrap;
  }

  .report-status.pending {
    background: #FEF3C7;
    color: #B45309;
  }

  .report-status.under_review {
    background: #DBEAFE;
    color: #1D4ED8;
  }

  .report-status.resolved {
    background: #DCFCE7;
    color: #15803D;
  }

  .report-status.dismissed {
    background: #F1F5F9;
    color: #475569;
  }

  .report-open-arrow {
    display: flex;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: var(--report-muted);
  }

  .report-card:hover .report-open-arrow {
    background: var(--report-primary-light);
    color: var(--report-primary);
  }

  .report-empty {
    padding: 54px 20px;
    color: var(--report-muted);
    text-align: center;
  }

  .report-empty-icon {
    display: flex;
    width: 58px;
    height: 58px;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    border-radius: 18px;
    background: var(--report-primary-light);
    color: var(--report-primary);
  }

  .report-empty h3 {
    margin: 0;
    color: var(--report-text);
    font-size: 16px;
    font-weight: 950;
  }

  .report-empty p {
    margin: 7px 0 0;
    font-size: 12.5px;
    font-weight: 650;
  }

  .report-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid var(--report-border);
    padding: 14px 20px;
  }

  .report-page-text {
    color: var(--report-muted);
    font-size: 12px;
    font-weight: 750;
  }

  .report-page-actions {
    display: flex;
    gap: 8px;
  }

  .report-page-btn {
    height: 36px;
    border: 1px solid var(--report-border);
    border-radius: 11px;
    background: #FFFFFF;
    padding: 0 13px;
    color: var(--report-text);
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }

  .report-page-btn:disabled {
    cursor: not-allowed;
    opacity: .45;
  }

  .report-detail-backdrop {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    background: rgba(15, 23, 42, .46);
  }

  .report-detail-close-layer {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    cursor: default;
  }

  .report-detail {
    position: relative;
    display: flex;
    width: min(560px, 100%);
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    background: #FFFFFF;
    box-shadow: -24px 0 60px rgba(15, 23, 42, .18);
  }

  .report-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid var(--report-border);
    padding: 20px;
  }

  .report-detail-kicker {
    color: var(--report-primary);
    font-size: 10.5px;
    font-weight: 950;
    letter-spacing: .55px;
    text-transform: uppercase;
  }

  .report-detail-title {
    margin: 6px 0 0;
    color: var(--report-text);
    font-size: 20px;
    font-weight: 950;
    line-height: 1.35;
  }

  .report-detail-close {
    display: flex;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 12px;
    background: #F1F5F9;
    color: var(--report-text);
    cursor: pointer;
  }

  .report-detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .report-detail-section {
    margin-bottom: 16px;
    border: 1px solid var(--report-border);
    border-radius: 18px;
    background: #FFFFFF;
    padding: 16px;
  }

  .report-detail-label {
    color: var(--report-soft);
    font-size: 10.5px;
    font-weight: 950;
    letter-spacing: .4px;
    text-transform: uppercase;
  }

  .report-detail-value {
    margin-top: 7px;
    color: var(--report-text);
    font-size: 13px;
    font-weight: 750;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .report-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .report-detail-mini {
    border-radius: 14px;
    background: #F8FAFC;
    padding: 12px;
  }

  .report-target-link {
    display: inline-flex;
    height: 38px;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    border: 1px solid #C7D2FE;
    border-radius: 11px;
    background: var(--report-primary-light);
    padding: 0 13px;
    color: var(--report-primary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }

  .report-note {
    width: 100%;
    min-height: 110px;
    resize: vertical;
    border: 1px solid var(--report-border);
    border-radius: 14px;
    outline: none;
    margin-top: 8px;
    padding: 12px;
    color: var(--report-text);
    font-size: 13px;
    font-weight: 650;
    line-height: 1.6;
  }

  .report-note:focus {
    border-color: var(--report-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .report-note-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .report-note-state {
    border-radius: 999px;
    background: #F1F5F9;
    padding: 5px 9px;
    color: #64748B;
    font-size: 10px;
    font-weight: 900;
  }

  .report-note-state.dirty {
    background: #FEF3C7;
    color: #B45309;
  }

  .report-note-state.saved {
    background: #DCFCE7;
    color: #15803D;
  }

  .report-note-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }

  .report-note-btn {
    min-height: 38px;
    border: 1px solid var(--report-border);
    border-radius: 11px;
    padding: 0 14px;
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 900;
  }

  .report-note-btn.cancel {
    background: #FFFFFF;
    color: #475569;
  }

  .report-note-btn.save {
    border-color: var(--report-primary);
    background: var(--report-primary);
    color: #FFFFFF;
  }

  .report-note-btn:disabled {
    cursor: not-allowed;
    opacity: .45;
  }

  .report-status-help {
    margin: 6px 0 12px;
    color: var(--report-muted);
    font-size: 11.5px;
    font-weight: 650;
    line-height: 1.5;
  }

  .report-confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 380;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, .58);
    padding: 20px;
  }

  .report-confirm-card {
    width: min(420px, 100%);
    border-radius: 22px;
    background: #FFFFFF;
    padding: 22px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, .25);
  }

  .report-confirm-icon {
    display: flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
  }

  .report-confirm-icon.resolve {
    background: #DCFCE7;
    color: #15803D;
  }

  .report-confirm-icon.dismiss {
    background: #F1F5F9;
    color: #475569;
  }

  .report-confirm-title {
    margin: 16px 0 0;
    color: var(--report-text);
    font-size: 18px;
    font-weight: 950;
  }

  .report-confirm-text {
    margin: 8px 0 0;
    color: var(--report-muted);
    font-size: 12.5px;
    font-weight: 650;
    line-height: 1.65;
  }

  .report-confirm-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 20px;
  }

  .report-confirm-btn {
    min-height: 42px;
    border: 1px solid var(--report-border);
    border-radius: 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }

  .report-confirm-btn.cancel {
    background: #FFFFFF;
    color: #475569;
  }

  .report-confirm-btn.resolve {
    border-color: #16A34A;
    background: #16A34A;
    color: #FFFFFF;
  }

  .report-confirm-btn.dismiss {
    border-color: #475569;
    background: #475569;
    color: #FFFFFF;
  }

  .report-confirm-btn:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  .report-detail-footer {
    border-top: 1px solid var(--report-border);
    background: #FFFFFF;
    padding: 16px 20px 20px;
  }

  .report-action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .report-action-btn {
    min-height: 42px;
    border: 1px solid var(--report-border);
    border-radius: 12px;
    background: #FFFFFF;
    color: var(--report-text);
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }

  .report-action-btn:hover,
  .report-action-btn.active {
    border-color: var(--report-primary);
    background: var(--report-primary-light);
    color: var(--report-primary);
  }

  .report-action-btn.resolve {
    border-color: #BBF7D0;
    background: #F0FDF4;
    color: #15803D;
  }

  .report-action-btn.dismiss {
    border-color: #E2E8F0;
    background: #F8FAFC;
    color: #475569;
  }

  .report-action-btn:disabled {
    cursor: not-allowed;
    opacity: .55;
  }

  @media (max-width: 1050px) {
    .report-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .report-card {
      grid-template-columns: 44px minmax(0, 1fr) 125px 38px;
    }

    .report-reporter {
      display: none;
    }
  }

  @media (max-width: 760px) {
    .report-header {
      padding: 0 16px;
    }

    .report-content {
      padding: 22px 16px 40px;
    }

    .report-page-top {
      flex-direction: column;
    }

    .report-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .report-search {
      width: 100%;
    }

    .report-status-select {
      width: 100%;
    }

    .report-card {
      grid-template-columns: 40px minmax(0, 1fr) 34px;
      gap: 10px;
    }

    .report-card .report-status {
      grid-column: 2;
      width: max-content;
      margin-top: 4px;
    }

    .report-open-arrow {
      grid-column: 3;
      grid-row: 1 / span 2;
    }

    .report-detail-grid {
      grid-template-columns: 1fr;
    }
  }
`

export default function AdminReportCenterPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    statuses: {
      pending: 0,
      under_review: 0,
      resolved: 0,
      dismissed: 0,
    },
    types: {
      story: 0,
      comment: 0,
      author_page: 0,
      author_post: 0,
    },
  })
  const [reports, setReports] = useState([])
  const [reportType, setReportType] = useState('all')
  const [status, setStatus] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [noteSaving, setNoteSaving] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState('')
  const [message, setMessage] = useState('')

  const noteDirty =
    Boolean(selectedReport) &&
    adminNote !== String(selectedReport?.admin_note || '')

  const navItems = {
    overview: [
      {
        path: '/admin',
        label: 'Dashboard',
        icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      },
      {
        path: '/task-center',
        label: 'Task Center',
        icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
      },
      {
        path: '/shadow-mall',
        label: 'Shadow Mall',
        icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6',
      },
      {
        path: '/shadow-exclusive',
        label: 'Shadow Exclusive',
        icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5',
      },
      {
        path: '/authors',
        label: 'Community',
        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      },
      {
        path: '/stories',
        label: 'Stories',
        icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z',
      },
    ],
    visualMedia: [
      {
        path: '/slides',
        label: 'Slide Section',
        icon: 'M2 3h20v14H2z M8 21h8 M12 17v4',
      },
      {
        path: '/banners',
        label: 'Banner System',
        icon: 'M3 3h18v18H3z M3 9h18 M9 3v18',
      },
      {
        path: '/genres',
        label: 'Genre',
        icon: 'M4 6h16M4 12h16M4 18h16',
      },
      {
        path: '/advertisement',
        label: 'Advertisement',
        icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
      },
      {
        path: '/reader-mails',
        label: 'Reader Mail',
        icon: 'M4 4h16v16H4z M4 7l8 6 8-6',
      },
      {
        path: '/notifications',
        label: 'Notifications',
        icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
      },
    ],
    systemAdmin: [
      {
        path: '/block-list',
        label: 'Block List',
        icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
      },
      {
        path: '/admin-login-guard',
        label: 'Admin Guard',
        icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5',
      },
      {
        path: '/spam-guard',
        label: 'Spam Guard',
        icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5',
      },
      {
        path: '/comments',
        label: 'Comments',
        icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      },
      {
        path: '/reports',
        label: 'Report Center',
        icon: 'M4 21V5m0 0h11l-1 4 1 4H4 M4 5V3',
      },
    ],
    finance: [
      {
        path: '/payment',
        label: 'Payment',
        icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10',
      },
      {
        path: '/income',
        label: 'Income',
        icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      },
      {
        path: '/withdraw',
        label: 'Withdraw',
        icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-10l5-5 5 5m-5-5v12',
      },
      {
        path: '/ranking',
        label: 'Ranking',
        icon: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2z',
      },
    ],
  }

  const requestHeaders = useMemo(() => {
    const token = getAdminToken()

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Admin-Name': 'Admin',
    }
  }, [])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/reports/stats`, {
        headers: requestHeaders,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load report statistics')
      }

      setStats(data.stats || {})
    } catch (error) {
      setMessage(error.message || 'Failed to load report statistics')
    } finally {
      setStatsLoading(false)
    }
  }, [requestHeaders])

  const loadReports = useCallback(async () => {
    setLoading(true)
    setMessage('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        status,
        report_type: reportType,
        sort: 'newest',
      })

      if (search) {
        params.set('search', search)
      }

      const response = await fetch(`${API_URL}/api/admin/reports?${params.toString()}`, {
        headers: requestHeaders,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load reports')
      }

      setReports(Array.isArray(data.reports) ? data.reports : [])
      setPagination({
        total: Number(data.total || 0),
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (error) {
      setReports([])
      setPagination({
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
      setMessage(error.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, reportType, requestHeaders, search, status])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput])

   useEffect(() => {
    if (!selectedReport) {
      document.body.style.overflow = ''
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return

      if (confirmStatus) {
        setConfirmStatus('')
        return
      }

      if (noteDirty) {
        setMessage('Save or cancel Admin Note changes before closing.')
        return
      }

      setSelectedReport(null)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [confirmStatus, noteDirty, selectedReport])

  const openReport = (report) => {
    setSelectedReport(report)
    setAdminNote(report?.admin_note || '')
    setConfirmStatus('')
    setMessage('')
  }

  const syncUpdatedReport = (nextReport) => {
    if (!nextReport?.id) return

    setSelectedReport(nextReport)
    setAdminNote(nextReport.admin_note || '')

    setReports((current) =>
      current.map((report) =>
        report.id === nextReport.id ? nextReport : report
      )
    )
  }

  const patchReport = async (payload) => {
    const response = await fetch(
      `${API_URL}/api/admin/reports/${selectedReport.id}`,
      {
        method: 'PATCH',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Failed to update report')
    }

    return data
  }

  const saveAdminNote = async () => {
    if (!selectedReport?.id || !noteDirty || noteSaving || updating) return

    setNoteSaving(true)
    setMessage('')

    try {
      const data = await patchReport({
        admin_note: adminNote.trim(),
      })

      syncUpdatedReport(
        data.report || {
          ...selectedReport,
          admin_note: adminNote.trim(),
        }
      )

      setMessage(data.message || 'Admin note saved successfully')
    } catch (error) {
      setMessage(error.message || 'Failed to save admin note')
    } finally {
      setNoteSaving(false)
    }
  }

  const cancelAdminNoteChanges = () => {
    setAdminNote(selectedReport?.admin_note || '')
    setMessage('')
  }

  const applyStatus = async (nextStatus) => {
    if (!selectedReport?.id || updating || noteSaving) return

    if (noteDirty) {
      setMessage('Save or cancel Admin Note changes before changing status.')
      return
    }

    if (selectedReport.status === nextStatus) {
      setConfirmStatus('')
      setMessage(`Report is already ${getStatusLabel(nextStatus)}.`)
      return
    }

    setUpdating(true)
    setMessage('')

    try {
      const data = await patchReport({
        status: nextStatus,
      })

      syncUpdatedReport(
        data.report || {
          ...selectedReport,
          status: nextStatus,
        }
      )

      setConfirmStatus('')

      await Promise.all([loadStats(), loadReports()])

      setMessage(data.message || 'Report status updated successfully')
    } catch (error) {
      setMessage(error.message || 'Failed to update report status')
    } finally {
      setUpdating(false)
    }
  }

  const requestStatusChange = (nextStatus) => {
    if (noteDirty) {
      setMessage('Save or cancel Admin Note changes before changing status.')
      return
    }

    if (nextStatus === 'resolved' || nextStatus === 'dismissed') {
      setConfirmStatus(nextStatus)
      return
    }

    applyStatus(nextStatus)
  }

  const closeReportDetails = () => {
    if (
      noteDirty &&
      !window.confirm('Discard unsaved Admin Note changes?')
    ) {
      return
    }

    setConfirmStatus('')
    setSelectedReport(null)
    setAdminNote('')
    setMessage('')
  }

  const refreshAll = async () => {
    await Promise.all([loadStats(), loadReports()])
  }

  const renderNavGroup = (items) =>
    items.map((item) => (
      <div
        key={item.path}
        className={`report-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        onClick={() => navigate(item.path)}
      >
        <Icon d={item.icon} size={20} />
        <span className="report-nav-text">{item.label}</span>
      </div>
    ))

  const statCards = [
    {
      label: 'All Reports',
      value: stats?.total || 0,
      icon: 'M4 21V5m0 0h11l-1 4 1 4H4 M4 5V3',
      background: '#EEF2FF',
      color: '#4F46E5',
    },
    {
      label: 'Pending',
      value: stats?.statuses?.pending || 0,
      icon: 'M12 8v4l3 3 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
      background: '#FEF3C7',
      color: '#B45309',
    },
    {
      label: 'Under Review',
      value: stats?.statuses?.under_review || 0,
      icon: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
      background: '#DBEAFE',
      color: '#1D4ED8',
    },
    {
      label: 'Today',
      value: stats?.today || 0,
      icon: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
      background: '#DCFCE7',
      color: '#15803D',
    },
  ]

  return (
    <div className="report-shell">
      <style>{styles}</style>

      {USE_LEGACY_SIDEBAR ? (
        <aside className="report-sidebar">
          <div className="report-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            <span className="report-logo-text">Shadow Exclusive</span>
          </div>

          <span className="report-nav-label">Overview</span>
          {renderNavGroup(navItems.overview)}

          <span className="report-nav-label">Visual Media</span>
          {renderNavGroup(navItems.visualMedia)}

          <span className="report-nav-label">System Admin</span>
          {renderNavGroup(navItems.systemAdmin)}

          <span className="report-nav-label">Finance & Growth</span>
          {renderNavGroup(navItems.finance)}
        </aside>
      ) : (
        <AdminSidebar />
      )}

      <main className="report-main">
        <header className="report-header">
          <h2>Report Center</h2>

          <button type="button" className="report-refresh" onClick={refreshAll}>
            <Icon d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5 M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" size={15} />
            Refresh
          </button>
        </header>

        <section className="report-content">
          <div className="report-page-top">
            <div>
              <h1>Report Center</h1>
              <p>
                Review reports for stories, comments, author pages, and author posts.
                Open a report to add an admin note and update its review status.
              </p>
            </div>
          </div>

          {message ? (
            <div className={`report-message ${isErrorMessage(message) ? 'error' : 'success'}`}>
              {message}
            </div>
          ) : null}

          <div className="report-stats">
            {statCards.map((card) => (
              <div className="report-stat-card" key={card.label}>
                <div
                  className="report-stat-icon"
                  style={{ background: card.background, color: card.color }}
                >
                  <Icon d={card.icon} size={20} />
                </div>

                <div>
                  <div className="report-stat-label">{card.label}</div>
                  <div className="report-stat-value">
                    {statsLoading ? '...' : Number(card.value || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="report-panel">
            <div className="report-toolbar">
              <div className="report-search">
                <span className="report-search-icon">
                  <Icon d="M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0" size={16} />
                </span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search title, content, or report reason..."
                />
              </div>

              <select
                className="report-status-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
              >
                {STATUS_FILTERS.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-type-tabs">
              {TYPE_FILTERS.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`report-type-tab ${reportType === item.value ? 'active' : ''}`}
                  onClick={() => {
                    setReportType(item.value)
                    setPage(1)
                  }}
                >
                  {item.label}
                  {item.value !== 'all' && stats?.types?.[item.value] !== undefined
                    ? ` · ${Number(stats.types[item.value] || 0).toLocaleString()}`
                    : ''}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="report-empty">
                <div className="report-empty-icon">
                  <Icon d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" size={22} />
                </div>
                <h3>Loading reports...</h3>
                <p>Please wait while the report queue loads.</p>
              </div>
            ) : reports.length ? (
              <div className="report-list">
                {reports.map((report) => (
                  <button
                    type="button"
                    className="report-card"
                    key={report.id}
                    onClick={() => openReport(report)}
                  >
                    <span className="report-type-icon">
                      <Icon d={TYPE_ICONS[report.report_type] || TYPE_ICONS.author_post} size={19} />
                    </span>

                    <span className="report-card-main">
                      <span className="report-card-title">
                        {report.target_title || report.report_type_label || 'Reported Content'}
                      </span>
                      <span className="report-card-excerpt">
                        {report.reason_label || report.reason_code || 'Report'}
                        {report.reason_text ? ` — ${report.reason_text}` : ''}
                      </span>
                      <span className="report-card-type">
                        {report.report_type_label || report.report_type}
                      </span>
                    </span>

                    <span className="report-reporter">
                      <span className="report-avatar">
                        {report.reporter?.avatar_url ? (
                          <img
                            src={report.reporter.avatar_url}
                            alt={report.reporter?.name || 'Reader'}
                          />
                        ) : (
                          getReporterInitial(report)
                        )}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span className="report-reporter-name">
                          {report.reporter?.name || report.reporter?.username || 'Unknown Reader'}
                        </span>
                        <span className="report-reporter-date">
                          {formatDate(report.created_at)}
                        </span>
                      </span>
                    </span>

                    <span className={`report-status ${report.status || 'pending'}`}>
                      {getStatusLabel(report.status)}
                    </span>

                    <span className="report-open-arrow">
                      <Icon d="M9 18l6-6-6-6" size={16} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="report-empty">
                <div className="report-empty-icon">
                  <Icon d="M4 21V5m0 0h11l-1 4 1 4H4 M4 5V3" size={22} />
                </div>
                <h3>No reports found</h3>
                <p>Try another report type, status, or search word.</p>
              </div>
            )}

            <div className="report-pagination">
              <div className="report-page-text">
                Page {page} of {pagination.total_pages} · {pagination.total.toLocaleString()} reports
              </div>

              <div className="report-page-actions">
                <button
                  type="button"
                  className="report-page-btn"
                  disabled={!pagination.has_prev || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="report-page-btn"
                  disabled={!pagination.has_next || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedReport ? (
        <div className="report-detail-backdrop">
          <button
            type="button"
            className="report-detail-close-layer"
            aria-label="Close report details"
            onClick={closeReportDetails}
          />

          <aside className="report-detail">
            <div className="report-detail-header">
              <div>
                <div className="report-detail-kicker">
                  {selectedReport.report_type_label || selectedReport.report_type}
                </div>
                <h2 className="report-detail-title">
                  {selectedReport.target_title || 'Reported Content'}
                </h2>
              </div>

              <button
                type="button"
                className="report-detail-close"
                onClick={closeReportDetails}
                aria-label="Close report details"
              >
                <Icon d="M18 6L6 18 M6 6l12 12" size={16} />
              </button>
            </div>

            <div className="report-detail-body">
              <div className="report-detail-section">
                <div className="report-detail-grid">
                  <div className="report-detail-mini">
                    <div className="report-detail-label">Status</div>
                    <div className="report-detail-value">
                      <span className={`report-status ${selectedReport.status || 'pending'}`}>
                        {getStatusLabel(selectedReport.status)}
                      </span>
                    </div>
                  </div>

                  <div className="report-detail-mini">
                    <div className="report-detail-label">Submitted</div>
                    <div className="report-detail-value">
                      {formatDate(selectedReport.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-detail-section">
                <div className="report-detail-label">Reporter</div>
                <div className="report-reporter" style={{ marginTop: 10 }}>
                  <span className="report-avatar">
                    {selectedReport.reporter?.avatar_url ? (
                      <img
                        src={selectedReport.reporter.avatar_url}
                        alt={selectedReport.reporter?.name || 'Reader'}
                      />
                    ) : (
                      getReporterInitial(selectedReport)
                    )}
                  </span>

                  <span>
                    <span className="report-reporter-name">
                      {selectedReport.reporter?.name ||
                        selectedReport.reporter?.username ||
                        'Unknown Reader'}
                    </span>
                    <span className="report-reporter-date">
                      {selectedReport.reporter?.email ||
                        `@${selectedReport.reporter?.username || 'reader'}`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="report-detail-section">
                <div className="report-detail-label">Report Reason</div>
                <div className="report-detail-value">
                  {selectedReport.reason_label || selectedReport.reason_code || '-'}
                </div>

                {selectedReport.reason_text ? (
                  <>
                    <div className="report-detail-label" style={{ marginTop: 14 }}>
                      Reader Details
                    </div>
                    <div className="report-detail-value">{selectedReport.reason_text}</div>
                  </>
                ) : null}
              </div>

              <div className="report-detail-section">
                <div className="report-detail-label">Reported Content</div>
                <div className="report-detail-value">
                  {selectedReport.target_excerpt || 'No content preview is available.'}
                </div>

                {selectedReport.target_url ? (
                  <button
                    type="button"
                    className="report-target-link"
                    onClick={() =>
                      window.open(
                        selectedReport.target_url,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                  >
                    <Icon d="M14 3h7v7 M10 14L21 3 M21 14v7H3V3h7" size={14} />
                    Open Reported Content
                  </button>
                ) : null}
              </div>

                           <div className="report-detail-section">
                <div className="report-note-title-row">
                  <div className="report-detail-label">Admin Note</div>

                  <span
                    className={`report-note-state ${
                      noteDirty
                        ? 'dirty'
                        : selectedReport.admin_note
                          ? 'saved'
                          : ''
                    }`}
                  >
                    {noteDirty
                      ? 'Unsaved changes'
                      : selectedReport.admin_note
                        ? 'Saved'
                        : 'No note saved'}
                  </span>
                </div>

                <textarea
                  className="report-note"
                  value={adminNote}
                  maxLength={2000}
                  onChange={(event) => {
                    setAdminNote(event.target.value)
                    setMessage('')
                  }}
                  placeholder="Write what you reviewed or what action was taken..."
                />

                <div
                  style={{
                    marginTop: 6,
                    color: '#94A3B8',
                    fontSize: 10.5,
                    fontWeight: 750,
                    textAlign: 'right',
                  }}
                >
                  {adminNote.length}/2000
                </div>

                <div className="report-note-actions">
                  <button
                    type="button"
                    className="report-note-btn cancel"
                    disabled={!noteDirty || noteSaving || updating}
                    onClick={cancelAdminNoteChanges}
                  >
                    Cancel Changes
                  </button>

                  <button
                    type="button"
                    className="report-note-btn save"
                    disabled={!noteDirty || noteSaving || updating}
                    onClick={saveAdminNote}
                  >
                    {noteSaving ? 'Saving...' : 'Save Note'}
                  </button>
                </div>

                {selectedReport.reviewed_by ? (
                  <div
                    className="report-detail-value"
                    style={{ color: '#64748B' }}
                  >
                    Last updated by {selectedReport.reviewed_by}
                    {selectedReport.reviewed_at
                      ? ` · ${formatDate(selectedReport.reviewed_at)}`
                      : ''}
                  </div>
                ) : null}
              </div>

              {message ? (
                <div
                  className={`report-message ${
                    isErrorMessage(message) ? 'error' : 'success'
                  }`}
                >
                  {message}
                </div>
              ) : null}
            </div>

            <div className="report-detail-footer">
              <div className="report-detail-label">Report Status</div>

              <p className="report-status-help">
                Save or cancel Admin Note changes before changing the status.
              </p>

              <div className="report-action-grid">
                <button
                  type="button"
                  className={`report-action-btn ${
                    selectedReport.status === 'pending' ? 'active' : ''
                  }`}
                  disabled={updating || noteSaving}
                  onClick={() => requestStatusChange('pending')}
                >
                  Pending
                </button>

                <button
                  type="button"
                  className={`report-action-btn ${
                    selectedReport.status === 'under_review' ? 'active' : ''
                  }`}
                  disabled={updating || noteSaving}
                  onClick={() => requestStatusChange('under_review')}
                >
                  Under Review
                </button>

                <button
                  type="button"
                  className="report-action-btn resolve"
                  disabled={updating || noteSaving}
                  onClick={() => requestStatusChange('resolved')}
                >
                  Resolve
                </button>

                <button
                  type="button"
                  className="report-action-btn dismiss"
                  disabled={updating || noteSaving}
                  onClick={() => requestStatusChange('dismissed')}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </aside>

          {confirmStatus ? (
            <div className="report-confirm-backdrop">
              <div className="report-confirm-card">
                <div
                  className={`report-confirm-icon ${
                    confirmStatus === 'resolved' ? 'resolve' : 'dismiss'
                  }`}
                >
                  <Icon
                    d={
                      confirmStatus === 'resolved'
                        ? 'M20 6L9 17l-5-5'
                        : 'M18 6L6 18 M6 6l12 12'
                    }
                    size={20}
                  />
                </div>

                <h3 className="report-confirm-title">
                  {confirmStatus === 'resolved'
                    ? 'Resolve this report?'
                    : 'Dismiss this report?'}
                </h3>

                <p className="report-confirm-text">
                  {confirmStatus === 'resolved'
                    ? 'Confirm that you reviewed the reported content and completed any necessary action.'
                    : 'This report will be marked as not requiring further action.'}
                </p>

                <div className="report-confirm-actions">
                  <button
                    type="button"
                    className="report-confirm-btn cancel"
                    disabled={updating}
                    onClick={() => setConfirmStatus('')}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={`report-confirm-btn ${
                      confirmStatus === 'resolved' ? 'resolve' : 'dismiss'
                    }`}
                    disabled={updating}
                    onClick={() => applyStatus(confirmStatus)}
                  >
                    {updating
                      ? 'Saving...'
                      : confirmStatus === 'resolved'
                        ? 'Resolve Report'
                        : 'Dismiss Report'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
