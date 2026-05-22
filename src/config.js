// ─── DriveMap Configuration ───────────────────────────────────────────────
//
// Set your Google OAuth Client ID here, or via the VITE_GOOGLE_CLIENT_ID
// environment variable (recommended for GitHub Actions deployments).
//
// See README.md for step-by-step setup instructions.
//
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'YOUR_GOOGLE_CLIENT_ID_HERE';
