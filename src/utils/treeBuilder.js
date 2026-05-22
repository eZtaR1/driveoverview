const GOOGLE_DOC_SIZE = 50_000; // estimate for native Google Docs with no byte size

/**
 * Convert a flat array of Drive files into a nested tree suitable for D3 hierarchy.
 * @param {object[]} files  - flat list from Drive API
 * @param {string}   rootId - ID of the "My Drive" root folder
 */
export function buildTree(files, rootId) {
  // ── 1. Build id→node map ────────────────────────────────────────────────
  const map = {};

  map[rootId] = {
    id: rootId,
    name: 'My Drive',
    isFolder: true,
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    children: [],
  };

  for (const f of files) {
    const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
    const isGoogleDoc = f.mimeType?.startsWith('application/vnd.google-apps.');
    map[f.id] = {
      id: f.id,
      name: f.name,
      isFolder,
      mimeType: f.mimeType,
      size: isFolder ? 0 : (parseInt(f.size, 10) || (isGoogleDoc ? GOOGLE_DOC_SIZE : 0)),
      parentId: f.parents?.[0] ?? rootId,
      children: isFolder ? [] : undefined,
    };
  }

  // ── 2. Wire up parent-child relationships ───────────────────────────────
  for (const node of Object.values(map)) {
    if (node.id === rootId) continue;
    const parent = map[node.parentId];
    if (parent?.children) {
      parent.children.push(node);
    } else {
      // Orphaned file (shared drive quirk) → attach to root
      map[rootId].children.push(node);
    }
  }

  // ── 3. Prune empty folders so D3 doesn't treat them oddly ───────────────
  function prune(node) {
    if (!node.isFolder) return node;
    node.children = (node.children ?? [])
      .map(prune)
      .filter(Boolean);
    if (node.children.length === 0 && node.id !== rootId) {
      // Empty folder → make it a leaf with zero size
      delete node.children;
    }
    return node;
  }

  return prune(map[rootId]);
}

/** Return total size of a subtree node (D3 already computes .value, but useful pre-hierarchy). */
export function subtreeSize(node) {
  if (!node.isFolder) return node.size ?? 0;
  return (node.children ?? []).reduce((s, c) => s + subtreeSize(c), 0);
}
