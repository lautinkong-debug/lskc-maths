/**
 * Everything sign-in needs from the Firebase SDK. Only auth.tsx loads this, and
 * it does so on demand: the SDK is the largest download on the site and no
 * teaching app needs it to open.
 */
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, useEmulators } from "@/lib/firebase";

export { watchOwnTeacher } from "@/lib/db/teachers";

export function watchSignIn(
  onChange: (user: User | null) => void,
  onError: (cause: Error) => void,
) {
  return onAuthStateChanged(auth, onChange, onError);
}

export async function signInWithGoogle(domainHint: string): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: domainHint });
  await signInWithPopup(auth, provider);
}

export async function signInWithTestAccount(
  email: string,
  password: string,
): Promise<void> {
  if (!useEmulators)
    throw new Error("Test sign-in is available only with emulators.");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function joinAnonymously(): Promise<User> {
  return (await signInAnonymously(auth)).user;
}

export async function signOutTeacher(): Promise<void> {
  if (!auth.currentUser?.isAnonymous) await signOut(auth);
}
