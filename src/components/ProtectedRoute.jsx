import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

function getAdminToken() {
  const sessionToken = sessionStorage.getItem('shadow_admin_token') || '';
  const localToken = localStorage.getItem('shadow_admin_token') || '';
  const token = sessionToken || localToken;

  if (token && !sessionToken) {
    sessionStorage.setItem('shadow_admin_token', token);
  }

  return token;
}

function clearAdminToken() {
  sessionStorage.removeItem('shadow_admin_token');
  localStorage.removeItem('shadow_admin_token');
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      const token = getAdminToken();

      if (!token) {
        clearAdminToken();
        if (isMounted) setStatus('guest');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          clearAdminToken();
          if (isMounted) setStatus('guest');
          return;
        }

        if (!response.ok || data.ok === false) {
          if (isMounted) setStatus('allowed');
          return;
        }

        if (isMounted) setStatus('allowed');
      } catch (error) {
        if (isMounted) setStatus('allowed');
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#F8FAFC',
        color: '#0F172A',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        Checking admin access...
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
