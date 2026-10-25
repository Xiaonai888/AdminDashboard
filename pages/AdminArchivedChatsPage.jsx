import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const PREVIEW = [
  {
    id: 'demo-1048', name: 'Demo Reader #1048', country: 'Cambodia', flag: '🇰🇭',
    folder: 'VIP', tag: 'Payment Issue', archivedAt: '2026-10-19T10:36:00+07:00',
    archivedBy: 'A12', preview: 'Thank you so much for your help!', initials: 'DR',
    note: 'The payment question was resolved before the chat was archived.',
    messages: [
      { id: 'm1', side: 'reader', text: 'Hi, my purchased Diamonds have not appeared yet. Can you help?', time: '10:24 AM' },
      { id: 'm2', side: 'support', text: 'Hello! Thank you for contacting Shadow Support. We will review your payment.', time: '10:28 AM', agent: 'S-07' },
      { id: 'm3', side: 'reader', text: 'It has arrived now. Thank you so much!', time: '10:31 AM' },
      { id: 'm4', side: 'support', text: 'Glad it is resolved. Have a wonderful day!', time: '10:32 AM', agent: 'S-07' },
    ],
  },
  {
    id: 'demo-2211', name: 'Demo Author #2211', country: 'Thailand', flag: '🇹🇭',
    folder: 'Follow Up', tag: 'Book Issue', archivedAt: '2026-10-18T14:10:00+07:00',
    archivedBy: 'A07', preview: 'Could you check my latest submission?', initials: 'DA',
    note: 'Follow up on the author submission when requested.',
    messages: [{ id: 'm1', side: 'reader', text: 'Could you check my latest submission?', time: '02:02 PM' }],
  },
  {
    id: 'demo-9087', name: 'Demo Reader #9087', country: 'Philippines', flag: '🇵🇭',
    folder: 'General', tag: 'Account Issue', archivedAt: '2026-10-17T08:52:00+07:00',
    archivedBy: 'A03', preview: 'I cannot sign in to my account.', initials: 'DR',
    note: '', messages: [{ id: 'm1', side: 'reader', text: 'I cannot sign in to my account.', time: '08:45 AM' }],
  },
  {
    id: 'demo-5531', name: 'Demo Reader #5531', country: 'Vietnam', flag: '🇻🇳',
    folder: 'Payment Issue', tag: 'VIP', archivedAt: '2026-10-15T12:45:00+07:00',
    archivedBy: 'A12', preview: 'The payment is confirmed now.', initials: 'DR',
    note: 'Issue resolved.', messages: [{ id: 'm1', side: 'reader', text: 'The payment is confirmed now.', time: '12:33 PM' }],
  },
  {
    id: 'demo-7765', name: 'Demo Author #7765', country: 'Malaysia', flag: '🇲🇾',
    folder: 'Abuse Report', tag: 'Content', archivedAt: '2026-10-12T09:30:00+07:00',
    archivedBy: 'A09', preview: 'Please review the content decision.', initials: 'DA',
    note: '', messages: [{ id: 'm1', side: 'reader', text: 'Please review the content decision.', time: '09:20 AM' }],
  },
  {
    id: 'demo-6678', name: 'Demo Reader #6678', country: 'United States', flag: '🇺🇸',
    folder: 'Follow Up', tag: 'Report', archivedAt: '2026-10-10T17:20:00+07:00',
    archivedBy: 'A08', preview: 'I have a question about a report.', initials: 'DR',
    note: '', messages: [{ id: 'm1', side: 'reader', text: 'I have a question about a report.', time: '05:10 PM' }],
  },
]

const paths = {
  archive: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
  inbox: 'M4 4h16v16H4z M4 14h4l2 3h4l2-3h4',
  folder: 'M3 6h7l2 3h9v11H3z',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z M16 16l5 5',
  restore: 'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5 M12 7v5l4 2',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14 M10 11v7 M14 11v7',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l4 2',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  chevron: 'M9 6l6 6-6 6',
  file: 'M6 3h9l4 4v14H6z M15 3v5h4',
  calendar: 'M4 6h16v15H4z M8 3v6 M16 3v6 M4 11h16',
  shield: 'M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z',
}

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.archive} />
    </svg>
  )
}

function formatDate(value, withTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) })
}

