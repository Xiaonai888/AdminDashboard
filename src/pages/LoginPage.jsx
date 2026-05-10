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
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <main style={styles.card}>
        <section style={styles.brandPanel}>
          <div style={styles.badge}>SHADOW ADMIN</div>
          <h1 style={styles.title}>Secure Dashboard Access</h1>
          <p style={styles.subtitle}>
            Manage homepage content, visual sections, and publishing controls from one protected admin space.
          </p>

          <div style={styles.securityBox}>
            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>🔐</span>
              Token protected admin session
            </div>
            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>🛡️</span>
              Basic bot verification enabled
            </div>
            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>👁️</span>
              Password visibility control
            </div>
          </div>
        </section>

        <section style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Admin Login</h2>
            <p style={styles.formText}>Enter your private admin credentials.</p>
          </div>

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

            <button type="submit" disabled={loading} style={{
              ...styles.loginButton,
              opacity: loading ? 0.72 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #060816 0%, #111827 45%, #1E1B4B 100%)',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#F8FAFC',
  },
  glowOne: {
    position: 'absolute',
    width: 360,
    height: 360,
    left: -120,
    top: -80,
    borderRadius: '50%',
    background: 'rgba(99,102,241,0.26)',
    filter: 'blur(40px)',
  },
  glowTwo: {
    position: 'absolute',
    width: 420,
    height: 420,
    right: -160,
    bottom: -120,
    borderRadius: '50%',
    background: 'rgba(236,72,153,0.22)',
    filter: 'blur(48px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: 'min(980px, 100%)',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    background: 'rgba(15,23,42,0.78)',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: 28,
    boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    backdropFilter: 'blur(18px)',
  },
  brandPanel: {
    padding: 42,
    background: 'linear-gradient(160deg, rgba(30,41,59,0.76), rgba(15,23,42,0.2))',
    borderRight: '1px solid rgba(148,163,184,0.18)',
  },
  badge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: 999,
    background: 'rgba(99,102,241,0.16)',
    border: '1px solid rgba(129,140,248,0.34)',
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.2,
  },
  title: {
    margin: '26px 0 14px',
    fontSize: 42,
    lineHeight: 1.04,
    letterSpacing: -1.2,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 1.75,
    maxWidth: 430,
  },
  securityBox: {
    marginTop: 34,
    display: 'grid',
    gap: 12,
  },
  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#E2E8F0',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '13px 14px',
    fontSize: 14,
  },
  securityIcon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
  },
  formPanel: {
    padding: 42,
    background: 'rgba(248,250,252,0.98)',
    color: '#0F172A',
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 28,
    margin: 0,
    letterSpacing: -0.6,
  },
  formText: {
    margin: '8px 0 0',
    color: '#64748B',
  },
  form: {
    display: 'grid',
    gap: 17,
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
