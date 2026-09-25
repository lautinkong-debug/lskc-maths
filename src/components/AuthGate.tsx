"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ACCESS_MODE } from "@/lib/constants";
import { isAllowedEmail, useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";

function GateMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-section text-navy font-semibold">
        {title}
      </h1>
      <p className="mt-4">{message}</p>
      <Link
        href="/login"
        className="text-navy mt-6 inline-block font-semibold underline"
      >
        {copy.nav.signIn}
      </Link>
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
  if (loading)
    return (
      <GateMessage
        title={copy.common.loading}
        message={copy.auth.checkingAccess}
      />
    );
  const allowed =
    role === "admin" || (required === "teacher" && role === "teacher");
  if (allowed) return children;
  const title =
    required === "admin" ? copy.auth.adminsOnly : copy.auth.teachersOnly;
  return (
    <GateMessage
      title={title}
      message={user ? copy.auth.notATeacher : copy.auth.signInRequired}
    />
  );
}
