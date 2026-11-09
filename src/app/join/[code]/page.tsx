import type { Metadata } from "next";
import { JoinChallenge } from "@/components/challenges/JoinChallenge";
import { classroomNavigationCopy as classroom } from "@/lib/classroomNavigationCopy";

export const metadata: Metadata = { title: classroom.joinTitle };
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <JoinChallenge key={code} initialCode={code} />;
}
