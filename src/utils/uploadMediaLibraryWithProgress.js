function formatMegabytes(bytes) {
  return `${(Number(bytes || 0) / (1024 * 1024)).toFixed(1)} MB`
}

function ensureStyles() {
  if (document.getElementById('shadow-media-upload-progress-styles')) return

  const style = document.createElement('style')
  style.id = 'shadow-media-upload-progress-styles'
  style.textContent = `
    .shadow-upload-progress-layer {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.55);
      padding: 20px;
      backdrop-filter: blur(5px);
    }

    .shadow-upload-progress-card {
      width: min(460px, 100%);
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      background: #FFFFFF;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
      padding: 24px;
      color: #0F172A;
    }

    .shadow-upload-progress-kicker {
      color: #4F46E5;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .shadow-upload-progress-card h2 {
      margin: 7px 0 4px;
      font-size: 22px;
      font-weight: 950;
    }

    .shadow-upload-progress-status {
      margin: 0;
      color: #64748B;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.5;
    }

    .shadow-upload-progress-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-top: 22px;
    }

    .shadow-upload-progress-percent {
      font-size: 38px;
      font-weight: 950;
      line-height: 1;
    }

    .shadow-upload-progress-size {
      color: #475569;
      font-size: 13px;
      font-weight: 850;
      text-align: right;
    }

    .shadow-upload-progress-track {
      height: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: #EDE9FE;
      margin-top: 14px;
    }

    .shadow-upload-progress-bar {
      width: 0%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #4F46E5, #7C3AED);
      transition: width 180ms ease;
    }

    .shadow-upload-progress-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 16px;
    }

    .shadow-upload-progress-detail {
      border-radius: 14px;
      background: #F8FAFC;
      padding: 12px;
    }

    .shadow-upload-progress-detail span {
      display: block;
      color: #94A3B8;
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
    }

    .shadow-upload-progress-detail strong {
      display: block;
      margin-top: 4px;
      color: #0F172A;
      font-size: 13px;
      font-weight: 900;
    }

    .shadow-upload-progress-processing .shadow-upload-progress-bar {
      width: 100%;
      animation: shadow-upload-processing 1.2s ease-in-out infinite;
    }

    .shadow-upload-progress-success .shadow-upload-progress-bar {
      width: 100%;
      background: #16A34A;
      animation: none;
    }

    .shadow-upload-progress-error .shadow-upload-progress-bar {
      background: #DC2626;
      animation: none;
    }

    @keyframes shadow-upload-processing {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
  `
  document.head.appendChild(style)
}

function createProgressView(fileCount, totalBytes) {
  ensureStyles()

  const layer = document.createElement('div')
  layer.className = 'shadow-upload-progress-layer'
  layer.innerHTML = `
    <div class="shadow-upload-progress-card">
      <div class="shadow-upload-progress-kicker">Shadow Media Library</div>
      <h2>Uploading ${fileCount} images</h2>
      <p class="shadow-upload-progress-status">Preparing one batch for upload...</p>

      <div class="shadow-upload-progress-row">
        <div class="shadow-upload-progress-percent">0%</div>
        <div class="shadow-upload-progress-size">0.0 MB / ${formatMegabytes(totalBytes)}</div>
      </div>

      <div class="shadow-upload-progress-track">
        <div class="shadow-upload-progress-bar"></div>
      </div>

      <div class="shadow-upload-progress-details">
        <div class="shadow-upload-progress-detail">
          <span>Images</span>
          <strong>${fileCount} files</strong>
        </div>
        <div class="shadow-upload-progress-detail">
          <span>Total size</span>
          <strong>${formatMegabytes(totalBytes)}</strong>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(layer)

  const card = layer.querySelector('.shadow-upload-progress-card')
  const title = layer.querySelector('h2')
  const status = layer.querySelector('.shadow-upload-progress-status')
  const percent = layer.querySelector('.shadow-upload-progress-percent')
  const size = layer.querySelector('.shadow-upload-progress-size')
  const bar = layer.querySelector('.shadow-upload-progress-bar')

  return {
    updateUpload(progress, estimatedLoadedBytes) {
      const safeProgress = Math.max(0, Math.min(100, Math.round(progress)))
      percent.textContent = `${safeProgress}%`
      size.textContent = `${formatMegabytes(estimatedLoadedBytes)} / ${formatMegabytes(totalBytes)}`
      bar.style.width = `${safeProgress}%`
      status.textContent = 'Sending all images in one batch...'
    },
    showProcessing() {
      card.classList.add('shadow-upload-progress-processing')
      percent.textContent = '100%'
      size.textContent = `${formatMegabytes(totalBytes)} / ${formatMegabytes(totalBytes)}`
      bar.style.width = '100%'
      status.textContent = 'Upload received. Compressing and saving images to Cloudflare...'
    },
    showSuccess() {
      card.classList.remove('shadow-upload-progress-processing')
      card.classList.add('shadow-upload-progress-success')
      title.textContent = 'Upload complete'
      percent.textContent = '100%'
      status.textContent = `${fileCount} images were compressed and saved successfully.`
    },
    showError(message) {
      card.classList.remove('shadow-upload-progress-processing')
      card.classList.add('shadow-upload-progress-error')
      title.textContent = 'Upload failed'
      status.textContent = message || 'The images could not be uploaded.'
    },
    remove(delay = 0) {
      window.setTimeout(() => layer.remove(), delay)
    },
  }
}

export function uploadMediaLibraryWithProgress({
  apiUrl,
  token,
  files,
}) {
  const selectedFiles = Array.from(files || [])
  const totalBytes = selectedFiles.reduce(
    (sum, file) => sum + Number(file?.size || 0),
    0
  )
  const view = createProgressView(selectedFiles.length, totalBytes)

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    selectedFiles.forEach((file) => formData.append('images', file))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${apiUrl}/api/admin/media-library/upload`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !event.total) return

      const ratio = Math.max(0, Math.min(1, event.loaded / event.total))
      const estimatedLoadedBytes = Math.min(
        totalBytes,
        Math.round(totalBytes * ratio)
      )

      view.updateUpload(ratio * 100, estimatedLoadedBytes)

      if (ratio >= 1) {
        view.showProcessing()
      }
    })

    xhr.upload.addEventListener('load', () => {
      view.showProcessing()
    })

    xhr.addEventListener('load', () => {
      let data = {}

      try {
        data = JSON.parse(xhr.responseText || '{}')
      } catch {
        data = {}
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.ok !== false) {
        view.showSuccess()
        view.remove(900)
        resolve(data)
        return
      }

      const message = data.message || 'Failed to upload images'
      view.showError(message)
      view.remove(2200)
      reject(new Error(message))
    })

    xhr.addEventListener('error', () => {
      const message = 'Network error while uploading images'
      view.showError(message)
      view.remove(2200)
      reject(new Error(message))
    })

    xhr.addEventListener('abort', () => {
      const message = 'Image upload was cancelled'
      view.showError(message)
      view.remove(1800)
      reject(new Error(message))
    })

    xhr.send(formData)
  })
}
