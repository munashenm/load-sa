import { AvailableJobsTable } from "@/components/driver/available-jobs-table";
import { requireUser } from "@/lib/auth";
import {
  canAcceptJobs,
  distanceLabel,
  getAvailableJobsForDriver,
  getDriverProfileForUser,
  primaryVehicleType,
} from "@/lib/driver-portal";
import { vehicleTypeLabels } from "@/lib/labels";
import type { VehicleType } from "@/lib/types";

export default async function DriverJobsPage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const vType = primaryVehicleType(profile.vehicles);
  const raw = await getAvailableJobsForDriver(profile.id, vType);

  const jobs = raw.map((b) => ({
    id: b.id,
    reference: b.reference,
    pickupCity: b.pickupCity,
    pickupProvince: b.pickupProvince,
    dropoffCity: b.dropoffCity,
    dropoffProvince: b.dropoffProvince,
    distanceLabel: distanceLabel(b.pickupProvince, b.dropoffProvince),
    cargoDescription: b.cargoDescription,
    vehicleType: b.vehicleType,
    estimatedPrice: b.estimatedPrice,
    urgency: b.urgency,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Available jobs</h1>
      <p className="mt-2 text-slate-400">
        {vType
          ? `Showing jobs for ${vehicleTypeLabels[vType as VehicleType]}.`
          : "Add your vehicle type to see matching jobs."}
      </p>
      <div className="mt-8">
        <AvailableJobsTable jobs={jobs} canAccept={canAcceptJobs(profile)} />
      </div>
    </div>
  );
}
