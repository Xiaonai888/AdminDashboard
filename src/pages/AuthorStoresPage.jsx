import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

const styles = `
  .author-stores-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .author-stores-top {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    margin-bottom: 16px;
  }

  .author-stores-kicker {
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 7px 11px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .author-stores-heading {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .author-stores-note {
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    line-height: 1.6;
  }

  .author-stores-toolbar {
    margin-top: 18px;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 120px;
    gap: 10px;
  }

  .author-stores-input {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .author-stores-button {
    border: 0;
    border-radius: 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-stores-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .author-stores-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .author-stores-card-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .author-stores-card-value {
    margin-top: 8px;
    color: #0F172A;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .author-stores-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .author-stores-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .author-stores-panel-title {
    font-size: 16px;
    font-weight: 900;
  }

  .author-stores-count {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .author-stores-message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
  }

  .author-stores-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .author-stores-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .author-stores-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 980px;
  }

  .author-stores-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
    text-align: left;
    padding: 13px 16px;
    border-bottom: 1px solid #E2E8F0;
  }

  .author-stores-table td {
    padding: 15px 16px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align: top;
    color: #0F172A;
    font-size: 13px;
    font-weight: 750;
  }

  .author-stores-table tr:hover td {
    background: #F8FAFC;
  }

  .author-store-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-store-avatar {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 950;
    overflow: hidden;
    flex-shrink: 0;
  }

  .author-store-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .author-store-name {
    font-size: 14px;
    font-weight: 950;
  }

  .author-store-small {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    margin-top: 3px;
    word-break: break-word;
  }

  .author-store-pill {
    display: inline-flex;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .author-store-pill.green {
    background: #DCFCE7;
    color: #15803D;
  }

  .author-store-pill.yellow {
    background: #FEF3C7;
    color: #92400E;
  }

  .author-store-pill.red {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .author-store-action {
    border: 0;
    border-radius: 12px;
    padding: 10px 12px;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-stores-pager {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #E2E8F0;
  }

  .author-stores-page-button {
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-stores-page-button:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .author-store-drawer-layer {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, .38);
    z-index: 200;
    display: flex;
    justify-content: flex-end;
  }

  .author-store-drawer {
    width: min(720px, 100%);
    height: 100%;
    background: #FFFFFF;
    overflow-y: auto;
    box-shadow: -20px 0 50px rgba(15, 23, 42, .18);
    padding: 22px;
  }

  .author-store-drawer-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .author-store-drawer-title {
    font-size: 22px;
    font-weight: 950;
    margin: 0;
    letter-spacing: -0.04em;
  }

  .author-store-close {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    background: #F1F5F9;
    color: #0F172A;
    font-size: 24px;
    cursor: pointer;
  }

  .author-store-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin: 14px 0;
  }

  .author-store-detail-card {
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 13px;
    background: #F8FAFC;
  }

  .author-store-section-title {
    margin: 20px 0 10px;
    font-size: 14px;
    font-weight: 950;
  }

  .author-store-list {
    display: grid;
    gap: 10px;
  }

  .author-store-list-item {
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 12px;
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .author-store-cover {
    width: 54px;
    height: 72px;
    border-radius: 12px;
    background: #EEF2FF;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4F46E5;
    font-weight: 950;
  }

  .author-store-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 900px) {
    .author-stores-page {
      min-width: 0;
    }

    .author-stores-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .author-stores-toolbar {
      grid-template-columns: 1fr;
    }

    .author-store-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .author-stores-table-wrap {
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }
  }

  @media (max-width: 700px) {
    .author-stores-top {
      border-radius: 20px;
      padding: 18px 16px;
    }

    .author-stores-heading {
      font-size: 24px;
      overflow-wrap: anywhere;
    }

    .author-stores-note,
    .author-stores-message,
    .author-store-small {
      overflow-wrap: anywhere;
    }

    .author-stores-input,
    .author-stores-button {
      width: 100%;
      min-width: 0;
      min-height: 42px;
    }

    .author-stores-card {
      min-width: 0;
      padding: 14px;
      border-radius: 18px;
    }

    .author-stores-panel {
      min-width: 0;
      border-radius: 20px;
    }

    .author-stores-panel-head {
      align-items: stretch;
      flex-direction: column;
      padding: 16px;
    }

    .author-stores-count {
      width: 100%;
      text-align: center;
    }

    .author-stores-message {
      margin: 14px 16px 0;
    }

    .author-stores-table {
      min-width: 920px;
    }

    .author-stores-table th,
    .author-stores-table td {
      padding-left: 13px;
      padding-right: 13px;
    }

    .author-store-action {
      min-height: 38px;
      white-space: nowrap;
    }

    .author-stores-pager {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 14px 16px;
    }

    .author-stores-page-button {
      width: 100%;
      min-height: 40px;
    }

    .author-store-drawer {
      width: 100%;
      padding: 18px 16px 30px;
    }

    .author-store-drawer-top > div {
      min-width: 0;
    }

    .author-store-drawer-title {
      font-size: 20px;
      overflow-wrap: anywhere;
    }

    .author-store-close {
      flex-shrink: 0;
    }

    .author-store-list-item {
      grid-template-columns: 54px minmax(0, 1fr);
      align-items: start;
    }

    .author-store-list-item > div:last-child {
      grid-column: 2;
      text-align: left !important;
    }

    .author-store-name {
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 480px) {
    .author-stores-summary {
      grid-template-columns: 1fr;
    }

    .author-store-grid {
      grid-template-columns: 1fr;
    }

    .author-stores-empty {
      padding: 42px 16px;
    }

    .author-store-list-item {
      grid-template-columns: 1fr;
    }

    .author-store-cover {
      width: 72px;
      height: 96px;
    }

    .author-store-list-item > div:last-child {
      grid-column: auto;
    }

    .author-stores-pager {
      grid-template-columns: 1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function clearAdminToken() {
  sessionStorage.removeItem('shadow_admin_token')
  localStorage.removeItem('shadow_admin_token')
  sessionStorage.removeItem('shadow_admin_user')
  localStorage.removeItem('shadow_admin_user')
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusTone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active' || value === 'completed' || value === 'paid') return 'green'
  if (value === 'hidden' || value === 'draft' || value === 'under_review') return 'yellow'
  if (value === 'disabled' || value === 'cancelled' || value === 'rejected') return 'red'
  return ''
}

function StatusPill({ value }) {
  return <span className={`author-store-pill ${getStatusTone(value)}`}>{value || '-'}</span>
}

function SummaryCard({ label, value }) {
  return (
    <div className="author-stores-card">
      <div className="author-stores-card-label">{label}</div>
      <div className="author-stores-card-value">{value}</div>
    </div>
  )
}

function ProductCover({ product }) {
  const cover = product?.cover_url || ''

  return (
    <div className="author-store-cover">
      {cover ? <img src={cover} alt={product?.title || 'Product'} /> : product?.product_type === 'pdf' ? 'PDF' : 'Book'}
    </div>
  )
}

function DetailsDrawer({ selectedStore, details, loading, onClose }) {
  const store = details?.store || selectedStore
  const authorPage = store?.author_page || {}
  const products = details?.products || []
  const orders = details?.orders || []

  return (
    <div className="author-store-drawer-layer" onMouseDown={onClose}>
      <aside className="author-store-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="author-store-drawer-top">
          <div>
            <div className="author-stores-kicker">Author Store Details</div>
            <h2 className="author-store-drawer-title">{authorPage.page_name || 'Author Page'}</h2>
            <div className="author-store-small">@{authorPage.page_username || 'no_username'} · {store?.author_user?.email || 'No email'}</div>
          </div>
          <button type="button" className="author-store-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="author-stores-empty">Loading author store...</div>
        ) : (
          <>
            <div className="author-store-grid">
              <SummaryCard label="Products" value={formatNumber(store?.total_products)} />
              <SummaryCard label="PDF" value={formatNumber(store?.pdf_count)} />
              <SummaryCard label="Books" value={formatNumber(store?.book_count)} />
              <SummaryCard label="Active" value={formatNumber(store?.active_products)} />
              <SummaryCard label="Orders" value={formatNumber(store?.total_orders)} />
              <SummaryCard label="Sales" value={formatMoney(store?.gross_sales_usd)} />
            </div>

            <div className="author-store-section-title">Products</div>
            <div className="author-store-list">
              {products.length ? products.map((product) => (
                <div className="author-store-list-item" key={product.id}>
                  <ProductCover product={product} />
                  <div>
                    <div className="author-store-name">{product.title || 'Untitled Product'}</div>
                    <div className="author-store-small">{product.product_type === 'pdf' ? 'PDF' : 'Book'} · {product.category || '-'}</div>
                    <div className="author-store-small">Created: {formatDate(product.created_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusPill value={product.status} />
                    <div className="author-store-small">{formatMoney(product.sale_price || product.original_price)}</div>
                  </div>
                </div>
              )) : <div className="author-stores-empty">No products found.</div>}
            </div>

            <div className="author-store-section-title">Recent Orders</div>
            <div className="author-store-list">
              {orders.length ? orders.slice(0, 20).map((order) => (
                <div className="author-store-list-item" key={order.id || order.order_id || order.order_number}>
                  <div className="author-store-cover">Order</div>
                  <div>
                    <div className="author-store-name">{order.order_id || order.order_number || order.id}</div>
                    <div className="author-store-small">Created: {formatDate(order.created_at)}</div>
                    <div className="author-store-small">Paid: {formatDate(order.paid_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusPill value={order.status || order.order_status || order.payment_status} />
                    <div className="author-store-small">{formatMoney(order.product_subtotal_usd || order.total_amount_usd || order.total_usd)}</div>
                  </div>
                </div>
              )) : <div className="author-stores-empty">No orders found.</div>}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default function AuthorStoresPage() {
  const navigate = useNavigate()
  const [stores, setStores] = useState([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, has_next: false, has_prev: false, total_pages: 1 })
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const totals = useMemo(() => {
    return stores.reduce((summary, store) => {
      summary.products += Number(store.total_products || 0)
      summary.pdfs += Number(store.pdf_count || 0)
      summary.books += Number(store.book_count || 0)
      summary.sales += Number(store.gross_sales_usd || 0)
      return summary
    }, { products: 0, pdfs: 0, books: 0, sales: 0 })
  }, [stores])

  function handleExpired(response) {
    if (response.status !== 401) return false
    clearAdminToken()
    navigate('/login', { replace: true })
    return true
  }

  async function fetchStores(nextPage = 1) {
    try {
      setLoading(true)
      setMessage('')
      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(PAGE_SIZE),
        q: query.trim(),
      })

      const response = await fetch(`${API_URL}/api/author-store/admin/stores?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (handleExpired(response)) return

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load author stores')
      }

      const sortedStores = (Array.isArray(data.stores) ? data.stores : []).sort((a, b) => {
  const productDiff = Number(b.total_products || 0) - Number(a.total_products || 0)
  if (productDiff !== 0) return productDiff
  return Number(b.gross_sales_usd || 0) - Number(a.gross_sales_usd || 0)
})

