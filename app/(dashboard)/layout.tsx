import { requireAuth } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <DashboardShell user={{ name: user.name, role: user.role }}>
      {children}
    </DashboardShell>
  );
}
