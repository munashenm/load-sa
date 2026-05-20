import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { BookingActions } from "@/components/customer/booking-actions";
import {
  bookingStatusLabels,
  cargoSizeLabels,
  serviceTypeLabels,
  shuttleTripLabels,
  urgencyLabels,
  vehicleTypeLabels,
} from "@/lib/labels";
import { formatZAR } from "@/lib/sa-data";
import type {
  BookingStatus,
  CargoSize,
  DeliveryUrgency,
  ServiceType,
  ShuttleTripType,
  VehicleType,
} from "@/lib/types";

export type BookingSummaryData = {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  pickupAddress: string;
  pickupCity: string;
  pickupProvince: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffProvince: string;
  vehicleType: string;
  serviceType?: string;
  shuttleTripType?: string | null;
  airportCode?: string | null;
  passengerCount?: number;
  cargoDescription?: string | null;
  cargoSize?: string | null;
  cargoDimensions?: string | null;
  cargoImageUrl?: string | null;
  weightKg?: number | null;
  urgency: string;
  estimatedPrice: number;
  scheduledAt?: Date | null;
  createdAt: Date;
};

function statusTone(status: BookingStatus): "green" | "red" | "blue" | "amber" {
  if (status === "DELIVERED") return "green";
  if (status === "CANCELLED") return "red";
  if (status === "SEARCHING_DRIVER") return "amber";
  return "blue";
}

export function BookingSummaryCard({
  booking,
  showActions = false,
  detailHref,
}: {
  booking: BookingSummaryData;
  showActions?: boolean;
  detailHref?: string;
}) {
  const status = booking.status as BookingStatus;
  const urgency = booking.urgency as DeliveryUrgency;

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {detailHref ? (
          <Link href={detailHref} className="font-mono text-sm text-amber-400 hover:underline">
            {booking.reference}
          </Link>
        ) : (
          <span className="font-mono text-sm text-amber-400">{booking.reference}</span>
        )}
        <StatusBadge label={bookingStatusLabels[status]} tone={statusTone(status)} />
      </div>

      <p className="mt-2 text-sm font-medium text-white">
        {booking.pickupCity} → {booking.dropoffCity}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {booking.pickupAddress} → {booking.dropoffAddress}
      </p>

      {booking.serviceType === "SHUTTLE" && (
        <p className="mt-2 text-xs font-medium text-sky-400">
          {serviceTypeLabels.SHUTTLE}
          {booking.shuttleTripType &&
            ` · ${shuttleTripLabels[booking.shuttleTripType as ShuttleTripType]}`}
          {booking.airportCode && ` · ${booking.airportCode}`}
          {booking.passengerCount != null && ` · ${booking.passengerCount} pax`}
        </p>
      )}

      <dl className="mt-3 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Vehicle</dt>
          <dd className="text-slate-300">
            {vehicleTypeLabels[booking.vehicleType as VehicleType]}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Urgency</dt>
          <dd className="text-slate-300">{urgencyLabels[urgency]}</dd>
        </div>
        {booking.cargoSize && (
          <div>
            <dt className="text-slate-500">Size</dt>
            <dd className="text-slate-300">
              {cargoSizeLabels[booking.cargoSize as CargoSize]}
            </dd>
          </div>
        )}
        {booking.weightKg != null && (
          <div>
            <dt className="text-slate-500">Weight</dt>
            <dd className="text-slate-300">{booking.weightKg} kg</dd>
          </div>
        )}
        {booking.scheduledAt && (
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Pickup scheduled</dt>
            <dd className="text-slate-300">
              {new Date(booking.scheduledAt).toLocaleString("en-ZA")}
            </dd>
          </div>
        )}
      </dl>

      {booking.cargoDescription && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{booking.cargoDescription}</p>
      )}
      {booking.cargoDimensions && (
        <p className="text-xs text-slate-500">Dimensions: {booking.cargoDimensions}</p>
      )}

      {booking.cargoImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={booking.cargoImageUrl}
          alt="Cargo"
          className="mt-3 h-24 w-32 rounded-lg border border-slate-700 object-cover"
        />
      )}

      <p className="mt-3 text-lg font-bold text-amber-300">{formatZAR(booking.estimatedPrice)}</p>

      {showActions && (
        <BookingActions
          bookingId={booking.id}
          paymentStatus={booking.paymentStatus}
          amount={booking.estimatedPrice}
        />
      )}
    </article>
  );
}
