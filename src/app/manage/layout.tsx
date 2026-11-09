import { TeacherArea } from "@/components/teachers/TeacherArea";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherArea>{children}</TeacherArea>;
}
