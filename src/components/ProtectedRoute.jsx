import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      const token = sessionStorage.getItem('shadow_admin_token');

      if (!token) {
        localStorage.removeItem('shadow_admin_token');
        if (isMounted) setStatus('guest');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          sessionStorage.removeItem('shadow_admin_token');
          localStorage.removeItem('shadow_admin_token');
          if (isMounted) setStatus('guest');
          return;
        }

        if (isMounted) setStatus('allowed');
      } catch (error) {
        sessionStorage.removeItem('shadow_admin_token');
        localStorage.removeItem('shadow_admin_token');
        if (isMounted) setStatus('guest');
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
