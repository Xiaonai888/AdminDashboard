import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MESSAGE_ID_RE = /^[1-9]\d{0,14}$/

export default function AdminBinanceTelegramReconcilePanel({ row, onReconcile, onSuccess }) {
  const titleId = useId()
  const firstInputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [messageId, setMessageId] = useState('')
  const [reason, setReason] = useState('')
  const [passkey, setPasskey] = useState('')
  const [checkedMessage, setCheckedMessage] = useState(false)
  const [checkedTransaction, setCheckedTransaction] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const uncertain = row?.telegram_alert_status === 'sending'
    && String(row?.last_alert_error || '').startsWith('DELIVERY_UNKNOWN')
  const transactionId = String(row?.transaction_id || '').trim()

  useEffect(() => {
    if (!open) return undefined
    firstInputRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, busy])

  function beginReview() {
    setMessageId(row?.telegram_message_id ? String(row.telegram_message_id) : '')
    setReason('')
    setPasskey('')
    setCheckedMessage(false)
    setCheckedTransaction(false)
    setError('')
    setOpen(true)
  }

  async function submit(event) {
    event.preventDefault()
    if (busy || !uncertain || !transactionId) return
    const id = messageId.trim()
    const note = reason.trim()
    if (!MESSAGE_ID_RE.test(id) || !Number.isSafeInteger(Number(id))) {
      setError('Enter the ID of the existing Telegram bot message.')
      return
    }
    if (note.length < 12 || note.length > 500) {
      setError('Enter a detailed reason between 12 and 500 characters.')
      return
    }
    if (!checkedMessage || !checkedTransaction) {
      setError('Verify the existing message and its exact transaction ID first.')
      return
    }
    if (!/^\d{6}$/.test(passkey)) {
      setError('Enter the six-digit Admin Passkey.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onReconcile(transactionId, {
        telegram_message_id: id,
        reason: note,
        verified_existing_message: true,
        verified_transaction_id: true,
        passkey,
      })
      setOpen(false)
      setReason('')
      setMessageId('')
      setCheckedMessage(false)
      setCheckedTransaction(false)
      onSuccess?.()
    } catch (requestError) {
      setError(requestError?.message || 'Could not verify this Telegram message.')
    } finally {
      setPasskey('')
      setBusy(false)
    }
  }

  if (!uncertain) return <span className="recovery-read-only">Read only</span>

  return <>
    <button type="button" className="recovery-button" disabled={busy} onClick={beginReview}>
      Review / Reconcile
    </button>
    {open && createPortal(
      <div
        role="presentation"
        style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.56)', overflowY: 'auto' }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{ width: 'min(100%, 570px)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', background: 'var(--shadow-bg-surface, #fff)', color: 'var(--shadow-text-primary, #111827)', borderRadius: 16, padding: 20, border: '1px solid var(--shadow-border, #e5e7eb)', boxShadow: '0 18px 60px rgba(0,0,0,.2)' }}
        >
          <h3 id={titleId} style={{ margin: '0 0 8px', fontSize: 18 }}>Verify Existing Binance Telegram Report</h3>
          <p className="recovery-notice" style={{ margin: '0 0 14px' }}>
            DELIVERY_UNKNOWN: A message may already have reached Telegram. This action only edits an existing bot message. It never sends a new message or credits a wallet.
          </p>
          <div className="recovery-detail-grid" style={{ marginBottom: 12 }}>
            <div><strong>Transaction</strong><div style={{ overflowWrap: 'anywhere' }}>{transactionId}</div></div>
            <div><strong>Amount</strong><div>{row.amount_usdt} USDT</div></div>
            <div><strong>Payer</strong><div>{row.payer_name || 'Unknown'}</div></div>
            <div><strong>Attempts</strong><div>{Number(row.attempt_count) || 0}</div></div>
          </div>
          <form onSubmit={submit} className="recovery-form" style={{ display: 'grid', gap: 12 }}>
            <label>Existing Telegram Message ID
              <input ref={firstInputRef} className="recovery-input" inputMode="numeric" value={messageId} maxLength={15} onChange={(event) => setMessageId(event.target.value.replace(/\D/g, ''))} placeholder="Message ID (not Transaction ID)" required disabled={busy} />
            </label>
            <label>Reason for reconciliation
              <textarea className="recovery-input" minLength={12} maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain how you verified the existing message in the Binance Telegram group" required disabled={busy} />
            </label>
            <label className="recovery-check">
              <input type="checkbox" checked={checkedMessage} onChange={(event) => setCheckedMessage(event.target.checked)} disabled={busy} />
              I personally found this existing message in the configured Binance Telegram group.
            </label>
            <label className="recovery-check">
              <input type="checkbox" checked={checkedTransaction} onChange={(event) => setCheckedTransaction(event.target.checked)} disabled={busy} />
              I confirmed it belongs to this exact Binance Transaction ID.
            </label>
            <label>Admin Passkey
              <input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" value={passkey} maxLength={6} onChange={(event) => setPasskey(event.target.value.replace(/\D/g, ''))} placeholder="6 digits" required disabled={busy} />
            </label>
            {error ? <div className="recovery-error" role="alert">{error}</div> : null}
            <div className="recovery-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="recovery-button" disabled={busy} onClick={() => { setOpen(false); setPasskey('') }}>Cancel</button>
              <button type="submit" className="recovery-button recovery-primary" disabled={busy || !checkedMessage || !checkedTransaction}>
                {busy ? 'Verifying...' : 'Reconcile Existing Message'}
              </button>
            </div>
          </form>
        </section>
      </div>,
      document.body
    )}
  </>
}
