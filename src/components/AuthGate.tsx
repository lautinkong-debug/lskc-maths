"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { ACCESS_MODE } from "@/lib/constants";
import { isAllowedEmail, useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { safeReturnPath } from "@/lib/returnPath";
import { teacherNavigationCopy as c } from "@/lib/teacherNavigationCopy";
import s from "./teachers/teacher.module.css";

function subscribeLocation(changed: () => void) {
  window.addEventListener("hashchange", changed);
  window.addEventListener("popstate", changed);
  return () => {
    window.removeEventListener("hashchange", changed);
    window.removeEventListener("popstate", changed);
  };
}

function GateMessage({
  title,
  message,
  loading = false,
}: {
  title: string;
  message: string;
  loading?: boolean;
}) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const path = useSyncExternalStore(
    subscribeLocation,
    () =>
      window.location.pathname + window.location.search + window.location.hash,
    () => pathname,
  );
  const target = safeReturnPath(path) ?? "/";
  return (
    <main className={s.login} aria-busy={loading}>
      <h1 className="font-display text-section text-navy font-semibold">
        {title}
      </h1>
      <p className="mt-4">{message}</p>
      {!loading && (
        <div className="mt-5 flex flex-wrap gap-5">
          <Link
            href={`/login?next=${encodeURIComponent(target)}`}
            className={user ? s.minorLink : s.signInAction}
          >
            {user ? c.accountSettings : copy.nav.signIn}
          </Link>
          {(ACCESS_MODE === "public" ||
            (user?.emailVerified && isAllowedEmail(user.email))) && (
            <Link
              href={role === "teacher" || role === "admin" ? "/manage" : "/"}
              className={s.minorLink}
            >
              {role === "teacher" || role === "admin" ? c.workspace : c.home}
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  if (ACCESS_MODE === "public" || pathname === "/login") return children;
  if (loading)
    return (
      <GateMessage
        title={copy.common.loading}
        message={copy.auth.checkingAccess}
        loading
      />
    );
  if (!user || !user.emailVerified || !isAllowedEmail(user.email)) {
    return (
      <GateMessage
        title={copy.auth.schoolOnlyTitle}
        message={copy.auth.schoolOnly}
      />
    );
  }
  return children;
}

export function RequireRole({
  role: required,
  children,
}: {
  role: "teacher" | "admin";
  children: ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();
  if (loading)
    return (
      <GateMessage
        title={copy.common.loading}
        message={copy.auth.checkingAccess}
        loading
      />
    );
  const allowed =
    role === "admin" || (required === "teacher" && role === "teacher");
  if (allowed) return children;
  if (!user && pathname === "/manage") {
    return <GateMessage title={c.workspace} message={c.workspaceSignIn} />;
  }
  const title =
    required === "admin" ? copy.auth.adminsOnly : copy.auth.teachersOnly;
  return (
    <GateMessage
      title={title}
      message={
        user
          ? required === "admin"
            ? c.adminRequired
            : copy.auth.notATeacher
          : copy.auth.signInRequired
      }
    />
  );
}
