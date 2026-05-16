import { DriverVerificationForm } from "@/components/driver-verification-form";
import { requireUser } from "@/lib/auth";

export default async function DriverVerifyPage() {
  await requireUser(["DRIVER"]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Driver verification</h1>
      <p className="mt-2 text-slate-400">
        Required for all drivers operating on Load SA. POPIA: your data is used only
        for safety and compliance.
      </p>
      <div className="mt-8">
        <DriverVerificationForm />
      </div>
    </div>
  );
}
