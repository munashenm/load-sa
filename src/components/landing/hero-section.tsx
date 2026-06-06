import Link from "next/link";
import { ArrowRight, Building2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/85 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300 ring-1 ring-amber-500/30">
          <Truck className="h-4 w-4" />
          {BRAND_TAGLINE}
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {BRAND_TAGLINE} with{" "}
          <span className="text-amber-400">{BRAND_NAME}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Book trusted drivers and transport providers for deliveries, furniture moving,
          business logistics, parcels, and heavy loads across South Africa.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="#quote">
            <Button className="gap-2 px-6 py-3 text-base">
              Get Instant Quote <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?role=driver">
            <Button variant="secondary" className="gap-2 px-6 py-3 text-base">
              Become a Driver <Truck className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?role=customer&business=1">
            <Button variant="ghost" className="gap-2 border border-slate-700 px-6 py-3 text-base">
              <Building2 className="h-4 w-4" />
              Business Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
