import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .roles-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .roles-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .roles-btn {
    min-height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 0 14px;
    background: #FFFFFF;
    color: #475569;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .roles-btn.primary {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .roles-btn.danger {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #DC2626;
  }

  .roles-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .roles-readonly {
    margin-right: auto;
    border: 1px solid #DBEAFE;
    background: #EFF6FF;
    color: #1D4ED8;
    border-radius: 12px;
    padding: 10px 13px;
    font-size: 12px;
    font-weight: 850;
  }

  .roles-error,
  .roles-success {
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 850;
  }

  .roles-error {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .roles-success {
    border: 1px solid #BBF7D0;
    background: #F0FDF4;
    color: #15803D;
  }

  .roles-shell {
    display: grid;
    grid-template-columns: 285px minmax(0, 1fr);
    gap: 16px;
    min-height: 650px;
  }

  .roles-list-card,
  .roles-main-card,
  .roles-summary-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
  }

  .roles-list-card {
    padding: 14px;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .roles-search {
    width: 100%;
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #F8FAFC;
    padding: 0 12px;
    color: #0F172A;
    outline: none;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    box-sizing: border-box;
  }

  .roles-search:focus {
    background: #FFFFFF;
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .roles-list-label {
    margin: 17px 6px 8px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .roles-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
  }

  .roles-list-item {
    width: 100%;
    border: 0;
    background: transparent;
    border-radius: 12px;
    padding: 11px 12px;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    cursor: pointer;
    font: inherit;
    color: #334155;
  }

  .roles-list-item:hover {
    background: #F8FAFC;
  }

  .roles-list-item.active {
    background: #EEF2FF;
    color: #4338CA;
    box-shadow: inset 3px 0 0 #4F46E5;
  }

  .roles-shield {
    width: 32px;
    height: 32px;
    border-radius: 11px;
    background: #F8FAFC;
    color: #6366F1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .roles-list-item.active .roles-shield {
    background: #FFFFFF;
  }

  .roles-list-name {
    font-size: 13px;
    font-weight: 900;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .roles-list-meta {
    margin-top: 2px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
  }

  .roles-empty {
    min-height: 180px;
    display: grid;
    place-items: center;
    text-align: center;
    color: #94A3B8;
    font-size: 12px;
    font-weight: 800;
    padding: 20px;
  }

  .roles-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .roles-summary-card {
    padding: 15px 17px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 18px;
  }

  .roles-summary-role {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .roles-summary-icon {
    width: 46px;
    height: 46px;
    border-radius: 15px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .roles-summary-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .roles-summary-name {
    color: #0F172A;
    font-size: 15px;
    font-weight: 950;
  }

  .roles-system-badge {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 5px 8px;
    font-size: 9px;
    font-weight: 950;
  }

  .roles-summary-desc {
    margin-top: 4px;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
  }

  .roles-stat {
    min-width: 110px;
    text-align: center;
    border-left: 1px solid #E2E8F0;
    padding-left: 18px;
  }

  .roles-stat strong {
    display: block;
    color: #4F46E5;
    font-size: 18px;
    font-weight: 950;
  }

  .roles-stat span {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  .roles-main-card {
    overflow: hidden;
  }

  .roles-main-top {
    padding: 16px 17px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .roles-main-title {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .roles-main-subtitle {
    margin-top: 3px;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
  }

  .roles-edit-name {
    width: min(330px, 100%);
    height: 38px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    padding: 0 11px;
    outline: none;
    color: #0F172A;
    font: inherit;
    font-size: 13px;
    font-weight: 850;
  }

  .roles-edit-name:focus,
  .roles-edit-desc:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .roles-edit-desc {
    width: 100%;
    min-height: 64px;
    resize: vertical;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    padding: 10px 11px;
    outline: none;
    color: #0F172A;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.5;
    box-sizing: border-box;
    margin-top: 9px;
  }

  .roles-groups {
    display: flex;
    flex-direction: column;
  }

  .roles-group {
    border-bottom: 1px solid #E2E8F0;
  }

  .roles-group:last-child {
    border-bottom: 0;
  }

  .roles-group-head {
    padding: 12px 16px;
    background: #F8FAFC;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .roles-group-title {
    color: #334155;
    font-size: 11px;
    font-weight: 950;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .roles-group-count {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 850;
  }

  .roles-table-wrap {
    overflow-x: auto;
  }

  .roles-table {
    width: 100%;
    min-width: 790px;
    border-collapse: collapse;
  }

  .roles-table th {
    color: #64748B;
    font-size: 9px;
    font-weight: 950;
    padding: 10px 11px;
    text-align: center;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
  }

  .roles-table th:first-child {
    text-align: left;
    width: 34%;
  }

  .roles-table td {
    padding: 9px 11px;
    border-bottom: 1px solid #F1F5F9;
    text-align: center;
    vertical-align: middle;
  }

  .roles-table tr:last-child td {
    border-bottom: 0;
  }

  .roles-table td:first-child {
    text-align: left;
  }

  .roles-feature-name {
    color: #0F172A;
    font-size: 11px;
    font-weight: 900;
  }

  .roles-feature-desc {
    margin-top: 2px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 700;
    line-height: 1.35;
  }

  .roles-access-btn {
    min-width: 84px;
    height: 30px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background: #FFFFFF;
    color: #64748B;
    font: inherit;
    font-size: 9px;
    font-weight: 900;
    cursor: pointer;
  }

  .roles-access-btn.active {
    border-color: #818CF8;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .roles-access-btn:disabled {
    cursor: not-allowed;
    opacity: 0.52;
  }

  .roles-specials {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 150px;
  }

  .roles-special {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #64748B;
    font-size: 9px;
    font-weight: 850;
    white-space: nowrap;
  }

  .roles-switch {
    position: relative;
    width: 30px;
    height: 17px;
    border: 0;
    border-radius: 999px;
    background: #CBD5E1;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
  }

  .roles-switch::after {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background: #FFFFFF;
    transition: transform 0.16s ease;
  }

  .roles-switch.on {
    background: #4F46E5;
  }

  .roles-switch.on::after {
    transform: translateX(13px);
  }

  .roles-switch:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .roles-owner-only {
    color: #B45309;
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 999px;
    padding: 4px 7px;
    font-size: 8px;
    font-weight: 950;
  }

  .roles-loading {
    min-height: 480px;
    display: grid;
    place-items: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 850;
  }

  .roles-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #E0E7FF;
    border-top-color: #4F46E5;
    border-radius: 50%;
    animation: rolesSpin 0.8s linear infinite;
    margin: 0 auto 10px;
  }

  @keyframes rolesSpin {
    to { transform: rotate(360deg); }
  }

  .roles-modal-layer {
    position: fixed;
    inset: 0;
    z-index: 3000;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .roles-modal {
    width: min(480px, 100%);
    background: #FFFFFF;
    border-radius: 20px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
    padding: 20px;
  }

  .roles-modal h3 {
    margin: 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
  }

  .roles-modal p {
    margin: 6px 0 16px;
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
  }

  .roles-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 11px;
  }

  .roles-field span {
    color: #475569;
    font-size: 11px;
    font-weight: 900;
  }

  .roles-field input,
  .roles-field textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #F8FAFC;
    color: #0F172A;
    outline: none;
    padding: 10px 11px;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
  }

  .roles-field textarea {
    min-height: 80px;
    resize: vertical;
  }

  .roles-field input:focus,
  .roles-field textarea:focus {
    border-color: #4F46E5;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .roles-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 17px;
  }

  @media (max-width: 1000px) {
    .roles-shell {
      grid-template-columns: 240px minmax(0, 1fr);
    }

    .roles-summary-card {
      grid-template-columns: 1fr auto;
    }

    .roles-stat:last-child {
      display: none;
    }
  }

  @media (max-width: 760px) {
    .roles-toolbar {
      justify-content: stretch;
    }

    .roles-readonly {
      width: 100%;
      margin-right: 0;
      box-sizing: border-box;
    }

    .roles-btn {
      flex: 1;
      min-width: 120px;
    }

    .roles-shell {
      grid-template-columns: 1fr;
      min-height: 0;
    }

    .roles-list-card {
      max-height: 280px;
      overflow-y: auto;
    }

    .roles-summary-card {
      grid-template-columns: 1fr;
    }

    .roles-stat {
      border-left: 0;
      border-top: 1px solid #E2E8F0;
      padding: 10px 0 0;
      text-align: left;
    }

    .roles-main-top {
      flex-direction: column;
    }

    .roles-main-top > div,
    .roles-edit-name {
      width: 100%;
    }

    .roles-modal-layer {
      align-items: flex-end;
      padding: 0;
    }

    .roles-modal {
      border-radius: 20px 20px 0 0;
      max-height: 90dvh;
      overflow-y: auto;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getStoredAdminUser() {
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

function ShieldIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function firstDescription(feature) {
  return feature.permissions?.find((permission) => permission.description)?.description || ''
}

function CreateRoleModal({ open, saving, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
    }
  }, [open])

  if (!open) return null

  return (
    <div className="roles-modal-layer" onMouseDown={onClose}>
      <div className="roles-modal" onMouseDown={(event) => event.stopPropagation()}>
        <h3>Create Role</h3>
        <p>Create a saved role first, then choose exactly what this role can view or manage.</p>

        <label className="roles-field">
          <span>Role Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Editor"
            maxLength={60}
          />
        </label>

        <label className="roles-field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this role is for..."
            maxLength={300}
          />
        </label>

        <div className="roles-modal-actions">
          <button type="button" className="roles-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            type="button"
            className="roles-btn primary"
            disabled={saving || name.trim().length < 2}
            onClick={() => onSubmit({ name: name.trim(), description: description.trim() })}
          >
            {saving ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([])
  const [groups, setGroups] = useState([])
  const [ownerOnlyKeys, setOwnerOnlyKeys] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [search, setSearch] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftPermissions, setDraftPermissions] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const adminUser = useMemo(() => getStoredAdminUser(), [])
  const isOwner = String(adminUser?.role || '').trim().toLowerCase() === 'owner'

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  )

  const ownerOnlySet = useMemo(() => new Set(ownerOnlyKeys), [ownerOnlyKeys])

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return roles

    return roles.filter((role) =>
      `${role.name || ''} ${role.description || ''}`.toLowerCase().includes(query)
    )
  }, [roles, search])

  const allPermissionCount = useMemo(
    () => groups.reduce(
      (total, group) => total + group.features.reduce(
        (sum, feature) => sum + (feature.permissions?.length || 0),
        0
      ),
      0
    ),
    [groups]
  )

  const accessPercent = allPermissionCount > 0
    ? Math.round((draftPermissions.size / allPermissionCount) * 100)
    : 0

  const selectedIsProtected = Boolean(selectedRole?.is_system || selectedRole?.is_protected)
  const canEditSelected = isOwner && selectedRole && !selectedIsProtected

  useEffect(() => {
    let alive = true

    async function loadData() {
      try {
        setLoading(true)
        setError('')
        const token = getAdminToken()

        const [rolesResponse, permissionsResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/admin/roles/permissions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const [rolesData, permissionsData] = await Promise.all([
          rolesResponse.json().catch(() => ({})),
          permissionsResponse.json().catch(() => ({})),
        ])

        if (!rolesResponse.ok || rolesData.ok === false) {
          throw new Error(rolesData.message || 'Failed to load roles')
        }

        if (!permissionsResponse.ok || permissionsData.ok === false) {
          throw new Error(permissionsData.message || 'Failed to load permissions')
        }

        if (!alive) return

        const nextRoles = rolesData.roles || []
        setRoles(nextRoles)
        setGroups(permissionsData.groups || [])
        setOwnerOnlyKeys(permissionsData.owner_only_permission_keys || [])

        const ownerRole = nextRoles.find((role) => role.system_key === 'owner')
        setSelectedRoleId((current) =>
          nextRoles.some((role) => role.id === current)
            ? current
            : ownerRole?.id || nextRoles[0]?.id || ''
        )
      } catch (err) {
        if (alive) setError(err.message || 'Failed to load Roles & Permissions')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadData()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!selectedRole) {
      setDraftName('')
      setDraftDescription('')
      setDraftPermissions(new Set())
      return
    }

    setDraftName(selectedRole.name || '')
    setDraftDescription(selectedRole.description || '')
    setDraftPermissions(new Set(selectedRole.permission_keys || []))
    setError('')
    setSuccess('')
  }, [selectedRole])

  function featureLevel(feature) {
    const permissions = feature.permissions || []
    const manage = permissions.find((permission) => permission.action === 'manage')
    const view = permissions.find((permission) => permission.action === 'view')

    if (manage && draftPermissions.has(manage.permission_key)) return 'manage'
    if (view && draftPermissions.has(view.permission_key)) return 'view'
    return 'none'
  }

  function setFeatureLevel(feature, level) {
    if (!canEditSelected) return

    setDraftPermissions((current) => {
      const next = new Set(current)
      const permissions = feature.permissions || []
      const view = permissions.find((permission) => permission.action === 'view')
      const manage = permissions.find((permission) => permission.action === 'manage')
      const specials = permissions.filter((permission) => permission.action === 'special')

      if (view) next.delete(view.permission_key)
      if (manage) next.delete(manage.permission_key)

      if (level === 'none') {
        for (const permission of specials) {
          next.delete(permission.permission_key)
        }
      }

      if (level === 'view' && view) {
        next.add(view.permission_key)
      }

      if (level === 'manage') {
        if (view) next.add(view.permission_key)
        if (manage) next.add(manage.permission_key)
      }

      return next
    })
  }

  function toggleSpecial(feature, permission) {
    if (!canEditSelected || ownerOnlySet.has(permission.permission_key)) return

    setDraftPermissions((current) => {
      const next = new Set(current)
      const currentlyOn = next.has(permission.permission_key)

      if (currentlyOn) {
        next.delete(permission.permission_key)
        return next
      }

      const view = feature.permissions?.find((item) => item.action === 'view')
      if (view) next.add(view.permission_key)
      next.add(permission.permission_key)
      return next
    })
  }

  async function createRole(payload) {
    try {
      setCreating(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          permission_keys: [],
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to create role')
      }

      const newRole = data.role
      setRoles((current) => [...current, newRole].sort((a, b) => {
        if (a.is_system && !b.is_system) return -1
        if (!a.is_system && b.is_system) return 1
        return String(a.name || '').localeCompare(String(b.name || ''))
      }))
      setSelectedRoleId(newRole.id)
      setCreateOpen(false)
      setSuccess(`Role "${newRole.name}" created. Choose its permissions and save changes.`)
    } catch (err) {
      setError(err.message || 'Failed to create role')
    } finally {
      setCreating(false)
    }
  }

  async function saveRole() {
    if (!selectedRole || !canEditSelected) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/roles/${selectedRole.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: draftName.trim(),
          description: draftDescription.trim(),
          permission_keys: [...draftPermissions],
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save role')
      }

      setRoles((current) =>
        current
          .map((role) => role.id === data.role.id ? data.role : role)
          .sort((a, b) => {
            if (a.is_system && !b.is_system) return -1
            if (!a.is_system && b.is_system) return 1
            return String(a.name || '').localeCompare(String(b.name || ''))
          })
      )
      setSuccess(`Role "${data.role.name}" saved successfully.`)
    } catch (err) {
      setError(err.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  async function duplicateRole() {
    if (!selectedRole || !isOwner) return

    const safePermissions = (selectedRole.permission_keys || []).filter(
      (key) => !ownerOnlySet.has(key)
    )

    try {
      setCreating(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${selectedRole.name} Copy`,
          description: selectedRole.description || '',
          permission_keys: safePermissions,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to duplicate role')
      }

      setRoles((current) => [...current, data.role].sort((a, b) => {
        if (a.is_system && !b.is_system) return -1
        if (!a.is_system && b.is_system) return 1
        return String(a.name || '').localeCompare(String(b.name || ''))
      }))
      setSelectedRoleId(data.role.id)
      setSuccess(`Role duplicated as "${data.role.name}".`)
    } catch (err) {
      setError(err.message || 'Failed to duplicate role')
    } finally {
      setCreating(false)
    }
  }

  async function deleteRole() {
    if (!selectedRole || !canEditSelected) return

    const confirmed = window.confirm(`Delete role "${selectedRole.name}"?`)
    if (!confirmed) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = getAdminToken()

      const response = await fetch(`${API_URL}/api/admin/roles/${selectedRole.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete role')
      }

      const nextRoles = roles.filter((role) => role.id !== selectedRole.id)
      setRoles(nextRoles)

      const ownerRole = nextRoles.find((role) => role.system_key === 'owner')
      setSelectedRoleId(ownerRole?.id || nextRoles[0]?.id || '')
      setSuccess(`Role "${selectedRole.name}" deleted.`)
    } catch (err) {
      setError(err.message || 'Failed to delete role')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title="Roles & Permissions"
        subtitle="Create saved roles and control what staff can access and manage."
      >
        <style>{styles}</style>
        <div className="roles-loading">
          <div>
            <div className="roles-spinner" />
            Loading Roles & Permissions...
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Roles & Permissions"
      subtitle="Create saved roles and control what staff can access and manage."
    >
      <style>{styles}</style>

      <div className="roles-page">
        <div className="roles-toolbar">
          {!isOwner ? (
            <div className="roles-readonly">
              Read only — only Owner can create, edit, or delete roles.
            </div>
          ) : null}

          <button
            type="button"
            className="roles-btn"
            disabled={!isOwner || !selectedRole || creating}
            onClick={duplicateRole}
          >
            ⧉ Duplicate
          </button>

          <button
            type="button"
            className="roles-btn"
            disabled={!isOwner || creating}
            onClick={() => setCreateOpen(true)}
          >
            ＋ Create Role
          </button>

          <button
            type="button"
            className="roles-btn primary"
            disabled={!canEditSelected || saving || draftName.trim().length < 2}
            onClick={saveRole}
          >
            {saving ? 'Saving...' : '▣ Save Changes'}
          </button>
        </div>

        {error ? <div className="roles-error">{error}</div> : null}
        {success ? <div className="roles-success">{success}</div> : null}

        <div className="roles-shell">
          <aside className="roles-list-card">
            <input
              className="roles-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search roles..."
            />

            <div className="roles-list-label">All Roles</div>

            <div className="roles-list">
              {filteredRoles.map((role) => (
                <button
                  type="button"
                  key={role.id}
                  className={`roles-list-item ${selectedRoleId === role.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span className="roles-shield"><ShieldIcon size={17} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span className="roles-list-name" style={{ display: 'block' }}>{role.name}</span>
                    <span className="roles-list-meta">
                      {role.is_system ? 'System Role' : `${Number(role.staff_count || 0)} staff`}
                    </span>
                  </span>
                </button>
              ))}

              {filteredRoles.length === 0 ? (
                <div className="roles-empty">No roles found.</div>
              ) : null}
            </div>
          </aside>

          <section className="roles-main">
            {selectedRole ? (
              <>
                <div className="roles-summary-card">
                  <div className="roles-summary-role">
                    <div className="roles-summary-icon"><ShieldIcon size={24} /></div>
                    <div style={{ minWidth: 0 }}>
                      <div className="roles-summary-name-row">
                        <span className="roles-summary-name">{selectedRole.name}</span>
                        {selectedRole.is_system ? (
                          <span className="roles-system-badge">System Role</span>
                        ) : null}
                      </div>
                      <div className="roles-summary-desc">
                        {selectedRole.description || 'No description for this role.'}
                      </div>
                    </div>
                  </div>

                  <div className="roles-stat">
                    <strong>{Number(selectedRole.staff_count || 0)}</strong>
                    <span>Staff Using This Role</span>
                  </div>

                  <div className="roles-stat">
                    <strong>{selectedRole.is_system ? '100%' : `${accessPercent}%`}</strong>
                    <span>System Access</span>
                  </div>
                </div>

                <div className="roles-main-card">
                  <div className="roles-main-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="roles-main-title">Permissions</div>
                      <div className="roles-main-subtitle">
                        Choose No Access, View, or Manage. Sensitive controls stay Owner-only.
                      </div>

                      {!selectedIsProtected ? (
                        <>
                          <input
                            className="roles-edit-name"
                            value={draftName}
                            onChange={(event) => setDraftName(event.target.value)}
                            disabled={!canEditSelected}
                            maxLength={60}
                            style={{ marginTop: 12 }}
                          />
                          <textarea
                            className="roles-edit-desc"
                            value={draftDescription}
                            onChange={(event) => setDraftDescription(event.target.value)}
                            disabled={!canEditSelected}
                            maxLength={300}
                          />
                        </>
                      ) : null}
                    </div>

                    {canEditSelected ? (
                      <button type="button" className="roles-btn danger" onClick={deleteRole} disabled={saving}>
                        Delete Role
                      </button>
                    ) : null}
                  </div>

                  <div className="roles-groups">
                    {groups.map((group) => (
                      <div className="roles-group" key={group.key}>
                        <div className="roles-group-head">
                          <span className="roles-group-title">{group.label}</span>
                          <span className="roles-group-count">{group.features.length} functions</span>
                        </div>

                        <div className="roles-table-wrap">
                          <table className="roles-table">
                            <thead>
                              <tr>
                                <th>Permission</th>
                                <th>No Access</th>
                                <th>View</th>
                                <th>Manage</th>
                                <th>Special Controls</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.features.map((feature) => {
                                const level = featureLevel(feature)
                                const hasView = feature.permissions?.some((permission) => permission.action === 'view')
                                const hasManage = feature.permissions?.some((permission) => permission.action === 'manage')
                                const specials = feature.permissions?.filter((permission) => permission.action === 'special') || []

                                return (
                                  <tr key={feature.key}>
                                    <td>
                                      <div className="roles-feature-name">{feature.label}</div>
                                      <div className="roles-feature-desc">{firstDescription(feature)}</div>
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className={`roles-access-btn ${level === 'none' ? 'active' : ''}`}
                                        disabled={!canEditSelected}
                                        onClick={() => setFeatureLevel(feature, 'none')}
                                      >
                                        No Access
                                      </button>
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className={`roles-access-btn ${level === 'view' ? 'active' : ''}`}
                                        disabled={!canEditSelected || !hasView}
                                        onClick={() => setFeatureLevel(feature, 'view')}
                                      >
                                        {hasView ? 'View' : '—'}
                                      </button>
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className={`roles-access-btn ${level === 'manage' ? 'active' : ''}`}
                                        disabled={!canEditSelected || !hasManage}
                                        onClick={() => setFeatureLevel(feature, 'manage')}
                                      >
                                        {hasManage ? 'Manage' : '—'}
                                      </button>
                                    </td>
                                    <td>
                                      <div className="roles-specials">
                                        {specials.length === 0 ? (
                                          <span style={{ color: '#CBD5E1', fontSize: 11 }}>—</span>
                                        ) : specials.map((permission) => {
                                          const ownerOnly = ownerOnlySet.has(permission.permission_key)
                                          const on = draftPermissions.has(permission.permission_key)

                                          if (ownerOnly) {
                                            return (
                                              <span className="roles-special" key={permission.permission_key}>
                                                <span className="roles-owner-only">Owner only</span>
                                                {permission.label}
                                              </span>
                                            )
                                          }

                                          return (
                                            <span className="roles-special" key={permission.permission_key}>
                                              <button
                                                type="button"
                                                className={`roles-switch ${on ? 'on' : ''}`}
                                                disabled={!canEditSelected}
                                                onClick={() => toggleSpecial(feature, permission)}
                                                aria-label={permission.label}
                                              />
                                              {permission.label}
                                            </span>
                                          )
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="roles-main-card">
                <div className="roles-empty">Create or select a role to manage permissions.</div>
              </div>
            )}
          </section>
        </div>
      </div>

      <CreateRoleModal
        open={createOpen}
        saving={creating}
        onClose={() => !creating && setCreateOpen(false)}
        onSubmit={createRole}
      />
    </AdminLayout>
  )
}
