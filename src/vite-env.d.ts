/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the Fyndr server lives. Empty = same site (or the dev proxy). Example: https://fyndr.onrender.com */
  readonly VITE_API_BASE?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /** Dev only: where `npm run dev` forwards /api calls. Default http://localhost:3000 */
  readonly VITE_DEV_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