const css = `
  .sac { --gold: #ad7b16; --light: #fff8e9; --line: #e8ebf1; --ink: #202633; --soft: #758196; color: var(--ink); font-family: inherit; }
  .sac button, .sac input, .sac select { font: inherit; }
  .sac-shell { display: grid; grid-template-columns: 155px minmax(235px, 300px) minmax(310px, 1fr) minmax(225px, 265px); min-height: 680px; height: calc(100vh - 166px); max-height: 1000px; background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; box-shadow: 0 14px 45px rgba(22,32,48,.05); }
  .sac-nav { border-right: 1px solid var(--line); padding: 18px 10px; background: #fdfdfd; display: flex; flex-direction: column; gap: 9px; }
  .sac-brand { padding: 6px 10px 30px; font-weight: 900; font-size: 16px; line-height: 1.3; }
  .sac-brand small { display:block; color:var(--soft); font-size:10px; font-weight:650; }
  .sac-navbtn { border: 0; width:100%; min-height:42px; padding: 0 10px; display:flex; gap:9px; align-items:center; text-align:left; border-radius:11px; background:transparent; color: #354052; font-size:12px !important; font-weight:800 !important; cursor:pointer; }
  .sac-navbtn.active { background: #fff1d4; color: #8f600c; box-shadow: inset 3px 0 #b9831c; }
  .sac-navbtn:disabled { cursor:not-allowed; opacity:.48; }
  .sac-count { margin-left:auto; font-size:10px; border-radius:30px; background:#ffe8b1; padding: 3px 7px; color:#956307; }
  .sac-retention { margin-top:auto; border:1px solid #fae8c5; border-radius:12px; background:#fffaf0; padding:12px 10px; font-size:10px; line-height:1.6; color:#7b633b; }
  .sac-retention strong { display:block; color:#9b6a0f; margin-bottom:5px; font-size:11px; }
  .sac-list { border-right:1px solid var(--line); min-width:0; display:flex; flex-direction:column; }
  .sac-listtop { padding:18px 12px 11px; border-bottom:1px solid var(--line); }
  .sac h2 { margin:0; font-size:22px; line-height:1.2; letter-spacing:-.03em; }
  .sac-sub { margin-top:5px; color:var(--soft); font-size:11px; }
  .sac-search { margin-top:14px; height:38px; display:flex; align-items:center; gap:8px; border:1px solid #dfe4eb; border-radius:10px; padding:0 11px; color:#9aa3b2; }
  .sac-search input { width:100%; min-width:0; border:none; outline:none; font-size:12px; color:#222; background:transparent; }
  .sac-filters { margin-top:10px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .sac-filter { height:30px; padding:0 8px; border:1px solid var(--line); border-radius:8px; background:#f8fafc; font-size:10px !important; font-weight:750 !important; color:#5c6575; }
  .sac-filter.on { background:var(--gold); color:#fff; border-color:var(--gold); }
  .sac-items { overflow:auto; flex:1; }
  .sac-item { width:100%; border:0; border-bottom:1px solid #f0f1f5; background:#fff; cursor:pointer; padding:13px 12px; display:flex; align-items:flex-start; gap:10px; text-align:left; color:inherit; }
  .sac-item.active { background:var(--light); }
  .sac-item:hover { background:#fffaf0; }
  .sac-avatar { display:grid; place-items:center; width:37px; height:37px; flex:0 0 37px; border-radius:50%; color:#8a650e; background:#f7e7c4; font-size:11px; font-weight:950; }
  .sac-itemmain { min-width:0; flex:1; }
  .sac-itemhead { display:flex; flex-wrap:wrap; justify-content:space-between; gap:5px; align-items:baseline; }
  .sac-itemhead b { font-size:11px; }
  .sac-itemhead time { font-size:9px; color:#8693a6; }
  .sac-country { font-size:10px; color:#718096; padding:5px 0; }
  .sac-preview { font-size:11px; color:#7f8796; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sac-tags { display:flex; gap:5px; flex-wrap:wrap; margin-top:7px; }
  .sac-pill { padding:5px 8px; border-radius:20px; background:#edf2fb; color:#596781; font-size:9px; font-weight:850; }
  .sac-pill.gold { background:#f5dfad; color:#815707; }
  .sac-empty { padding:28px 16px; color:#8490a0; text-align:center; font-size:12px; }
  .sac-thread { display:flex; flex-direction:column; min-width:0; background:linear-gradient(#fff,#fbfcff); }
  .sac-threadtop { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid var(--line); }
  .sac-person { display:flex; align-items:center; gap:10px; min-width:0; }
  .sac-person b { display:block; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sac-person small { color:#8290a0; font-size:10px; }
  .sac-actions { display:flex; align-items:center; flex-wrap:wrap; gap:6px; padding:11px 14px; border-bottom:1px solid var(--line); }
  .sac-btn { padding:8px 10px; display:inline-flex; align-items:center; gap:6px; justify-content:center; border:1px solid #e0e4ed; border-radius:9px; background:#fff; color:#526072; font-size:11px !important; font-weight:800 !important; cursor:pointer; }
  .sac-btn.gold { background:#fff4db; color:#a26c08; border-color:#efd39b; }
  .sac-btn.danger { color:#dc3545; background:#fff3f3; border-color:#ffdddd; }
  .sac-btn.primary { background:var(--gold); color:#fff; border-color:var(--gold); }
  .sac-btn:disabled { cursor:not-allowed; opacity:.5; }
  .sac-chatbody { overflow:auto; padding:16px; flex:1; }
  .sac-banner { border:1px solid #fae7bd; border-radius:12px; background:#fff8e8; color:#7a5714; padding:12px; font-size:11px; line-height:1.6; }
  .sac-date { text-align:center; color:#95a2b2; font-size:10px; padding:19px 0 15px; }
  .sac-bubblewrap { display:flex; flex-direction:column; align-items:flex-start; margin-bottom:16px; }
  .sac-bubblewrap.support { align-items:flex-end; }
  .sac-agent { font-size:10px; font-weight:850; margin-bottom:5px; }
  .sac-bubble { max-width:82%; padding:11px 13px; border:1px solid #e8ecf2; border-radius:13px; background:#fff; color:#354052; font-size:12px; line-height:1.6; white-space:pre-wrap; overflow-wrap:anywhere; }
  .sac-supportbubble { background:#fff3d9; border-color:#fff0c6; }
  .sac-time { margin-top:5px; font-size:10px; color:#95a2b2; }
  .sac-readonly { border-top:1px solid var(--line); padding:15px; display:flex; gap:10px; align-items:center; justify-content:space-between; background:#f8fafc; font-size:11px; color:#6a7688; }
  .sac-detail { overflow-y:auto; padding:18px 14px; }
  .sac-detail h3 { margin:0 0 15px; font-size:15px; }
  .sac-detailbox { border:1px solid var(--line); border-radius:12px; padding:12px; margin-bottom:11px; }
  .sac-detailbox h4 { margin:0 0 12px; color:#6f5120; font-size:12px; }
  .sac-status { display:inline-flex; align-items:center; gap:7px; padding:6px 10px; border-radius:25px; background:#fff0cd; color:#9b6a0f; font-size:11px; font-weight:900; }
  .sac-detailsub { display:block; color:#8b97a5; font-size:10px; margin-top:8px; line-height:1.6; }
  .sac-row { display:flex; align-items:center; justify-content:space-between; gap:9px; padding:11px 0; border-bottom:1px solid #f0f2f5; font-size:11px; }
  .sac-row strong { font-size:10px; color:#7b8798; }
  .sac-row span { text-align:right; font-weight:750; }
  .sac-note { font-size:11px; line-height:1.65; color:#6a7687; }
  .sac-activity { font-size:11px; line-height:2; color:#657487; }
  .sac-modalback { position:fixed; inset:0; z-index:3000; background:rgba(15,23,42,.45); display:grid; place-items:center; padding:15px; }
  .sac-modal { width:min(420px,100%); background:#fff; border-radius:18px; box-shadow:0 30px 80px rgba(0,0,0,.2); padding:24px; }
  .sac-modal h3 { margin:0 0 12px; }
  .sac-modal p { color:#66758a; line-height:1.6; font-size:12px; }
  @media(max-width:1250px) { .sac-shell { grid-template-columns:135px minmax(210px, 270px) minmax(260px,1fr); } .sac-detail { display:none; } }
  @media(max-width:1020px) { .sac-shell { grid-template-columns:115px minmax(205px, 40%) minmax(230px,1fr); } .sac-brand { padding-left:4px; } .sac-navbtn { font-size:10px !important; padding:0 5px; } }
  @media(max-width:730px) { .sac-shell { display:flex; flex-direction:column; height:auto; max-height:none; } .sac-nav { flex-direction:row; overflow:auto; padding:8px; } .sac-brand,.sac-retention { display:none; } .sac-navbtn { width:auto; white-space:nowrap; } .sac-list { min-height:330px; max-height:430px; border-right:none; border-bottom:1px solid var(--line); } .sac-thread { min-height:520px; } .sac-detail { display:block; } }
`

