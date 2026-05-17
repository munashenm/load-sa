import { redirect } from "next/navigation";
import { DriverShell } from "@/components/driver/driver-shell";
import { requireUser } from "@/lib/auth";
import { getDriverProfileForUser } from "@/lib/driver-portal";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) {
    redirect("/register");
  }

  return <DriverShell>{children}</DriverShell>;
}
