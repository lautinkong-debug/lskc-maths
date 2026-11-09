import { RequireRole } from "@/components/AuthGate";
import { TeacherNav } from "./TeacherNav";
import s from "./teacher.module.css";

export function TeacherArea({
  children,
  role = "teacher",
}: {
  children: React.ReactNode;
  role?: "teacher" | "admin";
}) {
  return (
    <RequireRole role={role}>
      <div className={s.area}>
        <TeacherNav />
        {children}
      </div>
    </RequireRole>
  );
}
