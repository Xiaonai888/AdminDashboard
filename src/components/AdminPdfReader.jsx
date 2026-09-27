import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const PDFJS_SRC = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
const PDFJS_WORKER_SRC = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

let pdfJsPromise = null

function loadPdfJs() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC
    return Promise.resolve(window.pdfjsLib)
  }
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-shadow-admin-pdfjs="true"]')
      const loaded = () => {
        const library = window.pdfjsLib
        if (!library) {
          pdfJsPromise = null
          reject(new Error('PDF viewer failed to load'))
          return
        }
        library.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC
        resolve(library)
      }
      const failed = () => {
        pdfJsPromise = null
        reject(new Error('PDF viewer failed to load'))
      }
      if (script) {
        script.addEventListener('load', loaded, { once: true })
        script.addEventListener('error', failed, { once: true })
        return
      }
      script = document.createElement('script')
      script.src = PDFJS_SRC
      script.async = true
      script.crossOrigin = 'anonymous'
      script.dataset.shadowAdminPdfjs = 'true'
      script.addEventListener('load', loaded, { once: true })
      script.addEventListener('error', failed, { once: true })
      document.head.appendChild(script)
    })
  }
  return pdfJsPromise
}

function clampZoom(value) {
  return Math.min(2.5, Math.max(0.75, Number(value) || 1))
}

function touchDistance(touches) {
  if (!touches || touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function Icon({ name, size = 18 }) {
  const paths = {
    back: 'M15 18l-6-6 6-6',
    previous: 'M15 18l-6-6 6-6',
    next: 'M9 18l6-6-6-6',
    minus: 'M5 12h14',
    plus: 'M12 5v14M5 12h14',
    expand: 'M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5',
    shrink: 'M8 8H3V3M16 8h5V3M8 16H3v5M16 16h5v5',
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>
}

function PdfPage({ pdf, pageNumber, total, scale, onVisible, registerPage, showPageLabel }) {
  const holderRef = useRef(null)
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const [state, setState] = useState('idle')

  useEffect(() => {
    const node = holderRef.current
    if (!node) return undefined
    registerPage(pageNumber, node)
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      onVisible(pageNumber)
      return undefined
    }
    const lazyObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setVisible(true)
    }, { rootMargin: '900px 0px' })
    const activeObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onVisible(pageNumber)
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 })
    lazyObserver.observe(node)
    activeObserver.observe(node)
    return () => {
      lazyObserver.disconnect()
      activeObserver.disconnect()
      registerPage(pageNumber, null)
    }
  }, [pageNumber, onVisible, registerPage])

  useEffect(() => {
    const node = holderRef.current
    if (!node) return undefined
    const update = () => setWidth(Math.max(1, Math.floor(node.clientWidth)))
    update()
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(update)
      observer.observe(node)
      return () => observer.disconnect()
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!pdf || !visible || !width) return undefined
    let active = true
    let renderTask = null
    setState('loading')

    async function renderPage() {
      try {
        const page = await pdf.getPage(pageNumber)
        if (!active) return
        const baseViewport = page.getViewport({ scale: 1 })
        const cssWidth = Math.max(140, width * Math.max(0.75, scale))
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = page.getViewport({ scale: Math.max(0.25, (cssWidth / baseViewport.width) * pixelRatio) })
        const canvas = canvasRef.current
        if (!canvas || !active) return
        canvas.width = Math.max(1, Math.floor(viewport.width))
        canvas.height = Math.max(1, Math.floor(viewport.height))
        canvas.style.width = `${Math.max(1, Math.floor(viewport.width / pixelRatio))}px`
        canvas.style.height = `${Math.max(1, Math.floor(viewport.height / pixelRatio))}px`
        const context = canvas.getContext('2d', { alpha: false })
        renderTask = page.render({ canvasContext: context, viewport })
        await renderTask.promise
        if (active) setState('ready')
        page.cleanup()
      } catch (error) {
        if (active && error?.name !== 'RenderingCancelledException') setState('error')
      }
    }

    void renderPage()
    return () => {
      active = false
      renderTask?.cancel?.()
    }
  }, [pdf, pageNumber, visible, width, scale])

  return (
    <section ref={holderRef} style={{ width: '100%', maxWidth: 950, margin: '0 auto' }}>
      {showPageLabel ? <div style={{ marginBottom: 4, textAlign: 'center', fontSize: 11, color: '#718096' }}>Page {pageNumber} of {total}</div> : null}
      <div style={{ display: 'flex', minHeight: 180, width: '100%', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 'fit-content', overflow: 'hidden', borderRadius: 12, background: '#fff', boxShadow: '0 2px 10px rgba(15,23,42,.10)' }}>
          {visible ? <canvas ref={canvasRef} style={{ display: state === 'ready' ? 'block' : 'block', visibility: state === 'ready' ? 'visible' : 'hidden', maxWidth: 'none' }} /> : null}
          {state === 'loading' ? <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 12, color: '#94a3b8' }}>Opening PDF…</span> : null}
          {state === 'error' ? <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center', fontSize: 12, color: '#b91c1c' }}>Unable to render this page.</span> : null}
        </div>
      </div>
    </section>
  )
}

