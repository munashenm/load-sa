import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrimaryBusinessForUser } from "@/lib/business-portal";

export default async function BusinessIndexPage() {
  const user = await requireUser(["CUSTOMER"], "/business");
  const business = await getPrimaryBusinessForUser(user.id);

  if (business) {
    redirect(`/business/${business.business.id}`);
  }

  redirect("/business/setup");
}
