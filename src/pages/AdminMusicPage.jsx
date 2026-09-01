import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminMusicManager from '../components/AdminMusicManager'
import MusicImageUpload from '../components/MusicImageUpload'
import AdminMusicListenHistory from '../components/AdminMusicListenHistory'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .admin-music-page {
    --am-primary: #3B82F6;
    --am-primary-hover: #2563EB;
    --am-text: #0F172A;
    --am-muted: #64748B;
    --am-soft: #94A3B8;
    --am-border: #E2E8F0;
    --am-card: #FFFFFF;
    color: var(--am-text);
  }

  .am-toolbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .am-intro {
    max-width: 560px;
  }

  .am-intro-title {
    margin: 0;
    font-size: 20px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .am-intro-text {
    margin-top: 5px;
    color: var(--am-muted);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.55;
  }

  .am-primary-btn,
  .am-secondary-btn,
  .am-manage-btn {
    min-height: 40px;
    border-radius: 11px;
    padding: 0 14px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    transition: transform .16s ease, background .16s ease, border-color .16s ease;
  }

  .am-primary-btn {
    border: 1px solid var(--am-primary);
    background: var(--am-primary);
    color: #FFFFFF;
  }

  .am-primary-btn:hover {
    background: var(--am-primary-hover);
    border-color: var(--am-primary-hover);
  }

  .am-primary-btn:disabled,
  .am-secondary-btn:disabled,
  .am-manage-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .am-secondary-btn,
  .am-manage-btn {
    border: 1px solid var(--am-border);
    background: #FFFFFF;
    color: var(--am-text);
  }

  .am-secondary-btn:hover,
  .am-manage-btn:hover {
    border-color: #CBD5E1;
    background: #F8FAFC;
  }

  .am-primary-btn:active,
  .am-secondary-btn:active,
  .am-manage-btn:active {
    transform: scale(.98);
  }

  .am-label {
    display: block;
    margin: 0 0 7px;
    color: #334155;
    font-size: 10px;
    font-weight: 850;
  }

  .am-input,
  .am-select {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--am-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--am-text);
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .am-input::placeholder {
    color: var(--am-soft);
  }

  .am-input:focus,
  .am-select:focus {
    border-color: var(--am-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .08);
  }
  .am-search-wrap {
    margin-bottom: 14px;
  }

  .am-card {
    border: 1px solid var(--am-border);
    border-radius: 16px;
    background: var(--am-card);
  }

  .am-create-card,
  .am-song-card,
  .am-release-card {
    padding: 16px;
    margin-bottom: 20px;
  }

  .am-card-title {
    margin: 0;
    font-size: 13px;
    font-weight: 950;
  }

  .am-card-subtitle {
    margin-top: 4px;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .am-form-space {
    margin-top: 14px;
  }

  .am-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }

  .am-form-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 10px;
  }

  .am-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 10px;
  }

  .am-section-title {
    margin: 0;
    font-size: 13px;
    font-weight: 950;
  }

  .am-section-count {
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .am-artist-list {
    display: grid;
    gap: 10px;
    margin-bottom: 20px;
  }

  .am-artist-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 11px;
    border: 1px solid var(--am-border);
    border-radius: 15px;
    background: #FFFFFF;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .am-artist-row:hover {
    border-color: #CBD5E1;
    box-shadow: 0 3px 12px rgba(15, 23, 42, .04);
  }

  .am-avatar {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #4B5563, #17191B);
    color: #FFFFFF;
    flex-shrink: 0;
    overflow: hidden;
  }

  .am-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .am-artist-name {
    margin: 0;
    color: var(--am-text);
    font-size: 12px;
    font-weight: 950;
  }

  .am-artist-meta {
    margin-top: 4px;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 650;
  }

  .am-manage-card {
    margin: -10px 0 20px;
    padding: 14px;
    border: 1px solid #BFDBFE;
    border-radius: 15px;
    background: #F8FBFF;
  }

  .am-manage-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .am-manage-name {
    color: #1D4ED8;
    font-size: 12px;
    font-weight: 950;
  }

  .am-manage-meta {
    margin-top: 4px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
  }

  .am-mini-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .am-mini-card {
    border: 1px solid #DBEAFE;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 10px;
  }

  .am-mini-label {
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .am-mini-value {
    margin-top: 3px;
    font-size: 13px;
    font-weight: 950;
  }

  .am-release-list {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .am-release-row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    border: 1px solid #DBEAFE;
    border-radius: 12px;
    background: #FFFFFF;
    padding: 8px;
  }

  .am-release-cover {
    width: 42px;
    height: 42px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #334155, #0F172A);
    color: #FFFFFF;
    overflow: hidden;
  }

  .am-release-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .am-release-title {
    font-size: 11px;
    font-weight: 950;
  }

  .am-release-meta {
    margin-top: 3px;
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 700;
  }

  .am-song-card {
    padding: 16px;
  }

  .am-song-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .am-play-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--am-text);
    background: #F8FAFC;
    border: 1px solid var(--am-border);
  }

  .am-song-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  .am-field-card {
    min-width: 0;
    border: 1px solid var(--am-border);
    border-radius: 11px;
    padding: 10px;
    background: #FFFFFF;
  }

  .am-field-label {
    color: var(--am-muted);
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .am-field-value {
    margin-top: 3px;
    font-size: 11px;
    font-weight: 950;
  }

  .am-preview-btn {
    width: 100%;
    margin-top: 10px;
  }

  .am-notice {
    margin-top: 12px;
    border-radius: 11px;
    padding: 10px 12px;
    background: #F8FAFC;
    color: var(--am-muted);
    font-size: 10px;
    font-weight: 700;
    line-height: 1.5;
  }

  .am-notice.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .am-empty,
  .am-loading {
    border: 1px dashed var(--am-border);
    border-radius: 14px;
    padding: 22px;
    color: var(--am-muted);
    text-align: center;
    font-size: 11px;
    font-weight: 750;
  }

  @media (max-width: 640px) {
    .am-toolbar {
      gap: 10px;
    }

    .am-intro-title {
      font-size: 17px;
    }

    .am-primary-btn,
    .am-secondary-btn,
    .am-manage-btn {
      min-height: 38px;
      padding: 0 12px;
    }

    .am-create-card,
    .am-song-card,
    .am-release-card {
      padding: 13px;
    }

    .am-artist-row {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 9px;
      padding: 10px;
    }

    .am-avatar {
      width: 44px;
      height: 44px;
    }

    .am-manage-btn {
      font-size: 10px;
      padding: 0 11px;
    }

    .am-form-grid {
      grid-template-columns: 1fr;
    }
  }

  .mv2-page {
    --mv2-blue: #3B82F6;
    --mv2-blue-dark: #2563EB;
    --mv2-text: #0F172A;
    --mv2-muted: #64748B;
    --mv2-border: #E2E8F0;
    color: var(--mv2-text);
  }

  .mv2-topbar,
  .mv2-section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 14px;
  }

  .mv2-topbar {
    margin-bottom: 18px;
  }

  .mv2-title {
    margin: 0;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -.035em;
  }

  .mv2-copy {
    margin-top: 4px;
    color: var(--mv2-muted);
    font-size: 10px;
    font-weight: 700;
  }

  .mv2-btn {
    min-height: 40px;
    border: 1px solid var(--mv2-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--mv2-text);
    padding: 0 14px;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
    transition: background .16s ease, border-color .16s ease, transform .16s ease;
  }

  .mv2-btn:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  .mv2-btn.primary {
    border-color: var(--mv2-blue);
    background: var(--mv2-blue);
    color: #FFFFFF;
  }

  .mv2-btn.primary:hover {
    border-color: var(--mv2-blue-dark);
    background: var(--mv2-blue-dark);
  }

  .mv2-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .mv2-section {
    margin-bottom: 18px;
  }

  .mv2-section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 950;
  }

  .mv2-search,
  .mv2-input,
  .mv2-select {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--mv2-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--mv2-text);
    padding: 0 12px;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
  }

  .mv2-search {
    width: min(270px, 100%);
    min-height: 38px;
  }

  .mv2-search:focus,
  .mv2-input:focus,
  .mv2-select:focus {
    border-color: var(--mv2-blue);
    box-shadow: 0 0 0 3px rgba(59,130,246,.08);
  }

  .mv2-artists {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 3px 2px 9px;
    scrollbar-width: thin;
  }

  .mv2-artist-card {
    width: 114px;
    min-width: 114px;
    border: 1px solid var(--mv2-border);
    border-radius: 15px;
    background: #FFFFFF;
    padding: 10px 8px;
    text-align: center;
    cursor: pointer;
    transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
  }

  .mv2-artist-card:hover {
    transform: translateY(-2px);
    border-color: #BFDBFE;
    box-shadow: 0 7px 20px rgba(15,23,42,.06);
  }

  .mv2-artist-card.active {
    border-color: var(--mv2-blue);
    background: #EFF6FF;
    box-shadow: 0 0 0 2px rgba(59,130,246,.08);
  }

  .mv2-avatar {
    width: 66px;
    height: 66px;
    margin: 0 auto;
    border-radius: 999px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg,#475569,#111827);
    color: #FFFFFF;
  }

  .mv2-avatar img,
  .mv2-profile img,
  .mv2-release-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .mv2-artist-name {
    margin-top: 8px;
    overflow: hidden;
    font-size: 10px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mv2-artist-meta {
    margin-top: 3px;
    color: var(--mv2-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .mv2-add-card {
    display: grid;
    place-items: center;
    align-content: center;
    min-height: 114px;
    border-style: dashed;
    border-color: #BFDBFE;
    background: #F8FBFF;
    color: #2563EB;
  }

  .mv2-add-plus {
    font-size: 24px;
    line-height: 1;
  }

  .mv2-new-artist {
    margin-top: 12px;
    border: 1px solid #DBEAFE;
    border-radius: 16px;
    background: #F8FBFF;
    padding: 14px;
  }

  .mv2-new-artist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .mv2-field {
    margin-top: 12px;
  }

  .mv2-label {
    display: block;
    margin-bottom: 6px;
    color: #334155;
    font-size: 9px;
    font-weight: 900;
  }

  .mv2-workspace {
    display: grid;
    grid-template-columns: minmax(330px,.82fr) minmax(0,1.18fr);
    gap: 16px;
    align-items: start;
  }

  .mv2-card {
    border: 1px solid var(--mv2-border);
    border-radius: 17px;
    background: #FFFFFF;
    overflow: hidden;
  }

  .mv2-card-pad {
    padding: 15px;
  }

  .mv2-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 14px;
    border-radius: 12px;
    background: #F1F5F9;
    padding: 4px;
  }

  .mv2-tab {
    min-height: 39px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #475569;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .mv2-tab.active {
    background: #FFFFFF;
    color: #2563EB;
    box-shadow: 0 2px 8px rgba(15,23,42,.08);
  }

  .mv2-actions {
    display: flex;
    gap: 8px;
    margin-top: 13px;
  }

  .mv2-actions .primary {
    flex: 1;
  }

  .mv2-album-song {
    margin-top: 16px;
    border: 1px solid #DBEAFE;
    border-radius: 13px;
    background: #F8FBFF;
    padding: 12px;
  }

  .mv2-profile-head {
    display: grid;
    grid-template-columns: 62px minmax(0,1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 14px 15px;
    border-bottom: 1px solid var(--mv2-border);
  }

  .mv2-profile {
    width: 62px;
    height: 62px;
    border-radius: 999px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg,#475569,#111827);
    color: #FFFFFF;
  }

  .mv2-profile-name {
    font-size: 16px;
    font-weight: 950;
  }

  .mv2-listener-value {
    margin-top: 5px;
    font-size: 14px;
    font-weight: 950;
  }

  .mv2-listener-label {
    color: var(--mv2-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .mv2-metrics {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8px;
    padding: 12px 15px;
    border-bottom: 1px solid var(--mv2-border);
  }

  .mv2-metric {
    border: 1px solid var(--mv2-border);
    border-radius: 11px;
    background: #F8FAFC;
    padding: 9px;
  }

  .mv2-metric-label {
    color: var(--mv2-muted);
    font-size: 8px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .mv2-metric-value {
    margin-top: 3px;
    font-size: 14px;
    font-weight: 950;
  }

  .mv2-release-section {
    padding: 13px 15px;
    border-bottom: 1px solid var(--mv2-border);
  }

  .mv2-release-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 9px;
  }

  .mv2-release-title {
    font-size: 12px;
    font-weight: 950;
  }

  .mv2-release-list {
    display: grid;
    gap: 7px;
  }

  .mv2-release-row {
    display: grid;
    grid-template-columns: 48px minmax(0,1fr) auto;
    align-items: center;
    gap: 10px;
    border: 1px solid #EEF2F7;
    border-radius: 11px;
    background: #FFFFFF;
    padding: 7px;
  }

  .mv2-release-cover {
    width: 48px;
    height: 48px;
    border-radius: 9px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(145deg,#475569,#111827);
    color: #FFFFFF;
  }

  .mv2-release-name {
    overflow: hidden;
    font-size: 10px;
    font-weight: 950;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mv2-release-meta {
    margin-top: 3px;
    color: var(--mv2-muted);
    font-size: 8px;
    font-weight: 700;
  }

  .mv2-views {
    color: #475569;
    font-size: 9px;
    font-weight: 900;
    white-space: nowrap;
  }

  .mv2-empty {
    border: 1px dashed var(--mv2-border);
    border-radius: 11px;
    padding: 16px;
    color: var(--mv2-muted);
    text-align: center;
    font-size: 9px;
    font-weight: 750;
  }

  .mv2-manager {
    margin-top: 15px;
  }

  .mv2-status {
    margin-top: 14px;
    border-radius: 11px;
    background: #F8FAFC;
    padding: 10px 12px;
    color: var(--mv2-muted);
    font-size: 10px;
    font-weight: 750;
  }

  .mv2-status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .mv2-history {
    margin-top: 18px;
  }

  @media (max-width: 980px) {
    .mv2-workspace,
    .mv2-new-artist-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .mv2-topbar,
    .mv2-section-head {
      align-items: stretch;
      flex-direction: column;
    }

    .mv2-search {
      width: 100%;
    }

    .mv2-profile-head {
      grid-template-columns: 54px minmax(0,1fr);
    }

    .mv2-profile-head > .mv2-btn {
      grid-column: 1 / -1;
      width: 100%;
    }
  }

`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function musicRequest(path, options = {}) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin login required')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Music request failed')
  }

  return data
}

function MusicIcon({ size = 23 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6c0 .92 1.02 1.48 1.8.98l10.1-6.8a1.16 1.16 0 0 0 0-1.96L9.8 4.22C9.02 3.72 8 4.28 8 5.2Z" />
    </svg>
  )
}

function createAlbumTrackDraft() {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '',
    youtube_url: '',
  }
}

export default function AdminMusicPage() {
  const artistDetailCache = useRef({})
  const [artists, setArtists] = useState([])
  const [query, setQuery] = useState('')
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [artistName, setArtistName] = useState('')
  const [artistAvatarUrl, setArtistAvatarUrl] = useState('')
  const [artistBannerUrl, setArtistBannerUrl] = useState('')
  const [createMode, setCreateMode] = useState('single')
  const [soloTitle, setSoloTitle] = useState('')
  const [soloCoverUrl, setSoloCoverUrl] = useState('')
  const [soloYoutubeUrl, setSoloYoutubeUrl] = useState('')
  const [albumTitleNew, setAlbumTitleNew] = useState('')
  const [albumCoverUrlNew, setAlbumCoverUrlNew] = useState('')
  const [albumYearNew, setAlbumYearNew] = useState(String(new Date().getFullYear()))
  const [albumTracks, setAlbumTracks] = useState(() => [createAlbumTrackDraft()])
  const [showAdvancedManager, setShowAdvancedManager] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [selectedArtistDetail, setSelectedArtistDetail] = useState(null)
  const [releaseTitle, setReleaseTitle] = useState('')
  const [releaseType, setReleaseType] = useState('single')
  const [releaseCoverUrl, setReleaseCoverUrl] = useState('')
  const [releaseYear, setReleaseYear] = useState(String(new Date().getFullYear()))
  const [songReleaseId, setSongReleaseId] = useState('')
  const [songTitle, setSongTitle] = useState('')
  const [youtubeLink, setYoutubeLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await musicRequest('/api/music/admin/artists')
      setArtists(Array.isArray(data.artists) ? data.artists : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadArtist = useCallback(async (artistId, force = false) => {
    if (!artistId) {
      setSelectedArtistDetail(null)
      setSongReleaseId('')
      return
    }

    setError('')

    if (!force && artistDetailCache.current[artistId]) {
      const cached = artistDetailCache.current[artistId]
      setSelectedArtistDetail(cached)
      const cachedReleases = Array.isArray(cached.releases) ? cached.releases : []
      setSongReleaseId((current) => cachedReleases.some((release) => release.id === current) ? current : cachedReleases[0]?.id || '')
      return
    }

    try {
      const data = await musicRequest(`/api/music/admin/artists/${encodeURIComponent(artistId)}`)
      artistDetailCache.current[artistId] = data
      setSelectedArtistDetail(data)

      const releases = Array.isArray(data.releases) ? data.releases : []
      setSongReleaseId((current) => releases.some((release) => release.id === current) ? current : releases[0]?.id || '')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!selectedArtistId && artists.length) {
      setSelectedArtistId(artists[0].id)
    }
  }, [artists, selectedArtistId])

  useEffect(() => {
    if (selectedArtistId) {
      loadArtist(selectedArtistId)
    }
  }, [selectedArtistId, loadArtist])

  const filteredArtists = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return artists
    return artists.filter((artist) => String(artist.name || '').toLowerCase().includes(keyword))
  }, [artists, query])

  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId) || null
  const releases = Array.isArray(selectedArtistDetail?.releases) ? selectedArtistDetail.releases : []
  const singles = useMemo(() => releases.filter((release) => release.release_type === 'single'), [releases])
  const albums = useMemo(() => releases.filter((release) => release.release_type === 'album'), [releases])

  async function addArtist() {
    const name = artistName.trim()
    if (!name) {
      setError('Enter an artist name first.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/artists', {
        method: 'POST',
        body: JSON.stringify({
          name,
          avatar_url: artistAvatarUrl.trim(),
          banner_url: artistBannerUrl.trim(),
        }),
      })
      setArtistName('')
      setArtistAvatarUrl('')
      setArtistBannerUrl('')
      setShowArtistForm(false)
      setNotice(`${data.artist?.name || name} created.`)
      await loadOverview()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function manageArtist(artistId) {
    if (selectedArtistId === artistId) {
      setSelectedArtistId('')
      setSelectedArtistDetail(null)
      setSongReleaseId('')
      return
    }

    setSelectedArtistId(artistId)
    await loadArtist(artistId)
  }

  async function createRelease() {
    if (!selectedArtistId) {
      setError('Choose an artist first.')
      return
    }

    const title = releaseTitle.trim()
    if (!title) {
      setError('Enter an album or single title first.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: releaseType,
          cover_url: releaseCoverUrl.trim(),
          release_year: Number(releaseYear) || new Date().getFullYear(),
        }),
      })

      setReleaseTitle('')
      setReleaseCoverUrl('')
      setSongReleaseId(data.release?.id || '')
      setNotice(`${data.release?.title || title} created.`)
      await Promise.all([loadOverview(), loadArtist(selectedArtistId)])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function addSong() {
    const title = songTitle.trim()
    const youtubeUrl = youtubeLink.trim()

    if (!songReleaseId) {
      setError('Create or choose an Album/Single first.')
      return
    }

    if (!title) {
      setError('Enter the song title first.')
      return
    }

    if (!youtubeUrl) {
      setError('Paste a YouTube link first.')
      return
    }

    const selectedRelease = releases.find((release) => release.id === songReleaseId)
    const nextTrack = (selectedRelease?.songs?.length || 0) + 1

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const data = await musicRequest('/api/music/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          release_id: songReleaseId,
          title,
          youtube_url: youtubeUrl,
          track_number: nextTrack,
        }),
      })

      setSongTitle('')
      setYoutubeLink('')
      setNotice(`${data.song?.title || title} added.`)
      await Promise.all([loadOverview(), loadArtist(selectedArtistId)])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function refreshSelectedArtist() {
    if (!selectedArtistId) return
    delete artistDetailCache.current[selectedArtistId]
    await Promise.all([
      loadOverview(),
      loadArtist(selectedArtistId, true),
    ])
  }

  function selectArtistQuick(artistId) {
    if (!artistId || artistId === selectedArtistId) return
    setSelectedArtistId(artistId)
    setShowAdvancedManager(false)
    setNotice('')
    setError('')
  }

  async function createSoloRelease() {
    if (!selectedArtistId) {
      setError('Choose an artist first.')
      return
    }

    const title = soloTitle.trim()
    const youtubeUrl = soloYoutubeUrl.trim()

    if (!title || !youtubeUrl) {
      setError('Solo title and YouTube link are required.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    let createdReleaseId = ''

    try {
      const releaseData = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: 'single',
          cover_url: soloCoverUrl.trim(),
          release_year: new Date().getFullYear(),
        }),
      })

      createdReleaseId = releaseData.release?.id || ''
      if (!createdReleaseId) throw new Error('Single release was not created')

      await musicRequest('/api/music/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          release_id: createdReleaseId,
          title,
          youtube_url: youtubeUrl,
          track_number: 1,
        }),
      })

      setSoloTitle('')
      setSoloCoverUrl('')
      setSoloYoutubeUrl('')
      setNotice(`${title} created as Solo.`)

      await refreshSelectedArtist()
    } catch (requestError) {
      if (createdReleaseId) {
        try {
          await musicRequest(`/api/music/admin/releases/${encodeURIComponent(createdReleaseId)}`, {
            method: 'DELETE',
          })
        } catch {
          void 0
        }
      }
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function addAlbumTrackRow() {
    setAlbumTracks((current) => [...current, createAlbumTrackDraft()])
  }

  function updateAlbumTrackRow(index, field, value) {
    setAlbumTracks((current) =>
      current.map((track, trackIndex) =>
        trackIndex === index ? { ...track, [field]: value } : track
      )
    )
  }

  function removeAlbumTrackRow(index) {
    setAlbumTracks((current) => {
      if (current.length <= 1) return [createAlbumTrackDraft()]
      return current.filter((_, trackIndex) => trackIndex !== index)
    })
  }

  async function createAlbumWithTracks() {
    if (!selectedArtistId) {
      setError('Choose an artist first.')
      return
    }

    const title = albumTitleNew.trim()
    const tracks = albumTracks.map((track) => ({
      title: track.title.trim(),
      youtube_url: track.youtube_url.trim(),
    }))

    if (!title) {
      setError('Album title is required.')
      return
    }

    if (!tracks.length || tracks.some((track) => !track.title || !track.youtube_url)) {
      setError('Every Album track needs a Song Title and YouTube Link.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    let createdReleaseId = ''

    try {
      const releaseData = await musicRequest('/api/music/admin/releases', {
        method: 'POST',
        body: JSON.stringify({
          artist_id: selectedArtistId,
          title,
          release_type: 'album',
          cover_url: albumCoverUrlNew.trim(),
          release_year: Number(albumYearNew) || new Date().getFullYear(),
        }),
      })

      createdReleaseId = releaseData.release?.id || ''
      if (!createdReleaseId) throw new Error('Album was not created')

      for (let index = 0; index < tracks.length; index += 1) {
        const track = tracks[index]
        await musicRequest('/api/music/admin/songs', {
          method: 'POST',
          body: JSON.stringify({
            release_id: createdReleaseId,
            title: track.title,
            youtube_url: track.youtube_url,
            track_number: index + 1,
          }),
        })
      }

      setAlbumTitleNew('')
      setAlbumCoverUrlNew('')
      setAlbumYearNew(String(new Date().getFullYear()))
      setAlbumTracks([createAlbumTrackDraft()])
      setNotice(`${title} created with ${tracks.length} track${tracks.length === 1 ? '' : 's'}.`)

      await refreshSelectedArtist()
    } catch (requestError) {
      if (createdReleaseId) {
        try {
          await musicRequest(`/api/music/admin/releases/${encodeURIComponent(createdReleaseId)}`, {
            method: 'DELETE',
          })
        } catch {
          void 0
        }
      }

      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function totalReleaseViews(release) {
    return (release?.songs || []).reduce(
      (total, song) => total + Number(song.view_count || 0),
      0
    )
  }

  function formatShadowViews(value) {
    const count = Number(value || 0)
    if (count >= 1000000) return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
    return String(count)
  }

  return (
    <AdminLayout
      title="Music"
      subtitle="Create and manage Shadow artists, solos and albums."
    >
      <style>{styles}</style>

      <div className="mv2-page">
        <div className="mv2-topbar">
          <div>
            <h2 className="mv2-title">Shadow Music</h2>
            <div className="mv2-copy">
              Select an artist, then create a Solo or Album.
            </div>
          </div>

          <button
            type="button"
            className="mv2-btn primary"
            onClick={() => setShowArtistForm((current) => !current)}
          >
            + New Artist
          </button>
        </div>

        <section className="mv2-section">
          <div className="mv2-section-head">
            <div>
              <h3 className="mv2-section-title">Select Artist</h3>
              <div className="mv2-copy">
                Hover or click an artist to switch the workspace below.
              </div>
            </div>

            <input
              className="mv2-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artist..."
            />
          </div>

          <div className="mv2-artists">
            {loading ? (
              <div className="mv2-empty" style={{ minWidth: 220 }}>
                Loading artists...
              </div>
            ) : filteredArtists.map((artist) => (
              <button
                type="button"
                key={artist.id}
                className={`mv2-artist-card${artist.id === selectedArtistId ? ' active' : ''}`}
                onMouseEnter={() => selectArtistQuick(artist.id)}
                onClick={() => selectArtistQuick(artist.id)}
              >
                <div className="mv2-avatar">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt="" />
                  ) : (
                    <MusicIcon size={23} />
                  )}
                </div>

                <div className="mv2-artist-name">{artist.name}</div>
                <div className="mv2-artist-meta">
                  {Number(artist.total_listeners || 0).toLocaleString()} listeners
                </div>
              </button>
            ))}

            <button
              type="button"
              className="mv2-artist-card mv2-add-card"
              onClick={() => setShowArtistForm(true)}
            >
              <span className="mv2-add-plus">+</span>
              <span className="mv2-artist-name">Add Artist</span>
            </button>
          </div>

          {showArtistForm ? (
            <div className="mv2-new-artist">
              <div className="mv2-section-head">
                <div>
                  <h3 className="mv2-section-title">Create Artist</h3>
                  <div className="mv2-copy">
                    Profile recommended. Artist Cover is optional.
                  </div>
                </div>

                <button
                  type="button"
                  className="mv2-btn"
                  onClick={() => setShowArtistForm(false)}
                >
                  Close
                </button>
              </div>

              <div className="mv2-new-artist-grid">
                <div>
                  <div className="mv2-field">
                    <label className="mv2-label" htmlFor="mv2-artist-name">
                      Artist Name
                    </label>
                    <input
                      id="mv2-artist-name"
                      className="mv2-input"
                      value={artistName}
                      onChange={(event) => setArtistName(event.target.value)}
                      placeholder="Artist name"
                    />
                  </div>

                  <MusicImageUpload
                    value={artistAvatarUrl}
                    onChange={setArtistAvatarUrl}
                    shape="circle"
                    label="Artist Profile"
                    disabled={saving}
                  />
                </div>

                <div>
                  <MusicImageUpload
                    value={artistBannerUrl}
                    onChange={setArtistBannerUrl}
                    shape="banner"
                    label="Artist Cover (Optional)"
                    disabled={saving}
                  />

                  <div className="mv2-actions">
                    <button
                      type="button"
                      className="mv2-btn primary"
                      disabled={saving}
                      onClick={addArtist}
                    >
                      Create Artist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {selectedArtist ? (
          <div className="mv2-workspace">
            <section className="mv2-card">
              <div className="mv2-card-pad">
                <h3 className="mv2-section-title">Create New Release</h3>
                <div className="mv2-copy">
                  Selected artist: {selectedArtist.name}
                </div>

                <div className="mv2-tabs">
                  <button
                    type="button"
                    className={`mv2-tab${createMode === 'single' ? ' active' : ''}`}
                    onClick={() => setCreateMode('single')}
                  >
                    Solo / Single
                  </button>

                  <button
                    type="button"
                    className={`mv2-tab${createMode === 'album' ? ' active' : ''}`}
                    onClick={() => setCreateMode('album')}
                  >
                    Album
                  </button>
                </div>

                {createMode === 'single' ? (
                  <>
                    <div className="mv2-field">
                      <label className="mv2-label" htmlFor="mv2-solo-title">
                        Title
                      </label>
                      <input
                        id="mv2-solo-title"
                        className="mv2-input"
                        value={soloTitle}
                        onChange={(event) => setSoloTitle(event.target.value)}
                        placeholder="Song title"
                      />
                    </div>

                    <MusicImageUpload
                      value={soloCoverUrl}
                      onChange={setSoloCoverUrl}
                      shape="square"
                      label="Solo Cover"
                      disabled={saving}
                    />

                    <div className="mv2-field">
                      <label className="mv2-label" htmlFor="mv2-solo-youtube">
                        YouTube Link
                      </label>
                      <input
                        id="mv2-solo-youtube"
                        className="mv2-input"
                        type="url"
                        value={soloYoutubeUrl}
                        onChange={(event) => setSoloYoutubeUrl(event.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="mv2-actions">
                      <button
                        type="button"
                        className="mv2-btn primary"
                        disabled={saving}
                        onClick={createSoloRelease}
                      >
                        Create Solo
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mv2-field">
                      <label className="mv2-label" htmlFor="mv2-album-title">
                        Album Title
                      </label>
                      <input
                        id="mv2-album-title"
                        className="mv2-input"
                        value={albumTitleNew}
                        onChange={(event) => setAlbumTitleNew(event.target.value)}
                        placeholder="Album title"
                      />
                    </div>

                    <div className="mv2-field">
                      <label className="mv2-label" htmlFor="mv2-album-year">
                        Year
                      </label>
                      <input
                        id="mv2-album-year"
                        className="mv2-input"
                        inputMode="numeric"
                        value={albumYearNew}
                        onChange={(event) =>
                          setAlbumYearNew(event.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="2026"
                      />
                    </div>

                    <MusicImageUpload
                      value={albumCoverUrlNew}
                      onChange={setAlbumCoverUrlNew}
                      shape="square"
                      label="Album Cover"
                      disabled={saving}
                    />

                    <div className="mv2-album-song">
                      <div className="mv2-section-head">
                        <div>
                          <h3 className="mv2-section-title">Album Tracks</h3>
                          <div className="mv2-copy">
                            One Album Cover is used for every track.
                          </div>
                        </div>

                        <button
                          type="button"
                          className="mv2-btn"
                          disabled={saving}
                          onClick={addAlbumTrackRow}
                        >
                          + Add Track
                        </button>
                      </div>

                      {albumTracks.map((track, index) => (
                        <div
                          key={track.key}
                          style={{
                            marginTop: 10,
                            border: '1px solid #E2E8F0',
                            borderRadius: 12,
                            background: '#FFFFFF',
                            padding: 10,
                          }}
                        >
                          <div className="mv2-section-head">
                            <div className="mv2-release-title">Track {index + 1}</div>
                            <button
                              type="button"
                              className="mv2-btn"
                              disabled={saving}
                              onClick={() => removeAlbumTrackRow(index)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mv2-field">
                            <label className="mv2-label" htmlFor={`mv2-album-track-title-${index}`}>
                              Song Title
                            </label>
                            <input
                              id={`mv2-album-track-title-${index}`}
                              className="mv2-input"
                              value={track.title}
                              onChange={(event) =>
                                updateAlbumTrackRow(index, 'title', event.target.value)
                              }
                              placeholder="Song title"
                            />
                          </div>

                          <div className="mv2-field">
                            <label className="mv2-label" htmlFor={`mv2-album-track-youtube-${index}`}>
                              YouTube Link
                            </label>
                            <input
                              id={`mv2-album-track-youtube-${index}`}
                              className="mv2-input"
                              type="url"
                              value={track.youtube_url}
                              onChange={(event) =>
                                updateAlbumTrackRow(index, 'youtube_url', event.target.value)
                              }
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mv2-actions">
                      <button
                        type="button"
                        className="mv2-btn primary"
                        disabled={saving}
                        onClick={createAlbumWithTracks}
                      >
                        Create Album
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="mv2-card">
              <div className="mv2-profile-head">
                <div className="mv2-profile">
                  {selectedArtist.avatar_url ? (
                    <img src={selectedArtist.avatar_url} alt="" />
                  ) : (
                    <MusicIcon size={23} />
                  )}
                </div>

                <div>
                  <div className="mv2-profile-name">{selectedArtist.name}</div>
                  <div className="mv2-listener-value">
                    {Number(selectedArtistDetail?.artist?.total_listeners ?? selectedArtist.total_listeners ?? 0).toLocaleString()}
                  </div>
                  <div className="mv2-listener-label">
                    Total Listeners (All Time)
                  </div>
                </div>

                <button
                  type="button"
                  className="mv2-btn"
                  onClick={() => setShowAdvancedManager((current) => !current)}
                >
                  {showAdvancedManager ? 'Close Edit' : 'Edit Artist'}
                </button>
              </div>

              <div className="mv2-metrics">
                <div className="mv2-metric">
                  <div className="mv2-metric-label">Singles</div>
                  <div className="mv2-metric-value">{singles.length}</div>
                </div>

                <div className="mv2-metric">
                  <div className="mv2-metric-label">Albums</div>
                  <div className="mv2-metric-value">{albums.length}</div>
                </div>

                <div className="mv2-metric">
                  <div className="mv2-metric-label">Songs</div>
                  <div className="mv2-metric-value">
                    {releases.reduce(
                      (total, release) => total + (release.songs?.length || 0),
                      0
                    )}
                  </div>
                </div>
              </div>

              <div className="mv2-release-section">
                <div className="mv2-release-head">
                  <div className="mv2-release-title">Singles / Solo</div>
                  <div className="mv2-copy">{singles.length}</div>
                </div>

                {singles.length ? (
                  <div className="mv2-release-list">
                    {singles.map((release) => (
                      <div className="mv2-release-row" key={release.id}>
                        <div className="mv2-release-cover">
                          {release.cover_url ? (
                            <img src={release.cover_url} alt="" />
                          ) : (
                            <MusicIcon size={18} />
                          )}
                        </div>

                        <div>
                          <div className="mv2-release-name">{release.title}</div>
                          <div className="mv2-release-meta">
                            {release.release_year || ''} • Solo
                          </div>
                        </div>

                        <div className="mv2-views">
                          {formatShadowViews(totalReleaseViews(release))} Views
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mv2-empty">No Solo releases yet.</div>
                )}
              </div>

              <div className="mv2-release-section">
                <div className="mv2-release-head">
                  <div className="mv2-release-title">Albums</div>
                  <div className="mv2-copy">{albums.length}</div>
                </div>

                {albums.length ? (
                  <div className="mv2-release-list">
                    {albums.map((release) => (
                      <div
                        className="mv2-release-row"
                        key={release.id}
                      >
                        <div className="mv2-release-cover">
                          {release.cover_url ? (
                            <img src={release.cover_url} alt="" />
                          ) : (
                            <MusicIcon size={18} />
                          )}
                        </div>

                        <div>
                          <div className="mv2-release-name">{release.title}</div>
                          <div className="mv2-release-meta">
                            {release.release_year || ''} • {release.songs?.length || 0} songs
                          </div>
                        </div>

                        <div className="mv2-views">
                          {formatShadowViews(totalReleaseViews(release))} Views
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mv2-empty">No Albums yet.</div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="mv2-empty">
            Create or select an artist to begin.
          </div>
        )}

        {selectedArtist && showAdvancedManager ? (
          <div className="mv2-manager">
            <AdminMusicManager
              data={selectedArtistDetail}
              onRefresh={refreshSelectedArtist}
              onArtistDeleted={() => {
                artistDetailCache.current = {}
                setSelectedArtistId('')
                setSelectedArtistDetail(null)
                setSongReleaseId('')
                setShowAdvancedManager(false)
                return loadOverview()
              }}
            />
          </div>
        ) : null}

        <div className={`mv2-status${error ? ' error' : ''}`}>
          {error || notice || 'Music data is connected to Shadow Backend.'}
        </div>

        <div className="mv2-history">
          <AdminMusicListenHistory />
        </div>
      </div>
    </AdminLayout>
  )

}
