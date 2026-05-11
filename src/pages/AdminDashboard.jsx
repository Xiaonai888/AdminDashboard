import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-main: #F8FAFC;
    --bg-card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --success: #10B981;
    --success-light: #D1FAE5;
    --warning: #F59E0B;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --border: #E2E8F0;
    --sidebar-collapsed: 80px;
    --sidebar-expanded: 260px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  .dashboard-wrapper {
    display: flex;
    height: 100vh;
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    overflow: hidden;
  }

  /* ===== SIDEBAR ===== */
  .sidebar {
    width: var(--sidebar-collapsed);
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }

  .sidebar:hover {
    width: var(--sidebar-expanded);
    box-shadow: 10px 0 30px rgba(0,0,0,0.04);
  }

  .sidebar-logo {
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding-left: 10px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover .logo-text { opacity: 1; }

  .nav-group-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    margin: 20px 0 8px 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sidebar:hover .nav-group-label { opacity: 1; }

  .nav-item {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    color: var(--text-muted);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;
    white-space: nowrap;
    font-size: 14px;
  }

  .nav-item:hover, .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    margin-left: 14px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sidebar:hover .nav-text { opacity: 1; }

  /* ===== MAIN CONTENT ===== */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  /* ===== HEADER ===== */
  .header {
    height: 70px;
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left h2 {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-main);
  }

  /* Search Bar */
  .search-wrap {
    position: relative;
  }

  .search-input {
    background: #F1F5F9;
    border: 1.5px solid transparent;
    border-radius: 12px;
    padding: 9px 14px 9px 40px;
    width: 300px;
    outline: none;
    font-size: 13.5px;
    font-family: 'Inter', sans-serif;
    color: var(--text-main);
    transition: all 0.2s;
  }

  .search-input:focus {
    background: #fff;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    width: 340px;
  }

  .search-input::placeholder { color: #94A3B8; }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  /* Search dropdown */
  .search-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 340px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border);
    box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    overflow: hidden;
    z-index: 999;
    animation: fadeIn 0.15s ease;
  }

  .search-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-muted);
    padding: 10px 14px 6px;
  }

  .search-result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .search-result-item:hover { background: #F8FAFC; }

  .search-result-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }

  .search-result-item .info { flex: 1; min-width: 0; }
  .search-result-item .name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .search-result-item .sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  .search-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
  }

  /* Profile */
  .profile-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 12px;
    transition: background 0.15s;
  }

  .profile-btn:hover { background: #F1F5F9; }

  .profile-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    border: 2px solid #E2E8F0;
    flex-shrink: 0;
  }

  .profile-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: white;
    border-radius: 16px;
    width: 220px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
    border: 1px solid #E2E8F0;
    overflow: hidden;
    animation: fadeIn 0.15s ease;
    z-index: 200;
  }

  .profile-menu-header {
    padding: 16px;
    background: linear-gradient(135deg, #F0F0FF, #EEF2FF);
    border-bottom: 1px solid #E0E7FF;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .profile-menu-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
  }

  .profile-menu-name { font-weight: 700; font-size: 14px; }
  .profile-menu-role { font-size: 11px; color: var(--primary); font-weight: 600; }

  .profile-menu-body { padding: 8px; }

  .profile-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13.5px;
    color: #475569;
    font-weight: 500;
    transition: background 0.15s;
  }

  .profile-menu-item:hover { background: #F1F5F9; }
  .profile-menu-item.danger { color: #EF4444; }
  .profile-menu-item.danger:hover { background: #FEF2F2; }

  .profile-menu-divider { height: 1px; background: #F1F5F9; margin: 4px 0; }

  /* ===== CONTENT BODY ===== */
  .content-body {
    padding: 28px 36px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    animation: fadeIn 0.4s ease-out;
  }

  .welcome-row {
    margin-bottom: 24px;
  }

  .welcome-row h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
  }

  .welcome-row p {
    font-size: 13.5px;
    color: var(--text-muted);
    margin-top: 3px;
  }

  /* ===== STAT CARDS ===== */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 22px 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    border: 1px solid var(--border);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }

  .stat-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .stat-label {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
  }

  /* ===== BENTO GRID ===== */
  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .card-panel {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 22px 24px;
    border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .panel-header h4 { font-weight: 700; font-size: 15px; }

  .panel-link {
    font-size: 12px;
    color: var(--primary);
    font-weight: 600;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .panel-link:hover { background: var(--primary-light); }

  /* Chart */
  .chart-wrap {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 160px;
    padding-top: 10px;
  }

  .chart-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    gap: 6px;
  }

  .chart-bar-wrap {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex: 1;
  }

  .chart-bar {
    width: 80%;
    border-radius: 6px 6px 0 0;
    transition: all 0.3s ease;
    transform-origin: bottom;
    animation: barGrow 0.6s ease-out forwards;
  }

  .chart-day {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Log Items */
  .log-list { display: flex; flex-direction: column; gap: 14px; }

  .log-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .log-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .log-text { font-size: 13px; line-height: 1.5; }
  .log-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 16px;
    padding: 10px;
    border-radius: 10px;
    background: #F8FAFC;
    border: 1px solid var(--border);
    color: var(--primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .view-all-btn:hover { background: var(--primary-light); }

  /* ===== NOVELS TABLE ===== */
  .novels-table-wrap { overflow-x: auto; }

  .novels-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .novels-table thead tr {
    border-bottom: 1.5px solid var(--border);
  }

  .novels-table th {
    padding: 10px 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .novels-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #F8FAFC;
    vertical-align: middle;
  }

  .novels-table tr:last-child td { border-bottom: none; }

  .novels-table tr:hover td { background: #FAFBFF; }

  .novel-title-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .live-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success);
    margin-right: 6px;
    box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
    50% { box-shadow: 0 0 0 5px rgba(16,185,129,0.1); }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
  }

  .badge-published {
    background: var(--success-light);
    color: var(--success);
  }

  .badge-pending {
    background: #FEF3C7;
    color: #D97706;
  }

  @media (max-width: 768px) {
    .bento-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .content-body { padding: 20px 16px; }
    .header { padding: 0 16px; }
    .search-input { width: 200px; }
  }
`;

const Icon = ({ d, size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth={2.2}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token');
}

function getLogInitial(record) {
  const actor = record?.actor || 'Admin';
  return actor.charAt(0).toUpperCase();
}

function getLogColor(action) {
  const value = String(action || '').toUpperCase();

  if (value === 'DELETE') return '#EF4444';
  if (value === 'CREATE') return '#10B981';
  if (value === 'VISIBILITY') return '#F59E0B';
  if (value === 'UPDATE') return '#4F46E5';

  return '#6366F1';
}

function formatLogTime(value) {
  if (!value) return '';

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleString();
}

function getLogText(record) {
  const action = String(record?.action || 'UPDATE').toUpperCase();
  const title = record?.slide_title || (record?.order_index ? `Slide ${record.order_index}` : 'item');
  const detail = record?.details || '';

  if (detail) return detail;
  if (action === 'DELETE') return `Deleted ${title}`;
  if (action === 'CREATE') return `Created ${title}`;
  if (action === 'VISIBILITY') return `Changed visibility for ${title}`;

  return `Updated ${title}`;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
const [activityLogLoading, setActivityLogLoading] = useState(true);

  const handleSignOut = () => {
    sessionStorage.removeItem('shadow_admin_token');
    localStorage.removeItem('shadow_admin_token');
    navigate('/login', { replace: true });
  };

  const currentUserName = 'Xiaonai Xiao';
  const currentUserRole = 'Owner';

  const chartData = [
    { day: 'Mon', value: 42, color: '#10B981' },
    { day: 'Tue', value: 65, color: '#10B981' },
    { day: 'Wed', value: 30, color: '#EF4444' },
    { day: 'Thu', value: 82, color: '#10B981' },
    { day: 'Fri', value: 50, color: '#10B981' },
    { day: 'Sat', value: 98, color: '#4F46E5', active: true },
    { day: 'Sun', value: 70, color: '#10B981' },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value));

  const searchResults = {
    novels: [
      { id: 1, name: 'Solo Leveling: Ragnarok', sub: 'Sung Jin · Action / Fantasy', color: '#EEF2FF', icon: '📖', badge: 'Live', badgeColor: '#D1FAE5', badgeText: '#10B981' },
      { id: 2, name: 'The CEO\'s Secret', sub: 'LoveWriter · Romance', color: '#FDF2F8', icon: '📖', badge: 'Live', badgeColor: '#D1FAE5', badgeText: '#10B981' },
    ],
    authors: [
      { id: 1, name: 'Sung Jin', sub: 'Author · 12 novels', color: '#F0FDF4', icon: '✍️' },
      { id: 2, name: 'LoveWriter', sub: 'Author · 8 novels', color: '#FFF7ED', icon: '✍️' },
    ],
    reports: [
      { id: 1, name: 'Spam comment report', sub: 'Pending · 2 hours ago', color: '#FEF3C7', icon: '⚠️', badge: 'Pending', badgeColor: '#FEF3C7', badgeText: '#D97706' },
    ]
  };

  const filteredSearch = searchQuery.length > 0 ? {
    novels: searchResults.novels.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase())),
    authors: searchResults.authors.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())),
    reports: searchResults.reports.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
  } : searchResults;

  const hasResults = filteredSearch.novels.length + filteredSearch.authors.length + filteredSearch.reports.length > 0;

  const navItems = {
    overview: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      { path: '/novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
      { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    ],
    visualMedia: [
      { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
      { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
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
      { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
      { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
      { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
    ],
  };

  const stats = [
    {
      label: 'Total Novels', value: '1,248',
      trend: '+12 this week', trendUp: true,
      icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
      iconBg: '#EEF2FF', iconColor: '#4F46E5', valueColor: '#0F172A',
    },
    {
      label: 'Active Readers Today', value: '3,012',
      trend: '+15% vs yesterday', trendUp: true,
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
      iconBg: '#F0FDF4', iconColor: '#10B981', valueColor: '#0F172A',
    },
    {
      label: 'Daily Income', value: '$50.03',
      trend: 'Trending up', trendUp: true,
      icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
      iconBg: '#F0FDF4', iconColor: '#10B981', valueColor: '#10B981',
    },
    {
      label: 'Pending Reports', value: '5',
      trend: 'Needs attention', trendUp: false,
      icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
      iconBg: '#FEF2F2', iconColor: '#EF4444', valueColor: '#EF4444',
    },
  ];

  const novels = [
    { title: 'Solo Leveling: Ragnarok', author: 'Sung Jin', category: 'Action / Fantasy', status: 'Published' },
    { title: "The CEO's Secret", author: 'LoveWriter', category: 'Romance', status: 'Published' },
    { title: 'Dragon\'s Oath', author: 'KingScribe', category: 'Fantasy', status: 'Published' },
  ];

  const activityLog = [
    { initial: 'S', name: 'Sok', action: 'Approved novel "Solo Leveling"', time: '10 mins ago', bg: '#4F46E5' },
    { initial: 'D', name: 'Dev', action: 'Deleted reported comment', time: '1 hour ago', bg: '#6366f1' },
    { initial: 'Y', name: 'You', action: 'Updated system rules', time: '3 hours ago', bg: '#8b5cf6' },
  ];

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" />
            <span className="logo-text">Shadow Exclusive</span>
          </div>

          <span className="nav-group-label">Overview</span>
          {navItems.overview.map(item => (
            <div key={item.label} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <Icon d={item.icon} size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">Visual Media</span>
          {navItems.visualMedia.map(item => (
            <div key={item.label} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <Icon d={item.icon} size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">System Admin</span>
          {navItems.systemAdmin.map(item => (
            <div key={item.label} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <Icon d={item.icon} size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">Finance & Growth</span>
          {navItems.finance.map(item => (
            <div key={item.label} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <Icon d={item.icon} size={20} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* HEADER */}
          <header className="header">
            <div className="header-left">
              <h2>Dashboard Overview</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Search */}
              <div className="search-wrap">
                <svg className="search-icon" width={16} height={16} fill="none" stroke="#94A3B8" strokeWidth={2.5}>
                  <circle cx={7} cy={7} r={5} />
                  <line x1={11} y1={11} x2={15} y2={15} />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search authors, novels, reports..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                />
                {showSearchDropdown && hasResults && (
                  <div className="search-dropdown">
                    {filteredSearch.novels.length > 0 && (
                      <>
                        <div className="search-section-title">Novels</div>
                        {filteredSearch.novels.map(item => (
                          <div className="search-result-item" key={item.id}>
                            <div className="search-result-icon" style={{ background: item.color }}>{item.icon}</div>
                            <div className="info">
                              <div className="name">{item.name}</div>
                              <div className="sub">{item.sub}</div>
                            </div>
                            {item.badge && (
                              <span className="search-badge" style={{ background: item.badgeColor, color: item.badgeText }}>{item.badge}</span>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                    {filteredSearch.authors.length > 0 && (
                      <>
                        <div className="search-section-title">Authors</div>
                        {filteredSearch.authors.map(item => (
                          <div className="search-result-item" key={item.id}>
                            <div className="search-result-icon" style={{ background: item.color }}>{item.icon}</div>
                            <div className="info">
                              <div className="name">{item.name}</div>
                              <div className="sub">{item.sub}</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {filteredSearch.reports.length > 0 && (
                      <>
                        <div className="search-section-title">Reports</div>
                        {filteredSearch.reports.map(item => (
                          <div className="search-result-item" key={item.id}>
                            <div className="search-result-icon" style={{ background: item.color }}>{item.icon}</div>
                            <div className="info">
                              <div className="name">{item.name}</div>
                              <div className="sub">{item.sub}</div>
                            </div>
                            {item.badge && (
                              <span className="search-badge" style={{ background: item.badgeColor, color: item.badgeText }}>{item.badge}</span>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div style={{ position: 'relative', cursor: 'pointer', padding: '6px', borderRadius: '10px' }}
                className="notif-btn">
                <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={20} color="#64748B" />
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '8px', height: '8px', background: 'var(--danger)',
                  borderRadius: '50%', border: '2px solid white'
                }} />
              </div>

              {/* Profile */}
              <div style={{ position: 'relative' }}>
                <div className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <div className="profile-avatar">
                    {currentUserName.charAt(0)}
                  </div>
                  <Icon d="M6 9l6 6 6-6" size={16} color="#64748B" />
                </div>

                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <div className="profile-menu-avatar">{currentUserName.charAt(0)}</div>
                      <div>
                        <div className="profile-menu-name">{currentUserName}</div>
                        <div className="profile-menu-role">{currentUserRole}</div>
                      </div>
                    </div>
                    <div className="profile-menu-body">
                      <div className="profile-menu-item">
                        <Icon d="M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" size={15} />
                        Edit Profile
                      </div>
                      <div className="profile-menu-item">
                        <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" size={15} />
                        Settings
                      </div>
                      <div className="profile-menu-divider" />
                      <div className="profile-menu-item danger" onClick={handleSignOut}>
                        <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" size={15} color="#EF4444" />
                        Sign Out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="content-body">
            <div className="welcome-row">
              <h1>{getHour()}, {currentUserName.split(' ')[0]}! 👋</h1>
              <p>Here's what's happening on Shadow Exclusive today.</p>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-card-top">
                    <span className="stat-label">{s.label}</span>
                    <div className="stat-icon-box" style={{ background: s.iconBg }}>
                      <Icon d={s.icon} size={18} color={s.iconColor} />
                    </div>
                  </div>
                  <div className="stat-value" style={{ color: s.valueColor }}>{s.value}</div>
                  <div className="stat-trend" style={{ color: s.trendUp ? 'var(--success)' : 'var(--danger)' }}>
                    <Icon d={s.trendUp
                      ? 'M23 6l-9.5 9.5-5-5L1 18'
                      : 'M23 18l-9.5-9.5-5 5L1 6'
                    } size={13} color={s.trendUp ? '#10B981' : '#EF4444'} />
                    {s.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* BENTO GRID */}
            <div className="bento-grid">
              {/* Chart */}
              <section className="card-panel">
                <div className="panel-header">
                  <h4>Reader Growth (Last 7 Days)</h4>
                  <span className="panel-link">View Report</span>
                </div>
                <div className="chart-wrap">
                  {chartData.map((d, i) => (
                    <div className="chart-col" key={i}>
                      <div className="chart-bar-wrap">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${(d.value / maxVal) * 100}%`,
                            background: d.active
                              ? 'linear-gradient(180deg, #4F46E5, #7C3AED)'
                              : d.value < 40
                                ? 'linear-gradient(180deg, #FCA5A5, #FEE2E2)'
                                : 'linear-gradient(180deg, #6EE7B7, #D1FAE5)',
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      </div>
                      <span className="chart-day">{d.day}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Activity Log */}
              <section className="card-panel">
                <div className="panel-header">
                  <h4>Admin Activity Log</h4>
                </div>
                <div className="log-list">
                  {activityLog.map((log, i) => (
                    <div className="log-item" key={i}>
                      <div className="log-avatar" style={{ background: log.bg }}>{log.initial}</div>
                      <div>
                        <div className="log-text"><strong>{log.name}</strong> {log.action}</div>
                        <div className="log-time">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="view-all-btn">View All Logs</div>
              </section>
            </div>

            {/* Recently Published Novels */}
            <section className="card-panel">
              <div className="panel-header">
                <h4>Recently Published Novels <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>(Live)</span></h4>
                <span className="panel-link">View All</span>
              </div>
              <div className="novels-table-wrap">
                <table className="novels-table">
                  <thead>
                    <tr>
                      <th>Novel Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {novels.map((novel, i) => (
                      <tr key={i}>
                        <td>
                          <div className="novel-title-cell">
                            <span className="live-dot" />
                            <span style={{ fontWeight: 600 }}>{novel.title}</span>
                          </div>
                        </td>
                        <td style={{ color: '#475569' }}>{novel.author}</td>
                        <td style={{ color: '#475569' }}>{novel.category}</td>
                        <td>
                          <span className={`status-badge badge-${novel.status.toLowerCase()}`}>
                            {novel.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
