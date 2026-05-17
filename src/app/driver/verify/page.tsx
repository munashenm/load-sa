import { redirect } from "next/navigation";

export default function DriverVerifyRedirect() {
  redirect("/driver/profile");
}
