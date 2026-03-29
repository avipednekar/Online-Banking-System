import { RouteLink } from "../common/RouteLink";
import { landingImages } from "../../constants/landingContent";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f9fb] py-20 lg:py-28">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="inline-block rounded-full bg-[#d5e3fc] px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#57657a]">
            Next-Gen Digital Banking
          </span>
          <h1 className="mt-6 max-w-[11ch] font-manrope text-5xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#00113a] sm:text-6xl lg:text-7xl">
            Secure your <span className="text-[#758dd5]">financial future</span> with clarity.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#444650] lg:text-xl">
            Experience the stability of an institutional vault with the fluid design of modern
            fintech. Your assets, protected by architectural security and managed with precision.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <RouteLink
              to="/login"
              className="rounded-lg bg-[linear-gradient(135deg,#00113a_0%,#758dd5_100%)] px-8 py-4 text-center text-lg font-bold text-white hover:opacity-90"
            >
              Login
            </RouteLink>
            <RouteLink
              to="/register"
              className="rounded-lg bg-[#e6e8ea] px-8 py-4 text-center text-lg font-bold text-[#191c1e] hover:bg-[#e0e3e5]"
            >
              Register
            </RouteLink>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative z-10 overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_32px_52px_-24px_rgba(25,28,30,0.18)] transition-transform duration-500 lg:rotate-2 lg:hover:rotate-0">
            <img
              src={landingImages.heroPhone}
              alt="Vault Financial app interface"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-[#4edea3]/20 blur-3xl" />
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[#00113a]/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
