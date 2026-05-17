"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Point = { lat: number; lng: number; label: string };

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function TrackMap({
  pickup,
  dropoff,
  driver,
}: {
  pickup: Point;
  dropoff: Point;
  driver?: Point | null;
}) {
  const center = useMemo(() => {
    const pts = [pickup, dropoff, ...(driver ? [driver] : [])];
    const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
    return [lat, lng] as [number, number];
  }, [pickup, dropoff, driver]);

  const line = useMemo(
    () =>
      [
        [pickup.lat, pickup.lng],
        ...(driver ? [[driver.lat, driver.lng] as [number, number]] : []),
        [dropoff.lat, dropoff.lng],
      ] as [number, number][],
    [pickup, dropoff, driver],
  );

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={8}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[pickup.lat, pickup.lng]} icon={defaultIcon}>
        <Popup>Pickup: {pickup.label}</Popup>
      </Marker>
      <Marker position={[dropoff.lat, dropoff.lng]} icon={defaultIcon}>
        <Popup>Drop-off: {dropoff.label}</Popup>
      </Marker>
      {driver && (
        <Marker position={[driver.lat, driver.lng]} icon={driverIcon}>
          <Popup>Driver: {driver.label}</Popup>
        </Marker>
      )}
      <Polyline positions={line} pathOptions={{ color: "#f59e0b", weight: 4 }} />
    </MapContainer>
  );
}
