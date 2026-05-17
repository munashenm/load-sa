import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";
import { getPricingConfig } from "@/lib/pricing-config";

export default async function AdminPricingPage() {
  const config = await getPricingConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Pricing settings</h1>
      <p className="mt-2 text-slate-400">
        Configure base fees, per-km rates, vehicle pricing, and urgent surcharges.
      </p>
      <div className="mt-8 max-w-3xl">
        <PricingSettingsForm initial={config} />
      </div>
    </div>
  );
}
