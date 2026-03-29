import { RouteLink } from "../common/RouteLink";
import { landingNavItems } from "../../constants/landingContent";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/15 bg-white/80 backdrop-blur-xl shadow-[0_32px_32px_-4px_rgba(25,28,30,0.06)]">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6 font-manrope tracking-tight">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-[#00113a]">Vault Financial</span>
          <div className="hidden items-center gap-6 md:flex">
            {landingNavItems.map((item, index) => (
              <a
                key={item}
                className={[
                  "text-sm transition-colors",
                  index === 0
                    ? "border-b-2 border-[#00113a] pb-1 font-bold text-[#00113a]"
                    : "text-slate-500 hover:text-[#2a4386]"
                ]
                  .filter(Boolean)
                  .join(" ")}
                href="#"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RouteLink
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300/60 bg-white px-5 text-sm font-bold text-[#00113a] transition hover:-translate-y-0.5 hover:border-[#00113a]/30 hover:bg-slate-50"
          >
            Login
          </RouteLink>
          <RouteLink
            to="/register"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00113a_0%,#758dd5_100%)] px-5 text-sm font-bold text-white shadow-[0_20px_30px_-20px_rgba(0,17,58,0.95)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Register
          </RouteLink>
        </div>
      </div>
    </nav>
  );
}
