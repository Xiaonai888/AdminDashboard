export async function compressImage(file, options = {}) {
  const {
    aspectRatio = 16 / 9,
    maxSizeKB = 300,
    maxWidth = 1280,
    outputType = 'image/jpeg',
    initialQuality = 0.86,
    minQuality = 0.45,
  } = options

  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const imageUrl = URL.createObjectURL(file)
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to read image.'))
    img.src = imageUrl
  })

  const sourceRatio = image.width / image.height
  let cropWidth = image.width
  let cropHeight = image.height
  let cropX = 0
  let cropY = 0

  if (sourceRatio > aspectRatio) {
    cropWidth = Math.round(image.height * aspectRatio)
    cropX = Math.round((image.width - cropWidth) / 2)
  } else if (sourceRatio < aspectRatio) {
    cropHeight = Math.round(image.width / aspectRatio)
    cropY = Math.round((image.height - cropHeight) / 2)
  }

  let targetWidth = Math.min(maxWidth, cropWidth)
  let targetHeight = Math.round(targetWidth / aspectRatio)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const makeBlob = (quality) =>
    new Promise((resolve) => {
      canvas.toBlob(resolve, outputType, quality)
    })

  let quality = initialQuality
  let blob = null

  while (targetWidth >= 480) {
    canvas.width = targetWidth
    canvas.height = targetHeight

    context.clearRect(0, 0, targetWidth, targetHeight)
    context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight)

    quality = initialQuality

    while (quality >= minQuality) {
      blob = await makeBlob(quality)

      if (blob && blob.size <= maxSizeKB * 1024) {
        URL.revokeObjectURL(imageUrl)

        return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
          type: outputType,
          lastModified: Date.now(),
        })
      }

      quality -= 0.08
    }

    targetWidth = Math.round(targetWidth * 0.85)
    targetHeight = Math.round(targetWidth / aspectRatio)
  }

  URL.revokeObjectURL(imageUrl)
  throw new Error(`Image is too large. Please use a smaller image under ${maxSizeKB}KB.`)
}
