import { RequireRole } from "@/components/AuthGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
