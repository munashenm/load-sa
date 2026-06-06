import { ClipboardList, CreditCard, MapPin, Truck, UserCheck } from "lucide-react";

const STEPS = [
  {
    icon: MapPin,
    title: "Enter your route",
    text: "Pickup, delivery, and optional multi-stop destinations across all 9 provinces.",
  },
  {
    icon: Truck,
    title: "Choose a vehicle",
    text: "Motorcycle to heavy truck — matched to your load weight and type.",
  },
  {
    icon: ClipboardList,
    title: "Describe your goods",
    text: "Add photos, weight, and delivery timing for an accurate quote.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    text: "Confirm with Paystack. Your booking is sent to verified drivers instantly.",
  },
  {
    icon: UserCheck,
    title: "Track in real time",
    text: "Live map, status updates, chat with your driver, and proof of delivery.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-b border-slate-800 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-white">How FluxMove works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          Book professional logistics in minutes — no phone calls, no guesswork.
        </p>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Step {i + 1}
              </span>
              <step.icon className="mt-3 h-7 w-7 text-amber-400" />
              <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
