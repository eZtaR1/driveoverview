const BASE = 'https://www.googleapis.com/drive/v3';

/** Fetch every non-trashed file/folder in the user's Drive, paginating automatically. */
export async function fetchAllFiles(accessToken, onProgress) {
  const files = [];
  let pageToken = null;

  do {
    const params = new URLSearchParams({
      fields: 'nextPageToken,files(id,name,size,mimeType,parents)',
      pageSize: '1000',
      q: 'trashed=false',
      ...(pageToken ? { pageToken } : {}),
    });

    const resp = await fetch(`${BASE}/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (resp.status === 401) throw new Error('AUTH_EXPIRED');
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Drive API error ${resp.status}`);
    }

    const data = await resp.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? null;
    onProgress?.(files.length);
  } while (pageToken);

  return files;
}

/** Get the ID of the root "My Drive" folder. */
export async function fetchRootId(accessToken) {
  const resp = await fetch(`${BASE}/files/root?fields=id`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error('Could not fetch root folder ID');
  const data = await resp.json();
  return data.id;
}

/** Fetch Google profile info for the signed-in user. */
export async function fetchUserInfo(accessToken) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) return null;
  return resp.json();
}
