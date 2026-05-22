import { CSS } from '../utils/theme';

const FEATURES = [
  ['📦', 'Full Drive scan', 'Indexes every file across all folders'],
  ['🎨', 'Type color-coding', 'PDFs, videos, images, code — each a distinct color'],
  ['🔍', 'Drill-down', 'Click any folder to zoom in, breadcrumb to navigate back'],
  ['🔒', 'Private by design', 'OAuth read-only scope; nothing leaves your browser'],
];

export default function LandingScreen({ onLogin, authError }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at 60% 40%, #0d2040 0%, #080d18 70%)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontSize: 56,
          lineHeight: 1,
          marginBottom: 16,
          filter: 'drop-shadow(0 0 24px rgba(0,255,136,0.4))',
        }}>📊</div>
        <h1 style={{
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #00ff88, #00ccff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>DriveMap</h1>
        <p style={{ color: '#64748b', fontSize: 15, fontFamily: CSS.mono }}>
          WinDirStat for Google Drive
        </p>
      </div>

      {/* Feature grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        maxWidth: 480,
        width: '100%',
        marginBottom: 40,
      }}>
        {FEATURES.map(([icon, title, desc]) => (
          <div key={title} style={{
            background: '#0d1525',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Sign in button */}
      <button
        onClick={onLogin}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fff', border: 'none', borderRadius: 10,
          padding: '13px 28px', cursor: 'pointer',
          fontSize: 15, fontWeight: 600,
          color: '#1a1a1a', fontFamily: CSS.sans,
          boxShadow: '0 4px 24px rgba(0,255,136,0.15)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,136,0.25)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,255,136,0.15)'; }}
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      {authError && (
        <p style={{ marginTop: 16, color: '#f87171', fontSize: 13 }}>⚠ {authError}</p>
      )}

      <p style={{ marginTop: 24, color: '#334155', fontSize: 11, fontFamily: CSS.mono, textAlign: 'center', maxWidth: 340 }}>
        Uses read-only Drive metadata scope. No file contents are accessed.<br />
        Nothing is stored or sent to any server.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
