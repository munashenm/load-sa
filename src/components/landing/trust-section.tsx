import { Building2, MapPin, ShieldCheck, Users } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified drivers",
    text: "SA ID, driver's licence, vehicle registration, and admin approval before any paid job.",
  },
  {
    icon: Users,
    title: "Trusted nationwide network",
    text: "Customers and drivers across Johannesburg, Cape Town, Durban, and every province.",
  },
  {
    icon: MapPin,
    title: "Real-time tracking",
    text: "Live delivery status, GPS map, and chat from booking to proof of delivery.",
  },
  {
    icon: Building2,
    title: "Business-ready",
    text: "Bulk bookings, scheduled routes, and invoicing for companies moving goods at scale.",
  },
];

export function TrustSection() {
  return (
    <section className="border-b border-slate-800 bg-slate-900/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-white">
          Built for South African logistics
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          Professional on-demand delivery — priced in ZAR, compliant with local standards.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6"
            >
              <f.icon className="h-8 w-8 text-amber-400" />
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
