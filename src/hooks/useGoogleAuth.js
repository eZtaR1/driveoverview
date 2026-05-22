import { useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchUserInfo } from '../utils/driveApi';

/**
 * Manages Google OAuth token + user info.
 * Uses the implicit / token model (no backend needed for a static site).
 */
export function useGoogleAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    onSuccess: async (tokenResponse) => {
      setError(null);
      setToken(tokenResponse.access_token);
      const info = await fetchUserInfo(tokenResponse.access_token).catch(() => null);
      setUser(info);
    },
    onError: (err) => {
      setError(err.error_description ?? 'Sign-in failed');
    },
  });

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, login, logout, error };
}
