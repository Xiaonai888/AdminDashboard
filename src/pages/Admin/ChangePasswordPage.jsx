import React, { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .password-page {
    max-width: 720px;
    margin: 0 auto;
  }

  .password-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  }

  .password-card-title {
    margin: 0;
    color: #0F172A;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .password-card-subtitle {
    margin: 7px 0 20px;
    color: #64748B;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.6;
  }

  .password-form {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .password-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 13px;
    font-weight: 800;
    color: #0F172A;
    width: 100%;
  }

  .password-wrap {
    position: relative;
    width: 100%;
  }

  .password-input {
    width: 100%;
    height: 46px;
    border: 1.5px solid #CBD5E1;
    border-radius: 12px;
    padding: 0 50px 0 14px;
    font-size: 14px;
    outline: none;
    color: #0F172A;
    background: #FFFFFF;
    line-height: 46px;
    display: block;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .password-input:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.10);
  }

  .eye-button {
    position: absolute;
    right: 9px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 10px;
    background: #F1F5F9;
    color: #475569;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .change-password-button {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    margin-top: 4px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.18);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .change-password-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(15,23,42,0.22);
  }

  .change-password-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .logout-other-button {
    width: 100%;
    height: 44px;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    background: #F8FAFC;
    color: #475569;
    font-size: 13px;
    font-weight: 900;
    cursor: not-allowed;
    opacity: 0.75;
  }

  .password-message {
    border-radius: 12px;
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  .password-message.error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
  }

  .password-message.success {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #047857;
  }

  @media (max-width: 640px) {
    .password-page,
    .password-card,
    .password-form,
    .password-field,
    .password-wrap {
      min-width: 0;
      max-width: 100%;
    }

    .password-card {
      padding: 18px;
      border-radius: 18px;
    }

    .password-card-title {
      font-size: 21px;
      overflow-wrap: anywhere;
    }

    .password-card-subtitle,
    .password-field,
    .password-message {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .password-input,
    .change-password-button,
    .logout-other-button {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .password-input {
      font-size: 16px;
    }

    .eye-button {
      flex-shrink: 0;
      touch-action: manipulation;
    }

    .change-password-button,
    .logout-other-button {
      min-height: 46px;
      height: auto;
      padding: 11px 12px;
      line-height: 1.3;
    }
  }

  @media (max-width: 400px) {
    .password-card {
      padding: 16px 14px;
    }

    .password-input {
      padding-left: 12px;
      padding-right: 48px;
    }
  }
`

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

function PasswordInput({ label, name, value, visible, placeholder, autoComplete, onChange, onToggle }) {
  return (
    <label className="password-field">
      {label}
      <div className="password-wrap">
        <input
          className="password-input"
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          className="eye-button"
          onClick={() => onToggle(name)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </label>
  )
}

export default function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState({ currentPassword: false, newPassword: false, confirmPassword: false })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setMessage('')
    setError('')
  }

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
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
        throw new Error(data.message || 'Failed to change password')
      }

      setMessage(data.message || 'Admin password changed successfully')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout
      title="Change Password"
      subtitle="Update the password used to access Shadow Admin."
    >
      <style>{styles}</style>

      <div className="password-page">
        <section className="password-card">
          <h1 className="password-card-title">Change Password</h1>
          <p className="password-card-subtitle">
            Enter the current password and choose a new secure password for the admin account.
          </p>

          <form onSubmit={handleSubmit} className="password-form">
            <PasswordInput label="Current Password" name="currentPassword" value={form.currentPassword} visible={showPassword.currentPassword} placeholder="Enter current password" autoComplete="current-password" onChange={handleChange} onToggle={togglePassword} />
            <PasswordInput label="New Password" name="newPassword" value={form.newPassword} visible={showPassword.newPassword} placeholder="Enter new password" autoComplete="new-password" onChange={handleChange} onToggle={togglePassword} />
            <PasswordInput label="Confirm New Password" name="confirmPassword" value={form.confirmPassword} visible={showPassword.confirmPassword} placeholder="Confirm new password" autoComplete="new-password" onChange={handleChange} onToggle={togglePassword} />

            {error ? <div className="password-message error">{error}</div> : null}
            {message ? <div className="password-message success">{message}</div> : null}

            <button type="submit" className="change-password-button" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>

            <button type="button" className="logout-other-button" disabled>
              Logout Other Devices
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  )
}
