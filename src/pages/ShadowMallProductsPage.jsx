import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

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
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatPrice(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function getStatusLabel(status) {
  if (status === 'sold_out') return 'SOLD OUT'
  if (status === 'pre_order') return 'PRE-ORDER'
  return 'IN STOCK'
}

function getCategoryLabel(category) {
  if (category === 'second_hand') return 'Second Hand'
  if (category === 'pre_order') return 'Pre-order'
  return 'New Books'
}

export default function ShadowMallProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products
    if (filter === 'best_seller') return products.filter((product) => product.is_best_seller)
    if (filter === 'discount') return products.filter((product) => product.is_discount)
    if (filter === 'sold_out') return products.filter((product) => product.stock_status === 'sold_out')
    return products.filter((product) => product.category === filter)
  }, [products, filter])

  async function fetchProducts() {
    try {
      setLoading(true)

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/shadow-mall/products?include_inactive=true&limit=100`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Shadow Mall products')
      }

      setProducts(data.products || [])
    } catch (error) {
      setMessage(error.message || 'Failed to load Shadow Mall products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setMessage('')
  }

  function startEdit(product) {
    setEditingId(product.id)
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
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setMessage('Book title is required.')
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const token = getAdminToken()
      const payload = {
        ...form,
        price_usd: form.price_usd === '' ? 0 : Number(form.price_usd),
        old_price_usd: form.old_price_usd === '' ? null : Number(form.old_price_usd),
        stock_quantity: form.stock_quantity === '' ? 0 : Number(form.stock_quantity),
        sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
      }

      const url = editingId
        ? `${API_URL}/api/shadow-mall/products/${editingId}`
        : `${API_URL}/api/shadow-mall/products`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save product')
      }

      setMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.')
      resetForm()
      fetchProducts()
    } catch (error) {
      setMessage(error.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this Shadow Mall product?')
    if (!confirmed) return

    try {
      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/shadow-mall/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete product')
      }

      setMessage('Product deleted successfully.')
      fetchProducts()
    } catch (error) {
      setMessage(error.message || 'Failed to delete product')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-6 font-sans text-[#0f172a]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold tracking-tight">Shadow Mall</h1>
          <p className="mt-1 text-[13px] font-medium text-[#64748b]">
            Manage real printed books, second hand books, pre-orders, stock, and prices.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-[#e2e8f0]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-extrabold">{editingId ? 'Edit Book' : 'Add Book'}</h2>
                <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                  Add one Shadow Mall book record.
                </p>
              </div>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full bg-[#f1f5f9] px-3 py-2 text-[12px] font-extrabold text-[#475569]"
                >
                  New
                </button>
              ) : null}
            </div>

            {message ? (
              <div className="mb-4 rounded-[16px] bg-[#f8fafc] px-4 py-3 text-[12px] font-bold text-[#334155] ring-1 ring-[#e2e8f0]">
                {message}
              </div>
            ) : null}

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Book title</span>
                <input
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  placeholder="Book title"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Author name</span>
                <input
                  value={form.author_name}
                  onChange={(event) => updateField('author_name', event.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  placeholder="Author name"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Cover image URL</span>
                <input
                  value={form.cover_url}
                  onChange={(event) => updateField('cover_url', event.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  placeholder="https://..."
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateField('category', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  >
                    <option value="new_books">New Books</option>
                    <option value="second_hand">Second Hand</option>
                    <option value="pre_order">Pre-order</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Stock status</span>
                  <select
                    value={form.stock_status}
                    onChange={(event) => updateField('stock_status', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="sold_out">Sold Out</option>
                    <option value="pre_order">Pre-order</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Price USD</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price_usd}
                    onChange={(event) => updateField('price_usd', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                    placeholder="8.75"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Old price</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.old_price_usd}
                    onChange={(event) => updateField('old_price_usd', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                    placeholder="Leave empty if no discount"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Stock quantity</span>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(event) => updateField('stock_quantity', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                    placeholder="0"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Sort order</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => updateField('sort_order', event.target.value)}
                    className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                    placeholder="0"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Condition label</span>
                <input
                  value={form.condition_label}
                  onChange={(event) => updateField('condition_label', event.target.value)}
                  className="h-11 w-full rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  placeholder="Like new, good, fair..."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-extrabold text-[#334155]">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="min-h-[90px] w-full rounded-[14px] border border-[#e2e8f0] px-3 py-3 text-[13px] font-semibold outline-none focus:border-[#4f46e5]"
                  placeholder="Book details"
                />
              </label>

              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 rounded-[14px] bg-[#f8fafc] px-3 py-3 text-[12px] font-extrabold text-[#334155]">
                  <input
                    type="checkbox"
                    checked={form.is_best_seller}
                    onChange={(event) => updateField('is_best_seller', event.target.checked)}
                  />
                  Best seller
                </label>

                <label className="flex items-center gap-2 rounded-[14px] bg-[#f8fafc] px-3 py-3 text-[12px] font-extrabold text-[#334155]">
                  <input
                    type="checkbox"
                    checked={form.is_discount}
                    onChange={(event) => updateField('is_discount', event.target.checked)}
                  />
                  Discount
                </label>

                <label className="flex items-center gap-2 rounded-[14px] bg-[#f8fafc] px-3 py-3 text-[12px] font-extrabold text-[#334155]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => updateField('is_active', event.target.checked)}
                  />
                  Active
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-[16px] bg-[#4f46e5] text-[13px] font-extrabold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Book' : 'Create Book'}
              </button>
            </div>
          </form>

          <section className="rounded-[22px] bg-white shadow-sm ring-1 ring-[#e2e8f0]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] p-5">
              <div>
                <h2 className="text-[17px] font-extrabold">Book Records</h2>
                <p className="mt-1 text-[12px] font-medium text-[#64748b]">
                  {products.length} total records
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-10 rounded-[14px] border border-[#e2e8f0] px-3 text-[13px] font-bold outline-none"
              >
                <option value="all">All</option>
                <option value="new_books">New Books</option>
                <option value="second_hand">Second Hand</option>
                <option value="pre_order">Pre-order</option>
                <option value="best_seller">Best Seller</option>
                <option value="discount">Discount</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {loading ? (
                <div className="p-8 text-center text-[13px] font-bold text-[#94a3b8]">Loading products...</div>
              ) : filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="grid gap-4 p-4 md:grid-cols-[72px_1fr_auto]">
                    <div className="h-[96px] w-[72px] overflow-hidden rounded-[14px] bg-[#f1f5f9]">
                      {product.cover_url ? (
                        <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-extrabold text-[#0f172a]">{product.title}</h3>
                        <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[10px] font-extrabold text-[#475569]">
                          {getCategoryLabel(product.category)}
                        </span>
                        <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-extrabold text-[#047857]">
                          {getStatusLabel(product.stock_status)}
                        </span>
                      </div>

                      <p className="mt-1 text-[12px] font-semibold text-[#64748b]">{product.author_name}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-bold text-[#334155]">
                        <span>{formatPrice(product.price_usd)}</span>
                        {product.old_price_usd ? <span className="text-[#94a3b8] line-through">{formatPrice(product.old_price_usd)}</span> : null}
                        <span>Stock: {product.stock_quantity}</span>
                        {product.is_best_seller ? <span>Best Seller</span> : null}
                        {product.is_discount ? <span>Discount</span> : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="rounded-[12px] bg-[#eef2ff] px-4 py-2 text-[12px] font-extrabold text-[#4f46e5]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="rounded-[12px] bg-[#fee2e2] px-4 py-2 text-[12px] font-extrabold text-[#ef4444]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[13px] font-bold text-[#94a3b8]">No products yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
