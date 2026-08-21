import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 10

const styles = `
  .staff-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 18px;
    align-items: start;
  }

  .staff-main,
  .staff-side {
    min-width: 0;
  }

  .staff-main {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .staff-side {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .staff-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(180px, 260px) auto;
    gap: 10px;
  }

  .staff-input,
  .staff-select {
    width: 100%;
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    box-sizing: border-box;
    outline: none;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
  }

  .staff-input:focus,
  .staff-select:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .staff-add-btn {
    height: 42px;
    border: 0;
    border-radius: 12px;
    background: #4F46E5;
    color: #FFFFFF;
    padding: 0 17px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    white-space: nowrap;
  }

  .staff-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .staff-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    overflow: hidden;
  }

  .staff-table-wrap {
    overflow-x: auto;
  }

  .staff-table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
  }

  .staff-table th {
    padding: 13px 14px;
    border-bottom: 1px solid #E2E8F0;
    color: #64748B;
    background: #F8FAFC;
    text-align: left;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .staff-table td {
    padding: 13px 14px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 12px;
    font-weight: 750;
    vertical-align: middle;
  }

  .staff-table tr:last-child td {
    border-bottom: 0;
  }

  .staff-person {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 165px;
  }

  .staff-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 950;
  }

  .staff-name {
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
  }

  .staff-email {
    color: #64748B;
    max-width: 210px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .staff-role-pill,
  .staff-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 10px;
    font-weight: 900;
    white-space: nowrap;
  }

  .staff-role-pill {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .staff-role-pill.owner {
    background: #F5F3FF;
    color: #7C3AED;
  }

  .staff-status {
    gap: 6px;
  }

  .staff-status::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .staff-status.active {
    background: #F0FDF4;
    color: #15803D;
  }

  .staff-status.active::before {
    background: #22C55E;
  }

  .staff-status.inactive {
    background: #F1F5F9;
    color: #64748B;
  }

  .staff-status.inactive::before {
    background: #94A3B8;
  }

  .staff-status.suspended {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .staff-status.suspended::before {
    background: #EF4444;
  }

  .staff-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .staff-icon-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #E2E8F0;
    border-radius: 9px;
    background: #FFFFFF;
    color: #475569;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 950;
  }

  .staff-icon-btn:hover {
    background: #F8FAFC;
  }

  .staff-icon-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .staff-footer {
    padding: 12px 14px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .staff-footer-text {
    color: #64748B;
    font-size: 11px;
    font-weight: 750;
  }

  .staff-pagination {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .staff-page-btn {
    min-width: 32px;
    height: 32px;
    border: 1px solid #E2E8F0;
    border-radius: 9px;
    background: #FFFFFF;
    color: #475569;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
  }

  .staff-page-btn.active {
    border-color: #6366F1;
    color: #4F46E5;
    background: #EEF2FF;
  }

  .staff-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .staff-side-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
  }

  .staff-side-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .staff-role-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 13px;
  }

  .staff-role-chip {
    border-radius: 9px;
    padding: 7px 10px;
    background: #EEF2FF;
    color: #4F46E5;
    font-size: 10px;
    font-weight: 900;
  }

  .staff-role-chip.system {
    background: #F5F3FF;
    color: #7C3AED;
  }

  .staff-info {
    margin-top: 13px;
    border: 1px solid #C7D2FE;
    background: #EEF2FF;
    color: #4338CA;
    border-radius: 11px;
    padding: 10px 11px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.5;
  }

  .staff-drawer {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    overflow: hidden;
  }

  .staff-drawer-head {
    padding: 17px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .staff-drawer-title {
    color: #0F172A;
    font-size: 17px;
    font-weight: 950;
  }

  .staff-drawer-subtitle {
    margin-top: 4px;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }

  .staff-close {
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 50%;
    background: #F8FAFC;
    color: #475569;
    cursor: pointer;
    font-size: 18px;
  }

  .staff-form {
    padding: 17px;
  }

  .staff-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 13px;
  }

  .staff-field-label {
    color: #334155;
    font-size: 10px;
    font-weight: 950;
  }

  .staff-field input,
  .staff-field select {
    width: 100%;
    box-sizing: border-box;
    height: 39px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 10px;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 750;
  }

  .staff-field input:focus,
  .staff-field select:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .staff-field input:disabled,
  .staff-field select:disabled {
    background: #F8FAFC;
    color: #94A3B8;
  }

  .staff-password-wrap {
    position: relative;
  }

  .staff-password-wrap input {
    padding-right: 42px;
  }

  .staff-eye {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 28px;
    border: 0;
    background: transparent;
    color: #64748B;
    cursor: pointer;
    font-size: 12px;
  }

  .staff-mode-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 13px;
  }

  .staff-mode-btn {
    height: 34px;
    border: 0;
    background: #FFFFFF;
    color: #64748B;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
  }

  .staff-mode-btn.active {
    color: #4F46E5;
    background: #EEF2FF;
    box-shadow: inset 0 0 0 1px #A5B4FC;
  }

  .staff-mode-btn:disabled {
    color: #CBD5E1;
    background: #F8FAFC;
  }

  .staff-drawer-actions {
    padding: 14px 17px 17px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
  }

  .staff-cancel-btn,
  .staff-save-btn {
    min-height: 38px;
    border-radius: 10px;
    padding: 0 14px;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
  }

  .staff-cancel-btn {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #64748B;
  }

  .staff-save-btn {
    border: 0;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .staff-save-btn:disabled,
  .staff-cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .staff-alert {
    border-radius: 13px;
    padding: 11px 13px;
    font-size: 11px;
    font-weight: 800;
  }

  .staff-alert.error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
  }

  .staff-alert.success {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #15803D;
  }

  .staff-loading,
  .staff-empty {
    min-height: 300px;
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .staff-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #E0E7FF;
    border-top-color: #4F46E5;
    animation: staffSpin 0.8s linear infinite;
    margin: 0 auto 10px;
  }

  @keyframes staffSpin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1100px) {
    .staff-page {
      grid-template-columns: 1fr;
    }

    .staff-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 760px) {
    .staff-toolbar {
      grid-template-columns: 1fr;
    }

    .staff-add-btn {
      width: 100%;
    }

    .staff-side {
      grid-template-columns: 1fr;
    }

    .staff-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .staff-pagination {
      justify-content: center;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getAdminUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
      localStorage.getItem('shadow_admin_user') ||
      '{}'
    )
  } catch {
    return {}
  }
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function CreateEditPanel({
  mode,
  account,
  roles,
  saving,
  onClose,
  onCreate,
  onUpdate,
}) {
  const editing = mode === 'edit'
  const [name, setName] = useState(account?.name || '')
  const [email, setEmail] = useState(account?.email || '')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(account?.role_id || '')
  const [status, setStatus] = useState(account?.status || 'active')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setName(account?.name || '')
    setEmail(account?.email || '')
    setPassword('')
    setRoleId(account?.role_id || '')
    setStatus(account?.status || 'active')
  }, [account, mode])

  const legacyRole = String(account?.legacy_role || '').toLowerCase()
  const canChangeRole = !editing || legacyRole === 'staff'

  function submit() {
    if (editing) {
      const payload = {
        name: name.trim(),
        status,
      }

      if (canChangeRole && roleId) {
        payload.role_id = roleId
      }

      onUpdate(account.id, payload)
      return
    }

    onCreate({
      name: name.trim(),
      email: email.trim(),
      password,
      role_id: roleId,
      status,
    })
  }

  const createValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    Boolean(roleId)

  const editValid = name.trim().length >= 2

  return (
    <div className="staff-drawer">
      <div className="staff-drawer-head">
        <div>
          <div className="staff-drawer-title">{editing ? 'Edit Account' : 'Create Account'}</div>
          <div className="staff-drawer-subtitle">
            {editing
              ? 'Update staff profile, assigned role, or account status.'
              : 'Select a saved role to apply its permissions.'}
          </div>
        </div>
        <button type="button" className="staff-close" onClick={onClose} disabled={saving}>×</button>
      </div>

      <div className="staff-form">
        <label className="staff-field">
          <span className="staff-field-label">Full Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter full name"
            maxLength={120}
          />
        </label>

        <label className="staff-field">
          <span className="staff-field-label">Email Address</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email address"
            disabled={editing}
            maxLength={200}
          />
        </label>

        {!editing ? (
          <>
            <div className="staff-field-label" style={{ marginBottom: 6 }}>Set Password or Send Invite</div>
            <div className="staff-mode-tabs">
              <button type="button" className="staff-mode-btn active">Set Password</button>
              <button
                type="button"
                className="staff-mode-btn"
                disabled
                title="Invite email will be added later"
              >
                Send Invite
              </button>
            </div>

            <label className="staff-field">
              <span className="staff-field-label">Password</span>
              <div className="staff-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="staff-eye"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </label>
          </>
        ) : null}

        <label className="staff-field">
          <span className="staff-field-label">Role</span>
          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            disabled={!canChangeRole}
          >
            <option value="">
              {canChangeRole ? 'Select a saved role' : account?.role_name || 'Protected role'}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </label>

        <label className="staff-field" style={{ marginBottom: 0 }}>
          <span className="staff-field-label">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="active">● Active</option>
            <option value="inactive">● Inactive</option>
            <option value="suspended">● Suspended</option>
          </select>
        </label>
      </div>

      <div className="staff-drawer-actions">
        <button type="button" className="staff-cancel-btn" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button
          type="button"
          className="staff-save-btn"
          onClick={submit}
          disabled={saving || (editing ? !editValid : !createValid)}
        >
          {saving
            ? 'Saving...'
            : editing
              ? 'Save Changes'
              : 'Create Account'}
        </button>
      </div>
    </div>
  )
}

export default function AdminStaffAccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [panelMode, setPanelMode] = useState('')
  const [editingAccount, setEditingAccount] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const currentAdmin = useMemo(() => getAdminUser(), [])
const currentLegacyRole = String(currentAdmin?.role || '').toLowerCase()
const currentPermissionKeys = Array.isArray(currentAdmin?.permission_keys)
  ? currentAdmin.permission_keys
  : []

const canManageAccounts =
  currentAdmin?.has_all_permissions === true ||
  currentLegacyRole === 'owner' ||
  currentLegacyRole === 'admin' ||
  currentPermissionKeys.includes('accounts.manage')
  const assignableRoles = useMemo(
    () => roles.filter((role) => !role.is_system && !role.is_protected && role.system_key !== 'owner'),
    [roles]
  )

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const token = getAdminToken()

      const [accountsResponse, rolesResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/accounts/roles`, {
  headers: { Authorization: `Bearer ${token}` },
}),
      ])

      const [accountsData, rolesData] = await Promise.all([
        accountsResponse.json().catch(() => ({})),
        rolesResponse.json().catch(() => ({})),
      ])

      if (!accountsResponse.ok || accountsData.ok === false) {
        throw new Error(accountsData.message || 'Failed to load staff accounts')
      }

      if (!rolesResponse.ok || rolesData.ok === false) {
        throw new Error(rolesData.message || 'Failed to load saved roles')
      }

      setAccounts(accountsData.accounts || [])
      setRoles(rolesData.roles || [])
    } catch (err) {
      setError(err.message || 'Failed to load Staff Accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return accounts.filter((account) => {
      const matchesSearch = !query || `${account.name || ''} ${account.email || ''} ${account.role_name || ''}`
        .toLowerCase()
        .includes(query)

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'owner' && String(account.legacy_role || '').toLowerCase() === 'owner') ||
        (roleFilter === 'admin' && String(account.legacy_role || '').toLowerCase() === 'admin') ||
        account.role_id === roleFilter

      return matchesSearch && matchesRole
    })
  }, [accounts, search, roleFilter])

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageAccounts = filteredAccounts.slice(pageStart, pageStart + PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  function openCreate() {
  if (!canManageAccounts) return

  setEditingAccount(null)
    setPanelMode('create')
    setError('')
    setSuccess('')
  }

  function openEdit(account) {
  if (!canManageAccounts) return

  setEditingAccount(account)
    setPanelMode('edit')
    setError('')
    setSuccess('')
  }

  function closePanel() {
    if (saving) return
    setPanelMode('')
    setEditingAccount(null)
  }

  function canEditAccount(account) {
  if (!canManageAccounts) return false

  const targetLegacyRole = String(account?.legacy_role || '').toLowerCase()

    if (targetLegacyRole === 'owner') return false
    if (targetLegacyRole === 'admin' && currentLegacyRole !== 'owner') return false
    return true
  }

  async function createAccount(payload) {
  if (!canManageAccounts) return

  try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to create account')
      }

      setAccounts((current) => [...current, data.account])
      setPanelMode('')
      setSuccess(`Account "${data.account.name}" created successfully.`)
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  async function updateAccount(accountId, payload) {
  if (!canManageAccounts) return

  try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update account')
      }

      setAccounts((current) =>
        current.map((account) => account.id === accountId ? data.account : account)
      )
      setPanelMode('')
      setEditingAccount(null)
      setSuccess(`Account "${data.account.name}" updated successfully.`)
    } catch (err) {
      setError(err.message || 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAccountStatus(account) {
    if (!canEditAccount(account)) return

    const nextStatus = account.status === 'active' ? 'inactive' : 'active'

    await updateAccount(account.id, {
      name: account.name,
      status: nextStatus,
    })
  }

  return (
    <AdminLayout
      title="Staff Accounts"
      subtitle="Accounts inherit permissions from their assigned saved roles."
    >
      <style>{styles}</style>

      {error ? <div className="staff-alert error" style={{ marginBottom: 14 }}>{error}</div> : null}
      {success ? <div className="staff-alert success" style={{ marginBottom: 14 }}>{success}</div> : null}

      <div className="staff-page">
        <div className="staff-main">
          <div className="staff-toolbar">
            <input
              className="staff-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
            />

            <select
              className="staff-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">Filter by role</option>
              <option value="owner">Owner</option>
              <option value="admin">Legacy Admin</option>
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            {canManageAccounts ? (
  <button type="button" className="staff-add-btn" onClick={openCreate}>
    ＋ Add Account
  </button>
) : null}
          </div>

          <div className="staff-card">
            {loading ? (
              <div className="staff-loading">
                <div>
                  <div className="staff-spinner" />
                  Loading staff accounts...
                </div>
              </div>
            ) : pageAccounts.length === 0 ? (
              <div className="staff-empty">No staff accounts found.</div>
            ) : (
              <>
                <div className="staff-table-wrap">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageAccounts.map((account) => {
                        const protectedAccount = !canEditAccount(account)
                        const owner = String(account.legacy_role || '').toLowerCase() === 'owner'

                        return (
                          <tr key={account.id}>
                            <td>
                              <div className="staff-person">
                                <span className="staff-avatar">{initials(account.name)}</span>
                                <span className="staff-name">{account.name || 'Unnamed'}</span>
                              </div>
                            </td>
                            <td>
                              <div className="staff-email" title={account.email}>
                                {account.email}
                              </div>
                            </td>
                            <td>
                              <span className={`staff-role-pill ${owner ? 'owner' : ''}`}>
                                {account.role_name || 'Unassigned'}
                              </span>
                            </td>
                            <td>
                              <span className={`staff-status ${account.status || 'active'}`}>
                                {account.status || 'active'}
                              </span>
                            </td>
                            <td>{formatDateTime(account.last_login_at)}</td>
                            <td>
  {canManageAccounts ? (
    <div className="staff-actions">
      <button
        type="button"
        className="staff-icon-btn"
        onClick={() => openEdit(account)}
        disabled={protectedAccount}
        title={protectedAccount ? 'Protected account' : 'Edit account'}
      >
        ✎
      </button>
      <button
        type="button"
        className="staff-icon-btn"
        onClick={() => toggleAccountStatus(account)}
        disabled={protectedAccount || saving}
        title={
          protectedAccount
            ? 'Protected account'
            : account.status === 'active'
              ? 'Set inactive'
              : 'Set active'
        }
      >
        ⋮
      </button>
    </div>
  ) : null}
</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="staff-footer">
                  <div className="staff-footer-text">
                    Showing {filteredAccounts.length === 0 ? 0 : pageStart + 1} to{' '}
                    {Math.min(pageStart + PAGE_SIZE, filteredAccounts.length)} of{' '}
                    {filteredAccounts.length} accounts
                  </div>

                  <div className="staff-pagination">
                    <button
                      type="button"
                      className="staff-page-btn"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={safePage <= 1}
                    >
                      ‹
                    </button>
                    <button type="button" className="staff-page-btn active">{safePage}</button>
                    <button
                      type="button"
                      className="staff-page-btn"
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      disabled={safePage >= totalPages}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="staff-side">
          <div className="staff-side-card">
            <div className="staff-side-title">♧ Available Roles</div>
            <div className="staff-role-chips">
              {roles.map((role) => (
                <span
                  className={`staff-role-chip ${role.is_system ? 'system' : ''}`}
                  key={role.id}
                >
                  {role.name}
                </span>
              ))}
              {roles.length === 0 ? (
                <span style={{ color: '#94A3B8', fontSize: 11 }}>No saved roles yet.</span>
              ) : null}
            </div>
            <div className="staff-info">
              ⓘ Choose a saved role when creating an account. Owner/System roles are protected.
            </div>
          </div>

          {canManageAccounts && panelMode ? (
            <CreateEditPanel
              mode={panelMode}
              account={editingAccount}
              roles={assignableRoles}
              saving={saving}
              onClose={closePanel}
              onCreate={createAccount}
              onUpdate={updateAccount}
            />
          ) : null}
        </aside>
      </div>
    </AdminLayout>
  )
}