export default function AdminPdfReader({ blob, title = 'PDF' }) {
  const rootRef = useRef(null)
  const surfaceRef = useRef(null)
  const pageRefs = useRef([])
  const pinchRef = useRef({ distance: 0, zoom: 1 })
  const lastTapRef = useRef(0)
  const hideTimerRef = useRef(null)
  const nativeFullscreenRef = useRef(false)
  const [view, setView] = useState({ loading: true, pdf: null, pages: 0, error: '' })
  const [zoom, setZoom] = useState(1)
  const [immersive, setImmersive] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let active = true
    let loadingTask = null
    let documentRef = null
    setView({ loading: true, pdf: null, pages: 0, error: '' })

    async function open() {
      try {
        if (!(blob instanceof Blob) || !blob.size) throw new Error('PDF source missing')
        const library = await loadPdfJs()
        const source = { data: new Uint8Array(await blob.arrayBuffer()) }
        if (!active) return
        loadingTask = library.getDocument(source)
        documentRef = await loadingTask.promise
        if (!active) return
        pageRefs.current = []
        setCurrentPage(1)
        setZoom(1)
        setView({ loading: false, pdf: documentRef, pages: documentRef.numPages, error: '' })
      } catch (error) {
        if (active) setView({ loading: false, pdf: null, pages: 0, error: error?.message || 'Unable to display this PDF.' })
      }
    }

    void open()
    return () => {
      active = false
      loadingTask?.destroy?.()
      documentRef?.destroy?.()
    }
  }, [blob])

  useEffect(() => {
    const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null
    const onFullscreenChange = () => {
      if (nativeFullscreenRef.current && !fullscreenElement()) {
        nativeFullscreenRef.current = false
        setImmersive(false)
        setControlsVisible(true)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (!immersive) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [immersive])

  useEffect(() => {
    if (!immersive || !controlsVisible) return undefined
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 3500)
    return () => window.clearTimeout(hideTimerRef.current)
  }, [immersive, controlsVisible, currentPage, zoom])

  useEffect(() => {
    const node = surfaceRef.current
    if (!node) return undefined
    const start = (event) => {
      if (event.touches.length !== 2) return
      pinchRef.current = { distance: touchDistance(event.touches), zoom }
    }
    const move = (event) => {
      if (event.touches.length !== 2 || !pinchRef.current.distance) return
      event.preventDefault()
      const distance = touchDistance(event.touches)
      if (!distance) return
      const next = clampZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance))
      setZoom((current) => Math.abs(current - next) >= 0.015 ? next : current)
    }
    const end = (event) => {
      if (event.touches.length < 2) pinchRef.current.distance = 0
    }
    node.addEventListener('touchstart', start, { passive: true })
    node.addEventListener('touchmove', move, { passive: false })
    node.addEventListener('touchend', end, { passive: true })
    node.addEventListener('touchcancel', end, { passive: true })
    return () => {
      node.removeEventListener('touchstart', start)
      node.removeEventListener('touchmove', move)
      node.removeEventListener('touchend', end)
      node.removeEventListener('touchcancel', end)
    }
  }, [zoom, immersive, view.pdf])

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom])
  const handleVisible = useCallback((pageNumber) => setCurrentPage(pageNumber), [])
  const registerPage = useCallback((pageNumber, node) => { pageRefs.current[pageNumber - 1] = node }, [])

  function scrollToPage(page) {
    const safePage = Math.min(Math.max(page, 1), view.pages || 1)
    const node = pageRefs.current[safePage - 1]
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
    setCurrentPage(safePage)
    if (immersive) setControlsVisible(true)
  }

  async function enterImmersive() {
    setImmersive(true)
    setControlsVisible(true)
    const node = rootRef.current
    const request = node?.requestFullscreen || node?.webkitRequestFullscreen
    if (!request) return
    try {
      await request.call(node)
      nativeFullscreenRef.current = true
    } catch {
      nativeFullscreenRef.current = false
    }
  }

  async function exitImmersive() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || null
    const exit = document.exitFullscreen || document.webkitExitFullscreen
    if (fullscreenElement && exit) {
      try { await exit.call(document) } catch {}
    }
    nativeFullscreenRef.current = false
    setImmersive(false)
    setControlsVisible(true)
  }

  function handleTap(event) {
    if (!immersive || event.target?.closest?.('[data-admin-pdf-control="true"]')) return
    const now = Date.now()
    if (now - lastTapRef.current <= 330) {
      setControlsVisible((value) => !value)
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now
  }

  const buttonStyle = { width: 34, height: 34, borderRadius: 999, border: '1px solid #dce4f2', background: '#fff', color: '#17243b', display: 'grid', placeItems: 'center', cursor: 'pointer' }
  const fullButtonStyle = { width: 38, height: 38, borderRadius: 999, border: 0, background: 'transparent', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }

  if (view.loading) return <div style={{ padding: 18, textAlign: 'center', color: '#697991' }}>Opening PDF…</div>
  if (view.error || !view.pdf) return <div style={{ padding: 18, textAlign: 'center', color: '#b91c1c' }}>{view.error || 'Unable to display this PDF.'}</div>

  return (
    <div ref={rootRef} style={immersive ? { position: 'fixed', inset: 0, zIndex: 10000, background: '#eef1f5' } : { width: '100%', minHeight: 0 }}>
      {!immersive ? <div data-admin-pdf-control="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 10px', borderBottom: '1px solid #e5eaf2', background: '#fff' }}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#697991' }}>Page {currentPage} of {view.pages}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button type="button" onClick={() => setZoom((value) => clampZoom(value - 0.15))} style={buttonStyle} aria-label="Zoom out"><Icon name="minus" size={15} /></button>
          <button type="button" onClick={() => setZoom(1)} style={{ ...buttonStyle, width: 'auto', minWidth: 58, padding: '0 10px', fontWeight: 700, fontSize: 11 }}>{zoomLabel}</button>
          <button type="button" onClick={() => setZoom((value) => clampZoom(value + 0.15))} style={buttonStyle} aria-label="Zoom in"><Icon name="plus" size={15} /></button>
          <button type="button" onClick={enterImmersive} style={buttonStyle} aria-label="Full View"><Icon name="expand" size={15} /></button>
        </div>
      </div> : null}

      <div
        ref={surfaceRef}
        onClick={handleTap}
        style={immersive
          ? { height: '100%', width: '100%', overflow: 'auto', background: '#eef1f5', padding: '64px 8px 76px', boxSizing: 'border-box', touchAction: 'pan-y', overscrollBehavior: 'contain' }
          : { width: '100%', height: '100%', minHeight: 0, overflow: 'auto', background: '#f4f6fa', padding: 10, boxSizing: 'border-box', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
      >
        {immersive ? <>
          <div data-admin-pdf-control="true" style={{ position: 'fixed', inset: '8px 8px auto', zIndex: 10001, opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none', transition: 'opacity .2s' }}>
            <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 16, padding: '8px 10px', background: 'rgba(0,0,0,.70)', color: '#fff', backdropFilter: 'blur(10px)' }}>
              <button type="button" onClick={exitImmersive} style={fullButtonStyle} aria-label="Back"><Icon name="back" size={20} /></button>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 }}>{title}</div>
                <div style={{ marginTop: 2, fontSize: 10, color: 'rgba(255,255,255,.72)' }}>Page {currentPage} of {view.pages}</div>
              </div>
              <button type="button" onClick={exitImmersive} style={fullButtonStyle} aria-label="Exit Full View"><Icon name="shrink" size={17} /></button>
            </div>
          </div>
          <div data-admin-pdf-control="true" style={{ position: 'fixed', inset: 'auto 0 10px', zIndex: 10001, display: 'flex', justifyContent: 'center', opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none', transition: 'opacity .2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, borderRadius: 999, padding: '5px 7px', background: 'rgba(0,0,0,.70)', color: '#fff', backdropFilter: 'blur(10px)' }}>
              <button type="button" onClick={() => scrollToPage(currentPage - 1)} style={fullButtonStyle}><Icon name="previous" size={17} /></button>
              <button type="button" onClick={() => setZoom((value) => clampZoom(value - 0.15))} style={fullButtonStyle}><Icon name="minus" size={17} /></button>
              <button type="button" onClick={() => setZoom(1)} style={{ ...fullButtonStyle, width: 'auto', minWidth: 58, padding: '0 10px', fontSize: 11, fontWeight: 700 }}>{zoomLabel}</button>
              <button type="button" onClick={() => setZoom((value) => clampZoom(value + 0.15))} style={fullButtonStyle}><Icon name="plus" size={17} /></button>
              <button type="button" onClick={() => scrollToPage(currentPage + 1)} style={fullButtonStyle}><Icon name="next" size={17} /></button>
            </div>
          </div>
        </> : null}

        <div style={{ display: 'grid', gap: 16 }}>
          {Array.from({ length: view.pages }, (_, index) => <PdfPage key={index + 1} pdf={view.pdf} pageNumber={index + 1} total={view.pages} scale={zoom} onVisible={handleVisible} registerPage={registerPage} showPageLabel={!immersive} />)}
        </div>
      </div>
    </div>
  )
}
