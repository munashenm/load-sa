"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminDriverActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/verify/${profileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <Button
        variant="secondary"
        className="!py-2 text-xs"
        disabled={!!loading}
        onClick={() => act("approve")}
      >
        {loading === "approve" ? "…" : "Approve"}
      </Button>
      <Button
        variant="danger"
        className="!py-2 text-xs"
        disabled={!!loading}
        onClick={() => act("reject")}
      >
        {loading === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}
