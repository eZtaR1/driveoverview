import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Treemap from './Treemap';
import { formatBytes, EXT_COLORS, CSS } from '../utils/theme';
import { subtreeSize } from '../utils/treeBuilder';

function countFiles(node) {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countFiles(c), 0);
}

export default function TreemapScreen({ tree, stats, user, onRescan, onLogout }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const [hovered, setHovered] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);   // stack of { name, node }
  const [currentData, setCurrentData] = useState(tree);

  // Keep currentData in sync when tree prop changes (rescan)
  useEffect(() => {
    setCurrentData(tree);
    setBreadcrumb([]);
  }, [tree]);

  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.floor(width), h: Math.max(300, Math.floor(height)) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  
  const currentStats = useMemo(() => {
  if (currentData === tree) return stats;
  return { count: countFiles(currentData), total: subtreeSize(currentData) };
}, [currentData, tree, stats]);

  const drillDown = useCallback((folderData) => {
    setBreadcrumb(b => [...b, { name: currentData.name, node: currentData }]);
    setCurrentData(folderData);
  }, [currentData]);

  const drillTo = useCallback((idx) => {
    if (idx < 0) {
      setCurrentData(tree);
      setBreadcrumb([]);
    } else {
      setCurrentData(breadcrumb[idx].node);
      setBreadcrumb(b => b.slice(0, idx));
    }
  }, [breadcrumb, tree]);

  const HEADER_H = 54;
  const FOOTER_H = 38;
  const BREADCRUMB_H = breadcrumb.length > 0 ? 36 : 0;
  const mapH = dims.h - HEADER_H - FOOTER_H - BREADCRUMB_H - 24;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080d18' }}>
      {/* ── Header ── */}
      <div style={{
        height: HEADER_H, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #1e293b',
        background: '#0a0f1a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <div>
            <span style={{
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #00ff88, #00ccff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>DriveMap</span>
            <span style={{ color: '#475569', fontSize: 11, marginLeft: 8, fontFamily: CSS.mono }}>
              {currentStats.count.toLocaleString()} files · {formatBytes(currentStats.total)}
            </span>
          </div>
        </div>

        {/* Tooltip area */}
        <div style={{ flex: 1, margin: '0 24px' }}>
          {hovered && (
            <div style={{
              background: '#0d1525', borderRadius: 6, padding: '5px 12px',
              border: '1px solid #1e293b', display: 'inline-flex', gap: 12,
              alignItems: 'center', maxWidth: '100%', overflow: 'hidden',
            }}>
              <span style={{ fontSize: 12, color: '#f1f5f9', fontFamily: CSS.mono,
                maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hovered.name}
              </span>
              <span style={{ color: '#334155' }}>·</span>
              <span style={{ fontSize: 12, color: '#00ff88', fontFamily: CSS.mono, whiteSpace: 'nowrap' }}>
                {formatBytes(hovered.size)}
              </span>
              {hovered.path && (
                <span style={{ fontSize: 10, color: '#334155', fontFamily: CSS.mono,
                  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {hovered.path}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.picture && (
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer"
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #334155' }} />
          )}
          <button onClick={onRescan} style={btnStyle('#1e293b', '#94a3b8')}>↺ Rescan</button>
          <button onClick={onLogout} style={btnStyle('#1e293b', '#64748b')}>Sign out</button>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      {breadcrumb.length > 0 && (
        <div style={{
          height: BREADCRUMB_H, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 4,
          background: '#0d1525', borderBottom: '1px solid #1e293b',
          fontFamily: CSS.mono, fontSize: 12,
        }}>
          <button onClick={() => drillTo(-1)} style={crumbBtn()}>My Drive</button>
          {breadcrumb.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#1e293b' }}>/</span>
              <button onClick={() => drillTo(i)} style={crumbBtn()}>{b.name}</button>
            </span>
          ))}
          <span style={{ color: '#1e293b' }}>/</span>
          <span style={{ color: '#f1f5f9' }}>{currentData.name}</span>
        </div>
      )}

      {/* ── Treemap ── */}
      <div ref={containerRef} style={{ flex: 1, padding: '8px 16px 0', overflow: 'hidden' }}>
        <Treemap
          data={currentData}
          width={dims.w - 32}
          height={mapH}
          onHover={setHovered}
          onDrillDown={drillDown}
        />
      </div>

      {/* ── Legend / footer ── */}
      <div style={{
        height: FOOTER_H, flexShrink: 0,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '0 16px', gap: 10,
        borderTop: '1px solid #0f1f35',
      }}>
        {Object.entries(EXT_COLORS)
          .filter(([ext]) => ['pdf','docx','xlsx','pptx','jpg','mp4','mp3','zip','py','html'].includes(ext))
          .map(([ext, color]) => (
            <div key={ext} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 10, color: '#475569', fontFamily: CSS.mono }}>.{ext}</span>
            </div>
          ))}
        <div style={{ marginLeft: 'auto', fontSize: 10, color: '#1e293b', fontFamily: CSS.mono }}>
          click folders to drill down
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg, color) => ({
  background: bg, border: `1px solid ${bg}`, borderRadius: 5,
  padding: '5px 10px', fontSize: 11, color,
  cursor: 'pointer', fontFamily: CSS.mono,
  transition: 'border-color 0.15s',
});

const crumbBtn = () => ({
  background: 'none', border: 'none',
  color: '#475569', cursor: 'pointer',
  fontFamily: CSS.mono, fontSize: 12, padding: 2,
  textDecoration: 'underline', textDecorationColor: '#1e293b',
});
