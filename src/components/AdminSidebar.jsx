import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebarSearch from './AdminSidebarSearch';
import { filterAdminNavSections } from './adminSidebarPermissions';

const sidebarStyles = `
  .admin-main-sidebar {
    width: 80px;
    height: 100vh;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px 14px;
    background: #FFFFFF;
    border-right: 1px solid #E2E8F0;
    transition: width 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }

  .admin-main-sidebar:hover {
    width: 270px;
    box-shadow: 10px 0 30px rgba(15, 23, 42, 0.06);
  }

  .admin-main-sidebar::-webkit-scrollbar {
    width: 0;
  }

  .admin-main-sidebar-logo {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 10px;
    margin-bottom: 24px;
    color: #4F46E5;
  }

  .admin-main-sidebar-logo-text {
    opacity: 0;
    white-space: nowrap;
    font-size: 18px;
    font-weight: 800;
    transition: opacity 0.2s ease;
  }

  .admin-main-sidebar:hover .admin-main-sidebar-logo-text,
  .admin-main-sidebar:hover .admin-main-sidebar-label,
  .admin-main-sidebar:hover .admin-main-sidebar-text {
    opacity: 1;
  }

  .admin-main-sidebar-label {
    display: block;
    opacity: 0;
    margin: 18px 0 8px 12px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }

  .admin-main-sidebar-item {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin-bottom: 2px;
    border: 0;
    border-radius: 11px;
    background: transparent;
    color: #64748B;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .admin-main-sidebar-item:hover,
  .admin-main-sidebar-item.active {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .admin-main-sidebar-text {
    opacity: 0;
    margin-left: 14px;
    transition: opacity 0.2s ease;
  }

  .admin-main-sidebar-mobile-button,
  .admin-main-sidebar-backdrop {
    display: none;
  }

  @media (max-width: 760px) {
    .dashboard-wrapper > .main-content > header,
    .report-shell > .report-main > header,
    .shadow-admin-shell > .shadow-admin-main > header {
      padding-left: 70px !important;
    }

    .admin-main-sidebar-mobile-button {
      width: 42px;
      height: 42px;
      position: fixed;
      top: 13px;
      left: 13px;
      z-index: 1202;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #E2E8F0;
      border-radius: 13px;
      background: #FFFFFF;
      color: #0F172A;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      cursor: pointer;
    }

    .admin-main-sidebar-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1198;
      display: block;
      border: 0;
      background: rgba(15, 23, 42, 0.44);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.22s ease, visibility 0.22s ease;
    }

    .admin-main-sidebar-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .admin-main-sidebar {
      width: min(84vw, 280px);
      height: 100dvh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1200;
      padding: 16px 12px 24px;
      transform: translateX(-100%);
      box-shadow: 14px 0 36px rgba(15, 23, 42, 0.16);
    }

    .admin-main-sidebar.open {
      transform: translateX(0);
    }

    .admin-main-sidebar:hover {
      width: min(84vw, 280px);
    }

    .admin-main-sidebar-logo {
      padding-left: 52px;
      margin-bottom: 18px;
    }

    .admin-main-sidebar-logo-text,
    .admin-main-sidebar-label,
    .admin-main-sidebar-text,
    .admin-main-sidebar:hover .admin-main-sidebar-logo-text,
    .admin-main-sidebar:hover .admin-main-sidebar-label,
    .admin-main-sidebar:hover .admin-main-sidebar-text {
      opacity: 1;
    }

    .admin-main-sidebar-item {
      min-height: 46px;
      padding: 0 13px;
    }
  }
`;

