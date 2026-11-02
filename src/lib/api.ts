import { API_BASE } from './config';
import { getToken } from './firebase';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error?: string;
  code?: string;
  requestId?: string;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** One call to the Fyndr server, signed with the user's Firebase token. */
export async function api<T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the Fyndr server. Check your connection and try again.', 0, 'NETWORK');
  }
  const data = (await res.json().catch(() => ({}))) as ErrorBody & T;
  if (!res.ok) {
    // An unexpected failure carries a reference that finds the exact log line on the server.
    const ref = data.requestId ? ` (ref ${data.requestId})` : '';
    throw new ApiError((data.error ?? 'Something went wrong') + ref, res.status, data.code);
  }
  return data;
}

export const errorText = (e: unknown): string => {
  if (e instanceof Error) return friendly(e);
  if (typeof e === 'object' && e !== null && 'message' in e) return String((e as { message: unknown }).message);
  return 'Something went wrong. Please try again.';
};

// Firebase errors look like "Firebase: Error (auth/wrong-password)." Say it in words.
const FIREBASE_WORDS: Record<string, string> = {
  'auth/invalid-credential': 'That email and password do not match.',
  'auth/wrong-password': 'That email and password do not match.',
  'auth/user-not-found': 'That email and password do not match.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/too-many-requests': 'Too many tries. Wait a few minutes, then try again.',
  'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
};

function friendly(e: Error): string {
  const code = /\((auth\/[a-z-]+)\)/.exec(e.message)?.[1];
  return (code && FIREBASE_WORDS[code]) || e.message;
}
