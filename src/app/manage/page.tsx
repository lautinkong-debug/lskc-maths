import type { Metadata } from "next";
import { TeacherWorkspace } from "@/components/teachers/TeacherWorkspace";
import { teacherNavigationCopy as c } from "@/lib/teacherNavigationCopy";

export const metadata: Metadata = { title: c.workspace };
export default function ManagePage() {
  return <TeacherWorkspace />;
}
