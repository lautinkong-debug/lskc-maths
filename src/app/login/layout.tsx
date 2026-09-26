import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.auth.signInTitle };

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
