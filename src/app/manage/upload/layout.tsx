import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.books.uploadTitle };

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
