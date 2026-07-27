import { useRef, useState } from 'react'

export default function ImageDropZone({
  children,
  onFiles,
  disabled = false,
  multiple = false,
  className = '',
  label = 'Drop image here',
}) {
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)

  const stopEvent = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragEnter = (event) => {
    stopEvent(event)
    if (disabled) return
    dragDepth.current += 1
    setDragging(true)
  }

  const handleDragOver = (event) => {
    stopEvent(event)
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
  }

  const handleDragLeave = (event) => {
    stopEvent(event)
    if (disabled) return
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }

  const handleDrop = (event) => {
    stopEvent(event)
    dragDepth.current = 0
    setDragging(false)

    if (disabled) return

    const images = Array.from(event.dataTransfer.files || []).filter((file) =>
      String(file.type || '').startsWith('image/')
    )

    const files = multiple ? images : images.slice(0, 1)

    if (files.length) onFiles?.(files)
  }

  return (
    <div
      className={`image-drop-zone ${className} ${dragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {dragging ? (
        <div className="image-drop-zone-overlay">
          {label}
        </div>
      ) : null}
    </div>
  )
}
