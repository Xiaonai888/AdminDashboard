import React, { useEffect, useState } from 'react'

const MAX_RECEIPT_BYTES = 2 * 1024 * 1024
const ALLOWED_RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export default function AdminStoryPayoutConfirmModal({
  payout,
  apiUrl,
  authHeaders,
  authorName,
  formatUsd,
  onClose,
  onPaid,
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [receiptPath, setReceiptPath] = useState('')
  const [pin, setPin] = useState('')
  const [reference, setReference] = useState('')
  const [transferred, setTransferred] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFile(null)
    setReceiptPath('')
    setPin('')
    setReference('')
    setTransferred(false)
    setError('')
  }, [payout?.id])

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!payout) return null

  const method = payout.payment_method_snapshot || {}
  const qrUrl = method.qr_image_url || ''
  const methodName = method.bank_name || method.display_name || method.method_type || 'Payment method missing'
  const accountName = method.account_name || method.paypal_name || ''
  const destination = method.account_number || method.paypal_email || method.phone_number || ''
  const canConfirm = transferred && file && /^\d{6}$/.test(pin) && !busy && payout.status === 'scheduled'

  function close() {
    if (busy) return
    if (transferred && !window.confirm('If you sent the money, save the receipt and confirm this payout before leaving. Leave anyway?')) return
    onClose()
  }

  function chooseFile(nextFile) {
    setError('')
    setReceiptPath('')
    if (!nextFile) {
      setFile(null)
      return
    }
    if (!ALLOWED_RECEIPT_TYPES.includes(nextFile.type) || nextFile.size < 100 || nextFile.size > MAX_RECEIPT_BYTES) {
      setFile(null)
      setError('Choose a PNG, JPG, or WEBP bank receipt of no more than 2 MB.')
      return
    }
    setFile(nextFile)
  }

  async function submit(event) {
    event.preventDefault()
    if (!canConfirm) return
    if (!window.confirm(`Confirm that you have actually sent ${formatUsd(payout.net_payout_usd)} to ${authorName(payout)}?`)) return

    setBusy(true)
    setError('')
    try {
      let path = receiptPath
      if (!path) {
        const body = new FormData()
        body.append('receipt', file)
        const response = await fetch(`${apiUrl}/api/admin/income/payouts/${payout.id}/receipt`, {
          method: 'POST',
          headers: authHeaders(),
          body,
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result.ok === false || !result.receipt_path) {
          throw new Error(result.message || 'Could not save the payment receipt.')
        }
        path = result.receipt_path
        setReceiptPath(path)
      }

      const response = await fetch(`${apiUrl}/api/admin/income/payouts/${payout.id}/paid`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          receipt_path: path,
          passkey_pin: pin,
          admin_note: reference.trim().slice(0, 120),
        }),
      })
      const result = await response.json().catch(() => ({}))
      setPin('')
      if (!response.ok || result.ok === false) {
        throw new Error(result.message || 'Could not confirm this payout.')
      }
      await onPaid()
    } catch (caught) {
      setPin('')
      setError(caught.message || 'Payout confirmation failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="story-payout-overlay" role="presentation">
      <style>{`
        .story-payout-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(15, 23, 42, .72); }
        .story-payout-modal { width: min(510px, 100%); max-height: 94vh; overflow-y: auto; border-radius: 22px; border: 1px solid #E2E8F0; background: #FFF; color: #0F172A; padding: 22px; box-shadow: 0 20px 70px rgba(0,0,0,.25); }
        .story-payout-modal h2 { margin: 0; font-size: 20px; font-weight: 900; }
        .story-payout-info { margin: 15px 0; padding: 14px; border-radius: 15px; background: #F8FAFC; border: 1px solid #E2E8F0; display: grid; gap: 8px; }
        .story-payout-muted { color: #64748B; font-size: 12px; line-height: 1.55; }
        .story-payout-label { display: block; margin: 13px 0 6px; font-size: 12px; font-weight: 800; }
        .story-payout-input { width: 100%; min-height: 42px; padding: 10px; border-radius: 11px; border: 1px solid #CBD5E1; background: #FFF; color: #0F172A; font: inherit; box-sizing: border-box; }
        .story-payout-actions { display: flex; gap: 9px; margin-top: 16px; }
        .story-payout-actions button { flex: 1; border: 0; border-radius: 12px; min-height: 44px; font-weight: 850; cursor: pointer; }
        .story-payout-actions button:disabled { opacity: .5; cursor: not-allowed; }
        .story-payout-qr { width: min(180px, 100%); max-height: 190px; object-fit: contain; border-radius: 12px; border: 1px solid #E2E8F0; padding: 5px; background: white; }
      `}</style>
      <section className="story-payout-modal" role="dialog" aria-modal="true" aria-labelledby="story-payout-title">
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 id="story-payout-title">Story Payout · {formatUsd(payout.net_payout_usd)}</h2>
            <div className="story-payout-muted">{authorName(payout)} · {payout.payout_month}</div>
          </div>
          <button type="button" onClick={close} disabled={busy} aria-label="Close payout" style={{ border: 0, background: '#F1F5F9', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="story-payout-info">
          <strong>{methodName}</strong>
          {accountName ? <span>{accountName}</span> : null}
          {destination ? <span>{destination}</span> : null}
          {qrUrl ? <img className="story-payout-qr" src={qrUrl} alt={`${authorName(payout)} payment QR`} /> : <span className="story-payout-muted">No Bank QR saved. Check the payment method before transferring.</span>}
        </div>
        <form onSubmit={submit}>
          <p className="story-payout-muted">Send the money in your banking app first. Then attach the actual transfer receipt and enter your owner Passkey.</p>
          <label className="story-payout-label" htmlFor="story-payout-receipt">Bank transfer receipt · required</label>
          <input id="story-payout-receipt" className="story-payout-input" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(event) => chooseFile(event.target.files?.[0] || null)} />
          {preview ? <img src={preview} alt="Selected bank transfer receipt" style={{ marginTop: 10, maxWidth: '100%', maxHeight: 230, objectFit: 'contain', borderRadius: 10 }} /> : null}
          {receiptPath ? <div className="story-payout-muted" style={{ color: '#047857', marginTop: 8 }}>Receipt saved. Enter your Passkey to finish.</div> : null}
          <label className="story-payout-label" htmlFor="story-payout-reference">Transaction reference · optional</label>
          <input id="story-payout-reference" className="story-payout-input" maxLength={120} value={reference} disabled={busy} onChange={(event) => setReference(event.target.value)} placeholder="Bank transaction ID or note" />
          <label className="story-payout-label" htmlFor="story-payout-pin">Owner Passkey · 6 digits</label>
          <input id="story-payout-pin" className="story-payout-input" type="password" autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin} disabled={busy} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" />
          <label style={{ display: 'flex', gap: 9, alignItems: 'start', marginTop: 15, fontSize: 12, fontWeight: 750, lineHeight: 1.5 }}>
            <input type="checkbox" checked={transferred} disabled={busy} onChange={(event) => setTransferred(event.target.checked)} />
            I confirm that I have sent the money to this author and the attached receipt is from that transfer.
          </label>
          {error ? <div role="alert" style={{ marginTop: 12, padding: 10, borderRadius: 10, background: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>{error}</div> : null}
          <div className="story-payout-actions">
            <button type="button" onClick={close} disabled={busy} style={{ background: '#E2E8F0', color: '#334155' }}>Cancel</button>
            <button type="submit" disabled={!canConfirm} style={{ background: '#047857', color: '#FFF' }}>{busy ? 'Processing…' : 'Confirm Paid'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
