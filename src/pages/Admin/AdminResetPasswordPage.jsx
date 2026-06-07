import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TurnstileBox from '../../components/TurnstileBox';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

export default function AdminResetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTurnstileToken = useCallback((token) => setTurnstileToken(token), []);

  function resetSecurityCheck() {
    setTurnstileToken('');
    setTurnstileResetKey((value) => value + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError('Please enter your admin email.');
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          newPassword,
          confirmPassword,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.message || 'Failed to reset admin password.');
        resetSecurityCheck();
        return;
      }

      setMessage('Admin password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch {
      setError('Cannot connect to backend API.');
      resetSecurityCheck();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>SHADOW ADMIN</div>
        <h1 style={styles.title}>Confirm Reset Code</h1>
        <p style={styles.subtitle}>Enter the code from email and set a new admin password.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Admin Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            6-Digit Code
            <input
              style={styles.input}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>

          <label style={styles.label}>
            New Password
            <div style={styles.passwordWrap}>
              <input
                style={{ ...styles.input, paddingRight: 54 }}
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                style={styles.eyeButton}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label style={styles.label}>
            Confirm New Password
            <input
              style={styles.input}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </label>

          <TurnstileBox onTokenChange={handleTurnstileToken} resetKey={turnstileResetKey} />

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {message ? <div style={styles.successBox}>{message}</div> : null}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            style={{
              ...styles.primaryButton,
              opacity: loading || !turnstileToken ? 0.72 : 1,
              cursor: loading || !turnstileToken ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <Link to="/admin-secret-reset/request" style={styles.link}>
            Request a new code
          </Link>
        </form>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #0F172A 0%, #111827 48%, #1E1B4B 100%)',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#0F172A',
  },
  card: {
    width: 'min(420px, 100%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 22,
    padding: 34,
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
  },
  brand: {
    display: 'inline-flex',
    borderRadius: 999,
    background: '#EEF2FF',
    color: '#3730A3',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.8,
    padding: '8px 12px',
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: '#0F172A',
  },
  subtitle: {
    margin: '8px 0 24px',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 1.6,
  },
  form: {
    display: 'grid',
    gap: 16,
  },
  label: {
    display: 'grid',
    gap: 8,
    color: '#334155',
    fontSize: 13,
    fontWeight: 800,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #CBD5E1',
    borderRadius: 14,
    padding: '13px 14px',
    fontSize: 14,
    outline: 'none',
    background: '#FFFFFF',
    color: '#0F172A',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 0,
    background: 'transparent',
    fontSize: 18,
    cursor: 'pointer',
    width: 40,
    height: 40,
  },
  primaryButton: {
    width: '100%',
    border: 0,
    borderRadius: 14,
    padding: '14px 16px',
    background: '#111827',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
  },
  errorBox: {
    borderRadius: 14,
    background: '#FEF2F2',
    color: '#B91C1C',
    border: '1px solid #FECACA',
    padding: '11px 12px',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
  },
  successBox: {
    borderRadius: 14,
    background: '#ECFDF5',
    color: '#047857',
    border: '1px solid #A7F3D0',
    padding: '11px 12px',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
  },
  link: {
    textAlign: 'center',
    color: '#3730A3',
    fontSize: 13,
    fontWeight: 800,
    textDecoration: 'none',
  },
};
