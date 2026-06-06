import { CustomerShell } from "@/components/customer/customer-shell";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerShell>{children}</CustomerShell>;
}
