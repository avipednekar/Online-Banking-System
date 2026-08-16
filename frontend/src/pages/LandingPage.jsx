import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingSchemes } from "../components/landing/LandingSchemes";
import { LandingSteps } from "../components/landing/LandingSteps";

export default function LandingPage() {
  return (
    <main className="w-full bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingNavbar />
      <LandingHero />
      <LandingSchemes />
      <LandingFeatures />
      <LandingSteps />
      <LandingFooter />
    </main>
  );
}
