import { AdminLiveDeliveriesClient } from "@/components/admin/admin-live-deliveries-client";
import { getActiveDeliveriesForMap } from "@/lib/admin-live";

export default async function AdminLiveMapPage() {
  const deliveries = await getActiveDeliveriesForMap();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Live delivery map</h1>
      <p className="mt-2 text-slate-400">
        Track all active deliveries nationwide. Map refreshes every 15 seconds.
      </p>
      <div className="mt-8">
        <AdminLiveDeliveriesClient initialDeliveries={deliveries} />
      </div>
    </div>
  );
}