export default function AdminArchivedChatsPage({ conversations, onRestoreChat, onMoveToFolder, onDeleteChat }) {
  const previewMode = !Array.isArray(conversations)
  const records = previewMode ? PREVIEW : conversations.filter((chat) => chat && chat.archived === true)
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('')
  const [country, setCountry] = useState('')
  const [sort, setSort] = useState('newest')
  const [selectedId, setSelectedId] = useState('')
  const [dialog, setDialog] = useState('')
  const folderOptions = useMemo(() => [...new Set(records.map((r) => r.folder).filter(Boolean))].sort(), [records])
  const countryOptions = useMemo(() => [...new Set(records.map((r) => r.country).filter(Boolean))].sort(), [records])
  const filtered = useMemo(() => records.filter((r) => {
    const search = `${r.name || ''} ${r.id || ''} ${r.country || ''} ${r.folder || ''} ${r.tag || ''} ${r.preview || ''}`.toLowerCase()
    return (!query || search.includes(query.toLowerCase())) && (!folder || r.folder === folder) && (!country || r.country === country)
  }).sort((a, b) => (sort === 'oldest' ? 1 : -1) * (new Date(a.archivedAt).getTime() - new Date(b.archivedAt).getTime())), [records, query, folder, country, sort])
  const selected = filtered.find((r) => r.id === selectedId) || filtered[0] || null
  const requestAction = (action) => {
    if (!selected) return
    if (previewMode) { setDialog('This is a UI preview with sample conversations. No real chat data has been loaded and no changes have been made.'); return }
    if (action === 'restore' && typeof onRestoreChat === 'function') return onRestoreChat(selected)
    if (action === 'folder' && typeof onMoveToFolder === 'function') return onMoveToFolder(selected)
    if (action === 'delete' && typeof onDeleteChat === 'function') return onDeleteChat(selected)
    setDialog('The Admin Chat backend action is not connected yet. No changes have been made.')
  }

  return (
    <AdminLayout title="Archived Chats" subtitle="Shadow Admin Chat Center">
      <style>{css}</style>
      <main className="sac">
        {previewMode && <div className="sac-banner" style={{ marginBottom: 12 }}>UI Preview — all conversations below are sample data. Live archived chats and passkey-protected actions will be connected in later steps.</div>}
        <div className="sac-shell">
          <nav className="sac-nav" aria-label="Chat Center navigation">
            <div className="sac-brand">Shadow <small>Admin Chat Center</small></div>
            <button type="button" className="sac-navbtn" disabled title="All Inbox page is a later step"><Icon name="inbox" /> All Inbox</button>
            <button type="button" className="sac-navbtn active" aria-current="page"><Icon name="archive" /> Archived <span className="sac-count">{records.length}</span></button>
            <button type="button" className="sac-navbtn" disabled title="Folders own page is a later step"><Icon name="folder" /> Folders</button>
            <div className="sac-retention"><strong><Icon name="clock" size={14} /> Archive Retention</strong>1-year cleanup for conversations without any chat history is planned, but automatic deletion is not enabled in this UI.</div>
          </nav>

          <section className="sac-list" aria-label="Archived conversation list">
            <div className="sac-listtop">
              <h2>Archived Chats</h2>
              <div className="sac-sub">{records.length} archived conversation{records.length === 1 ? '' : 's'}</div>
              <label className="sac-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search archived chats..." aria-label="Search archived chats" /></label>
              <div className="sac-filters">
                <select className="sac-filter" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort archived chats"><option value="newest">Recently Archived</option><option value="oldest">Older First</option></select>
                <select className="sac-filter" value={folder} onChange={(event) => setFolder(event.target.value)} aria-label="Filter by folder"><option value="">All Folders</option>{folderOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                <select className="sac-filter" value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Filter by country"><option value="">All Countries</option>{countryOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
              </div>
            </div>
            <div className="sac-items">
              {filtered.length === 0 && <div className="sac-empty">No archived conversations match your filters.</div>}
              {filtered.map((chat) => (
                <button key={chat.id} type="button" className={`sac-item ${selected?.id === chat.id ? 'active' : ''}`} onClick={() => setSelectedId(chat.id)}>
                  <span className="sac-avatar">{chat.initials || String(chat.name || '?').slice(0, 2).toUpperCase()}</span>
                  <span className="sac-itemmain">
                    <span className="sac-itemhead"><b>{chat.name || chat.id}</b><time>{formatDate(chat.archivedAt)}</time></span>
                    <span className="sac-country">{chat.flag || '🌐'} {chat.country || 'Unknown country'}</span>
                    <span className="sac-preview" style={{ display: 'block' }}>{chat.preview || 'Archived conversation'}</span>
                    <span className="sac-tags">{chat.folder && <span className="sac-pill gold">{chat.folder}</span>}{chat.tag && <span className="sac-pill">{chat.tag}</span>}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="sac-thread" aria-label="Archived conversation details">
            {selected ? <>
              <div className="sac-threadtop"><div className="sac-person"><span className="sac-avatar">{selected.initials || 'U'}</span><div><b>{selected.name || selected.id}</b><small>ID: {selected.id} · {selected.flag || '🌐'} {selected.country || 'Unknown'}</small></div></div><span className="sac-status"><Icon name="archive" size={14} /> Archived</span></div>
              <div className="sac-actions"><button className="sac-btn gold" type="button" onClick={() => requestAction('restore')}><Icon name="restore" size={15} /> Restore Chat</button><button className="sac-btn" type="button" onClick={() => requestAction('folder')}><Icon name="folder" size={15} /> Move to Folder</button><button className="sac-btn danger" type="button" onClick={() => requestAction('delete')}><Icon name="trash" size={15} /> Delete</button></div>
              <div className="sac-chatbody">
                <div className="sac-banner"><strong>This conversation is archived and read-only.</strong><div>Restore this chat before replying. Deletion requires server-side passkey verification.</div></div>
                <div className="sac-date">{formatDate(selected.archivedAt)}</div>
                {(selected.messages || []).map((message) => <div key={message.id} className={`sac-bubblewrap ${message.side === 'support' ? 'support' : ''}`}>
                  {message.side === 'support' && <span className="sac-agent">Support ID {message.agent || '—'}</span>}
                  <div className={`sac-bubble ${message.side === 'support' ? 'sac-supportbubble' : ''}`}>{message.text}</div>
                  <span className="sac-time">{message.time || ''}</span>
                </div>)}
                {(!selected.messages || selected.messages.length === 0) && <div className="sac-empty">No messages to display.</div>}
              </div>
              <div className="sac-readonly"><span><Icon name="lock" size={16} /> Archived chats are read-only.</span><button type="button" className="sac-btn primary" onClick={() => requestAction('restore')}>Restore Chat</button></div>
            </> : <div className="sac-empty">Choose an archived chat to view its history.</div>}
          </section>

          <aside className="sac-detail" aria-label="Archived chat metadata">
            <h3>Archived Details</h3>
            {selected ? <>
              <div className="sac-detailbox"><h4><Icon name="archive" size={15} /> Archived Status</h4><span className="sac-status">Archived</span><span className="sac-detailsub">This conversation is read-only until restored.</span></div>
              <div className="sac-row"><strong>Archived By</strong><span>Agent ID {selected.archivedBy || '—'}</span></div>
              <div className="sac-row"><strong>Archived On</strong><span>{formatDate(selected.archivedAt, true)}</span></div>
              <div className="sac-row"><strong>Original Folder</strong><span>{selected.folder || 'Unassigned'}</span></div>
              <div className="sac-row"><strong>Country</strong><span>{selected.flag || '🌐'} {selected.country || 'Unknown'}</span></div>
              <div className="sac-detailbox" style={{ marginTop: 15 }}><h4><Icon name="clock" size={15} /> Retention</h4><div className="sac-note">The future 1-year cleanup rule is not active yet. Chats containing messages will not be deleted by this preview.</div></div>
              <div className="sac-detailbox"><h4><Icon name="file" size={15} /> Internal Notes</h4><div className="sac-note">{selected.note || 'No internal notes.'}</div></div>
              <div className="sac-detailbox"><h4><Icon name="shield" size={15} /> Activity</h4><div className="sac-activity">Archived by Agent ID {selected.archivedBy || '—'}<br />{formatDate(selected.archivedAt, true)}</div></div>
            </> : <div className="sac-note">No conversation selected.</div>}
          </aside>
        </div>
        {dialog && <div className="sac-modalback" role="presentation" onMouseDown={() => setDialog('')}><div className="sac-modal" role="alertdialog" aria-modal="true" aria-label="Action unavailable" onMouseDown={(event) => event.stopPropagation()}><h3>Admin Chat Center</h3><p>{dialog}</p><button type="button" className="sac-btn primary" onClick={() => setDialog('')}>Close</button></div></div>}
      </main>
    </AdminLayout>
  )
}
