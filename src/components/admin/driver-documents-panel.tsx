"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { verificationLabels } from "@/lib/labels";
import type { VerificationStatus } from "@/lib/types";

type DriverDocumentsPanelProps = {
  driverId: string;
  verificationStatus: string;
  reviewNotes: string | null;
  documents: {
    idDocumentUrl: string | null;
    licenseDocumentUrl: string | null;
    proofOfAddressUrl: string | null;
    vehicleRegistrationUrl: string | null;
    vehiclePhotos: string[];
  };
};

function DocLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 px-4 py-3">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xs text-slate-600">Not uploaded</p>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 transition hover:border-amber-500/40"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <ExternalLink className="h-4 w-4 text-amber-400" />
    </a>
  );
}

export function DriverDocumentsPanel({
  driverId,
  verificationStatus,
  reviewNotes,
  documents,
}: DriverDocumentsPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState(reviewNotes ?? "");

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch(`/api/admin/drivers/${driverId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        reviewNotes: action === "reject" ? notes : undefined,
      }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Verification documents</h2>
          <p className="mt-1 text-sm text-slate-400">
            Review uploaded ID, licence, and vehicle documents before approval.
          </p>
        </div>
        <StatusBadge
          label={verificationLabels[verificationStatus as VerificationStatus]}
          tone={
            verificationStatus === "APPROVED"
              ? "green"
              : verificationStatus === "REJECTED"
                ? "red"
                : "amber"
          }
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DocLink label="SA ID document" url={documents.idDocumentUrl} />
        <DocLink label="Driver's licence" url={documents.licenseDocumentUrl} />
        <DocLink label="Proof of address" url={documents.proofOfAddressUrl} />
        <DocLink label="Vehicle registration" url={documents.vehicleRegistrationUrl} />
      </div>

      {documents.vehiclePhotos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-300">Vehicle photos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {documents.vehiclePhotos.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Vehicle"
                  className="h-20 w-28 rounded-lg border border-slate-700 object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {verificationStatus !== "APPROVED" && (
        <div className="mt-6 space-y-3">
          <label className="block text-sm text-slate-400">
            Review notes (required for rejection)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              placeholder="Reason for rejection or internal notes…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={loading !== null}
              onClick={() => act("approve")}
            >
              {loading === "approve" ? "Approving…" : "Approve driver"}
            </Button>
            <Button
              variant="danger"
              disabled={loading !== null || !notes.trim()}
              onClick={() => act("reject")}
            >
              {loading === "reject" ? "Rejecting…" : "Reject driver"}
            </Button>
            <Link href="/admin/drivers">
              <Button variant="ghost">Back to list</Button>
            </Link>
          </div>
        </div>
      )}

      {reviewNotes && (
        <p className="mt-4 text-sm text-slate-500">
          Previous notes: {reviewNotes}
        </p>
      )}
    </div>
  );
}
