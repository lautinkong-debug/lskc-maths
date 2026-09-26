import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.books.manageTitle };

export default function ManageBooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
