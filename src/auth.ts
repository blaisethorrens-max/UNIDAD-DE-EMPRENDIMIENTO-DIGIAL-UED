import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { SCOPES } from './constants';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token cache (DO NOT store in localStorage per security requirements)
let cachedAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  cachedAccessToken = credential?.accessToken || null;
  return { user: result.user, accessToken: cachedAccessToken };
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export { app };
