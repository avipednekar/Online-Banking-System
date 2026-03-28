import { Bolt } from "lucide-react";
import { RouteLink } from "../common/RouteLink";

export function LandingQuickFab() {
  return (
    <RouteLink
      to="/register"
      className="group fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00113a_0%,#758dd5_100%)] text-white shadow-[0_32px_52px_-24px_rgba(0,17,58,0.5)] transition-transform hover:translate-y-0 active:scale-95"
      aria-label="Quick actions"
    >
      <Bolt className="h-6 w-6 transition-transform group-hover:rotate-12" />
      <span className="absolute right-16 hidden rounded-lg bg-[#00113a] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
        Quick Actions
      </span>
    </RouteLink>
  );
}
