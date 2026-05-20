import { z } from "zod";
import { SA_PROVINCES } from "@/lib/sa-data";

const provinceEnum = z.enum(SA_PROVINCES);

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(9, "Enter a valid SA phone number"),
  role: z.enum(["CUSTOMER", "DRIVER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Enter your password"),
});

export const shuttleBookingSchema = z.object({
  pickupAddress: z.string().min(5),
  pickupCity: z.string().min(2),
  pickupProvince: provinceEnum,
  dropoffAddress: z.string().min(5),
  dropoffCity: z.string().min(2),
  dropoffProvince: provinceEnum,
  shuttleTripType: z.enum([
    "AIRPORT_PICKUP",
    "AIRPORT_DROPOFF",
    "POINT_TO_POINT",
    "PRIVATE_HIRE_HOURLY",
  ]),
  shuttleVehicleClass: z.enum([
    "SEDAN",
    "SUV",
    "LUXURY",
    "MINIBUS_7",
    "MINIBUS_16",
  ]),
  airportCode: z.string().max(8).optional(),
  flightNumber: z.string().max(20).optional(),
  passengerCount: z.coerce.number().int().min(1).max(16).default(1),
  luggagePieces: z.coerce.number().int().min(0).max(20).optional(),
  hireHours: z.coerce.number().min(2).max(12).optional(),
  passengerNotes: z.string().max(500).optional(),
  urgency: z.enum(["STANDARD", "SAME_DAY", "EXPRESS"]).default("STANDARD"),
  scheduledAt: z.string().optional(),
  isNightDelivery: z.coerce.boolean().optional(),
});

export const bookingSchema = z.object({
  pickupAddress: z.string().min(5),
  pickupCity: z.string().min(2),
  pickupProvince: provinceEnum,
  dropoffAddress: z.string().min(5),
  dropoffCity: z.string().min(2),
  dropoffProvince: provinceEnum,
  vehicleType: z.enum([
    "MOTORCYCLE",
    "CAR",
    "BAKKIE",
    "PANEL_VAN",
    "LIGHT_TRUCK",
    "MEDIUM_TRUCK",
    "HEAVY_TRUCK",
    "TRAILER_COMBO",
    "OTHER",
  ]),
  cargoDescription: z.string().min(10, "Describe what needs to move"),
  cargoSize: z.enum(["SMALL", "MEDIUM", "LARGE", "OVERSIZED"]).optional(),
  cargoDimensions: z.string().max(120).optional(),
  cargoImageUrl: z
    .string()
    .optional()
    .transform((v) => (v && v.startsWith("http") ? v : undefined)),
  weightKg: z.coerce.number().int().positive().optional(),
  urgency: z.enum(["STANDARD", "SAME_DAY", "EXPRESS"]).default("STANDARD"),
  scheduledAt: z.string().optional(),
  deliveryCategory: z
    .enum([
      "DOCUMENTS",
      "ELECTRONICS",
      "FURNITURE",
      "APPLIANCES",
      "CONSTRUCTION",
      "VEHICLE_TRANSPORT",
      "FRAGILE",
      "GENERAL",
    ])
    .default("GENERAL"),
  isFragile: z.coerce.boolean().optional(),
  usesTollRoads: z.coerce.boolean().optional(),
  isNightDelivery: z.coerce.boolean().optional(),
  insuranceLevel: z.enum(["STANDARD", "INSURED"]).default("STANDARD"),
  stops: z
    .array(
      z.object({
        address: z.string().min(3),
        city: z.string().min(2),
        province: provinceEnum,
        label: z.string().optional(),
      }),
    )
    .max(5)
    .optional(),
});

export const ratingSchema = z.object({
  targetRole: z.enum(["DRIVER", "CUSTOMER"]),
  scores: z.record(z.string(), z.coerce.number().min(1).max(5)),
  comment: z.string().max(500).optional(),
});

export const otpVerifySchema = z.object({
  otp: z.string().length(6),
});

export const bookingStatusUpdateSchema = z.object({
  status: z.enum([
    "SEARCHING_DRIVER",
    "DRIVER_ASSIGNED",
    "EN_ROUTE_PICKUP",
    "PICKED_UP",
    "IN_TRANSIT",
    "NEAR_DESTINATION",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const driverBankSchema = z.object({
  bankAccountHolder: z.string().min(2).optional(),
  bankName: z.string().min(2).optional(),
  bankAccountNumber: z.string().min(4).optional(),
  bankBranchCode: z.string().min(4).optional(),
});

const docUrl = z.string().url().optional().or(z.literal(""));

export const driverDocumentsSchema = z.object({
  idDocumentUrl: docUrl,
  licenseDocumentUrl: docUrl,
  proofOfAddressUrl: docUrl,
  vehicleRegistrationUrl: docUrl,
  vehiclePhotosJson: z.string().optional(),
});

export const driverProfileSchema = z.object({
  idNumber: z.string().min(6, "SA ID or passport number required"),
  licenseNumber: z.string().min(5, "Driver licence number required"),
  province: provinceEnum,
  city: z.string().min(2),
  bio: z.string().max(500).optional(),
  loadPreference: z.enum(["ANY", "EMPTY_RETURN_ONLY", "FULL_LOAD_ONLY"]),
});

export const vehicleSchema = z.object({
  type: z.enum([
    "MOTORCYCLE",
    "CAR",
    "BAKKIE",
    "PANEL_VAN",
    "LIGHT_TRUCK",
    "MEDIUM_TRUCK",
    "HEAVY_TRUCK",
    "TRAILER_COMBO",
    "OTHER",
  ]),
  make: z.string().optional(),
  model: z.string().optional(),
  registration: z.string().min(3, "Vehicle registration required"),
  maxWeightKg: z.coerce.number().int().positive().optional(),
  hasTrailer: z.coerce.boolean().optional(),
});

export const driverVehicleExtendedSchema = vehicleSchema.extend({
  insuranceStatus: z.enum(["INSURED", "PENDING", "NOT_INSURED"]).optional(),
});
