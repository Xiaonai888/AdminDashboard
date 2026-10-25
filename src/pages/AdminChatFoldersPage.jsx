import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
  createAdminSupportFolder,
  deleteAdminSupportFolder,
  getAdminSupportFolderConversations,
  getAdminSupportFolders,
  getAdminSupportMessages,
  renameAdminSupportFolder,
  sendAdminSupportMessage,
} from '../services/adminSupportChatApi'

const styles = `
  .scf { color:#222d3d; --scf-gold:#af7c17; --scf-line:#e8ebf0; }
  .scf * { box-sizing:border-box; }
  .scf-shell { min-height:600px; overflow:hidden; display:grid; grid-template-columns:210px minmax(240px,320px) minmax(320px,1fr); background:white; border:1px solid var(--scf-line); border-radius:16px; }
  .scf-nav { padding:20px 12px; background:#fdfdfd; border-right:1px solid var(--scf-line); }
  .scf-title { font-weight:900; font-size:15px; margin:0 0 18px; }
  .scf-nav button { width:100%; border:0; background:transparent; color:#526073; padding:12px 13px; font-size:12px; font-weight:800; text-align:left; border-radius:10px; cursor:pointer; }
  .scf-nav button.active { color:#845811; background:#fff1d2; }
  .scf-panel { border-right:1px solid var(--scf-line); padding:20px 14px; }
  .scf-head { display:flex; gap:10px; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; }
  .scf-head h2 { margin:0; font-size:19px; }
  .scf-input { min-width:0; border:1px solid #e0e5ec; padding:10px 11px; border-radius:9px; background:#fff; color:#273346; font-size:12px; }
  .scf-form { display:flex; gap:7px; margin-bottom:12px; }
  .scf-form input { flex:1; }
  .scf-btn { border:1px solid #e4e6eb; border-radius:9px; padding:9px 12px; background:white; font-size:12px; font-weight:800; color:#465266; cursor:pointer; }
  .scf-btn.gold { background:var(--scf-gold); border-color:var(--scf-gold); color:white; }
  .scf-btn:disabled { opacity:.5; cursor:not-allowed; }
  .scf-folder { display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; background:white; border:1px solid #edf0f4; border-radius:10px; margin:8px 0; padding:12px 10px; text-align:left; cursor:pointer; font-size:12px; }
  .scf-folder.active { background:#fff9e9; border-color:#e5c77e; }
  .scf-folder strong { overflow-wrap:anywhere; }
  .scf-detail { padding:20px 16px; min-width:0; }
  .scf-row { display:flex; gap:10px; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid #edf0f4; }
  .scf-row b { font-size:12px; }
  .scf-row small { display:block; margin-top:5px; color:#7e8a9c; font-size:11px; overflow-wrap:anywhere; }
  .scf-row > div { min-width:0; }
  .scf-error { margin-bottom:12px; border:1px solid #f4c6cb; background:#fff4f5; border-radius:10px; padding:11px; font-size:12px; color:#b5263c; }
  .scf-muted { color:#8390a1; font-size:12px; line-height:1.6; }
  .scf-pages { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:15px; }
  .scf-dialogback { position:fixed; inset:0; z-index:5000; background:rgba(14,19,30,.55); display:flex; align-items:center; justify-content:center; padding:14px; }
  .scf-dialog { width:min(680px,100%); max-height:92dvh; background:var(--shadow-bg-surface,#fff); color:var(--shadow-text-primary,#222d3d); display:flex; flex-direction:column; border:1px solid var(--shadow-border,#e8ebf0); border-radius:18px; overflow:hidden; box-shadow:0 26px 75px #0003; }
  .scf-dialoghead { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid var(--shadow-border,#e8ebf0); }
  .scf-dialoghead strong { font-size:15px; }
  .scf-thread { min-height:180px; height:min(55dvh,450px); overflow-y:auto; padding:16px; background:var(--shadow-bg-page,#fbfcff); }
  .scf-bubblewrap { margin:10px 0; display:flex; flex-direction:column; align-items:flex-start; }
  .scf-bubblewrap.support { align-items:flex-end; }
  .scf-bubble { white-space:pre-wrap; overflow-wrap:anywhere; max-width:85%; padding:10px 13px; font-size:12px; line-height:1.6; border:1px solid var(--shadow-border,#e8ecf2); background:var(--shadow-bg-surface,#fff); border-radius:12px; }
  .scf-bubblewrap.support .scf-bubble { background:#fff2d5; border-color:#f5dda4; color:#493709; }
  .scf-timestamp { color:var(--shadow-text-secondary,#8590a1); margin-top:4px; font-size:10px; }
  .scf-reply { display:flex; align-items:end; gap:8px; padding:12px; border-top:1px solid var(--shadow-border,#e8ebf0); }
  .scf-reply textarea { flex:1; min-width:0; min-height:54px; max-height:110px; resize:vertical; background:var(--shadow-input-bg,#fff); color:var(--shadow-text-primary,#222d3d); border:1px solid var(--shadow-border,#e8ebf0); border-radius:10px; padding:10px; font:inherit; font-size:12px; }
  .scf-threadtools { text-align:center; margin-bottom:12px; }
  @media(max-width:950px) { .scf-shell { grid-template-columns:150px minmax(220px,1fr); } .scf-detail { grid-column:2; border-top:1px solid var(--scf-line); } }
  @media(max-width:650px) { .scf-shell { display:block; } .scf-nav { display:flex; flex-wrap:wrap; gap:5px; } .scf-nav .scf-title { width:100%; } .scf-nav button { width:auto; } .scf-panel { border-right:0; } .scf-dialogback { padding:0; align-items:end; } .scf-dialog { max-height:95dvh; border-radius:18px 18px 0 0; } }
`

function formatTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function AdminChatFoldersPage() {
  const navigate = useNavigate()
  const [folders, setFolders] = useState([])
  const [folderHasMore, setFolderHasMore] = useState(false)
  const [folderPage, setFolderPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [listRevision, setListRevision] = useState(0)
  const [folderRevision, setFolderRevision] = useState(0)
  const [activeChat, setActiveChat] = useState(null)
  const [thread, setThread] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState('')
  const [threadHasMore, setThreadHasMore] = useState(false)
  const [threadCursor, setThreadCursor] = useState('')
  const [olderLoading, setOlderLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [threadRevision, setThreadRevision] = useState(0)
  const pendingReply = useRef(null)
  const threadScroll = useRef(null)
  const openedIdRef = useRef('')
  openedIdRef.current = activeChat?.id || ''

  const reloadFolders = useCallback(async signal => {
    const result = await getAdminSupportFolders({ page: folderPage, signal })
    if (signal?.aborted) return
    const items = Array.isArray(result.folders) ? result.folders.slice(0, 10) : []
    if (!items.length && folderPage > 1) {
      setFolderPage(current => Math.max(1, current - 1))
      return
    }
    setFolders(items)
    setFolderHasMore(Boolean(result.has_more))
    setSelectedId(current => current && items.some(folder => folder.id === current) ? current : '')
  }, [folderPage])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    reloadFolders(controller.signal)
      .catch(err => {
        if (!controller.signal.aborted && err.name !== 'AbortError') {
          setError(err.message || 'Could not load folders')
          setFolders([])
          setFolderHasMore(false)
          setSelectedId('')
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reloadFolders, folderRevision])

  useEffect(() => {
    if (!selectedId) { setChats([]); setHasMore(false); setChatLoading(false); return undefined }
    const controller = new AbortController()
    setChatLoading(true)
    setChats([])
    setHasMore(false)
    setError('')
    getAdminSupportFolderConversations(selectedId, { page, signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return
        const result = Array.isArray(data.conversations) ? data.conversations : []
        if (!result.length && page > 1) { setPage(current => Math.max(1,current - 1)); return }
        setChats(result)
        setHasMore(Boolean(data.has_more))
      })
      .catch(err => { if (!controller.signal.aborted && err.name !== 'AbortError') { setError(err.message || 'Could not load conversations'); setChats([]); setHasMore(false) } })
      .finally(() => { if (!controller.signal.aborted) setChatLoading(false) })
    return () => controller.abort()
  }, [selectedId, page, listRevision])

  useEffect(() => {
    const controller = new AbortController()
    setThread([])
    setThreadCursor('')
    setThreadHasMore(false)
    setThreadError('')
    if (!activeChat?.id) { setThreadLoading(false); return () => controller.abort() }
    setThreadLoading(true)
    getAdminSupportMessages(activeChat.id, { signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return
        setThread(Array.isArray(data.messages) ? data.messages : [])
        setThreadHasMore(Boolean(data.has_more))
        setThreadCursor(data.next_before || '')
      })
      .catch(err => { if (!controller.signal.aborted && err.name !== 'AbortError') setThreadError(err.message || 'Could not load messages') })
      .finally(() => { if (!controller.signal.aborted) setThreadLoading(false) })
    return () => controller.abort()
  }, [activeChat?.id, threadRevision])

  useEffect(() => {
    if (!threadLoading && !threadError && activeChat?.id) {
      requestAnimationFrame(() => { if (threadScroll.current) threadScroll.current.scrollTop = threadScroll.current.scrollHeight })
    }
  }, [threadLoading, threadRevision, activeChat?.id])

  const selected = folders.find(item => item.id === selectedId)
  const canManage = selected?.can_manage === true

  function selectFolder(id) {
    if (id !== selectedId) { setSelectedId(id); setPage(1); setActiveChat(null) }
  }

  function changeFolderPage(next) {
    if (loading || busy || next < 1 || next > 1000 || (next > folderPage && !folderHasMore)) return
    setSelectedId('')
    setChats([])
    setHasMore(false)
    setActiveChat(null)
    setPage(1)
    setError('')
    setNotice('')
    setFolderPage(next)
  }

  async function createFolder(event) {
    event.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await createAdminSupportFolder(name.trim())
      setName('')
      setSelectedId('')
      setActiveChat(null)
      setPage(1)
      setNotice('Folder created. Browse the numbered folder pages to find it.')
      setFolderPage(1)
      setFolderRevision(current => current + 1)
    } catch (err) { setError(err.message || 'Could not create folder') }
    finally { setBusy(false) }
  }

  async function renameFolder() {
    if (!selected || !canManage || busy) return
    const next = window.prompt('New folder name', selected.name)
    if (next === null || !next.trim() || next.trim() === selected.name) return
    setBusy(true)
    setError('')
    try {
      await renameAdminSupportFolder(selected.id, next.trim())
      setNotice('Folder renamed successfully.')
      setFolderRevision(current => current + 1)
    }
    catch (err) { setError(err.message || 'Could not rename folder') }
    finally { setBusy(false) }
  }

  async function deleteFolder() {
    if (!selected || !canManage || busy || !window.confirm(`Delete folder "${selected.name}"? Its conversations and messages will remain.`)) return
    setBusy(true)
    setError('')
    try {
      await deleteAdminSupportFolder(selected.id)
      setSelectedId('')
      setPage(1)
      setActiveChat(null)
      setNotice('Folder deleted. Its conversations and messages were preserved.')
      setFolderRevision(current => current + 1)
    } catch (err) { setError(err.message || 'Could not delete folder') }
    finally { setBusy(false) }
  }

  async function loadOlder() {
    const id = activeChat?.id
    if (!id || !threadHasMore || !threadCursor || olderLoading || threadLoading) return
    const scroll = threadScroll.current
    const beforeHeight = scroll?.scrollHeight || 0
    const beforeTop = scroll?.scrollTop || 0
    setOlderLoading(true)
    setThreadError('')
    try {
      const data = await getAdminSupportMessages(id, { before:threadCursor })
      if (openedIdRef.current !== id) return
      const older = Array.isArray(data.messages) ? data.messages : []
      setThread(current => {
        const seen = new Set(current.map(item => item.id))
        return [...older.filter(item => !seen.has(item.id)), ...current]
      })
      setThreadHasMore(Boolean(data.has_more))
      setThreadCursor(data.next_before || '')
      requestAnimationFrame(() => {
        if (openedIdRef.current === id && scroll) scroll.scrollTop = beforeTop + scroll.scrollHeight - beforeHeight
      })
    } catch (err) { if (openedIdRef.current === id) setThreadError(err.message || 'Could not load older messages') }
    finally { setOlderLoading(false) }
  }

  async function sendReply(event) {
    event.preventDefault()
    const id = activeChat?.id
    const value = replyText.trim()
    if (!id || !value || value.length > 2000 || replyBusy) return
    const fingerprint = `${id}:${value}`
    if (pendingReply.current?.fingerprint !== fingerprint) pendingReply.current = { fingerprint, id:crypto.randomUUID() }
    setReplyBusy(true)
    setThreadError('')
    try {
      await sendAdminSupportMessage(id, value, pendingReply.current.id)
      pendingReply.current = null
      setReplyText('')
      if (openedIdRef.current === id) setThreadRevision(current => current + 1)
      setListRevision(current => current + 1)
    } catch (err) { if (openedIdRef.current === id) setThreadError(err.message || 'Could not send message') }
    finally { setReplyBusy(false) }
  }

  function openConversation(chat) {
    setActiveChat(chat)
    setReplyText('')
    setThreadError('')
    pendingReply.current = null
  }

  function closeConversation() {
    if (replyBusy) return
    setActiveChat(null)
    setReplyText('')
    pendingReply.current = null
  }

  return <AdminLayout title="Chat Folders" subtitle="Shadow Admin · Support Chat management">
    <style>{styles}</style>
    <main className="scf">
      {error && <div className="scf-error" role="alert">{error} <button type="button" className="scf-btn" onClick={() => { setFolderRevision(current => current + 1); setListRevision(current => current + 1) }}>Retry</button></div>}
      {notice && <div className="scf-muted" role="status" style={{ marginBottom: 12 }}>{notice} <button className="scf-btn" type="button" onClick={() => setNotice('')}>OK</button></div>}
      <div className="scf-shell">
        <nav className="scf-nav" aria-label="Support chat navigation">
          <h2 className="scf-title">Shadow Admin</h2>
          <button type="button" onClick={() => navigate('/admin-chat')}>All Inbox</button>
          <button type="button" onClick={() => navigate('/admin-chat/archived')}>Archived Chats</button>
          <button type="button" className="active" aria-current="page">Folders</button>
        </nav>
        <section className="scf-panel">
          <div className="scf-head"><h2>Folders</h2><span className="scf-muted">Page {folderPage} · 10 per page</span></div>
          <form className="scf-form" onSubmit={createFolder}>
            <input className="scf-input" aria-label="Folder name" maxLength={60} value={name} onChange={event => setName(event.target.value)} placeholder="New folder name" />
            <button className="scf-btn gold" disabled={busy || loading || !name.trim()} type="submit">Create</button>
          </form>
          {loading && <div className="scf-muted">Loading folders...</div>}
          {!loading && folders.length === 0 && !error && <div className="scf-muted">No folders yet. Create one to organize support chats.</div>}
          {!loading && folders.map(folder => <button key={folder.id} type="button" onClick={() => selectFolder(folder.id)} className={`scf-folder ${selectedId === folder.id ? 'active' : ''}`} aria-pressed={selectedId === folder.id}><strong>{folder.name}</strong><span>›</span></button>)}
          <div className="scf-pages" aria-label="Folder pages">
            <button className="scf-btn" type="button" disabled={loading || busy || folderPage === 1} onClick={() => changeFolderPage(folderPage - 1)}>Previous</button>
            <span className="scf-muted" aria-live="polite">Page {folderPage}</span>
            <button className="scf-btn gold" type="button" disabled={loading || busy || Boolean(error) || !folderHasMore || folderPage >= 1000} onClick={() => changeFolderPage(folderPage + 1)}>Next</button>
          </div>
        </section>
        <section className="scf-detail">
          {!selected && <div className="scf-muted">Choose a folder to view its conversations.</div>}
          {selected && <>
            <div className="scf-head"><h2>{selected.name}</h2>{canManage && <div style={{ display:'flex', gap:5 }}><button className="scf-btn" type="button" onClick={renameFolder} disabled={busy}>Rename</button><button className="scf-btn" type="button" onClick={deleteFolder} disabled={busy}>Delete folder</button></div>}</div>
            {chatLoading && <div className="scf-muted">Loading conversations...</div>}
            {!chatLoading && !error && chats.length === 0 && <div className="scf-muted">There are no active chats in this folder.</div>}
            {!chatLoading && chats.map(chat => <div className="scf-row" key={chat.id}><div><b>{chat.reader?.name || chat.reader?.username || 'Shadow Reader'}</b><small>{chat.reader?.username ? `@${chat.reader.username} · ` : ''}{chat.last_message_preview || 'No messages'}</small></div><button type="button" className="scf-btn" onClick={() => openConversation(chat)}>Open Chat</button></div>)}
            <div className="scf-pages"><button type="button" className="scf-btn" disabled={chatLoading || busy || page === 1} onClick={() => { setActiveChat(null); setPage(current => Math.max(1,current - 1)) }}>Previous</button><span className="scf-muted" aria-live="polite">Page {page} · 10 per page</span><button type="button" className="scf-btn" disabled={chatLoading || busy || Boolean(error) || !hasMore || page >= 1000} onClick={() => { setActiveChat(null); setPage(current => Math.min(1000,current + 1)) }}>Next</button></div>
          </>}
        </section>
      </div>
      {activeChat && <div className="scf-dialogback" onMouseDown={closeConversation}>
        <section role="dialog" aria-modal="true" aria-label="Shadow Support conversation" className="scf-dialog" onMouseDown={event => event.stopPropagation()}>
          <header className="scf-dialoghead"><div><strong>{activeChat.reader?.name || activeChat.reader?.username || 'Shadow Reader'}</strong><div className="scf-muted">Private Shadow Support · {activeChat.status || 'open'}</div></div><button className="scf-btn" type="button" onClick={closeConversation} disabled={replyBusy}>Close</button></header>
          {threadError && <div className="scf-error" role="alert">{threadError} <button className="scf-btn" type="button" onClick={() => setThreadRevision(current => current + 1)}>Retry</button></div>}
          <div className="scf-thread" ref={threadScroll}>
            {threadLoading && <div className="scf-muted">Loading messages...</div>}
            {!threadLoading && threadHasMore && <div className="scf-threadtools"><button type="button" className="scf-btn" disabled={olderLoading} onClick={loadOlder}>{olderLoading ? 'Loading...' : 'Load 20 older messages'}</button></div>}
            {!threadLoading && !threadError && thread.length === 0 && <div className="scf-muted">No messages yet.</div>}
            {!threadLoading && thread.map(message => <div key={message.id} className={`scf-bubblewrap ${message.sender_kind === 'admin' ? 'support' : ''}`}>
              <div className="scf-bubble">{message.message_text || (Array.isArray(message.attachments) && message.attachments.length ? `${message.attachments.length} attachment(s)` : '')}</div>
              <div className="scf-timestamp">{message.sender_kind === 'admin' ? `Shadow Support ${message.public_support_id || ''} · ` : ''}{formatTime(message.created_at)}</div>
            </div>)}
          </div>
          <form className="scf-reply" onSubmit={sendReply}>
            <textarea maxLength={2000} aria-label="Write support message" placeholder="Write a reply to this reader..." value={replyText} onChange={event => { setReplyText(event.target.value); pendingReply.current = null }} disabled={replyBusy || threadLoading || activeChat.status === 'archived'} />
            <button className="scf-btn gold" type="submit" disabled={replyBusy || threadLoading || activeChat.status === 'archived' || !replyText.trim()}>{replyBusy ? 'Sending...' : 'Send'}</button>
          </form>
        </section>
      </div>}
    </main>
  </AdminLayout>
}
