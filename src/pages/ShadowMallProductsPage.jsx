import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --shadow-mall-bg: #F8FAFC;
    --shadow-mall-card: #FFFFFF;
    --shadow-mall-text: #0F172A;
    --shadow-mall-muted: #64748B;
    --shadow-mall-border: #E2E8F0;
    --shadow-mall-soft: #F1F5F9;
    --shadow-mall-primary: #4F46E5;
    --shadow-mall-primary-soft: #EEF2FF;
    --shadow-mall-success: #10B981;
    --shadow-mall-success-soft: #D1FAE5;
    --shadow-mall-warning: #F59E0B;
    --shadow-mall-warning-soft: #FEF3C7;
    --shadow-mall-danger: #EF4444;
    --shadow-mall-danger-soft: #FEE2E2;
  }

  * { box-sizing: border-box; }

  .dashboard-wrapper {
    display: flex;
    height: 100vh;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--shadow-mall-bg);
    color: var(--shadow-mall-text);
    overflow: hidden;
  }

  .sidebar {
    width: 80px;
    background: #fff;
    border-right: 1px solid var(--shadow-mall-border);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }

  .sidebar:hover {
    width: 260px;
    box-shadow: 10px 0 30px rgba(15,23,42,0.05);
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
    font-weight: 800;
    color: var(--shadow-mall-primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover .logo-text { opacity: 1; }

  .nav-group-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--shadow-mall-muted);
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
    color: var(--shadow-mall-muted);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;
    white-space: nowrap;
    font-size: 14px;
  }

  .nav-item:hover, .nav-item.active {
    background: var(--shadow-mall-primary-soft);
    color: var(--shadow-mall-primary);
  }

  .nav-text {
    margin-left: 14px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sidebar:hover .nav-text { opacity: 1; }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .admin-topbar {
    height: 70px;
    background: #fff;
    border-bottom: 1px solid var(--shadow-mall-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .admin-topbar h2 {
    font-size: 17px;
    font-weight: 800;
    color: var(--shadow-mall-text);
    margin: 0;
  }

  .content-body {
    padding: 28px 36px 48px;
  }


  .shadow-mall-admin {
    background: transparent;
    color: var(--shadow-mall-text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .shadow-mall-shell {
    max-width: 1280px;
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
    background: var(--shadow-mall-primary-soft);
    color: var(--shadow-mall-primary);
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .shadow-mall-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .shadow-mall-subtitle {
    margin: 8px 0 0;
    color: var(--shadow-mall-muted);
    font-size: 13px;
    font-weight: 500;
  }

  .shadow-mall-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shadow-mall-refresh {
    border: 1px solid var(--shadow-mall-border);
    background: #fff;
    color: var(--shadow-mall-text);
    height: 42px;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .shadow-mall-refresh:hover {
    background: var(--shadow-mall-soft);
  }

  .shadow-mall-grid {
    display: grid;
    grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .shadow-mall-card {
    background: var(--shadow-mall-card);
    border: 1px solid var(--shadow-mall-border);
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .shadow-mall-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid var(--shadow-mall-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .shadow-mall-card-title {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .shadow-mall-card-note {
    margin: 4px 0 0;
    color: var(--shadow-mall-muted);
    font-size: 12px;
    font-weight: 500;
  }

  .shadow-mall-form {
    padding: 20px 22px 22px;
  }

  .shadow-mall-message {
    margin-bottom: 16px;
    border-radius: 16px;
    border: 1px solid var(--shadow-mall-border);
    background: var(--shadow-mall-soft);
    padding: 12px 14px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
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
    font-weight: 800;
  }

  .shadow-mall-input,
  .shadow-mall-select,
  .shadow-mall-textarea {
    width: 100%;
    border: 1px solid var(--shadow-mall-border);
    background: #fff;
    color: var(--shadow-mall-text);
    border-radius: 14px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    transition: border-color 0.15s, box-shadow 0.15s;
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
    border-color: var(--shadow-mall-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .shadow-mall-preview {
    width: 100%;
    min-height: 150px;
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    background: var(--shadow-mall-soft);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 14px;
  }

  .shadow-mall-preview img {
    width: 100%;
    height: 210px;
    object-fit: cover;
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
    background: var(--shadow-mall-soft);
    border-radius: 14px;
    padding: 12px 10px;
    font-size: 12px;
    font-weight: 800;
    color: #334155;
    cursor: pointer;
  }

  .shadow-mall-check input {
    accent-color: var(--shadow-mall-primary);
  }

  .shadow-mall-save {
    width: 100%;
    height: 48px;
    border: 0;
    border-radius: 16px;
    background: var(--shadow-mall-primary);
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
  }

  .shadow-mall-save:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .shadow-mall-new {
    border: 0;
    background: var(--shadow-mall-soft);
    color: #475569;
    border-radius: 999px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .shadow-mall-list-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .shadow-mall-filter {
    height: 40px;
    border: 1px solid var(--shadow-mall-border);
    border-radius: 14px;
    padding: 0 12px;
    background: #fff;
    color: #334155;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .shadow-mall-list {
    min-height: 360px;
  }

  .shadow-mall-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 800;
  }

  .shadow-mall-row {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    align-items: center;
  }

  .shadow-mall-row:last-child {
    border-bottom: none;
  }

  .shadow-mall-cover {
    width: 76px;
    height: 102px;
    border-radius: 15px;
    overflow: hidden;
    background: var(--shadow-mall-soft);
  }

  .shadow-mall-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .shadow-mall-book-main {
    min-width: 0;
  }

  .shadow-mall-book-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }

  .shadow-mall-book-title {
    font-size: 14px;
    font-weight: 800;
    color: var(--shadow-mall-text);
  }

  .shadow-mall-book-author {
    color: var(--shadow-mall-muted);
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
    font-weight: 800;
  }

  .shadow-mall-old-price {
    color: #94A3B8;
    text-decoration: line-through;
  }

  .shadow-mall-pill {
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 10px;
    font-weight: 800;
  }

  .shadow-mall-pill.category {
    background: var(--shadow-mall-soft);
    color: #475569;
  }

  .shadow-mall-pill.stock-in_stock {
    background: var(--shadow-mall-success-soft);
    color: #047857;
  }

  .shadow-mall-pill.stock-sold_out {
    background: #F1F5F9;
    color: #64748B;
  }

  .shadow-mall-pill.stock-pre_order {
    background: var(--shadow-mall-warning-soft);
    color: #B45309;
  }

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
    font-weight: 800;
    cursor: pointer;
  }

  .shadow-mall-action.edit {
    background: var(--shadow-mall-primary-soft);
    color: var(--shadow-mall-primary);
  }

  .shadow-mall-action.delete {
    background: var(--shadow-mall-danger-soft);
    color: var(--shadow-mall-danger);
  }

  @media (max-width: 980px) {
    .shadow-mall-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .shadow-mall-admin {
      padding: 18px;
    }

    .shadow-mall-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .shadow-mall-field-grid,
    .shadow-mall-checks {
      grid-template-columns: 1fr;
    }

    .shadow-mall-row {
      grid-template-columns: 64px 1fr;
    }

    .shadow-mall-cover {
      width: 64px;
      height: 88px;
    }

    .shadow-mall-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
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

export default function ShadowMallProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'best_seller') return products.filter((product) => product.is_best_seller);
    if (filter === 'discount') return products.filter((product) => product.is_discount);
    if (filter === 'sold_out') return products.filter((product) => product.stock_status === 'sold_out');
    return products.filter((product) => product.category === filter);
  }, [products, filter]);

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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      title: product.title || '',
      author_name: product.author_name || '',
      cover_url: product.cover_url || '',
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
          <header className="admin-topbar">
            <h2>Shadow Mall</h2>
          </header>
          <main className="content-body">
            <div className="shadow-mall-admin">
              <div className="shadow-mall-shell">
          <div className="shadow-mall-header">
            <div>
              <div className="shadow-mall-kicker">📚 Shadow Mall Products</div>
              <h1 className="shadow-mall-title">Shadow Mall</h1>
              <p className="shadow-mall-subtitle">
                Manage real printed books, second hand books, pre-orders, stock, and prices.
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
                  <span className="shadow-mall-label">Cover image URL</span>
                  <input
                    value={form.cover_url}
                    onChange={(event) => updateField('cover_url', event.target.value)}
                    className="shadow-mall-input"
                    placeholder="https://..."
                  />
                </label>

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
                  filteredProducts.map((product) => (
                    <div key={product.id} className="shadow-mall-row">
                      <div className="shadow-mall-cover">
                        {product.cover_url ? <img src={product.cover_url} alt={product.title} /> : null}
                      </div>

                      <div className="shadow-mall-book-main">
                        <div className="shadow-mall-book-top">
                          <span className="shadow-mall-book-title">{product.title}</span>
                          <span className="shadow-mall-pill category">{getCategoryLabel(product.category)}</span>
                          <span className={`shadow-mall-pill stock-${product.stock_status}`}>{getStatusLabel(product.stock_status)}</span>
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
                  ))
                ) : (
                  <div className="shadow-mall-empty">No products yet.</div>
                )}
              </div>
            </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
