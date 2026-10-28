// Same ordinary-image compression strategy as the existing Character library.
// Sticker animation is CSS metadata and is NOT processed here.
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
export const STICKER_FILE_LIMIT = 20 * 1024 * 1024
export const STICKER_COVER_LIMIT = 5 * 1024 * 1024

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

export async function prepareStickerImage(file, { cover = false } = {}) {
  const type = String(file?.type || '').toLowerCase()
  if (!file || !TYPES.has(type)) throw new Error('Choose JPEG, PNG, WebP, GIF or AVIF images.')
  const sourceLimit = cover ? STICKER_COVER_LIMIT : STICKER_FILE_LIMIT
  if (file.size <= 0 || file.size > sourceLimit) {
    throw new Error(`Image must be ${cover ? '5' : '20'} MB or smaller.`)
  }
  if (type === 'image/gif') return file // Maintain legacy Character compression behavior.

  const sourceUrl = URL.createObjectURL(file)
  let img
  try {
    img = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Unable to read image.'))
      element.src = sourceUrl
    })
  } catch {
    URL.revokeObjectURL(sourceUrl)
    return file
  }

  try {
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height
    if (!width || !height) return file
    const limitW = cover ? 1200 : 1920
    const limitH = cover ? 1200 : 2400
    const minBytes = cover ? 500 * 1024 : 1100 * 1024
    if (file.size <= minBytes && width <= limitW && height <= limitH) return file

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    let scale = Math.min(1, limitW / width, limitH / height)
    const target = cover ? 420 * 1024 : 900 * 1024
    let best = null
    for (let pass = 0; pass < 4; pass += 1) {
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      for (const quality of [0.9, 0.86, 0.82, 0.78, 0.74]) {
        const blob = await toBlob(canvas, 'image/webp', quality)
        if (!blob) continue
        if (!best || blob.size < best.size) best = blob
        if (blob.size <= target) break
      }
      if (best?.size <= target) break
      scale *= 0.82
    }
    if (!best || best.size >= file.size) return file
    const name = `${(file.name || 'image').replace(/\.[^.]+$/, '')}.webp`
    return new File([best], name, { type: 'image/webp', lastModified: file.lastModified || Date.now() })
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export async function prepareStickerBatch(files) {
  const list = Array.from(files || [])
  const output = new Array(list.length)
  let next = 0
  const worker = async () => {
    while (next < list.length) {
      const index = next++
      output[index] = await prepareStickerImage(list[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(2, list.length) }, () => worker()))
  return output
}
