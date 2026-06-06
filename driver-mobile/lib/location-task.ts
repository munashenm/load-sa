import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const TASK = "FLUXMOVE_DRIVER_LOCATION";
let activeBookingId: string | null = null;

export function setActiveBookingForGps(bookingId: string | null) {
  activeBookingId = bookingId;
}

TaskManager.defineTask(TASK, async ({ data, error }) => {
  if (error || !activeBookingId) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const loc = locations?.[0];
  if (!loc) return;

  const token = await import("./api").then((m) => m.getToken());
  if (!token) return;

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  await fetch(`${API_URL}/api/bookings/${activeBookingId}/location`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
    }),
  });
});

export async function startBackgroundTracking(bookingId: string) {
  setActiveBookingForGps(bookingId);
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Background location permission required");
  }
  await Location.startLocationUpdatesAsync(TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 15000,
    distanceInterval: 50,
    showsBackgroundLocationIndicator: true,
  });
}

export async function stopBackgroundTracking() {
  setActiveBookingForGps(null);
  const started = await Location.hasStartedLocationUpdatesAsync(TASK);
  if (started) {
    await Location.stopLocationUpdatesAsync(TASK);
  }
}
