export const PALETTE = [
  '#00ff88', '#00ccff', '#ff6b35', '#ffd700',
  '#ff4daa', '#a78bfa', '#34d399', '#fb923c',
  '#60a5fa', '#f472b6', '#4ade80', '#facc15',
];

export const EXT_COLORS = {
  // Documents
  pdf: '#ff4d4d', doc: '#2b7cd3', docx: '#2b7cd3',
  odt: '#2b7cd3', rtf: '#2b7cd3',
  // Spreadsheets
  xls: '#217346', xlsx: '#217346', csv: '#217346', ods: '#217346',
  // Presentations
  ppt: '#c43e1c', pptx: '#c43e1c', odp: '#c43e1c',
  // Images
  jpg: '#f59e0b', jpeg: '#f59e0b', png: '#f59e0b',
  gif: '#f59e0b', webp: '#f59e0b', svg: '#f59e0b',
  heic: '#f59e0b', raw: '#d97706',
  // Video
  mp4: '#8b5cf6', mov: '#8b5cf6', avi: '#8b5cf6',
  mkv: '#8b5cf6', wmv: '#8b5cf6', webm: '#7c3aed',
  // Audio
  mp3: '#ec4899', wav: '#ec4899', flac: '#ec4899', aac: '#ec4899',
  // Archives
  zip: '#78716c', tar: '#78716c', gz: '#78716c',
  rar: '#78716c', '7z': '#78716c',
  // Code
  js: '#f7df1e', ts: '#3178c6', jsx: '#61dafb', tsx: '#61dafb',
  py: '#3776ab', rb: '#cc342d', go: '#00add8',
  html: '#e34c26', css: '#264de4', json: '#f5a623',
  // Text
  txt: '#94a3b8', md: '#94a3b8', log: '#64748b',
};

export function extColor(filename) {
  const ext = (filename ?? '').split('.').pop().toLowerCase();
  return EXT_COLORS[ext] ?? '#475569';
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const CSS = {
  mono: "'DM Mono', 'Fira Mono', monospace",
  sans: "'DM Sans', sans-serif",
};
