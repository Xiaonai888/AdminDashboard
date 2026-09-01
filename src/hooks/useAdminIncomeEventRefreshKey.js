import {
  useEffect,
  useRef,
  useState,
} from 'react'

function getAdminToken() {
  return (
    sessionStorage.getItem(
      'shadow_admin_token'
    ) ||
    localStorage.getItem(
      'shadow_admin_token'
    )
  )
}

function authHeaders() {
  const token = getAdminToken()

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

function waitForReconnect(ms, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }

    let finished = false
    let timer = null

    const finish = () => {
      if (finished) return
      finished = true

      if (timer) {
        clearTimeout(timer)
      }

      signal.removeEventListener(
        'abort',
        finish
      )
      resolve()
    }

    timer = setTimeout(
      finish,
      ms
    )

    signal.addEventListener(
      'abort',
      finish,
      { once: true }
    )
  })
}

function parseSseBlock(block) {
  const lines = String(block || '')
    .split('\n')
  let eventName = 'message'
  const dataLines = []

  for (const line of lines) {
    if (!line || line.startsWith(':')) {
      continue
    }

    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim()
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(
        line.slice(5).trimStart()
      )
    }
  }

  if (!dataLines.length) return null

  try {
    return {
      event: eventName,
      data: JSON.parse(
        dataLines.join('\n')
      ),
    }
  } catch {
    return null
  }
}

export default function useAdminIncomeEventRefreshKey(
  apiUrl,
  source
) {
  const [refreshKey, setRefreshKey] =
    useState(0)
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    const sourceName = String(
      source || ''
    ).trim()

    if (!apiUrl || !sourceName) {
      return undefined
    }

    const controller =
      new AbortController()
    let reconnectDelay = 2000
    let hasConnected = false

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) {
        clearTimeout(
          refreshTimerRef.current
        )
      }

      refreshTimerRef.current =
        setTimeout(() => {
          refreshTimerRef.current = null
          setRefreshKey(
            (value) => value + 1
          )
        }, 500)
    }

    const connect = async () => {
      while (!controller.signal.aborted) {
        try {
          const response = await fetch(
            `${apiUrl}/api/admin/income/events`,
            {
              headers: {
                ...authHeaders(),
                Accept: 'text/event-stream',
              },
              signal: controller.signal,
            }
          )

          if (
            response.status === 401 ||
            response.status === 403
          ) {
            return
          }

          if (
            !response.ok ||
            !response.body
          ) {
            throw new Error(
              'Income event stream unavailable'
            )
          }

          if (hasConnected) {
            scheduleRefresh()
          }

          hasConnected = true
          reconnectDelay = 2000

          const reader =
            response.body.getReader()
          const decoder =
            new TextDecoder()
          let buffer = ''

          while (
            !controller.signal.aborted
          ) {
            const { value, done } =
              await reader.read()

            if (done) break

            buffer += decoder.decode(
              value,
              { stream: true }
            )
            buffer = buffer.replace(
              /\r\n/g,
              '\n'
            )

            let boundary =
              buffer.indexOf('\n\n')

            while (boundary !== -1) {
              const block =
                buffer.slice(0, boundary)
              buffer = buffer.slice(
                boundary + 2
              )

              const message =
                parseSseBlock(block)

              if (
                message?.event ===
                  'income-change' &&
                message.data?.source ===
                  sourceName
              ) {
                scheduleRefresh()
              }

              boundary =
                buffer.indexOf('\n\n')
            }
          }
        } catch (error) {
          if (
            controller.signal.aborted ||
            error?.name === 'AbortError'
          ) {
            return
          }
        }

        if (controller.signal.aborted) {
          return
        }

        await waitForReconnect(
          reconnectDelay,
          controller.signal
        )

        reconnectDelay = Math.min(
          reconnectDelay * 2,
          30000
        )
      }
    }

    connect()

    return () => {
      controller.abort()

      if (refreshTimerRef.current) {
        clearTimeout(
          refreshTimerRef.current
        )
        refreshTimerRef.current = null
      }
    }
  }, [apiUrl, source])

  return refreshKey
}
