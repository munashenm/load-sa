import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";
import { VehicleIconLabeled } from "@/lib/vehicle-icons";
import { VEHICLE_OPTIONS } from "@/lib/sa-data";
import type { VehicleType } from "@/lib/types";
import { getPricingConfig } from "@/lib/pricing-config";

export default async function AdminPricingPage() {
  const config = await getPricingConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Pricing settings</h1>
      <p className="mt-2 text-slate-400">
        Configure base fees, per-km rates, vehicle pricing, and urgent surcharges.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {VEHICLE_OPTIONS.map((v) => (
          <li
            key={v.value}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
          >
            <VehicleIconLabeled type={v.value as VehicleType} label={v.label} className="text-xs text-slate-400" />
          </li>
        ))}
      </ul>
      <div className="mt-8 max-w-3xl">
        <PricingSettingsForm initial={config} />
      </div>
    </div>
  );
}
