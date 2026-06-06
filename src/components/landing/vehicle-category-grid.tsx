import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VEHICLE_CATEGORIES } from "@/lib/vehicle-categories";
import { formatZAR } from "@/lib/sa-data";
import { VehicleIcon } from "@/lib/vehicle-icons";

export function VehicleCategoryGrid() {
  return (
    <section className="border-b border-slate-800 bg-slate-900/20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Choose your vehicle</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            From motorcycles to heavy trucks — matched to your load size and route.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VEHICLE_CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={`#quote`}
                className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-500/40 hover:bg-slate-900"
              >
                <VehicleIcon
                  type={category.vehicleType}
                  className="h-8 w-8 transition group-hover:scale-110"
                />
                <h3 className="mt-4 font-semibold text-white group-hover:text-amber-300">
                  {category.label}
                </h3>
                <p className="mt-2 flex-1 text-sm text-slate-400">{category.description}</p>
                <div className="mt-4 space-y-1 border-t border-slate-800 pt-4 text-sm">
                  <p className="text-slate-500">
                    Capacity:{" "}
                    <span className="text-slate-300">{category.loadCapacity}</span>
                  </p>
                  <p className="font-semibold text-amber-400">
                    From {formatZAR(category.startingPrice)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="#quote"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Get a full quote with your route <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
