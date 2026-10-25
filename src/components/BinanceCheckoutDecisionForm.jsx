import React, { useEffect, useState } from 'react'

const INITIAL_CHECKS = { official: false, reader: false, receiver: false }

export default function BinanceCheckoutDecisionForm({ item, onDecide, t, disabled = false }) {
  const [action, setAction] = useState('reject')
  const [checks, setChecks] = useState(INITIAL_CHECKS)
  const [reason, setReason] = useState('')
  const [passkey, setPasskey] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAction('reject')
    setChecks(INITIAL_CHECKS)
    setReason('')
    setPasskey('')
    setError('')
  }, [item?.order_id])

  if (!item) return null
  const isPending = item.claim_status === 'submitted' && item.order?.status === 'pending_review'
  const evidence = item.evidence || {}
  const canApprove = isPending && evidence.status === 'identity_verification_required' && evidence.income_recorded === true
    && evidence.currency_matches === true && evidence.amount_matches === true
  const allChecked = checks.official && checks.reader && checks.receiver
  const canSubmit = !disabled && !working && isPending && (action === 'reject' || canApprove && allChecked)
    && reason.trim().length >= 12 && reason.trim().length <= 500 && /^\d{6}$/.test(passkey)

  async function submit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setWorking(true)
    setError('')
    try {
      await onDecide(action, {
        reason: reason.trim(),
        passkey,
        official_receipt_verified: checks.official,
        recipient_verified: checks.reader,
        receiver_verified: checks.receiver,
      })
      setPasskey('')
      setChecks(INITIAL_CHECKS)
      setReason('')
    } catch (requestError) {
      setPasskey('')
      setError(requestError?.message || 'Payment decision failed.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <section className="binrev-detail">
      <h3>{t('decision')}</h3>
      {!isPending ? <p className="binrev-warning">{t('onlyPending')}</p> : null}
      {isPending && !canApprove ? <p className="binrev-warning">{t('notReady')}</p> : null}
      <p className="binrev-help">{t('notice')}</p>
      <form onSubmit={submit} className="binrev-form">
        <div className="binrev-choice" role="group" aria-label={t('decision')}>
          <label><input type="radio" name={`binance-review-action-${item.order_id}`} value="reject" checked={action === 'reject'} disabled={working || disabled || !isPending} onChange={() => { setAction('reject'); setPasskey(''); setChecks(INITIAL_CHECKS) }} />{t('reject')}</label>
          <label><input type="radio" name={`binance-review-action-${item.order_id}`} value="approve" checked={action === 'approve'} disabled={working || disabled || !canApprove} onChange={() => { setAction('approve'); setPasskey('') }} />{t('approve')}</label>
        </div>
        {action === 'approve' ? (
          <div className="binrev-checks">
            <label><input type="checkbox" checked={checks.official} disabled={!canApprove || working || disabled} onChange={event => setChecks(old => ({ ...old, official: event.target.checked }))} />{t('checkOfficial')}</label>
            <label><input type="checkbox" checked={checks.reader} disabled={!canApprove || working || disabled} onChange={event => setChecks(old => ({ ...old, reader: event.target.checked }))} />{t('checkReader')}</label>
            <label><input type="checkbox" checked={checks.receiver} disabled={!canApprove || working || disabled} onChange={event => setChecks(old => ({ ...old, receiver: event.target.checked }))} />{t('checkReceiver')}</label>
          </div>
        ) : null}
        <label className="binrev-label">{t('reason')}<textarea className="binrev-input" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} minLength={12} rows={3} disabled={!isPending || working || disabled} required /></label>
        <label className="binrev-label">{t('passkey')}<input className="binrev-input" type="password" inputMode="numeric" autoComplete="off" value={passkey} onChange={event => setPasskey(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} pattern="[0-9]{6}" disabled={!isPending || working || disabled} required /></label>
        {error ? <p role="alert" className="binrev-error">{error}</p> : null}
        <button className={`binrev-btn ${action === 'approve' ? 'binrev-approve' : 'binrev-reject'}`} type="submit" disabled={!canSubmit}>{working ? t('processing') : t(action === 'approve' ? 'approve' : 'reject')}</button>
      </form>
    </section>
  )
}
