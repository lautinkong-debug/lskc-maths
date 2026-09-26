"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { readBookFile, type MistakeBook } from "@/lib/db/books";

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => <p>{copy.books.loadingFile}</p>,
});

export function FileViewer({ book }: { book: MistakeBook }) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(book.fileType !== "docx");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (book.fileType === "docx") return;
    let active = true;
    let url: string | undefined;
    readBookFile(book)
      .then(async (blob) => {
        if (!active) return;
        if (book.fileType === "html") {
          const content = await blob.text();
          if (active) setHtml(content);
        } else {
          url = URL.createObjectURL(blob);
          setFileUrl(url);
        }
      })
      .catch(() => {
        if (active) setError(copy.books.fileFailed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [book]);

  async function download() {
    setDownloading(true);
    setError("");
    try {
      const blob = await readBookFile(book);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = book.fileName;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(copy.books.fileFailed);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section aria-label={copy.books.preview} className="mt-8">
      <button
        type="button"
        disabled={downloading}
        onClick={() => void download()}
        className="bg-crimson hover:bg-crimson-deep rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {copy.books.download}
      </button>
      {error && (
        <p role="alert" className="text-crimson mt-4">
          {error}
        </p>
      )}
      {loading && <p className="mt-5">{copy.books.loadingFile}</p>}
      {book.fileType === "docx" ? (
        <p className="border-grid mt-6 border bg-white p-6">
          {copy.books.docxHint}
        </p>
      ) : book.fileType === "html" && html !== null ? (
        <iframe
          title={book.title}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          srcDoc={html}
          className="border-grid mt-6 h-[75vh] w-full border bg-white"
        />
      ) : book.fileType === "pdf" && fileUrl ? (
        <div className="mt-6">
          <PdfPreview key={fileUrl} fileUrl={fileUrl} />
        </div>
      ) : null}
    </section>
  );
}
