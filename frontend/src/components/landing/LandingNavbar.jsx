import { ArrowRight, ShieldCheck } from "lucide-react";
import { RouteLink } from "../common/RouteLink";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <RouteLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              VF
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">Vault Financial</span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Digital Banking</span>
            </div>
          </RouteLink>

          <div className="hidden items-center gap-6 md:flex text-xs font-semibold text-slate-600">
            <a href="#schemes" className="transition-colors hover:text-emerald-600">
              Banking Schemes
            </a>
            <a href="#calculator" className="transition-colors hover:text-emerald-600">
              Yield Calculator
            </a>
            <a href="#features" className="transition-colors hover:text-emerald-600">
              App Features
            </a>
            <a href="#security" className="transition-colors hover:text-emerald-600">
              Security
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-emerald-600">
              How It Works
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RouteLink
            to="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Sign In
          </RouteLink>
          <RouteLink
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow"
          >
            <span>Open Account</span>
            <ArrowRight size={13} />
          </RouteLink>
        </div>
      </div>
    </nav>
  );
}
