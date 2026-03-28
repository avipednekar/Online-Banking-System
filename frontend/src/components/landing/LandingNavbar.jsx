import { Bell, Settings } from "lucide-react";
import { landingImages, landingNavItems } from "../../constants/landingContent";

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

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-transparent p-2 text-slate-500 hover:translate-y-0 hover:bg-slate-50 hover:text-[#00113a]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full bg-transparent p-2 text-slate-500 hover:translate-y-0 hover:bg-slate-50 hover:text-[#00113a]"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-[rgba(117,118,130,0.15)]">
            <img
              src={landingImages.avatar}
              alt="User profile avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
