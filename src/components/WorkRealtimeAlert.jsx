import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const styles = `
  .work-live-alert {
    position: fixed;
    top: 82px;
    right: 22px;
    z-index: 1800;
    width: min(430px, calc(100vw - 28px));
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 30px;
    gap: 12px;
    align-items: start;
    padding: 15px;
    border: 1px solid #FCA5A5;
    border-radius: 18px;
    background: #FFFFFF;
    box-shadow: 0 24px 60px rgba(15, 23, 42, .22);
  }

  .work-live-alert.resolved {
    border-color: #BFDBFE;
  }

  .work-live-shape {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: #DC2626;
    color: #FFFFFF;
    font-size: 21px;
    font-weight: 950;
  }

  .work-live-alert.resolved .work-live-shape {
    background: #2563EB;
  }

  .work-live-body {
    min-width: 0;
  }

  .work-live-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
  }

  .work-live-path {
    margin-top: 4px;
    color: #475569;
    font-size: 11px;
    font-weight: 850;
    overflow-wrap: anywhere;
  }

  .work-live-meta {
    margin-top: 7px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .work-live-pill {
    border-radius: 999px;
    background: #F1F5F9;
    color: #64748B;
    padding: 4px 7px;
    font-size: 9px;
    font-weight: 900;
  }

  .work-live-open {
    margin-top: 10px;
    min-height: 32px;
    border: 0;
    border-radius: 10px;
    background: #111827;
    color: #FFFFFF;
    padding: 0 11px;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .work-live-close {
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 9px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 16px;
    cursor: pointer;
  }

  @media (max-width: 620px) {
    .work-live-alert {
      top: 76px;
      right: 14px;
      left: 14px;
      width: auto;
    }
  }
`

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function parseSseBlock(block) {
  const lines = block.split('\n')
  let event = ''
  const dataLines = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }

  if (!dataLines.length) return null

  try {
    return {
      event,
      data: JSON.parse(dataLines.join('\n')),
    }
  } catch {
    return null
  }
}

export default function WorkRealtimeAlert() {
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    let stopped = false
    let controller = null
    let reconnectTimer = null
    let retryMs = 5000

    function scheduleReconnect() {
      if (stopped) return

      reconnectTimer = window.setTimeout(() => {
        connect()
      }, retryMs)

      retryMs = Math.min(retryMs * 2, 60000)
    }

    async function connect() {
      const token = getToken()

      if (!token || stopped) return

      controller = new AbortController()

      try {
        const response = await fetch(`${API_URL}/api/admin/work/events`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error('Work realtime connection failed')
        }

        retryMs = 5000

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!stopped) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const blocks = buffer.split('\n\n')
          buffer = blocks.pop() || ''

          for (const block of blocks) {
            const parsed = parseSseBlock(block)

            if (
              parsed?.event !== 'work-incident' ||
              !parsed?.data?.incident
            ) {
              continue
            }

            setAlert(parsed.data)

            if (hideTimerRef.current) {
              window.clearTimeout(hideTimerRef.current)
              hideTimerRef.current = null
            }

            if (parsed.data.type === 'resolved') {
              hideTimerRef.current = window.setTimeout(() => {
                setAlert(null)
              }, 10000)
            }
          }
        }

        if (!stopped) scheduleReconnect()
      } catch (error) {
        if (
          !stopped &&
          error?.name !== 'AbortError'
        ) {
          scheduleReconnect()
        }
      }
    }

    connect()

    return () => {
      stopped = true
      controller?.abort()
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [])

  if (!alert?.incident) return null

  const incident = alert.incident
  const resolved = alert.type === 'resolved'
  const reopened = alert.type === 'reopened'

  return (
    <>
      <style>{styles}</style>

      <aside className={`work-live-alert ${resolved ? 'resolved' : ''}`}>
        <div className="work-live-shape">
          {resolved ? '✓' : '✕'}
        </div>

        <div className="work-live-body">
          <div className="work-live-title">
            {resolved
              ? 'Work incident resolved'
              : reopened
                ? 'Work incident reopened'
                : 'Work incident detected'}
          </div>

          <div className="work-live-path">
            {incident.method} {incident.path}
          </div>

          <div className="work-live-meta">
            <span className="work-live-pill">
              {incident.source}
            </span>
            <span className="work-live-pill">
              {Number(
                incident.peak_requests_per_minute || 0
              ).toLocaleString()} req/min peak
            </span>
          </div>

          <button
            type="button"
            className="work-live-open"
            onClick={() => {
              setAlert(null)
              navigate('/alerts/work')
            }}
          >
            Open Work
          </button>
        </div>

        <button
          type="button"
          className="work-live-close"
          aria-label="Close Work alert"
          onClick={() => setAlert(null)}
        >
          ×
        </button>
      </aside>
    </>
  )
}
