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

function getExistingToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '';
}

function getFriendlyError(message) {
  if (!message) return 'Login failed. Please try again.';

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid admin email') || lowerMessage.includes('invalid admin login')) {
    return 'Email or password is incorrect.';
  }

  if (lowerMessage.includes('environment') || lowerMessage.includes('configured') || lowerMessage.includes('missing')) {
    return 'Admin login is not configured correctly on the backend.';
  }

  return message;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const existingToken = getExistingToken();
  const rememberedEmail = localStorage.getItem('shadow_admin_email') || '';

  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail));
  const [rememberLogin, setRememberLogin] = useState(Boolean(localStorage.getItem('shadow_admin_token')));
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

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanVerifyInput = verifyInput.trim().toUpperCase();

    if (!cleanEmail) {
      setError('Please enter your admin email.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    if (!cleanVerifyInput) {
      setError('Please enter the verify code.');
      return;
    }

    if (cleanVerifyInput !== verifyCode) {
      setError('Verify code is incorrect. Please type the code shown in the box.');
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
          email: cleanEmail,
          password,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok || !data?.token) {
        setError(getFriendlyError(data?.message));
        refreshVerifyCode();
        return;
      }

      if (rememberEmail || rememberLogin) {
        localStorage.setItem('shadow_admin_email', cleanEmail);
      } else {
        localStorage.removeItem('shadow_admin_email');
      }

      sessionStorage.setItem('shadow_admin_token', data.token);

      if (rememberLogin) {
        localStorage.setItem('shadow_admin_token', data.token);
      } else {
        localStorage.removeItem('shadow_admin_token');
      }

      navigate('/admin', { replace: true });
    } catch (error) {
      setError('Cannot connect to backend API. Please check VITE_API_URL or backend status.');
      refreshVerifyCode();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>SHADOW ADMIN</div>

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

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
            />
            <span>Keep me signed in on this device</span>
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
    padding: '0 0 18px',
    color: '#111827',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.4,
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
    background: '#000000',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
    boxShadow: '0 12px 26px rgba(0,0,0,0.22)',
  },
};
