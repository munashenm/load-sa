import Link from "next/link";
import { Package, Plane } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function BookHubPage() {
  await requireUser(["CUSTOMER"], "/book");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-white">What do you need?</h1>
      <p className="mt-2 text-slate-400">
        Choose freight delivery or passenger shuttle & private hire.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          href="/book/freight"
          className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-amber-500/40"
        >
          <Package className="h-10 w-10 text-amber-400" />
          <h2 className="mt-4 text-lg font-semibold text-white group-hover:text-amber-300">
            Freight & delivery
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Parcels, furniture, equipment, trucks — anything that needs to move as cargo.
          </p>
        </Link>

        <Link
          href="/book/shuttle"
          className="group rounded-2xl border border-sky-800/50 bg-sky-950/20 p-6 transition hover:border-sky-500/40"
        >
          <Plane className="h-10 w-10 text-sky-400" />
          <h2 className="mt-4 text-lg font-semibold text-white group-hover:text-sky-300">
            Shuttle & private hire
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Airport transfers (OR Tambo, Cape Town, Durban & more) and hourly private chauffeur.
          </p>
        </Link>
      </div>

      <Link href="/customer" className="mt-8 inline-block text-sm text-amber-400 hover:underline">
        View my bookings →
      </Link>
    </div>
  );
}
