import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.books.title };

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
