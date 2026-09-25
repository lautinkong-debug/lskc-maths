import { RequireRole } from "@/components/AuthGate";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="teacher">{children}</RequireRole>;
}
