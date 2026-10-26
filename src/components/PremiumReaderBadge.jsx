import React from 'react'

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFE49A 0%, #E9B73D 48%, #B97908 100%)',
  border: '1px solid #B78212',
  color: '#533600',
  fontSize: 11,
  fontWeight: 900,
  lineHeight: 1,
  verticalAlign: 'middle',
  boxShadow: '0 1px 3px rgba(120, 74, 0, 0.18)',
}

export default function PremiumReaderBadge({ isPremium = false, size = 20 }) {
  if (isPremium !== true) return null

  return (
    <span
      role="img"
      aria-label="Premium Reader"
      title="Premium Reader"
      style={{ ...badgeStyle, width: size, height: size }}
    >
      P
    </span>
  )
}
