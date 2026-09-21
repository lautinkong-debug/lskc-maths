/**
 * Firebase initialisation.
 *
 * One app instance for the whole site. When NEXT_PUBLIC_USE_EMULATORS is
 * "true" every service is pointed at the local Firebase Emulator Suite, so
 * development never touches the real project.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

const firebaseConfig = {
  apiKey: required(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  ),
  authDomain: required(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: required(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  storageBucket: required(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  ),
  messagingSenderId: required(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: required(
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ),
};

export const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";

export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Emulator ports must match firebase.json.
const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199 } as const;

declare global {
  // Survives Fast Refresh, so we never connect twice (which throws).
  var __lskcEmulatorsConnected: boolean | undefined;
}

if (useEmulators && typeof window !== "undefined") {
  if (!globalThis.__lskcEmulatorsConnected) {
    globalThis.__lskcEmulatorsConnected = true;
    connectAuthEmulator(
      auth,
      `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`,
      {
        disableWarnings: true,
      },
    );
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
    connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  }
}
