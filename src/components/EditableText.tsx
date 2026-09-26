"use client";

import { useState } from "react";
import { copy } from "@/lib/copy";
import { useEditMode } from "@/lib/editMode";

export function editedLabel(by: string, at: Date | null): string {
  if (!by || !at) return copy.editor.neverEdited;
  const when = new Intl.DateTimeFormat("en-HK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(at);
  return copy.editor.lastEdited(by, when);
}

export function EditableText({
  label,
  value,
  as: Tag = "p",
  className = "",
  multiline = false,
  maxLength,
  updatedBy,
  updatedAt,
  onSave,
}: {
  label: string;
  value: string;
  as?: "h1" | "p";
  className?: string;
  multiline?: boolean;
  maxLength: number;
  updatedBy: string;
  updatedAt: Date | null;
  onSave: (value: string) => Promise<void>;
}) {
  const { editing } = useEditMode();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean || clean.length > maxLength) {
      setError(copy.editor.invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave(clean);
      setOpen(false);
      setStatus(copy.editor.saved);
    } catch {
      setError(copy.editor.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={editing ? "border-highlight border-2 border-dashed p-3" : ""}
    >
      {!open || !editing ? (
        <>
          <Tag className={`${className} whitespace-pre-wrap`}>{value}</Tag>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setDraft(value);
                setOpen(true);
                setStatus("");
                setError("");
              }}
              className="text-navy mt-2 rounded underline underline-offset-4"
            >
              {copy.editor.edit(label)}
            </button>
          )}
        </>
      ) : (
        <form onSubmit={(event) => void save(event)} className="space-y-2">
          <label className="block text-sm font-semibold">
            {label}
            {multiline ? (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={maxLength}
                rows={4}
                className="border-grid-strong text-graphite mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              />
            ) : (
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={maxLength}
                className="border-grid-strong text-graphite mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              />
            )}
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="bg-navy rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {copy.editor.save}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="border-navy text-navy rounded border px-4 py-2"
            >
              {copy.editor.cancel}
            </button>
          </div>
        </form>
      )}
      {editing && (
        <p className="text-pencil mt-2 text-xs">
          {editedLabel(updatedBy, updatedAt)}
        </p>
      )}
      {editing && status && (
        <p role="status" className="text-navy mt-2">
          {status}
        </p>
      )}
      {editing && error && (
        <p role="alert" className="text-crimson mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
