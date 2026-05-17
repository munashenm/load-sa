export type UserRole = "CUSTOMER" | "DRIVER" | "ADMIN";
export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";
export type VehicleType =
  | "MOTORCYCLE"
  | "BAKKIE"
  | "PANEL_VAN"
  | "LIGHT_TRUCK"
  | "MEDIUM_TRUCK"
  | "HEAVY_TRUCK"
  | "TRAILER_COMBO"
  | "OTHER";
export type LoadPreference = "ANY" | "EMPTY_RETURN_ONLY" | "FULL_LOAD_ONLY";
export type BookingStatus =
  | "SEARCHING_DRIVER"
  | "DRIVER_ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
