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

  .shadow-mall-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .shadow-mall-kicker {
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

  .shadow-mall-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .shadow-mall-subtitle {
    margin-top: 8px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
  }

  .shadow-mall-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shadow-mall-refresh {
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

  .shadow-mall-refresh:hover { background: var(--bg); }

  .shadow-mall-grid {
    display: grid;
    grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .shadow-mall-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .shadow-mall-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .shadow-mall-card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .shadow-mall-card-note {
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
  }

  .shadow-mall-form { padding: 20px 22px 22px; }

  .shadow-mall-message {
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

  .shadow-mall-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .shadow-mall-field {
    display: block;
    margin-bottom: 13px;
  }

  .shadow-mall-label {
    display: block;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .shadow-mall-help {
    color: var(--muted);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
    margin: -5px 0 8px;
  }

  .shadow-mall-input,
  .shadow-mall-select,
  .shadow-mall-textarea {
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

  .shadow-mall-input,
  .shadow-mall-select {
    height: 44px;
    padding: 0 12px;
  }

  .shadow-mall-textarea {
    min-height: 94px;
    padding: 12px;
    resize: vertical;
  }

  .shadow-mall-input:focus,
  .shadow-mall-select:focus,
  .shadow-mall-textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .shadow-mall-preview {
    width: 100%;
    min-height: 150px;
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    background: var(--bg);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 14px;
  }

  .shadow-mall-preview img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
  }

  .shadow-mall-gallery-preview {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 4px 0 14px;
    margin-bottom: 10px;
  }

  .shadow-mall-gallery-preview::-webkit-scrollbar { height: 5px; }
  .shadow-mall-gallery-preview::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }

  .shadow-mall-gallery-card {
    width: 82px;
    height: 118px;
    border-radius: 15px;
    overflow: hidden;
    background: var(--bg);
    border: 1px solid var(--border);
    flex: 0 0 auto;
    position: relative;
  }

  .shadow-mall-gallery-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .shadow-mall-gallery-number {
    position: absolute;
    top: 6px;
    left: 6px;
    background: rgba(15, 23, 42, .74);
    color: #fff;
    border-radius: 999px;
    padding: 3px 6px;
    font-size: 10px;
    font-weight: 900;
  }

  .shadow-mall-video-preview {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: #0F172A;
    margin: 0 0 14px;
    aspect-ratio: 16 / 9;
  }

  .shadow-mall-video-preview iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  .shadow-mall-checks {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 4px 0 16px;
  }

  .shadow-mall-check {
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

  .shadow-mall-check input { accent-color: var(--primary); }

  .shadow-mall-save {
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

  .shadow-mall-save:disabled { opacity: .55; cursor: not-allowed; }

  .shadow-mall-new {
    border: 0;
    background: var(--bg);
    color: #475569;
    border-radius: 999px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .shadow-mall-list-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shadow-mall-filter {
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

  .shadow-mall-list { min-height: 360px; }

  .shadow-mall-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .shadow-mall-row {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    align-items: center;
  }

  .shadow-mall-row:last-child { border-bottom: none; }

  .shadow-mall-cover {
    width: 76px;
    height: 102px;
    border-radius: 15px;
    overflow: hidden;
    background: var(--bg);
  }

  .shadow-mall-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .shadow-mall-book-main { min-width: 0; }

  .shadow-mall-book-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }

  .shadow-mall-book-title {
    font-size: 14px;
    font-weight: 900;
    color: var(--text);
  }

  .shadow-mall-book-author {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .shadow-mall-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .shadow-mall-old-price {
    color: #94A3B8;
    text-decoration: line-through;
  }

  .shadow-mall-pill {
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .shadow-mall-pill.category { background: var(--bg); color: #475569; }
  .shadow-mall-pill.stock-in_stock { background: var(--success-light); color: #047857; }
  .shadow-mall-pill.stock-sold_out { background: #F1F5F9; color: #64748B; }
  .shadow-mall-pill.stock-pre_order { background: var(--warning-light); color: #B45309; }
  .shadow-mall-pill.media { background: #F3E8FF; color: #7E22CE; }

  .shadow-mall-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .shadow-mall-action {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .shadow-mall-action.edit { background: var(--primary-light); color: var(--primary); }
  .shadow-mall-action.delete { background: var(--danger-light); color: var(--danger); }

  @media (max-width: 1200px) {
    .shadow-mall-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 740px) {
    .content-body { padding: 22px 16px 40px; }
    .header { padding: 0 18px; }
    .shadow-mall-header { align-items: flex-start; flex-direction: column; }
    .shadow-mall-field-grid, .shadow-mall-checks { grid-template-columns: 1fr; }
    .shadow-mall-row { grid-template-columns: 64px 1fr; }
    .shadow-mall-cover { width: 64px; height: 88px; }
    .shadow-mall-actions { grid-column: 1 / -1; justify-content: flex-end; }
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
  cover_url: '',
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
  if (Array.isArray(value)) return [...value, '', '', '', '', ''].slice(0, 5);
  if (!value) return ['', '', '', '', ''];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return [...parsed, '', '', '', '', ''].slice(0, 5);
  } catch {}

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .concat(['', '', '', '', ''])
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
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const imageInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'best_seller') return products.filter((product) => product.is_best_seller);
    if (filter === 'discount') return products.filter((product) => product.is_discount);
    if (filter === 'sold_out') return products.filter((product) => product.stock_status === 'sold_out');
    return products.filter((product) => product.category === filter);
  }, [products, filter]);

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

  function handleImageUpload(event) {
  const files = Array.from(event.target.files || []).slice(0, 5);
  const previews = files.map((file) => URL.createObjectURL(file));

  setSelectedImages(files);
  setImagePreviews(previews);
}

function resetForm() {
  setForm(emptyForm);
  setEditingId(null);
  setMessage('');
  setSelectedImages([]);
  setImagePreviews([]);

  if (imageInputRef.current) {
    imageInputRef.current.value = '';
  }
}

  if (imageInputRef.current) {
    imageInputRef.current.value = '';
  }
}

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      setSelectedImages([]);
      setImagePreviews([]);
      title: product.title || '',
      author_name: product.author_name || '',
      cover_url: product.cover_url || '',
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
      const payload = {
        ...form,
        youtube_url: form.youtube_url.trim(),
        price_usd: form.price_usd === '' ? 0 : Number(form.price_usd),
        old_price_usd: form.old_price_usd === '' ? null : Number(form.old_price_usd),
        stock_quantity: form.stock_quantity === '' ? 0 : Number(form.stock_quantity),
        sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
      };

      const url = editingId
        ? `${API_URL}/api/shadow-mall/products/${editingId}`
        : `${API_URL}/api/shadow-mall/products`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
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
            <div className="shadow-mall-header">
              <div>
                <div className="shadow-mall-kicker">📚 Shadow Mall Products</div>
                <h1 className="shadow-mall-title">Shadow Mall</h1>
                <p className="shadow-mall-subtitle">
                  Manage real printed books, second hand books, pre-orders, stock, prices, images, and YouTube previews.
                </p>
              </div>

              <div className="shadow-mall-header-actions">
                <button type="button" className="shadow-mall-refresh" onClick={fetchProducts}>
                  Refresh
                </button>
              </div>
            </div>

            <div className="shadow-mall-grid">
              <form onSubmit={handleSubmit} className="shadow-mall-card">
                <div className="shadow-mall-card-head">
                  <div>
                    <h2 className="shadow-mall-card-title">{editingId ? 'Edit Book' : 'Add Book'}</h2>
                    <p className="shadow-mall-card-note">Add one Shadow Mall book record.</p>
                  </div>

                  {editingId ? (
                    <button type="button" className="shadow-mall-new" onClick={resetForm}>
                      New
                    </button>
                  ) : null}
                </div>

                <div className="shadow-mall-form">
                  {form.cover_url ? (
                    <div className="shadow-mall-preview">
                      <img src={form.cover_url} alt="Book preview" />
                    </div>
                  ) : (
                    <div className="shadow-mall-preview">Cover preview</div>
                  )}

                  {message ? <div className="shadow-mall-message">{message}</div> : null}

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">Book title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateField('title', event.target.value)}
                      className="shadow-mall-input"
                      placeholder="Book title"
                    />
                  </label>

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">Author name</span>
                    <input
                      value={form.author_name}
                      onChange={(event) => updateField('author_name', event.target.value)}
                      className="shadow-mall-input"
                      placeholder="Author name"
                    />
                  </label>

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">Main cover image URL</span>
                    <input
                      value={form.cover_url}
                      onChange={(event) => updateField('cover_url', event.target.value)}
                      className="shadow-mall-input"
                      placeholder="https://..."
                    />
                  </label>

                    {[0, 1, 2, 3, 4].map((index) => (
                      <label className="shadow-mall-field" key={index}>
                        <span className="shadow-mall-label">Image {index + 1}</span>
                        <input
                          value={form.gallery_image_urls[index] || ''}
                          onChange={(event) => updateGalleryImage(index, event.target.value)}
                          className="shadow-mall-input"
                          placeholder={`Vertical image URL ${index + 1}`}
                        />
                      </label>
                    ))}
                  </div>

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">YouTube video link or embed URL</span>
                    <p className="shadow-mall-help">
                      Paste a normal YouTube link, Shorts link, youtu.be link, or embed link. Reader can watch inside your website.
                    </p>
                    <input
                      value={form.youtube_url}
                      onChange={(event) => updateField('youtube_url', event.target.value)}
                      className="shadow-mall-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </label>

                  {youtubeEmbedUrl ? (
                    <div className="shadow-mall-video-preview">
                      <iframe
                        src={youtubeEmbedUrl}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  <div className="shadow-mall-field-grid">
                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Category</span>
                      <select
                        value={form.category}
                        onChange={(event) => updateField('category', event.target.value)}
                        className="shadow-mall-select"
                      >
                        <option value="new_books">New Books</option>
                        <option value="second_hand">Second Hand</option>
                        <option value="pre_order">Pre-order</option>
                      </select>
                    </label>

                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Stock status</span>
                      <select
                        value={form.stock_status}
                        onChange={(event) => updateField('stock_status', event.target.value)}
                        className="shadow-mall-select"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="sold_out">Sold Out</option>
                        <option value="pre_order">Pre-order</option>
                      </select>
                    </label>
                  </div>

                  <div className="shadow-mall-field-grid">
                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Price USD</span>
                      <input
                        type="number"
                        step="0.01"
                        value={form.price_usd}
                        onChange={(event) => updateField('price_usd', event.target.value)}
                        className="shadow-mall-input"
                        placeholder="8.75"
                      />
                    </label>

                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Old price</span>
                      <input
                        type="number"
                        step="0.01"
                        value={form.old_price_usd}
                        onChange={(event) => updateField('old_price_usd', event.target.value)}
                        className="shadow-mall-input"
                        placeholder="Leave empty if no discount"
                      />
                    </label>
                  </div>

                  <div className="shadow-mall-field-grid">
                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Stock quantity</span>
                      <input
                        type="number"
                        value={form.stock_quantity}
                        onChange={(event) => updateField('stock_quantity', event.target.value)}
                        className="shadow-mall-input"
                        placeholder="0"
                      />
                    </label>

                    <label className="shadow-mall-field">
                      <span className="shadow-mall-label">Sort order</span>
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(event) => updateField('sort_order', event.target.value)}
                        className="shadow-mall-input"
                        placeholder="0"
                      />
                    </label>
                  </div>

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">Condition label</span>
                    <input
                      value={form.condition_label}
                      onChange={(event) => updateField('condition_label', event.target.value)}
                      className="shadow-mall-input"
                      placeholder="Like new, good, fair..."
                    />
                  </label>

                  <label className="shadow-mall-field">
                    <span className="shadow-mall-label">Description</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      className="shadow-mall-textarea"
                      placeholder="Book details"
                    />
                  </label>

                  <div className="shadow-mall-checks">
                    <label className="shadow-mall-check">
                      <input
                        type="checkbox"
                        checked={form.is_best_seller}
                        onChange={(event) => updateField('is_best_seller', event.target.checked)}
                      />
                      Best seller
                    </label>

                    <label className="shadow-mall-check">
                      <input
                        type="checkbox"
                        checked={form.is_discount}
                        onChange={(event) => updateField('is_discount', event.target.checked)}
                      />
                      Discount
                    </label>

                    <label className="shadow-mall-check">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(event) => updateField('is_active', event.target.checked)}
                      />
                      Active
                    </label>
                  </div>

                  <button type="submit" disabled={saving} className="shadow-mall-save">
                    {saving ? 'Saving...' : editingId ? 'Update Book' : 'Create Book'}
                  </button>
                </div>
              </form>

              <section className="shadow-mall-card">
                <div className="shadow-mall-card-head">
                  <div>
                    <h2 className="shadow-mall-card-title">Book Records</h2>
                    <p className="shadow-mall-card-note">{products.length} total records</p>
                  </div>

                  <div className="shadow-mall-list-toolbar">
                    <select value={filter} onChange={(event) => setFilter(event.target.value)} className="shadow-mall-filter">
                      <option value="all">All</option>
                      <option value="new_books">New Books</option>
                      <option value="second_hand">Second Hand</option>
                      <option value="pre_order">Pre-order</option>
                      <option value="best_seller">Best Seller</option>
                      <option value="discount">Discount</option>
                      <option value="sold_out">Sold Out</option>
                    </select>
                  </div>
                </div>

                <div className="shadow-mall-list">
                  {loading ? (
                    <div className="shadow-mall-empty">Loading products...</div>
                  ) : filteredProducts.length ? (
                    filteredProducts.map((product) => {
                      const galleryCount = normalizeGallery(product.gallery_image_urls).filter(Boolean).length;
                      const hasVideo = Boolean(product.youtube_url || product.video_url);

                      return (
                        <div key={product.id} className="shadow-mall-row">
                          <div className="shadow-mall-cover">
                            {product.cover_url ? <img src={product.cover_url} alt={product.title} /> : null}
                          </div>

                          <div className="shadow-mall-book-main">
                            <div className="shadow-mall-book-top">
                              <span className="shadow-mall-book-title">{product.title}</span>
                              <span className="shadow-mall-pill category">{getCategoryLabel(product.category)}</span>
                              <span className={`shadow-mall-pill stock-${product.stock_status}`}>{getStatusLabel(product.stock_status)}</span>
                              {galleryCount ? <span className="shadow-mall-pill media">{galleryCount} photos</span> : null}
                              {hasVideo ? <span className="shadow-mall-pill media">Video</span> : null}
                            </div>

                            <div className="shadow-mall-book-author">{product.author_name}</div>

                            <div className="shadow-mall-meta">
                              <span>{formatPrice(product.price_usd)}</span>
                              {product.old_price_usd ? <span className="shadow-mall-old-price">{formatPrice(product.old_price_usd)}</span> : null}
                              <span>Stock: {product.stock_quantity}</span>
                              {product.is_best_seller ? <span>Best Seller</span> : null}
                              {product.is_discount ? <span>Discount</span> : null}
                            </div>
                          </div>

                          <div className="shadow-mall-actions">
                            <button type="button" onClick={() => startEdit(product)} className="shadow-mall-action edit">
                              Edit
                            </button>

                            <button type="button" onClick={() => handleDelete(product.id)} className="shadow-mall-action delete">
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="shadow-mall-empty">No products yet.</div>
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
