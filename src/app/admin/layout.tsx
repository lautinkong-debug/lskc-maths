import { TeacherArea } from "@/components/teachers/TeacherArea";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherArea role="admin">{children}</TeacherArea>;
}
