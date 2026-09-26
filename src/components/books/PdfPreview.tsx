"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { copy } from "@/lib/copy";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfPreview({ fileUrl }: { fileUrl: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(
        Math.min(900, Math.max(280, Math.floor(entry.contentRect.width))),
      );
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="w-full min-w-0">
      <div className="border-grid overflow-auto border bg-white p-2 sm:p-4">
        <Document
          file={fileUrl}
          loading={copy.books.loadingFile}
          error={copy.books.fileFailed}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
        >
          <Page
            pageNumber={page}
            width={width}
            loading={copy.books.loadingFile}
          />
        </Document>
      </div>
      {pages > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
            className="border-grid-strong rounded border px-3 py-1.5 disabled:opacity-40"
          >
            {copy.books.previousPage}
          </button>
          <span className="text-sm">{copy.books.pageCount(page, pages)}</span>
          <button
            type="button"
            disabled={page === pages}
            onClick={() => setPage((value) => value + 1)}
            className="border-grid-strong rounded border px-3 py-1.5 disabled:opacity-40"
          >
            {copy.books.nextPage}
          </button>
        </div>
      )}
    </div>
  );
}
