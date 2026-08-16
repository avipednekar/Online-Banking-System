import { ShieldCheck } from "lucide-react";
import { RouteLink } from "../common/RouteLink";

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="mx-auto max-w-screen-2xl px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold text-base shadow-sm">
                VF
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Vault Financial</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Institutional-grade digital banking platform with high-yield savings, guaranteed fixed deposits, and real-time fund transfer rails.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>DICGC Insured — Eligible deposits protected up to ₹5,00,000</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Banking Schemes</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#schemes" className="hover:text-emerald-400 transition">SuperSaver Savings (7.20% p.a.)</a></li>
              <li><a href="#schemes" className="hover:text-emerald-400 transition">Fixed Deposit Accelerator (8.10% p.a.)</a></li>
              <li><a href="#schemes" className="hover:text-emerald-400 transition">Smart Recurring Deposit</a></li>
              <li><a href="#schemes" className="hover:text-emerald-400 transition">Commercial Current Plus</a></li>
            </ul>
          </div>

          {/* Portal Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Portal Access</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><RouteLink to="/login" className="hover:text-emerald-400 transition">Customer Sign In</RouteLink></li>
              <li><RouteLink to="/register" className="hover:text-emerald-400 transition">Open Digital Account</RouteLink></li>
              <li><RouteLink to="/login" className="hover:text-emerald-400 transition">Admin Console Access</RouteLink></li>
              <li><a href="#calculator" className="hover:text-emerald-400 transition">Yield Calculator</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 Vault Financial Services. All rights reserved. Registered with Reserve Bank of India regulatory compliance guidelines.</p>
          <div className="flex gap-6">
            <a href="#schemes" className="hover:text-slate-400 transition">Privacy Policy</a>
            <a href="#schemes" className="hover:text-slate-400 transition">Terms of Service</a>
            <a href="#security" className="hover:text-slate-400 transition">Security Centre</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
