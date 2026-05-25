import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg: #F8FAFC;
    --card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --text: #0F172A;
    --muted: #64748B;
    --soft: #94A3B8;
    --border: #E2E8F0;
    --success: #10B981;
    --success-light: #D1FAE5;
    --warning: #F59E0B;
    --warning-light: #FEF3C7;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --side: 80px;
    --side-open: 260px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
  }

  .dashboard-wrapper {
    height: 100vh;
    display: flex;
    background: var(--bg);
    overflow: hidden;
  }

  .sidebar {
    width: var(--side);
    background: #fff;
    border-right: 1px solid var(--border);
    padding: 20px 14px;
    overflow-y: auto;
    overflow-x: hidden;
    transition: .25s;
    flex-shrink: 0;
    z-index: 1000;
  }

  .sidebar::-webkit-scrollbar { width: 0; }

  .sidebar:hover {
    width: var(--side-open);
    box-shadow: 10px 0 30px rgba(15, 23, 42, .05);
  }

  .sidebar-logo {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    padding-left: 10px;
  }

  .logo-text {
    opacity: 0;
    white-space: nowrap;
    color: var(--primary);
    font-weight: 900;
    font-size: 18px;
    transition: opacity .2s;
  }

  .sidebar:hover .logo-text,
  .sidebar:hover .nav-text,
  .sidebar:hover .nav-group-label {
    opacity: 1;
  }

  .nav-group-label {
    opacity: 0;
    display: block;
    margin: 18px 0 8px 12px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--soft);
    white-space: nowrap;
    transition: opacity .2s;
  }

  .nav-item {
    height: 44px;
    display: flex;
    align-items: center;
    border-radius: 12px;
    padding: 0 12px;
    color: var(--muted);
    cursor: pointer;
    margin-bottom: 2px;
    font-weight: 700;
    white-space: nowrap;
    font-size: 14px;
    transition: .15s;
  }

  .nav-item:hover,
  .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    opacity: 0;
    margin-left: 14px;
    transition: opacity .2s;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
  }

  .header {
    height: 70px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 36px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header h2 {
    font-size: 17px;
    font-weight: 900;
  }

  .content-body {
    padding: 28px 36px 48px;
    max-width: 1600px;
    margin: 0 auto;
  }

  .shadow-page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .shadow-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;
    border-radius: 999px;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .shadow-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .shadow-subtitle {
    margin-top: 8px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  }

  .shadow-refresh {
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text);
    height: 42px;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .shadow-refresh:hover { background: var(--bg); }

  .shadow-media-grid {
    display: grid;
    grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
    gap: 20px;
    align-items: stretch;
  }

  .shadow-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .product-card,
  .records-card {
    margin-top: 20px;
  }

  .shadow-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .shadow-card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .shadow-card-note {
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
  }

  .shadow-form-body,
  .media-card {
    padding: 20px 22px 22px;
  }

  .shadow-section-title {
    margin: 4px 0 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #EEF2F7;
    color: #334155;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .shadow-message {
    margin-bottom: 16px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--bg);
    padding: 12px 14px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .field-grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field {
    display: block;
    margin-bottom: 13px;
  }

  .label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .help {
    color: var(--muted);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
    margin: -5px 0 10px;
  }

  .input,
  .select,
  .textarea {
    width: 100%;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text);
    border-radius: 14px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    transition: border-color .15s, box-shadow .15s;
  }

  .input,
  .select {
    height: 44px;
    padding: 0 12px;
  }

  .textarea {
    min-height: 122px;
    padding: 12px;
    resize: vertical;
  }

  .input:focus,
  .select:focus,
  .textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .checks {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 4px 0 16px;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    border-radius: 14px;
    padding: 12px 10px;
    font-size: 12px;
    font-weight: 900;
    color: #334155;
    cursor: pointer;
  }

  .check input { accent-color: var(--primary); }

  .save-button {
    width: 100%;
    height: 48px;
    border: 0;
    border-radius: 16px;
    background: var(--primary);
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(79, 70, 229, .18);
  }

  .save-button:disabled { opacity: .55; cursor: not-allowed; }

  .soft-button {
    border: 0;
    background: var(--bg);
    color: #475569;
    border-radius: 999px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .danger-button {
    width: 100%;
    height: 44px;
    border: 1px solid #FCA5A5;
    background: #fff;
    color: #B91C1C;
    border-radius: 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    margin-top: 10px;
  }

  .main-cover-frame {
    width: min(250px, 100%);
    aspect-ratio: 2 / 3;
    margin: 0 auto 14px;
    border: 1.5px dashed #CBD5E1;
    border-radius: 22px;
    background: linear-gradient(180deg, #F8FAFC, #EEF2F7);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 12px;
    font-weight: 900;
    text-align: center;
    position: relative;
  }

  .main-cover-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cover-chip {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(15, 23, 42, .76);
    color: #fff;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .upload-button {
    width: 100%;
    height: 44px;
    border-radius: 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    border: 1.5px dashed #CBD5E1;
    background: #F8FAFC;
    color: #334155;
  }

  .upload-button:hover {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary);
  }

  .gallery-slots {
    display: grid;
    grid-template-columns: repeat(5, minmax(82px, 1fr));
    gap: 10px;
  }

  .gallery-slot {
    border: 1px solid var(--border);
    border-radius: 18px;
    background: #fff;
    overflow: hidden;
  }

  .gallery-image-box {
    aspect-ratio: 2 / 3;
    width: 100%;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 900;
    position: relative;
    overflow: hidden;
  }

  .gallery-image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .gallery-number {
    position: absolute;
    top: 7px;
    left: 7px;
    background: rgba(15, 23, 42, .76);
    color: #fff;
    border-radius: 999px;
    padding: 4px 7px;
    font-size: 10px;
    font-weight: 900;
  }

  .gallery-actions {
    padding: 8px;
    display: grid;
    gap: 6px;
  }

  .mini-upload,
  .mini-clear {
    border: 0;
    border-radius: 10px;
    height: 28px;
    font-family: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .mini-upload {
    background: var(--primary-light);
    color: var(--primary);
  }

  .mini-clear {
    background: var(--danger-light);
    color: var(--danger);
  }

  .video-frame {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: #0F172A;
    margin-top: 10px;
    aspect-ratio: 16 / 9;
  }

  .video-frame iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  .record-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-select {
    height: 40px;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 0 12px;
    background: #fff;
    color: #334155;
    font-size: 13px;
    font-weight: 900;
    outline: none;
  }

  .records-list { min-height: 240px; }

  .empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .record-row {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    align-items: center;
  }

  .record-row:last-child { border-bottom: none; }

  .record-cover {
    width: 76px;
    height: 102px;
    border-radius: 15px;
    overflow: hidden;
    background: var(--bg);
  }

  .record-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .record-main { min-width: 0; }

  .record-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }

  .record-title {
    font-size: 14px;
    font-weight: 900;
    color: var(--text);
  }

  .record-author {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .record-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .old-price {
    color: #94A3B8;
    text-decoration: line-through;
  }

  .pill {
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .pill.category { background: var(--bg); color: #475569; }
  .pill.stock-in_stock { background: var(--success-light); color: #047857; }
  .pill.stock-sold_out { background: #F1F5F9; color: #64748B; }
  .pill.stock-pre_order { background: var(--warning-light); color: #B45309; }
  .pill.media { background: #F3E8FF; color: #7E22CE; }

  .record-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .record-action {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .record-action.edit { background: var(--primary-light); color: var(--primary); }
  .record-action.delete { background: var(--danger-light); color: var(--danger); }
    .records-toolbar-panel {
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: grid;
    grid-template-columns: minmax(240px, 1fr) 170px 150px 140px;
    gap: 10px;
    align-items: center;
  }

  .record-search-box {
    height: 42px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #F8FAFC;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 13px;
  }

  .record-search-box i {
    color: #94A3B8;
    font-size: 13px;
  }

  .record-search-input {
    width: 100%;
    border: 0;
    background: transparent;
    outline: none;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
  }

  .record-search-input::placeholder {
    color: #94A3B8;
  }

  .record-count-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--primary-light);
    color: var(--primary);
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .record-cover.empty-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 18px;
  }

  .record-title-line {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  .record-id {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 900;
  }

  .record-media-line {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 9px;
  }

  .pill.good {
    background: var(--success-light);
    color: #047857;
  }

  .pill.warning {
    background: var(--warning-light);
    color: #B45309;
  }

  .pill.danger {
    background: var(--danger-light);
    color: #B91C1C;
  }

  .pill.muted {
    background: #F1F5F9;
    color: #64748B;
  }

  .record-action.view {
    background: #F8FAFC;
    color: #334155;
  }

    .record-sort-button {
    height: 36px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #FFFFFF;
    color: var(--text);
    font-size: 11px;
    font-weight: 900;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    transition: 0.18s ease;
  }

  .record-sort-button:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-light);
  }

  .record-sort-button i {
    font-size: 11px;
  }

  @media (max-width: 1000px) {
    .records-toolbar-panel {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .records-toolbar-panel {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 980px) {
    .shadow-media-grid { grid-template-columns: 1fr; }
    .gallery-slots { grid-template-columns: repeat(5, 96px); overflow-x: auto; padding-bottom: 6px; }
  }

  @media (max-width: 740px) {
    .content-body { padding: 22px 16px 40px; }
    .header { padding: 0 18px; }
    .shadow-page-head { align-items: flex-start; flex-direction: column; }
    .field-grid,
    .field-grid.three,
    .checks { grid-template-columns: 1fr; }
    .record-row { grid-template-columns: 64px 1fr; }
    .record-cover { width: 64px; height: 88px; }
    .record-actions { grid-column: 1 / -1; justify-content: flex-end; }
  }
`;

const Icon = ({ d, size = 20, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || 'currentColor'}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ minWidth: `${size}px`, flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
);

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/shadow-mall', label: 'Shadow Mall', icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6' },
    { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
    { path: '/comments', label: 'Comments', icon: 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const renderGroup = (items) => items.map((item) => (
    <div
      key={item.path}
      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
      onClick={() => navigate(item.path)}
    >
      <Icon d={item.icon} size={20} />
      <span className="nav-text">{item.label}</span>
    </div>
  ));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" />
        <span className="logo-text">Shadow Exclusive</span>
      </div>

      <span className="nav-group-label">Overview</span>
      {renderGroup(navItems.overview)}

      <span className="nav-group-label">Visual Media</span>
      {renderGroup(navItems.visualMedia)}

      <span className="nav-group-label">System Admin</span>
      {renderGroup(navItems.systemAdmin)}

      <span className="nav-group-label">Finance & Growth</span>
      {renderGroup(navItems.finance)}
    </aside>
  );
}

const emptyForm = {
  title: '',
  author_name: '',
  publisher: '',
  novel_type: '',
  genre: '',
  paper_type: '',
  cover_type: '',
  page_count: '',
  youtube_url: '',
  description: '',
  category: 'new_books',
  stock_status: 'in_stock',
  price_usd: '',
  old_price_usd: '',
  stock_quantity: '',
  condition_label: '',
  is_best_seller: false,
  is_discount: false,
  is_active: true,
  sort_order: '',
};

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token');
}

function formatPrice(value) {
  const number = Number(value || 0);
  return `$${number.toFixed(2)}`;
}

function getStatusLabel(status) {
  if (status === 'sold_out') return 'SOLD OUT';
  if (status === 'pre_order') return 'PRE-ORDER';
  return 'IN STOCK';
}

function getCategoryLabel(category) {
  if (category === 'second_hand') return 'Second Hand';
  if (category === 'pre_order') return 'Pre-order';
  return 'New Books';
}

function normalizeGallery(value) {
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 5);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).slice(0, 5);
  } catch {}

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function getYoutubeEmbedUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.includes('youtube.com/embed/')) return raw;

  const shortsMatch = raw.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

  const watchMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return raw;
}

export default function ShadowMallProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [recordSearch, setRecordSearch] = useState('');
  const [recordStockFilter, setRecordStockFilter] = useState('all');
  const [recordStatusFilter, setRecordStatusFilter] = useState('all');
  const [recordSort, setRecordSort] = useState('newest');
  const mainCoverInputRef = useRef(null);
  const galleryInputRefs = useRef([]);
  const [mainCoverFile, setMainCoverFile] = useState(null);
  const [mainCoverPreview, setMainCoverPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([null, null, null, null, null]);
  const [galleryPreviews, setGalleryPreviews] = useState(['', '', '', '', '']);

  const filteredProducts = useMemo(() => {
  const keyword = recordSearch.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const categoryMatch =
      filter === 'all' ||
      (filter === 'best_seller' && product.is_best_seller) ||
      (filter === 'discount' && product.is_discount) ||
      (filter === 'sold_out' && product.stock_status === 'sold_out') ||
      product.category === filter;

    const stockMatch =
      recordStockFilter === 'all' ||
      product.stock_status === recordStockFilter;

    const statusMatch =
      recordStatusFilter === 'all' ||
      (recordStatusFilter === 'active' && product.is_active) ||
      (recordStatusFilter === 'hidden' && !product.is_active);

    const searchText = [
      product.id,
      product.title,
      product.author_name,
      product.category,
      product.stock_status,
      product.condition_label,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const searchMatch = !keyword || searchText.includes(keyword);

    return categoryMatch && stockMatch && statusMatch && searchMatch;
  });

  return [...filtered].sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime() || Number(a.id || 0);
    const bTime = new Date(b.created_at || 0).getTime() || Number(b.id || 0);

    if (recordSort === 'oldest') return aTime - bTime;

    return bTime - aTime;
  });
}, [products, filter, recordSearch, recordStockFilter, recordStatusFilter, recordSort]);

  const youtubeEmbedUrl = useMemo(() => getYoutubeEmbedUrl(form.youtube_url), [form.youtube_url]);

  async function fetchProducts() {
    try {
      setLoading(true);

      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shadow-mall/products?include_inactive=true&limit=100`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Shadow Mall products');
      }

      setProducts(data.products || []);
    } catch (error) {
      setMessage(error.message || 'Failed to load Shadow Mall products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleMainCoverUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMainCoverFile(file);
    setMainCoverPreview(URL.createObjectURL(file));
  }

  function clearMainCover() {
    setMainCoverFile(null);
    setMainCoverPreview('');

    if (mainCoverInputRef.current) {
      mainCoverInputRef.current.value = '';
    }
  }

  function handleGalleryUpload(index, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setGalleryFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });

    setGalleryPreviews((current) => {
      const next = [...current];
      next[index] = URL.createObjectURL(file);
      return next;
    });
  }

  function clearGalleryImage(index) {
    setGalleryFiles((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });

    setGalleryPreviews((current) => {
      const next = [...current];
      next[index] = '';
      return next;
    });

    if (galleryInputRefs.current[index]) {
      galleryInputRefs.current[index].value = '';
    }
  }

  function resetMedia() {
    setMainCoverFile(null);
    setMainCoverPreview('');
    setGalleryFiles([null, null, null, null, null]);
    setGalleryPreviews(['', '', '', '', '']);

    if (mainCoverInputRef.current) {
      mainCoverInputRef.current.value = '';
    }

    galleryInputRefs.current.forEach((input) => {
      if (input) input.value = '';
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
    resetMedia();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      title: product.title || '',
      author_name: product.author_name || '',
      publisher: product.publisher || '',
      novel_type: product.novel_type || '',
      genre: product.genre || '',
      paper_type: product.paper_type || '',
      cover_type: product.cover_type || '',
      page_count: product.page_count ?? '',
      youtube_url: product.youtube_url || product.video_url || '',
      description: product.description || '',
      category: product.category || 'new_books',
      stock_status: product.stock_status || 'in_stock',
      price_usd: product.price_usd ?? '',
      old_price_usd: product.old_price_usd ?? '',
      stock_quantity: product.stock_quantity ?? '',
      condition_label: product.condition_label || '',
      is_best_seller: Boolean(product.is_best_seller),
      is_discount: Boolean(product.is_discount),
      is_active: Boolean(product.is_active),
      sort_order: product.sort_order ?? '',
    });

    setMainCoverFile(null);
    setMainCoverPreview(product.cover_url || '');

    const existingGallery = normalizeGallery(product.gallery_image_urls || product.image_urls);
    setGalleryFiles([null, null, null, null, null]);
    setGalleryPreviews([...existingGallery, '', '', '', '', ''].slice(0, 5));

    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage('Book title is required.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const token = getAdminToken();
      const formData = new FormData();

      const payload = {
        ...form,
        youtube_url: form.youtube_url.trim(),
        price_usd: form.price_usd === '' ? 0 : Number(form.price_usd),
        old_price_usd: form.old_price_usd === '' ? '' : Number(form.old_price_usd),
        stock_quantity: form.stock_quantity === '' ? 0 : Number(form.stock_quantity),
        sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
      };

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value ?? ''));
      });

      formData.append('gallery_image_urls', JSON.stringify(galleryPreviews.map((url) => url || '').slice(0, 5)));

      if (mainCoverFile) {
        formData.append('main_cover', mainCoverFile);
      }

      galleryFiles.forEach((file, index) => {
        if (file) {
          formData.append(`gallery_image_${index}`, file);
        }
      });

      const url = editingId
        ? `${API_URL}/api/shadow-mall/products/${editingId}`
        : `${API_URL}/api/shadow-mall/products`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save product');
      }

      setMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.');
      resetForm();
      fetchProducts();
    } catch (error) {
      setMessage(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this Shadow Mall product?');
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shadow-mall/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete product');
      }

      setMessage('Product deleted successfully.');
      fetchProducts();
    } catch (error) {
      setMessage(error.message || 'Failed to delete product');
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <Sidebar />

        <div className="main-content">
          <header className="header">
            <h2>Shadow Mall</h2>
          </header>

          <main className="content-body">
            <div className="shadow-page-head">
              <div>
                <div className="shadow-kicker">📚 Shadow Mall Products</div>
                <h1 className="shadow-title">Shadow Mall</h1>
                <p className="shadow-subtitle">
                  Manage real printed books, second hand books, pre-orders, stock, price, media, and YouTube previews.
                </p>
              </div>

              <button type="button" className="shadow-refresh" onClick={fetchProducts}>
                Refresh
              </button>
            </div>
            <div style={{
              display: 'flex',
              gap: 10,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}>
              <button
                type="button"
                style={{
                  height: 40,
                  border: 0,
                  borderRadius: 14,
                  padding: '0 16px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Products
              </button>

              <button
                type="button"
                onClick={() => navigate('/shadow-mall/orders')}
                style={{
                  height: 40,
                  border: '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: '0 16px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Review Orders
              </button>
            </div>
            <div className="shadow-media-grid">
              <section className="shadow-card">
                <div className="shadow-card-head">
                  <div>
                    <h2 className="shadow-card-title">Main Cover</h2>
                    <p className="shadow-card-note">Upload the vertical cover shown on product cards.</p>
                  </div>
                </div>

                <div className="media-card">
                  <div className="shadow-section-title">Main Cover</div>
                  <p className="help">Recommended: vertical 2:3 ratio, JPG, PNG, or WEBP.</p>

                  <div className="main-cover-frame">
                    {(mainCoverPreview || '') ? (
                      <>
                        <span className="cover-chip">Main Cover</span>
                        <img src={mainCoverPreview} alt="Main cover preview" />
                      </>
                    ) : (
                      <span>Main Cover Preview<br />2:3 vertical</span>
                    )}
                  </div>

                  <button type="button" className="upload-button" onClick={() => mainCoverInputRef.current?.click()}>
                    Choose or replace main cover
                  </button>

                  <input
                    ref={mainCoverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleMainCoverUpload}
                  />

                  {(mainCoverPreview || mainCoverFile) ? (
                    <button type="button" className="danger-button" onClick={clearMainCover}>
                      Clear Main Cover
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="shadow-card">
                <div className="shadow-card-head">
                  <div>
                    <h2 className="shadow-card-title">Book Images & Video</h2>
                    <p className="shadow-card-note">Upload gallery images and paste a YouTube preview link.</p>
                  </div>
                </div>

                <div className="media-card">
                  <div className="shadow-section-title">Book Images</div>
                  <p className="help">Maximum 5 vertical gallery images. These show on the product detail page after readers open the book.</p>

                  <div className="gallery-slots">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div className="gallery-slot" key={index}>
                        <div className="gallery-image-box">
                          {galleryPreviews[index] ? (
                            <>
                              <span className="gallery-number">{index + 1}</span>
                              <img src={galleryPreviews[index]} alt={`Gallery ${index + 1}`} />
                            </>
                          ) : (
                            <span>Image {index + 1}</span>
                          )}
                        </div>

                        <div className="gallery-actions">
                          <button type="button" className="mini-upload" onClick={() => galleryInputRefs.current[index]?.click()}>
                            Choose
                          </button>

                          {galleryPreviews[index] ? (
                            <button type="button" className="mini-clear" onClick={() => clearGalleryImage(index)}>
                              Clear
                            </button>
                          ) : null}

                          <input
                            ref={(node) => {
                              galleryInputRefs.current[index] = node;
                            }}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(event) => handleGalleryUpload(index, event)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="shadow-section-title" style={{ marginTop: 22 }}>YouTube Preview</div>

                  <label className="field">
                    <span className="label">YouTube video link or embed URL</span>
                    <p className="help">Paste a normal YouTube link, Shorts link, youtu.be link, or embed link. Readers can watch inside your website.</p>
                    <input
                      value={form.youtube_url}
                      onChange={(event) => updateField('youtube_url', event.target.value)}
                      className="input"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </label>

                  {youtubeEmbedUrl ? (
                    <div className="video-frame">
                      <iframe
                        src={youtubeEmbedUrl}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <form onSubmit={handleSubmit} className="shadow-card product-card">
              <div className="shadow-card-head">
                <div>
                  <h2 className="shadow-card-title">{editingId ? 'Edit Product Information' : 'Add Product Information'}</h2>
                  <p className="shadow-card-note">Fill the selling details for one Shadow Mall book.</p>
                </div>

                {editingId ? (
                  <button type="button" className="soft-button" onClick={resetForm}>
                    New
                  </button>
                ) : null}
              </div>

              <div className="shadow-form-body">
                {message ? <div className="shadow-message">{message}</div> : null}

                <div className="shadow-section-title">Book Information</div>

                <label className="field">
                  <span className="label">Book title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    className="input"
                    placeholder="Book title"
                  />
                </label>

                <label className="field">
                  <span className="label">Author name</span>
                  <input
                    value={form.author_name}
                    onChange={(event) => updateField('author_name', event.target.value)}
                    className="input"
                    placeholder="Author name"
                  />
                </label>

                <div className="field-grid">
  <label className="field">
    <span className="label">Publisher</span>
    <input
      value={form.publisher}
      onChange={(event) => updateField('publisher', event.target.value)}
      className="input"
      placeholder="Visoth"
    />
  </label>

  <label className="field">
    <span className="label">Novel Type</span>
    <input
      value={form.novel_type}
      onChange={(event) => updateField('novel_type', event.target.value)}
      className="input"
      placeholder="Khmer"
    />
  </label>
</div>

<div className="field-grid">
  <label className="field">
    <span className="label">Genre</span>
    <input
      value={form.genre}
      onChange={(event) => updateField('genre', event.target.value)}
      className="input"
      placeholder="Romance"
    />
  </label>

  <label className="field">
    <span className="label">Paper Type</span>
    <input
      value={form.paper_type}
      onChange={(event) => updateField('paper_type', event.target.value)}
      className="input"
      placeholder="Bagasse Paper"
    />
  </label>
</div>

<div className="field-grid">
  <label className="field">
    <span className="label">Cover Type</span>
    <input
      value={form.cover_type}
      onChange={(event) => updateField('cover_type', event.target.value)}
      className="input"
      placeholder="Paperback"
    />
  </label>

  <label className="field">
    <span className="label">Page Count</span>
    <input
      type="number"
      value={form.page_count}
      onChange={(event) => updateField('page_count', event.target.value)}
      className="input"
      placeholder="436"
    />
  </label>
</div>

                <div className="field-grid">
                  <label className="field">
                    <span className="label">Category</span>
                    <select
                      value={form.category}
                      onChange={(event) => updateField('category', event.target.value)}
                      className="select"
                    >
                      <option value="new_books">New Books</option>
                      <option value="second_hand">Second Hand</option>
                      <option value="pre_order">Pre-order</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="label">Stock status</span>
                    <select
                      value={form.stock_status}
                      onChange={(event) => updateField('stock_status', event.target.value)}
                      className="select"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="pre_order">Pre-order</option>
                    </select>
                  </label>
                </div>

                <div className="shadow-section-title">Sales Details</div>

                <div className="field-grid">
                  <label className="field">
                    <span className="label">Price USD</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_usd}
                      onChange={(event) => updateField('price_usd', event.target.value)}
                      className="input"
                      placeholder="8.75"
                    />
                  </label>

                  <label className="field">
                    <span className="label">Old price</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.old_price_usd}
                      onChange={(event) => updateField('old_price_usd', event.target.value)}
                      className="input"
                      placeholder="Leave empty if no discount"
                    />
                  </label>
                </div>

                <div className="field-grid">
                  <label className="field">
                    <span className="label">Stock quantity</span>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={(event) => updateField('stock_quantity', event.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </label>

                  <label className="field">
                    <span className="label">Sort order</span>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(event) => updateField('sort_order', event.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="label">Condition label</span>
                  <input
                    value={form.condition_label}
                    onChange={(event) => updateField('condition_label', event.target.value)}
                    className="input"
                    placeholder="New, Like new, Good, Fair..."
                  />
                </label>

                <div className="shadow-section-title">Product Details</div>

                <label className="field">
                  <span className="label">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    className="textarea"
                    placeholder="Book details, condition, delivery note, or pre-order note..."
                  />
                </label>

                <div className="checks">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.is_best_seller}
                      onChange={(event) => updateField('is_best_seller', event.target.checked)}
                    />
                    Best seller
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.is_discount}
                      onChange={(event) => updateField('is_discount', event.target.checked)}
                    />
                    Discount
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => updateField('is_active', event.target.checked)}
                    />
                    Active
                  </label>
                </div>

                <button type="submit" disabled={saving} className="save-button">
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>

           <section className="shadow-card records-card">
  <div className="shadow-card-head">
    <div>
      <h2 className="shadow-card-title">Book Records</h2>
      <p className="shadow-card-note">
        Search, filter, and manage real Shadow Mall products.
      </p>
    </div>

    <div className="record-toolbar">
      <span className="record-count-pill">
  {filteredProducts.length} / {products.length} products
</span>

<button
  type="button"
  className="record-sort-button"
  onClick={() => setRecordSort((current) => (current === 'newest' ? 'oldest' : 'newest'))}
>
  <i className={`fa-solid ${recordSort === 'newest' ? 'fa-arrow-down-wide-short' : 'fa-arrow-up-wide-short'}`} />
  {recordSort === 'newest' ? 'Newest' : 'Oldest'}
</button>

<button type="button" className="shadow-refresh" onClick={fetchProducts}>
  Refresh
</button>
    </div>
  </div>

  <div className="records-toolbar-panel">
    <div className="record-search-box">
      <i className="fa-solid fa-magnifying-glass" />
      <input
        value={recordSearch}
        onChange={(event) => setRecordSearch(event.target.value)}
        className="record-search-input"
        placeholder="Search title, author, product ID..."
      />
    </div>

    <select
      value={filter}
      onChange={(event) => setFilter(event.target.value)}
      className="filter-select"
    >
      <option value="all">All Categories</option>
      <option value="new_books">New Books</option>
      <option value="second_hand">Second Hand</option>
      <option value="pre_order">Pre-order</option>
      <option value="best_seller">Best Seller</option>
      <option value="discount">Discount</option>
      <option value="sold_out">Sold Out</option>
    </select>

    <select
      value={recordStockFilter}
      onChange={(event) => setRecordStockFilter(event.target.value)}
      className="filter-select"
    >
      <option value="all">All Stock</option>
      <option value="in_stock">In Stock</option>
      <option value="sold_out">Sold Out</option>
      <option value="pre_order">Pre-order</option>
    </select>

    <select
      value={recordStatusFilter}
      onChange={(event) => setRecordStatusFilter(event.target.value)}
      className="filter-select"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="hidden">Hidden</option>
    </select>
  </div>

  <div className="records-list">
    {loading ? (
      <div className="empty">Loading products...</div>
    ) : filteredProducts.length ? (
      filteredProducts.map((product) => {
        const galleryCount = normalizeGallery(product.gallery_image_urls || product.image_urls).length;
        const hasCover = Boolean(product.cover_url);
        const hasVideo = Boolean(product.youtube_url || product.video_url);
        const hasOldPrice = product.old_price_usd !== null && product.old_price_usd !== undefined && product.old_price_usd !== '';

        return (
          <div key={product.id} className="record-row">
            <div className={`record-cover ${hasCover ? '' : 'empty-cover'}`}>
              {hasCover ? (
                <img src={product.cover_url} alt={product.title} />
              ) : (
                <i className="fa-solid fa-book-open" />
              )}
            </div>

            <div className="record-main">
              <div className="record-title-line">
                <span className="record-title">{product.title}</span>
                <span className="record-id">ID: {product.id}</span>
              </div>

              <div className="record-author">
                {product.author_name || 'No author name'}
              </div>

              <div className="record-top">
                <span className="pill category">{getCategoryLabel(product.category)}</span>
                <span className={`pill stock-${product.stock_status}`}>
                  {getStatusLabel(product.stock_status)}
                </span>

                {product.is_active ? (
                  <span className="pill good">Active</span>
                ) : (
                  <span className="pill muted">Hidden</span>
                )}

                {product.is_best_seller ? <span className="pill warning">Best Seller</span> : null}
                {product.is_discount ? <span className="pill danger">Discount</span> : null}
              </div>

              <div className="record-meta">
                <span>{formatPrice(product.price_usd)}</span>
                {hasOldPrice ? (
                  <span className="old-price">{formatPrice(product.old_price_usd)}</span>
                ) : null}
                <span>Stock: {product.stock_quantity || 0}</span>
                <span>Sort: {product.sort_order || 0}</span>
              </div>

              <div className="record-media-line">
                {hasCover ? (
                  <span className="pill good">Cover OK</span>
                ) : (
                  <span className="pill danger">No Cover</span>
                )}

                {galleryCount ? (
                  <span className="pill media">{galleryCount} Photos</span>
                ) : (
                  <span className="pill muted">No Photos</span>
                )}

                {hasVideo ? (
                  <span className="pill media">Video</span>
                ) : (
                  <span className="pill muted">No Video</span>
                )}
              </div>
            </div>

            <div className="record-actions">
              <button
                type="button"
                onClick={() => startEdit(product)}
                className="record-action edit"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                className="record-action delete"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <div className="empty">
        No products found. Try changing search or filters.
      </div>
    )}
  </div>
</section>
          </main>
        </div>
      </div>
    </>
  );
}
