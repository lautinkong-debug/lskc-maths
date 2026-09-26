import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.apps.title };

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
