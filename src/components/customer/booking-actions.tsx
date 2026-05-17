"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatZAR } from "@/lib/sa-data";

export function BookingActions({
  bookingId,
  paymentStatus,
  amount,
}: {
  bookingId: string;
  paymentStatus: string;
  amount: number;
}) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  async function pay() {
    setPaying(true);
    await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
    setPaying(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Link href={`/track/${bookingId}`}>
        <Button variant="secondary" className="!py-2 text-xs">
          Track live
        </Button>
      </Link>
      {paymentStatus !== "PAID" && (
        <Button className="!py-2 text-xs" disabled={paying} onClick={pay}>
          {paying ? "Processing…" : `Pay ${formatZAR(amount)} (MVP)`}
        </Button>
      )}
      {paymentStatus === "PAID" && (
        <span className="self-center text-xs text-emerald-400">Paid</span>
      )}
    </div>
  );
}
