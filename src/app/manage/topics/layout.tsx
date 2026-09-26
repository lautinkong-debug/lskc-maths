import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.topics.title };

export default function ManageTopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
