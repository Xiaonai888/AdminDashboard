const API_ROOT = `${(import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/$/, '')}/api/admin/purchases/binance`
const UUID_RE = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i
const TRANSACTION_RE = /^[A-Za-z0-9_-]{6,128}$/

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin login required.')
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    cache: 'no-store',
    signal,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok !== true) {
    const message = typeof result.message === 'string' && result.message.length < 300
      ? result.message
      : `Unable to complete Binance review request (HTTP ${response.status}).`
    const error = new Error(message)
    error.status = response.status
    error.code = result.code || 'BINANCE_REVIEW_REQUEST_FAILED'
    throw error
  }
  return result
}

function cleanOrderId(value) {
  const id = String(value || '').trim()
  if (!UUID_RE.test(id)) throw new Error('Invalid payment order.')
  return encodeURIComponent(id)
}

export async function listBinanceCheckoutReviews({ page = 1, status = 'awaiting_receipt', signal } = {}) {
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) throw new Error('Invalid page.')
  if (!['awaiting_receipt', 'submitted', 'approved', 'rejected', 'all'].includes(status)) throw new Error('Invalid review status.')
  const params = new URLSearchParams({ page: String(page), status })
  return request(`/checkout-reviews?${params}`, { signal })
}

export async function getBinanceCheckoutReview(orderId, { signal } = {}) {
  return request(`/checkout-reviews/${cleanOrderId(orderId)}`, { signal })
}

// This only links a verified receipt; wallet credit still requires /approve.
export async function linkBinanceCheckoutReceipt(orderId, fields) {
  const transactionId = String(fields?.transaction_id || '').trim()
  const reason = String(fields?.reason || '').trim()
  const passkey = String(fields?.passkey || '').trim()
  if (!TRANSACTION_RE.test(transactionId)) throw new Error('Enter the verified Binance transaction ID (6–128 characters).')
  if (reason.length < 12 || reason.length > 500) throw new Error('Review reason must contain 12 to 500 characters.')
  if (!/^\d{6}$/.test(passkey)) throw new Error('Enter a six-digit Admin Passkey.')
  if (fields?.official_receipt_verified !== true || fields?.recipient_verified !== true || fields?.receiver_verified !== true) {
    throw new Error('Confirm the official transfer, reader and Binance receiver first.')
  }
  return request(`/checkout-reviews/${cleanOrderId(orderId)}/link-receipt`, {
    method: 'POST',
    body: {
      transaction_id: transactionId, reason, passkey,
      official_receipt_verified: true,
      recipient_verified: true,
      receiver_verified: true,
    },
  })
}

export async function decideBinanceCheckoutReview(orderId, action, fields) {
  if (!['approve', 'reject'].includes(action)) throw new Error('Invalid review action.')
  const reason = String(fields?.reason || '').trim()
  const passkey = String(fields?.passkey || '').trim()
  if (reason.length < 12 || reason.length > 500) throw new Error('Review reason must contain 12 to 500 characters.')
  if (!/^\d{6}$/.test(passkey)) throw new Error('Enter a six-digit Admin Passkey.')
  const confirm = fields?.official_receipt_verified === true
    && fields?.recipient_verified === true
    && fields?.receiver_verified === true
  if (action === 'approve' && !confirm) throw new Error('Complete the three manual checks first.')
  return request(`/checkout-reviews/${cleanOrderId(orderId)}/${action}`, {
    method: 'POST',
    body: {
      reason,
      passkey,
      ...(action === 'approve' ? {
        official_receipt_verified: true,
        recipient_verified: true,
        receiver_verified: true,
      } : {}),
    },
  })
}
