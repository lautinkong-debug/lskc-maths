import type { Metadata } from "next";
import { ClassBoards } from "@/components/challenges/ClassBoards";
import { classroomNavigationCopy as classroom } from "@/lib/classroomNavigationCopy";

export const metadata: Metadata = { title: classroom.results };
export default function Page() {
  return <ClassBoards />;
}
