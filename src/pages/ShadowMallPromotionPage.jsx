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
  title: 'Special book bundle',
  description: 'Discover signed novels, limited merch, and reader gifts from official publishers.',
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true

    async function loadPromotion() {
      try {
        setLoading(true)
        setMessage('')

        const token = getAdminToken()
        const response = await fetch(`${API_URL}/api/shadow-mall/admin/promotion`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load promotion')
        }

        if (alive && data.promotion) {
          setForm({
            ...defaultForm,
            ...data.promotion,
          })
        }
      } catch (error) {
        if (alive) {
          setMessage(error.message || 'Failed to load promotion')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadPromotion()

    return () => {
      alive = false
    }
  }, [])

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

  async function savePromotion() {
    if (!form.title.trim()) {
      setMessage('Promotion title is required.')
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const token = getAdminToken()
      const formData = new FormData()

      formData.append('sponsor', form.sponsor.trim())
      formData.append('title', form.title.trim())
      formData.append('description', form.description.trim())
      formData.append('button_text', form.button_text.trim())
      formData.append('link_url', form.link_url.trim())
      formData.append('is_active', String(form.is_active))
      formData.append('remove_image', String(removeImage))
      formData.append(
        'remove_profile_image',
        String(removeProfileImage)
      )

      if (imageFile) {
        formData.append('promotion_image', imageFile)
      }

      if (profileFile) {
        formData.append('profile_image', profileFile)
      }

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/promotion`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save promotion')
      }

      setForm({
        ...defaultForm,
        ...(data.promotion || {}),
      })
      setImageFile(null)
      setImagePreview('')
      setProfileFile(null)
      setProfilePreview('')
      setRawImage('')
      setCropModalOpen(false)
      setCroppedAreaPixels(null)
      setRemoveImage(false)
      setRemoveProfileImage(false)
      setMessage('Promotion saved successfully.')

      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }

      if (profileInputRef.current) {
        profileInputRef.current.value = ''
      }
    } catch (error) {
      setMessage(error.message || 'Failed to save promotion')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm(defaultForm)
    setImageFile(null)
    setImagePreview('')
    setProfileFile(null)
    setProfilePreview('')
    setRawImage('')
    setCropModalOpen(false)
    setCroppedAreaPixels(null)
    setRemoveImage(true)
    setRemoveProfileImage(true)
    setMessage('Form reset. Click Save Promotion to apply it.')

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }

    if (profileInputRef.current) {
      profileInputRef.current.value = ''
    }
  }

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
      <div
        style={{
          minHeight: '100vh',
          background: '#F8FAFC',
          color: '#0F172A',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            padding: 26,
            maxWidth: 1380,
            margin: '0 auto',
          }}
        >
          <section
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
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(360px, 1fr) minmax(320px, 460px)',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <form
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
                Promotion Details
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
                Upload a square image and save the real promotion to the Backend.
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

              <div
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
                  {saving ? 'Saving...' : 'Save Promotion'}
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
                  Reset
                </button>
              </div>
            </form>

            <section
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
        </main>
      </div>
    </AdminLayout>
  )
}
