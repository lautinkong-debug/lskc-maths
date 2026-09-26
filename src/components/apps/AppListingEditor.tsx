"use client";

import { useState, type FormEvent } from "react";
import type { AppEntry } from "@/apps/registry";
import { editedLabel } from "@/components/EditableText";
import { copy } from "@/lib/copy";
import {
  defaultAppSettings,
  saveAppSettings,
  type AppSettings,
  type AppSettingsInput,
} from "@/lib/db/appSettings";

export function AppListingEditor({
  app,
  setting,
  defaultOrder,
  email,
  onClose,
  onSaved,
}: {
  app: AppEntry;
  setting: AppSettings | null;
  defaultOrder: number;
  email: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const original = setting ?? defaultAppSettings(app, defaultOrder);
  const [draft, setDraft] = useState<AppSettingsInput>({
    title: original.title,
    summary: original.summary,
    featured: original.featured,
    visible: original.visible,
    order: original.order,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveAppSettings(app.slug, draft, email);
      onSaved();
    } catch {
      setError(copy.editor.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void save(event)}
      className="border-highlight grid gap-3 border-t-2 border-dashed p-5"
    >
      <label className="text-sm font-semibold">
        {copy.apps.listingTitle}
        <input
          value={draft.title}
          maxLength={100}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
        />
      </label>
      <label className="text-sm font-semibold">
        {copy.apps.listingSummary}
        <textarea
          value={draft.summary}
          maxLength={400}
          rows={3}
          onChange={(event) =>
            setDraft((current) => ({ ...current, summary: event.target.value }))
          }
          className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.featured}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              featured: event.target.checked,
            }))
          }
        />
        {copy.apps.featured}
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.visible}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              visible: event.target.checked,
            }))
          }
        />
        {copy.apps.visible}
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
          onClick={onClose}
          className="border-navy text-navy rounded border px-4 py-2"
        >
          {copy.editor.cancel}
        </button>
      </div>
      <p className="text-pencil text-xs">
        {editedLabel(original.updatedBy, original.updatedAt)}
      </p>
      {error && (
        <p role="alert" className="text-crimson">
          {error}
        </p>
      )}
    </form>
  );
}
