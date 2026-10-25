import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  decideBinanceCheckoutReview,
  getBinanceCheckoutReview,
  listBinanceCheckoutReviews,
} from '../services/binanceCheckoutAdminApi'
import { BINANCE_REVIEW_LANGUAGES, binanceReviewText } from './binanceCheckoutReviewI18n'
import BinanceCheckoutEvidencePanel from './BinanceCheckoutEvidencePanel'
import BinanceCheckoutDecisionForm from './BinanceCheckoutDecisionForm'

const CSS = `
  .binrev{--br-surface:var(--shadow-admin-card,#fff);--br-text:var(--shadow-admin-text,#17213b);--br-muted:var(--shadow-admin-muted,#64748b);--br-border:var(--shadow-admin-border,#e2e8f0);--br-soft:#f8fafc;--br-accent:#f3ba2f;display:grid;gap:16px;color:var(--br-text);font-family:inherit}
  html.dark .binrev,[data-theme="dark"] .binrev{--br-surface:#202331;--br-text:#f1f5f9;--br-muted:#a1acc1;--br-border:#364153;--br-soft:#171923}
  .binrev *{box-sizing:border-box}
  .binrev-top,.binrev-controls,.binrev-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .binrev-top h2{margin:0;font-size:20px;line-height:1.3;font-weight:900}
  .binrev-top p,.binrev-help{margin:6px 0 0;color:var(--br-muted);font-size:12px;line-height:1.7}
  .binrev-card,.binrev-detail{background:var(--br-surface);border:1px solid var(--br-border);border-radius:16px;padding:16px}
  .binrev-card{overflow:hidden}
  .binrev-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .binrev-input,.binrev-select{min-height:39px;background:var(--br-surface);border:1px solid var(--br-border);border-radius:10px;color:var(--br-text);font:inherit;font-size:13px;padding:9px 11px;max-width:100%;width:100%}
  .binrev-select{width:auto}
  .binrev-btn{appearance:none;border:1px solid var(--br-border);background:var(--br-surface);color:var(--br-text);border-radius:10px;padding:10px 14px;font:inherit;font-size:12px;font-weight:800;cursor:pointer;min-height:40px}
  .binrev-btn:disabled{opacity:.5;cursor:not-allowed}
  .binrev-btn:focus-visible,.binrev-input:focus-visible,.binrev-select:focus-visible{outline:2px solid #d49b00;outline-offset:2px}
  .binrev-btn:hover:not(:disabled){border-color:#d59f2f}
  .binrev-approve{background:#dba91c;color:#171717;border-color:#dba91c}
  .binrev-reject{background:#8b2736;color:#fff;border-color:#8b2736}
  .binrev-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,1.05fr);gap:14px;align-items:start}
  .binrev-tablewrap{max-width:100%;overflow:auto}
  .binrev-table{border-collapse:collapse;width:100%;min-width:560px}
  .binrev-table th{font-size:11px;font-weight:900;text-align:left;padding:12px;color:var(--br-muted);background:var(--br-soft)}
  .binrev-table td{font-size:12px;padding:12px;border-top:1px solid var(--br-border);vertical-align:middle;max-width:190px;overflow-wrap:anywhere}
  .binrev-table tr.binrev-active{background:var(--br-soft)}
  .binrev-table strong{font-weight:900}
  .binrev-muted{font-size:11px;color:var(--br-muted);overflow-wrap:anywhere;line-height:1.6}
  .binrev-status{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;background:var(--br-soft);border:1px solid var(--br-border);font-size:11px;font-weight:800}
  .binrev-placeholder{text-align:center;font-size:12px;color:var(--br-muted);padding:35px 12px}
  .binrev-error,.binrev-alert,.binrev-warning{font-size:12px;line-height:1.6;margin:12px 0;padding:10px 12px;border-radius:10px;border:1px solid #d7a1a9;color:#912438;background:rgba(244,63,94,.05)}
  .binrev-warning{border-color:#caa44e;background:rgba(234,179,8,.08);color:var(--br-text)}
  .binrev-notice{font-size:12px;line-height:1.5;color:var(--br-text);margin:0;padding:11px;border:1px solid var(--br-border);border-radius:11px}
  .binrev-detail{margin:0 0 14px;padding:15px}
  .binrev-detail h3{margin:0 0 15px;font-size:15px}
  .binrev-detail h4{margin:17px 0 11px;font-size:13px}
  .binrev-facts{margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
  .binrev-fact{min-width:0}.binrev-fact dt{font-size:11px;color:var(--br-muted);margin-bottom:4px}.binrev-fact dd{margin:0;font-size:12px;font-weight:750;overflow-wrap:anywhere;line-height:1.5}
  .binrev-signal{display:flex;gap:10px;align-items:center;font-size:12px}.binrev-signals{display:grid;gap:8px}
  .binrev-signal span:first-child{font-size:14px;font-weight:900}
  .binrev-review-state{font-size:12px;overflow-wrap:anywhere}
  .binrev-form{display:grid;gap:14px}.binrev-label{display:grid;gap:7px;font-size:12px;font-weight:750}
  .binrev-choice{display:flex;gap:16px;flex-wrap:wrap}
  .binrev-choice label,.binrev-checks label{display:flex;align-items:flex-start;gap:9px;font-size:12px;line-height:1.6;cursor:pointer}
  .binrev-choice input,.binrev-checks input{accent-color:#dba91c;margin-top:4px;flex-shrink:0}
  .binrev-checks{display:grid;gap:9px;padding:12px;border:1px solid var(--br-border);border-radius:11px}
  .binrev-pager{padding-top:12px;border-top:1px solid var(--br-border)}
  .binrev-detail-head{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:9px}
  @media(max-width:1100px){.binrev-grid{grid-template-columns:1fr}}
  @media(max-width:560px){.binrev-facts{grid-template-columns:1fr}.binrev-card{padding:12px}.binrev-top{align-items:flex-start}.binrev-toolbar{width:100%}}
`

