import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

export default function ChangePasswordPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const token = sessionStorage.getItem('shadow_admin_token')

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to validate password change')
      }

      setMessage(
        data.message ||
          'Password validation passed. Update ADMIN_PASSWORD in Render environment variables, then redeploy backend.'
      )

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to validate password change')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('shadow_admin_token')
    localStorage.removeItem('shadow_admin_token')
    navigate('/login', { replace: true })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button type="button" style={styles.backButton} onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div style={styles.iconBox}>🔐</div>
          <div>
            <h1 style={styles.title}>Change Admin Password</h1>
            <p style={styles.subtitle}>
              Validate your current password before updating ADMIN_PASSWORD in Render.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Current Password
            <input
              style={styles.input}
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </label>

          <label style={styles.label}>
            New Password
            <input
              style={styles.input}
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </label>

          <label style={styles.label}>
            Confirm New Password
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </label>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {message ? <div style={styles.successBox}>{message}</div> : null}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Checking...' : 'Validate Password Change'}
          </button>

          <button type="button" style={styles.logoutButton} onClick={handleLogout}>
            Logout After Render Password Update
          </button>
        </form>

        <div style={styles.noteBox}>
          <strong>Important:</strong> This page validates the password only. After success, go to
          Render → Shadow-Backend → Environment → update ADMIN_PASSWORD → redeploy backend.
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: 'Inter, sans-serif',
    color: '#0F172A',
  },
  card: {
    width: 'min(540px, 100%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
  },
  backButton: {
    border: 'none',
    background: '#EEF2FF',
    color: '#4F46E5',
    padding: '9px 13px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 22,
  },
  header: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    fontSize: 13,
    fontWeight: 700,
    color: '#334155',
  },
  input: {
    height: 46,
    border: '1.5px solid #E2E8F0',
    borderRadius: 12,
    padding: '0 14px',
    fontSize: 14,
    outline: 'none',
    color: '#0F172A',
    background: '#FFFFFF',
  },
  submitButton: {
    height: 48,
    border: 'none',
    borderRadius: 12,
    background: '#4F46E5',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 6,
  },
  logoutButton: {
    height: 44,
    border: '1px solid #FCA5A5',
    borderRadius: 12,
    background: '#FEF2F2',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
  },
  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  successBox: {
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#047857',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  noteBox: {
    marginTop: 18,
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    color: '#92400E',
    borderRadius: 12,
    padding: 13,
    fontSize: 13,
    lineHeight: 1.6,
  },
}
