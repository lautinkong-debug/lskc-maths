import type { Metadata } from "next";
import { JoinChallenge } from "@/components/challenges/JoinChallenge";
import { classroomNavigationCopy as classroom } from "@/lib/classroomNavigationCopy";

export const metadata: Metadata = { title: classroom.joinTitle };
export default function Page() {
  return <JoinChallenge />;
}
