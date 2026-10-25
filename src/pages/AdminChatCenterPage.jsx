import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
  startAdminSupportChat,
  sendAdminSupportMessage,
  changeAdminSupportChat,
  getAdminSupportFolders,
  createAdminSupportFolder,
  addChatToSupportFolder,
} from '../services/adminSupportChatApi'

const RECENT_CHAT_LIMIT = 10
const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function requestSupportChat(path, signal) {
  const token = getAdminToken()
  if (!token) throw new Error('Admin session expired. Please sign in again.')
  const response = await fetch(`${API_URL}/api/admin/support-chat${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok !== true) {
    throw new Error(data.message || `Admin Chat request failed (${response.status})`)
  }
  return data
}

const COUNTRY_CODES = {
  KH: ['Cambodia', '🇰🇭'], TH: ['Thailand', '🇹🇭'], PH: ['Philippines', '🇵🇭'],
  ID: ['Indonesia', '🇮🇩'], MY: ['Malaysia', '🇲🇾'], VN: ['Vietnam', '🇻🇳'],
  SG: ['Singapore', '🇸🇬'], US: ['United States', '🇺🇸'],
}

function normalizeConversation(value) {
  const reader = value.reader || {}
  const countryCode = value.override_country_code || value.detected_country_code || ''
  const [country, flag] = COUNTRY_CODES[String(countryCode).toUpperCase()] || ['Unknown', '🌐']
  const displayName = reader.name || reader.username || `Reader ${String(value.reader_user_id || '').slice(0, 8)}`
  return {
    id: value.id,
    user_id: value.reader_user_id,
    name: displayName,
    username: reader.username || '',
    avatar_url: reader.avatar_url || '',
    is_author: Boolean(reader.is_author),
    country,
    flag,
    assigned: value.assigned_admin_id || '',
    assignedMode: value.assigned_mode || 'manual',
    priority: value.priority ? value.priority[0].toUpperCase() + value.priority.slice(1) : 'Normal',
    unread: Math.max(0, Number(value.unread_for_admin) || 0),
    updatedAt: value.last_message_at || value.created_at,
    preview: value.last_message_preview || '',
    folders: [],
    note: '',
    archived: value.status === 'archived',
  }
}

function normalizeMessage(value) {
  const attachments = Array.isArray(value.attachments) ? value.attachments : []
  const hasText = typeof value.message_text === 'string' && value.message_text.trim()
  return {
    id: value.id,
    side: value.sender_kind === 'admin' ? 'support' : 'reader',
    agent: value.public_support_id || 'S-00',
    text: hasText || (attachments.length ? `${attachments.length} attachment(s)` : ''),
    time: value.created_at ? shortTime(value.created_at) : '—',
    seen: Boolean(value.seen_at),
  }
}

const SHADOW_ADMIN_LOGO = '/assets/Icons/Logo%20Shadow.jpg'
const COUNTRIES = [
  ['Cambodia', '🇰🇭'], ['Thailand', '🇹🇭'], ['Philippines', '🇵🇭'], ['Indonesia', '🇮🇩'],
  ['Malaysia', '🇲🇾'], ['Vietnam', '🇻🇳'], ['Singapore', '🇸🇬'], ['United States', '🇺🇸'], ['Other', '🌐'],
]
const svgPaths = {
  inbox: 'M4 4h16v16H4z M4 14h4l2 3h4l2-3h4',
  archive: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
  folder: 'M3 6h7l2 3h9v11H3z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M16 16l5 5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  check: 'M4 12l5 5L20 6',
  dots: 'M5 12h.01 M12 12h.01 M19 12h.01',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l4 2',
  transfer: 'M4 7h16l-4-4 M20 7l-4 4 M20 17H4l4-4 M4 17l4 4',
  shield: 'M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14',
}
function Icon({ name, size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={svgPaths[name] || svgPaths.inbox} /></svg>
}
function Brand({ compact = false }) {
  return (
    <span className={`scc-brand ${compact ? 'compact' : ''}`}>
      <img className="scc-brand-avatar" src={SHADOW_ADMIN_LOGO} alt="Shadow Admin" />
      <span className="scc-brand-copy">
        <span className="scc-brand-name">
          Shadow Admin
          <svg className="scc-verified" viewBox="0 0 24 24" aria-label="Verified" role="img">
            <circle cx="12" cy="12" r="11" fill="#2085F4" />
            <path d="m6.8 12.1 3.4 3.4 7-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {!compact && <small>Admin Chat Center</small>}
      </span>
    </span>
  )
}

function matchesChatSearch(chat, rawSearch) {
  const query = String(rawSearch || '').trim().toLowerCase()
  if (!query) return true
  let parts = [query.replace(/^@+/, '')]
  if (/^(https?:\/\/|www\.)/.test(query)) {
    try {
      const url = new URL(query.startsWith('www.') ? `https://${query}` : query)
      const identifiers = ['id', 'uid', 'user_id', 'username', 'user']
        .map((key) => url.searchParams.get(key))
        .filter(Boolean)
      const lastSegment = url.pathname.split('/').filter(Boolean).pop()
      if (!identifiers.length && lastSegment) identifiers.push(lastSegment)
      parts = identifiers.length ? identifiers : [query]
    } catch {}
  }
  const fields = [
    chat.name, chat.displayName, chat.username, chat.user_name,
    chat.id, chat.user_id, chat.accountId, chat.profileUrl,
    chat.accountLink, chat.accountUrl, chat.country,
    chat.assigned, chat.preview, ...(chat.folders || []),
  ].filter(Boolean).map((item) => String(item).toLowerCase())
  return parts.some((part) => fields.some((field) => field.includes(part.replace(/^@+/, ''))))
}

