import type { LatLng } from "@/lib/maps-places";

export function getGoogleMapsServerKey(): string | null {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() ||
    null
  );
}

export function isGoogleMapsRoutingEnabled(): boolean {
  return Boolean(getGoogleMapsServerKey());
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Straight-line distance adjusted for typical SA road routing. */
export function roadEstimateKm(a: LatLng, b: LatLng): number {
  return Math.round(haversineKm(a, b) * 1.28);
}

export async function getDrivingRouteDistanceKm(
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = [],
): Promise<{ km: number; durationMinutes: number; source: "google" } | null> {
  const key = getGoogleMapsServerKey();
  if (!key) return null;

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: "driving",
    region: "za",
    key,
  });

  if (waypoints.length > 0) {
    params.set(
      "waypoints",
      waypoints.map((w) => `${w.lat},${w.lng}`).join("|"),
    );
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params}`,
      { next: { revalidate: 3600 } },
    );
    const data = (await res.json()) as {
      status: string;
      routes?: {
        legs: { distance: { value: number }; duration: { value: number } }[];
      }[];
    };

    if (data.status !== "OK" || !data.routes?.[0]?.legs?.length) {
      return null;
    }

    const legs = data.routes[0].legs;
    const meters = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const seconds = legs.reduce((sum, leg) => sum + leg.duration.value, 0);

    return {
      km: Math.max(1, Math.round(meters / 1000)),
      durationMinutes: Math.max(1, Math.round(seconds / 60)),
      source: "google",
    };
  } catch {
    return null;
  }
}
