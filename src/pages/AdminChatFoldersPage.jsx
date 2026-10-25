import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import {
  createAdminSupportFolder,
  deleteAdminSupportFolder,
  getAdminSupportFolderConversations,
  getAdminSupportFolders,
  renameAdminSupportFolder,
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
  .scf-head { display:flex; gap:10px; justify-content:space-between; align-items:center; margin-bottom:15px; }
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
  .scf-row small { display:block; margin-top:5px; color:#7e8a9c; font-size:11px; }
  .scf-error { margin-bottom:12px; border:1px solid #f4c6cb; background:#fff4f5; border-radius:10px; padding:11px; font-size:12px; color:#b5263c; }
  .scf-muted { color:#8390a1; font-size:12px; line-height:1.6; }
  @media(max-width:950px) { .scf-shell { grid-template-columns:150px minmax(220px,1fr); } .scf-detail { grid-column:2; border-top:1px solid var(--scf-line); } }
  @media(max-width:650px) { .scf-shell { display:block; } .scf-nav { display:flex; flex-wrap:wrap; gap:5px; } .scf-nav .scf-title { width:100%; } .scf-nav button { width:auto; } .scf-panel { border-right:0; } }
`

export default function AdminChatFoldersPage() {
  const navigate = useNavigate()
  const [folders, setFolders] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const reloadFolders = useCallback(async (signal) => {
    const result = await getAdminSupportFolders({ signal })
    setFolders(result.folders || [])
    setSelectedId(current => current && result.folders?.some(folder => folder.id === current) ? current : '')
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    reloadFolders(controller.signal)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message || 'Could not load folders') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reloadFolders])

  useEffect(() => {
    if (!selectedId) { setChats([]); setHasMore(false); return undefined }
    const controller = new AbortController()
    setChatLoading(true)
    setError('')
    getAdminSupportFolderConversations(selectedId, { page, signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setChats(data.conversations || []); setHasMore(Boolean(data.has_more)) } })
      .catch(err => { if (!controller.signal.aborted && err.name !== 'AbortError') setError(err.message || 'Could not load conversations') })
      .finally(() => { if (!controller.signal.aborted) setChatLoading(false) })
    return () => controller.abort()
  }, [selectedId, page])

  const selected = folders.find(item => item.id === selectedId)

  async function createFolder(event) {
    event.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await createAdminSupportFolder(name.trim())
      setName('')
      await reloadFolders()
      if (result.folder?.id) { setSelectedId(result.folder.id); setPage(1) }
    } catch (err) { setError(err.message || 'Could not create folder') }
    finally { setBusy(false) }
  }

  async function renameFolder() {
    if (!selected || busy) return
    const next = window.prompt('New folder name', selected.name)
    if (next === null || !next.trim() || next.trim() === selected.name) return
    setBusy(true)
    setError('')
    try { await renameAdminSupportFolder(selected.id, next.trim()); await reloadFolders() }
    catch (err) { setError(err.message || 'Could not rename folder') }
    finally { setBusy(false) }
  }

  async function deleteFolder() {
    if (!selected || busy || !window.confirm(`Delete folder "${selected.name}"? Its conversations and messages will remain.`)) return
    setBusy(true)
    setError('')
    try { await deleteAdminSupportFolder(selected.id); setSelectedId(''); setPage(1); await reloadFolders() }
    catch (err) { setError(err.message || 'Could not delete folder') }
    finally { setBusy(false) }
  }

  return <AdminLayout title="Chat Folders" subtitle="Shadow Admin · Support Chat management">
    <style>{styles}</style>
    <main className="scf">
      {error && <div className="scf-error" role="alert">{error}</div>}
      <div className="scf-shell">
        <nav className="scf-nav" aria-label="Support chat navigation">
          <h2 className="scf-title">Shadow Admin</h2>
          <button type="button" onClick={() => navigate('/admin-chat')}>All Inbox</button>
          <button type="button" onClick={() => navigate('/admin-chat/archived')}>Archived Chats</button>
          <button type="button" className="active" aria-current="page">Folders</button>
        </nav>
        <section className="scf-panel">
          <div className="scf-head"><h2>Folders</h2><span className="scf-muted">Latest 10</span></div>
          <form className="scf-form" onSubmit={createFolder}>
            <input className="scf-input" aria-label="Folder name" maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="New folder name" />
            <button className="scf-btn gold" disabled={busy || !name.trim()} type="submit">Create</button>
          </form>
          {loading && <div className="scf-muted">Loading folders...</div>}
          {!loading && folders.length === 0 && <div className="scf-muted">No folders yet. Create one to organize support chats.</div>}
          {!loading && folders.map(folder => <button key={folder.id} type="button" onClick={() => { setSelectedId(folder.id); setPage(1) }} className={`scf-folder ${selectedId === folder.id ? 'active' : ''}`}><strong>{folder.name}</strong><span>›</span></button>)}
        </section>
        <section className="scf-detail">
          {!selected && <div className="scf-muted">Choose a folder to view its conversations.</div>}
          {selected && <>
            <div className="scf-head"><h2>{selected.name}</h2><div style={{ display:'flex', gap:5 }}><button className="scf-btn" type="button" onClick={renameFolder} disabled={busy}>Rename</button><button className="scf-btn" type="button" onClick={deleteFolder} disabled={busy}>Delete folder</button></div></div>
            {chatLoading && <div className="scf-muted">Loading conversations...</div>}
            {!chatLoading && chats.length === 0 && <div className="scf-muted">There are no active chats in this folder.</div>}
            {!chatLoading && chats.map(chat => <div className="scf-row" key={chat.id}><div><b>{chat.reader?.name || chat.reader?.username || 'Shadow Reader'}</b><small>{chat.reader?.username ? `@${chat.reader.username} · ` : ''}{chat.last_message_preview || 'No messages'}</small></div><button type="button" className="scf-btn" onClick={() => navigate(`/admin-chat?conversation=${encodeURIComponent(chat.id)}`)}>Open</button></div>)}
            {!chatLoading && <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:15 }}><button type="button" className="scf-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span className="scf-muted">Page {page}</span><button type="button" className="scf-btn" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>Next</button></div>}
          </>}
        </section>
      </div>
    </main>
  </AdminLayout>
}
