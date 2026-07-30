import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

const styles = `
  :root {
    --shadow-admin-bg: #F8FAFC;
    --shadow-admin-card: #FFFFFF;
    --shadow-admin-primary: #4F46E5;
    --shadow-admin-primary-light: #EEF2FF;
    --shadow-admin-text: #0F172A;
    --shadow-admin-muted: #64748B;
    --shadow-admin-border: #E2E8F0;
    --shadow-admin-sidebar-collapsed: 82px;
    --shadow-admin-sidebar-expanded: 270px;
  }

  * { box-sizing: border-box; }

  .shadow-admin-shell {
    min-height: 100vh;
    display: flex;
    background: var(--shadow-admin-bg);
    color: var(--shadow-admin-text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .shadow-admin-sidebar {
    position: sticky;
    top: 0;
    width: var(--shadow-admin-sidebar-collapsed);
    height: 100vh;
    background: var(--shadow-admin-card);
    border-right: 1px solid var(--shadow-admin-border);
    padding: 18px 13px;
    z-index: 50;
    overflow-y: auto;
    overflow-x: hidden;
    transition: width 0.25s ease, box-shadow 0.25s ease;
  }

  .shadow-admin-sidebar:hover {
    width: var(--shadow-admin-sidebar-expanded);
    box-shadow: 12px 0 30px rgba(15, 23, 42, 0.06);
  }

  .shadow-admin-sidebar::-webkit-scrollbar { width: 0; }

  .shadow-admin-logo {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 10px;
    margin-bottom: 24px;
  }

  .shadow-admin-logo-icon {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: var(--shadow-admin-primary-light);
    color: var(--shadow-admin-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 950;
    flex-shrink: 0;
  }

  .shadow-admin-logo-text {
    font-size: 15px;
    font-weight: 950;
    color: var(--shadow-admin-primary);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .shadow-admin-sidebar:hover .shadow-admin-logo-text { opacity: 1; }

  .shadow-admin-group-label {
    display: block;
    margin: 18px 0 8px 11px;
    color: var(--shadow-admin-muted);
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .shadow-admin-sidebar:hover .shadow-admin-group-label { opacity: 1; }

  .shadow-admin-nav-item {
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: var(--shadow-admin-muted);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 12px;
    margin-bottom: 3px;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    text-align: left;
    white-space: nowrap;
    transition: background 0.16s ease, color 0.16s ease;
  }

  .shadow-admin-nav-item:hover,
  .shadow-admin-nav-item.active {
    background: var(--shadow-admin-primary-light);
    color: var(--shadow-admin-primary);
  }

  .shadow-admin-nav-icon {
    width: 20px;
    height: 20px;
    min-width: 20px;
    flex-shrink: 0;
  }

  .shadow-admin-nav-text {
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .shadow-admin-sidebar:hover .shadow-admin-nav-text { opacity: 1; }

  .shadow-admin-subnav {
    margin: -1px 0 8px 34px;
    display: none;
    flex-direction: column;
    gap: 3px;
  }

  .shadow-admin-sidebar:hover .shadow-admin-subnav { display: flex; }.shadow-admin-nav-item:hover + .shadow-admin-subnav, .shadow-admin-nav-item.active + .shadow-admin-subnav, .shadow-admin-subnav:hover { display: flex; }
  .shadow-admin-subnav-item {
    width: 100%;
    height: 32px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--shadow-admin-muted);
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 850;
    text-align: left;
    padding: 0 12px;
    white-space: nowrap;
  }

  .shadow-admin-subnav-item:hover,
  .shadow-admin-subnav-item.active {
    background: var(--shadow-admin-primary-light);
    color: var(--shadow-admin-primary);
  }

  .shadow-admin-main {
    flex: 1;
    min-width: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .shadow-admin-topbar {
    position: sticky;
    top: 0;
    height: 68px;
    background: rgba(255, 255, 255, 0.94);
    border-bottom: 1px solid var(--shadow-admin-border);
    backdrop-filter: blur(16px);
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 0 30px;
  }

  .shadow-admin-page-title {
    font-size: 18px;
    font-weight: 950;
    color: var(--shadow-admin-text);
    margin: 0;
  }

  .shadow-admin-page-subtitle {
    font-size: 12px;
    font-weight: 700;
    color: var(--shadow-admin-muted);
    margin-top: 3px;
  }

  .shadow-admin-profile {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shadow-admin-avatar {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 950;
  }

  .shadow-admin-content {
    padding: 26px 30px 46px;
  }

.shadow-admin-topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shadow-admin-topbar-icon {
  position: relative;
  width: 38px;
  height: 38px;
  border: 1px solid var(--shadow-admin-border);
  border-radius: 999px;
  background: #FFFFFF;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.shadow-admin-topbar-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: #EF4444;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

  @media (max-width: 900px) {
    .shadow-admin-sidebar {
      width: 70px;
      padding: 14px 9px;
    }

    .shadow-admin-sidebar:hover { width: 235px; }

    .shadow-admin-topbar { padding: 0 16px; }

    .shadow-admin-content { padding: 18px 14px 36px; }

    .shadow-admin-page-title { font-size: 16px; }
  }
`

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      {
        path: '/shadow-mall',
        label: 'Shadow Mall',
        icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6',
        children: [
  { path: '/shadow-mall', label: 'Products' },
  { path: '/shadow-mall/orders', label: 'Review Orders' },
  { path: '/author-store/review', label: 'Author Orders' },
  { path: '/author-stores', label: 'Author Stores' },
  { path: '/shadow-mall/publishers', label: 'Publishers' },
],
      },
      {
  path: '/shadow-exclusive',
  label: 'Shadow Exclusive',
  icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5',
  children: [
    { path: '/shadow-exclusive', label: 'Premium Stories' },
    { path: '/block-list', label: 'Block List' },
  ],
},
      { path: '/authors', label: 'Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
      { path: '/stories', label: 'Stories', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z' },
    ],
  },
  {
    label: 'Visual Media',
    items: [
      { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
      { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
      { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
      { path: '/media-library', label: 'Media Library', icon: 'M4 4h16v16H4z M8 8h8M8 12h5M8 16h8' },
      { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
      { path: '/reader-mails', label: 'Reader Mail', icon: 'M4 4h16v16H4z M4 7l8 6 8-6' },
      { path: '/notifications', label: 'Notifications', icon: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
      { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    ],
  },
  {
    label: 'System Admin',
    items: [
      { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
      { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
      { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
      
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
      { path: '/help-center', label: 'Help Center', icon: 'M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z M9 9a3 3 0 116 0c0 2-3 2-3 4 M12 17h.01' },
      { path: '/comments', label: 'Comments', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    ],
  },
  {
    label: 'Finance & Growth',
    items: [
      { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
      { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
      { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
      { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
    ],
  },
]

function Icon({ d, size = 20 }) {
  return (
    <svg
      className="shadow-admin-nav-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

function isActivePath(currentPath, itemPath) {
  if (itemPath === '/admin') return currentPath === '/admin'
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

function getStoredAdminUser() {
  try {
    return JSON.parse(sessionStorage.getItem('shadow_admin_user') || localStorage.getItem('shadow_admin_user') || '{}')
  } catch {
    return {}
  }
}

export default function AdminLayout({
  title = 'Admin Dashboard',
  subtitle = '',
  children,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [adminUser] = useState(() => getStoredAdminUser())
  const adminName = adminUser.name || adminUser.full_name || adminUser.email || 'Owner'
  const adminRole = adminUser.role === 'admin' ? 'Owner' : adminUser.role || 'Owner'
  const adminMailReplyCount = 0

  return (
    <>
      <style>{styles}</style>

      <div className="shadow-admin-shell">
        <AdminSidebar />

        <div className="shadow-admin-main">
          <header className="shadow-admin-topbar">
            <div>
              <h1 className="shadow-admin-page-title">{title}</h1>
              {subtitle ? <div className="shadow-admin-page-subtitle">{subtitle}</div> : null}
            </div>

          </header>

          <main className="shadow-admin-content">{children}</main>
        </div>
      </div>
    </>
  )
}
