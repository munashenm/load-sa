"use client";

import { Fragment, useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LiveDeliveryRow } from "@/lib/admin-live";
import { bookingStatusLabels } from "@/lib/labels";
import type { BookingStatus } from "@/lib/types";

const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function AdminFleetMap({ deliveries }: { deliveries: LiveDeliveryRow[] }) {
  const center = useMemo((): [number, number] => {
    if (deliveries.length === 0) return [-28.5, 24.5];
    const pts = deliveries.flatMap((d) => {
      const list: [number, number][] = [[d.pickupLat, d.pickupLng]];
      if (d.driverLat != null && d.driverLng != null) {
        list.push([d.driverLat, d.driverLng]);
      }
      return list;
    });
    const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return [lat, lng];
  }, [deliveries]);

  const zoom = deliveries.length <= 1 ? 10 : deliveries.length <= 5 ? 8 : 6;

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
  }, []);

  if (deliveries.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-500">
        No active deliveries on the map right now.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-[420px] w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {deliveries.map((d) => {
        const driverPos =
          d.driverLat != null && d.driverLng != null
            ? ([d.driverLat, d.driverLng] as [number, number])
            : null;
        const statusLabel =
          bookingStatusLabels[d.status as BookingStatus] ??
          d.status.replace(/_/g, " ");

        return (
          <Fragment key={d.id}>
            <Marker position={[d.pickupLat, d.pickupLng]} icon={pickupIcon}>
              <Popup>
                <strong>{d.reference}</strong>
                <br />
                {d.pickupCity} → {d.dropoffCity}
                <br />
                {statusLabel}
                <br />
                {d.driverName ? `Driver: ${d.driverName}` : "Awaiting driver GPS"}
              </Popup>
            </Marker>
            {driverPos && (
              <Marker position={driverPos} icon={driverIcon}>
                <Popup>
                  Driver: {d.driverName ?? "Assigned"}
                  <br />
                  {d.reference}
                </Popup>
              </Marker>
            )}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
