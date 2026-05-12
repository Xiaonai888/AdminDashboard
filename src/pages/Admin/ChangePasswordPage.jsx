import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function EyeIcon({ hidden = false }) {
  if (hidden) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.7 10.7A2 2 0 0 0 13.3 13.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.88C17 4.88 20.73 8.11 22 12C21.5 13.53 20.55 14.92 19.31 16.03" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.61 6.61C4.44 7.76 2.79 9.66 2 12C3.27 15.89 7 19.12 12 19.12C13.48 19.12 14.84 18.84 16.04 18.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12C3.27 8.11 7 4.88 12 4.88C17 4.88 20.73 8.11 22 12C20.73 15.89 17 19.12 12 19.12C7 19.12 3.27 15.89 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
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

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
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

      setMessage('Password validation passed.')

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

  const PasswordInput = ({ label, name, placeholder, autoComplete }) => (
    <label style={styles.label}>
      {label}
      <div style={styles.passwordWrap}>
        <input
          style={styles.inputWithIcon}
          type={showPassword[name] ? 'text' : 'password'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          style={styles.eyeButton}
          onClick={() => togglePassword(name)}
          aria-label={showPassword[name] ? 'Hide password' : 'Show password'}
          title={showPassword[name] ? 'Hide password' : 'Show password'}
        >
          <EyeIcon hidden={showPassword[name]} />
        </button>
      </div>
    </label>
  )

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button type="button" style={styles.backButton} onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div style={styles.iconBox}>🔐</div>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Change Admin Password</h1>
            <p style={styles.subtitle}>
              Validate your current password before updating it.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <PasswordInput
            label="Current Password"
            name="currentPassword"
            placeholder="Enter current password"
            autoComplete="current-password"
          />

          <PasswordInput
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {message ? <div style={styles.successBox}>{message}</div> : null}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Checking...' : 'Validate Password Change'}
          </button>

          <button type="button" style={styles.logoutButton} onClick={handleLogout}>
            Logout After Render Password Update
          </button>
        </form>
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
    padding: 20,
    fontFamily: 'Inter, sans-serif',
    color: '#0F172A',
  },
  card: {
    width: 'min(520px, 100%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
  },
  backButton: {
    border: 'none',
    background: '#EEF2FF',
    color: '#4F46E5',
    minHeight: 34,
    padding: '0 13px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
  },
  header: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginBottom: 26,
  },
  headerText: {
    minWidth: 0,
  },
  iconBox: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 14,
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 23,
  },
  title: {
    margin: 0,
    fontSize: 23,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#475569',
    fontSize: 14,
    lineHeight: 1.45,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    width: '100%',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    fontSize: 13,
    fontWeight: 800,
    color: '#0F172A',
    width: '100%',
  },
  passwordWrap: {
    position: 'relative',
    width: '100%',
  },
  inputWithIcon: {
    boxSizing: 'border-box',
    width: '100%',
    height: 46,
    border: '1.5px solid #CBD5E1',
    borderRadius: 12,
    padding: '0 50px 0 14px',
    fontSize: 14,
    outline: 'none',
    color: '#0F172A',
    background: '#FFFFFF',
    lineHeight: '46px',
    display: 'block',
  },
  eyeButton: {
    position: 'absolute',
    right: 9,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 34,
    height: 34,
    border: 'none',
    borderRadius: 10,
    background: '#F1F5F9',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  submitButton: {
    width: '100%',
    height: 48,
    border: 'none',
    borderRadius: 12,
    background: '#0F172A',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    padding: 0,
  },
  logoutButton: {
    width: '100%',
    height: 44,
    border: '1px solid #FCA5A5',
    borderRadius: 12,
    background: '#FEF2F2',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    padding: 0,
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
}
