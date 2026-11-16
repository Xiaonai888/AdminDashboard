import { useEffect, useRef, useState } from 'react'
import ImageDropZone from '../common/ImageDropZone'

export const DEFAULT_STICKER_FOLDER_COLOR = '#6366F1'
export const STICKER_FOLDER_COLORS = [
  '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
  '#EF4444', '#F97316', '#FB923C', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
  '#2563EB', '#64748B', '#475569', '#334155', '#0F172A', '#78716C',
]
const MAX_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const HEX = /^#[0-9a-fA-F]{6}$/

export default function StickerFolderCoverPicker({ draft, onPatch, disabled = false }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const color = HEX.test(draft.color || '') ? draft.color : DEFAULT_STICKER_FOLDER_COLOR

  useEffect(() => {
    if (!draft.coverFile) {
      setPreviewUrl('')
      return undefined
    }
    const url = URL.createObjectURL(draft.coverFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [draft.coverFile])

  const choose = (files) => {
    const file = Array.from(files || [])[0]
    if (!file) return
    if (!IMAGE_TYPES.has(file.type)) {
      setError('Choose a JPEG, PNG, WebP, GIF, or AVIF image.')
      return
    }
    if (!file.size || file.size > MAX_BYTES) {
      setError('Folder cover must be 5 MB or smaller.')
      return
    }
    setError('')
    onPatch({ coverFile: file, removeCover: false })
  }

  const remove = () => {
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onPatch({ coverFile: null, removeCover: Boolean(draft.id && draft.coverUrl) })
  }

  const cover = draft.removeCover ? '' : (previewUrl || draft.coverUrl || '')

  return (
    <div className="sticker-folder-visual-editor">
      <style>{`
        .sticker-folder-visual-editor{display:grid;gap:16px;margin:12px 0 16px;font-size:12px;color:#0f172a}
        .sticker-folder-visual-heading{font-size:12px;font-weight:750;margin:0 0 9px}
        .sticker-folder-color-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:7px}
        .sticker-folder-color-button{aspect-ratio:1;border:2px solid #fff;outline:1px solid #e2e8f0;border-radius:10px;min-width:0;padding:0;cursor:pointer;position:relative}
        .sticker-folder-color-button[aria-pressed=true]{outline:2px solid #111827;outline-offset:2px}
        .sticker-folder-color-button[aria-pressed=true]::after{content:'✓';display:grid;place-items:center;font-weight:900;color:white;text-shadow:0 1px 3px #0008;font-size:13px;position:absolute;inset:0}
        .sticker-folder-custom{display:flex;align-items:center;gap:10px;margin-top:11px;color:#475569;font-weight:650}
        .sticker-folder-custom input{width:44px!important;height:32px;padding:2px!important;border-radius:8px!important;cursor:pointer}
        .sticker-folder-color-example{display:inline-flex;gap:9px;align-items:center;margin-left:auto}
        .sticker-folder-color-example span{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;font-size:18px}
        .sticker-folder-cover-area{width:100%;background:#f8fafc;border:2px dashed #a8b5ca;border-radius:14px;min-height:162px;padding:14px;display:grid;place-items:center;gap:8px;text-align:center}
        .sticker-folder-cover-area.with-preview{border-style:solid;background:#f8fafc}
        .sticker-folder-cover-area img{width:min(100%,190px);height:125px;object-fit:contain;border-radius:10px}
        .sticker-folder-cover-area strong{font-size:13px}
        .sticker-folder-cover-area p{color:#64748b;font-size:11px;margin:0}
        .sticker-folder-cover-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:9px}
        .sticker-folder-cover-actions button{border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#0f172a;padding:8px 12px;font-weight:700;cursor:pointer}
        .sticker-folder-cover-actions button:first-child{background:#4f46e5;border-color:#4f46e5;color:#fff}
        .sticker-folder-cover-actions button:disabled{opacity:.5;cursor:not-allowed}
        .sticker-folder-visual-error{color:#be123c;font-size:12px;line-height:1.4}
        @media(max-width:520px){.sticker-folder-color-grid{grid-template-columns:repeat(8,minmax(0,1fr))}}
      `}</style>
      <section aria-label="Folder color">
        <div className="sticker-folder-visual-heading">Folder Color</div>
        <div className="sticker-folder-color-grid">
          {STICKER_FOLDER_COLORS.map((value) => (
            <button key={value} type="button" disabled={disabled} aria-label={`Use ${value} folder color`}
              aria-pressed={color.toLowerCase() === value.toLowerCase()}
              className="sticker-folder-color-button" style={{ background: value }}
              onClick={() => onPatch({ color: value })} />
          ))}
        </div>
        <div className="sticker-folder-custom">
          <label htmlFor="sticker-folder-custom-color">Custom color</label>
          <input id="sticker-folder-custom-color" type="color" disabled={disabled} value={color}
            onChange={(event) => onPatch({ color: event.target.value.toUpperCase() })} />
          <span>{color.toUpperCase()}</span>
          <div className="sticker-folder-color-example" aria-label="Selected folder color">
            Preview <span style={{ backgroundColor: color }}>{draft.icon || '📁'}</span>
          </div>
        </div>
      </section>
      <section aria-label="Folder cover">
        <div className="sticker-folder-visual-heading">Folder Cover <span style={{ color: '#64748b', fontWeight: 500 }}>(optional, max 5 MB)</span></div>
        <ImageDropZone disabled={disabled} label="Drop a cover image here" onFiles={choose}>
          <div className={`sticker-folder-cover-area ${cover ? 'with-preview' : ''}`}>
            {cover ? <img src={cover} alt="Folder cover preview" /> : (
              <>
                <span aria-hidden="true" style={{ fontSize: 30 }}>🖼️</span>
                <strong>Drag & drop your cover image here</strong>
                <p>Or choose an image from your device</p>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              disabled={disabled} style={{ display: 'none' }}
              onChange={(event) => { choose(event.target.files); event.target.value = '' }} />
            <div className="sticker-folder-cover-actions">
              <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>
                {cover ? 'Replace Image' : 'Choose Image'}
              </button>
              {cover && <button type="button" disabled={disabled} onClick={remove}>Remove Image</button>}
            </div>
            <p>JPEG, PNG, WebP, GIF or AVIF · up to 5 MB</p>
          </div>
        </ImageDropZone>
        {error && <div role="alert" className="sticker-folder-visual-error">{error}</div>}
      </section>
    </div>
  )
}
