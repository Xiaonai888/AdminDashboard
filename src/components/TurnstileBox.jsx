import React, { useEffect, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();

  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function TurnstileBox({ onTokenChange, resetKey = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    onTokenChange('');
    setError('');

    if (!SITE_KEY) {
  setError('Missing VITE_TURNSTILE_SITE_KEY in AdminDashboard frontend build.');
  return undefined;
}
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'light',
          callback(token) {
            onTokenChange(token || '');
          },
          'expired-callback'() {
            onTokenChange('');
          },
          'error-callback'() {
            onTokenChange('');
            setError('Security check failed. Please refresh and try again.');
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError('Security check could not load.');
      });

    return () => {
      cancelled = true;

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, resetKey]);

  return (
    <div style={styles.wrap}>
      <div ref={containerRef} />
      {error ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'grid',
    gap: 8,
    minHeight: 65,
  },
  error: {
    borderRadius: 12,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 700,
  },
};
