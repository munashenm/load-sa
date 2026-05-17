import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser(["ADMIN"]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-52 shrink-0 md:block">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Admin
        </p>
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
