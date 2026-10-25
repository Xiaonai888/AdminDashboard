import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const INITIAL_CHATS = [
  {
    id: 'demo-1048', name: 'Reader #1048', country: 'Cambodia', flag: '🇰🇭', assigned: 'A12', priority: 'High', unread: 1,
    updatedAt: '2026-10-25T09:14:00+07:00', preview: 'Thank you so much for your help!', folders: ['VIP', 'Payment Issue'],
    note: 'Customer asked about a payment. Verification still pending.',
    messages: [
      { id: 'a1', side: 'reader', text: 'Hi, I made a payment for 500 Coins but it is not showing in my account. Could you help?', time: '09:02 AM' },
      { id: 'a2', side: 'support', agent: 'S-03', text: 'Hello! Thank you for reaching out. We will check the payment status for you.', time: '09:07 AM' },
      { id: 'a3', side: 'reader', text: 'Thank you so much for your help!', time: '09:14 AM' },
    ],
  },
  {
    id: 'demo-2211', name: 'Author #2211', country: 'Thailand', flag: '🇹🇭', assigned: 'A07', priority: 'Normal', unread: 2,
    updatedAt: '2026-10-25T08:55:00+07:00', preview: 'Could you check my latest chapter?', folders: ['Follow Up'], note: '',
    messages: [{ id: 'b1', side: 'reader', text: 'Could you check my latest chapter?', time: '08:55 AM' }],
  },
  {
    id: 'demo-9087', name: 'Reader #9087', country: 'Philippines', flag: '🇵🇭', assigned: 'A03', priority: 'Urgent', unread: 1,
    updatedAt: '2026-10-25T08:31:00+07:00', preview: 'I cannot log in to my account.', folders: ['Account Issue'], note: '',
    messages: [{ id: 'c1', side: 'reader', text: 'I cannot log in to my account.', time: '08:31 AM' }],
  },
  {
    id: 'demo-3322', name: 'Reader #3322', country: 'Indonesia', flag: '🇮🇩', assigned: 'A12', priority: 'Normal', unread: 0,
    updatedAt: '2026-10-24T15:30:00+07:00', preview: 'When will the next chapter be released?', folders: ['General'], note: '',
    messages: [{ id: 'd1', side: 'reader', text: 'When will the next chapter be released?', time: '03:30 PM' }],
  },
  {
    id: 'demo-7765', name: 'Author #7765', country: 'Malaysia', flag: '🇲🇾', assigned: 'A09', priority: 'High', unread: 0,
    updatedAt: '2026-10-23T10:20:00+07:00', preview: 'My story was removed. Please review.', folders: ['Abuse Report'], note: '',
    messages: [{ id: 'e1', side: 'reader', text: 'My story was removed. Please review.', time: '10:20 AM' }],
  },
]

const RECENT_CHAT_LIMIT = 10
const SHADOW_ADMIN_LOGO = '/assets/Icons/Logo%20Shadow.jpg'
const STAFF = ['A03', 'A07', 'A09', 'A12']
const COUNTRIES = [
  ['Cambodia', '🇰🇭'], ['Thailand', '🇹🇭'], ['Philippines', '🇵🇭'], ['Indonesia', '🇮🇩'],
  ['Malaysia', '🇲🇾'], ['Vietnam', '🇻🇳'], ['Singapore', '🇸🇬'], ['United States', '🇺🇸'], ['Other', '🌐'],
]
const DEFAULT_FOLDERS = ['VIP', 'Payment Issue', 'Follow Up', 'Account Issue', 'Abuse Report', 'General']
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
  @media(max-width:1250px) { .scc-grid { grid-template-columns:155px minmax(225px,285px) minmax(280px,1fr); } .scc-details { display:none; } }
  @media(max-width:800px) { .scc-grid { display:flex; flex-direction:column; min-height:0; height:auto; max-height:none; } .scc-nav { flex-direction:row; gap:5px; overflow:auto; padding:8px; } .scc-logo,.scc-navfoot { display:none; } .scc-navbtn { width:auto; white-space:nowrap; } .scc-list { max-height:430px; min-height:350px; border-right:0; border-bottom:1px solid var(--scc-line); } .scc-chat { min-height:520px; } .scc-details { display:block; } }
