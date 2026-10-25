const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BASE = `${API_BASE_URL}/api/admin/support-chat`

export class AdminSupportChatApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'AdminSupportChatApiError'
    this.status = status
    this.code = code
  }
}

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = adminToken()
  if (!token) throw new AdminSupportChatApiError(401, 'ADMIN_LOGIN_REQUIRED', 'Please sign in as an Admin')
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(signal ? { signal } : {}),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data?.ok === false) {
    throw new AdminSupportChatApiError(response.status, data?.code || 'ADMIN_CHAT_ERROR', data?.message || 'Support Chat request failed')
  }
  return data
}

export function getAdminSupportInbox(filter = 'all', { signal, page = 1 } = {}) {
  const accepted = ['all', 'unread', 'seen', 'assigned', 'archived']
  const name = accepted.includes(filter) ? filter : 'all'
  const pageNumber = Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1
  return request(`/conversations?${new URLSearchParams({ filter: name, page: String(pageNumber) })}`, { signal })
}

export function searchAdminSupportPeople(search, { signal } = {}) {
  const q = String(search || '').trim()
  if (!q) return Promise.resolve({ ok: true, users: [] })
  return request(`/users/search?${new URLSearchParams({ q })}`, { signal })
}

export function getAdminSupportMessages(conversationId, { before = '', signal } = {}) {
  const params = before ? `?${new URLSearchParams({ before })}` : ''
  return request(`/conversations/${encodeURIComponent(conversationId)}/messages${params}`, { signal })
}

export function startAdminSupportChat(readerUserId, message, requestId) {
  return request('/conversations/start', {
    method: 'POST',
    body: { reader_user_id: readerUserId, message, ...(requestId ? { request_id: requestId } : {}) },
  })
}

export function sendAdminSupportMessage(conversationId, message, requestId) {
  return request(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: { message, ...(requestId ? { request_id: requestId } : {}) },
  })
}

export function changeAdminSupportChat(conversationId, action, value = null) {
  return request(`/conversations/${encodeURIComponent(conversationId)}/action`, {
    method: 'PATCH',
    body: { action, value },
  })
}

export function getAdminSupportFolders({ signal, page = 1 } = {}) {
  const pageNumber = Number.isSafeInteger(page) && page >= 1 && page <= 1000 ? page : 1
  return request(`/folders?${new URLSearchParams({ page: String(pageNumber) })}`, { signal })
}

export function getAdminSupportFolderConversations(folderId, { page = 1, signal } = {}) {
  const params = new URLSearchParams({ page: String(page) })
  return request(`/folders/${encodeURIComponent(folderId)}/conversations?${params}`, { signal })
}

export function createAdminSupportFolder(name) {
  return request('/folders', { method: 'POST', body: { name } })
}

export function renameAdminSupportFolder(folderId, name) {
  return request(`/folders/${encodeURIComponent(folderId)}`, { method: 'PATCH', body: { name } })
}

export function deleteAdminSupportFolder(folderId) {
  return request(`/folders/${encodeURIComponent(folderId)}`, { method: 'DELETE' })
}

export function addChatToSupportFolder(folderId, conversationId) {
  return request(`/folders/${encodeURIComponent(folderId)}/conversations/${encodeURIComponent(conversationId)}`, { method: 'POST' })
}

export function removeChatFromSupportFolder(folderId, conversationId) {
  return request(`/folders/${encodeURIComponent(folderId)}/conversations/${encodeURIComponent(conversationId)}`, { method: 'DELETE' })
}
