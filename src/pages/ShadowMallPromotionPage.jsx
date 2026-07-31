import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ImageCropModal, { createCroppedImageFile } from '../components/ImageCropModal'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

const defaultForm = {
  sponsor: 'Shadow Mall',
  title: '',
  description: '',
  button_text: 'Shop now',
  link_url: '/shop',
  profile_image_url: '',
  image_url: '',
  is_active: true,
}



export default function ShadowMallPromotionPage() {
  const navigate = useNavigate()
  const imageInputRef = useRef(null)
  const profileInputRef = useRef(null)
  const formRef = useRef(null)
  const titleInputRef = useRef(null)
  const [form, setForm] = useState(defaultForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState('')
  const [rawImage, setRawImage] = useState('')
  const [cropTarget, setCropTarget] = useState('promotion')
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [removeProfileImage, setRemoveProfileImage] = useState(false)
  const [promotions, setPromotions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [pinningId, setPinningId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [message, setMessage] = useState('')

  async function loadPromotions({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true)
        setMessage('')
      }

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/shadow-mall/admin/promotions`,
        {
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to load promotions'
        )
      }

      setPromotions(
        Array.isArray(data.promotions)
          ? data.promotions
          : []
      )
    } catch (error) {
      setMessage(
        error.message || 'Failed to load promotions'
      )
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  useEffect(() => {
    if (!openMenuId) return undefined

    function closeMenu(event) {
      if (!event.target.closest('[data-promotion-menu]')) {
        setOpenMenuId(null)
      }
    }

    function closeMenuWithEscape(event) {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeMenuWithEscape)

    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeMenuWithEscape)
    }
  }, [openMenuId])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }

      if (profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview)
      }
    }
  }, [imagePreview, profilePreview])

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  function closeCropModal() {
    setCropModalOpen(false)
    setRawImage('')
    setCroppedAreaPixels(null)

    const inputRef =
      cropTarget === 'profile' ? profileInputRef : imageInputRef

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  async function saveCroppedImage() {
    if (!rawImage || !croppedAreaPixels) {
      setMessage('Please adjust the image first.')
      return
    }

    try {
      const isProfile = cropTarget === 'profile'
      const croppedFile = await createCroppedImageFile(
        rawImage,
        croppedAreaPixels,
        isProfile ? 600 : 1200,
        isProfile
          ? 'shadow-mall-profile'
          : 'shadow-mall-promotion'
      )
      const nextPreview = URL.createObjectURL(croppedFile)

      if (isProfile) {
        setProfilePreview((current) => {
          if (current.startsWith('blob:')) {
            URL.revokeObjectURL(current)
          }

          return nextPreview
        })
        setProfileFile(croppedFile)
        setRemoveProfileImage(false)
        setMessage('Profile image is ready to save.')
      } else {
        setImagePreview((current) => {
          if (current.startsWith('blob:')) {
            URL.revokeObjectURL(current)
          }

          return nextPreview
        })
        setImageFile(croppedFile)
        setRemoveImage(false)
        setMessage('Promotion image is ready to save.')
      }

      setCropModalOpen(false)
      setRawImage('')
      setCroppedAreaPixels(null)
    } catch (error) {
      setMessage(error.message || 'Failed to crop image.')
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setMessage('')
  }

  function openCropForFile(event, target) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be 5 MB or smaller.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setRawImage(String(reader.result || ''))
      setCropTarget(target)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setCropModalOpen(true)
      setMessage('')
    }

    reader.onerror = () => {
      setMessage('Failed to read the selected image.')
    }

    reader.readAsDataURL(file)
  }

  function handleImageUpload(event) {
    openCropForFile(event, 'promotion')
  }

  function handleProfileUpload(event) {
    openCropForFile(event, 'profile')
  }

  function clearEditor(nextMessage = '') {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    if (profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview)
    }

    setEditingId(null)
    setForm({ ...defaultForm })
    setImageFile(null)
    setImagePreview('')
    setProfileFile(null)
    setProfilePreview('')
    setRawImage('')
    setCropModalOpen(false)
    setCroppedAreaPixels(null)
    setRemoveImage(false)
    setRemoveProfileImage(false)
    setMessage(nextMessage)

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }

    if (profileInputRef.current) {
      profileInputRef.current.value = ''
    }
  }

  function moveToEditor({ focusTitle = false } = {}) {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      if (focusTitle) {
        window.setTimeout(() => {
          titleInputRef.current?.focus()
        }, 350)
      }
    })
  }

  function startNewAd() {
    setOpenMenuId(null)
    clearEditor('Ready to create a new ad.')
    moveToEditor({ focusTitle: true })
  }

  async function savePromotion() {
    if (!form.title.trim()) {
      setMessage('Promotion title is required before creating the ad.')
      moveToEditor({ focusTitle: true })
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const token = getAdminToken()
      const formData = new FormData()

      formData.append('sponsor', form.sponsor.trim())
      formData.append('title', form.title.trim())
      formData.append(
        'description',
        form.description.trim()
      )
      formData.append(
        'button_text',
        form.button_text.trim()
      )
      formData.append(
        'link_url',
        form.link_url.trim()
      )
      formData.append(
        'is_active',
        String(form.is_active)
      )
      formData.append(
        'remove_image',
        String(removeImage)
      )
      formData.append(
        'remove_profile_image',
        String(removeProfileImage)
      )

      if (imageFile) {
        formData.append(
          'promotion_image',
          imageFile
        )
      }

      if (profileFile) {
        formData.append(
          'profile_image',
          profileFile
        )
      }

      const isEditing = Boolean(editingId)
      const endpoint = isEditing
        ? `${API_URL}/api/shadow-mall/admin/promotions/${editingId}`
        : `${API_URL}/api/shadow-mall/admin/promotions`

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: formData,
      })
      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to save promotion'
        )
      }

      await loadPromotions({ silent: true })

      clearEditor(
        isEditing
          ? 'Ad updated successfully.'
          : 'Ad created successfully. The form is ready for a new ad.'
      )
    } catch (error) {
      setMessage(
        error.message || 'Failed to save promotion'
      )
      moveToEditor()
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    clearEditor(
      editingId
        ? 'Edit cancelled.'
        : 'Form cleared.'
    )
  }

  function editPromotion(promotion) {
    if (!promotion?.id) return

    setOpenMenuId(null)
    clearEditor('')
    setEditingId(promotion.id)
    setForm({
      ...defaultForm,
      ...promotion,
    })
    setRemoveImage(false)
    setRemoveProfileImage(false)
    setMessage(
      `Editing Ad #${promotion.display_order || promotion.id}`
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function deletePromotion(promotion) {
    if (!promotion?.id) return

    setOpenMenuId(null)

    const confirmed = window.confirm(
      `Delete "${promotion.title || 'this ad'}"? This also removes its images from Cloudflare R2.`
    )

    if (!confirmed) return

    try {
      setDeletingId(promotion.id)
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/shadow-mall/admin/promotions/${promotion.id}`,
        {
          method: 'DELETE',
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      )
      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to delete promotion'
        )
      }

      setPromotions((current) =>
        current.filter(
          (item) => item.id !== promotion.id
        )
      )

      if (editingId === promotion.id) {
        clearEditor('')
      }

      setMessage('Ad deleted successfully.')
    } catch (error) {
      setMessage(
        error.message || 'Failed to delete promotion'
      )
    } finally {
      setDeletingId(null)
    }
  }


  async function togglePromotionStatus(promotion) {
    if (!promotion?.id || togglingId) return

    const nextActive = !Boolean(promotion.is_active)

    try {
      setTogglingId(promotion.id)
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/shadow-mall/admin/promotions/${promotion.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            is_active: nextActive,
          }),
        }
      )
      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to update ad status'
        )
      }

      const updatedPromotion =
        data.promotion || {
          ...promotion,
          is_active: nextActive,
        }

      await loadPromotions({ silent: true })

      if (editingId === promotion.id) {
        setForm((current) => ({
          ...current,
          is_active: Boolean(
            updatedPromotion.is_active
          ),
        }))
      }

      setMessage(
        nextActive
          ? 'Ad activated. Readers who hid the older version can see it again.'
          : 'Ad deactivated and removed from Discover.'
      )
    } catch (error) {
      setMessage(
        error.message || 'Failed to update ad status'
      )
    } finally {
      setTogglingId(null)
    }
  }

  async function togglePromotionPin(promotion) {
    if (
      !promotion?.id ||
      pinningId ||
      togglingId ||
      deletingId ||
      reordering
    ) {
      return
    }

    const nextPinned = !Boolean(promotion.is_pinned)
    const pinnedCount = promotions.filter(
      (item) => Boolean(item.is_pinned)
    ).length

    if (nextPinned && !promotion.is_active) {
      setMessage('Activate the ad before pinning it.')
      setOpenMenuId(null)
      return
    }

    if (nextPinned && pinnedCount >= 3) {
      setMessage('Maximum 3 pinned ads.')
      setOpenMenuId(null)
      return
    }

    try {
      setPinningId(promotion.id)
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/shadow-mall/admin/promotions/${promotion.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            is_active: Boolean(promotion.is_active),
            is_pinned: nextPinned,
          }),
        }
      )
      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to update ad pin'
        )
      }

      await loadPromotions({ silent: true })
      setOpenMenuId(null)
      setMessage(
        nextPinned
          ? 'Ad pinned to the top of Admin and Discover.'
          : 'Ad unpinned successfully.'
      )
    } catch (error) {
      setMessage(
        error.message || 'Failed to update ad pin'
      )
    } finally {
      setPinningId(null)
    }
  }

  async function movePromotion(promotionId, direction) {
    const promotion = promotions.find(
      (item) => item.id === promotionId
    )

    if (!promotion || promotion.is_pinned) {
      return
    }

    const pinnedPromotions = promotions.filter(
      (item) => Boolean(item.is_pinned)
    )
    const regularPromotions = promotions.filter(
      (item) => !Boolean(item.is_pinned)
    )
    const currentIndex = regularPromotions.findIndex(
      (item) => item.id === promotionId
    )
    const nextIndex =
      direction === 'up'
        ? currentIndex - 1
        : currentIndex + 1

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= regularPromotions.length
    ) {
      return
    }

    const nextRegularPromotions = [...regularPromotions]
    const [moved] = nextRegularPromotions.splice(
      currentIndex,
      1
    )
    nextRegularPromotions.splice(nextIndex, 0, moved)

    const nextPromotions = [
      ...pinnedPromotions,
      ...nextRegularPromotions,
    ]

    try {
      setReordering(true)
      setPromotions(nextPromotions)
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/shadow-mall/admin/promotions/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify({
            ordered_ids: nextPromotions.map(
              (item) => item.id
            ),
          }),
        }
      )
      const data = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.message || 'Failed to reorder promotions'
        )
      }

      setPromotions(
        Array.isArray(data.promotions)
          ? data.promotions
          : nextPromotions
      )
      setMessage('Display order updated.')
    } catch (error) {
      await loadPromotions({ silent: true })
      setMessage(
        error.message || 'Failed to reorder promotions'
      )
    } finally {
      setReordering(false)
    }
  }


  const pinnedCount = promotions.filter(
    (item) => Boolean(item.is_pinned)
  ).length

  const tabs = [
    { label: 'Products', path: '/shadow-mall' },
    { label: 'Review Orders', path: '/shadow-mall/orders' },
    { label: 'Author Orders', path: '/author-store/review' },
    { label: 'Promotion', path: '/shadow-mall/promotion', active: true },
    { label: 'Publishers', path: '/shadow-mall/publishers' },
  ]

  return (
    <AdminLayout
      title="Shadow Mall Promotion"
      subtitle="Prepare the sponsored square card shown inside Discover."
    >
      <ImageCropModal
        open={cropModalOpen}
        image={rawImage}
        crop={crop}
        zoom={zoom}
        croppedAreaPixels={croppedAreaPixels}
        title={
          cropTarget === 'profile'
            ? 'Crop Profile Image'
            : 'Crop Promotion Image'
        }
        helper={
          cropTarget === 'profile'
            ? 'Drag and zoom to fit the circular profile preview.'
            : 'Drag and zoom to fit the square promotion preview.'
        }
        cropShape={cropTarget === 'profile' ? 'round' : 'rect'}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        onClose={closeCropModal}
        onSave={saveCroppedImage}
      />
      <style>{`
        .promotion-page {
          min-width: 0;
        }

        @media (max-width: 1080px) {
          .promotion-editor-grid {
            grid-template-columns: 1fr !important;
          }

          .promotion-preview-card {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
          }

          .promotion-records-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          .promotion-main {
            min-width: 0;
            padding: 20px 16px 40px !important;
          }

          .promotion-hero,
          .promotion-form,
          .promotion-preview-card,
          .promotion-records {
            border-radius: 20px !important;
          }

          .promotion-hero {
            padding: 18px 16px !important;
          }

          .promotion-hero h1 {
            font-size: 24px !important;
            overflow-wrap: anywhere;
          }

          .promotion-hero p,
          .promotion-message,
          .promotion-form p,
          .promotion-records p {
            overflow-wrap: anywhere;
          }

          .promotion-tabs {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            margin-right: -16px;
            padding-right: 16px;
            padding-bottom: 5px;
            scrollbar-width: none;
          }

          .promotion-tabs::-webkit-scrollbar {
            display: none;
          }

          .promotion-tabs button {
            flex: 0 0 auto;
            white-space: nowrap;
          }

          .promotion-editor-grid {
            gap: 16px !important;
          }

          .promotion-form {
            min-width: 0;
            padding: 18px 16px !important;
          }

          .promotion-profile-row {
            align-items: flex-start !important;
          }

          .promotion-form-actions {
            grid-template-columns: 1fr 1fr !important;
          }

          .promotion-form-actions button {
            width: 100%;
            min-width: 0;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .promotion-preview-card {
            min-width: 0;
          }

          .promotion-records {
            min-width: 0;
            padding: 18px 16px !important;
          }

          .promotion-records-head {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .promotion-records-head button {
            width: 100%;
          }

          .promotion-record-card {
            min-width: 0;
          }

          .promotion-record-main {
            grid-template-columns: 92px minmax(0, 1fr) !important;
            gap: 11px !important;
            padding: 11px !important;
          }

          .promotion-record-actions {
            grid-template-columns: 42px 42px minmax(0, 1fr) 42px !important;
            gap: 7px !important;
            padding: 9px !important;
          }

          .promotion-record-menu-popover {
            width: min(190px, calc(100vw - 40px)) !important;
            max-width: calc(100vw - 40px);
          }
        }

        @media (max-width: 560px) {
          .promotion-main {
            padding: 18px 13px 34px !important;
          }

          .promotion-hero {
            padding: 16px 14px !important;
          }

          .promotion-tabs {
            margin-right: -14px;
            padding-right: 14px;
          }

          .promotion-profile-row {
            flex-direction: column !important;
          }

          .promotion-profile-row > div:last-of-type {
            width: 100%;
          }

          .promotion-form-actions {
            grid-template-columns: 1fr !important;
          }

          .promotion-records {
            padding: 16px 14px !important;
          }

          .promotion-records-grid {
            grid-template-columns: 1fr !important;
          }

          .promotion-record-main {
            grid-template-columns: 82px minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 380px) {
          .promotion-record-main {
            grid-template-columns: 72px minmax(0, 1fr) !important;
          }

          .promotion-record-actions {
            grid-template-columns: 38px 38px minmax(0, 1fr) 38px !important;
            gap: 5px !important;
            padding: 7px !important;
          }

          .promotion-record-actions > button,
          .promotion-record-actions > div > button {
            min-width: 0;
          }
        }
      `}</style>

      <div
        className="promotion-page"
        style={{
          minHeight: '100vh',
          background: '#F8FAFC',
          color: '#0F172A',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          className="promotion-main"
          style={{
            padding: 26,
            maxWidth: 1380,
            margin: '0 auto',
          }}
        >
          <section
            className="promotion-hero"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: 22,
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 11px',
                borderRadius: 999,
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              📣 Discover Sponsored Promotion
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}
            >
              Shadow Mall Promotion
            </h1>

            <p
              style={{
                marginTop: 8,
                color: '#64748B',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.6,
              }}
            >
              Manage the square sponsored card that appears below an Author Post in Discover.
            </p>

            <div
              className="promotion-tabs"
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 18,
                flexWrap: 'wrap',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => {
                    if (!tab.active) navigate(tab.path)
                  }}
                  style={{
                    height: 40,
                    border: tab.active ? 0 : '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '0 16px',
                    background: tab.active ? '#EEF2FF' : '#FFFFFF',
                    color: tab.active ? '#4F46E5' : '#0F172A',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: tab.active ? 'default' : 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {message ? (
            <div
              className="promotion-message"
              style={{
                marginBottom: 16,
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                background: '#FFFFFF',
                padding: '12px 14px',
                color: '#334155',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {message}
            </div>
          ) : null}

          <section
            className="promotion-editor-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(360px, 1fr) minmax(320px, 460px)',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <form
              className="promotion-form"
              ref={formRef}
              onSubmit={(event) => {
                event.preventDefault()
                savePromotion()
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 24,
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
                padding: 22,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 900,
                }}
              >
                {editingId ? 'Edit Promotion' : 'Create New Ad'}
              </h2>

              <p
                style={{
                  marginTop: 5,
                  marginBottom: 20,
                  color: '#64748B',
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {editingId
                  ? 'Update the selected ad. The record remains in its current display order.'
                  : 'Create a new sponsored ad. After saving, this form clears automatically.'}
              </p>

              {[
                ['sponsor', 'Sponsor name'],
                ['title', 'Promotion title'],
                ['button_text', 'Button text'],
                ['link_url', 'Destination link'],
              ].map(([field, label]) => (
                <label
                  key={field}
                  style={{
                    display: 'block',
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      marginBottom: 7,
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {label}
                  </span>

                  <input
                    ref={
                      field === 'title'
                        ? titleInputRef
                        : null
                    }
                    value={form[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    style={{
                      width: '100%',
                      height: 44,
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '0 12px',
                      outline: 'none',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      font: 'inherit',
                      fontSize: 13,
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  />
                </label>
              ))}

              <label
                style={{
                  display: 'block',
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    display: 'block',
                    marginBottom: 7,
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  Description
                </span>

                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 110,
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: 12,
                    outline: 'none',
                    resize: 'vertical',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    font: 'inherit',
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.55,
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <div
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    marginBottom: 7,
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  Profile image
                </div>

                <div
                  className="promotion-profile-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border: '1px solid #E2E8F0',
                    borderRadius: 16,
                    background: '#F8FAFC',
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: 54,
                      height: 54,
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: '50%',
                      background: '#111827',
                      color: '#FFFFFF',
                    }}
                  >
                    {profilePreview || form.profile_image_url ? (
                      <img
                        src={
                          profilePreview ||
                          form.profile_image_url
                        }
                        alt={form.sponsor || 'Shadow Mall'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        S
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        profileInputRef.current?.click()
                      }
                      style={{
                        width: '100%',
                        height: 40,
                        border: '1px solid #C7D2FE',
                        borderRadius: 12,
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      Choose profile image
                    </button>

                    {profilePreview ||
                    form.profile_image_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileFile(null)
                          setProfilePreview('')
                          setRemoveProfileImage(true)
                          updateField(
                            'profile_image_url',
                            ''
                          )

                          if (profileInputRef.current) {
                            profileInputRef.current.value =
                              ''
                          }
                        }}
                        style={{
                          width: '100%',
                          height: 36,
                          marginTop: 7,
                          border: '1px solid #FCA5A5',
                          borderRadius: 12,
                          background: '#FFFFFF',
                          color: '#B91C1C',
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        Remove profile image
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    marginBottom: 7,
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  Square image
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  style={{
                    width: '100%',
                    height: 44,
                    border: '1px solid #C7D2FE',
                    borderRadius: 14,
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  Choose square promotion image
                </button>

                {(imagePreview || form.image_url) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                      setRawImage('')
                      setCropModalOpen(false)
                      setCroppedAreaPixels(null)
                      setRemoveImage(true)
                      updateField('image_url', '')

                      if (imageInputRef.current) {
                        imageInputRef.current.value = ''
                      }
                    }}
                    style={{
                      width: '100%',
                      height: 40,
                      marginTop: 8,
                      border: '1px solid #FCA5A5',
                      borderRadius: 14,
                      background: '#FFFFFF',
                      color: '#B91C1C',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 44,
                  borderRadius: 14,
                  background: '#F8FAFC',
                  padding: '0 12px',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => updateField('is_active', event.target.checked)}
                  style={{
                    width: 17,
                    height: 17,
                    accentColor: '#4F46E5',
                  }}
                />
                Active promotion
              </label>

              {message ? (
                <div
                  style={{
                    marginBottom: 12,
                    border: '1px solid #C7D2FE',
                    borderRadius: 12,
                    background: '#EEF2FF',
                    padding: '10px 12px',
                    color: '#3730A3',
                    fontSize: 11,
                    fontWeight: 800,
                    lineHeight: 1.5,
                  }}
                >
                  {message}
                </div>
              ) : null}

              <div
                className="promotion-form-actions"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                }}
              >
                <button
                  type="submit"
                  disabled={saving || loading}
                  style={{
                    height: 46,
                    border: 0,
                    borderRadius: 14,
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: saving || loading ? 'not-allowed' : 'pointer',
                    opacity: saving || loading ? 0.65 : 1,
                  }}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Update Ad'
                      : 'Create Ad'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    height: 46,
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    background: '#FFFFFF',
                    color: '#0F172A',
                    padding: '0 16px',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Cancel Edit' : 'Clear'}
                </button>
              </div>
            </form>

            <section
              className="promotion-preview-card"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 24,
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 900,
                  }}
                >
                  Live Preview
                </h2>

                <p
                  style={{
                    marginTop: 4,
                    color: '#64748B',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Square sponsored card shown in Discover.
                </p>
              </div>

              <div
                style={{
                  padding: 14,
                  background: '#F8FAFC',
                }}
              >
                <article
                  style={{
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          borderRadius: '50%',
                          background: '#111827',
                          color: '#FFFFFF',
                        }}
                      >
                        {profilePreview ||
                        form.profile_image_url ? (
                          <img
                            src={
                              profilePreview ||
                              form.profile_image_url
                            }
                            alt={
                              form.sponsor || 'Shadow Mall'
                            }
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            S
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            overflow: 'hidden',
                            color: '#111827',
                            fontSize: 14,
                            fontWeight: 800,
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {form.sponsor || 'Shadow Mall'}
                        </div>

                        <div
                          style={{
                            marginTop: 2,
                            color: '#94A3B8',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Ad · 🌐
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        color: '#94A3B8',
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      ×
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #111827 0%, #4C1D95 55%, #F59E0B 100%)',
                    }}
                  >
                    {imagePreview || form.image_url ? (
                      <img
                        src={imagePreview || form.image_url}
                        alt={form.title || 'Promotion'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <>
                        <div
                          style={{
                            position: 'absolute',
                            width: 150,
                            height: 150,
                            right: -45,
                            top: -40,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,.1)',
                          }}
                        />

                        <div
                          style={{
                            position: 'absolute',
                            width: 180,
                            height: 180,
                            left: -70,
                            bottom: -90,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,.18)',
                          }}
                        />

                        <div
                          style={{
                            position: 'absolute',
                            left: 18,
                            top: 18,
                            borderRadius: 6,
                            background: 'rgba(255,255,255,.15)',
                            padding: '7px 10px',
                            color: '#FFFFFF',
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {form.sponsor || 'Shadow Mall'}
                        </div>

                        <div
                          style={{
                            position: 'absolute',
                            left: 18,
                            right: 18,
                            bottom: 20,
                          }}
                        >
                          <div
                            style={{
                              color: '#FFFFFF',
                              fontSize: 24,
                              lineHeight: 1.15,
                              fontWeight: 900,
                            }}
                          >
                            {form.title || 'Promotion title'}
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              color: 'rgba(255,255,255,.82)',
                              fontSize: 12,
                              lineHeight: 1.5,
                              fontWeight: 600,
                            }}
                          >
                            {form.description || 'Promotion description'}
                          </div>
                        </div>
                      </>
                    )}

                    {!form.is_active ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(15,23,42,.72)',
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: 900,
                        }}
                      >
                        Promotion Hidden
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      padding: 12,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        height: 42,
                        border: 0,
                        borderRadius: 8,
                        background: '#111111',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 900,
                      }}
                    >
                      {form.button_text || 'Shop now'}
                    </button>
                  </div>
                </article>
              </div>
            </section>
          </section>

          <section
            className="promotion-records"
            style={{
              marginTop: 20,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              boxShadow:
                '0 12px 30px rgba(15, 23, 42, 0.04)',
              padding: 22,
            }}
          >
            <div
              className="promotion-records-head"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  Ads Records
                </h2>

                <p
                  style={{
                    marginTop: 5,
                    marginBottom: 0,
                    color: '#64748B',
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  Pinned ads appear first. Regular ads follow their display order.
                </p>
              </div>

              <button
                type="button"
                onClick={startNewAd}
                style={{
                  height: 40,
                  flexShrink: 0,
                  border: 0,
                  borderRadius: 12,
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  padding: '0 15px',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                + New Ad
              </button>
            </div>

            {loading ? (
              <div
                style={{
                  borderRadius: 16,
                  background: '#F8FAFC',
                  padding: 24,
                  color: '#64748B',
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Loading ads records...
              </div>
            ) : promotions.length ? (
              <div
                className="promotion-records-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 14,
                }}
              >
                {promotions.map(
                  (promotion, index) => {
                    const isEditing =
                      editingId === promotion.id
                    const isDeleting =
                      deletingId === promotion.id
                    const isToggling =
                      togglingId === promotion.id
                    const isPinning =
                      pinningId === promotion.id
                    const pinnedPosition =
                      promotion.is_pinned
                        ? promotions
                            .filter((item) =>
                              Boolean(item.is_pinned)
                            )
                            .findIndex(
                              (item) =>
                                item.id === promotion.id
                            ) + 1
                        : 0
                    const regularPromotions =
                      promotions.filter(
                        (item) =>
                          !Boolean(item.is_pinned)
                      )
                    const regularIndex =
                      promotion.is_pinned
                        ? -1
                        : regularPromotions.findIndex(
                            (item) =>
                              item.id === promotion.id
                          )
                    const moveUpDisabled =
                      promotion.is_pinned ||
                      regularIndex <= 0 ||
                      reordering
                    const moveDownDisabled =
                      promotion.is_pinned ||
                      regularIndex < 0 ||
                      regularIndex ===
                        regularPromotions.length - 1 ||
                      reordering

                    return (
                      <article
                        key={promotion.id}
                        className="promotion-record-card"
                        style={{
                          overflow: 'visible',
                          border: isEditing
                            ? '2px solid #4F46E5'
                            : '1px solid #E2E8F0',
                          borderRadius: 18,
                          background: '#FFFFFF',
                          boxShadow: isEditing
                            ? '0 10px 28px rgba(79,70,229,.14)'
                            : 'none',
                        }}
                      >
                        <div
                          className="promotion-record-main"
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '108px minmax(0, 1fr)',
                            gap: 13,
                            padding: 13,
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              aspectRatio: '1 / 1',
                              overflow: 'hidden',
                              borderRadius: 12,
                              background:
                                'linear-gradient(135deg, #111827, #4C1D95, #F59E0B)',
                            }}
                          >
                            {promotion.image_url ? (
                              <img
                                src={promotion.image_url}
                                alt={
                                  promotion.title ||
                                  'Promotion'
                                }
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            ) : null}

                            <div
                              style={{
                                position: 'absolute',
                                left: 7,
                                top: 7,
                                minWidth: 27,
                                height: 27,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 8,
                                background:
                                  'rgba(255,255,255,.92)',
                                color: '#0F172A',
                                padding: '0 7px',
                                fontSize: 11,
                                fontWeight: 900,
                              }}
                            >
                              #{index + 1}
                            </div>

                            {promotion.is_pinned ? (
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 7,
                                  top: 7,
                                  height: 27,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 8,
                                  background: '#4F46E5',
                                  color: '#FFFFFF',
                                  padding: '0 8px',
                                  fontSize: 10,
                                  fontWeight: 900,
                                  boxShadow:
                                    '0 4px 12px rgba(79,70,229,.3)',
                                }}
                              >
                                📌 {pinnedPosition}/3
                              </div>
                            ) : null}
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 9,
                                marginBottom: 9,
                              }}
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  flexShrink: 0,
                                  overflow: 'hidden',
                                  borderRadius: '50%',
                                  background: '#111827',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 900,
                                }}
                              >
                                {promotion.profile_image_url ? (
                                  <img
                                    src={
                                      promotion.profile_image_url
                                    }
                                    alt={
                                      promotion.sponsor ||
                                      'Shadow Mall'
                                    }
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : (
                                  'S'
                                )}
                              </div>

                              <div
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    overflow: 'hidden',
                                    color: '#0F172A',
                                    fontSize: 13,
                                    fontWeight: 900,
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {promotion.sponsor ||
                                    'Shadow Mall'}
                                </div>

                                <div
                                  style={{
                                    marginTop: 2,
                                    color:
                                      promotion.is_active
                                        ? '#15803D'
                                        : '#94A3B8',
                                    fontSize: 10,
                                    fontWeight: 900,
                                  }}
                                >
                                  {promotion.is_active
                                    ? 'Active'
                                    : 'Inactive'}
                                  {' · '}
                                  Order{' '}
                                  {promotion.display_order ||
                                    index + 1}
                                  {promotion.is_pinned
                                    ? ` · Pinned ${pinnedPosition}/3`
                                    : ''}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                color: '#0F172A',
                                fontSize: 13,
                                fontWeight: 900,
                                lineHeight: 1.4,
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                              }}
                            >
                              {promotion.title ||
                                'Untitled Ad'}
                            </div>

                            <div
                              style={{
                                marginTop: 7,
                                overflow: 'hidden',
                                color: '#64748B',
                                fontSize: 10,
                                fontWeight: 700,
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={promotion.link_url}
                            >
                              {promotion.link_url || '/shop'}
                            </div>
                          </div>
                        </div>

                        <div
                          className="promotion-record-actions"
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '42px 42px minmax(108px, 1.2fr) 42px',
                            gap: 8,
                            borderTop:
                              '1px solid #E2E8F0',
                            background: '#F8FAFC',
                            borderRadius: '0 0 18px 18px',
                            padding: 10,
                          }}
                        >
                          <button
                            type="button"
                            disabled={moveUpDisabled}
                            onClick={() =>
                              movePromotion(
                                promotion.id,
                                'up'
                              )
                            }
                            style={{
                              height: 36,
                              border:
                                '1px solid #E2E8F0',
                              borderRadius: 10,
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: 15,
                              fontWeight: 900,
                              cursor: moveUpDisabled
                                ? 'not-allowed'
                                : 'pointer',
                              opacity: moveUpDisabled
                                ? 0.45
                                : 1,
                            }}
                            aria-label="Move ad up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={moveDownDisabled}
                            onClick={() =>
                              movePromotion(
                                promotion.id,
                                'down'
                              )
                            }
                            style={{
                              height: 36,
                              border:
                                '1px solid #E2E8F0',
                              borderRadius: 10,
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: 15,
                              fontWeight: 900,
                              cursor: moveDownDisabled
                                ? 'not-allowed'
                                : 'pointer',
                              opacity: moveDownDisabled
                                ? 0.45
                                : 1,
                            }}
                            aria-label="Move ad down"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(
                              promotion.is_active
                            )}
                            aria-label={`${
                              promotion.is_active
                                ? 'Deactivate'
                                : 'Activate'
                            } ad`}
                            disabled={
                              isToggling ||
                              isDeleting ||
                              reordering
                            }
                            onClick={() =>
                              togglePromotionStatus(
                                promotion
                              )
                            }
                            style={{
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                'space-between',
                              gap: 8,
                              border: promotion.is_active
                                ? '1px solid #86EFAC'
                                : '1px solid #CBD5E1',
                              borderRadius: 10,
                              background: '#FFFFFF',
                              color: promotion.is_active
                                ? '#15803D'
                                : '#64748B',
                              padding: '0 8px 0 10px',
                              fontSize: 10,
                              fontWeight: 900,
                              cursor:
                                isToggling ||
                                isDeleting ||
                                reordering
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity:
                                isToggling ||
                                isDeleting ||
                                reordering
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            <span>
                              {isToggling
                                ? 'Saving'
                                : promotion.is_active
                                  ? 'Active'
                                  : 'Inactive'}
                            </span>

                            <span
                              aria-hidden="true"
                              style={{
                                position: 'relative',
                                width: 34,
                                height: 19,
                                flexShrink: 0,
                                borderRadius: 999,
                                background:
                                  promotion.is_active
                                    ? '#22C55E'
                                    : '#CBD5E1',
                                transition:
                                  'background 160ms ease',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 2,
                                  left: promotion.is_active
                                    ? 17
                                    : 2,
                                  width: 15,
                                  height: 15,
                                  borderRadius: '50%',
                                  background: '#FFFFFF',
                                  boxShadow:
                                    '0 1px 3px rgba(15,23,42,.28)',
                                  transition:
                                    'left 160ms ease',
                                }}
                              />
                            </span>
                          </button>

                          <div
                            className="promotion-record-menu"
                            data-promotion-menu
                            style={{
                              position: 'relative',
                            }}
                          >
                            <button
                              type="button"
                              aria-label="Open ad actions"
                              aria-haspopup="menu"
                              aria-expanded={
                                openMenuId === promotion.id
                              }
                              disabled={
                                isDeleting ||
                                isToggling ||
                                isPinning ||
                                reordering
                              }
                              onClick={() =>
                                setOpenMenuId((current) =>
                                  current === promotion.id
                                    ? null
                                    : promotion.id
                                )
                              }
                              style={{
                                width: 42,
                                height: 36,
                                border:
                                  '1px solid #E2E8F0',
                                borderRadius: 10,
                                background: '#FFFFFF',
                                color: '#334155',
                                fontSize: 20,
                                fontWeight: 900,
                                lineHeight: 1,
                                cursor:
                                  isDeleting ||
                                  isToggling ||
                                  isPinning ||
                                  reordering
                                    ? 'not-allowed'
                                    : 'pointer',
                                opacity:
                                  isDeleting ||
                                  isToggling ||
                                  isPinning ||
                                  reordering
                                    ? 0.55
                                    : 1,
                              }}
                            >
                              ⋮
                            </button>

                            {openMenuId ===
                            promotion.id ? (
                              <div
                                className="promotion-record-menu-popover"
                                role="menu"
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  bottom: 44,
                                  zIndex: 30,
                                  width: 190,
                                  overflow: 'hidden',
                                  border:
                                    '1px solid #E2E8F0',
                                  borderRadius: 12,
                                  background: '#FFFFFF',
                                  boxShadow:
                                    '0 14px 32px rgba(15,23,42,.18)',
                                  padding: 6,
                                }}
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    togglePromotionPin(
                                      promotion
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    height: 40,
                                    border: 0,
                                    borderRadius: 8,
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    padding: '0 10px',
                                    textAlign: 'left',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {isPinning
                                    ? 'Saving...'
                                    : promotion.is_pinned
                                      ? '📌 Unpin Ad'
                                      : !promotion.is_active
                                        ? '📌 Activate before pinning'
                                        : pinnedCount >= 3
                                          ? '📌 Pin limit reached (3/3)'
                                          : '📌 Pin Ad'}
                                </button>

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    editPromotion(promotion)
                                  }
                                  style={{
                                    width: '100%',
                                    height: 40,
                                    border: 0,
                                    borderRadius: 8,
                                    background: '#FFFFFF',
                                    color: '#0F172A',
                                    padding: '0 10px',
                                    textAlign: 'left',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    deletePromotion(
                                      promotion
                                    )
                                  }
                                  style={{
                                    width: '100%',
                                    height: 40,
                                    border: 0,
                                    borderRadius: 8,
                                    background: '#FFFFFF',
                                    color: '#B91C1C',
                                    padding: '0 10px',
                                    textAlign: 'left',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  🗑 Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  border: '1px dashed #CBD5E1',
                  borderRadius: 18,
                  background: '#F8FAFC',
                  padding: 30,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#0F172A',
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  No ads records yet
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: '#64748B',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Complete the form above and click Create Ad.
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </AdminLayout>
  )
}
