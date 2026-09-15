import React from 'react'
import AdvertisementRotationManager from './AdvertisementRotationManager'

export default function MeAdRotationManager({ onChanged }) {
  return (
    <AdvertisementRotationManager
      title="Me Ads"
      apiPrefix="/api/advertisements/admin/rotation/me"
      uploadFileName="me-ad"
      onChanged={onChanged}
    />
  )
}