setStores(sortedStores)
      setPage(Number(data.page || nextPage))
      setMeta({
        total: Number(data.total || 0),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
        total_pages: Number(data.total_pages || 1),
      })
    } catch (error) {
      setStores([])
      setMessage(error.message || 'Failed to load author stores')
    } finally {
      setLoading(false)
    }
  }

  async function openDetails(store) {
    const authorPageId = store?.author_page?.id

    if (!authorPageId) return

    setSelectedStore(store)
    setDetails(null)

    try {
      setDetailsLoading(true)
      setMessage('')
      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/author-store/admin/stores/${authorPageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (handleExpired(response)) return

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load author store details')
      }

      setDetails(data)
    } catch (error) {
      setMessage(error.message || 'Failed to load author store details')
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    fetchStores(1)
  }, [])

  return (
    <AdminLayout title="Author Stores" subtitle="View Author Pages that sell PDF and Book products.">
      <style>{styles}</style>

      <div className="author-stores-page">
        <section className="author-stores-top">
          <div className="author-stores-kicker">✍️ Author Stores</div>
          <h1 className="author-stores-heading">Author Stores</h1>
          <p className="author-stores-note">
            See which Author Pages have PDFs or books for sale, view product totals, and open one author store for detail.
          </p>

          <div className="author-stores-toolbar">
            <input
              className="author-stores-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search author page, username, owner email..."
              onKeyDown={(event) => {
                if (event.key === 'Enter') fetchStores(1)
              }}
            />
            <button type="button" className="author-stores-button" onClick={() => fetchStores(1)}>
              Search
            </button>
          </div>
        </section>

        <div className="author-stores-summary">
          <SummaryCard label="Shown Stores" value={formatNumber(stores.length)} />
          <SummaryCard label="Products" value={formatNumber(totals.products)} />
          <SummaryCard label="PDFs" value={formatNumber(totals.pdfs)} />
          <SummaryCard label="Books" value={formatNumber(totals.books)} />
        </div>

        <section className="author-stores-panel">
          <div className="author-stores-panel-head">
            <div>
              <div className="author-stores-panel-title">Author Page Stores</div>
              <div className="author-store-small">Total: {formatNumber(meta.total)} · Page {formatNumber(page)} / {formatNumber(meta.total_pages)}</div>
            </div>
            <div className="author-stores-count">{formatMoney(totals.sales)} shown sales</div>
          </div>

          {message ? <div className="author-stores-message">{message}</div> : null}

          {loading ? (
            <div className="author-stores-empty">Loading author stores...</div>
          ) : stores.length ? (
            <div className="author-stores-table-wrap">
              <table className="author-stores-table">
                <thead>
                  <tr>
                    <th>Author Page</th>
                    <th>Owner</th>
                    <th>Products</th>
                    <th>PDF / Book</th>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>Sales</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => {
                    const authorPage = store.author_page || {}
                    const authorUser = store.author_user || {}

                    return (
                      <tr key={authorPage.id}>
                        <td>
                          <div className="author-store-profile">
                            <div className="author-store-avatar">
                              {authorPage.avatar_url ? <img src={authorPage.avatar_url} alt={authorPage.page_name || 'Author'} /> : 'A'}
                            </div>
                            <div>
                              <div className="author-store-name">{authorPage.page_name || 'Author Page'}</div>
                              <div className="author-store-small">@{authorPage.page_username || 'no_username'}</div>
                              <div className="author-store-small">ID: {authorPage.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="author-store-name">{authorUser.name || authorUser.username || '-'}</div>
                          <div className="author-store-small">{authorUser.email || '-'}</div>
                        </td>
                        <td>
                          <div className="author-store-name">{formatNumber(store.total_products)}</div>
                          <div className="author-store-small">Active {formatNumber(store.active_products)} · Hidden {formatNumber(store.hidden_products)} · Draft {formatNumber(store.draft_products)}</div>
                        </td>
                        <td>
                          <div className="author-store-small">PDF: <strong>{formatNumber(store.pdf_count)}</strong></div>
                          <div className="author-store-small">Book: <strong>{formatNumber(store.book_count)}</strong></div>
                        </td>
                        <td>
                          <StatusPill value={authorPage.status} />
                          <div className="author-store-small">Updated: {formatDate(authorPage.updated_at)}</div>
                        </td>
                        <td>
                          <div className="author-store-name">{formatNumber(store.total_orders)}</div>
                          <div className="author-store-small">Paid: {formatNumber(store.paid_orders)}</div>
                        </td>
                        <td>
                          <div className="author-store-name">{formatMoney(store.gross_sales_usd)}</div>
                          <div className="author-store-small">Income: {formatMoney(store.author_income_usd)}</div>
                        </td>
                        <td>
                          <button type="button" className="author-store-action" onClick={() => openDetails(store)}>
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="author-stores-empty">No author stores found.</div>
          )}

          <div className="author-stores-pager">
            <button
              type="button"
              className="author-stores-page-button"
              disabled={!meta.has_prev || loading}
              onClick={() => fetchStores(Math.max(page - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="author-stores-page-button"
              disabled={!meta.has_next || loading}
              onClick={() => fetchStores(page + 1)}
            >
              Next
            </button>
          </div>
        </section>

        {selectedStore ? (
          <DetailsDrawer
            selectedStore={selectedStore}
            details={details}
            loading={detailsLoading}
            onClose={() => {
              setSelectedStore(null)
              setDetails(null)
            }}
          />
        ) : null}
      </div>
    </AdminLayout>
  )
}
