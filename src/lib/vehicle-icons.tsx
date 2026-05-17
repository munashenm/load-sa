import {
  Bike,
  Car,
  Truck,
  Container,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import type { VehicleType } from "@/lib/types";

/** Panel van uses Van-style box truck icon from lucide - use Truck with different styling or Package. Lucide has no Van - use Car front + box. Using `Bus` or custom. Lucide 1.16 has `Van`? Check - might use Car for panel van. User asked: Motorcycle, Car, Bakkie, Van, Truck, Truck+Trailer */

import { Package } from "lucide-react";

const ICONS: Record<VehicleType, LucideIcon> = {
  MOTORCYCLE: Bike,
  CAR: Car,
  BAKKIE: Car,
  PANEL_VAN: Package,
  LIGHT_TRUCK: Truck,
  MEDIUM_TRUCK: Truck,
  HEAVY_TRUCK: Truck,
  TRAILER_COMBO: Container,
  OTHER: Truck,
};

export function VehicleIcon({
  type,
  className,
}: {
  type: VehicleType | string;
  className?: string;
}) {
  const Icon = ICONS[type as VehicleType] ?? Truck;
  return (
    <Icon
      className={clsx("h-5 w-5 shrink-0 text-amber-400", className)}
      aria-hidden
    />
  );
}

export function VehicleIconLabeled({
  type,
  label,
  className,
}: {
  type: VehicleType | string;
  label?: string;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <VehicleIcon type={type} />
      {label && <span>{label}</span>}
    </span>
  );
}
