import { HeroSection } from "@/components/landing/hero-section";
import { InstantQuoteCalculator } from "@/components/landing/instant-quote-calculator";
import { VehicleCategoryGrid } from "@/components/landing/vehicle-category-grid";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TrustSection } from "@/components/landing/trust-section";

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <InstantQuoteCalculator />
      </section>

      <VehicleCategoryGrid />
      <HowItWorksSection />
      <TrustSection />
    </div>
  );
}
