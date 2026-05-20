import type {
  BookingStatus,
  CargoSize,
  DeliveryUrgency,
  LoadPreference,
  ServiceType,
  ShuttleTripType,
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
  DRIVER_ASSIGNED: "Accepted",
  EN_ROUTE_PICKUP: "On the way to pickup",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  NEAR_DESTINATION: "Near destination",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  MOTORCYCLE: "Motorcycle / scooter",
  CAR: "Car",
  BAKKIE: "Bakkie / pickup",
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

export const complaintStatusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const complaintPriorityLabels: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const serviceTypeLabels: Record<ServiceType, string> = {
  FREIGHT: "Freight / delivery",
  SHUTTLE: "Shuttle & private hire",
};

export const shuttleTripLabels: Record<ShuttleTripType, string> = {
  AIRPORT_PICKUP: "Airport pickup",
  AIRPORT_DROPOFF: "To airport",
  POINT_TO_POINT: "Point to point",
  PRIVATE_HIRE_HOURLY: "Private hire",
};

export const shuttleStatusLabels: Partial<Record<BookingStatus, string>> = {
  EN_ROUTE_PICKUP: "On the way to pickup",
  PICKED_UP: "Passengers on board",
  IN_TRANSIT: "En route",
  NEAR_DESTINATION: "Arriving soon",
  DELIVERED: "Trip completed",
};

export const urgencyLabels: Record<DeliveryUrgency, string> = {
  STANDARD: "Standard (1–3 days)",
  SAME_DAY: "Same day",
  EXPRESS: "Express (ASAP)",
};
