import React, { useEffect, useMemo, useState } from 'react';

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

  .shadow-mall-admin {
    min-height: 100vh;
    background: var(--shadow-mall-bg);
    color: var(--shadow-mall-text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 28px;
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
      </div>
    </>
  );
}
