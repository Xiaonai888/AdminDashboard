import React, { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import TurnstileBox from '../components/TurnstileBox';

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

function getPasskeyToken(data) {
  return data?.passkey_token || data?.passkeyToken || data?.passkey_challenge?.token || '';
}

function cleanPin(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 6);
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
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [pendingTwoFactor, setPendingTwoFactor] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingPasskeyPin, setPendingPasskeyPin] = useState(null);
  const [passkeyPin, setPasskeyPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const verifyCodeDisplay = useMemo(() => verifyCode.split('').join('  '), [verifyCode]);
  const handleTurnstileToken = useCallback((token) => setTurnstileToken(token), []);

  const canUseEmailCode = useMemo(() => {
    const methods = pendingTwoFactor?.methods || [];
    return methods.includes('email_code') || methods.includes('email_otp');
  }, [pendingTwoFactor]);

  if (existingToken) {
    return <Navigate to="/admin" replace />;
  }

  function refreshVerifyCode() {
    setVerifyCode(makeVerifyCode());
    setVerifyInput('');
  }

  function resetSecurityCheck() {
    setTurnstileToken('');
    setTurnstileResetKey((value) => value + 1);
  }

  function saveLoginSession({ token, admin, cleanEmail }) {
    if (rememberEmail || rememberLogin) {
      localStorage.setItem('shadow_admin_email', cleanEmail);
    } else {
      localStorage.removeItem('shadow_admin_email');
    }

    sessionStorage.setItem('shadow_admin_token', token);
    sessionStorage.setItem('shadow_admin_user', JSON.stringify(admin || {}));

    if (rememberLogin) {
      localStorage.setItem('shadow_admin_token', token);
      localStorage.setItem('shadow_admin_user', JSON.stringify(admin || {}));
    } else {
      localStorage.removeItem('shadow_admin_token');
      localStorage.removeItem('shadow_admin_user');
    }
  }

  function startPasskeyPin(data, cleanEmail) {
    const passkeyToken = getPasskeyToken(data);

    if (!passkeyToken) {
      setError('Passkey PIN challenge was not returned. Please login again.');
      return false;
    }

    setPendingPasskeyPin({
      passkeyToken,
      admin: data.admin || {},
      email: cleanEmail,
      twoFactor: data.two_factor || null,
      expiresInSeconds: data.passkey_challenge?.expires_in_seconds || 300,
    });
    setPendingTwoFactor(null);
    setTwoFactorCode('');
    setPasskeyPin('');
    setError('');
    setMessage('');

    return true;
  }

  function cancelTwoFactor() {
    setPendingTwoFactor(null);
    setTwoFactorCode('');
    setPassword('');
    refreshVerifyCode();
    resetSecurityCheck();
    setError('');
    setMessage('');
  }

  function cancelPasskeyPin() {
    setPendingPasskeyPin(null);
    setPasskeyPin('');
    setPendingTwoFactor(null);
    setTwoFactorCode('');
    setPassword('');
    refreshVerifyCode();
    resetSecurityCheck();
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

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
      resetSecurityCheck();
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          turnstileToken,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok) {
        setError(getFriendlyError(data?.message));
        refreshVerifyCode();
        resetSecurityCheck();
        return;
      }

      if (data.two_factor_required) {
        setPendingTwoFactor({
          challengeId: data.challenge_id || '',
          expiresAt: data.expires_at || '',
          methods: Array.isArray(data.methods) ? data.methods : [],
          admin: data.admin || {},
          email: cleanEmail,
        });
        setTwoFactorCode('');
        setPendingPasskeyPin(null);
        setPasskeyPin('');
        setError('');
        setMessage('');
        return;
      }

      if (data.passkey_pin_required) {
        startPasskeyPin(data, cleanEmail);
        return;
      }

      if (!data?.token) {
        setError('Admin token was not returned. Please try again.');
        refreshVerifyCode();
        resetSecurityCheck();
        return;
      }

      saveLoginSession({
        token: data.token,
        admin: data.admin || {},
        cleanEmail,
      });

      navigate('/admin', { replace: true });
    } catch {
      setError('Cannot connect to backend API. Please check VITE_API_URL or backend status.');
      refreshVerifyCode();
      resetSecurityCheck();
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailCode() {
    if (!pendingTwoFactor?.challengeId) {
      setError('2FA challenge is missing. Please login again.');
      return;
    }

    setError('');
    setMessage('');

    try {
      setEmailSending(true);

      const response = await fetch(`${API_URL}/api/auth/login/2fa/email/send`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: pendingTwoFactor.challengeId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        setError(getFriendlyError(data?.message || 'Failed to send email code.'));
        return;
      }

      setMessage('Email code sent. Check your admin email and enter the 6-digit code.');
    } catch {
      setError('Cannot send email code right now. Please try again.');
    } finally {
      setEmailSending(false);
    }
  }

  async function handleTwoFactorSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const code = twoFactorCode.trim();

    if (!pendingTwoFactor?.challengeId) {
      setError('2FA challenge is missing. Please login again.');
      cancelTwoFactor();
      return;
    }

    if (!code) {
      setError('Please enter your authenticator code, email code, or recovery code.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login/2fa/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: pendingTwoFactor.challengeId,
          code,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok) {
        setError(getFriendlyError(data?.message || '2FA verification failed.'));
        return;
      }

      if (data.passkey_pin_required) {
        startPasskeyPin(data, pendingTwoFactor.email || email.trim());
        return;
      }

      if (!data?.token) {
        setError('Admin token was not returned. Please try again.');
        return;
      }

      saveLoginSession({
        token: data.token,
        admin: data.admin || {},
        cleanEmail: pendingTwoFactor.email || email.trim(),
      });

      setPendingTwoFactor(null);
      setTwoFactorCode('');
      navigate('/admin', { replace: true });
    } catch {
      setError('Cannot verify 2FA right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasskeyPinSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const pin = cleanPin(passkeyPin);

    if (!pendingPasskeyPin?.passkeyToken) {
      setError('Passkey PIN challenge is missing. Please login again.');
      cancelPasskeyPin();
      return;
    }

    if (pin.length !== 6) {
      setError('Please enter your 6-digit Passkey PIN.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login/passkey-pin/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passkeyToken: pendingPasskeyPin.passkeyToken,
          pin,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok || !data?.token) {
        setError(getFriendlyError(data?.message || 'Passkey PIN verification failed.'));
        return;
      }

      saveLoginSession({
        token: data.token,
        admin: data.admin || {},
        cleanEmail: pendingPasskeyPin.email || email.trim(),
      });

      setPendingPasskeyPin(null);
      setPasskeyPin('');
      navigate('/admin', { replace: true });
    } catch {
      setError('Cannot verify Passkey PIN right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        <div style={styles.brand}>SHADOW ADMIN</div>

        {pendingPasskeyPin ? (
          <>
            <h1 style={styles.title}>Passkey PIN</h1>
            <p style={styles.subtitle}>Enter your 6-digit Admin Passkey PIN to finish login.</p>

            <form onSubmit={handlePasskeyPinSubmit} style={styles.form}>
              <div style={styles.infoBox}>
                <strong>PIN required</strong>
                <span>{pendingPasskeyPin.admin?.email || pendingPasskeyPin.email}</span>
              </div>

              <label style={styles.label}>
                6-digit Passkey PIN
                <input
                  style={{ ...styles.input, textAlign: 'center', letterSpacing: 6, fontWeight: 900 }}
                  type="password"
                  value={passkeyPin}
                  onChange={(event) => setPasskeyPin(cleanPin(event.target.value))}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </label>

              <div style={styles.hintBox}>
                This PIN expires soon with your login challenge. If it fails, go back and login again.
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}
              {message ? <div style={styles.successBox}>{message}</div> : null}

              <button
                type="submit"
                disabled={loading || passkeyPin.length !== 6}
                style={{
                  ...styles.loginButton,
                  opacity: loading || passkeyPin.length !== 6 ? 0.72 : 1,
                  cursor: loading || passkeyPin.length !== 6 ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Verifying...' : 'Verify PIN'}
              </button>

              <button
                type="button"
                onClick={cancelPasskeyPin}
                style={styles.secondaryButton}
                disabled={loading}
              >
                Back to login
              </button>
            </form>
          </>
        ) : pendingTwoFactor ? (
          <>
            <h1 style={styles.title}>Two-Factor Verification</h1>
            <p style={styles.subtitle}>
              Enter the 6-digit code from Google Authenticator, your email code, or one recovery code.
            </p>

            <form onSubmit={handleTwoFactorSubmit} style={styles.form}>
              <div style={styles.infoBox}>
                <strong>2FA required</strong>
                <span>{pendingTwoFactor.admin?.email || pendingTwoFactor.email}</span>
              </div>

              {canUseEmailCode ? (
                <button
                  type="button"
                  onClick={sendEmailCode}
                  style={styles.emailButton}
                  disabled={emailSending || loading}
                >
                  {emailSending ? 'Sending email code...' : 'Send email code'}
                </button>
              ) : null}

              <label style={styles.label}>
                2FA code
                <input
                  style={styles.input}
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value)}
                  placeholder="123456 or XXXX-XXXX-XXXX-XXXX"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </label>

              {pendingTwoFactor.expiresAt ? (
                <div style={styles.hintBox}>
                  This verification expires soon. If it fails, go back and login again.
                </div>
              ) : null}

              {error ? <div style={styles.errorBox}>{error}</div> : null}
              {message ? <div style={styles.successBox}>{message}</div> : null}

              <button
                type="submit"
                disabled={loading || !twoFactorCode.trim()}
                style={{
                  ...styles.loginButton,
                  opacity: loading || !twoFactorCode.trim() ? 0.72 : 1,
                  cursor: loading || !twoFactorCode.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Verifying...' : 'Verify 2FA'}
              </button>

              <button
                type="button"
                onClick={cancelTwoFactor}
                style={styles.secondaryButton}
                disabled={loading}
              >
                Back to login
              </button>
            </form>
          </>
        ) : (
          <>
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

              <TurnstileBox onTokenChange={handleTurnstileToken} resetKey={turnstileResetKey} />

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
              {message ? <div style={styles.successBox}>{message}</div> : null}

              <button
                type="submit"
                disabled={loading || !turnstileToken}
                style={{
                  ...styles.loginButton,
                  opacity: loading || !turnstileToken ? 0.72 : 1,
                  cursor: loading || !turnstileToken ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Checking...' : 'Sign In'}
              </button>
            </form>
          </>
        )}
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
    lineHeight: 1.55,
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
  infoBox: {
    display: 'grid',
    gap: 4,
    padding: '13px 14px',
    borderRadius: 14,
    background: '#EEF2FF',
    border: '1px solid #C7D2FE',
    color: '#3730A3',
    fontSize: 13,
    fontWeight: 800,
  },
  hintBox: {
    padding: '11px 13px',
    borderRadius: 14,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    color: '#64748B',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
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
  successBox: {
    padding: '12px 14px',
    borderRadius: 14,
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#047857',
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
  emailButton: {
    border: 0,
    borderRadius: 16,
    padding: '14px 18px',
    background: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid #CBD5E1',
    borderRadius: 16,
    padding: '13px 18px',
    background: '#FFFFFF',
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
  },
};
