import React from 'react'
import AdvertisementRotationManager from './AdvertisementRotationManager'

export default function OpeningAdRotationManager({ onChanged }) {
  return (
    <AdvertisementRotationManager
      title="Opening Ad"
      apiPrefix="/api/advertisements/admin/opening-rotation"
      uploadFileName="opening-ad"
      onChanged={onChanged}
    />
  )
}
