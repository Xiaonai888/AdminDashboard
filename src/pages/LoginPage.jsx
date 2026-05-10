import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

function makeVerifyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 5; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const existingToken = localStorage.getItem('shadow_admin_token') || sessionStorage.getItem('shadow_admin_token');
  const rememberedEmail = localStorage.getItem('shadow_admin_email') || '';

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState(() => makeVerifyCode());
  const [verifyInput, setVerifyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyCodeDisplay = useMemo(() => verifyCode.split('').join('  '), [verifyCode]);

  if (existingToken) {
    return <Navigate to="/admin" replace />;
  }

  function refreshVerifyCode() {
    setVerifyCode(makeVerifyCode());
    setVerifyInput('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter admin email and password.');
      return;
    }

    if (verifyInput.trim().toUpperCase() !== verifyCode) {
      setError('Verification code is incorrect.');
      refreshVerifyCode();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok || !data.token) {
        setError(data.message || 'Login failed.');
        refreshVerifyCode();
        return;
      }

      if (rememberEmail) {
        localStorage.setItem('shadow_admin_email', email.trim());
        localStorage.setItem('shadow_admin_token', data.token);
        sessionStorage.removeItem('shadow_admin_token');
      } else {
        localStorage.removeItem('shadow_admin_email');
        sessionStorage.setItem('shadow_admin_token', data.token);
        localStorage.removeItem('shadow_admin_token');
      }

      navigate('/admin', { replace: true });
    } catch (error) {
      setError('Cannot connect to backend API.');
      refreshVerifyCode();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>SHADOW ADMIN</div>

        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Enter your admin credentials to continue.</p>

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
            Password
            <div style={styles.passwordWrap}>
              <input
                style={{ ...styles.input, paddingRight: 54 }}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
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
            Verify Code
            <div style={styles.verifyRow}>
              <div style={styles.verifyCode}>{verifyCodeDisplay}</div>
              <button type="button" onClick={refreshVerifyCode} style={styles.refreshButton}>
                ↻
              </button>
            </div>
            <input
              style={styles.input}
              value={verifyInput}
              onChange={(event) => setVerifyInput(event.target.value)}
              placeholder="Type the code above"
              autoComplete="off"
            />
          </label>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(event) => setRememberEmail(event.target.checked)}
            />
            <span>Remember email only</span>
          </label>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.72 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #0F172A 0%, #111827 45%, #1E1B4B 100%)',
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
  logo: {
    display: 'inline-flex',
    padding: '7px 11px',
    borderRadius: 999,
    background: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: -0.7,
  },
  subtitle: {
    margin: '8px 0 26px',
    color: '#64748B',
    fontSize: 14,
  },
  form: {
    display: 'grid',
    gap: 16,
  },
  label: {
    display: 'grid',
    gap: 8,
    fontSize: 13,
    fontWeight: 800,
    color: '#334155',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#0F172A',
    borderRadius: 14,
    padding: '14px 15px',
    fontSize: 14,
    outline: 'none',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 36,
    border: 0,
    borderRadius: 12,
    background: '#F1F5F9',
    cursor: 'pointer',
  },
  verifyRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 46px',
    gap: 8,
  },
  verifyCode: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 48,
    borderRadius: 14,
    color: '#111827',
    fontWeight: 900,
    letterSpacing: 4,
    background: 'repeating-linear-gradient(-35deg, #F8FAFC 0px, #F8FAFC 8px, #E2E8F0 8px, #E2E8F0 10px)',
    border: '1px dashed #94A3B8',
    userSelect: 'none',
  },
  refreshButton: {
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#0F172A',
    borderRadius: 14,
    fontSize: 20,
    cursor: 'pointer',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    color: '#475569',
    fontSize: 14,
    userSelect: 'none',
  },
  errorBox: {
    padding: '12px 14px',
    borderRadius: 14,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: 700,
  },
  loginButton: {
    marginTop: 2,
    border: 0,
    borderRadius: 16,
    padding: '15px 18px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
    boxShadow: '0 12px 26px rgba(79,70,229,0.32)',
  },
};
