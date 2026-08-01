import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  body {
    margin: 0;
    background: #F8FAFC;
    color: #0F172A;
  }

  .orders-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .orders-body {
    padding: 26px;
    max-width: 1380px;
    margin: 0 auto;
  }

  .orders-top {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    margin-bottom: 16px;
  }

  .orders-kicker {
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 7px 11px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .orders-heading {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .orders-note {
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    line-height: 1.6;
  }

  .tab-row {
    display: flex;
    gap: 10px;
    margin-top: 18px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .tab-button {
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 0 16px;
    background: #FFFFFF;
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .tab-button.active {
    border: 0;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .inner-tabs {
    display: inline-flex;
    gap: 8px;
    padding: 6px;
    background: #F1F5F9;
    border-radius: 16px;
    margin-top: 2px;
  }

  .inner-tab {
    height: 38px;
    border: 0;
    border-radius: 12px;
    padding: 0 16px;
    background: transparent;
    color: #64748B;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .inner-tab.active {
    background: #FFFFFF;
    color: #4F46E5;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  }

  .orders-toolbar {
    margin-top: 18px;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 190px 120px;
    gap: 10px;
  }

  .input,
  .select {
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

  .refresh-button {
    border: 0;
    border-radius: 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .orders-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .orders-card-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .orders-card-title {
    font-size: 16px;
    font-weight: 900;
  }

  .count-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
  }

  .empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .order-row {
    padding: 18px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(250px, .95fr) minmax(270px, 1fr) 170px;
    gap: 16px;
    align-items: start;
  }

  .order-row:last-child {
    border-bottom: 0;
  }

  .order-id {
    font-size: 13px;
    font-weight: 900;
    color: #0F172A;
    word-break: break-word;
  }

  .small {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
    margin-top: 4px;
    word-break: break-word;
  }

  .strong {
    color: #0F172A;
    font-weight: 900;
  }

  .status-pill {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    margin-top: 8px;
  }

  .status-under_review { background: #FEF3C7; color: #92400E; }
  .status-confirmed { background: #DBEAFE; color: #1D4ED8; }
  .status-preparing { background: #F3E8FF; color: #7E22CE; }
  .status-shipped { background: #DCFCE7; color: #15803D; }
  .status-completed { background: #D1FAE5; color: #047857; }
  .status-cancelled,
  .status-rejected,
  .status-amount_mismatch { background: #FEE2E2; color: #B91C1C; }

  .book-list {
    display: grid;
    gap: 8px;
  }

  .book-item {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .book-cover {
    width: 42px;
    height: 58px;
    border-radius: 9px;
    background: #F1F5F9;
    overflow: hidden;
    flex-shrink: 0;
  }

  .book-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .actions {
    display: grid;
    gap: 8px;
  }

  .action-button {
    min-height: 36px;
    border: 0;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    padding: 0 10px;
  }

  .confirm { background: #DBEAFE; color: #1D4ED8; }
  .prepare { background: #F3E8FF; color: #7E22CE; }
  .ship { background: #DCFCE7; color: #15803D; }
  .complete { background: #D1FAE5; color: #047857; }
  .cancel { background: #FEE2E2; color: #B91C1C; }

  .pager {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid #F1F5F9;
  }

  .page-button {
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .page-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  @media (max-width: 1100px) {
    .order-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .actions {
      grid-column: 1 / -1;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .orders-toolbar {
      grid-template-columns: minmax(0, 1fr) 180px 120px;
    }
  }

  @media (max-width: 760px) {
    .orders-page {
      min-width: 0;
    }

    .orders-body {
      min-width: 0;
      padding: 20px 16px 40px;
    }

    .orders-top,
    .orders-card {
      border-radius: 20px;
    }

    .orders-top {
      padding: 18px 16px;
    }

    .orders-heading {
      font-size: 24px;
      overflow-wrap: anywhere;
    }

    .orders-note,
    .message,
    .small,
    .strong,
    .order-id {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .tab-row {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      margin-right: -16px;
      padding-right: 16px;
      padding-bottom: 5px;
      scrollbar-width: none;
    }

    .tab-row::-webkit-scrollbar {
      display: none;
    }

    .tab-button {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .inner-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }

    .inner-tab {
      width: 100%;
      min-width: 0;
      padding: 0 10px;
    }

    .orders-toolbar {
      grid-template-columns: 1fr;
    }

    .input,
    .select,
    .refresh-button {
      width: 100%;
      min-width: 0;
      min-height: 42px;
    }

    .orders-card-head {
      align-items: stretch;
      flex-direction: column;
      padding: 16px;
    }

    .count-pill {
      width: 100%;
      text-align: center;
    }

    .message {
      margin: 14px 16px 0;
    }

    .order-row {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 16px;
    }

    .order-row > div {
      min-width: 0;
    }

    .order-row > div + div {
      padding-top: 13px;
      border-top: 1px solid #EEF2F7;
    }

    .book-item {
      align-items: flex-start;
    }

    .book-item > div:last-child {
      min-width: 0;
    }

    .actions {
      grid-column: auto;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .action-button {
      width: 100%;
      min-height: 40px;
      height: auto;
      padding: 9px 8px;
      line-height: 1.25;
    }

    .pager {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 14px 16px;
    }

    .page-button {
      width: 100%;
      min-height: 40px;
    }

    .empty {
      padding: 42px 16px;
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 480px) {
    .orders-body {
      padding: 18px 13px 34px;
    }

    .orders-top {
      padding: 16px 14px;
    }

    .tab-row {
      margin-right: -14px;
      padding-right: 14px;
    }

    .actions,
    .pager {
      grid-template-columns: 1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatUsd(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ')
}

function getOrderFirstType(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  return String(items[0]?.product_type || items[0]?.type || '').toLowerCase()
}

function BuyerInfo({ buyer }) {
  return (
    <div>
      <div className="strong">Reader</div>
      <div className="small">Name: <span className="strong">{buyer?.name || buyer?.buyer_name || '-'}</span></div>
      <div className="small">Phone: <span className="strong">{buyer?.phone_number || buyer?.buyer_phone || '-'}</span></div>
      {buyer?.telegram_username ? <div className="small">Telegram: <span className="strong">{buyer.telegram_username}</span></div> : null}
      {buyer?.facebook_link ? <div className="small">Facebook: <span className="strong">{buyer.facebook_link}</span></div> : null}
      <div className="small">Province: <span className="strong">{buyer?.province_city || '-'}</span></div>
      <div className="small">Address: <span className="strong">{buyer?.delivery_address || '-'}</span></div>
      {buyer?.delivery_note ? <div className="small">Note: <span className="strong">{buyer.delivery_note}</span></div> : null}
    </div>
  )
}

function ProductsInfo({ items }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <div>
      <div className="strong">Products</div>
      <div className="book-list" style={{ marginTop: 8 }}>
        {safeItems.map((item, index) => (
          <div className="book-item" key={`${item.product_id || item.id || index}`}>
            <div className="book-cover">
              {item.cover_url ? <img src={item.cover_url} alt={item.title || item.product_title || 'Product'} /> : null}
            </div>
            <div>
              <div className="small"><span className="strong">{item.title || item.product_title || 'Product'}</span></div>
              <div className="small">Qty: {item.quantity || 1} · {formatUsd(item.unit_price_usd || item.unit_price)} each</div>
              <div className="small">{String(item.product_type || '').toLowerCase() === 'pdf' ? 'PDF' : 'Book'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MoneyInfo({ order }) {
  const firstType = getOrderFirstType(order)

  return (
    <div>
      <div className="strong">Payment / Income</div>
      <div className="small">Product subtotal: <span className="strong">{formatUsd(order.product_subtotal_usd || order.subtotal_usd || order.subtotal)}</span></div>
      <div className="small">Delivery fee: <span className="strong">{formatUsd(order.delivery_fee_usd || order.delivery_fee || 0)}</span></div>
      <div className="small">Total paid: <span className="strong">{formatUsd(order.total_usd || order.total_amount)}</span></div>
      <div className="small">Platform fee: <span className="strong">{formatUsd(order.platform_fee_usd || 0)}</span></div>
      <div className="small">Author income: <span className="strong">{formatUsd(order.author_income_usd || 0)}</span></div>
      <div className="small">Payment: <span className="strong">{statusLabel(order.payment_status || '-')}</span></div>

      {firstType === 'pdf' ? (
        <>
          <div className="small">PDF access: <span className="strong">{statusLabel(order.pdf_unlock_status || 'pending')}</span></div>
          <div className="small">Unlocked count: <span className="strong">{order.pdf_unlock_count || 0}</span></div>
        </>
      ) : null}

      {firstType === 'book' ? (
        <>
          <div className="small">Telegram: <span className="strong">{statusLabel(order.telegram_status || 'pending')}</span></div>
          {order.telegram_error ? (
            <div className="small">Telegram error: <span className="strong">{order.telegram_error}</span></div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default function AuthorStoreReviewPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [orderType, setOrderType] = useState('pdf')
  const [status, setStatus] = useState('under_review')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const totalText = useMemo(() => `${meta.total || 0} orders`, [meta.total])

  async function fetchOrders(nextPage = page) {
    try {
      setLoading(true)
      setMessage('')

      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '20',
        status,
        type: orderType,
        q: query.trim(),
      })

      const response = await fetch(`${API_URL}/api/author-store/admin/orders?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Author Store orders')
      }

      setOrders(data.orders || [])
      setMeta({
        total: data.total || 0,
        total_pages: data.total_pages || 1,
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
      setPage(nextPage)
    } catch (error) {
      setMessage(error.message || 'Failed to load Author Store orders')
      setOrders([])
      setMeta({ total: 0, total_pages: 1, has_next: false, has_prev: false })
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, nextStatus) {
    let adminNote = ''

    if (nextStatus === 'rejected') {
      adminNote = window.prompt('Reject reason / Admin note:')

      if (adminNote === null) return

      if (!adminNote.trim()) {
        setMessage('Reject reason is required.')
        return
      }
    }

    const confirmText =
      nextStatus === 'confirmed'
        ? `Are you sure you checked the money and want to approve this ${orderType === 'pdf' ? 'PDF' : 'book'} order?`
        : nextStatus === 'rejected'
          ? 'Reject this order? This will not unlock PDF access or notify the author.'
          : `Are you sure you want to mark this order as ${statusLabel(nextStatus)}?`

    if (!window.confirm(confirmText)) return

    try {
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/author-store/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          admin_note: adminNote.trim() || null,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update order')
      }

      setMessage(`Order ${orderId} updated to ${statusLabel(nextStatus)}.`)
      fetchOrders(page)
    } catch (error) {
      setMessage(error.message || 'Failed to update order')
    }
  }

  async function resendTelegram(orderId) {
    if (!window.confirm('Resend Telegram notification to the author group?')) return

    try {
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/author-store/admin/orders/${orderId}/resend-telegram`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to resend Telegram')
      }

      setMessage(`Telegram notification resent for order ${orderId}.`)
      fetchOrders(page)
    } catch (error) {
      setMessage(error.message || 'Failed to resend Telegram')
    }
  }

  useEffect(() => {
    fetchOrders(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, orderType])

  return (
    <AdminLayout
      title="Author Orders"
      subtitle="Review reader orders from Author Pages."
    >
      <style>{styles}</style>

      <div className="orders-page">
        <main className="orders-body">
          <section className="orders-top">
            <div className="orders-kicker">✍️ Author Orders</div>
            <h1 className="orders-heading">Author Orders</h1>
            <p className="orders-note">
              Review reader purchases from Author Pages. PDF and Book orders stay In Review until admin checks the money and approves.
            </p>

            <div className="tab-row">
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall')}>
                Products
              </button>
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall/orders')}>
                Review Orders
              </button>
              <button type="button" className="tab-button active">
                Author Orders
              </button>
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall/publishers')}>
                Publishers
              </button>
            </div>

            <div className="inner-tabs">
              <button
                type="button"
                className={`inner-tab ${orderType === 'pdf' ? 'active' : ''}`}
                onClick={() => {
                  setOrderType('pdf')
                  setPage(1)
                }}
              >
                PDF Orders
              </button>
              <button
                type="button"
                className={`inner-tab ${orderType === 'book' ? 'active' : ''}`}
                onClick={() => {
                  setOrderType('book')
                  setPage(1)
                }}
              >
                Book Orders
              </button>
            </div>

            <div className="orders-toolbar">
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Order ID, ABA Trx ID, reader name, phone..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') fetchOrders(1)
                }}
              />

              <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="under_review">Under Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="amount_mismatch">Amount Mismatch</option>
                <option value="all">All Reports</option>
              </select>

              <button type="button" className="refresh-button" onClick={() => fetchOrders(1)}>
                Search
              </button>
            </div>
          </section>

          <section className="orders-card">
            <div className="orders-card-head">
              <div>
                <div className="orders-card-title">{orderType === 'pdf' ? 'PDF Orders' : 'Book Orders'}</div>
                <div className="small">
                  {orderType === 'pdf'
                    ? 'Approve after checking payment. Approved PDFs unlock reader library access.'
                    : 'Approve after checking payment. Approved books can notify the author through Telegram.'}
                </div>
              </div>

              <div className="count-pill">{totalText}</div>
            </div>

            {message ? <div className="message">{message}</div> : null}

            {loading ? (
              <div className="empty">Loading orders...</div>
            ) : orders.length ? (
              orders.map((order) => {
                const orderId = order.order_id || order.order_number || order.id
                const currentStatus = order.status || order.order_status
                const buyer = order.buyer_profile || {
                  name: order.buyer_name,
                  buyer_name: order.buyer_name,
                  phone_number: order.buyer_phone,
                  buyer_phone: order.buyer_phone,
                  delivery_address: order.delivery_address,
                }

                return (
                  <div className="order-row" key={orderId}>
                    <div>
                      <div className="order-id">{orderId}</div>
                      <div className={`status-pill status-${currentStatus}`}>{statusLabel(currentStatus)}</div>
                      <div className="small">ABA Trx: <span className="strong">{order.aba_transaction_id || '-'}</span></div>
                      <div className="small">Paid: <span className="strong">{formatDate(order.paid_at)}</span></div>
                      <div className="small">Created: <span className="strong">{formatDate(order.created_at)}</span></div>
                      <div className="small">Updated: <span className="strong">{formatDate(order.updated_at)}</span></div>
                      {order.admin_note ? (
                        <div className="small">Admin note: <span className="strong">{order.admin_note}</span></div>
                      ) : null}
                    </div>

                    <BuyerInfo buyer={buyer} />

                    <div>
                      <ProductsInfo items={order.items || []} />
                      <div style={{ marginTop: 12 }}>
                        <MoneyInfo order={order} />
                      </div>
                    </div>

                    <div className="actions">
                      {currentStatus === 'under_review' ? (
                        <button
                          type="button"
                          className="action-button confirm"
                          onClick={() => updateOrderStatus(orderId, 'confirmed')}
                        >
                          {orderType === 'pdf' ? 'Approve PDF' : 'Approve Book'}
                        </button>
                      ) : null}

                      {currentStatus === 'under_review' ? (
                        <button
                          type="button"
                          className="action-button cancel"
                          onClick={() => updateOrderStatus(orderId, 'rejected')}
                        >
                          Reject
                        </button>
                      ) : null}

                      {orderType === 'book' && ['confirmed', 'preparing', 'shipped', 'completed'].includes(currentStatus) ? (
                        <button
                          type="button"
                          className="action-button prepare"
                          onClick={() => resendTelegram(orderId)}
                        >
                          Resend Telegram
                        </button>
                      ) : null}

                      {orderType === 'book' && currentStatus === 'confirmed' ? (
                        <button
                          type="button"
                          className="action-button prepare"
                          onClick={() => updateOrderStatus(orderId, 'preparing')}
                        >
                          Mark Preparing
                        </button>
                      ) : null}

                      {orderType === 'book' && currentStatus === 'preparing' ? (
                        <button
                          type="button"
                          className="action-button ship"
                          onClick={() => updateOrderStatus(orderId, 'shipped')}
                        >
                          Mark Shipped
                        </button>
                      ) : null}

                      {orderType === 'book' && currentStatus === 'shipped' ? (
                        <button
                          type="button"
                          className="action-button complete"
                          onClick={() => updateOrderStatus(orderId, 'completed')}
                        >
                          Complete
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty">No Author Store orders found.</div>
            )}

            <div className="pager">
              <button
                type="button"
                className="page-button"
                disabled={!meta.has_prev || loading}
                onClick={() => fetchOrders(Math.max(page - 1, 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="page-button"
                disabled={!meta.has_next || loading}
                onClick={() => fetchOrders(page + 1)}
              >
                Next
              </button>
            </div>
          </section>
        </main>
      </div>
    </AdminLayout>
  )
}
