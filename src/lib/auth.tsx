"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/constants";
import { watchOwnTeacher } from "@/lib/db/teachers";

export type Role = "visitor" | "viewer" | "teacher" | "admin";

interface AuthState {
  user: User | null;
  role: Role;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInTestAccount: (email: string, password: string) => Promise<void>;
  joinAnonymously: () => Promise<User>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = /^[^@]+@([^@]+)$/.exec(email?.toLowerCase() ?? "")?.[1];
  return Boolean(domain && ALLOWED_EMAIL_DOMAINS.includes(domain));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("visitor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopTeacherWatch: (() => void) | undefined;
    const stopAuthWatch = onAuthStateChanged(
      auth,
      (nextUser) => {
        stopTeacherWatch?.();
        stopTeacherWatch = undefined;
        setUser(nextUser?.isAnonymous?null:nextUser);
        setError(null);
        if (!nextUser||nextUser.isAnonymous) {
          setRole("visitor");
          setLoading(false);
          return;
        }
        setRole("viewer");
        if (!nextUser.emailVerified || !isAllowedEmail(nextUser.email)) {
          setLoading(false);
          return;
        }
        setLoading(true);
        stopTeacherWatch = watchOwnTeacher(
          nextUser.email!,
          (teacher) => {
            setRole(
              teacher ? (teacher.isAdmin ? "admin" : "teacher") : "viewer",
            );
            setLoading(false);
          },
          (cause) => {
            setError(cause.message);
            setRole("viewer");
            setLoading(false);
          },
        );
      },
      (cause) => {
        setError(cause.message);
        setRole("visitor");
        setLoading(false);
      },
    );
    return () => {
      stopTeacherWatch?.();
      stopAuthWatch();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      role,
      loading,
      error,
      signIn: async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: ALLOWED_EMAIL_DOMAINS[0] ?? "" });
        await signInWithPopup(auth, provider);
      },
      signInTestAccount: async (email, password) => {
        if (!useEmulators)
          throw new Error("Test sign-in is available only with emulators.");
        setError(null);
        await signInWithEmailAndPassword(auth, email, password);
      },
      joinAnonymously: async () => (await signInAnonymously(auth)).user,
      signOutUser: () => auth.currentUser?.isAnonymous?Promise.resolve():signOut(auth),
    }),
    [user, role, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
