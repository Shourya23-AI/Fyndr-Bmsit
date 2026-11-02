import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { API_BASE } from './config';

// Firebase starts lazily. The page draws first; the sign-in state arrives a moment later.
// Settings come from VITE_FIREBASE_* if you set them, otherwise from the server's /api/firebase-config (the same source the old site used).

async function loadConfig(): Promise<FirebaseOptions | null> {
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
  }
  try {
    const res = await fetch(`${API_BASE}/api/firebase-config`);
    if (!res.ok) return null;
    const cfg = (await res.json()) as FirebaseOptions;
    return cfg.apiKey && !cfg.apiKey.startsWith('YOUR') ? cfg : null;
  } catch {
    return null;
  }
}

let booting: Promise<Auth | null> | null = null;

/** Resolves to the Firebase Auth instance, or null when Firebase is not configured. */
export function getFirebaseAuth(): Promise<Auth | null> {
  booting ??= loadConfig().then(cfg => (cfg ? getAuth(initializeApp(cfg)) : null));
  return booting;
}

export async function getToken(): Promise<string> {
  const auth = await getFirebaseAuth();
  return auth?.currentUser ? auth.currentUser.getIdToken() : '';
}
