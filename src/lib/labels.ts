import type {
  BookingStatus,
  CargoSize,
  DeliveryUrgency,
  LoadPreference,
  UserRole,
  VehicleType,
  VerificationStatus,
} from "@/lib/types";

export const verificationLabels: Record<VerificationStatus, string> = {
  PENDING: "Pending submission",
  UNDER_REVIEW: "Under review",
  APPROVED: "Verified",
  REJECTED: "Not approved",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  SEARCHING_DRIVER: "Finding driver",
  DRIVER_ASSIGNED: "Driver assigned",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  MOTORCYCLE: "Motorcycle",
  BAKKIE: "Bakkie",
  PANEL_VAN: "Panel van",
  LIGHT_TRUCK: "Light truck",
  MEDIUM_TRUCK: "Medium truck",
  HEAVY_TRUCK: "Heavy truck",
  TRAILER_COMBO: "Truck + trailer",
  OTHER: "Other",
};

export const loadPreferenceLabels: Record<LoadPreference, string> = {
  ANY: "Any load",
  EMPTY_RETURN_ONLY: "Empty return",
  FULL_LOAD_ONLY: "Full loads only",
};

export const roleLabels: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  DRIVER: "Driver",
  ADMIN: "Admin",
};

export const cargoSizeLabels: Record<CargoSize, string> = {
  SMALL: "Small (fits in car boot)",
  MEDIUM: "Medium (bakkie load)",
  LARGE: "Large (full truck load)",
  OVERSIZED: "Oversized / special handling",
};

export const urgencyLabels: Record<DeliveryUrgency, string> = {
  STANDARD: "Standard (1–3 days)",
  SAME_DAY: "Same day",
  EXPRESS: "Express (ASAP)",
};
