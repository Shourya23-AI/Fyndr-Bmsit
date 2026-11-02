import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, errorText } from './api';
import type { Me, OrgType } from './apiTypes';
import { getFirebaseAuth } from './firebase';

export type Phase =
  | 'loading' // Firebase is starting
  | 'unconfigured' // no Firebase settings found
  | 'out' // nobody signed in
  | 'verify' // signed in, email not confirmed yet
  | 'setup' // signed in, but no Fyndr profile yet (first Google sign-in)
  | 'ready' // signed in with a profile
  | 'error'; // the server could not be reached

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'org';
  orgName?: string;
  orgType?: OrgType;
  website?: string;
}

export interface SetupInput {
  name: string;
  role: 'user' | 'org';
  orgName?: string;
  orgType?: OrgType;
}

interface AuthValue {
  phase: Phase;
  user: User | null;
  me: Me | null;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  google: () => Promise<void>;
  reset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  /** Re-checks the email link and moves on if it was clicked. Returns true when verified. */
  recheckVerified: () => Promise<boolean>;
  completeSetup: (input: SetupInput) => Promise<void>;
  /** Loads the profile from the server again (after saving the profile or verifying the phone). */
  refreshMe: () => Promise<void>;
  retry: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

interface State {
  phase: Phase;
  user: User | null;
  me: Me | null;
  error: string;
}

const START: State = { phase: 'loading', user: null, me: null, error: '' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(START);
  const authRef = useRef<Auth | null>(null);
  // While sign-up is creating the Fyndr profile, the auth listener must not ask the server for it yet.
  const registering = useRef(false);

  const resolve = useCallback(async (user: User | null): Promise<void> => {
    if (!user) {
      setState({ phase: 'out', user: null, me: null, error: '' });
      return;
    }
    if (!user.emailVerified) {
      setState({ phase: 'verify', user, me: null, error: '' });
      return;
    }
    try {
      const me = await api<Me>('/me');
      setState({ phase: 'ready', user, me, error: '' });
    } catch (e) {
      const message = errorText(e);
      // The server says "Profile ..." when the account exists in Firebase but has no Fyndr profile yet.
      setState(/profile/i.test(message) ? { phase: 'setup', user, me: null, error: '' } : { phase: 'error', user, me: null, error: message });
    }
  }, []);

  useEffect(() => {
    let off = (): void => {};
    let alive = true;
    void getFirebaseAuth().then(auth => {
      if (!alive) return;
      authRef.current = auth;
      if (!auth) {
        setState({ phase: 'unconfigured', user: null, me: null, error: '' });
        return;
      }
      off = onAuthStateChanged(auth, user => {
        if (!registering.current) void resolve(user);
      });
    });
    return () => {
      alive = false;
      off();
    };
  }, [resolve]);

  const need = (): Auth => {
    if (!authRef.current) throw new Error('Sign-in is not set up yet. The site owner must add the Firebase settings.');
    return authRef.current;
  };

  const value = useMemo<AuthValue>(
    () => ({
      ...state,
      async signIn(email, password) {
        await signInWithEmailAndPassword(need(), email, password);
      },
      async signUp(input) {
        const auth = need();
        registering.current = true;
        try {
          const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
          await updateProfile(cred.user, { displayName: input.name });
          await api('/init', 'POST', {
            name: input.name,
            role: input.role,
            orgName: input.orgName,
            orgType: input.orgType,
            website: input.website,
          });
          await sendEmailVerification(cred.user);
        } finally {
          registering.current = false;
        }
        await resolve(auth.currentUser);
      },
      async google() {
        await signInWithPopup(need(), new GoogleAuthProvider());
      },
      async reset(email) {
        await sendPasswordResetEmail(need(), email);
      },
      async logout() {
        await signOut(need());
      },
      async resendVerification() {
        const u = need().currentUser;
        if (u) await sendEmailVerification(u);
      },
      async recheckVerified() {
        const u = need().currentUser;
        if (!u) return false;
        await u.reload();
        await u.getIdToken(true);
        if (u.emailVerified) await resolve(u);
        return u.emailVerified;
      },
      async completeSetup(input) {
        await api('/init', 'POST', input);
        await resolve(need().currentUser);
      },
      async refreshMe() {
        const u = authRef.current?.currentUser ?? null;
        if (u) await resolve(u);
      },
      retry() {
        setState(s => ({ ...s, phase: 'loading', error: '' }));
        void resolve(authRef.current?.currentUser ?? null);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, resolve],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}