function formatDate(value) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'short', timeStyle: 'short' }) : '—'
}

export default function BinanceCheckoutReviewPanel({ language: initialLanguage = 'en', onBusyChange }) {
  const [language, setLanguage] = useState(initialLanguage)
  const [status, setStatus] = useState('submitted')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [rows, setRows] = useState([])
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState('')
  const detailController = useRef(null)
  const t = useCallback(key => binanceReviewText(language, key), [language])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setRows([])
    setError('')
    listBinanceCheckoutReviews({ page, status, signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return
        setRows(Array.isArray(data.items) ? data.items.slice(0, 10) : [])
        setHasNext(Boolean(data.has_next))
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message || t('loadFailed')) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, status, reload, t])

  useEffect(() => () => {
    detailController.current?.abort()
    if (typeof onBusyChange === 'function') onBusyChange(false)
  }, [onBusyChange])

  const openOrder = useCallback(async orderId => {
    detailController.current?.abort()
    const controller = new AbortController()
    detailController.current = controller
    setSelectedId(orderId)
    setDetail(null)
    setDetailError('')
    setNotice('')
    setDetailLoading(true)
    try {
      const data = await getBinanceCheckoutReview(orderId, { signal: controller.signal })
      if (!controller.signal.aborted) setDetail(data.item || null)
    } catch (err) {
      if (!controller.signal.aborted) setDetailError(err.message || 'Unable to load payment details.')
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false)
    }
  }, [])

  function changeStatus(value) {
    detailController.current?.abort()
    setSelectedId('')
    setDetail(null)
    setNotice('')
    setStatus(value)
    setPage(1)
  }

  function changePage(nextPage) {
    detailController.current?.abort()
    setSelectedId('')
    setDetail(null)
    setNotice('')
    setPage(nextPage)
  }

  async function submitDecision(action, payload) {
    if (!detail?.order_id || working) throw new Error('Choose a valid payment order.')
    setWorking(true)
    if (typeof onBusyChange === 'function') onBusyChange(true)
    try {
      const result = await decideBinanceCheckoutReview(detail.order_id, action, payload)
      if (result.result?.ok !== true) throw new Error('Payment decision was not confirmed.')
      setNotice(t(action === 'approve' ? 'successApprove' : 'successReject'))
      setReload(value => value + 1)
      await openOrder(detail.order_id)
    } finally {
      setWorking(false)
      if (typeof onBusyChange === 'function') onBusyChange(false)
    }
  }

  return (
    <section className="binrev" aria-label={t('title')}>
      <style>{CSS}</style>
      <div className="binrev-top">
        <div><h2>{t('title')}</h2><p>{t('subtitle')}</p></div>
        <div className="binrev-toolbar">
          <select className="binrev-select" aria-label={t('language')} value={language} onChange={event => setLanguage(event.target.value)}>
            {BINANCE_REVIEW_LANGUAGES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className="binrev-select" aria-label={t('status')} value={status} onChange={event => changeStatus(event.target.value)} disabled={working}>
            {['submitted', 'approved', 'rejected', 'all'].map(option => <option key={option} value={option}>{t(option === 'submitted' ? 'pending' : option)}</option>)}
          </select>
          <button className="binrev-btn" type="button" onClick={() => setReload(value => value + 1)} disabled={loading || working}>{t('refresh')}</button>
        </div>
      </div>
      <div className="binrev-grid">
        <div className="binrev-card">
          {error ? <p className="binrev-error" role="alert">{error} <button type="button" className="binrev-btn" onClick={() => setReload(value => value + 1)}>{t('reload')}</button></p> : null}
          {loading ? <p className="binrev-placeholder">{t('loading')}</p> : null}
          {!loading && !error && rows.length === 0 ? <p className="binrev-placeholder">{t('empty')}</p> : null}
          {!loading && rows.length > 0 ? (
            <div className="binrev-tablewrap"><table className="binrev-table"><thead><tr>
              <th>{t('reader')}</th><th>{t('transaction')}</th><th>{t('amount')}</th><th>{t('status')}</th><th>{t('review')}</th>
            </tr></thead><tbody>{rows.map(item => (
              <tr key={item.order_id} className={selectedId === item.order_id ? 'binrev-active' : ''}>
                <td><strong>{item.user?.name || item.user?.username || '—'}</strong><div className="binrev-muted">{formatDate(item.submitted_at)}</div></td>
                <td className="binrev-muted">{item.transaction_id || '—'}</td>
                <td>{item.order?.amount_usdt == null ? '—' : `${item.order.amount_usdt} USDT`}</td>
                <td><span className="binrev-status">{t(item.claim_status === 'submitted' ? 'pending' : item.claim_status)}</span></td>
                <td><button className="binrev-btn" type="button" onClick={() => openOrder(item.order_id)} disabled={working}>{t('details')}</button></td>
              </tr>
            ))}</tbody></table></div>
          ) : null}
          <div className="binrev-pager">
            <button className="binrev-btn" type="button" disabled={page <= 1 || loading || working} onClick={() => changePage(page - 1)}>{t('back')}</button>
            <span className="binrev-muted">{t('page')} {page}</span>
            <button className="binrev-btn" type="button" disabled={!hasNext || loading || working} onClick={() => changePage(page + 1)}>{t('next')}</button>
          </div>
        </div>
        <div className="binrev-card">
          <div className="binrev-detail-head"><strong>{t('details')}</strong>{selectedId ? <button className="binrev-btn" type="button" disabled={working} onClick={() => { detailController.current?.abort(); setSelectedId(''); setDetail(null); setDetailError('') }}>{t('close')}</button> : null}</div>
          {notice ? <p className="binrev-notice" role="status">{notice}</p> : null}
          {!selectedId ? <p className="binrev-placeholder">{t('selected')}</p> : null}
          {selectedId && detailLoading ? <p className="binrev-placeholder">{t('loading')}</p> : null}
          {selectedId && detailError ? <p className="binrev-error" role="alert">{detailError}<button className="binrev-btn" type="button" onClick={() => openOrder(selectedId)}>{t('reload')}</button></p> : null}
          {selectedId && !detailLoading && detail ? (
            <>
              <BinanceCheckoutEvidencePanel item={detail} t={t} />
              <BinanceCheckoutDecisionForm key={detail.order_id} item={detail} onDecide={submitDecision} disabled={working} t={t} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
