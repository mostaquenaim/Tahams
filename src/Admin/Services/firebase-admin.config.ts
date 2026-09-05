import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// FIREBASE_SERVICE_ACCOUNT holds the full service-account JSON (from
// Firebase Console > Project Settings > Service Accounts > Generate new
// private key), minified to one line, in this backend's own .env - never
// the frontend's public firebaseConfig, which has no private key.
function getFirebaseApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT env var is not set - required to verify customer Firebase ID tokens.',
    );
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export function verifyFirebaseIdToken(idToken: string) {
  return getAuth(getFirebaseApp()).verifyIdToken(idToken);
}
