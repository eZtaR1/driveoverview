import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useDriveScanner } from './hooks/useDriveScanner';
import LandingScreen from './components/LandingScreen';
import ScanningScreen from './components/ScanningScreen';
import TreemapScreen from './components/TreemapScreen';

function Inner() {
  const { token, user, login, logout, error: authError } = useGoogleAuth();
  const { state, tree, stats, log, error: scanError, scan, reset } = useDriveScanner();

  // Auto-start scan once we have a token
  useEffect(() => {
    if (token && state === 'idle') scan(token);
  }, [token, state, scan]);

  const handleLogout = () => { reset(); logout(); };
  const handleRescan = () => { reset(); if (token) scan(token); };

  if (!token || state === 'idle') {
    return <LandingScreen onLogin={login} authError={authError} />;
  }

  if (state === 'scanning') {
    return <ScanningScreen stats={stats} log={log} />;
  }

  if (state === 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: '#080d18', color: '#f1f5f9',
        fontFamily: "'DM Mono', monospace",
      }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <p style={{ color: '#f87171', maxWidth: 400, textAlign: 'center', fontSize: 14 }}>
          {scanError}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRescan} style={btn('#1e293b', '#94a3b8')}>↺ Retry</button>
          <button onClick={handleLogout} style={btn('#1e293b', '#64748b')}>Sign out</button>
        </div>
      </div>
    );
  }

  if (state === 'done' && tree) {
    return (
      <TreemapScreen
        tree={tree}
        stats={stats}
        user={user}
        onRescan={handleRescan}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default function App() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080d18', color: '#f1f5f9',
        fontFamily: "'DM Mono', monospace", padding: 24,
      }}>
        <div style={{
          background: '#0d1525', border: '1px solid #f59e0b',
          borderRadius: 10, padding: '24px 32px', maxWidth: 480,
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⚙️</div>
          <h2 style={{ marginBottom: 12, color: '#f59e0b' }}>Configuration Required</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 13 }}>
            Set your Google OAuth Client ID to get started.<br /><br />
            Either set the <code style={{ color: '#f59e0b' }}>VITE_GOOGLE_CLIENT_ID</code> environment variable,
            or edit <code style={{ color: '#f59e0b' }}>src/config.js</code>.<br /><br />
            See <strong>README.md</strong> for full setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Inner />
    </GoogleOAuthProvider>
  );
}

const btn = (bg, color) => ({
  background: bg, border: `1px solid #334155`, borderRadius: 6,
  padding: '8px 16px', fontSize: 12, color,
  cursor: 'pointer', fontFamily: "'DM Mono', monospace",
});