const navSections = [
  {
    label: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
      { path: '/task-center', label: 'Task Center', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
      { path: '/search-insights', label: 'Search Insights', icon: 'M11 3a8 8 0 1 0 4.9 14.3L21 22l1-1-4.7-5.1A8 8 0 0 0 11 3z' },
        ],
  },

  {
  label: 'Event',
  alwaysVisible: true,
  items: [
      { path: '/event', label: 'Event', icon: 'M3 5h18v16H3z M7 3v4 M17 3v4 M3 9h18' },
      { path: '/monthly-vote', label: 'Monthly', icon: 'M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z' },
      { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M18 2H6v7a6 6 0 0 0 12 0V2z' },
    ],
  },

  {
  label: 'Shadow Mall',
  items: [
    { path: '/shadow-mall', label: 'Products', icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6' },
    { path: '/shadow-mall/orders', label: 'Orders', icon: 'M6 2h12l2 5H4l2-5z M5 7v15h14V7 M9 11h6' },
    { path: '/admin/orders/new', label: 'New Orders', icon: 'M3 3h18v18H3z M7 7h10 M7 12h6 M7 17h8' },
    { path: '/shadow-mall/publishers', label: 'Publishers', icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 10h6 M9 14h6 M9 18h6' },
    { path: '/shadow-mall/promotion', label: 'Promotion', icon: 'M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z' },
    { path: '/author-stores', label: 'Author Stores', icon: 'M3 9l2-6h14l2 6 M5 13v8h14v-8 M9 21v-6h6v6 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0' },
    { path: '/author-store/review', label: 'Store Review', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
},
  
  {
    label: 'Content',
    items: [
      { path: '/stories', label: 'Stories', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z' },
      { path: '/readers-today', label: 'Readers Today', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
      { path: '/authors', label: 'Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
      { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
      { path: '/media-library', label: 'Media Library', icon: 'M4 4h16v16H4z M8 8h8M8 12h5M8 16h8' },
    ],
  },
  {
    label: 'Visual & Promotion',
    items: [
      { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
      { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
      { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
      { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
      { path: '/notifications', label: 'Notifications', icon: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
      { path: '/reader-mails', label: 'Reader Mail', icon: 'M4 4h16v16H4z M4 7l8 6 8-6' },
      { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    ],
  },
 
  {
    label: 'Moderation',
    items: [
      { path: '/comments', label: 'Comments', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
      { path: '/comments/trash', label: 'Comment Trash', icon: 'M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v6 M14 11v6' },
      { path: '/reports', label: 'Report Center', icon: 'M4 21V5m0 0h11l-1 4 1 4H4 M4 5V3' },
      { path: '/chat-evidence', label: 'Chat Evidence', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5' },
      { path: '/help-center', label: 'Help Center', icon: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z M9 9a3 3 0 1 1 6 0c0 2-3 2-3 4 M12 17h.01' },
      { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
      { path: '/spam-guard', label: 'Spam Guard', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5' },
    ],
  },
  {
    label: 'Finance & Growth',
    items: [
      { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
      { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
      { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5-5 5 5 M12 5v12' },
      { path: '/history', label: 'History', icon: 'M12 8v4l3 3 M21 12a9 9 0 1 1-3-6.7 M21 3v6h-6' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
      { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
      { path: '/admin-login-guard', label: 'Admin Guard', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5' },
      { path: '/admin/activity-logs', label: 'Activity Logs', icon: 'M3 12a9 9 0 1 0 3-6.7 M3 3v6h6 M12 7v5l3 2' },
    ],
  },
];

const Icon = ({ path, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ minWidth: size, flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const visibleSections = filterAdminNavSections(navSections);
  const allItems = visibleSections.flatMap(section => section.items);
  const activeItem = [...allItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find(item => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 760) setMobileOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    const sidebarScrollRef = useRef(0);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return undefined;

    const key = 'shadow_admin_sidebar_scroll';
    const savedScroll = Number(
      localStorage.getItem(key) || sessionStorage.getItem(key) || 0
    );

    sidebarScrollRef.current = Number.isFinite(savedScroll) ? savedScroll : 0;

    const restoreScroll = () => {
      sidebar.scrollTop = sidebarScrollRef.current;
    };

    restoreScroll();
    const frame = requestAnimationFrame(restoreScroll);

    const saveScroll = () => {
      sidebarScrollRef.current = sidebar.scrollTop;
      localStorage.setItem(key, String(sidebarScrollRef.current));
      sessionStorage.setItem(key, String(sidebarScrollRef.current));
    };

    sidebar.addEventListener('scroll', saveScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      sidebar.removeEventListener('scroll', saveScroll);
    };
  }, []);

  const goToPage = (path) => {
    const key = 'shadow_admin_sidebar_scroll';
    const sidebarScroll = sidebarRef.current?.scrollTop ?? sidebarScrollRef.current;

    sidebarScrollRef.current = sidebarScroll;
    localStorage.setItem(key, String(sidebarScroll));
    sessionStorage.setItem(key, String(sidebarScroll));

    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <style>{sidebarStyles}</style>

      <button
        type="button"
        className="admin-main-sidebar-mobile-button"
        aria-label={mobileOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(current => !current)}
      >
        <Icon
          path={mobileOpen ? 'M6 6l12 12 M18 6L6 18' : 'M4 6h16 M4 12h16 M4 18h16'}
          size={21}
        />
      </button>

      <button
        type="button"
        className={`admin-main-sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        aria-label="Close admin menu"
        onClick={() => setMobileOpen(false)}
      />

      <aside
        ref={sidebarRef}
        className={`admin-main-sidebar ${mobileOpen ? 'open' : ''}`}
        aria-hidden={!mobileOpen && typeof window !== 'undefined' && window.innerWidth <= 760}
      >
        <div className="admin-main-sidebar-logo">
          <Icon path="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" size={22} />
          <span className="admin-main-sidebar-logo-text">Shadow Admin</span>
        </div>
        <AdminSidebarSearch sections={visibleSections} onNavigate={goToPage} />

        {visibleSections.map(section => (
          <React.Fragment key={section.label}>
            <span className="admin-main-sidebar-label">{section.label}</span>
            {section.items.map(item => (
              <button
                key={item.path}
                type="button"
                className={`admin-main-sidebar-item ${activeItem?.path === item.path ? 'active' : ''}`}
                onClick={() => goToPage(item.path)}
              >
                <Icon path={item.icon} />
                <span className="admin-main-sidebar-text">{item.label}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </aside>
    </>
  );
}
