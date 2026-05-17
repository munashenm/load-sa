import { DriverVehicleForm } from "@/components/driver/driver-vehicle-form";
import { requireUser } from "@/lib/auth";
import { getDriverProfileForUser } from "@/lib/driver-portal";

export default async function DriverVehiclePage() {
  const user = await requireUser(["DRIVER"]);
  const profile = await getDriverProfileForUser(user.id);
  if (!profile) return null;

  const vehicle = profile.vehicles[0] ?? null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Vehicle details</h1>
      <p className="mt-2 text-slate-400">
        Your approved vehicle type determines which jobs you can accept.
      </p>
      <div className="mt-8 max-w-2xl">
        <DriverVehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}
