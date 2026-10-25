import React from 'react'

function formatTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  return date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })
}

function Fact({ title, value }) {
  return <div className="binrev-fact"><dt>{title}</dt><dd>{value === null || value === undefined || value === '' ? '—' : value}</dd></div>
}

function Signal({ label, okay }) {
  return <div className="binrev-signal"><span aria-hidden="true">{okay ? '✓' : '×'}</span><span>{label}</span></div>
}

export default function BinanceCheckoutEvidencePanel({ item, t }) {
  if (!item) return null
  const order = item.order || {}
  const evidence = item.evidence || {}
  const receipt = item.receipt || null
  const user = item.user || {}
  return (
    <section className="binrev-detail" aria-label={t('evidence')}>
      <h3>{t('details')}</h3>
      <dl className="binrev-facts">
        <Fact title={t('reader')} value={user.name || user.username || user.id} />
        <Fact title={t('account')} value={user.id} />
        <Fact title={t('order')} value={item.order_id} />
        <Fact title={t('transaction')} value={item.transaction_id} />
        <Fact title={t('status')} value={item.claim_status} />
        <Fact title={t('package')} value={order.package_usd == null ? '—' : `$${order.package_usd}`} />
        <Fact title={t('amount')} value={order.amount_usdt == null ? '—' : `${order.amount_usdt} USDT`} />
        <Fact title={t('diamonds')} value={order.diamonds} />
        <Fact title={t('vouchers')} value={order.bonus_vouchers} />
        <Fact title={t('receiver')} value={order.receiver_uid && order.receiver_name ? `${order.receiver_name} · ${order.receiver_uid}` : '—'} />
        <Fact title={t('submitted')} value={formatTimestamp(item.submitted_at)} />
      </dl>
      <h4>{t('receipt')}</h4>
      {receipt ? (
        <dl className="binrev-facts">
          <Fact title={t('transaction')} value={receipt.transaction_id} />
          <Fact title={t('amount')} value={`${receipt.amount_usdt} ${receipt.currency}`} />
          <Fact title={t('reader')} value={receipt.payer_name || '—'} />
          <Fact title={t('submitted')} value={formatTimestamp(receipt.transaction_time_ms)} />
        </dl>
      ) : <p className="binrev-alert">{t('noReceipt')}</p>}
      <h4>{t('evidence')}</h4>
      <div className="binrev-signals">
        <Signal label={t('recordMatch')} okay={evidence.income_recorded === true} />
        <Signal label={t('currencyMatch')} okay={evidence.currency_matches === true} />
        <Signal label={t('amountMatch')} okay={evidence.amount_matches === true} />
      </div>
      <p className="binrev-review-state"><strong>{t('state')}:</strong> {evidence.status || '—'}</p>
      <p className="binrev-warning">{t('caution')}</p>
    </section>
  )
}