`

export default function AdminChatCenterPage() {
  const navigate = useNavigate()
  const [chats, setChats] = useState(INITIAL_CHATS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('demo-1048')
  const [menu, setMenu] = useState(null)
  const [folderMenu, setFolderMenu] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('Manual')
  const [newFolder, setNewFolder] = useState('')
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState(false)
  const [folders, setFolders] = useState(DEFAULT_FOLDERS)
  const active = chats.find((c) => c.id === selectedId && !c.archived) || null
  const inbox = chats.filter((c) => !c.archived)
  const unreadTotal = inbox.reduce((sum, c) => sum + (c.unread > 0 ? 1 : 0), 0)
  const filtered = useMemo(() => inbox.filter((c) => {
    const matches = matchesChatSearch(c, search)
    return matches && (filter === 'All' || (filter === 'Unread' && c.unread > 0) || (filter === 'Seen' && c.unread === 0) || (filter === 'Assigned' && Boolean(c.assigned)))
  }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, RECENT_CHAT_LIMIT), [inbox, filter, search])
  const changeChat = (id, action) => setChats((list) => list.map((chat) => chat.id === id ? action(chat) : chat))
  const openMenu = (event, id) => {
    event.preventDefault()
    event.stopPropagation()
    const x = Math.min(event.clientX, window.innerWidth - 210)
    const y = Math.min(event.clientY, window.innerHeight - 270)
    setFolderMenu(false)
    setMenu({ id, x: Math.max(10, x), y: Math.max(10, y) })
  }
  const menuAction = (action) => {
    if (!menu) return
    const id = menu.id
    setMenu(null)
    if (action === 'read') changeChat(id, (chat) => ({ ...chat, unread: 0 }))
    if (action === 'archive') changeChat(id, (chat) => ({ ...chat, archived: true }))
    if (action === 'delete') setDialog(true)
  }
  const addFolder = (value, id = menu?.id || selectedId) => {
    if (!id || !value) return
    changeChat(id, (chat) => ({ ...chat, folders: [...new Set([...(chat.folders || []), value])] }))
    setFolderMenu(false)
    setMenu(null)
  }
  const createFolder = () => {
    const value = newFolder.trim().slice(0, 40)
    if (!value) return
    setFolders((arr) => [...new Set([...arr, value])])
    addFolder(value)
    setNewFolder('')
  }
  const sendDemo = (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || !active) return
    changeChat(active.id, (chat) => ({ ...chat, preview: text, updatedAt: new Date().toISOString(), unread: 0, messages: [...chat.messages, { id: `demo-${Date.now()}`, side: 'support', agent: chat.assigned ? `S-${chat.assigned.slice(-2)}` : 'S-00', text, time: new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}) }] }))
    setMessage('')
  }
  return <AdminLayout title="Chat Center" subtitle="Shadow Admin · Reader & Author conversations">
    <style>{styles}</style>
    <main className="scc" onClick={() => menu && setMenu(null)}>
      <div className="scc-demo">UI preview only — these are sample chats. Nothing is being sent, archived or deleted in the real Shadow database.</div>
      <div className="scc-grid">
        <nav className="scc-nav" aria-label="Chat navigation">
          <div className="scc-logo"><Brand /></div>
          <button className="scc-navbtn active" type="button"><Icon name="inbox" /> All Inbox <span className="scc-count">{inbox.length}</span></button>
          <button className="scc-navbtn" type="button" onClick={() => navigate('/admin-chat/archived')}><Icon name="archive" /> Archived Chats</button>
          <button className="scc-navbtn" type="button" disabled title="Folders own page will be created later"><Icon name="folder" /> Folders</button>
          <div className="scc-navfoot"><Icon name="shield" size={14} /> Deleting chats will require server-side passkey verification once the backend is connected.</div>
        </nav>
        <section className="scc-list" aria-label="Inbox conversation list">
          <header className="scc-listhead"><h2>All Inbox</h2><div className="scc-sub">Latest {RECENT_CHAT_LIMIT} chats · {inbox.length} demo conversations</div>
            <label className="scc-search"><Icon name="search" size={16}/><input aria-label="Search conversations" placeholder="Name, @username, account link, ID..." value={search} onChange={(e) => setSearch(e.target.value)} /></label>
            <div className="scc-searchhelp">Searches loaded chats only. Full account search requires the Admin Backend.</div>
            <div className="scc-tabs">{['All','Unread','Seen','Assigned'].map((x) => <button type="button" key={x} onClick={() => setFilter(x)} className={`scc-tab ${filter===x?'active':''}`}>{x}{x==='Unread'?` ${unreadTotal}`:''}</button>)}</div>
          </header>
          <div className="scc-rows">
            {filtered.length === 0 && <div className="scc-empty">No conversations match your filters.</div>}
            {filtered.map((chat) => <div key={chat.id} className={`scc-item ${active?.id === chat.id?'active':''}`} role="button" tabIndex={0} onClick={() => setSelectedId(chat.id)} onKeyDown={(e) => { if(e.key==='Enter')setSelectedId(chat.id) }} onContextMenu={(e) => openMenu(e,chat.id)}>
              <span className="scc-avatar">{chat.name.includes('Author')?'AU':'RD'}</span>
              <span className="scc-itembody"><span className="scc-itemtitle"><strong>{chat.name}</strong><time>{shortTime(chat.updatedAt)}</time></span>
                <span className="scc-preview">{chat.flag} {chat.country} · {chat.preview}</span>
                <span className="scc-tags">{chat.folders.slice(0,2).map((f)=><span className={`scc-tag ${f==='VIP'?'gold':''}`} key={f}>{f}</span>)}{chat.unread>0 && <span className="scc-unread">{chat.unread}</span>}<span className="scc-tag">Agent {chat.assigned || 'Unassigned'}</span></span>
              </span>
              <button type="button" className="scc-more" aria-label={`Actions for ${chat.name}`} onClick={(e)=>{e.stopPropagation(); openMenu(e,chat.id)}}><Icon name="dots" /></button>
            </div>)}
          </div>
        </section>
        <section className="scc-chat" aria-label="Conversation thread">
          {active ? <>
            <header className="scc-chathead"><div className="scc-person"><span className="scc-avatar">{active.name.includes('Author')?'AU':'RD'}</span><div><b>{active.name}</b><small>{active.flag} {active.country} · ID {active.id.replace('demo-','')}</small></div></div><span className="scc-status">{active.unread>0?'Unseen':'Seen'}</span></header>
            <div className="scc-tools"><button className="scc-btn" type="button" onClick={()=>{setNotice('Demo: Transfer is not connected to staff permissions yet.')}}><Icon name="transfer"/> Transfer</button><button className="scc-btn" type="button" onClick={()=>{setMode('Auto');setNotice('Auto Assign preview enabled. Backend assignment will be connected later.')}}><Icon name="user"/> Auto Assign</button><button className="scc-btn" type="button" onClick={()=>changeChat(active.id,c=>({...c,unread:0}))}><Icon name="check"/> Mark as Read</button></div>
            <div className="scc-messages">{(active.messages||[]).map((msg)=><div key={msg.id} className={`scc-bubblewrap ${msg.side==='support'?'support':''}`}>{msg.side==='support' && <span className="scc-agent"><Brand compact /><span>Support ID {msg.agent}</span></span>}<div className={`scc-bubble ${msg.side==='support'?'scc-supportbubble':''}`}>{msg.text}</div><span className="scc-time">{msg.time}</span></div>)}</div>
            <form className="scc-compose" onSubmit={sendDemo}><input placeholder="Type a demo reply..." aria-label="Demo reply" value={message} onChange={(e)=>setMessage(e.target.value)} /><button className="scc-btn gold" type="submit" disabled={!message.trim()}><Icon name="send"/> Send</button></form>
          </> : <div className="scc-empty">Choose a conversation to view its messages.</div>}
        </section>
        <aside className="scc-details" aria-label="Conversation Details"><h3>Conversation Details</h3>
          {active ? <>
            <section className="scc-panel"><h4><Icon name="user"/> Assigned Staff</h4><div className="scc-priority">{['Manual','Auto'].map(v=><button key={v} type="button" className={mode===v?'active':''} onClick={()=>setMode(v)}>{v}</button>)}</div><div className="scc-inline" style={{marginTop:9}}><select aria-label="Assigned agent" value={active.assigned} onChange={e=>changeChat(active.id,c=>({...c,assigned:e.target.value}))}><option value="">Unassigned</option>{STAFF.map(s=><option key={s} value={s}>Agent ID {s}</option>)}</select></div><small>Changes here are only demo state.</small></section>
            <section className="scc-panel"><h4><Icon name="user"/> Country</h4><select aria-label="Country" value={active.country} onChange={e=>changeChat(active.id,c=>({...c,country:e.target.value,flag:COUNTRIES.find(v=>v[0]===e.target.value)?.[1]||'🌐'}))}>{COUNTRIES.map(([name,flag])=><option key={name} value={name}>{flag} {name}</option>)}</select><small>Auto-detected initially; Admin can correct it.</small></section>
            <section className="scc-panel"><h4><Icon name="folder"/> Folders</h4><div className="scc-tags" style={{marginBottom:8}}>{active.folders.map(f=><span key={f} className="scc-tag gold">{f}</span>)}</div><select aria-label="Add conversation to folder" value="" onChange={e=>addFolder(e.target.value,active.id)}><option value="">Add to folder...</option>{folders.map(f=><option key={f} value={f}>{f}</option>)}</select></section>
            <section className="scc-panel"><h4><Icon name="shield"/> Priority</h4><div className="scc-priority">{['Normal','High','Urgent'].map(p=><button key={p} type="button" className={active.priority===p?'active':''} onClick={()=>changeChat(active.id,c=>({...c,priority:p}))}>{p}</button>)}</div></section>
            <section className="scc-panel"><h4><Icon name="check"/> Internal Notes</h4><textarea aria-label="Internal notes" value={active.note} onChange={e=>changeChat(active.id,c=>({...c,note:e.target.value}))}/><small>Visible only in this Admin demo.</small></section>
            <section className="scc-panel"><h4><Icon name="clock"/> Activity</h4><small>Last message: {shortTime(active.updatedAt)}<br/>Assigned to Agent ID {active.assigned||'—'}.</small></section>
          </> : <div className="scc-empty">No chat selected.</div>}
        </aside>
      </div>
      {menu && <div className="scc-menu" style={{left:menu.x,top:menu.y}} role="menu" onClick={e=>e.stopPropagation()}>
        {folderMenu ? <><button type="button" onClick={()=>setFolderMenu(false)}>← Back</button>{folders.map(f=><button key={f} type="button" onClick={()=>addFolder(f)}>{f}</button>)}<input style={{width:'100%',padding:8,fontSize:12}} placeholder="New folder name" value={newFolder} onChange={e=>setNewFolder(e.target.value)}/><button type="button" onClick={createFolder}>+ Create folder</button></> : <><button type="button" onClick={()=>menuAction('read')}>✓ Mark as read</button><button type="button" onClick={()=>menuAction('archive')}>▣ Archive chat (demo)</button><button type="button" onClick={()=>setFolderMenu(true)}>▱ Add to folder ›</button><button className="danger" type="button" onClick={()=>menuAction('delete')}>Delete · Passkey required</button></>}
      </div>}
      {notice && <div className="scc-dialogback" onMouseDown={()=>setNotice('')}><section role="alertdialog" aria-modal="true" className="scc-dialog" onMouseDown={e=>e.stopPropagation()}><h3>Chat Center Preview</h3><p>{notice}</p><button className="scc-btn gold" type="button" onClick={()=>setNotice('')}>OK</button></section></div>}
      {dialog && <div className="scc-dialogback" onMouseDown={()=>setDialog(false)}><section role="alertdialog" aria-modal="true" className="scc-dialog" onMouseDown={e=>e.stopPropagation()}><h3>Delete Conversation</h3><p>Passkey verification must run on Shadow Backend. This preview does not collect passkeys or delete any real chat messages.</p><button className="scc-btn gold" type="button" onClick={()=>setDialog(false)}>Close</button></section></div>}
    </main>
  </AdminLayout>
}
