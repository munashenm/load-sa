"use client";

import { BookingWizard } from "@/components/booking/booking-wizard";

export function BusinessBookingWizard({
  businessId,
  monthlyInvoicing,
}: {
  businessId: string;
  monthlyInvoicing: boolean;
}) {
  return (
    <BookingWizard
      businessId={businessId}
      monthlyInvoicing={monthlyInvoicing}
      successBasePath={`/business/${businessId}`}
    />
  );
}
