import { useCallback, useEffect, useRef, useState } from 'react'
import './EpisodeSalesEventPopup.css'

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(3)}`
}

function formatEventDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(value) {
  if (value === null || value === undefined) return 'Not recorded'
  const total = Number(value)
  if (!Number.isFinite(total)) return 'Not recorded'
  if (total <= 0) return 'Ended'
  const minutes = Math.ceil(total / 60)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const remainder = minutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${remainder}m`
  return `${remainder}m`
}

function authorLabel(item) {
  return item?.author?.page_name || item?.author?.page_username || 'Author'
}

export function useEpisodeSalesEventPopup(apiUrl, getHeaders, onSelect) {
  const [eventPopup, setEventPopup] = useState({
    open: false,
    loading: false,
    error: '',
    item: null,
    data: null,
  })
  const requestRef = useRef(null)

  useEffect(() => () => requestRef.current?.abort(), [])

  const closeEventPopup = useCallback(() => {
    requestRef.current?.abort()
    setEventPopup((previous) => ({ ...previous, open: false }))
  }, [])

  const openEventPopup = useCallback(async (item) => {
    if (!item?.purchase_key) return
    onSelect(item.purchase_key)
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setEventPopup({ open: true, loading: true, error: '', item, data: null })

    try {
      const params = new URLSearchParams({ event_purchase_key: item.purchase_key })
      const response = await fetch(
        `${apiUrl}/api/admin/income/episode-sales?${params.toString()}`,
        { headers: getHeaders(), signal: controller.signal }
      )
      const details = await response.json().catch(() => ({}))
      if (!response.ok || details.ok === false) {
        throw new Error(details.message || 'Failed to load revenue events')
      }
      if (!controller.signal.aborted) {
        setEventPopup({ open: true, loading: false, error: '', item, data: details })
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setEventPopup({
          open: true,
          loading: false,
          error: error.message || 'Failed to load revenue events',
          item,
          data: null,
        })
      }
    }
  }, [apiUrl, getHeaders, onSelect])

  return { eventPopup, openEventPopup, closeEventPopup }
}

export function EpisodeSalesEventAmount({ item, amount, onOpen, label }) {
  return (
    <button
      type="button"
      className="episode-sales-money-button"
      aria-label={label || 'View revenue event details'}
      title="View revenue event details"
      onClick={(event) => {
        event.stopPropagation()
        onOpen(item)
      }}
    >
      {formatMoney(amount)}
    </button>
  )
}

function EventField({ label, value }) {
  return (
    <div className="episode-event-popup-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default function EpisodeSalesEventPopup({ popup, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const result = popup.data || {}
  const verified = Array.isArray(result.events) ? result.events : []
  const unverified = Array.isArray(result.unverified_events) ? result.unverified_events : []
  const allEvents = [
    ...verified.map((event) => ({ ...event, verified: true })),
    ...unverified.map((event) => ({ ...event, verified: false })),
  ]

  return (
    <div
      className="episode-event-popup-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="episode-event-popup-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-event-popup-title"
      >
        <header className="episode-event-popup-header">
          <div>
            <h2 id="episode-event-popup-title">Revenue Events</h2>
            <p>Events affecting the author share at the time of purchase.</p>
            <p>
              {popup.item
                ? `${authorLabel(popup.item)} · ${formatEventDate(popup.item.created_at)}`
                : ''}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="episode-event-popup-close"
            onClick={onClose}
            aria-label="Close revenue events"
          >
            ×
          </button>
        </header>

        {popup.loading ? (
          <div className="episode-event-popup-panel" role="status">Loading event details...</div>
        ) : popup.error ? (
          <div className="episode-event-popup-panel episode-event-popup-error" role="alert">
            {popup.error}
          </div>
        ) : (
          <div className="episode-event-popup-content">
            <div className="episode-event-popup-panel episode-event-popup-split">
              <div>
                <div className="episode-event-popup-muted">Recorded author share</div>
                <div className="episode-event-popup-number is-author">
                  {Number(result.recorded_author_share_percent || 0).toFixed(2)}%
                </div>
                <div className="episode-event-popup-muted">{formatMoney(popup.item?.author_earnings_usd)}</div>
              </div>
              <div>
                <div className="episode-event-popup-muted">Recorded platform share</div>
                <div className="episode-event-popup-number">
                  {Number(result.recorded_platform_share_percent || 0).toFixed(2)}%
                </div>
                <div className="episode-event-popup-muted">{formatMoney(popup.item?.platform_income_usd)}</div>
              </div>
            </div>

            <div className="episode-event-popup-panel">
              <h3>Revenue share decision</h3>
              <EventField label="Recorded source" value={result.recorded_share_source || 'Not recorded'} />
              <EventField
                label={`Quest Stage ${result.stage?.stage_number ?? '—'}`}
                value={result.stage?.share_percent == null ? 'Not recorded' : `${result.stage.share_percent}%`}
              />
              <EventField
                label="Highest verified share including Stage"
                value={`${Number(result.best_verified_share_percent || 0)}%`}
              />
              {result.matches_verified_floor === false && (
                <p className="episode-event-popup-warning is-error">
                  Recorded share is lower than a verified active share. Please investigate.
                </p>
              )}
              {result.history_complete === false && (
                <p className="episode-event-popup-warning">
                  Some event history could not be verified. The highest verified share may not show the full history.
                </p>
              )}
            </div>

            <h3 className="episode-event-popup-subtitle">Events at purchase ({allEvents.length})</h3>
            {!allEvents.length ? (
              <div className="episode-event-popup-panel">
                No event could be confirmed for this purchase. Quest Stage may still apply.
              </div>
            ) : allEvents.map((event, index) => (
              <div className="episode-event-popup-panel" key={`${event.key || 'event'}-${index}`}>
                <div className="episode-event-popup-event-title">
                  <h3>{event.name || event.key || 'Event'}</h3>
                  <strong>{Number(event.author_share_percent || 0)}%</strong>
                </div>
                <div className={event.verified
                  ? 'episode-event-popup-verification is-verified'
                  : 'episode-event-popup-verification is-unverified'}
                >
                  {event.verified
                    ? 'Verified at purchase'
                    : `Not fully verified: ${String(event.verification || 'history_unavailable').replace(/_/g, ' ')}`}
                </div>
                <EventField
                  label="Revenue split"
                  value={`Author ${Number(event.author_share_percent || 0)}% · Platform ${Number(event.platform_share_percent || 0)}%`}
                />
                <EventField label="Started" value={formatEventDate(event.started_at)} />
                <EventField label="Ends" value={formatEventDate(event.ends_at)} />
                <EventField label="Time left at purchase" value={formatDuration(event.remaining_seconds_at_purchase)} />
                <EventField label="Time left now" value={formatDuration(event.remaining_seconds_now)} />
              </div>
            ))}

            <p className="episode-event-popup-footer">
              Times use Cambodia time. Remaining time is calculated when details are opened.
              Viewing this popup does not change revenue.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
