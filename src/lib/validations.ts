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

export const bookingSchema = z.object({
  pickupAddress: z.string().min(5),
  pickupCity: z.string().min(2),
  pickupProvince: provinceEnum,
  dropoffAddress: z.string().min(5),
  dropoffCity: z.string().min(2),
  dropoffProvince: provinceEnum,
  vehicleType: z.enum([
    "MOTORCYCLE",
    "BAKKIE",
    "PANEL_VAN",
    "LIGHT_TRUCK",
    "MEDIUM_TRUCK",
    "HEAVY_TRUCK",
    "TRAILER_COMBO",
    "OTHER",
  ]),
  cargoDescription: z.string().min(10, "Describe what needs to move"),
  weightKg: z.coerce.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
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
