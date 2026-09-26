import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.teachers.title };

export default function TeachersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
