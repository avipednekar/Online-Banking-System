import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  Send,
  ShieldCheck
} from "lucide-react";
import { landingFeatureCards } from "../../constants/landingContent";

const featureIcons = {
  "secure-assets": ShieldCheck,
  "quick-transfers": Send,
  "smart-analytics": ChartNoAxesCombined,
  "institutional-integrity": Building2
};

function FeatureCard({ feature }) {
  const Icon = featureIcons[feature.id];

  if (feature.variant === "wide") {
    return (
      <div className="flex flex-col justify-between rounded-[24px] bg-white p-10 shadow-[0_24px_42px_-32px_rgba(25,28,30,0.18)] transition-transform hover:-translate-y-1 md:col-span-2">
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#002f1e]">
            <Icon className="h-7 w-7 text-[#6ffbbe]" />
          </div>
          <h3 className="text-2xl font-bold text-[#00113a]">{feature.title}</h3>
          <p className="mt-4 max-w-md leading-7 text-[#444650]">{feature.description}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#eceef0] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#444650]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (feature.variant === "dark") {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-[#00113a] p-10 text-white">
        <div className="relative z-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold">{feature.title}</h3>
          <p className="mt-4 leading-7 text-[#dbe1ff]">{feature.description}</p>
        </div>
        <div className="absolute -bottom-10 right-0 text-[12rem] font-black text-white/10">$</div>
      </div>
    );
  }

  if (feature.variant === "split") {
    return (
      <div className="flex flex-col gap-8 rounded-[24px] bg-white p-10 shadow-[0_24px_42px_-32px_rgba(25,28,30,0.18)] md:col-span-2 md:flex-row md:items-center">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#00113a]">{feature.title}</h3>
          <p className="mt-4 leading-7 text-[#444650]">{feature.description}</p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 border-b-2 border-[#00113a]/20 bg-transparent p-0 pb-1 font-bold text-[#00113a] hover:translate-y-0 hover:border-[#00113a] hover:bg-transparent"
          >
            Learn about our compliance
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="h-48 flex-1 overflow-hidden rounded-xl bg-[#eceef0]">
          <img src={feature.image} alt="Institutional strength" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-white p-10 shadow-[0_24px_42px_-32px_rgba(25,28,30,0.18)] transition-transform hover:-translate-y-1">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#d5e3fc]">
        <Icon className="h-7 w-7 text-[#57657a]" />
      </div>
      <h3 className="text-2xl font-bold text-[#00113a]">{feature.title}</h3>
      <p className="mt-4 leading-7 text-[#444650]">{feature.description}</p>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section className="bg-[#f2f4f6] py-24">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="mb-16">
          <h2 className="font-manrope text-4xl font-extrabold text-[#00113a]">
            Engineered for Excellence
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-[#444650]">
            We&apos;ve removed the friction from high-stakes finance without compromising on
            institutional rigor.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {landingFeatureCards.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
