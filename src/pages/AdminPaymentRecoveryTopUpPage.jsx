import React, { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import BinanceCheckoutReviewPanel from '../components/BinanceCheckoutReviewPanel'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .recovery-page { display: grid; gap: 18px; color: #0F172A; }
  .recovery-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; }
  .recovery-intro { padding: 23px 25px; background: linear-gradient(110deg, #FFFFFF, #F5F6FF); display: flex; justify-content: space-between; gap: 16px; align-items: center; }
  .recovery-eyebrow { font-size: 11px; font-weight: 900; color: #4F46E5; text-transform: uppercase; letter-spacing: 1px; }
  .recovery-heading { margin: 7px 0; font-size: 24px; font-weight: 900; }
  .recovery-muted { font-size: 13px; line-height: 1.6; color: #64748B; }
  .recovery-tag { font-size: 11px; font-weight: 900; padding: 8px 12px; color: #4338CA; border-radius: 20px; background: #EEF2FF; white-space: nowrap; }
  .recovery-method-tabs { display: flex; gap: 10px; padding: 15px 18px; border-top: 1px solid #E2E8F0; }
  .recovery-method { flex: 1; border: 1px solid #E2E8F0; border-radius: 14px; background: #FFFFFF; color: #334155; cursor: pointer; font-size: 16px; font-weight: 900; padding: 15px 18px; }
  .recovery-method.active { color: #FFFFFF; border-color: #4F46E5; background: #4F46E5; }
  .recovery-method.binance.active { color: #111827; border-color: #F3BA2F; background: #F3BA2F; }
  .recovery-tabs { display: flex; gap: 8px; padding: 14px 18px; border-top: 1px solid #E2E8F0; }
  .recovery-tab { border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; color: #475569; cursor: pointer; font-size: 13px; font-weight: 800; padding: 11px 17px; }
  .recovery-tab.active { color: #FFFFFF; border-color: #4F46E5; background: #4F46E5; }
  .recovery-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .recovery-stat { padding: 18px; }
  .recovery-stat-title { display: block; color: #64748B; font-size: 12px; font-weight: 750; }
  .recovery-stat-value { display: block; margin-top: 7px; font-size: 25px; font-weight: 900; }
  .recovery-section-head { padding: 18px 20px; display: flex; justify-content: space-between; gap: 14px; align-items: center; border-bottom: 1px solid #E2E8F0; }
  .recovery-section-head h3 { margin: 0 0 4px; font-size: 16px; font-weight: 900; }
  .recovery-controls { display: grid; grid-template-columns: minmax(180px, 1fr) 155px 125px 145px auto auto; gap: 9px; padding: 17px 20px; }
  .recovery-input { width: 100%; min-width: 0; min-height: 41px; background: #FFFFFF; color: #0F172A; border: 1px solid #D8E2EF; border-radius: 11px; font: inherit; font-size: 13px; padding: 0 12px; outline: none; }
  .recovery-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px #EEF2FF; }
  .recovery-button { min-height: 41px; background: #FFFFFF; color: #4338CA; border: 1px solid #C7D2FE; border-radius: 11px; padding: 0 14px; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
  .recovery-button:disabled { cursor: not-allowed; color: #94A3B8; background: #F1F5F9; border-color: #E2E8F0; }
  .recovery-notice { margin: 0 20px 16px; padding: 11px 14px; color: #92400E; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 11px; font-size: 12px; line-height: 1.6; }
  .recovery-error { margin: 0 20px 16px; padding: 11px 14px; color: #B91C1C; background: #FEF2F2; border-radius: 11px; font-size: 12px; }
  .recovery-table-wrap { overflow-x: auto; }
  .recovery-table { width: 100%; border-collapse: collapse; min-width: 850px; }
  .recovery-table th { background: #F8FAFC; color: #64748B; font-size: 11px; font-weight: 900; text-align: left; padding: 13px 17px; }
  .recovery-table td { border-top: 1px solid #F1F5F9; padding: 13px 17px; font-size: 12px; vertical-align: middle; }
  .recovery-table strong { font-size: 13px; }
  .recovery-sub { color: #64748B; font-size: 11px; margin-top: 4px; overflow-wrap: anywhere; }
  .recovery-row-active { background: #F5F6FF; }
  .recovery-pill { display: inline-block; border-radius: 999px; padding: 6px 10px; font-size: 11px; background: #F1F5F9; font-weight: 850; color: #475569; }
  .recovery-pill.success { background: #DCFCE7; color: #166534; }
  .recovery-pill.pending_review { background: #FEF3C7; color: #92400E; }
  .recovery-empty { padding: 30px; text-align: center; color: #64748B; font-size: 13px; }
  .recovery-detail { margin: 16px 20px 20px; padding: 18px; border: 1px solid #E2E8F0; border-radius: 14px; }
  .recovery-detail h4 { margin: 0 0 15px; font-size: 15px; font-weight: 900; }
  .recovery-detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .recovery-detail-grid dt { color: #64748B; font-size: 11px; margin-bottom: 5px; }
  .recovery-detail-grid dd { margin: 0; font-size: 12px; font-weight: 750; overflow-wrap: anywhere; }
  .recovery-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; align-items: center; padding: 14px 20px; border-top: 1px solid #E2E8F0; }
  .recovery-preview { padding: 23px; display: grid; gap: 15px; }
  .recovery-preview h3 { margin: 0; font-size: 19px; }
  .recovery-preview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .recovery-preview label { display: grid; gap: 7px; color: #475569; font-size: 12px; font-weight: 800; }
  .recovery-preview input:disabled { background: #F8FAFC; }
  .recovery-result-list { display: grid; gap: 8px; margin-top: 10px; }
  .recovery-person { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 13px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; }
  .recovery-person.chosen { border-color: #6366F1; background: #EEF2FF; }
  .recovery-form { display: grid; gap: 15px; padding-top: 16px; }
  .recovery-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .recovery-form label { display: grid; gap: 7px; color: #475569; font-size: 12px; font-weight: 800; }
  .recovery-form textarea { min-height: 80px; resize: vertical; padding: 12px; }
  .recovery-check { display: flex !important; align-items: flex-start; gap: 10px !important; font-weight: 650 !important; line-height: 1.5; }
  .recovery-check input { width: 16px; height: 16px; flex: 0 0 16px; margin-top: 2px; }
  .recovery-primary { color: #FFFFFF; background: #4F46E5; border-color: #4F46E5; }
  .recovery-primary:disabled { color: #94A3B8; }
  .recovery-success { padding: 14px; border: 1px solid #86EFAC; background: #F0FDF4; color: #166534; font-size: 13px; font-weight: 700; border-radius: 12px; }
  .recovery-subheading { font-size: 13px; color: #0F172A; font-weight: 900; }
  .recovery-history { padding: 18px; display: grid; gap: 12px; }
  .recovery-history-item { padding: 14px; border: 1px solid #E2E8F0; border-radius: 12px; }
  .recovery-history-item:focus-within { border-color: #A5B4FC; }
  .recovery-update-badge { display: inline-flex; align-items: center; border-radius: 999px; background: #EDE9FE; color: #5B21B6; font-size: 11px; font-weight: 850; padding: 5px 9px; margin-left: 9px; }
  .recovery-edit-panel { margin-top: 15px; padding: 16px; border: 1px solid #C7D2FE; border-radius: 14px; background: #F8FAFF; }
  .recovery-edit-panel .recovery-form { padding-top: 0; }
  .recovery-edit-panel textarea { min-height: 80px; }
  .recovery-audit { display: grid; gap: 10px; margin-top: 16px; border-top: 1px solid #E2E8F0; padding-top: 15px; }
  .recovery-audit-row { border: 1px solid #E2E8F0; border-radius: 11px; padding: 12px; background: #FAFBFF; }
  .recovery-audit-row p { margin: 6px 0; line-height: 1.5; font-size: 12px; overflow-wrap: anywhere; }
  .recovery-audit-row del { color: #9F1239; }
  .recovery-audit-row strong { overflow-wrap: anywhere; }
  .recovery-inline-error { margin: 10px 0; padding: 11px; color: #B91C1C; background: #FEF2F2; border-radius: 10px; font-size: 12px; }
  .recovery-read-only { color: #475569; border-radius: 10px; background: #E2E8F0; padding: 10px 12px; font-size: 12px; font-weight: 700; }
  .recovery-actions { display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }
  @media (max-width: 1040px) { .recovery-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } .recovery-controls .recovery-input:first-child { grid-column: 1 / -1; } }
  @media (max-width: 680px) { .recovery-intro { padding: 18px; align-items: flex-start; flex-direction: column; } .recovery-stats { grid-template-columns: 1fr; } .recovery-controls { grid-template-columns: 1fr; padding: 14px; } .recovery-controls .recovery-input:first-child { grid-column: auto; } .recovery-tabs { flex-wrap: wrap; } .recovery-detail-grid, .recovery-preview-grid, .recovery-form-grid { grid-template-columns: 1fr; } .recovery-section-head { align-items: flex-start; flex-direction: column; } .recovery-notice, .recovery-error { margin-left: 14px; margin-right: 14px; } }
`

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })} (KH)`
}

function displayName(payment) {
  return payment.user?.name || payment.user?.username || 'Unknown account'
}

function isReleased(payment) {
  return ['success', 'approved', 'confirmed'].includes(String(payment.status || '').toLowerCase()) || Boolean(payment.released_at)
}

function canRecover(payment) {
  return payment && !isReleased(payment) && ['aba_payment_link', 'premium_aba_payment_link'].includes(payment.payment_method) && ['waiting_payment', 'pending_review', 'callback_received', 'expired', 'cancelled'].includes(String(payment.status || '').toLowerCase())
}


async function binanceRequest(path, options = {}) {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  if (!token) throw new Error('Admin login required')
  const response = await fetch(API_URL + '/api/admin/purchases/binance' + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) throw new Error(data.message || 'Binance API request failed')
  return data
}

function BinanceAdminPanel({ tab, cacheRef, onBusyChange }) {
  const [receiptView, setReceiptView] = useState('received')
  const [receiptFilters, setReceiptFilters] = useState({ q: '', status: 'all', amount: '', date: '', sort: 'newest' })
  const [receiptApplied, setReceiptApplied] = useState({ q: '', status: 'all', amount: '', date: '', sort: 'newest' })
  const [historyFilters, setHistoryFilters] = useState({ q: '', type: 'all', date: '', sort: 'newest' })
  const [historyApplied, setHistoryApplied] = useState({ q: '', type: 'all', date: '', sort: 'newest' })
  const [receiptPage, setReceiptPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [records, setRecords] = useState([])
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [availability, setAvailability] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState('')
  const [receiptDetail, setReceiptDetail] = useState(null)
  const [receiptDetailLoading, setReceiptDetailLoading] = useState(false)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [recipientResults, setRecipientResults] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [searchingRecipient, setSearchingRecipient] = useState(false)
  const [diamonds, setDiamonds] = useState('')
  const [manualVouchers, setManualVouchers] = useState('0')
  const [adjustmentReference, setAdjustmentReference] = useState('')
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [verifiedReceipt, setVerifiedReceipt] = useState(false)
  const [verifiedRecipient, setVerifiedRecipient] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [actionDetail, setActionDetail] = useState(null)
  const [actionDetailLoading, setActionDetailLoading] = useState(false)
  const [detailRefresh, setDetailRefresh] = useState(0)
  const [audit, setAudit] = useState({ items: [], page: 1, has_next: false, has_prev: false })
  const [auditLoading, setAuditLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({ reference: '', mark_note: '', reason: '', passkey: '' })
  const auditRequestRef = useRef(0)

  useEffect(() => {
    onBusyChange(working)
    return () => onBusyChange(false)
  }, [working, onBusyChange])

  useEffect(() => {
    if (tab === 'history') return undefined
    const cached = cacheRef.current.get('binance-availability')
    if (cached) {
      setAvailability(cached)
      return undefined
    }
    const controller = new AbortController()
    binanceRequest('/availability', { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        cacheRef.current.set('binance-availability', data)
        setAvailability(data)
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message || 'Cannot check Binance credit availability')
      })
    return () => controller.abort()
  }, [tab, cacheRef, refreshKey])

  useEffect(() => {
    if (tab === 'topup') return undefined
    const mode = tab === 'history' ? 'history' : receiptView === 'alerts' ? 'alert-history' : 'received-usdt'
    const page = tab === 'history' ? historyPage : receiptPage
    const filters = tab === 'history' ? historyApplied : receiptApplied
    const key = JSON.stringify([mode, page, filters])
    const cached = cacheRef.current.get(key)
    if (cached) {
      setRecords(cached.items)
      setHasNext(cached.has_next)
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(page) })
    for (const [field, value] of Object.entries(filters)) {
      if (value && value !== 'all' && value !== 'newest') params.set(field, value)
    }
    setLoading(true)
    setRecords([])
    setHasNext(false)
    setError('')
    binanceRequest('/' + mode + '?' + params.toString(), { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        const rows = Array.isArray(data.items) ? data.items.slice(0, 10) : []
        const next = Boolean(data.has_next)
        cacheRef.current.set(key, { items: rows, has_next: next })
        setRecords(rows)
        setHasNext(next)
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message || 'Failed to load Binance records')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [tab, receiptView, receiptPage, historyPage, receiptApplied, historyApplied, refreshKey, cacheRef])

  useEffect(() => {
    if (tab !== 'recovery' || receiptView !== 'received' || !selectedTransaction) return undefined
    const controller = new AbortController()
    setReceiptDetail(null)
    setReceiptDetailLoading(true)
    binanceRequest('/receipts/' + encodeURIComponent(selectedTransaction), { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setReceiptDetail(data.receipt || null)
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message || 'Failed to load receipt details')
      })
      .finally(() => {
        if (!controller.signal.aborted) setReceiptDetailLoading(false)
      })
    return () => controller.abort()
  }, [tab, receiptView, selectedTransaction])

  useEffect(() => {
    if (tab !== 'history' || !selectedAction) return undefined
    const controller = new AbortController()
    setActionDetail(null)
    setActionDetailLoading(true)
    setAudit({ items: [], page: 1, has_next: false, has_prev: false })
    setEditing(false)
    binanceRequest('/history/' + encodeURIComponent(selectedAction), { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted || !data.action) return
        setActionDetail(data.action)
        setAudit(data.edits || { items: [], page: 1, has_next: false, has_prev: false })
        setEditDraft({
          reference: data.action.display_reference || data.action.reference || '',
          mark_note: data.action.mark_note || '',
          reason: '',
          passkey: '',
        })
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message || 'Failed to load action details')
      })
      .finally(() => {
        if (!controller.signal.aborted) setActionDetailLoading(false)
      })
    return () => controller.abort()
  }, [tab, selectedAction, detailRefresh])

  function resetSensitive() {
    setPin('')
    setVerifiedReceipt(false)
    setVerifiedRecipient(false)
  }

  function resetRecipient() {
    setRecipient(null)
    setRecipientResults([])
    setRecipientSearch('')
    setManualVouchers('0')
    resetSensitive()
  }

  function refresh() {
    cacheRef.current.clear()
    setSelectedTransaction('')
    setReceiptDetail(null)
    setSelectedAction('')
    setActionDetail(null)
    resetSensitive()
    setRefreshKey((value) => value + 1)
  }

  function chooseReceipt(id) {
    setSelectedTransaction(selectedTransaction === id ? '' : id)
    setReceiptDetail(null)
    setFeedback('')
    setError('')
    resetRecipient()
    setDiamonds('')
    setReason('')
  }

  async function findRecipient(event) {
    event.preventDefault()
    if (searchingRecipient || working || recipient) return
    if (recipientSearch.trim().length < 2) {
      setError('Enter at least two characters to find a Shadow account')
      return
    }
    setSearchingRecipient(true)
    setError('')
    resetSensitive()
    setRecipient(null)
    setRecipientResults([])
    try {
      const data = await binanceRequest('/recipients?q=' + encodeURIComponent(recipientSearch.trim()))
      setRecipientResults(Array.isArray(data.users) ? data.users.slice(0, 10) : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSearchingRecipient(false)
    }
  }

  function selectBinanceRecipient(user) {
    if (working || searchingRecipient) return
    setRecipient(user)
    setRecipientResults([])
    setRecipientSearch('')
    setDiamonds('')
    setManualVouchers('0')
    setAdjustmentReference('')
    setReason('')
    resetSensitive()
    setError('')
    setFeedback('')
  }

  function changeBinanceRecipient() {
    if (working || searchingRecipient) return
    resetRecipient()
    setDiamonds('')
    setManualVouchers('0')
    setAdjustmentReference('')
    setReason('')
    setError('')
    setFeedback('')
  }

  async function applyCredit(event) {
    event.preventDefault()
    if (working || !recipient || !/^[0-9]{6}$/.test(pin) || !verifiedRecipient) {
      setError('Select and confirm the recipient, then enter a valid six-digit Passkey')
      return
    }
    const count = Number(diamonds)
    if (!Number.isSafeInteger(count) || count < 1 || count > 10000 || reason.trim().length < 12 || reason.trim().length > 500) {
      setError('Enter 1–10,000 Diamonds and a detailed reason of 12–500 characters')
      return
    }
    const isRecovery = tab === 'recovery'
    if (isRecovery && (!receiptDetail || !verifiedReceipt || Number(receiptDetail.amount_usdt) < 1)) {
      setError('Verify a recorded Binance receipt of at least 1 USDT')
      return
    }
    if (!isRecovery && !/^[A-Z0-9][A-Z0-9._/-]{5,99}$/.test(adjustmentReference.trim().toUpperCase())) {
      setError('Provide a unique adjustment reference containing 6–100 allowed characters')
      return
    }
    const voucherText = String(manualVouchers).trim()
    if (!isRecovery && (!/^\d{1,6}$/.test(voucherText) || Number(voucherText) > 100000)) {
      setError('Enter a whole number of Vouchers between 0 and 100,000')
      return
    }
    const manualVoucherCount = isRecovery ? 100 : Number(voucherText)
    const reference = isRecovery ? receiptDetail.transaction_id : adjustmentReference.trim().toUpperCase()
    if (!window.confirm('Confirm permanent wallet credit?\nAccount: ' + (recipient.name || recipient.username) + '\nDiamonds: ' + count + '\nReference: ' + reference + '\nVouchers: ' + manualVoucherCount + '\nThis action cannot be undone.')) return
    setWorking(true)
    setError('')
    setFeedback('')
    try {
      const payload = isRecovery ? {
        transaction_id: reference,
        user_id: recipient.id,
        verified_amount_usdt: String(receiptDetail.amount_usdt),
        diamonds: count,
        reason: reason.trim(),
        passkey: pin,
        binance_verified: verifiedReceipt,
        confirm_recipient: verifiedRecipient,
      } : {
        user_id: recipient.id,
        reference,
        diamonds: count,
        vouchers: manualVoucherCount,
        reason: reason.trim(),
        passkey: pin,
        confirmed: verifiedRecipient,
      }
      const data = await binanceRequest(isRecovery ? '/recovery/confirm' : '/topup', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const result = data.result || {}
      setFeedback('Credit successful: ' + Number(result.diamonds || 0).toLocaleString() + ' Diamonds · Wallet ' + Number(result.diamond_balance_before || 0).toLocaleString() + ' → ' + Number(result.diamond_balance_after || 0).toLocaleString() + ' · +' + Number(result.bonus_vouchers || 0) + ' Vouchers')
      setRecipient((user) => user ? { ...user, diamond_balance: Number(result.diamond_balance_after || user.diamond_balance || 0) } : user)
      setDiamonds('')
      setManualVouchers('0')
      setAdjustmentReference('')
      setReason('')
      setSelectedTransaction('')
      setReceiptDetail(null)
      resetSensitive()
      cacheRef.current.clear()
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message || 'Credit failed')
    } finally {
      setPin('')
      setWorking(false)
    }
  }

  async function loadAuditPage(nextPage) {
    if (!actionDetail || auditLoading || nextPage < 1) return
    const requestId = ++auditRequestRef.current
    setAuditLoading(true)
    setError('')
    try {
      const data = await binanceRequest('/history/' + encodeURIComponent(actionDetail.id) + '/edits?page=' + nextPage)
      if (auditRequestRef.current !== requestId) return
      setAudit({
        items: Array.isArray(data.items) ? data.items : [],
        page: Number(data.page || nextPage),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (requestError) {
      if (auditRequestRef.current === requestId) setError(requestError.message || 'Unable to load audit history')
    } finally {
      if (auditRequestRef.current === requestId) setAuditLoading(false)
    }
  }

  async function applyMetadataEdit(event) {
    event.preventDefault()
    if (working || !actionDetail) return
    const originalReference = String(actionDetail.display_reference || actionDetail.reference || '').trim().toUpperCase()
    const nextReference = editDraft.reference.trim().toUpperCase()
    const originalMark = String(actionDetail.mark_note || '').trim()
    const nextMark = editDraft.mark_note.trim()
    const referenceChanged = originalReference !== nextReference
    const markChanged = originalMark !== nextMark
    if (!referenceChanged && !markChanged) {
      setError('Change the displayed reference or mark before saving')
      return
    }
    if (!/^[A-Z0-9][A-Z0-9._/-]{0,127}$/.test(nextReference) || nextMark.length > 300 || editDraft.reason.trim().length < 12 || editDraft.reason.trim().length > 500 || !/^[0-9]{6}$/.test(editDraft.passkey.trim())) {
      setError('Check the reference, 300-character mark, 12–500-character reason, and six-digit Passkey')
      return
    }
    if (!window.confirm('Save edit? Only the displayed reference and admin mark will change. The wallet and financial record stay unchanged.')) return
    setWorking(true)
    setError('')
    try {
      await binanceRequest('/history/' + encodeURIComponent(actionDetail.id), {
        method: 'PATCH',
        body: JSON.stringify({
          reference: referenceChanged ? nextReference : null,
          mark_note: markChanged ? nextMark : null,
          expected_edit_count: Number(actionDetail.edit_count || 0),
          reason: editDraft.reason.trim(),
          passkey: editDraft.passkey.trim(),
        }),
      })
      setFeedback('Binance history updated. Original transaction and wallet balances were not modified.')
      setEditing(false)
      setEditDraft((draft) => ({ ...draft, reason: '', passkey: '' }))
      cacheRef.current.clear()
      setRefreshKey((value) => value + 1)
      setDetailRefresh((value) => value + 1)
    } catch (requestError) {
      setError(requestError.message || 'Failed to save edit')
    } finally {
      setEditDraft((draft) => ({ ...draft, passkey: '' }))
      setWorking(false)
    }
  }

  const page = tab === 'history' ? historyPage : receiptPage
  const canCredit = tab === 'recovery' ? availability?.verified_receipt_credit_enabled : availability?.manual_top_up_enabled

  return (
    <>
      {feedback ? <div className="recovery-success" role="status">{feedback}</div> : null}
      {error ? <div className="recovery-error" role="alert" style={{ margin: 0 }}>{error}</div> : null}
      {tab !== 'history' && availability === null ? <p className="recovery-notice" style={{ margin: 0 }}>Checking whether the Binance Credit Ledger is ready. Wallet actions remain disabled until verified.</p> : null}
      {tab !== 'history' && availability && !canCredit ? <p className="recovery-notice" style={{ margin: 0 }}>Binance credit SQL has not been verified. Credit actions are disabled until the database setup succeeds.</p> : null}
      {tab === 'recovery' ? (
        <section className="recovery-card">
          <div className="recovery-section-head">
            <div>
              <h3>Binance Personal Pay · Received USDT</h3>
              <p className="recovery-muted">Review real received USDT records. A payer name does not establish the recipient Shadow account.</p>
            </div>
            <button className="recovery-button" type="button" disabled={loading || working} onClick={refresh}>Refresh</button>
          </div>
          <div className="recovery-tabs">
            <button type="button" className={'recovery-tab ' + (receiptView === 'received' ? 'active' : '')} disabled={working} onClick={() => { setReceiptView('received'); setReceiptPage(1); setSelectedTransaction(''); resetSensitive() }}>Received USDT</button>
            <button type="button" className={'recovery-tab ' + (receiptView === 'alerts' ? 'active' : '')} disabled={working} onClick={() => { setReceiptView('alerts'); setReceiptPage(1); setSelectedTransaction(''); resetSensitive() }}>Telegram Alert History</button>
          </div>
          <form className="recovery-controls" onSubmit={(event) => { event.preventDefault(); setReceiptPage(1); setSelectedTransaction(''); setReceiptApplied({ ...receiptFilters, q: receiptFilters.q.trim() }) }}>
            <input className="recovery-input" value={receiptFilters.q} maxLength={80} onChange={(event) => setReceiptFilters((f) => ({ ...f, q: event.target.value }))} placeholder="Transaction ID, payer..." aria-label="Search Binance receipts" />
            <select className="recovery-input" value={receiptFilters.status} onChange={(event) => setReceiptFilters((f) => ({ ...f, status: event.target.value }))} aria-label="Telegram alert status">
              <option value="all">All statuses</option><option value="sent">Sent</option><option value="pending">Pending</option><option value="sending">Sending</option><option value="failed">Failed</option>
            </select>
            <select className="recovery-input" value={receiptFilters.sort} onChange={(event) => setReceiptFilters((f) => ({ ...f, sort: event.target.value }))} aria-label="Sort Binance receipts">
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="high">Top → Low USDT</option><option value="low">Low → Top USDT</option>
            </select>
            <input className="recovery-input" type="number" min="0.00000001" step="0.00000001" value={receiptFilters.amount} onChange={(event) => setReceiptFilters((f) => ({ ...f, amount: event.target.value }))} placeholder="USDT" aria-label="Exact USDT amount" />
            <input className="recovery-input" type="date" value={receiptFilters.date} onChange={(event) => setReceiptFilters((f) => ({ ...f, date: event.target.value }))} aria-label="Cambodia date" />
            <button className="recovery-button recovery-primary" type="submit" disabled={loading}>Search</button>
            <button className="recovery-button" type="button" disabled={loading} onClick={() => { const empty = { q: '', status: 'all', amount: '', date: '', sort: 'newest' }; setReceiptFilters(empty); setReceiptApplied(empty); setReceiptPage(1); setSelectedTransaction('') }}>Clear</button>
          </form>
          <p className="recovery-notice">10 records per page. Telegram alert delivery is not payment credit. Confirm the official Binance transfer and intended Shadow recipient manually before crediting. Purchases below 1 USDT are not eligible.</p>
          <div className="recovery-table-wrap">
            <table className="recovery-table">
              <thead><tr><th>Transaction ID</th><th>Payer</th><th>USDT</th><th>Order type</th><th>Telegram</th><th>Time (KH)</th><th></th></tr></thead>
              <tbody>{records.map((row) => (
                <tr key={row.transaction_id} className={selectedTransaction === row.transaction_id ? 'recovery-row-active' : ''}>
                  <td><strong>{row.transaction_id}</strong></td>
                  <td>{row.payer_name || 'Unknown payer'}</td>
                  <td><strong>{Number(row.amount_usdt || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })} USDT</strong></td>
                  <td>{row.order_type || '—'}</td>
                  <td><span className={'recovery-pill ' + (row.telegram_alert_status === 'sent' ? 'success' : 'pending_review')}>{row.telegram_alert_status || 'unknown'}</span>{receiptView === 'alerts' ? <div className="recovery-sub">Attempts: {row.attempt_count || 0}{row.last_alert_error ? ' · ' + row.last_alert_error : ''}</div> : null}</td>
                  <td>{row.transaction_time_ms ? formatDate(Number(row.transaction_time_ms)) : formatDate(row.created_at)}</td>
                  <td>{receiptView === 'received' ? <button type="button" className="recovery-button" disabled={working} onClick={() => chooseReceipt(row.transaction_id)}>{selectedTransaction === row.transaction_id ? 'Close' : 'Verify'}</button> : <span className="recovery-read-only">Read only</span>}</td>
                </tr>
              ))}</tbody>
            </table>
            {loading ? <p className="recovery-empty">Loading Binance records...</p> : null}
            {!loading && !records.length ? <p className="recovery-empty">No matching USDT records found.</p> : null}
          </div>
          {receiptView === 'received' && selectedTransaction ? <div className="recovery-detail">
            <h4>Verify Binance transfer and Shadow recipient</h4>
            {receiptDetailLoading ? <p className="recovery-muted">Loading recorded receipt...</p> : null}
            {receiptDetail ? <>
              <dl className="recovery-detail-grid">
                <div><dt>Transaction ID</dt><dd>{receiptDetail.transaction_id}</dd></div>
                <div><dt>Amount</dt><dd>{receiptDetail.amount_usdt} USDT</dd></div>
                <div><dt>Payer</dt><dd>{receiptDetail.payer_name || 'Unknown'}</dd></div>
                <div><dt>Recorded time (KH)</dt><dd>{formatDate(Number(receiptDetail.transaction_time_ms))}</dd></div>
                <div><dt>Telegram alert</dt><dd>{receiptDetail.telegram_alert_status || '—'}</dd></div>
                <div><dt>Order type</dt><dd>{receiptDetail.order_type || '—'}</dd></div>
              </dl>
              {Number(receiptDetail.amount_usdt) >= 1 ? <p className="recovery-notice" style={{ margin: '15px 0' }}>Only manually verified USDT receipts can be credited. Fixed bonus: +100 Vouchers. Double-check the package's Diamond amount; sender identity is not automatically linked to a Shadow account.</p> : <p className="recovery-inline-error">Under 1 USDT: this receipt is not eligible for credit.</p>}
            </> : !receiptDetailLoading ? <p className="recovery-muted">Receipt details unavailable.</p> : null}
            {receiptDetail && Number(receiptDetail.amount_usdt) >= 1 && canCredit ? <BinanceRecipientForm
              recipientSearch={recipientSearch} setRecipientSearch={setRecipientSearch}
              recipientResults={recipientResults} recipient={recipient} searchingRecipient={searchingRecipient}
              onSearch={findRecipient} onSelect={selectBinanceRecipient}
              onChangeRecipient={changeBinanceRecipient} busy={working}
            /> : null}
            {receiptDetail && recipient && Number(receiptDetail.amount_usdt) >= 1 && canCredit ? <form className="recovery-form" onSubmit={applyCredit}>
              <h4 style={{ margin: 0 }}>Credit verified purchase</h4>
              <div className="recovery-form-grid">
                <label>Diamonds to credit (1–10,000)<input className="recovery-input" type="number" min="1" max="10000" step="1" value={diamonds} onChange={(event) => setDiamonds(event.target.value)} required /></label>
                <label>Admin Passkey (6 digits)<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} minLength={6} pattern="[0-9]{6}" value={pin} onChange={(event) => setPin(event.target.value)} required /></label>
              </div>
              <label>Detailed reason<textarea className="recovery-input" minLength={12} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} required placeholder="Describe verified Binance payment, package and recipient evidence" /></label>
              <label className="recovery-check"><input type="checkbox" checked={verifiedReceipt} onChange={(event) => setVerifiedReceipt(event.target.checked)} /> I personally checked the official Binance transfer, transaction ID, amount and time.</label>
              <label className="recovery-check"><input type="checkbox" checked={verifiedRecipient} onChange={(event) => setVerifiedRecipient(event.target.checked)} /> I confirmed this exact Shadow account and checked it has not already received this purchase.</label>
              <button className="recovery-button recovery-primary" type="submit" disabled={working || !verifiedReceipt || !verifiedRecipient}>{working ? 'Crediting...' : 'Credit Diamonds +100 Vouchers with Passkey'}</button>
            </form> : null}
          </div> : null}
          <div className="recovery-footer">
            <span className="recovery-muted">Page {page} · {records.length} records</span>
            <div className="recovery-actions">
              <button className="recovery-button" type="button" disabled={loading || working || page <= 1} onClick={() => { setReceiptPage((p) => Math.max(1, p - 1)); setSelectedTransaction('') }}>Previous</button>
              <button className="recovery-button" type="button" disabled={loading || working || !hasNext} onClick={() => { setReceiptPage((p) => p + 1); setSelectedTransaction('') }}>Next</button>
            </div>
          </div>
        </section>
      ) : tab === 'topup' ? (
        <section className="recovery-card recovery-preview">
          <h3>Binance · Manual Diamonds + Vouchers Top-Up</h3>
          <p className="recovery-muted">Manually enter Diamonds and Vouchers for an Admin adjustment. This is not a verified USDT purchase. Use Payment Recovery for an official received USDT purchase (+100 Vouchers).</p>
          <BinanceRecipientForm
            recipientSearch={recipientSearch} setRecipientSearch={setRecipientSearch}
            recipientResults={recipientResults} recipient={recipient} searchingRecipient={searchingRecipient}
            onSearch={findRecipient} onSelect={selectBinanceRecipient}
            onChangeRecipient={changeBinanceRecipient} busy={working}
          />
          {recipient && canCredit ? <form className="recovery-form" onSubmit={applyCredit}>
            <div className="recovery-form-grid">
              <label>Diamonds to credit (1–10,000)<input className="recovery-input" type="number" min="1" max="10000" step="1" value={diamonds} onChange={(event) => setDiamonds(event.target.value)} required /></label>
              <label>Vouchers to credit (0–100,000)<input className="recovery-input" type="number" min="0" max="100000" step="1" value={manualVouchers} onChange={(event) => setManualVouchers(event.target.value)} required /></label>
              <label>Unique adjustment reference<input className="recovery-input" value={adjustmentReference} maxLength={100} onChange={(event) => setAdjustmentReference(event.target.value)} required placeholder="BN-ADJ-XXXXXX" /></label>
              <label>Six-digit Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" minLength={6} maxLength={6} pattern="[0-9]{6}" value={pin} onChange={(event) => setPin(event.target.value)} required /></label>
            </div>
            <label>Detailed reason<textarea className="recovery-input" minLength={12} maxLength={500} required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain this adjustment and reference the supporting evidence" /></label>
            <label className="recovery-check"><input type="checkbox" checked={verifiedRecipient} onChange={(event) => setVerifiedRecipient(event.target.checked)} /> I confirm this account, both Diamond and Voucher amounts, and that this is not a duplicate or purchase credit.</label>
            <button className="recovery-button recovery-primary" type="submit" disabled={working || !verifiedRecipient}>{working ? 'Processing...' : 'Confirm Manual Top-Up with Passkey'}</button>
          </form> : <p className="recovery-notice" style={{ margin: 0 }}>{canCredit ? 'Select a recipient to continue.' : 'Manual credit is disabled until the Backend confirms that the Binance Ledger is ready.'}</p>}
        </section>
      ) : (
        <section className="recovery-card recovery-history">
          <div className="recovery-section-head" style={{ padding: 0, border: 0 }}>
            <div><h3>Binance · Action History</h3><p className="recovery-muted">10 records per page; search, Top–Low USDT, and permanent edit audit. Details load only when opened.</p></div>
            <button className="recovery-button" type="button" disabled={loading || working} onClick={refresh}>Refresh</button>
          </div>
          <form className="recovery-controls" onSubmit={(event) => { event.preventDefault(); setHistoryPage(1); setSelectedAction(''); setHistoryApplied({ ...historyFilters, q: historyFilters.q.trim() }) }} style={{ padding: 0 }}>
            <input className="recovery-input" value={historyFilters.q} maxLength={80} onChange={(event) => setHistoryFilters((f) => ({ ...f, q: event.target.value }))} placeholder="Username, reference, admin..." />
            <select className="recovery-input" value={historyFilters.type} onChange={(event) => setHistoryFilters((f) => ({ ...f, type: event.target.value }))}><option value="all">All actions</option><option value="recovery">Recovery</option><option value="topup">Manual Top-Up</option></select>
            <select className="recovery-input" value={historyFilters.sort} onChange={(event) => setHistoryFilters((f) => ({ ...f, sort: event.target.value }))}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="high">Top → Low USDT</option><option value="low">Low → Top USDT</option></select>
            <input className="recovery-input" type="date" value={historyFilters.date} onChange={(event) => setHistoryFilters((f) => ({ ...f, date: event.target.value }))} />
            <button className="recovery-button recovery-primary" type="submit" disabled={loading}>Search</button>
            <button className="recovery-button" type="button" disabled={loading} onClick={() => { const empty = { q: '', type: 'all', date: '', sort: 'newest' }; setHistoryFilters(empty); setHistoryApplied(empty); setHistoryPage(1); setSelectedAction('') }}>Clear</button>
          </form>
          {loading ? <p className="recovery-muted">Loading credit history...</p> : null}
          {!loading && !records.length ? <p className="recovery-empty">No Binance credit actions found.</p> : null}
          {records.map((action) => <div className="recovery-history-item" key={action.id}>
            <div className="recovery-actions">
              <strong>{action.user_name || action.user?.name || action.user?.username || 'Unknown account'} · {Number(action.diamonds || 0).toLocaleString()} Diamonds</strong>
              {Number(action.edit_count || 0) > 0 ? <span className="recovery-update-badge">Updated · {action.edit_count}</span> : null}
            </div>
            <div className="recovery-sub">{action.action_type === 'recovery' ? Number(action.amount_usdt || 0).toLocaleString() + ' USDT · +100 Vouchers' : 'Manual adjustment · +' + Number(action.bonus_vouchers || 0).toLocaleString() + ' Vouchers'} · Reference: {action.display_reference || action.reference} · {formatDate(action.created_at)}</div>
            {action.mark_note ? <div className="recovery-sub">Mark: {action.mark_note}</div> : null}
            <div className="recovery-actions" style={{ marginTop: 10 }}>
              <button type="button" className="recovery-button" disabled={working} onClick={() => { auditRequestRef.current += 1; setSelectedAction(selectedAction === action.id ? '' : action.id); setActionDetail(null); setEditing(false); setError('') }}>{selectedAction === action.id ? 'Hide Details' : 'View Details'}</button>
            </div>
            {selectedAction === action.id ? <div className="recovery-detail" style={{ margin: '14px 0 0' }}>
              {actionDetailLoading ? <p className="recovery-muted">Loading full details and audit...</p> : null}
              {actionDetail?.id === action.id ? <>
                <dl className="recovery-detail-grid">
                  <div><dt>Recipient</dt><dd>{actionDetail.user_name || actionDetail.user?.name || '—'}</dd></div>
                  <div><dt>User ID</dt><dd>{actionDetail.user_id}</dd></div>
                  <div><dt>Transaction ID</dt><dd>{actionDetail.transaction_id || 'Manual adjustment'}</dd></div>
                  <div><dt>USDT amount</dt><dd>{actionDetail.amount_usdt == null ? '—' : String(actionDetail.amount_usdt)}</dd></div>
                  <div><dt>Diamonds credited</dt><dd>{Number(actionDetail.diamonds || 0).toLocaleString()}</dd></div>
                  <div><dt>{actionDetail.action_type === 'topup' ? 'Vouchers credited' : 'Voucher bonus'}</dt><dd>{Number(actionDetail.bonus_vouchers || 0).toLocaleString()}</dd></div>
                  <div><dt>Diamond wallet before → after</dt><dd>{Number(actionDetail.diamond_balance_before || 0).toLocaleString()} → {Number(actionDetail.diamond_balance_after || 0).toLocaleString()}</dd></div>
                  <div><dt>Voucher wallet before → after</dt><dd>{Number(actionDetail.voucher_balance_before || 0).toLocaleString()} → {Number(actionDetail.voucher_balance_after || 0).toLocaleString()}</dd></div>
                  <div><dt>Original reference</dt><dd>{actionDetail.reference || '—'}</dd></div>
                  <div><dt>Display reference</dt><dd>{actionDetail.display_reference || actionDetail.reference || '—'}</dd></div>
                  <div><dt>Mark / Note</dt><dd>{actionDetail.mark_note || '—'}</dd></div>
                  <div><dt>Admin</dt><dd>{actionDetail.admin_email || '—'}</dd></div>
                  <div><dt>Original reason</dt><dd>{actionDetail.reason || '—'}</dd></div>
                  <div><dt>Created</dt><dd>{formatDate(actionDetail.created_at)}</dd></div>
                  {Number(actionDetail.edit_count || 0) > 0 ? <div><dt>Last edited</dt><dd>{formatDate(actionDetail.edited_at)} · {actionDetail.updated_by_email || '—'}</dd></div> : null}
                </dl>
                <div className="recovery-actions" style={{ marginTop: 14 }}><button type="button" className="recovery-button" disabled={working} onClick={() => { setEditing(!editing); setError(''); setEditDraft({ reference: actionDetail.display_reference || actionDetail.reference || '', mark_note: actionDetail.mark_note || '', reason: '', passkey: '' }) }}>{editing ? 'Cancel Edit' : 'Edit Display / Mark'}</button></div>
                {editing ? <form className="recovery-edit-panel recovery-form" onSubmit={applyMetadataEdit}>
                  <div className="recovery-read-only">Only display reference and admin mark can change. USDT, Diamonds, Vouchers and balances are permanently read-only.</div>
                  <div className="recovery-form-grid">
                    <label>Display reference<input className="recovery-input" required maxLength={128} value={editDraft.reference} onChange={(event) => setEditDraft((d) => ({ ...d, reference: event.target.value }))} /></label>
                    <label>Mark / Note<textarea className="recovery-input" maxLength={300} value={editDraft.mark_note} onChange={(event) => setEditDraft((d) => ({ ...d, mark_note: event.target.value }))} /></label>
                    <label>Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} minLength={6} pattern="[0-9]{6}" required value={editDraft.passkey} onChange={(event) => setEditDraft((d) => ({ ...d, passkey: event.target.value }))} /></label>
                  </div>
                  <label>Edit reason<textarea className="recovery-input" required minLength={12} maxLength={500} value={editDraft.reason} onChange={(event) => setEditDraft((d) => ({ ...d, reason: event.target.value }))} /></label>
                  <button className="recovery-button recovery-primary" type="submit" disabled={working}>{working ? 'Saving...' : 'Save with Passkey'}</button>
                </form> : null}
                <div className="recovery-audit">
                  <strong>Permanent Edit History · {actionDetail.edit_count || 0} revisions</strong>
                  {auditLoading ? <p className="recovery-muted">Loading audit records...</p> : null}
                  {!auditLoading && !audit.items.length ? <p className="recovery-muted">No edits recorded.</p> : null}
                  {audit.items.map((edit) => <div className="recovery-audit-row" key={edit.id}>
                    <strong>Revision #{edit.edit_number} · {formatDate(edit.created_at)}</strong>
                    <p>Reference: <del>{edit.old_reference || '—'}</del> → {edit.new_reference || '—'}</p>
                    <p>Mark: <del>{edit.old_mark || '—'}</del> → {edit.new_mark || '—'}</p>
                    <p>Admin: {edit.admin_email || '—'}</p>
                    <p>Reason: {edit.reason || '—'}</p>
                  </div>)}
                  {Number(actionDetail.edit_count || 0) > 0 ? <div className="recovery-actions">
                    <button type="button" className="recovery-button" disabled={auditLoading || working || !audit.has_prev} onClick={() => loadAuditPage(Number(audit.page || 1) - 1)}>Previous edits</button>
                    <span className="recovery-muted">Page {audit.page || 1} · 10/page</span>
                    <button type="button" className="recovery-button" disabled={auditLoading || working || !audit.has_next} onClick={() => loadAuditPage(Number(audit.page || 1) + 1)}>Next edits</button>
                  </div> : null}
                </div>
              </> : null}
            </div> : null}
          </div>)}
          <div className="recovery-actions">
            <button className="recovery-button" type="button" disabled={loading || working || page <= 1} onClick={() => { setHistoryPage((p) => Math.max(1, p - 1)); setSelectedAction('') }}>Previous</button>
            <span className="recovery-muted">Page {page} · {records.length} records</span>
            <button className="recovery-button" type="button" disabled={loading || working || !hasNext} onClick={() => { setHistoryPage((p) => p + 1); setSelectedAction('') }}>Next</button>
          </div>
        </section>
      )}
    </>
  )
}

function BinanceRecipientForm({ recipientSearch, setRecipientSearch, recipientResults, recipient, searchingRecipient, onSearch, onSelect, onChangeRecipient, busy = false }) {
  return (
    <div className="recovery-form">
      {recipient ? (
        <div className="recovery-person chosen">
          <div>
            <strong>Selected account: {recipient.name || recipient.username || 'Unknown account'}</strong>
            <div className="recovery-sub">@{recipient.username || 'unknown'} · {recipient.id}</div>
            <div className="recovery-sub">Wallet: {Number(recipient.diamond_balance || 0).toLocaleString()} Diamonds</div>
          </div>
          <button className="recovery-button" type="button" disabled={busy || searchingRecipient} onClick={onChangeRecipient}>Change Account</button>
        </div>
      ) : (
        <>
          <form className="recovery-actions" onSubmit={onSearch}>
            <input className="recovery-input" style={{ flex: '1 1 220px' }} value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} minLength={2} maxLength={80} placeholder="Search Shadow account, username, email or User ID" required />
            <button className="recovery-button" type="submit" disabled={searchingRecipient || busy}>{searchingRecipient ? 'Searching...' : 'Find account'}</button>
          </form>
          {recipientResults.length > 0 ? (
            <div className="recovery-result-list">
              {recipientResults.map((user) => (
                <div className="recovery-person" key={user.id}>
                  <div>
                    <strong>{user.name || user.username || 'Unknown account'}</strong>
                    <div className="recovery-sub">@{user.username || 'unknown'} · {user.id}</div>
                    <div className="recovery-sub">Wallet: {Number(user.diamond_balance || 0).toLocaleString()} Diamonds</div>
                  </div>
                  <button className="recovery-button" type="button" disabled={busy || searchingRecipient} onClick={() => onSelect(user)}>Select account</button>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default function AdminPaymentRecoveryTopUpPage() {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [binanceBusy, setBinanceBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [appliedFilters, setAppliedFilters] = useState({ q: '', status: 'all', amount: '', date: '' })
  const [working, setWorking] = useState(false)
  const [recoveryRef, setRecoveryRef] = useState('')
  const [verifiedUsd, setVerifiedUsd] = useState('')
  const [bankPaidTime, setBankPaidTime] = useState('')
  const [recoveryReason, setRecoveryReason] = useState('')
  const [recoveryPin, setRecoveryPin] = useState('')
  const [bankVerified, setBankVerified] = useState(false)
  const [recipientVerified, setRecipientVerified] = useState(false)
  const [walletResult, setWalletResult] = useState(null)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [recipients, setRecipients] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupCoins, setTopupCoins] = useState('0')
  const [topupRef, setTopupRef] = useState('')
  const [topupReason, setTopupReason] = useState('')
  const [topupPin, setTopupPin] = useState('')
  const [topupConfirmed, setTopupConfirmed] = useState(false)
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyHasNext, setHistoryHasNext] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [expandedHistoryId, setExpandedHistoryId] = useState('')
  const [historyDetail, setHistoryDetail] = useState(null)
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false)
  const [historyDetailError, setHistoryDetailError] = useState('')
  const [historyDetailRefresh, setHistoryDetailRefresh] = useState(0)
  const [historyAudit, setHistoryAudit] = useState({ items: [], page: 1, has_next: false, has_prev: false })
  const [historyAuditLoading, setHistoryAuditLoading] = useState(false)
  const [editingHistoryId, setEditingHistoryId] = useState('')
  const [historyEditDraft, setHistoryEditDraft] = useState({ reference: '', mark_note: '', reason: '', passkey: '' })
  const [historyEditWorking, setHistoryEditWorking] = useState(false)
  const [historyEditError, setHistoryEditError] = useState('')
  const historyDetailRequestRef = useRef(0)
  const historyAuditRequestRef = useRef(0)
  const paymentsCacheRef = useRef(new Map())
  const historyCacheRef = useRef(new Map())
  const binanceCacheRef = useRef(new Map())

  function token() {
    return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  }

  async function request(path, options = {}) {
    const adminToken = token()
    if (!adminToken) throw new Error('Admin login required')
    const response = await fetch(`${API_URL}/api/admin/purchases/recovery${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${adminToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      cache: 'no-store',
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) throw new Error(result.message || 'Payment request failed')
    return result
  }

  const loadPayments = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', status: appliedFilters.status })
      if (appliedFilters.q) params.set('q', appliedFilters.q)
      if (appliedFilters.amount) params.set('amount', appliedFilters.amount)
      if (appliedFilters.date) params.set('date', appliedFilters.date)
      const response = await fetch(`${API_URL}/api/admin/purchases/recovery?${params.toString()}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''}` },
        signal,
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to search payment orders')
      if (signal.aborted) return
      const items = Array.isArray(data.payments) ? data.payments : []
      const hasNextPage = Boolean(data.has_next)
      const hasPreviousPage = Boolean(data.has_prev)
      paymentsCacheRef.current.set(JSON.stringify([page, appliedFilters]), { items, hasNextPage, hasPreviousPage })
      setPayments(items)
      setHasNext(hasNextPage)
      setHasPrev(hasPreviousPage)
    } catch (requestError) {
      if (signal.aborted) return
      setError(requestError.message || 'Unable to search payments')
      setPayments([])
      setHasNext(false)
      setHasPrev(false)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [page, appliedFilters])

  useEffect(() => {
    if (paymentMethod !== 'bank' || activeTab !== 'recovery') return undefined
    const cached = paymentsCacheRef.current.get(JSON.stringify([page, appliedFilters]))
    if (cached) {
      setPayments(cached.items)
      setHasNext(cached.hasNextPage)
      setHasPrev(cached.hasPreviousPage)
      setLoading(false)
      return undefined
    }
    setPayments([])
    const controller = new AbortController()
    loadPayments(controller.signal)
    return () => controller.abort()
  }, [paymentMethod, activeTab, loadPayments, refreshKey, page, appliedFilters])

  useEffect(() => {
    if (paymentMethod !== 'bank' || activeTab !== 'history') return undefined
    const cached = historyCacheRef.current.get(historyPage)
    if (cached) {
      setHistory(cached.items)
      setHistoryHasNext(cached.hasNext)
      setHistoryLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setHistory([])
    setHistoryLoading(true)
    setError('')
    const loadHistory = async () => {
      try {
        const data = await request('/history?page=' + historyPage + '&limit=10', { signal: controller.signal })
        const items = Array.isArray(data.items) ? data.items.slice(0, 10) : []
        let merged = items
        const ids = items.map((item) => String(item.id || '')).filter(Boolean)
        if (ids.length) {
          try {
            const metadata = await request('/history/metadata?ids=' + encodeURIComponent(ids.join(',')), { signal: controller.signal })
            const byActionId = new Map((Array.isArray(metadata.items) ? metadata.items : []).map((item) => [String(item.action_id), item]))
            merged = items.map((item) => ({ ...item, ...(byActionId.get(String(item.id)) || {}) }))
          } catch (metadataError) {
            if (!controller.signal.aborted) setError('Unable to load Updated labels: ' + (metadataError.message || 'Backend unavailable'))
          }
        }
        if (controller.signal.aborted) return
        const hasNext = Boolean(data.has_next)
        historyCacheRef.current.set(historyPage, { items: merged, hasNext })
        setHistory(merged)
        setHistoryHasNext(hasNext)
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message || 'Unable to load payment action history')
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false)
      }
    }
    loadHistory()
    return () => controller.abort()
  }, [paymentMethod, activeTab, historyPage, historyRefresh])

  useEffect(() => {
    if (paymentMethod !== 'bank' || activeTab !== 'history' || !expandedHistoryId) {
      setHistoryDetail(null)
      setHistoryDetailLoading(false)
      setHistoryDetailError('')
      return undefined
    }
    const controller = new AbortController()
    const requestId = ++historyDetailRequestRef.current
    setHistoryDetail(null)
    setHistoryAudit({ items: [], page: 1, has_next: false, has_prev: false })
    setHistoryDetailLoading(true)
    setHistoryDetailError('')
    request('/history/' + encodeURIComponent(expandedHistoryId), { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted || historyDetailRequestRef.current !== requestId) return
        if (!data.action) throw new Error('Payment action details are missing')
        setHistoryDetail(data.action)
        setHistoryAudit(data.edits || { items: [], page: 1, has_next: false, has_prev: false })
        setHistoryEditDraft({
          reference: String(data.action.display_reference || data.action.reference || ''),
          mark_note: String(data.action.mark_note || ''),
          reason: '',
          passkey: '',
        })
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && historyDetailRequestRef.current === requestId) {
          setHistoryDetailError(requestError.message || 'Unable to load action details')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && historyDetailRequestRef.current === requestId) setHistoryDetailLoading(false)
      })
    return () => {
      controller.abort()
      if (historyDetailRequestRef.current === requestId) historyDetailRequestRef.current += 1
    }
  }, [paymentMethod, activeTab, expandedHistoryId, historyDetailRefresh])
  function clearSensitive() {
    setRecoveryPin('')
    setTopupPin('')
    setBankVerified(false)
    setRecipientVerified(false)
    setTopupConfirmed(false)
  }

  function openPayment(payment) {
    setSelectedId(payment.id)
    setFeedback('')
    setError('')
    setRecoveryRef(payment.aba_trx_id || '')
    setVerifiedUsd(String(payment.amount_usd ?? payment.package_usd ?? ''))
    setBankPaidTime('')
    setRecoveryReason('')
    setWalletResult(null)
    clearSensitive()
  }

  function searchPayments(event) {
    event.preventDefault()
    setSelectedId('')
    setPage(1)
    setFeedback('')
    paymentsCacheRef.current.clear()
    setAppliedFilters({ q: query.trim(), status, amount: amount.trim(), date })
    setRefreshKey((v) => v + 1)
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setAmount('')
    setDate('')
    setSelectedId('')
    setPage(1)
    paymentsCacheRef.current.clear()
    setAppliedFilters({ q: '', status: 'all', amount: '', date: '' })
    setRefreshKey((v) => v + 1)
  }

  async function checkWallet(userId) {
    try {
      setError('')
      const data = await request(`/recipients?q=${encodeURIComponent(userId)}`)
      setWalletResult((data.users || []).find((user) => user.id === userId) || null)
    } catch (e) { setError(e.message) }
  }

  async function handleRecovery(event) {
    event.preventDefault()
    const selected = payments.find((payment) => payment.id === selectedId)
    if (!canRecover(selected) || working) return
    if (!bankVerified || !recipientVerified) { setError('Confirm both bank payment and recipient checks'); return }
    if (!/^\d{6}$/.test(recoveryPin)) { setError('Enter six-digit Passkey'); return }
    if (!bankPaidTime) { setError('Enter ABA transaction time in Cambodia'); return }
    const bankDate = new Date(`${bankPaidTime}:00+07:00`)
    if (Number.isNaN(bankDate.getTime())) { setError('Invalid ABA time'); return }
    if (!window.confirm(`Confirm release for ${displayName(selected)}\nOrder: ${selected.order_id}\nDiamonds: ${selected.diamonds}\nABA: ${recoveryRef}\nThis will credit the real wallet.`)) return
    setWorking(true)
    setError('')
    setFeedback('')
    try {
      const data = await request(`/${encodeURIComponent(selected.id)}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: selected.user_id,
          reference: recoveryRef.trim(),
          verified_amount_usd: Number(verifiedUsd),
          bank_paid_at: bankDate.toISOString(),
          reason: recoveryReason.trim(),
          passkey: recoveryPin,
          bank_verified: bankVerified,
          confirm_recipient: recipientVerified,
        }),
      })
      setFeedback(`Success: ${Number(data.result?.diamonds || 0)} Diamonds released · Wallet ${Number(data.result?.balance_before || 0)} → ${Number(data.result?.balance_after || 0)}`)
      setSelectedId('')
      setWalletResult(null)
      paymentsCacheRef.current.clear()
      historyCacheRef.current.clear()
      setRefreshKey((v) => v + 1)
      setHistoryRefresh((v) => v + 1)
      clearSensitive()
    } catch (e) { setError(e.message) }
    finally { setWorking(false); setRecoveryPin('') }
  }

  async function searchRecipient(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    setRecipient(null)
    setRecipients([])
    setTopupAmount('')
    setTopupCoins('0')
    setTopupRef('')
    setTopupReason('')
    setTopupConfirmed(false)
    setTopupPin('')
    setWorking(true)
    try {
      const data = await request(`/recipients?q=${encodeURIComponent(recipientSearch.trim())}`)
      setRecipients(data.users || [])
    } catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }

  function selectBankRecipient(user) {
    if (working) return
    setRecipient(user)
    setRecipients([])
    setRecipientSearch('')
    setTopupAmount('')
    setTopupCoins('0')
    setTopupRef('')
    setTopupReason('')
    clearSensitive()
    setFeedback('')
    setError('')
  }

  function changeBankRecipient() {
    if (working) return
    setRecipient(null)
    setRecipients([])
    setRecipientSearch('')
    setTopupAmount('')
    setTopupCoins('0')
    setTopupRef('')
    setTopupReason('')
    clearSensitive()
    setFeedback('')
    setError('')
  }

  async function handleTopUp(event) {
    event.preventDefault()
    if (!recipient || !topupConfirmed || working) { setError('Select and confirm the correct recipient'); return }
    const diamondCount = Number(topupAmount)
    const coinCount = Number(topupCoins)
    if (!Number.isSafeInteger(diamondCount) || diamondCount < 1 || diamondCount > 10000) {
      setError('Enter 1–10,000 Diamonds')
      return
    }
    if (topupCoins === '' || !Number.isSafeInteger(coinCount) || coinCount < 0 || coinCount > 100000) {
      setError('Enter 0–100,000 Coins')
      return
    }
    if (!/^\d{6}$/.test(topupPin)) { setError('Enter six-digit Passkey'); return }
    const accountName = recipient.name || recipient.username || 'Unknown account'
    if (!window.confirm(`Bank Manual Top-Up\nAccount: ${accountName} (@${recipient.username || 'unknown'})\nUser ID: ${recipient.id}\nDiamonds: ${diamondCount.toLocaleString()}\nCoins: ${coinCount.toLocaleString()} (expire 7 days after credit)\nReference: ${topupRef.trim()}\n\nConfirm this permanent Diamond credit and temporary Coin credit?`)) return
    setWorking(true)
    setError('')
    setFeedback('')
    try {
      const data = await request('/topup', {
        method: 'POST',
        body: JSON.stringify({
          user_id: recipient.id,
          diamonds: diamondCount,
          coins: coinCount,
          reference: topupRef.trim(),
          reason: topupReason.trim(),
          passkey: topupPin,
          confirmed: topupConfirmed,
        }),
      })
      const result = data.result || {}
      const walletBefore = Number(result.balance_before ?? recipient.diamond_balance ?? 0)
      const walletAfter = Number(result.balance_after ?? recipient.diamond_balance ?? 0)
      const coinsCredited = Number(result.coins ?? 0)
      const expiryText = result.coins_expires_at ? ` · Coins expire ${formatDate(result.coins_expires_at)}` : ''
      setFeedback(`Success: ${Number(result.diamonds ?? diamondCount).toLocaleString()} Diamonds · Wallet ${walletBefore.toLocaleString()} → ${walletAfter.toLocaleString()} · +${coinsCredited.toLocaleString()} Coins${expiryText}`)
      setRecipient((user) => user ? { ...user, diamond_balance: walletAfter } : user)
      setTopupAmount('')
      setTopupCoins('0')
      setTopupRef('')
      setTopupReason('')
      historyCacheRef.current.clear()
      setHistoryRefresh((v) => v + 1)
      clearSensitive()
    } catch (e) { setError(e.message) }
    finally { setWorking(false); setTopupPin('') }
  }

  function closeHistoryDetail() {
    historyAuditRequestRef.current += 1
    setHistoryAuditLoading(false)
    setExpandedHistoryId('')
    setEditingHistoryId('')
    setHistoryDetail(null)
    setHistoryDetailError('')
    setHistoryEditError('')
    setHistoryEditDraft((draft) => ({ ...draft, reason: '', passkey: '' }))
  }

  function toggleHistoryDetails(actionId) {
    if (historyEditWorking) return
    if (expandedHistoryId === actionId) {
      closeHistoryDetail()
    } else {
      closeHistoryDetail()
      setExpandedHistoryId(actionId)
    }
  }

  function beginHistoryEdit(actionId) {
    if (historyEditWorking) return
    setHistoryEditError('')
    setFeedback('')
    if (expandedHistoryId !== actionId) {
      closeHistoryDetail()
      setExpandedHistoryId(actionId)
    }
    setEditingHistoryId(actionId)
  }

  async function loadHistoryAuditPage(actionId, nextPage) {
    if (historyAuditLoading || !historyDetail || historyDetail.id !== actionId || nextPage < 1) return
    const requestId = ++historyAuditRequestRef.current
    setHistoryAuditLoading(true)
    setHistoryDetailError('')
    try {
      const data = await request('/history/' + encodeURIComponent(actionId) + '/edits?page=' + nextPage)
      if (historyAuditRequestRef.current !== requestId) return
      setHistoryAudit({
        items: Array.isArray(data.items) ? data.items : [],
        page: Number(data.page || nextPage),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (requestError) {
      if (historyAuditRequestRef.current === requestId) {
        setHistoryDetailError(requestError.message || 'Unable to load edit audit history')
      }
    } finally {
      if (historyAuditRequestRef.current === requestId) setHistoryAuditLoading(false)
    }
  }

  async function handleHistoryEdit(event) {
    event.preventDefault()
    if (historyEditWorking || !historyDetail || historyDetail.id !== editingHistoryId) return
    const nextReference = historyEditDraft.reference.trim().toUpperCase()
    const nextMark = historyEditDraft.mark_note.trim()
    const currentReference = String(historyDetail.display_reference || historyDetail.reference || '').trim().toUpperCase()
    const currentMark = String(historyDetail.mark_note || '').trim()
    const referenceChanged = nextReference !== currentReference
    const markChanged = nextMark !== currentMark
    const reason = historyEditDraft.reason.trim()
    const passkey = historyEditDraft.passkey.trim()
    if (!referenceChanged && !markChanged) {
      setHistoryEditError('Change the reference or mark before saving.')
      return
    }
    if (referenceChanged && !/^[A-Z0-9][A-Z0-9._/-]{5,99}$/.test(nextReference)) {
      setHistoryEditError('Reference must contain 6–100 valid letters, numbers, dots, underscores, hyphens or slashes.')
      return
    }
    if (nextMark.length > 300 || reason.length < 12 || reason.length > 500 || !/^[0-9]{6}$/.test(passkey)) {
      setHistoryEditError('Check the 300-character mark, 12–500-character reason, and six-digit Admin Passkey.')
      return
    }
    setHistoryEditWorking(true)
    setHistoryEditError('')
    setFeedback('')
    try {
      const actionId = editingHistoryId
      const currentEditCount = Number(historyDetail.edit_count || 0)
      const data = await request('/history/' + encodeURIComponent(actionId), {
        method: 'PATCH',
        body: JSON.stringify({
          reference: referenceChanged ? nextReference : null,
          mark_note: markChanged ? nextMark : null,
          reason,
          passkey,
          expected_edit_count: currentEditCount,
        }),
      })
      const result = Array.isArray(data.result) ? data.result[0] : data.result || {}
      const amended = {
        display_reference: String(result.display_reference || nextReference || currentReference),
        mark_note: result.mark_note == null ? nextMark : String(result.mark_note),
        edit_count: Number.isFinite(Number(result.edit_count)) ? Number(result.edit_count) : currentEditCount + 1,
        updated_at: result.updated_at || new Date().toISOString(),
      }
      const updateRows = (items) => items.map((item) => item.id === actionId ? { ...item, ...amended } : item)
      setHistory((items) => updateRows(items))
      for (const [cachePage, cached] of historyCacheRef.current.entries()) {
        historyCacheRef.current.set(cachePage, { ...cached, items: updateRows(cached.items) })
      }
      historyAuditRequestRef.current += 1
      setHistoryEditDraft((draft) => ({ ...draft, passkey: '', reason: '' }))
      setEditingHistoryId('')
      setFeedback('Action History was updated. The original financial transaction and wallet balances were not changed.')
      setError('')
      setHistoryDetailRefresh((value) => value + 1)
    } catch (requestError) {
      setHistoryEditError(requestError.message || 'Unable to save edit')
    } finally {
      setHistoryEditDraft((draft) => ({ ...draft, passkey: '' }))
      setHistoryEditWorking(false)
    }
  }

  function changePaymentMethod(method) {
    if (historyEditWorking || binanceBusy) return
    setPaymentMethod(method)
    setActiveTab('')
    setSelectedId('')
    setRecipient(null)
    setRecipients([])
    setRecipientSearch('')
    setTopupAmount('')
    setTopupCoins('0')
    setTopupRef('')
    setTopupReason('')
    closeHistoryDetail()
    setError('')
    setFeedback('')
    clearSensitive()
  }

  function changeTab(tab) {
    if (historyEditWorking || binanceBusy) return
    setActiveTab(tab)
    setSelectedId('')
    setRecipient(null)
    setRecipients([])
    setRecipientSearch('')
    setTopupAmount('')
    setTopupCoins('0')
    setTopupRef('')
    setTopupReason('')
    closeHistoryDetail()
    setError('')
    setFeedback('')
    clearSensitive()
  }

  function refreshPayments() {
    paymentsCacheRef.current.clear()
    setRefreshKey((v) => v + 1)
  }

  function refreshHistory() {
    if (historyEditWorking) return
    closeHistoryDetail()
    historyCacheRef.current.clear()
    setHistoryRefresh((v) => v + 1)
  }

  function changeHistoryPage(nextPage) {
    if (historyLoading || historyEditWorking || nextPage < 1) return
    closeHistoryDetail()
    setHistoryPage(nextPage)
  }

  const selected = payments.find((payment) => payment.id === selectedId)
  const releasedCount = payments.filter(isReleased).length

  return (
    <AdminLayout title="Payment Recovery & Top-Up" subtitle="Review Bank and Binance payments before wallet changes.">
      <style>{styles}</style>
      <div className="recovery-page">
        <section className="recovery-card">
          <div className="recovery-intro">
            <div>
              <div className="recovery-eyebrow">Admin payment tools</div>
              <h2 className="recovery-heading">Payment Recovery & Top-Up</h2>
              <div className="recovery-muted">Choose a payment method and section to load its records.</div>
            </div>
            <span className="recovery-tag">Six-digit Passkey required</span>
          </div>
          <div className="recovery-method-tabs">
            <button type="button" className={`recovery-method ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => changePaymentMethod('bank')} disabled={historyEditWorking || binanceBusy}>Bank</button>
            <button type="button" className={`recovery-method binance ${paymentMethod === 'binance' ? 'active' : ''}`} onClick={() => changePaymentMethod('binance')} disabled={historyEditWorking || binanceBusy}>Binance</button>
          </div>
          {paymentMethod ? <div className="recovery-tabs">
            <button type="button" className={`recovery-tab ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => changeTab('recovery')} disabled={historyEditWorking || binanceBusy}>Payment Recovery</button>
            <button type="button" className={`recovery-tab ${activeTab === 'topup' ? 'active' : ''}`} onClick={() => changeTab('topup')} disabled={historyEditWorking || binanceBusy}>Manual Top-Up</button>
            <button type="button" className={`recovery-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => changeTab('history')} disabled={historyEditWorking || binanceBusy}>Action History</button>
            {paymentMethod === 'binance' ? (
              <button type="button" className={`recovery-tab ${activeTab === 'checkout_review' ? 'active' : ''}`} onClick={() => changeTab('checkout_review')} disabled={historyEditWorking || binanceBusy}>Checkout Review</button>
            ) : null}
          </div> : null}
        </section>

        {feedback ? <div className="recovery-success" role="status">{feedback}</div> : null}
        {error ? <div className="recovery-error" role="alert" style={{ margin: 0 }}>{error}</div> : null}

        {!paymentMethod ? (
          <section className="recovery-card recovery-preview">
            <h3>Choose Bank or Binance</h3>
            <p className="recovery-muted">No payment data is fetched until you open a section.</p>
          </section>
        ) : !activeTab ? (
          <section className="recovery-card recovery-preview">
            <h3>{paymentMethod === 'bank' ? 'Bank' : 'Binance'} payment tools</h3>
            <p className="recovery-muted">Choose Payment Recovery, Manual Top-Up, or Action History to continue. No data has been requested.</p>
          </section>
        ) : paymentMethod === 'binance' && activeTab === 'checkout_review' ? (
          <BinanceCheckoutReviewPanel onBusyChange={setBinanceBusy} />
        ) : paymentMethod === 'binance' ? (
          <BinanceAdminPanel key={activeTab} tab={activeTab} cacheRef={binanceCacheRef} onBusyChange={setBinanceBusy} />
        ) : activeTab === 'recovery' ? (
          <>
            <div className="recovery-stats">
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Orders on this page</span><strong className="recovery-stat-value">{payments.length}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Marked released</span><strong className="recovery-stat-value">{releasedCount}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Not marked released</span><strong className="recovery-stat-value">{payments.length - releasedCount}</strong></div>
            </div>
            <section className="recovery-card">
              <div className="recovery-section-head">
                <div><h3>Payment orders</h3><div className="recovery-muted">Database search: username, Order ID, ABA reference, payer, date, or amount.</div></div>
                <button className="recovery-button" type="button" disabled={loading || working} onClick={refreshPayments}>{loading ? 'Loading...' : 'Refresh'}</button>
              </div>
              <form className="recovery-controls" onSubmit={searchPayments}>
                <input className="recovery-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search account, order, ABA reference..." aria-label="Search payment orders" />
                <select className="recovery-input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Payment status">
                  <option value="all">All statuses</option><option value="released">Released</option><option value="unreleased">Not released</option><option value="waiting_payment">Waiting</option><option value="pending_review">Need review</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
                </select>
                <input className="recovery-input" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="USD amount" aria-label="USD amount" />
                <input className="recovery-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date Cambodia" />
                <button className="recovery-button recovery-primary" type="submit" disabled={loading}>Search</button>
                <button className="recovery-button" type="button" disabled={loading} onClick={clearFilters}>Clear</button>
              </form>
              <p className="recovery-notice">10 records per page. Without a search term, results cover the last 30 days. The database cannot independently prove ABA settlement. Always verify the official bank transaction before recovery.</p>
              <div className="recovery-table-wrap">
                <table className="recovery-table">
                  <thead><tr><th>Account</th><th>Order ID</th><th>USD</th><th>Diamonds</th><th>Status</th><th>Created (KH)</th><th></th></tr></thead>
                  <tbody>{payments.map((payment) => (
                    <tr key={payment.id} className={selectedId === payment.id ? 'recovery-row-active' : ''}>
                      <td><strong>{displayName(payment)}</strong><div className="recovery-sub">
  @{payment.user?.username || 'unknown'}
</div>
<div className="recovery-sub">
  <strong>
    Source: {
      payment.purchase_type === 'premium' ||
      payment.payment_method === 'premium_aba_payment_link'
        ? `Shadow Premium · ${payment.premium_plan_months || '?'} Months`
        : 'Diamond Store Purchase'
    }
  </strong>
</div>
                      <td><strong>{payment.order_id || '—'}</strong><div className="recovery-sub">{payment.payer_name || 'Payer not recorded'}</div></td>
                      <td>${Number(payment.amount_usd ?? payment.package_usd ?? 0).toFixed(2)}</td>
                      <td>{Number(payment.diamonds || 0).toLocaleString()}</td>
                      <td><span className={`recovery-pill ${isReleased(payment) ? 'success' : payment.status || ''}`}>{isReleased(payment) ? 'Released' : payment.status || 'Unknown'}</span></td>
                      <td>{formatDate(payment.created_at)}</td>
                      <td><button className="recovery-button" type="button" onClick={() => openPayment(payment)}>Details</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!loading && !payments.length ? <div className="recovery-empty">No matching orders. Try a username or Order ID.</div> : null}
              </div>
              {selected ? (
                <div className="recovery-detail">
                  <h4>Selected payment details</h4>
                  <dl className="recovery-detail-grid">
                    <div><dt>Account</dt><dd>{displayName(selected)} @{selected.user?.username || ''}</dd></div>
                    <div><dt>User ID</dt><dd>{selected.user_id || '—'}</dd></div>
                    <div><dt>Order ID</dt><dd>{selected.order_id || '—'}</dd></div>
                    <div><dt>Purchase</dt><dd>{selected.purchase_type || 'diamonds'} · {selected.premium_plan_months || 0} Premium months · {selected.payment_method || 'unknown method'}</dd></div>
                    <div><dt>ABA Trx ID</dt><dd>{selected.aba_trx_id || 'Not recorded'}</dd></div>
                    <div><dt>Release time</dt><dd>{formatDate(selected.released_at)}</dd></div>
                    <div><dt>Match status</dt><dd>{selected.match_status || '—'}</dd></div>
                    <div><dt>Payment status</dt><dd>{selected.status || '—'}</dd></div>
                    <div><dt>Order amount</dt><dd>${Number(selected.amount_usd ?? selected.package_usd ?? 0).toFixed(2)} · {selected.diamonds} Diamonds · {selected.bonus_gems || 0} Coins</dd></div>
                  </dl>
                  <div className="recovery-actions" style={{ marginTop: 14 }}>
                    <button type="button" className="recovery-button" disabled={working} onClick={() => checkWallet(selected.user_id)}>Check current wallet</button>
                    {walletResult?.id === selected.user_id ? <strong>Wallet: {Number(walletResult.diamond_balance || 0).toLocaleString()} Diamonds</strong> : null}
                  </div>
                  {isReleased(selected) ? (
                    <p className="recovery-notice" style={{ margin: '16px 0 0' }}>This order is already marked released and cannot be credited again here.</p>
                  ) : !canRecover(selected) ? (
                    <p className="recovery-notice" style={{ margin: '16px 0 0' }}>This payment method or order status cannot be released by the ABA recovery tool.</p>
                  ) : (
                    <form className="recovery-form" onSubmit={handleRecovery}>
                      <h4 style={{ margin: 0 }}>Verify bank transfer, then release</h4>
                      <div className="recovery-form-grid">
                        <label>ABA transaction ID or bank reference<input className="recovery-input" value={recoveryRef} onChange={(e) => setRecoveryRef(e.target.value)} required maxLength={100} placeholder="Actual ABA transaction reference" /></label>
                        <label>Bank payment amount (USD)<input className="recovery-input" type="number" step="0.01" min="0.01" value={verifiedUsd} onChange={(e) => setVerifiedUsd(e.target.value)} required /></label>
                        <label>ABA payment time (Cambodia +07:00)<input className="recovery-input" type="datetime-local" value={bankPaidTime} onChange={(e) => setBankPaidTime(e.target.value)} required /></label>
                        <label>Six-digit Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={recoveryPin} onChange={(e) => setRecoveryPin(e.target.value)} placeholder="******" required /></label>
                      </div>
                      <label>Why does this order need recovery?<textarea className="recovery-input" value={recoveryReason} onChange={(e) => setRecoveryReason(e.target.value)} maxLength={500} minLength={12} required placeholder="Explain the verified ABA payment and missing automatic release" /></label>
                      <label className="recovery-check"><input type="checkbox" checked={bankVerified} onChange={(e) => setBankVerified(e.target.checked)} /> I verified the actual transfer in official ABA bank records (amount, reference, date/time).</label>
                      <label className="recovery-check"><input type="checkbox" checked={recipientVerified} onChange={(e) => setRecipientVerified(e.target.checked)} /> I confirmed the account, Order ID, and that the user was not credited already.</label>
                      <div className="recovery-actions"><button className="recovery-button recovery-primary" disabled={working || !bankVerified || !recipientVerified} type="submit">{working ? 'Processing...' : 'Release with Passkey'}</button></div>
                    </form>
                  )}
                </div>
              ) : null}
              <div className="recovery-footer">
                <span className="recovery-muted">Page {page} · {payments.length} orders shown</span>
                <div className="recovery-actions">
                  <button type="button" className="recovery-button" disabled={loading || !hasPrev} onClick={() => { setSelectedId(''); setPage((p) => Math.max(1, p - 1)) }}>Previous</button>
                  <button type="button" className="recovery-button" disabled={loading || !hasNext} onClick={() => { setSelectedId(''); setPage((p) => p + 1) }}>Next</button>
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'topup' ? (
          <section className="recovery-card recovery-preview">
            <h3>Bank · Manual Diamonds + Coins Top-Up</h3>
            <p className="recovery-muted">Only Owner/Admin accounts with Passkey can credit Diamonds and Coins. Diamonds are permanent; Coins expire 7 days after credit. Use Payment Recovery for an existing ABA order. Manual adjustments require a unique reference and detailed reason.</p>
            {recipient ? (
              <div className="recovery-person chosen">
                <div>
                  <strong>Selected account: {recipient.name || recipient.username || 'Unknown account'}</strong>
                  <div className="recovery-sub">@{recipient.username || 'unknown'} · {recipient.id}</div>
                  <div className="recovery-sub">Wallet: {Number(recipient.diamond_balance || 0).toLocaleString()} Diamonds</div>
                </div>
                <button type="button" className="recovery-button" disabled={working} onClick={changeBankRecipient}>Change Account</button>
              </div>
            ) : (
              <>
                <form className="recovery-actions" onSubmit={searchRecipient}>
                  <input className="recovery-input" style={{ flex: '1 1 220px' }} value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} placeholder="Exact username, name, email or User ID" minLength={2} maxLength={80} required />
                  <button type="submit" className="recovery-button" disabled={working}>{working ? 'Searching...' : 'Find account'}</button>
                </form>
                {recipients.length ? (
                  <div className="recovery-result-list">
                    {recipients.map((user) => (
                      <div key={user.id} className="recovery-person">
                        <div>
                          <strong>{user.name || user.username || 'Unknown account'}</strong>
                          <div className="recovery-sub">@{user.username || 'unknown'} · {user.id}</div>
                          <div className="recovery-sub">Wallet: {Number(user.diamond_balance || 0).toLocaleString()} Diamonds</div>
                        </div>
                        <button type="button" className="recovery-button" disabled={working} onClick={() => selectBankRecipient(user)}>Select account</button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
            {recipient ? (
              <form className="recovery-form" onSubmit={handleTopUp}>
                <div className="recovery-form-grid">
                  <label>Diamonds to credit (1–10,000)<input className="recovery-input" type="number" min="1" max="10000" step="1" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} required /></label>
                  <label>Coins to credit (0–100,000 · expire in 7 days)<input className="recovery-input" type="number" min="0" max="100000" step="1" value={topupCoins} onChange={(e) => setTopupCoins(e.target.value)} required /></label>
                  <label>Unique ABA / adjustment reference<input className="recovery-input" value={topupRef} onChange={(e) => setTopupRef(e.target.value)} maxLength={100} required placeholder="ABA reference or ADJ-XXXXXX" /></label>
                  <label>Six-digit Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={topupPin} onChange={(e) => setTopupPin(e.target.value)} required placeholder="******" /></label>
                </div>
                <label>Detailed reason<textarea className="recovery-input" minLength={12} maxLength={500} required value={topupReason} onChange={(e) => setTopupReason(e.target.value)} placeholder="Explain why this adjustment was approved and identify the supporting record" /></label>
                <label className="recovery-check"><input type="checkbox" checked={topupConfirmed} onChange={(e) => setTopupConfirmed(e.target.checked)} /> I confirm this exact recipient, Diamond and Coin amounts, the 7-day Coin expiry, and that the reference is authorized and not a duplicate.</label>
                <button type="submit" className="recovery-button recovery-primary" disabled={working || !topupConfirmed}>{working ? 'Processing...' : 'Confirm Manual Top-Up'}</button>
              </form>
            ) : <p className="recovery-notice" style={{ margin: 0 }}>Select a recipient first. No Diamonds or Coins will be credited until Passkey is verified by the Backend.</p>}
          </section>
        ) : (
          <section className="recovery-card recovery-history">
            <div className="recovery-section-head" style={{ padding: 0, border: 0 }}>
              <div>
                <h3>Recovery & Top-Up Action History</h3>
                <p className="recovery-muted">10 records per page. Bank Manual Coins show the credited, spent, remaining and expired amounts. Refresh for the latest expiry status.</p>
              </div>
              <button type="button" className="recovery-button" onClick={refreshHistory} disabled={historyLoading || historyEditWorking}>Refresh</button>
            </div>
            {historyLoading ? <p className="recovery-muted">Loading action history...</p> : null}
            {!historyLoading && !history.length ? <div className="recovery-empty">No recovery actions have been recorded.</div> : null}
            {history.map((action) => {
              const isOpen = expandedHistoryId === action.id
              const detail = isOpen && historyDetail?.id === action.id ? historyDetail : action
              const editCount = Number(detail.edit_count || 0)
              return <div className="recovery-history-item" key={action.id}>
                <div className="recovery-actions">
                  <strong>{detail.user_name || action.user_name || 'Unknown account'} · {Number(action.diamonds || 0).toLocaleString()} Diamonds{action.action_type === 'topup' ? ` · +${Number(action.coin_grant?.issued_coins ?? 0).toLocaleString()} Coins` : ''}</strong>
                  {editCount > 0 ? <span className="recovery-update-badge">Updated · {editCount}</span> : null}
                </div>
                <div className="recovery-sub">Reference {detail.display_reference || detail.reference || '—'} · {formatDate(action.created_at)}</div>
                {detail.mark_note ? <div className="recovery-sub">Mark: {detail.mark_note}</div> : null}
                <div className="recovery-actions" style={{ marginTop: 11 }}>
                  <button type="button" className="recovery-button" disabled={historyEditWorking} onClick={() => toggleHistoryDetails(action.id)}>
                    {isOpen ? 'Hide Details' : 'View Details'}
                  </button>
                  <button type="button" className="recovery-button" disabled={historyEditWorking} onClick={() => beginHistoryEdit(action.id)}>
                    {editingHistoryId === action.id ? 'Editing...' : 'Edit'}
                  </button>
                </div>
                {isOpen ? <>
                  {historyDetailLoading ? <p className="recovery-muted">Loading verified details and edit history...</p> : null}
                  {historyDetailError ? <div className="recovery-inline-error" role="alert">{historyDetailError}</div> : null}
                  <dl className="recovery-detail-grid" style={{ marginTop: 15 }}>
                    <div><dt>Action ID</dt><dd>{detail.id}</dd></div>
                    <div><dt>Action type</dt><dd>{detail.action_type || '—'}</dd></div>
                    <div><dt>Account</dt><dd>{detail.user_name || action.user_name || '—'}</dd></div>
                    <div><dt>User ID</dt><dd>{detail.user_id || '—'}</dd></div>
                    <div><dt>Payment ID</dt><dd>{detail.payment_id || '—'}</dd></div>
                    <div><dt>Original reference</dt><dd>{detail.reference || '—'}</dd></div>
                    <div><dt>Display reference</dt><dd>{detail.display_reference || detail.reference || '—'}</dd></div>
                    <div><dt>Mark / Note</dt><dd>{detail.mark_note || '—'}</dd></div>
                    <div><dt>USD</dt><dd>{detail.amount_usd == null ? '—' : Number(detail.amount_usd).toFixed(2)}</dd></div>
                    <div><dt>Diamonds credited</dt><dd>{Number(detail.diamonds || 0).toLocaleString()}</dd></div>
                    {action.action_type === 'topup' ? <>
                      <div><dt>Manual Coins credited</dt><dd>{Number(action.coin_grant?.issued_coins ?? 0).toLocaleString()}</dd></div>
                      {action.coin_grant ? <>
                        <div><dt>Coins spent</dt><dd>{Number(action.coin_grant.spent_coins || 0).toLocaleString()}</dd></div>
                        <div><dt>Coins expired</dt><dd>{Number(action.coin_grant.expired_coins || 0).toLocaleString()}</dd></div>
                        <div><dt>Coins remaining</dt><dd>{Number(action.coin_grant.remaining_coins || 0).toLocaleString()}</dd></div>
                        <div><dt>Coins credited at</dt><dd>{formatDate(action.coin_grant.credited_at)}</dd></div>
                        <div><dt>Coins expire at</dt><dd>{formatDate(action.coin_grant.expires_at)}</dd></div>
                        <div><dt>Expiry status</dt><dd>{action.coin_grant.processed_at ? 'Expired / processed' : Number(action.coin_grant.remaining_coins || 0) === 0 ? 'Fully spent' : new Date(action.coin_grant.expires_at).getTime() <= Date.now() ? 'Expiry pending' : 'Active (7 days)'}</dd></div>
                      </> : null}
                    </> : null}
                    <div><dt>Bank paid at</dt><dd>{formatDate(detail.bank_paid_at)}</dd></div>
                    <div><dt>Wallet before</dt><dd>{Number(detail.balance_before || 0).toLocaleString()}</dd></div>
                    <div><dt>Wallet after</dt><dd>{Number(detail.balance_after || 0).toLocaleString()}</dd></div>
                    <div><dt>Admin</dt><dd>{detail.admin_email || '—'}</dd></div>
                    <div><dt>Original reason</dt><dd>{detail.reason || '—'}</dd></div>
                    <div><dt>Created</dt><dd>{formatDate(detail.created_at)}</dd></div>
                    {editCount > 0 ? <>
                      <div><dt>Last updated</dt><dd>{formatDate(detail.updated_at)}</dd></div>
                      <div><dt>Last edited by</dt><dd>{detail.updated_by_email || '—'}</dd></div>
                    </> : null}
                  </dl>
                  {editingHistoryId === action.id && historyDetail?.id === action.id ? <div className="recovery-edit-panel">
                    <form className="recovery-form" onSubmit={handleHistoryEdit}>
                      <h4 style={{ margin: 0 }}>Edit Action History</h4>
                      <div className="recovery-read-only">Only the displayed reference and admin mark can change. Original records, Diamonds, USD, and wallet balances remain read-only.</div>
                      <div className="recovery-form-grid">
                        <label>Display reference
                          <input className="recovery-input" required maxLength={100} value={historyEditDraft.reference} onChange={(event) => setHistoryEditDraft((draft) => ({ ...draft, reference: event.target.value }))} />
                        </label>
                        <label>Admin Mark / Note
                          <textarea className="recovery-input" maxLength={300} value={historyEditDraft.mark_note} onChange={(event) => setHistoryEditDraft((draft) => ({ ...draft, mark_note: event.target.value }))} placeholder="Optional annotation (not a payment status)" />
                        </label>
                        <label>Six-digit Admin Passkey
                          <input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} minLength={6} pattern="[0-9]{6}" required value={historyEditDraft.passkey} onChange={(event) => setHistoryEditDraft((draft) => ({ ...draft, passkey: event.target.value }))} placeholder="******" />
                        </label>
                      </div>
                      <label>Reason for edit (12–500 characters)
                        <textarea className="recovery-input" required minLength={12} maxLength={500} value={historyEditDraft.reason} onChange={(event) => setHistoryEditDraft((draft) => ({ ...draft, reason: event.target.value }))} placeholder="Explain the correction and supporting evidence" />
                      </label>
                      {historyEditError ? <div className="recovery-inline-error" role="alert">{historyEditError}</div> : null}
                      <div className="recovery-actions">
                        <button className="recovery-button recovery-primary" disabled={historyEditWorking} type="submit">{historyEditWorking ? 'Saving...' : 'Save Edit with Passkey'}</button>
                        <button className="recovery-button" type="button" disabled={historyEditWorking} onClick={() => { setEditingHistoryId(''); setHistoryEditError(''); setHistoryEditDraft((draft) => ({ ...draft, reason: '', passkey: '' })) }}>Cancel</button>
                      </div>
                    </form>
                  </div> : null}
                  {historyDetail?.id === action.id ? <div className="recovery-audit">
                    <div className="recovery-actions" style={{ justifyContent: 'space-between' }}>
                      <strong>Permanent Edit History</strong>
                      <span className="recovery-muted">{editCount} edit{editCount === 1 ? '' : 's'} recorded</span>
                    </div>
                    {historyAuditLoading ? <p className="recovery-muted">Loading edits...</p> : null}
                    {!historyAuditLoading && !historyAudit.items?.length ? <p className="recovery-muted">No edits recorded for this action.</p> : null}
                    {(historyAudit.items || []).map((edit) => <div className="recovery-audit-row" key={edit.id}>
                      <strong>Revision #{edit.edit_number} · {formatDate(edit.created_at)}</strong>
                      <p>Reference: <del>{edit.old_reference || '—'}</del> → <strong>{edit.new_reference || '—'}</strong></p>
                      <p>Mark: <del>{edit.old_mark || '—'}</del> → <strong>{edit.new_mark || '—'}</strong></p>
                      <p>Edited by: <strong>{edit.admin_email || '—'}</strong></p>
                      <p>Reason: {edit.reason || '—'}</p>
                    </div>)}
                    {editCount > 0 ? <div className="recovery-actions">
                      <button type="button" className="recovery-button" disabled={historyAuditLoading || historyEditWorking || !historyAudit.has_prev} onClick={() => loadHistoryAuditPage(action.id, historyAudit.page - 1)}>Previous edits</button>
                      <span className="recovery-muted">Edit page {historyAudit.page || 1} · 10/page</span>
                      <button type="button" className="recovery-button" disabled={historyAuditLoading || historyEditWorking || !historyAudit.has_next} onClick={() => loadHistoryAuditPage(action.id, historyAudit.page + 1)}>Next edits</button>
                    </div> : null}
                  </div> : null}
                </> : null}
              </div>
            })}
            <div className="recovery-actions">
              <button type="button" className="recovery-button" disabled={historyLoading || historyEditWorking || historyPage <= 1} onClick={() => changeHistoryPage(Math.max(1, historyPage - 1))}>Previous</button>
              <span className="recovery-muted">Page {historyPage} · {history.length} records</span>
              <button type="button" className="recovery-button" disabled={historyLoading || historyEditWorking || !historyHasNext} onClick={() => changeHistoryPage(historyPage + 1)}>Next</button>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
