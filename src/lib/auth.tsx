"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import { afterFirstScreen } from "@/lib/afterFirstScreen";
import { ACCESS_MODE, ALLOWED_EMAIL_DOMAINS } from "@/lib/constants";

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

type AuthClient = typeof import("@/lib/authClient");
let client: AuthClient | undefined;
async function loadClient(): Promise<AuthClient> {
  client ??= await import("@/lib/authClient");
  return client;
}

// Remembers that this browser has signed in, so that a teacher keeps their role
// on a teaching app while students there never download the Firebase SDK at all.
const SIGNED_IN = "lskc-signed-in";
function wasSignedIn(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN) === "1";
  } catch {
    return false;
  }
}
function rememberSignIn(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(SIGNED_IN, "1");
    else localStorage.removeItem(SIGNED_IN);
  } catch {
    // Without storage, a teacher signs in again from any other page.
  }
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = /^[^@]+@([^@]+)$/.exec(email?.toLowerCase() ?? "")?.[1];
  return Boolean(domain && ALLOWED_EMAIL_DOMAINS.includes(domain));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("visitor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  // A public teaching app opens without knowing who is signed in.
  const signInOptional =
    ACCESS_MODE === "public" && pathname.startsWith("/apps/");

  useEffect(() => {
    let closed = false;
    let stopTeacherWatch: (() => void) | undefined;
    let stopAuthWatch: (() => void) | undefined;
    const fail = (cause: Error) => {
      setError(cause.message);
      setRole("visitor");
      setLoading(false);
    };
    const start = () => {
      loadClient().then(({ watchOwnTeacher, watchSignIn }) => {
        if (closed) return;
        stopAuthWatch = watchSignIn((nextUser) => {
          stopTeacherWatch?.();
          stopTeacherWatch = undefined;
          rememberSignIn(Boolean(nextUser && !nextUser.isAnonymous));
          setUser(nextUser?.isAnonymous ? null : nextUser);
          setError(null);
          if (!nextUser || nextUser.isAnonymous) {
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
        }, fail);
      }, fail);
    };
    const stopWaiting = signInOptional
      ? afterFirstScreen(() => {
          if (wasSignedIn()) start();
          else setLoading(false);
        })
      : start();
    return () => {
      closed = true;
      stopWaiting?.();
      stopTeacherWatch?.();
      stopAuthWatch?.();
    };
  }, [signInOptional]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      role,
      loading,
      error,
      signIn: async () => {
        setError(null);
        // Safari allows the popup only straight after the tap, so no wait once loaded.
        const { signInWithGoogle } = client ?? (await loadClient());
        await signInWithGoogle(ALLOWED_EMAIL_DOMAINS[0] ?? "");
      },
      signInTestAccount: async (email, password) => {
        setError(null);
        await (await loadClient()).signInWithTestAccount(email, password);
      },
      joinAnonymously: async () => (await loadClient()).joinAnonymously(),
      signOutUser: async () => (await loadClient()).signOutTeacher(),
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
