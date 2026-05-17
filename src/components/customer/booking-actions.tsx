"use client";

import Link from "next/link";
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
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPaying(true);
    setError(null);
    const res = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
    const data = await res.json();
    setPaying(false);

    if (!res.ok) {
      setError(data.error ?? "Payment could not start");
      return;
    }

    window.location.href = data.checkoutUrl ?? `/pay/checkout/${bookingId}`;
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
          {paying ? "Redirecting…" : `Pay ${formatZAR(amount)} with PayFast`}
        </Button>
      )}
      {paymentStatus === "PAID" && (
        <span className="self-center text-xs text-emerald-400">Paid</span>
      )}
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  );
}
