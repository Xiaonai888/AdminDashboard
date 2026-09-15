import React from 'react'
import AdvertisementRotationManager from './AdvertisementRotationManager'

export default function FreeUnlockAdRotationManager({ onChanged }) {
  return (
    <AdvertisementRotationManager
      title="Free Unlock & Read Ad"
      apiPrefix="/api/advertisements/admin/rotation/freeUnlock"
      uploadFileName="free-unlock-ad"
      onChanged={onChanged}
    />
  )
}
