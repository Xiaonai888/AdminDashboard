import Cropper from 'react-easy-crop'

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

export async function createCroppedImageFile(
  imageSrc,
  pixelCrop,
  outputSize = 1200,
  filePrefix = 'cropped-image'
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Image crop is not supported in this browser.')
  }

  canvas.width = outputSize
  canvas.height = outputSize

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  )

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Failed to create cropped image.'))
        }
      },
      'image/jpeg',
      0.92
    )
  })

  return new File(
    [blob],
    `${filePrefix}-${Date.now()}.jpg`,
    { type: 'image/jpeg' }
  )
}

export default function ImageCropModal({
  open,
  image,
  crop,
  zoom,
  croppedAreaPixels,
  title,
  helper,
  cropShape = 'rect',
  onCropChange,
  onZoomChange,
  onCropComplete,
  onClose,
  onSave,
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.72)',
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          minHeight: '100%',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            borderRadius: 24,
            background: '#FFFFFF',
            padding: 18,
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)',
          }}
        >
          <div
            style={{
              marginBottom: 14,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: '#0F172A',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {title}
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#64748B',
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {helper}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                border: 0,
                borderRadius: '50%',
                background: '#F1F5F9',
                color: '#0F172A',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
              }}
              aria-label="Close crop editor"
            >
              ×
            </button>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              borderRadius: 18,
              background: '#111827',
            }}
          >
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={cropShape}
              showGrid={cropShape !== 'round'}
              restrictPosition={false}
              objectFit="contain"
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#475569',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              style={{
                width: '100%',
                accentColor: '#111827',
                cursor: 'pointer',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 14,
              background: '#F8FAFC',
              padding: '11px 13px',
              color: '#64748B',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.55,
            }}
          >
            Drag inside the image to move it. Use Zoom to fit the crop.
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 46,
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!croppedAreaPixels}
              onClick={onSave}
              style={{
                height: 46,
                border: 0,
                borderRadius: 14,
                background: '#111827',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 900,
                cursor: croppedAreaPixels ? 'pointer' : 'not-allowed',
                opacity: croppedAreaPixels ? 1 : 0.6,
              }}
            >
              Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
