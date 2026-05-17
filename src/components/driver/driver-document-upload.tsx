"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";

type DocField =
  | "idDocumentUrl"
  | "licenseDocumentUrl"
  | "proofOfAddressUrl"
  | "vehicleRegistrationUrl";

const FIELDS: { key: DocField; label: string }[] = [
  { key: "idDocumentUrl", label: "ID document" },
  { key: "licenseDocumentUrl", label: "Driver's licence" },
  { key: "proofOfAddressUrl", label: "Proof of address" },
  { key: "vehicleRegistrationUrl", label: "Vehicle registration" },
];

export function DriverDocumentUpload({
  defaults,
}: {
  defaults: Record<string, string | null | undefined>;
}) {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const { key } of FIELDS) {
      if (defaults[key]) init[key] = defaults[key] as string;
    }
    if (defaults.vehiclePhotosJson) {
      try {
        const arr = JSON.parse(defaults.vehiclePhotosJson) as string[];
        arr.forEach((u, i) => {
          init[`vehiclePhoto_${i}`] = u;
        });
      } catch {
        /* ignore */
      }
    }
    return init;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [vehicleFiles, setVehicleFiles] = useState<File[]>([]);

  async function uploadFile(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  }

  async function handleDoc(key: DocField, file: File) {
    setLoading(key);
    const url = await uploadFile(file);
    if (url) {
      setUrls((u) => ({ ...u, [key]: url }));
      await saveDocuments({ ...urls, [key]: url });
    }
    setLoading(null);
    router.refresh();
  }

  async function saveDocuments(partial: Record<string, string>) {
    const vehiclePhotos = [
      ...Object.keys(partial)
        .filter((k) => k.startsWith("vehiclePhoto_"))
        .map((k) => partial[k]),
      ...(
        await Promise.all(vehicleFiles.map((f) => uploadFile(f)))
      ).filter(Boolean) as string[],
    ];

    await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documents: {
          idDocumentUrl: partial.idDocumentUrl ?? urls.idDocumentUrl,
          licenseDocumentUrl:
            partial.licenseDocumentUrl ?? urls.licenseDocumentUrl,
          proofOfAddressUrl:
            partial.proofOfAddressUrl ?? urls.proofOfAddressUrl,
          vehicleRegistrationUrl:
            partial.vehicleRegistrationUrl ?? urls.vehicleRegistrationUrl,
          vehiclePhotosJson:
            vehiclePhotos.length > 0 ? JSON.stringify(vehiclePhotos) : undefined,
        },
      }),
    });
  }

  async function submitVehiclePhotos() {
    setLoading("vehiclePhotos");
    await saveDocuments(urls);
    setVehicleFiles([]);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {FIELDS.map(({ key, label }) => (
        <div key={key} className="rounded-xl border border-slate-800 p-4">
          <Label>{label}</Label>
          {urls[key] ? (
            <p className="mt-1 text-xs text-emerald-400">Uploaded ✓</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Not uploaded</p>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            className="mt-2 block w-full text-sm text-slate-400"
            disabled={loading === key}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleDoc(key, f);
            }}
          />
        </div>
      ))}
      <div className="rounded-xl border border-slate-800 p-4">
        <Label>Vehicle photos</Label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-2 block w-full text-sm text-slate-400"
          onChange={(e) => setVehicleFiles(Array.from(e.target.files ?? []))}
        />
        <Button
          type="button"
          className="mt-3"
          disabled={loading === "vehiclePhotos" || vehicleFiles.length === 0}
          onClick={submitVehiclePhotos}
        >
          {loading === "vehiclePhotos" ? "Uploading…" : "Upload vehicle photos"}
        </Button>
      </div>
    </div>
  );
}
