export type UserRole = "CUSTOMER" | "DRIVER" | "ADMIN";
export type ServiceType = "FREIGHT" | "SHUTTLE";
export type ShuttleTripType =
  | "AIRPORT_PICKUP"
  | "AIRPORT_DROPOFF"
  | "POINT_TO_POINT"
  | "PRIVATE_HIRE_HOURLY";
export type ShuttleVehicleClass =
  | "SEDAN"
  | "SUV"
  | "LUXURY"
  | "MINIBUS_7"
  | "MINIBUS_16";
export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";
export type VehicleType =
  | "MOTORCYCLE"
  | "CAR"
  | "BAKKIE"
  | "PANEL_VAN"
  | "LIGHT_TRUCK"
  | "MEDIUM_TRUCK"
  | "HEAVY_TRUCK"
  | "TRAILER_COMBO"
  | "OTHER";
export type LoadPreference = "ANY" | "EMPTY_RETURN_ONLY" | "FULL_LOAD_ONLY";
export type CargoSize = "SMALL" | "MEDIUM" | "LARGE" | "OVERSIZED";
export type DeliveryUrgency = "STANDARD" | "SAME_DAY" | "EXPRESS";
export type DeliveryCategory =
  | "DOCUMENTS"
  | "ELECTRONICS"
  | "FURNITURE"
  | "APPLIANCES"
  | "CONSTRUCTION"
  | "VEHICLE_TRANSPORT"
  | "FRAGILE"
  | "GENERAL";
export type InsuranceLevel = "STANDARD" | "INSURED";
export type BookingStatus =
  | "SEARCHING_DRIVER"
  | "DRIVER_ASSIGNED"
  | "EN_ROUTE_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "NEAR_DESTINATION"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
