import { TeacherArea } from "@/components/teachers/TeacherArea";

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherArea>{children}</TeacherArea>;
}
