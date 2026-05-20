import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Plane,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DELIVERY_DESCRIPTION, VEHICLE_OPTIONS } from "@/lib/sa-data";
import { SHUTTLE_DESCRIPTION } from "@/lib/shuttle-data";
import { VehicleIcon } from "@/lib/vehicle-icons";
import type { VehicleType } from "@/lib/types";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300 ring-1 ring-amber-500/30">
            <MapPin className="h-4 w-4" />
            Nationwide · South Africa
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Move anything, anywhere in{" "}
            <span className="text-amber-400">Mzansi</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">{DELIVERY_DESCRIPTION}</p>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            From motorcycles and bakkies to heavy trucks — empty returns from Cape Town
            to Joburg and every province in between.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register?role=customer">
              <Button className="gap-2">
                Book a delivery <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?role=driver">
              <Button variant="secondary" className="gap-2">
                Drive & earn <Truck className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-b border-slate-800 px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <Plane className="h-10 w-10 text-sky-400" />
          <h2 className="mt-4 text-2xl font-bold text-white">Load SA Shuttle</h2>
          <p className="mt-2 max-w-xl text-slate-400">{SHUTTLE_DESCRIPTION}</p>
          <Link href="/register?role=customer" className="mt-6">
            <Button variant="secondary" className="gap-2">
              Book airport transfer <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-white">
          Every vehicle type, every route
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-400">
          Especially drivers returning empty — turn dead miles into paid backhauls.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VEHICLE_OPTIONS.slice(0, 4).map((v) => (
            <li
              key={v.value}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <VehicleIcon type={v.value as VehicleType} className="mb-3 h-8 w-8" />
              <h3 className="font-semibold text-white">{v.label}</h3>
              <p className="mt-1 text-sm text-slate-400">{v.description}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VEHICLE_OPTIONS.slice(4).map((v) => (
            <li
              key={v.value}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <VehicleIcon type={v.value as VehicleType} className="mb-3 h-8 w-8" />
              <h3 className="font-semibold text-white">{v.label}</h3>
              <p className="mt-1 text-sm text-slate-400">{v.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
          <Feature
            icon={<ShieldCheck className="h-8 w-8 text-amber-400" />}
            title="Verified drivers"
            text="ID, licence and vehicle checks before drivers accept paid jobs."
          />
          <Feature
            icon={<Users className="h-8 w-8 text-amber-400" />}
            title="Customers book in minutes"
            text="Pickup, drop-off, cargo details and instant ZAR estimates."
          />
          <Feature
            icon={<MapPin className="h-8 w-8 text-amber-400" />}
            title="All 9 provinces"
            text="Johannesburg to Durban, Cape Town to Polokwane — coast to coast."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div>
      {icon}
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{text}</p>
    </div>
  );
}
