"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, isAllowedEmail } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/constants";
import { useEmulators } from "@/lib/firebase";
import { copy } from "@/lib/copy";

const TEST_PASSWORD = "LocalTest123!";
const TEST_ACCOUNTS = [
  { email: "t28ltk@lskc.edu.hk", label: copy.auth.adminRole },
  { email: "teacher2@lskc.edu.hk", label: copy.auth.teacherRole },
  { email: "viewer@lskc.edu.hk", label: copy.auth.viewerRole },
] as const;

export default function LoginPage() {
  const { user, role, loading, error, signIn, signInTestAccount, signOutUser } =
    useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const domain = ALLOWED_EMAIL_DOMAINS[0] ?? "lskc.edu.hk";

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : copy.auth.signInFailed,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-hero text-navy font-semibold">
        {copy.auth.signInTitle}
      </h1>
      <p className="mt-3">{copy.auth.signInIntro}</p>
      {loading ? (
        <p className="mt-8" role="status">
          {copy.auth.checkingAccess}
        </p>
      ) : user ? (
        <section className="border-navy bg-navy-wash mt-8 border-l-4 p-5">
          <p className="font-semibold">{user.email}</p>
          {!isAllowedEmail(user.email) ? (
            <p className="mt-2">
              {copy.auth.wrongDomain.replace("{domain}", domain)}
            </p>
          ) : !user.emailVerified ? (
            <p className="mt-2">{copy.auth.schoolOnly}</p>
          ) : role === "viewer" ? (
            <p className="mt-2">{copy.auth.notATeacher}</p>
          ) : (
            <p className="mt-2">
              {copy.auth.accessGranted}{" "}
              <Link
                href={role === "admin" ? "/admin/teachers" : "/manage/topics"}
                className="text-navy font-semibold underline"
              >
                {copy.nav.manage}
              </Link>
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(signOutUser)}
            className="bg-navy hover:bg-navy-deep mt-5 rounded px-4 py-2 text-white disabled:opacity-50"
          >
            {copy.nav.signOut}
          </button>
        </section>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(signIn)}
          className="bg-navy hover:bg-navy-deep mt-8 rounded px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {copy.auth.signInWithGoogle}
        </button>
      )}
      {(error || actionError) && (
        <p role="alert" className="text-crimson mt-4">
          {error || actionError}
        </p>
      )}
      {useEmulators && (
        <section className="border-grid mt-10 border-t pt-6">
          <h2 className="font-display text-section font-semibold">
            {copy.auth.testAccounts}
          </h2>
          <p className="text-pencil mt-1">{copy.auth.testAccountsIntro}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (user) await signOutUser();
                    await signInTestAccount(account.email, TEST_PASSWORD);
                  })
                }
                className="border-navy text-navy hover:bg-navy-wash rounded border px-3 py-2 text-sm disabled:opacity-50"
              >
                {account.label}: {account.email}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
