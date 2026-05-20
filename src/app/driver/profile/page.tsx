import { DriverShuttleSettings } from "@/components/driver/driver-shuttle-settings";
import { DriverDocumentUpload } from "@/components/driver/driver-document-upload";
import { DriverVerificationForm } from "@/components/driver-verification-form";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import {
  getDriverProfileForUser,
  verificationDisplay,
} from "@/lib/driver-portal";
import type { VerificationStatus } from "@/lib/types";

export default async function DriverProfilePage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const status = profile.verificationStatus as VerificationStatus;
  const toneMap: Record<
    VerificationStatus,
    "amber" | "green" | "red" | "blue" | "slate"
  > = {
    PENDING: "slate",
    UNDER_REVIEW: "amber",
    APPROVED: "green",
    REJECTED: "red",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Profile & verification</h1>
        <StatusBadge
          label={verificationDisplay(status)}
          tone={toneMap[status]}
        />
      </div>
      <p className="mt-2 text-slate-400">
        Upload ID, licence, proof of address, vehicle registration, and vehicle photos.
      </p>

      {status === "REJECTED" && profile.reviewNotes && (
        <p className="mt-4 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {profile.reviewNotes}
        </p>
      )}

      <section className="mt-8 max-w-2xl">
        <DriverShuttleSettings
          defaults={{
            offersFreight: profile.offersFreight,
            offersShuttle: profile.offersShuttle,
            pdpLicenceNumber: profile.pdpLicenceNumber,
          }}
        />
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="text-lg font-semibold text-white">Documents</h2>
        <div className="mt-4">
          <DriverDocumentUpload
            defaults={{
              idDocumentUrl: profile.idDocumentUrl,
              licenseDocumentUrl: profile.licenseDocumentUrl,
              proofOfAddressUrl: profile.proofOfAddressUrl,
              vehicleRegistrationUrl: profile.vehicleRegistrationUrl,
              vehiclePhotosJson: profile.vehiclePhotosJson,
            }}
          />
        </div>
      </section>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-lg font-semibold text-white">Personal & licence details</h2>
        <div className="mt-4">
          <DriverVerificationForm defaultProvince={profile.province ?? "Gauteng"} />
        </div>
      </section>
    </div>
  );
}
