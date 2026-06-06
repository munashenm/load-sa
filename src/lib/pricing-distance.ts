import {
  getDrivingRouteDistanceKm,
  isGoogleMapsRoutingEnabled,
  roadEstimateKm,
} from "@/lib/google-maps";
import type { LatLng } from "@/lib/maps-places";
import { resolveCityCoords } from "@/lib/sa-data";

/** Rough distance estimate from province pair (fallback when coords unavailable). */
export function estimateDistanceKm(
  pickupProvince: string,
  dropoffProvince: string,
): number {
  if (pickupProvince === dropoffProvince) {
    return 120;
  }
  const longHaulPairs = new Set([
    "Western Cape-Gauteng",
    "Gauteng-Western Cape",
    "Western Cape-KwaZulu-Natal",
    "KwaZulu-Natal-Western Cape",
    "Eastern Cape-Gauteng",
    "Gauteng-Eastern Cape",
  ]);
  const key = `${pickupProvince}-${dropoffProvince}`;
  if (longHaulPairs.has(key)) {
    return 1400;
  }
  return 650;
}

export type RouteDistanceInput = {
  pickupProvince: string;
  dropoffProvince: string;
  pickupCity?: string;
  dropoffCity?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  stops?: { lat?: number | null; lng?: number | null; city?: string; province?: string }[];
};

function hasCoords(p: LatLng | null): p is LatLng {
  return p != null && Number.isFinite(p.lat) && Number.isFinite(p.lng);
}

function resolvePoint(
  lat: number | null | undefined,
  lng: number | null | undefined,
  city: string | undefined,
  province: string | undefined,
): LatLng | null {
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  if (city && province) {
    return resolveCityCoords(city, province);
  }
  return null;
}

function chainRoadEstimate(points: LatLng[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += roadEstimateKm(points[i], points[i + 1]);
  }
  return Math.max(1, total);
}

export async function resolveRouteDistanceKm(
  input: RouteDistanceInput,
): Promise<{ km: number; source: "google" | "coords" | "province" }> {
  const pickup = resolvePoint(
    input.pickupLat,
    input.pickupLng,
    input.pickupCity,
    input.pickupProvince,
  );
  const dropoff = resolvePoint(
    input.dropoffLat,
    input.dropoffLng,
    input.dropoffCity,
    input.dropoffProvince,
  );

  const stopPoints: LatLng[] = (input.stops ?? [])
    .map((s) => resolvePoint(s.lat, s.lng, s.city, s.province))
    .filter(hasCoords);

  if (pickup && dropoff) {
    const googleRoute = isGoogleMapsRoutingEnabled()
      ? await getDrivingRouteDistanceKm(pickup, dropoff, stopPoints)
      : null;

    if (googleRoute) {
      return { km: googleRoute.km, source: "google" };
    }

    const chain = [pickup, ...stopPoints, dropoff];
    if (chain.length >= 2) {
      return { km: chainRoadEstimate(chain), source: "coords" };
    }

    return { km: roadEstimateKm(pickup, dropoff), source: "coords" };
  }

  return {
    km: estimateDistanceKm(input.pickupProvince, input.dropoffProvince),
    source: "province",
  };
}
