import React, { useEffect, useMemo, useRef, useState } from 'react'

const MAP_URL = 'https://cdn.jsdelivr.net/gh/sirLisko/world-map-country-shapes@master/world-map.svg'
let mapAssetPromise = null

function loadMapAsset() {
  if (!mapAssetPromise) {
    mapAssetPromise = fetch(MAP_URL, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Map asset failed (${response.status})`)
        return response.text()
      })
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
        const sourceSvg = doc.querySelector('svg')

        if (!sourceSvg || doc.querySelector('parsererror')) {
          throw new Error('Invalid map asset')
        }

        const countries = Array.from(doc.querySelectorAll('path'))
          .map((path) => ({
            code: String(path.getAttribute('data-id') || path.getAttribute('id') || '')
              .trim()
              .toUpperCase(),
            name: String(path.getAttribute('data-name') || '').trim(),
            d: String(path.getAttribute('d') || '').trim(),
          }))
          .filter((country) => /^[A-Z]{2}$/.test(country.code) && country.d)

        if (!countries.length) throw new Error('Map countries are unavailable')

        return {
          viewBox: sourceSvg.getAttribute('viewBox') || '0 0 2000 1001',
          countries,
        }
      })
      .catch((error) => {
        mapAssetPromise = null
        throw error
      })
  }

  return mapAssetPromise
}

function number(value) {
  return Number(value || 0).toLocaleString()
}

function getCountryFill(total, maxTotal, selected) {
  if (selected) return '#4F46E5'
  if (!total || !maxTotal) return '#EEF2F7'

  const ratio = total / maxTotal
  if (ratio >= 0.75) return '#5B4FE9'
  if (ratio >= 0.45) return '#7C71ED'
  if (ratio >= 0.2) return '#9D94F2'
  if (ratio >= 0.08) return '#BDB7F6'
  return '#DCD9FA'
}

export default function ReaderCountryWorldMap({
  rows = [],
  selectedCountryCode = '',
  onSelectCountry,
}) {
  const wrapRef = useRef(null)
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState(null)

  const statsByCode = useMemo(() => {
    const map = new Map()

    for (const row of Array.isArray(rows) ? rows : []) {
      const code = String(row?.country_code || '').trim().toUpperCase()
      if (/^[A-Z]{2}$/.test(code)) map.set(code, row)
    }

    return map
  }, [rows])

  const maxTotal = useMemo(() => {
    let max = 0

    for (const row of statsByCode.values()) {
      max = Math.max(max, Number(row?.total_readers || 0))
    }

    return max
  }, [statsByCode])

  useEffect(() => {
    let alive = true

    setLoading(true)
    setError('')

    loadMapAsset()
      .then((value) => {
        if (!alive) return
        setAsset(value)
      })
      .catch((err) => {
        if (!alive) return
        setError(err.message || 'Failed to load world map')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  function positionTooltip(event, country) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return

    const row = statsByCode.get(country.code)

    setTooltip({
      x: Math.min(Math.max(event.clientX - rect.left + 12, 12), Math.max(12, rect.width - 230)),
      y: Math.min(Math.max(event.clientY - rect.top + 12, 12), Math.max(12, rect.height - 150)),
      code: country.code,
      name: row?.country_name || country.name || country.code,
      total: Number(row?.total_readers || 0),
      active: Number(row?.active_recently || 0),
      dormant: Number(row?.dormant_30_plus_days || 0),
      noActivity: Number(row?.no_activity_data || 0),
    })
  }

  function selectCountry(code) {
    if (!statsByCode.has(code)) return
    onSelectCountry?.(code)
  }

  const selected = String(selectedCountryCode || '').trim().toUpperCase()
  const scale = Math.max(1, Math.min(2.5, zoom))

  return (
    <div className="reader-country-map" ref={wrapRef}>
      <div className="reader-country-map-toolbar">
        <div>
          <strong>Reader Distribution</strong>
          <span>Country location is based on the latest available reader snapshot.</span>
        </div>

        <div className="reader-country-map-controls">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={scale <= 1}
            onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            className="reset"
            disabled={scale === 1}
            onClick={() => setZoom(1)}
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={scale >= 2.5}
            onClick={() => setZoom((value) => Math.min(2.5, Number((value + 0.25).toFixed(2))))}
          >
            +
          </button>
        </div>
      </div>

      <div className="reader-country-map-canvas">
        {loading ? (
          <div className="reader-country-map-state">Loading world map...</div>
        ) : error ? (
          <div className="reader-country-map-state error">
            <strong>Map unavailable</strong>
            <span>{error}</span>
          </div>
        ) : (
          <svg
            viewBox={asset?.viewBox || '0 0 2000 1001'}
            role="img"
            aria-label="Reader distribution world map"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setTooltip(null)}
          >
            <g transform={`translate(1000 500.5) scale(${scale}) translate(-1000 -500.5)`}>
              {(asset?.countries || []).map((country) => {
                const row = statsByCode.get(country.code)
                const total = Number(row?.total_readers || 0)
                const isSelected = selected === country.code
                const hasReaders = total > 0

                return (
                  <path
                    key={country.code}
                    d={country.d}
                    fill={getCountryFill(total, maxTotal, isSelected)}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 2.3 : 1.25}
                    vectorEffect="non-scaling-stroke"
                    className={hasReaders ? 'has-readers' : ''}
                    onMouseEnter={(event) => positionTooltip(event, country)}
                    onMouseMove={(event) => positionTooltip(event, country)}
                    onFocus={(event) => positionTooltip(event, country)}
                    onBlur={() => setTooltip(null)}
                    onClick={() => selectCountry(country.code)}
                    tabIndex={hasReaders ? 0 : -1}
                    aria-label={`${row?.country_name || country.name || country.code}: ${number(total)} readers`}
                  />
                )
              })}
            </g>
          </svg>
        )}

        {tooltip ? (
          <div
            className="reader-country-map-tooltip"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
            }}
          >
            <div className="reader-country-map-tooltip-title">
              <strong>{tooltip.name}</strong>
              <span>{tooltip.code}</span>
            </div>
            <div><span>Readers</span><strong>{number(tooltip.total)}</strong></div>
            <div><span>Active recently</span><strong>{number(tooltip.active)}</strong></div>
            <div><span>Dormant 30+ days</span><strong>{number(tooltip.dormant)}</strong></div>
            <div><span>No activity data</span><strong>{number(tooltip.noActivity)}</strong></div>
          </div>
        ) : null}
      </div>

      <div className="reader-country-map-legend">
        <span><i className="none" />No readers</span>
        <span><i className="low" />Low</span>
        <span><i className="medium" />Medium</span>
        <span><i className="high" />High</span>
      </div>

      <style>{`
        .reader-country-map {
          position: relative;
          min-width: 0;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          overflow: hidden;
        }

        .reader-country-map-toolbar {
          min-height: 64px;
          padding: 14px 16px;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .reader-country-map-toolbar > div:first-child {
          min-width: 0;
        }

        .reader-country-map-toolbar strong {
          display: block;
          color: #0F172A;
          font-size: 14px;
          font-weight: 950;
        }

        .reader-country-map-toolbar span {
          display: block;
          margin-top: 4px;
          color: #64748B;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.4;
        }

        .reader-country-map-controls {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }

        .reader-country-map-controls button {
          height: 32px;
          min-width: 32px;
          border: 1px solid #D8E2EF;
          border-radius: 10px;
          background: #FFFFFF;
          color: #334155;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .reader-country-map-controls button.reset {
          min-width: 58px;
          padding: 0 10px;
          color: #64748B;
          font-size: 10px;
        }

        .reader-country-map-controls button:hover:not(:disabled) {
          border-color: #A5B4FC;
          background: #EEF2FF;
          color: #4338CA;
        }

        .reader-country-map-controls button:disabled {
          opacity: 0.42;
          cursor: default;
        }

        .reader-country-map-canvas {
          position: relative;
          height: 430px;
          overflow: hidden;
          background:
            radial-gradient(circle at 48% 48%, rgba(99, 102, 241, 0.07), transparent 44%),
            linear-gradient(180deg, #FBFDFF, #F7FAFC);
        }

        .reader-country-map-canvas svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .reader-country-map-canvas path {
          transition: fill 0.14s ease, opacity 0.14s ease;
          outline: none;
        }

        .reader-country-map-canvas path.has-readers {
          cursor: pointer;
        }

        .reader-country-map-canvas path.has-readers:hover,
        .reader-country-map-canvas path.has-readers:focus {
          opacity: 0.78;
        }

        .reader-country-map-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          color: #64748B;
          font-size: 12px;
          font-weight: 850;
        }

        .reader-country-map-state.error strong {
          color: #B91C1C;
        }

        .reader-country-map-state.error span {
          max-width: 360px;
          text-align: center;
          color: #64748B;
          font-size: 11px;
        }

        .reader-country-map-tooltip {
          position: absolute;
          z-index: 8;
          width: 218px;
          padding: 11px 12px;
          border: 1px solid #D8E2EF;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.16);
          pointer-events: none;
          backdrop-filter: blur(8px);
        }

        .reader-country-map-tooltip-title {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 7px;
          margin-bottom: 6px;
          border-bottom: 1px solid #EEF2F7;
        }

        .reader-country-map-tooltip-title strong {
          color: #0F172A;
          font-size: 12px;
          font-weight: 950;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reader-country-map-tooltip-title span {
          margin: 0;
          padding: 2px 6px;
          border-radius: 7px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 9px;
          font-weight: 950;
        }

        .reader-country-map-tooltip > div:not(.reader-country-map-tooltip-title) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 3px 0;
        }

        .reader-country-map-tooltip > div:not(.reader-country-map-tooltip-title) span {
          margin: 0;
          color: #64748B;
          font-size: 10px;
          font-weight: 750;
        }

        .reader-country-map-tooltip > div:not(.reader-country-map-tooltip-title) strong {
          color: #0F172A;
          font-size: 10px;
          font-weight: 950;
        }

        .reader-country-map-legend {
          min-height: 42px;
          padding: 10px 16px;
          border-top: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 15px;
          flex-wrap: wrap;
          background: #FFFFFF;
        }

        .reader-country-map-legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748B;
          font-size: 10px;
          font-weight: 850;
        }

        .reader-country-map-legend i {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          display: inline-block;
        }

        .reader-country-map-legend i.none { background: #EEF2F7; }
        .reader-country-map-legend i.low { background: #DCD9FA; }
        .reader-country-map-legend i.medium { background: #9D94F2; }
        .reader-country-map-legend i.high { background: #5B4FE9; }

        @media (max-width: 900px) {
          .reader-country-map-canvas {
            height: 360px;
          }
        }

        @media (max-width: 640px) {
          .reader-country-map-toolbar {
            align-items: flex-start;
          }

          .reader-country-map-toolbar span {
            max-width: 240px;
          }

          .reader-country-map-canvas {
            height: 300px;
          }

          .reader-country-map-legend {
            justify-content: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  )
}
