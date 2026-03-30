import { landingImages, landingSteps } from "../../constants/landingContent";
import { RouteLink } from "../common/RouteLink";

function StepCard({ step }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          "mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-black shadow-sm",
          step.highlighted
            ? "border-white bg-[linear-gradient(135deg,#00113a_0%,#758dd5_100%)] text-white shadow-[0_24px_42px_-28px_rgba(0,17,58,0.52)]"
            : "border-[#e6e8ea] bg-white text-[#00113a]"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {step.number}
      </div>
      <h4 className="text-xl font-bold text-[#00113a]">{step.title}</h4>
      <p className="mt-3 max-w-xs text-[#444650]">{step.description}</p>
    </div>
  );
}

export function LandingSteps() {
  return (
    <section id="how-it-works" className="bg-[#f7f9fb] py-24">
      <div className="mx-auto max-w-screen-2xl px-6 text-center">
        <h2 className="font-manrope text-4xl font-extrabold text-[#00113a]">
          Your path to precision banking
        </h2>

        <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {landingSteps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
          <div className="absolute left-[20%] right-[20%] top-10 hidden h-0.5 bg-[#e6e8ea] md:block" />
        </div>

        <div className="mt-20 inline-block max-w-4xl rounded-[28px] bg-[rgba(213,227,252,0.3)] p-12 text-left shadow-[0_24px_42px_-32px_rgba(25,28,30,0.12)]">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="h-32 w-32 flex-shrink-0 rotate-[-3deg] rounded-[20px] bg-white p-4 shadow-[0_28px_44px_-32px_rgba(25,28,30,0.24)]">
              <img
                src={landingImages.premiumCard}
                alt="Vault premium card"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-manrope text-2xl font-bold text-[#00113a]">
                Ready for the Vault?
              </h3>
              <p className="mt-3 text-lg text-[#57657a]">
                Join 50,000+ institutional and retail investors who trust Vault Financial with
                their future.
              </p>
              <RouteLink
                to="/register"
                className="mt-6 inline-block rounded-lg bg-[#00113a] px-6 py-3 font-bold text-white hover:bg-[#2a4386]"
              >
                Start Your Onboarding
              </RouteLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
