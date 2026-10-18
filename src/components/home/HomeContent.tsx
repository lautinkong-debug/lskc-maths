"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { EditableText, editedLabel } from "@/components/EditableText";
import { ParabolaHero } from "@/components/home/ParabolaHero";
import { useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import {
  defaultHomeContent,
  saveHomeContent,
  validAnnouncementLink,
  watchHomeContent,
  type Announcement,
} from "@/lib/db/siteContent";
import { useEditMode } from "@/lib/editMode";

export function HomeContent() {
  const { user } = useAuth();
  const { editing } = useEditMode();
  const [content, setContent] = useState(defaultHomeContent);
  const [error, setError] = useState("");
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState<Announcement>(
    defaultHomeContent.announcement,
  );
  const [announcementBusy, setAnnouncementBusy] = useState(false);
  const [announcementStatus, setAnnouncementStatus] = useState("");
  const [announcementError, setAnnouncementError] = useState("");

  useEffect(
    () =>
      watchHomeContent(setContent, () => {
        setError(copy.editor.loadFailed);
      }),
    [],
  );

  function email(): string {
    if (!user?.email) throw new Error("Teacher sign-in required.");
    return user.email;
  }

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncementBusy(true);
    setAnnouncementError("");
    try {
      const draft = {
        text: announcementDraft.text.trim(),
        link: announcementDraft.link.trim(),
        active: announcementDraft.active,
      };
      if (!validAnnouncementLink(draft.link)) {
        setAnnouncementError(copy.editor.invalidLink);
        return;
      }
      await saveHomeContent({ announcement: draft }, email());
      setAnnouncementOpen(false);
      setAnnouncementStatus(copy.editor.saved);
    } catch {
      setAnnouncementError(copy.editor.saveFailed);
    } finally {
      setAnnouncementBusy(false);
    }
  }

  const announcement = content.announcement;
  const showAnnouncement = announcement.active || editing;
  const link = validAnnouncementLink(announcement.link)
    ? announcement.link
    : "";

  return (
    <section className="studio-hero">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6">
        {error && (
          <p role="alert" className="text-crimson">
            {error}
          </p>
        )}
        {showAnnouncement && (
          <div
            className={`border-navy bg-white px-5 py-4 ${editing ? "border-2 border-dashed" : "border-l-4"}`}
          >
            {announcement.active && (
              <div className="text-navy font-medium">
                {link ? (
                  link.startsWith("/") ? (
                    <Link href={link} className="underline underline-offset-4">
                      {announcement.text}
                    </Link>
                  ) : (
                    <a href={link} className="underline underline-offset-4">
                      {announcement.text}
                    </a>
                  )
                ) : (
                  announcement.text
                )}
              </div>
            )}
            {editing && !announcementOpen && (
              <>
                {!announcement.active && (
                  <p className="text-pencil">{copy.home.noAnnouncement}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAnnouncementDraft(announcement);
                    setAnnouncementOpen(true);
                    setAnnouncementError("");
                    setAnnouncementStatus("");
                  }}
                  className="text-navy mt-2 underline underline-offset-4"
                >
                  {copy.home.announcementEdit}
                </button>
              </>
            )}
            {editing && announcementOpen && (
              <form
                onSubmit={(event) => void saveAnnouncement(event)}
                className="mt-3 grid gap-3"
              >
                <label className="font-semibold">
                  {copy.home.announcementText}
                  <textarea
                    value={announcementDraft.text}
                    maxLength={300}
                    rows={3}
                    onChange={(event) =>
                      setAnnouncementDraft((current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
                  />
                </label>
                <label className="font-semibold">
                  {copy.home.announcementLink}
                  <input
                    type="text"
                    value={announcementDraft.link}
                    maxLength={300}
                    onChange={(event) =>
                      setAnnouncementDraft((current) => ({
                        ...current,
                        link: event.target.value,
                      }))
                    }
                    className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={announcementDraft.active}
                    onChange={(event) =>
                      setAnnouncementDraft((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                  />
                  {copy.home.announcementActive}
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={announcementBusy}
                    className="bg-navy rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {copy.editor.save}
                  </button>
                  <button
                    type="button"
                    disabled={announcementBusy}
                    onClick={() => setAnnouncementOpen(false)}
                    className="border-navy text-navy rounded border px-4 py-2"
                  >
                    {copy.editor.cancel}
                  </button>
                </div>
              </form>
            )}
            {editing && (
              <p className="text-pencil mt-2 text-xs">
                {editedLabel(content.updatedBy, content.updatedAt)}
              </p>
            )}
            {editing && announcementStatus && (
              <p role="status" className="text-navy mt-2">
                {announcementStatus}
              </p>
            )}
            {editing && announcementError && (
              <p role="alert" className="text-crimson mt-2">
                {announcementError}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="studio-hero-layout">
        <div className="studio-hero-copy">
          <p className="studio-eyebrow">
            <span className="studio-status-dot" />
            {copy.studio.eyebrow}
          </p>
          <EditableText
            as="h1"
            label={copy.home.heroTitleLabel}
            value={content.heroTitle}
            maxLength={100}
            updatedBy={content.updatedBy}
            updatedAt={content.updatedAt}
            className="studio-hero-title"
            onSave={(value) => saveHomeContent({ heroTitle: value }, email())}
          />
          <div className="mt-4">
            <EditableText
              label={copy.home.heroIntroLabel}
              value={content.intro}
              maxLength={500}
              multiline
              updatedBy={content.updatedBy}
              updatedAt={content.updatedAt}
              className="text-graphite/85 max-w-prose text-base lg:text-lg"
              onSave={(value) => saveHomeContent({ intro: value }, email())}
            />
          </div>
          <div className="studio-hero-actions">
            <Link className="studio-button studio-button-primary" href="/apps">
              {copy.studio.explore}
              <span aria-hidden="true">↗</span>
            </Link>
            <Link className="studio-text-link" href="/join">
              {copy.studio.challenge}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Link
            href="/apps/quadratic-explorer"
            className="text-navy text-meta hover:text-navy-deep mt-5 inline-block underline underline-offset-4"
          >
            {copy.home.openFullApp} &rarr;
          </Link>
        </div>
        <div className="studio-graph-card">
          <div className="studio-graph-heading">
            <span className="studio-eyebrow">{copy.studio.graphTag}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <h2>{copy.studio.graphTitle}</h2>
          <p>{copy.studio.graphHint}</p>
          <ParabolaHero />
        </div>
      </div>
    </section>
  );
}
