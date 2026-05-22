import { useState, useCallback } from 'react';
import { fetchAllFiles, fetchRootId } from '../utils/driveApi';
import { buildTree } from '../utils/treeBuilder';

export function useDriveScanner() {
  const [state, setState] = useState('idle'); // idle | scanning | done | error
  const [tree, setTree]   = useState(null);
  const [stats, setStats] = useState({ count: 0, total: 0 });
  const [log, setLog]     = useState([]);
  const [error, setError] = useState(null);

  const addLog = (msg) => setLog((l) => [...l.slice(-12), msg]);

  const scan = useCallback(async (accessToken) => {
    setState('scanning');
    setTree(null);
    setError(null);
    setLog([]);

    try {
      addLog('Fetching root folder ID…');
      const rootId = await fetchRootId(accessToken);

      addLog('Listing files (this may take a moment for large drives)…');
      const files = await fetchAllFiles(accessToken, (n) => {
        setStats((s) => ({ ...s, count: n }));
        if (n % 500 === 0 && n > 0) addLog(`Found ${n.toLocaleString()} files so far…`);
      });

      addLog(`Indexed ${files.length.toLocaleString()} items. Building tree…`);
      const hierarchy = buildTree(files, rootId);

      const totalBytes = files.reduce(
        (s, f) => s + (parseInt(f.size, 10) || 0),
        0
      );
      setStats({ count: files.length, total: totalBytes });
      setTree(hierarchy);
      setState('done');
      addLog('Done!');
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') {
        setError('Your session expired. Please sign in again.');
      } else {
        setError(err.message ?? 'Unknown error');
      }
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setTree(null);
    setStats({ count: 0, total: 0 });
    setLog([]);
    setError(null);
  }, []);

  return { state, tree, stats, log, error, scan, reset };
}
