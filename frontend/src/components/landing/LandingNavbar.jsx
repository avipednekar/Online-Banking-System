import { RouteLink } from "../common/RouteLink";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/15 bg-white/80 backdrop-blur-xl shadow-[0_32px_32px_-4px_rgba(25,28,30,0.06)]">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6 font-manrope tracking-tight">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-[#00113a]">Vault Financial</span>
          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-slate-500 transition-colors hover:text-[#2a4386]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-slate-500 transition-colors hover:text-[#2a4386]"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-sm text-slate-500 transition-colors hover:text-[#2a4386]"
            >
              Security
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RouteLink
            to="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300/60 bg-white px-5 text-sm font-bold text-[#00113a] transition hover:-translate-y-0.5 hover:border-[#00113a]/30 hover:bg-slate-50"
          >
            Sign In
          </RouteLink>
          <RouteLink
            to="/register"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00113a_0%,#758dd5_100%)] px-5 text-sm font-bold text-white shadow-[0_20px_30px_-20px_rgba(0,17,58,0.95)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Get Started
          </RouteLink>
        </div>
      </div>
    </nav>
  );
}
