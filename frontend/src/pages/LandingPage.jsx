import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingQuickFab } from "../components/landing/LandingQuickFab";
import { LandingSteps } from "../components/landing/LandingSteps";

export default function LandingPage() {
  return (
    <section className="overflow-hidden rounded-[34px] bg-[#f7f9fb] shadow-[0_32px_90px_-48px_rgba(25,28,30,0.38)]">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingSteps />
      <LandingFooter />
      <LandingQuickFab />
    </section>
  );
}
