import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://shadow-backend-kucw.onrender.com'

function getAuthToken() {
  return (
    sessionStorage.getItem('shadow_reader_token') ||
    localStorage.getItem('shadow_reader_token') ||
    ''
  )
}

function getCountdown(milliseconds) {
  const totalSeconds = Math.max(
    0,
    Math.floor(Number(milliseconds || 0) / 1000)
  )

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isLastDay: totalSeconds < 86400,
  }
}

function TimeItem({ value, label }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-[14px] font-black leading-none text-[#17130A]">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[7px] font-black uppercase tracking-[0.07em] text-[#8A7B54]">
        {label}
      </div>
    </div>
  )
}

export default function Author49DayDashboardCard({ onStartWriting }) {
  const [event, setEvent] = useState(null)
  const [serverOffsetMs, setServerOffsetMs] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let ignore = false

    async function loadEvent() {
      const token = getAuthToken()
      if (!token) return

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/authors/me/49-day-event`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error('Failed')
        }

        if (!ignore) {
          const nextEvent = data.event || null
          setEvent(nextEvent)

          const serverNow = new Date(
            nextEvent?.server_now || ''
          ).getTime()

          setServerOffsetMs(
            Number.isFinite(serverNow)
              ? serverNow - Date.now()
              : 0
          )
        }
      } catch {
        if (!ignore) setEvent(null)
      }
    }

    loadEvent()
    const refreshId = window.setInterval(loadEvent, 60000)

    return () => {
      ignore = true
      window.clearInterval(refreshId)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(
      () => setNow(Date.now()),
      1000
    )

    return () => window.clearInterval(timerId)
  }, [])

  const remainingMs = useMemo(() => {
    if (event?.status !== 'active' || !event?.ends_at) {
      return 0
    }

    const endsAt = new Date(event.ends_at).getTime()
    if (!Number.isFinite(endsAt)) return 0

    return Math.max(
      0,
      endsAt - (now + serverOffsetMs)
    )
  }, [event, now, serverOffsetMs])

  const countdown = useMemo(
    () => getCountdown(remainingMs),
    [remainingMs]
  )

  if (
    !event ||
    !event.visible ||
    event.status === 'finished' ||
    (event.status === 'active' && remainingMs <= 0)
  ) {
    return null
  }

  const isActive = event.status === 'active'

  return (
    <section className="mt-5 overflow-hidden rounded-[16px] border border-[#F2C230] bg-[linear-gradient(135deg,#FFFDF7_0%,#FFF7D1_100%)] shadow-[0_10px_26px_rgba(216,164,0,0.12)]">
      <div className="relative flex min-h-[126px] items-stretch overflow-hidden">
        <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-[#FFC400]" />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between px-4 py-3.5">
          <div>
            <div className="inline-flex rounded-full bg-black px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white">
              Author Event
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[28px] font-black tracking-[-0.06em] text-[#111111]">
                80%
              </span>
              <span className="text-[12px] font-black text-[#C99500]">
                for 49 Days
              </span>
            </div>

            <div className="mt-1 text-[9px] font-bold text-[#756A50]">
              Publish 1 new episode to activate
            </div>
          </div>

          <button
            type="button"
            onClick={onStartWriting}
            className="mt-3 inline-flex h-8 w-fit items-center gap-1.5 rounded-[10px] border border-black bg-[#FFC400] px-3 text-[10px] font-black text-black shadow-[0_3px_0_#111] active:translate-y-[2px] active:shadow-[0_1px_0_#111]"
          >
            <i className="fa-solid fa-pen-nib text-[9px]" />
            Start Writing
          </button>
        </div>

        <div className="relative z-10 flex w-[44%] min-w-[142px] flex-col justify-between border-l border-[#ECD573] bg-white/72 px-3 py-3.5">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.09em] ${
              isActive ? 'text-[#15803D]' : 'text-[#8A7B54]'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                isActive ? 'bg-[#22C55E]' : 'bg-[#B7A774]'
              }`} />
              {isActive ? 'Active' : 'Not Started'}
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-dashed border-[#D9BD55] bg-[#FFF7D1] text-[#C99500]">
              <i className="fa-solid fa-image text-[10px]" />
            </div>
          </div>

          {isActive ? (
            <div>
              <div className="mb-2 text-[8px] font-black uppercase tracking-[0.08em] text-[#8A7B54]">
                Time Left
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#EBDFAE] rounded-[10px] border border-[#EBDFAE] bg-white px-1 py-2">
                {countdown.isLastDay ? (
                  <>
                    <TimeItem value={countdown.hours} label="Hours" />
                    <TimeItem value={countdown.minutes} label="Minutes" />
                    <TimeItem value={countdown.seconds} label="Seconds" />
                  </>
                ) : (
                  <>
                    <TimeItem value={countdown.days} label="Days" />
                    <TimeItem value={countdown.hours} label="Hours" />
                    <TimeItem value={countdown.minutes} label="Minutes" />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#EBDFAE] bg-white px-3 py-2.5 text-[9px] font-bold leading-4 text-[#746A50]">
              Countdown starts after your next published episode.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