function shortTime(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const styles = `
  .scc { --scc-gold:#ad7b16; --scc-ink:#202839; --scc-line:#e8ebf0; --scc-muted:#7c8798; color:var(--scc-ink); }
  .scc * { box-sizing:border-box; }
  .scc button,.scc input,.scc select,.scc textarea { font:inherit; }
  .scc-demo { margin-bottom:12px; padding:10px 13px; border:1px solid #f1dba5; border-radius:11px; background:#fffaf0; color:#805a14; font-size:12px; line-height:1.5; }
  .scc-grid { display:grid; grid-template-columns:175px minmax(235px,300px) minmax(310px,1fr) minmax(215px,260px); min-height:700px; height:calc(100vh - 170px); max-height:980px; overflow:hidden; background:#fff; border:1px solid var(--scc-line); border-radius:17px; box-shadow:0 14px 40px rgba(0,0,0,.04); }
  .scc-nav { border-right:1px solid var(--scc-line); background:#fdfdfd; padding:20px 10px; display:flex; flex-direction:column; gap:8px; }
  .scc-logo { font-size:16px; font-weight:900; padding:5px 4px 26px; }
  .scc-logo small { display:block; color:var(--scc-muted); font-size:10px; font-weight:600; margin-top:3px; }
  .scc-brand { display:flex; align-items:center; gap:9px; min-width:0; }
  .scc-brand-avatar { width:35px; height:35px; flex:0 0 35px; border-radius:50%; object-fit:cover; background:#f3ebdc; border:1px solid #e5d7ba; }
  .scc-brand-copy { min-width:0; display:flex; flex-direction:column; }
  .scc-brand-name { display:inline-flex; align-items:center; gap:4px; font-size:12px; white-space:nowrap; font-weight:900; }
  .scc-brand-copy small { margin-top:2px; white-space:nowrap; font-weight:600; font-size:9px; }
  .scc-verified { width:15px; height:15px; flex:0 0 15px; }
  .scc-brand.compact .scc-brand-avatar { width:23px; height:23px; flex-basis:23px; }
  .scc-brand.compact .scc-brand-name { font-size:10px; }
  .scc-brand.compact .scc-verified { width:12px; height:12px; flex-basis:12px; }
  .scc-agent { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
  .scc-searchhelp { color:#8b96a6; font-size:10px; margin-top:7px; line-height:1.45; }
  .scc-navbtn { width:100%; min-height:42px; display:flex; align-items:center; gap:9px; padding:0 10px; border:0; border-radius:10px; background:transparent; color:#4d5868; text-align:left; font-size:12px !important; font-weight:800 !important; cursor:pointer; }
  .scc-navbtn.active { background:#fff0d4; color:#94620f; box-shadow:inset 3px 0 #b68727; }
  .scc-navbtn:disabled { opacity:.58; cursor:not-allowed; }
  .scc-count { margin-left:auto; background:#f4e0b7; color:#865809; padding:3px 6px; border-radius:20px; font-size:10px; }
  .scc-navfoot { margin-top:auto; color:#8a754e; background:#fff9ee; border:1px solid #f2e5c9; border-radius:12px; padding:11px; font-size:10px; line-height:1.6; }
  .scc-list { border-right:1px solid var(--scc-line); min-width:0; display:flex; flex-direction:column; }
  .scc-listhead { padding:20px 12px 12px; border-bottom:1px solid var(--scc-line); }
  .scc-listhead h2 { margin:0; font-size:22px; }
  .scc-sub { color:var(--scc-muted); font-size:11px; margin-top:4px; }
  .scc-search { display:flex; align-items:center; gap:7px; margin-top:13px; padding:0 10px; height:38px; border:1px solid #dfe4ec; border-radius:10px; color:#9aa3b2; }
  .scc-search input { border:0; outline:0; background:transparent; width:100%; min-width:0; font-size:11px; }
  .scc-tabs { display:flex; gap:5px; flex-wrap:wrap; margin-top:10px; }
  .scc-tab { border:1px solid #e9edf2; background:#f8fafc; color:#677283; padding:7px 9px; border-radius:8px; font-size:10px !important; font-weight:850 !important; cursor:pointer; }
  .scc-tab.active { background:var(--scc-gold); color:#fff; border-color:var(--scc-gold); }
  .scc-rows { flex:1; overflow:auto; }
  .scc-item { width:100%; border:0; border-bottom:1px solid #f1f3f6; background:#fff; text-align:left; padding:12px 10px; display:flex; gap:9px; cursor:pointer; color:inherit; }
  .scc-item:hover,.scc-item.active { background:#fff9ee; }
  .scc-avatar { width:38px; height:38px; border-radius:50%; background:#f4e5c8; color:#825e19; flex:0 0 38px; display:grid; place-items:center; font-size:12px; font-weight:900; }
  .scc-itembody { flex:1; min-width:0; }
  .scc-itemtitle { display:flex; justify-content:space-between; gap:5px; font-size:11px; }
  .scc-itemtitle time { color:#93a0af; font-size:9px; white-space:nowrap; }
  .scc-preview { display:block; margin-top:5px; color:#7d8999; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .scc-tags { display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-top:7px; }
  .scc-tag { border-radius:16px; padding:4px 7px; background:#eaf0f8; color:#56657b; font-size:9px; font-weight:850; }
  .scc-tag.gold { background:#f5e2b8; color:#896009; }
  .scc-unread { display:inline-grid; place-items:center; min-width:19px; height:19px; padding:0 5px; border-radius:12px; background:#f3af2f; font-size:10px; color:white; font-weight:900; }
  .scc-more { width:27px; height:27px; flex:0 0 27px; border:0; background:transparent; border-radius:7px; display:grid; place-items:center; color:#64748b; cursor:pointer; }
  .scc-more:hover { background:#f8e9c5; }
  .scc-chat { display:flex; flex-direction:column; min-width:0; background:linear-gradient(#fff,#fbfcfe); }
  .scc-chathead { padding:13px 15px; border-bottom:1px solid var(--scc-line); display:flex; gap:12px; justify-content:space-between; align-items:center; }
  .scc-person { display:flex; align-items:center; gap:9px; min-width:0; }
  .scc-person b { display:block; font-size:13px; }
  .scc-person small { display:block; color:var(--scc-muted); font-size:10px; margin-top:5px; }
  .scc-status { padding:5px 8px; border-radius:20px; background:#e9f8ee; color:#128353; font-size:10px; font-weight:850; white-space:nowrap; }
  .scc-tools { display:flex; align-items:center; gap:6px; padding:10px 13px; border-bottom:1px solid var(--scc-line); }
  .scc-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:8px 11px; background:#fff; border:1px solid #e0e4ec; color:#4c596c; border-radius:9px; font-size:11px !important; font-weight:850 !important; cursor:pointer; }
  .scc-btn.gold { background:var(--scc-gold); border-color:var(--scc-gold); color:#fff; }
  .scc-btn.red { color:#c82e41; background:#fff6f6; }
  .scc-btn:disabled { opacity:.5; cursor:not-allowed; }
  .scc-messages { flex:1; overflow:auto; padding:16px; }
  .scc-bubblewrap { margin-bottom:17px; display:flex; flex-direction:column; align-items:flex-start; }
  .scc-bubblewrap.support { align-items:flex-end; }
  .scc-agent { font-size:10px; font-weight:850; margin-bottom:4px; }
  .scc-bubble { max-width:83%; padding:11px 13px; border-radius:13px; border:1px solid #e5e9f0; background:#fff; color:#405066; font-size:12px; line-height:1.6; white-space:pre-wrap; overflow-wrap:anywhere; }
  .scc-supportbubble { background:#fff3da; border-color:#fff0c9; }
  .scc-time { margin-top:5px; color:#99a4b1; font-size:10px; }
  .scc-compose { padding:13px; border-top:1px solid var(--scc-line); display:flex; align-items:center; gap:8px; }
  .scc-compose input { min-width:0; width:100%; height:40px; border:1px solid #e1e5ec; border-radius:10px; padding:0 12px; outline:0; font-size:12px; }
  .scc-details { padding:16px 14px; overflow:auto; }
  .scc-details h3 { margin:0 0 12px; font-size:16px; }
  .scc-panel { border-bottom:1px solid #edf0f4; padding:11px 0 14px; }
  .scc-panel h4 { display:flex; gap:6px; align-items:center; font-size:11px; margin:0 0 10px; color:#6e551e; }
  .scc-panel small { color:#8d99a7; font-size:10px; line-height:1.6; }
  .scc-panel select,.scc-panel textarea { width:100%; padding:9px 10px; border:1px solid #dfe5ec; border-radius:9px; outline:0; color:#4b5567; background:#fff; font-size:11px; }
  .scc-panel textarea { resize:vertical; min-height:70px; }
  .scc-inline { display:flex; align-items:center; gap:7px; }
  .scc-inline select { flex:1; min-width:0; }
  .scc-priority { display:flex; gap:6px; flex-wrap:wrap; }
  .scc-priority button { padding:7px 9px; border:1px solid #e6e8ef; border-radius:8px; font-size:10px; background:#f8fafc; color:#64748b; cursor:pointer; }
  .scc-priority button.active { background:#fff0cf; border-color:#e9c26b; color:#885b07; }
  .scc-menu { position:fixed; z-index:5000; width:195px; padding:6px; border:1px solid #e1e5eb; background:#fff; border-radius:12px; box-shadow:0 18px 45px rgba(15,23,42,.16); }
  .scc-menu button { width:100%; border:0; background:transparent; color:#384354; padding:11px; text-align:left; border-radius:8px; cursor:pointer; font-size:12px; }
  .scc-menu button:hover { background:#fff5e3; }
  .scc-menu button.danger { color:#d72f45; }
  .scc-dialogback { position:fixed; inset:0; background:#10182770; z-index:6000; display:grid; place-items:center; padding:18px; }
  .scc-dialog { width:min(420px,100%); background:#fff; border-radius:17px; padding:24px; box-shadow:0 25px 70px #0003; }
  .scc-dialog h3 { margin:0 0 11px; font-size:18px; }
  .scc-dialog p { font-size:12px; color:#64748b; line-height:1.7; }
  .scc-empty { padding:24px; text-align:center; color:#94a3b8; font-size:12px; }
  .scc-personhit { display:flex; gap:9px; align-items:center; padding:10px; border-bottom:1px solid #edf0f4; }
  .scc-personhit .scc-itembody { display:flex; flex-direction:column; gap:4px; }
  .scc-searchgroup { padding:9px 12px; font-size:11px; color:#94620f; font-weight:900; background:#fff9ec; border-bottom:1px solid #f3e3c6; }
  .scc-searchgroup small { color:#8b96a6; font-weight:600; }
  .scc-avatar img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
  .scc-retry { display:inline-flex; margin-top:8px; padding:8px 10px; border:1px solid #e2cfac; border-radius:9px; color:#845b0e; background:#fff9ed; cursor:pointer; }
  .scc-compose input:disabled { background:#f8fafc; cursor:not-allowed; }
  .scc-compose input:focus,.scc-compose input:focus-visible { border-color:var(--scc-gold); }
  .scc-compose button:disabled { opacity:.55; }
  .scc-startform { display:grid; gap:12px; margin-top:15px; }
  .scc-startform textarea { width:100%; min-height:110px; max-height:220px; padding:11px; border:1px solid var(--scc-line); border-radius:10px; resize:vertical; font-size:12px; }
  .scc-startactions { display:flex; gap:9px; justify-content:flex-end; }
  .scc-startrecipient { font-size:12px; color:#586174; overflow-wrap:anywhere; }
  .scc-panel select:disabled { color:#697384; background:#f7f8fb; cursor:not-allowed; }
  .scc-busy { opacity:.58; pointer-events:none; }
  .scc-searchalert { padding:8px 10px; color:#b45309; font-size:11px; line-height:1.5; }

  @media(max-width:1250px) { .scc-grid { grid-template-columns:155px minmax(225px,285px) minmax(280px,1fr); } .scc-details { display:none; } }
  @media(max-width:800px) { .scc-grid { display:flex; flex-direction:column; min-height:0; height:auto; max-height:none; } .scc-nav { flex-direction:row; gap:5px; overflow:auto; padding:8px; } .scc-logo,.scc-navfoot { display:none; } .scc-navbtn { width:auto; white-space:nowrap; } .scc-list { max-height:430px; min-height:350px; border-right:0; border-bottom:1px solid var(--scc-line); } .scc-chat { min-height:520px; } .scc-details { display:block; } }
`

export default function AdminChatCenterPage() {
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [menu, setMenu] = useState(null)
  const [folderMenu, setFolderMenu] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState(false)
  const [folders, setFolders] = useState([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [replyDraft, setReplyDraft] = useState('')
  const [startPerson, setStartPerson] = useState(null)
  const [startDraft, setStartDraft] = useState('')
  const [writeBusy, setWriteBusy] = useState(false)
  const writing = useRef(false)
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const [inboxLoading, setInboxLoading] = useState(true)
  const [inboxError, setInboxError] = useState('')
  const [inboxHasMore, setInboxHasMore] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [threadMessages, setThreadMessages] = useState([])
  const [threadConversationId, setThreadConversationId] = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState('')
  const [threadHasMore, setThreadHasMore] = useState(false)
  const [threadCursor, setThreadCursor] = useState(null)
  const [olderLoading, setOlderLoading] = useState(false)
  const [people, setPeople] = useState([])
  const [peopleLoading, setPeopleLoading] = useState(false)
  const [peopleError, setPeopleError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setInboxLoading(true)
    setInboxError('')
    const remoteFilter = ({ All: 'all', Unread: 'unread', Seen: 'seen', Assigned: 'assigned' })[filter] || 'all'
    requestSupportChat(`/conversations?filter=${remoteFilter}`, controller.signal)
      .then((result) => {
        if (!current) return
        const next = (Array.isArray(result.conversations) ? result.conversations : [])
          .slice(0, RECENT_CHAT_LIMIT).map(normalizeConversation)
        setChats(next)
        setInboxHasMore(Boolean(result.has_more))
        setSelectedId((old) => next.some((chat) => chat.id === old) ? old : null)
      })
      .catch((error) => {
        if (!current || controller.signal.aborted) return
        setChats([])
        setSelectedId(null)
        setInboxError(error.message || 'Unable to load conversations.')
      })
      .finally(() => { if (current) setInboxLoading(false) })
    return () => { current = false; controller.abort() }
  }, [filter, refreshCount])

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setThreadMessages([])
    setThreadConversationId(null)
    setThreadError('')
    setThreadHasMore(false)
    setThreadCursor(null)
    setOlderLoading(false)
    if (!selectedId) { setThreadLoading(false); return () => controller.abort() }
    setThreadLoading(true)
    requestSupportChat(`/conversations/${encodeURIComponent(selectedId)}/messages`, controller.signal)
      .then((result) => {
        if (!current) return
        setThreadMessages((Array.isArray(result.messages) ? result.messages : []).slice(-20).map(normalizeMessage))
        setThreadConversationId(selectedId)
        setThreadHasMore(Boolean(result.has_more))
        setThreadCursor(result.next_before || null)
      })
      .catch((error) => {
        if (!current || controller.signal.aborted) return
        setThreadError(error.message || 'Unable to load messages.')
      })
      .finally(() => { if (current) setThreadLoading(false) })
    return () => { current = false; controller.abort() }
  }, [selectedId])

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const query = search.trim()
    setPeople([])
    setPeopleError('')
    if (query.length < 2) { setPeopleLoading(false); return () => controller.abort() }
    setPeopleLoading(true)
    const timer = setTimeout(() => {
      requestSupportChat(`/users/search?q=${encodeURIComponent(query)}`, controller.signal)
        .then((result) => { if (current) setPeople((Array.isArray(result.users) ? result.users : []).slice(0, 10)) })
        .catch((error) => { if (current && !controller.signal.aborted) setPeopleError(error.message || 'Search unavailable.') })
        .finally(() => { if (current) setPeopleLoading(false) })
    }, 450)
    return () => { current = false; clearTimeout(timer); controller.abort() }
  }, [search])

  const active = chats.find((chat) => chat.id === selectedId && !chat.archived) || null
  const inbox = chats.filter((chat) => !chat.archived)
  const shownMessages = selectedId && threadConversationId === selectedId ? threadMessages : []
  const unreadTotal = inbox.reduce((sum, chat) => sum + (chat.unread > 0 ? 1 : 0), 0)
  const filtered = useMemo(() => inbox.filter((chat) => matchesChatSearch(chat, search))
    .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime())
    .slice(0, RECENT_CHAT_LIMIT), [inbox, search])
  async function writeAction(work) {
    if (writing.current) return false
    writing.current = true
    setWriteBusy(true)
    try {
      await work()
      return true
    } catch (error) {
      setNotice(error?.message || 'Support Chat action could not be saved.')
      return false
    } finally {
      writing.current = false
      setWriteBusy(false)
    }
  }

  async function updateChat(id, action, value = null) {
    await writeAction(async () => {
      await changeAdminSupportChat(id, action, value)
      if (action === 'archive') {
        setSelectedId((current) => current === id ? null : current)
        setChats((rows) => rows.filter((chat) => chat.id !== id))
        setRefreshCount((count) => count + 1)
      } else if (action === 'read') {
        setChats((rows) => rows.map((chat) => chat.id === id ? { ...chat, unread: 0 } : chat))
        if (filter === 'Unread') setRefreshCount((count) => count + 1)
      } else if (action === 'priority') {
        setChats((rows) => rows.map((chat) => chat.id === id ? { ...chat, priority: value[0].toUpperCase() + value.slice(1) } : chat))
      } else if (action === 'country') {
        const [name, flag] = COUNTRY_CODES[value] || ['Other', '🌐']
        setChats((rows) => rows.map((chat) => chat.id === id ? { ...chat, country: name, flag } : chat))
      }
    })
  }

  const openMenu = (event, id) => {
    event.preventDefault()
    event.stopPropagation()
    const x = Math.min(event.clientX, window.innerWidth - 210)
    const y = Math.min(event.clientY, window.innerHeight - 270)
    setFolderMenu(false)
    setMenu({ id, x: Math.max(10, x), y: Math.max(10, y) })
  }

  const menuAction = (action) => {
    const id = menu?.id
    if (!id) return
    setMenu(null)
    if (action === 'delete') {
      setDialog(true)
      return
    }
    if (action === 'read' || action === 'archive') updateChat(id, action)
  }

  async function openFolderOptions() {
    setFolderMenu(true)
    setFolderLoading(true)
    try {
      const result = await getAdminSupportFolders()
      setFolders(Array.isArray(result.folders) ? result.folders.slice(0, 10) : [])
    } catch (error) {
      setNotice(error?.message || 'Folders could not be loaded.')
    } finally {
      setFolderLoading(false)
    }
  }

  async function addFolder(folderId, id = menu?.id || selectedId) {
    if (!id || !folderId) return
    await writeAction(async () => {
      await addChatToSupportFolder(folderId, id)
      const folder = folders.find((item) => item.id === folderId)
      if (folder) setChats((rows) => rows.map((chat) => chat.id === id ? { ...chat, folders: [...new Set([...chat.folders, folder.name])] } : chat))
      setFolderMenu(false)
      setMenu(null)
    })
  }

  async function createFolder() {
    const value = newFolder.trim().replace(/\s+/g, ' ').slice(0, 60)
    const id = menu?.id || selectedId
    if (!value || !id) return
    await writeAction(async () => {
      const result = await createAdminSupportFolder(value)
      if (!result.folder?.id) throw new Error('The new folder was not returned by the server.')
      setFolders((current) => [...current, result.folder])
      await addChatToSupportFolder(result.folder.id, id)
      setChats((rows) => rows.map((chat) => chat.id === id ? { ...chat, folders: [...new Set([...chat.folders, result.folder.name])] } : chat))
      setFolderMenu(false)
      setMenu(null)
      setNewFolder('')
    })
  }

  async function loadOlderMessages() {
    const id = selectedId
    const cursor = threadCursor
    if (!id || !threadHasMore || !cursor || olderLoading) return
    setOlderLoading(true)
    try {
      const result = await requestSupportChat(`/conversations/${encodeURIComponent(id)}/messages?before=${encodeURIComponent(cursor)}`)
      if (selectedIdRef.current !== id) return
      const older = (Array.isArray(result.messages) ? result.messages : []).map(normalizeMessage)
      setThreadMessages((current) => {
        const known = new Set(current.map((item) => item.id))
        return [...older.filter((item) => !known.has(item.id)), ...current]
      })
      setThreadHasMore(Boolean(result.has_more))
      setThreadCursor(result.next_before || null)
    } catch (error) {
      if (selectedIdRef.current === id) setNotice(error?.message || 'Unable to load older messages.')
    } finally {
      setOlderLoading(false)
    }
  }

  const handleReply = async (event) => {
    event.preventDefault()
    const id = selectedId
    const text = replyDraft.trim()
    if (!id || !text || text.length > 2000) return
    await writeAction(async () => {
      const result = await sendAdminSupportMessage(id, text)
      if (result.message?.id && selectedIdRef.current === id) {
        setThreadMessages((rows) => [...rows, normalizeMessage(result.message)])
        setThreadConversationId(id)
      }
      setReplyDraft('')
      setRefreshCount((count) => count + 1)
    })
  }

  const openSearchPerson = (person) => {
    setStartPerson(person)
    setStartDraft('')
  }

  const handleStartChat = async (event) => {
    event.preventDefault()
    const targetId = startPerson?.id
    const text = startDraft.trim()
    if (!targetId || !text || text.length > 2000) return
    await writeAction(async () => {
      const result = await startAdminSupportChat(targetId, text)
      if (!result.conversation_id) throw new Error('Conversation was not returned by the server.')
      setStartPerson(null)
      setStartDraft('')
      setSearch('')
      setFilter('All')
      setSelectedId(result.conversation_id)
      setRefreshCount((count) => count + 1)
    })
  }
  return <AdminLayout title="Chat Center" subtitle="Shadow Admin · Reader & Author conversations">
    <style>{styles}</style>
    <main className="scc" onClick={() => menu && setMenu(null)}>
      <div className="scc-demo">Live Shadow Admin Support · separate from private Reader/Author chats. Deleting conversations and automatic assignment are not enabled.</div>
      <div className="scc-grid">
        <nav className="scc-nav" aria-label="Chat navigation">
          <div className="scc-logo"><Brand /></div>
          <button className="scc-navbtn active" type="button"><Icon name="inbox" /> All Inbox <span className="scc-count">{inbox.length}</span></button>
          <button className="scc-navbtn" type="button" onClick={() => navigate('/admin-chat/archived')}><Icon name="archive" /> Archived Chats</button>
          <button className="scc-navbtn" type="button" onClick={() => navigate('/admin-chat/folders')}><Icon name="folder" /> Folders</button>
          <div className="scc-navfoot"><Icon name="shield" size={14} /> Deleting chats will require server-side passkey verification once the backend is connected.</div>
        </nav>
        <section className="scc-list" aria-label="Inbox conversation list">
          <header className="scc-listhead"><h2>All Inbox</h2><div className="scc-sub">Latest {RECENT_CHAT_LIMIT} support conversations {inboxHasMore ? '· more available' : ''} <button className="scc-retry" type="button" onClick={() => setRefreshCount(n => n + 1)} disabled={inboxLoading}>Refresh</button></div>
            <label className="scc-search"><Icon name="search" size={16}/><input aria-label="Search conversations" placeholder="Name, @username, account link, ID..." value={search} onChange={(e) => setSearch(e.target.value)} /></label>
            <div className="scc-searchhelp">Searches recent conversations and all active accounts on the server. Account results are limited to 10.</div>
            <div className="scc-tabs">{['All','Unread','Seen','Assigned'].map((x) => <button type="button" key={x} onClick={() => setFilter(x)} className={`scc-tab ${filter===x?'active':''}`}>{x}{x==='Unread'?` ${unreadTotal}`:''}</button>)}</div>
          </header>
          <div className="scc-rows">
            {inboxLoading && <div className="scc-empty">Loading recent support chats…</div>}
            {inboxError && <div className="scc-searchalert" role="alert">{inboxError} <button className="scc-retry" type="button" onClick={() => setRefreshCount(n => n + 1)}>Retry</button></div>}
            {!inboxLoading && !inboxError && filtered.length === 0 && <div className="scc-empty">{search.trim() ? 'No matching recent chats.' : 'No support conversations yet.'}</div>}
            {!inboxLoading && !inboxError && filtered.map((chat) => <div key={chat.id} className={`scc-item ${active?.id === chat.id?'active':''}`} role="button" tabIndex={0} onClick={() => setSelectedId(chat.id)} onKeyDown={(e) => { if(e.key==='Enter')setSelectedId(chat.id) }} onContextMenu={(e) => openMenu(e,chat.id)}>
              <span className="scc-avatar">{chat.avatar_url ? <img src={chat.avatar_url} alt="" loading="lazy" /> : chat.is_author ? 'AU' : 'RD'}</span>
              <span className="scc-itembody"><span className="scc-itemtitle"><strong>{chat.name}</strong><time>{shortTime(chat.updatedAt)}</time></span>
                <span className="scc-preview">{chat.flag} {chat.country} · {chat.preview}</span>
                <span className="scc-tags">{chat.folders.slice(0,2).map((f)=><span className={`scc-tag ${f==='VIP'?'gold':''}`} key={f}>{f}</span>)}{chat.unread>0 && <span className="scc-unread">{chat.unread}</span>}<span className="scc-tag">Agent {chat.assigned || 'Unassigned'}</span></span>
              </span>
              <button type="button" className="scc-more" aria-label={`Actions for ${chat.name}`} onClick={(e)=>{e.stopPropagation(); openMenu(e,chat.id)}}><Icon name="dots" /></button>
            </div>)}
            {search.trim().length >= 2 && <>
              <div className="scc-searchgroup">People search <small>· 10 results max</small></div>
              {peopleLoading && <div className="scc-empty">Searching accounts…</div>}
              {peopleError && <div className="scc-searchalert" role="alert">{peopleError}</div>}
              {!peopleLoading && !peopleError && people.length === 0 && <div className="scc-empty">No matching accounts.</div>}
              {!peopleLoading && !peopleError && people.map((person) => <div key={person.id} className="scc-personhit">
                <span className="scc-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" loading="lazy" /> : person.is_author ? 'AU' : 'RD'}</span>
                <span className="scc-itembody"><strong>{person.name || person.username || person.id}</strong><small>@{person.username || '—'} · {person.id.slice(0, 8)}…</small></span>
                <button className="scc-btn" type="button" onClick={() => openSearchPerson(person)}>Start Chat</button>
              </div>)}
            </>}
          </div>
        </section>
        <section className="scc-chat" aria-label="Conversation thread">
          {active ? <>
            <header className="scc-chathead"><div className="scc-person"><span className="scc-avatar">{active.avatar_url ? <img src={active.avatar_url} alt="" loading="lazy" /> : active.is_author ? 'AU' : 'RD'}</span><div><b>{active.name}</b><small>{active.flag} {active.country} · ID {active.user_id || active.id}</small></div></div><span className="scc-status">{active.unread>0?'Unseen':'Seen'}</span></header>
            <div className="scc-tools"><button className="scc-btn" type="button" disabled title="Staff directory will be connected later"><Icon name="transfer"/> Transfer</button><button className="scc-btn" type="button" disabled title="Automatic assignment is not enabled"><Icon name="user"/> Auto Assign</button><button className="scc-btn" type="button" disabled={writeBusy || active.unread===0} onClick={()=>updateChat(active.id,'read')}><Icon name="check"/> Mark as Read</button></div>
            <div className="scc-messages">{(threadLoading || (selectedId && threadConversationId !== selectedId && !threadError)) && <div className="scc-empty">Loading latest 20 messages…</div>}{threadError && <div className="scc-searchalert" role="alert">{threadError}</div>}{!threadLoading && !threadError && threadConversationId === selectedId && shownMessages.length === 0 && <div className="scc-empty">No support messages yet.</div>}{threadHasMore && <button className="scc-retry" type="button" disabled={olderLoading || !threadCursor} onClick={loadOlderMessages}>{olderLoading?'Loading…':'Load 20 older messages'}</button>}{shownMessages.map((msg)=><div key={msg.id} className={`scc-bubblewrap ${msg.side==='support'?'support':''}`}>{msg.side==='support' && <span className="scc-agent"><Brand compact /><span>Support ID {msg.agent}</span></span>}<div className={`scc-bubble ${msg.side==='support'?'scc-supportbubble':''}`}>{msg.text}</div><span className="scc-time">{msg.time}</span></div>)}</div>
            <form className="scc-compose" onSubmit={handleReply}><input placeholder="Write a support reply…" aria-label="Write support message" maxLength={2000} value={replyDraft} onChange={(event)=>setReplyDraft(event.target.value)} disabled={writeBusy || threadLoading} /><button className="scc-btn gold" type="submit" disabled={writeBusy || threadLoading || !replyDraft.trim()}><Icon name="send"/> {writeBusy?'Sending…':'Send'}</button></form>
          </> : <div className="scc-empty">Choose a conversation to view its messages.</div>}
        </section>
        <aside className="scc-details" aria-label="Conversation Details"><h3>Conversation Details</h3>
          {active ? <>
            <section className="scc-panel"><h4><Icon name="user"/> Assigned Staff</h4><div className="scc-priority">{['Manual','Auto'].map(v=><button key={v} type="button" disabled className={active.assignedMode === v.toLowerCase()?'active':''}>{v}</button>)}</div><div className="scc-inline" style={{marginTop:9}}><select aria-label="Assigned agent" value={active.assigned} disabled><option value="">Unassigned</option>{active.assigned && <option value={active.assigned}>Agent ID {active.assigned}</option>}</select></div><small>Staff transfer will be enabled after the verified staff directory is connected.</small></section>
            <section className="scc-panel"><h4><Icon name="user"/> Country</h4><select aria-label="Country" value={active.country} disabled={writeBusy} onChange={e=>updateChat(active.id,'country',Object.keys(COUNTRY_CODES).find(code=>COUNTRY_CODES[code][0]===e.target.value)||'')}>{active.country === 'Unknown' && <option value="Unknown">🌐 Unknown</option>}{COUNTRIES.map(([name,flag])=><option key={name} value={name}>{flag} {name}</option>)}</select><small>Country correction is saved to the support conversation.</small></section>
            <section className="scc-panel"><h4><Icon name="folder"/> Folders</h4><div className="scc-tags" style={{marginBottom:8}}>{active.folders.map(f=><span key={f} className="scc-tag gold">{f}</span>)}</div><button className="scc-btn" type="button" disabled={writeBusy} onClick={()=>{setMenu({id:active.id,x:Math.max(12,window.innerWidth-245),y:Math.max(12,window.innerHeight-340)});openFolderOptions()}}>Add to folder</button></section>
            <section className="scc-panel"><h4><Icon name="shield"/> Priority</h4><div className="scc-priority">{['Normal','High','Urgent'].map(p=><button key={p} type="button" disabled={writeBusy} className={active.priority===p?'active':''} onClick={()=>updateChat(active.id,'priority',p.toLowerCase())}>{p}</button>)}</div></section>
            <section className="scc-panel"><h4><Icon name="check"/> Internal Notes</h4><textarea aria-label="Internal notes (read-only)" value={active.note} readOnly placeholder="Private notes will load when details API is connected"/><small>Internal notes are read-only until the details endpoint is connected.</small></section>
            <section className="scc-panel"><h4><Icon name="clock"/> Activity</h4><small>Last message: {shortTime(active.updatedAt)}<br/>Assigned to Agent ID {active.assigned||'—'}.</small></section>
          </> : <div className="scc-empty">No chat selected.</div>}
        </aside>
      </div>
      {menu && <div className="scc-menu" style={{left:menu.x,top:menu.y}} role="menu" onClick={e=>e.stopPropagation()}>
        {folderMenu ? <><button type="button" onClick={()=>setFolderMenu(false)}>← Back</button>{folderLoading && <div className="scc-empty">Loading folders…</div>}{!folderLoading && folders.map(f=><button key={f.id} type="button" disabled={writeBusy} onClick={()=>addFolder(f.id)}>{f.name}</button>)}<input style={{width:'100%',padding:8,fontSize:12}} placeholder="New folder name" maxLength={60} value={newFolder} onChange={e=>setNewFolder(e.target.value)}/><button type="button" disabled={writeBusy || !newFolder.trim()} onClick={createFolder}>+ Create folder</button></> : <><button type="button" disabled={writeBusy} onClick={()=>menuAction('read')}>✓ Mark as read</button><button type="button" disabled={writeBusy} onClick={()=>menuAction('archive')}>▣ Archive chat</button><button type="button" disabled={writeBusy} onClick={openFolderOptions}>▱ Add to folder ›</button><button className="danger" type="button" onClick={()=>menuAction('delete')}>Delete · Passkey required</button></>}
      </div>}
      {startPerson && <div className="scc-dialogback" onMouseDown={()=>!writeBusy && setStartPerson(null)}><section role="dialog" aria-modal="true" aria-labelledby="scc-start-title" className="scc-dialog" onMouseDown={e=>e.stopPropagation()}><h3 id="scc-start-title">Start Support Chat</h3><p className="scc-startrecipient">To: {startPerson.name || startPerson.username || startPerson.id}</p><form className="scc-startform" onSubmit={handleStartChat}><textarea autoFocus maxLength={2000} aria-label="First message to reader" value={startDraft} onChange={e=>setStartDraft(e.target.value)} placeholder="Write the first support message…" disabled={writeBusy}/><div className="scc-startactions"><button className="scc-btn" type="button" onClick={()=>setStartPerson(null)} disabled={writeBusy}>Cancel</button><button className="scc-btn gold" type="submit" disabled={writeBusy || !startDraft.trim()}>{writeBusy?'Sending…':'Start & Send'}</button></div></form></section></div>}
      {notice && <div className="scc-dialogback" onMouseDown={()=>setNotice('')}><section role="alertdialog" aria-modal="true" className="scc-dialog" onMouseDown={e=>e.stopPropagation()}><h3>Admin Chat Center</h3><p>{notice}</p><button className="scc-btn gold" type="button" onClick={()=>setNotice('')}>OK</button></section></div>}
      {dialog && <div className="scc-dialogback" onMouseDown={()=>setDialog(false)}><section role="alertdialog" aria-modal="true" className="scc-dialog" onMouseDown={e=>e.stopPropagation()}><h3>Delete Conversation</h3><p>Deletion requires a server-verified Admin Passkey and audit log. Delete is not connected yet; no chat will be deleted.</p><button className="scc-btn gold" type="button" onClick={()=>setDialog(false)}>Close</button></section></div>}
    </main>
  </AdminLayout>
}
