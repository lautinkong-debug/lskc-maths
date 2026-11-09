import type { Metadata } from "next";
import { LoginPanel } from "@/components/teachers/LoginPanel";
import { safeReturnPath } from "@/lib/returnPath";
import { teacherNavigationCopy as c } from "@/lib/teacherNavigationCopy";

export const metadata: Metadata = { title: c.account };
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return <LoginPanel destination={safeReturnPath(next)} />;
}
