import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

function getStoredAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '';
}

function clearAdminSession() {
  sessionStorage.removeItem('shadow_admin_token');
  sessionStorage.removeItem('shadow_admin_user');
  localStorage.removeItem('shadow_admin_token');
  localStorage.removeItem('shadow_admin_user');
}

function syncSessionToken(token) {
  if (token && !sessionStorage.getItem('shadow_admin_token')) {
    sessionStorage.setItem('shadow_admin_token', token);
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState(() => (getStoredAdminToken() ? 'checking' : 'missing'));

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminSession() {
      const token = getStoredAdminToken();

      if (!token) {
        clearAdminSession();

        if (!cancelled) {
          setStatus('missing');
        }

        return;
      }

      syncSessionToken(token);

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok || !data?.ok) {
          clearAdminSession();
          setStatus('invalid');
          return;
        }

        sessionStorage.setItem('shadow_admin_user', JSON.stringify(data.admin || {}));
        setStatus('valid');
      } catch {
        if (cancelled) return;

        clearAdminSession();
        setStatus('invalid');
      }
    }

    setStatus(getStoredAdminToken() ? 'checking' : 'missing');
    verifyAdminSession();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

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
