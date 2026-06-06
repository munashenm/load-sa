import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser(["ADMIN"], "/admin");

  return <AdminShell>{children}</AdminShell>;
}
