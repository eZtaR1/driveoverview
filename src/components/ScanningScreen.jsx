import { useEffect, useState } from 'react';
import { formatBytes, CSS } from '../utils/theme';

export default function ScanningScreen({ stats, log }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#080d18',
    }}>
      {/* Animated radar */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
        <svg width="80" height="80" style={{ position: 'absolute' }}>
          {[1, 2, 3].map(i => (
            <circle key={i} cx="40" cy="40" r={12 * i} fill="none"
              stroke="#00ff88" strokeWidth="1" opacity={0.2 / i} />
          ))}
          <circle cx="40" cy="40" r="4" fill="#00ff88" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,255,136,0.4) 360deg)',
          animation: 'spin 2s linear infinite',
        }} />
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        `}</style>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, fontFamily: CSS.mono }}>
        Scanning Drive{dots}
      </h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32, fontFamily: CSS.mono }}>
        {stats.count > 0
          ? `${stats.count.toLocaleString()} files found · ${formatBytes(stats.total)}`
          : 'Connecting…'}
      </p>

      {/* Log console */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0d1525',
        border: '1px solid #1e293b',
        borderRadius: 10,
        padding: 16,
        fontFamily: CSS.mono,
        fontSize: 11,
      }}>
        <div style={{ color: '#334155', marginBottom: 8, fontSize: 10, letterSpacing: '0.1em' }}>
          CONSOLE OUTPUT
        </div>
        {log.length === 0 && (
          <div style={{ color: '#475569' }}>{'>'} Initializing…</div>
        )}
        {log.map((line, i) => (
          <div key={i} style={{
            color: i === log.length - 1 ? '#00ff88' : '#475569',
            marginBottom: 2,
            transition: 'color 0.3s',
          }}>
            {'>'} {line}
          </div>
        ))}
      </div>
    </div>
  );
}
