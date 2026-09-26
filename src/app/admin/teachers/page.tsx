"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth, isAllowedEmail } from "@/lib/auth";
import {
  addTeacher,
  listTeachers,
  removeTeacher,
  setTeacherAdmin,
  type Teacher,
} from "@/lib/db/teachers";
import { copy } from "@/lib/copy";

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  async function refresh() {
    setTeachers(await listTeachers());
    setLoadError(false);
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    void listTeachers()
      .then((rows) => {
        if (!active) return;
        setTeachers(rows);
        setLoadError(false);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isAllowedEmail(email)) {
      setMessage(copy.teachers.invalidEmail);
      setIsError(true);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await addTeacher({ email, name, isAdmin, addedBy: user!.email! });
      await refresh();
      setEmail("");
      setName("");
      setIsAdmin(false);
      setMessage(copy.teachers.saved);
      setIsError(false);
    } catch {
      setMessage(copy.teachers.failed);
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function changeAdmin(teacher: Teacher, value: boolean) {
    setBusy(true);
    setMessage("");
    try {
      await setTeacherAdmin(teacher.email, value);
      await refresh();
      setMessage(copy.teachers.saved);
      setIsError(false);
    } catch {
      setMessage(copy.teachers.failed);
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(teacher: Teacher) {
    if (!window.confirm(copy.teachers.confirmRemove)) return;
    setBusy(true);
    setMessage("");
    try {
      await removeTeacher(teacher.email);
      await refresh();
      setMessage(copy.teachers.saved);
      setIsError(false);
    } catch {
      setMessage(copy.teachers.failed);
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-hero text-navy font-semibold">
        {copy.teachers.title}
      </h1>
      <p className="mt-2">{copy.teachers.intro}</p>
      <form
        onSubmit={(event) => void submit(event)}
        className="border-grid mt-8 grid gap-4 border p-5 sm:grid-cols-2"
      >
        <label className="block text-sm font-semibold">
          {copy.teachers.email}
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-sm font-semibold">
          {copy.teachers.name}
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(event) => setIsAdmin(event.target.checked)}
          />
          {copy.teachers.admin}
        </label>
        <button
          type="submit"
          disabled={busy}
          className="bg-navy hover:bg-navy-deep rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {copy.teachers.add}
        </button>
      </form>
      {message && (
        <p role={isError ? "alert" : "status"} className="mt-4">
          {message}
        </p>
      )}
      <div className="mt-8 space-y-3">
        {loading ? (
          <p role="status">{copy.teachers.loading}</p>
        ) : loadError ? (
          <p role="alert">{copy.teachers.loadFailed}</p>
        ) : teachers.length === 0 ? (
          <p>{copy.teachers.noTeachers}</p>
        ) : (
          teachers.map((teacher) => {
            const own = teacher.email === user?.email?.toLowerCase();
            return (
              <div
                key={teacher.email}
                className="border-grid flex flex-wrap items-center gap-4 border-b py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-pencil text-sm break-all">
                    {teacher.email}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={teacher.isAdmin}
                    disabled={busy || own}
                    onChange={(event) =>
                      void changeAdmin(teacher, event.target.checked)
                    }
                  />
                  {copy.teachers.admin}
                </label>
                <button
                  type="button"
                  disabled={busy || own}
                  title={own ? copy.teachers.ownAccount : undefined}
                  onClick={() => void remove(teacher)}
                  className="border-crimson text-crimson hover:bg-crimson-wash rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {copy.teachers.remove}
                </button>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
