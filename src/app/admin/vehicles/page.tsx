import Link from "next/link";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-categories";
import { getPricingConfig } from "@/lib/pricing-config";
import { formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { VehicleType } from "@/lib/types";

export default async function AdminVehiclesPage() {
  const config = await getPricingConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Vehicle categories</h1>
      <p className="mt-2 text-slate-400">
        Customer-facing vehicle types mapped to pricing rules. Edit per-km and base rates in{" "}
        <Link href="/admin/pricing" className="text-amber-400 hover:underline">
          pricing settings
        </Link>
        .
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Internal type</th>
              <th className="px-4 py-3">Base fee</th>
              <th className="px-4 py-3">Per km</th>
            </tr>
          </thead>
          <tbody>
            {VEHICLE_CATEGORIES.map((cat) => {
              const rates = config.vehicleRates[cat.vehicleType];
              return (
                <tr key={cat.id} className="border-t border-slate-800/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VehicleIcon type={cat.vehicleType as VehicleType} className="h-5 w-5" />
                      <span className="font-medium text-white">{cat.label}</span>
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-400">{cat.description}</td>
                  <td className="px-4 py-3 text-slate-300">{cat.loadCapacity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {cat.vehicleType}
                  </td>
                  <td className="px-4 py-3 text-emerald-300">
                    {formatZAR(rates?.base ?? cat.startingPrice)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatZAR(rates?.perKm ?? 0)}/km
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
