import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter your admin email.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/admin-forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.message || 'Failed to request reset code.');
        return;
      }

      setSentEmail(cleanEmail);
      setMessage('If this admin email exists, a reset code has been sent.');
    } catch {
      setError('Cannot connect to backend API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>SHADOW ADMIN</div>
        <h1 style={styles.title}>Reset Admin Password</h1>
        <p style={styles.subtitle}>Enter your admin email to receive a reset code.</p>

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

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {message ? <div style={styles.successBox}>{message}</div> : null}

          {sentEmail ? (
            <Link
              to={`/admin-secret-reset/confirm?email=${encodeURIComponent(sentEmail)}`}
              style={styles.continueButton}
            >
              Continue to Reset Password
            </Link>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.72 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : sentEmail ? 'Send Code Again' : 'Send Reset Code'}
          </button>

          <Link to="/admin-secret-reset/confirm" style={styles.link}>
            I already have a code
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
  primaryButton: {
    width: '100%',
    border: 0,
    borderRadius: 14,
    padding: '14px 16px',
    background: '#111827',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    boxSizing: 'border-box',
    border: 0,
    borderRadius: 14,
    padding: '14px 16px',
    background: '#3730A3',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
    textAlign: 'center',
    textDecoration: 'none',
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
