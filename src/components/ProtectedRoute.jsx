import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';
const ADMIN_SESSION_VERIFY_TTL_MS = 5 * 60 * 1000;

let verifiedToken = '';
let verifiedAt = 0;
let verificationPromise = null;
let verificationToken = '';

function getStoredAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '';
}

function clearAdminSession() {
  sessionStorage.removeItem('shadow_admin_token');
  sessionStorage.removeItem('shadow_admin_user');
  localStorage.removeItem('shadow_admin_token');
  localStorage.removeItem('shadow_admin_user');
  verifiedToken = '';
  verifiedAt = 0;
  verificationPromise = null;
  verificationToken = '';
}

function syncSessionToken(token) {
  if (token && !sessionStorage.getItem('shadow_admin_token')) {
    sessionStorage.setItem('shadow_admin_token', token);
  }
}

function saveRenewedToken(token) {
  if (!token) return '';

  sessionStorage.setItem('shadow_admin_token', token);

  if (localStorage.getItem('shadow_admin_token')) {
    localStorage.setItem('shadow_admin_token', token);
  }

  return token;
}

function hasFreshVerification(token) {
  return Boolean(
    token &&
    token === verifiedToken &&
    Date.now() - verifiedAt < ADMIN_SESSION_VERIFY_TTL_MS
  );
}

function makeSessionError(message, authFailure = false) {
  const error = new Error(message);
  error.authFailure = authFailure;
  return error;
}

function verifyAdminSessionRequest(token) {
  if (
    verificationPromise &&
    verificationToken === token
  ) {
    return verificationPromise;
  }

  verificationToken = token;

  verificationPromise = fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        throw makeSessionError(
          data?.message || 'Admin session verification failed',
          [401, 403, 404].includes(response.status)
        );
      }

      const nextToken = saveRenewedToken(data.token || token);

      sessionStorage.setItem(
        'shadow_admin_user',
        JSON.stringify(data.admin || {})
      );

      if (localStorage.getItem('shadow_admin_token')) {
        localStorage.setItem(
          'shadow_admin_user',
          JSON.stringify(data.admin || {})
        );
      }

      verifiedToken = nextToken;
      verifiedAt = Date.now();

      return data;
    })
    .finally(() => {
      if (verificationToken === token) {
        verificationPromise = null;
        verificationToken = '';
      }
    });

  return verificationPromise;
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(() => {
    const token = getStoredAdminToken();

    if (!token) return 'missing';
    return hasFreshVerification(token) ? 'valid' : 'checking';
  });

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAdminToken();

    if (!token) {
      clearAdminSession();
      setStatus('missing');
      return undefined;
    }

    syncSessionToken(token);

    if (hasFreshVerification(token)) {
      setStatus('valid');
      return undefined;
    }

    setStatus('checking');

    verifyAdminSessionRequest(token)
      .then(() => {
        if (!cancelled) {
          setStatus('valid');
        }
      })
      .catch((error) => {
        if (cancelled) return;

        if (error?.authFailure) {
          clearAdminSession();
          setStatus('invalid');
          return;
        }

        setStatus('valid');
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const verifyOnActivity = () => {
      const token = getStoredAdminToken();

      if (
        !token ||
        hasFreshVerification(token)
      ) {
        return;
      }

      verifyAdminSessionRequest(token)
        .then(() => {
          if (!cancelled) {
            setStatus('valid');
          }
        })
        .catch((error) => {
          if (
            cancelled ||
            !error?.authFailure
          ) {
            return;
          }

          clearAdminSession();
          setStatus('invalid');
        });
    };

    const activityEvents = [
      'pointerdown',
      'keydown',
      'touchstart',
      'scroll',
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        verifyOnActivity,
        { passive: true }
      );
    });

    window.addEventListener(
      'focus',
      verifyOnActivity
    );

    return () => {
      cancelled = true;

      activityEvents.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          verifyOnActivity
        );
      });

      window.removeEventListener(
        'focus',
        verifyOnActivity
      );
    };
  }, []);

  if (status === 'checking') {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.brand}>SHADOW ADMIN</div>
          <div style={styles.title}>Checking admin session...</div>
          <div style={styles.subtitle}>Please wait a moment.</div>
        </div>
      </div>
    );
  }

  if (status === 'missing' || status === 'invalid') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

const styles = {
  loadingPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: '#F8FAFC',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#0F172A',
  },
  loadingCard: {
    width: 'min(360px, 100%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
    textAlign: 'center',
  },
  brand: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 6,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 700,
  },
};
