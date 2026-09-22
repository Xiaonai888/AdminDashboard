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
  onRecorded,
}) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [receiptPath, setReceiptPath] = useState('')
  const [pin, setPin] = useState('')
  const [reference, setReference] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [uncertain, setUncertain] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFile(null)
    setReceiptPath('')
    setPin('')
    setReference('')
    setConfirmed(false)
    setRecorded(false)
    setUncertain(false)
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

  const awaiting = recorded || payout.status === 'awaiting_receipt'
  const method = payout.payment_method_snapshot || {}
  const qrUrl = method.qr_image_url || ''
  const methodName = method.bank_name || method.display_name || method.method_type || 'Payment details missing'
  const accountName = method.account_name || method.paypal_name || ''
  const destination = method.account_number || method.paypal_email || method.phone_number || ''
  const savedPath = receiptPath || payout.receipt_path || ''
  const validPin = /^\d{6}$/.test(pin)
  const canRecord = !awaiting && !uncertain && !busy && confirmed && validPin && reference.trim().length >= 4 && reference.trim().length <= 120 && Boolean(payout.payment_method_id) && Number(payout.net_payout_usd) >= 10
  const canFinish = awaiting && !uncertain && !busy && validPin && (Boolean(savedPath) || Boolean(file))

  async function request(url, options) {
    const response = await fetch(url, options)
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) {
      const failure = new Error(result.message || 'Could not complete this action. Check payout status before retrying.')
      failure.code = result.code || ''
      failure.status = response.status
      throw failure
    }
    return result
  }

  function close() {
    if (busy) return
    if (uncertain && !window.confirm('Check the current payout status before taking any further action. Close?')) return
    onClose()
  }

  function chooseFile(nextFile) {
    setError('')
    if (!nextFile) {
      setFile(null)
      return
    }
    if (!ALLOWED_RECEIPT_TYPES.includes(nextFile.type) || nextFile.size < 100 || nextFile.size > MAX_RECEIPT_BYTES) {
      setFile(null)
      setError('Choose a PNG, JPG, or WEBP receipt between 100 bytes and 2 MB.')
      return
    }
    setFile(nextFile)
  }

  async function recordTransfer(event) {
    event.preventDefault()
    if (!canRecord) return
    if (!window.confirm(`Have you ALREADY transferred ${formatUsd(payout.net_payout_usd)} to ${authorName(payout)}? This action records a completed bank transfer; it does not send money.`)) return
    setBusy(true)
    setError('')
    try {
      const result = await request(`${apiUrl}/api/admin/income/payouts/${payout.id}/transfer-record`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          passkey_pin: pin,
          transfer_confirmed: true,
          transfer_reference: reference.trim(),
        }),
      })
      if (result.result?.status !== 'awaiting_receipt' || result.result?.already_recorded) {
        throw new Error('Verify the payout status before continuing. Do not transfer again.')
      }
      setRecorded(true)
      setPin('')
      setConfirmed(false)
      onRecorded?.(payout.id, reference.trim())
    } catch (caught) {
      if (caught.code === 'TRANSFER_ALREADY_RECORDED') {
        setRecorded(true)
        setPin('')
        setReference('')
        setError('Transfer was previously recorded. Do not transfer again. Upload the receipt instead.')
        onRecorded?.()
      } else {
        setPin('')
        setError(caught.message || 'Could not record the transfer. Check its status before retrying.')
        if (!caught.status || caught.status >= 500) setUncertain(true)
        onRecorded?.()
      }
    } finally {
      setBusy(false)
    }
  }

  async function confirmPaid(event) {
    event.preventDefault()
    if (!canFinish) return
    setBusy(true)
    setError('')
    try {
      let path = savedPath
      if (!path) {
        const body = new FormData()
        body.append('receipt', file)
        const result = await request(`${apiUrl}/api/admin/income/payouts/${payout.id}/receipt`, {
          method: 'POST',
          headers: authHeaders(),
          body,
        })
        if (!result.receipt_path) throw new Error('The server did not return the saved receipt path.')
        path = result.receipt_path
        setReceiptPath(path)
      }
      if (!window.confirm('The transfer was recorded. Confirm this saved bank receipt belongs to that transfer and mark the payout paid?')) return
      const result = await request(`${apiUrl}/api/admin/income/payouts/${payout.id}/paid`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ receipt_path: path, passkey_pin: pin, admin_note: reference.trim().slice(0, 120) }),
      })
      if (result.result?.already_paid) throw new Error('Payout was already marked paid. Refresh the payout list.')
      setPin('')
      await onPaid()
    } catch (caught) {
      setPin('')
      setError(caught.message || 'Could not confirm payout. Check its status before retrying.')
      if (!caught.status || caught.status >= 500 || caught.code === 'ALREADY_PAID') setUncertain(true)
      onRecorded?.()
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
          {qrUrl ? <img className="story-payout-qr" src={qrUrl} alt={`${authorName(payout)} payment QR`} /> : <span className="story-payout-muted">Bank QR not saved. Verify the recipient details before transferring outside Shadow.</span>}
        </div>
        <form onSubmit={awaiting ? confirmPaid : recordTransfer}>
          {awaiting ? (
            <>
              <p className="story-payout-muted" role="status" style={{ color: '#9A3412', fontWeight: 800 }}>Transfer recorded. DO NOT transfer again. Upload the receipt from that transfer, or finish using the saved receipt.</p>
              {payout.transfer_reference || reference ? <p className="story-payout-muted">Transfer reference: {payout.transfer_reference || reference}</p> : null}
              {savedPath ? <p className="story-payout-muted" style={{ color: '#047857' }}>Receipt saved. Enter your Owner Passkey to finish.</p> : <><label className="story-payout-label" htmlFor="story-payout-receipt">Actual bank transfer receipt · required</label><input id="story-payout-receipt" className="story-payout-input" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || uncertain} onChange={(event) => chooseFile(event.target.files?.[0] || null)} /></>}
              {preview && !savedPath ? <img src={preview} alt="Selected bank transfer receipt" style={{ marginTop: 10, maxWidth: '100%', maxHeight: 230, objectFit: 'contain', borderRadius: 10 }} /> : null}
            </>
          ) : (
            <>
              <p className="story-payout-muted" role="status" style={{ color: '#9A3412', fontWeight: 800 }}>Complete the bank transfer OUTSIDE Shadow first. Only then record the completed transaction here. Shadow does not send money automatically.</p>
              <label className="story-payout-label" htmlFor="story-payout-reference">Actual bank transfer transaction reference · required</label>
              <input id="story-payout-reference" className="story-payout-input" minLength={4} maxLength={120} value={reference} disabled={busy || uncertain} onChange={(event) => setReference(event.target.value)} placeholder="Bank transaction ID" />
              <label style={{ display: 'flex', gap: 9, alignItems: 'start', marginTop: 15, fontSize: 12, fontWeight: 750, lineHeight: 1.5 }}><input type="checkbox" checked={confirmed} disabled={busy || uncertain} onChange={(event) => setConfirmed(event.target.checked)} />I confirm that the money was ALREADY sent to this author and the bank transaction reference is correct.</label>
            </>
          )}
          <label className="story-payout-label" htmlFor="story-payout-pin">Owner Passkey · 6 digits</label>
          <input id="story-payout-pin" className="story-payout-input" type="password" autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin} disabled={busy || uncertain} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" />
          {uncertain ? <p role="alert" style={{ color: '#9A3412', fontWeight: 850, fontSize: 12 }}>Server response was uncertain. Close, refresh the payout list and check the current status before any further action. Do not transfer again.</p> : null}
          {error ? <div role="alert" style={{ marginTop: 12, padding: 10, borderRadius: 10, background: '#FEF2F2', color: '#B91C1C', fontSize: 12 }}>{error}</div> : null}
          <div className="story-payout-actions">
            <button type="button" onClick={close} disabled={busy} style={{ background: '#E2E8F0', color: '#334155' }}>Close</button>
            <button type="submit" disabled={awaiting ? !canFinish : !canRecord} style={{ background: awaiting ? '#047857' : '#B45309', color: '#FFF' }}>{busy ? 'Processing…' : awaiting ? 'Confirm Paid · Saved Receipt' : 'Record Completed Transfer'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
