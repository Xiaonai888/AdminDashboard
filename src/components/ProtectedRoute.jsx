import React from 'react';
import { Navigate } from 'react-router-dom';

function getAdminToken() {
  const sessionToken = sessionStorage.getItem('shadow_admin_token') || '';
  const localToken = localStorage.getItem('shadow_admin_token') || '';
  const token = sessionToken || localToken;

  if (token && !sessionToken) {
    sessionStorage.setItem('shadow_admin_token', token);
  }

  return token;
}

export default function ProtectedRoute({ children }) {
  const token = getAdminToken();

  if (!token) {
    sessionStorage.removeItem('shadow_admin_token');
    localStorage.removeItem('shadow_admin_token');
    return <Navigate to="/login" replace />;
  }

  return children;
}
