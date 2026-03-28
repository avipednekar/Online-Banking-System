import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";
import { assuranceMetrics } from "../../constants/authLayout";

const assuranceIcons = {
  uptime: BadgeCheck,
  encryption: ShieldCheck
};

function AssuranceCard({ metric }) {
  const Icon = assuranceIcons[metric.id];

  return (
    <div className="rounded-[22px] bg-white/14 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
      <Icon className="h-4 w-4 text-[#46efb2]" strokeWidth={2} />
      <div className="mt-5 font-manrope text-[1.65rem] font-extrabold tracking-[-0.03em]">
        {metric.value}
      </div>
      <div className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/68">
        {metric.label}
      </div>
    </div>
  );
}

export function VaultBrandPanel() {
  return (
    <aside className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#00113a_0%,#233a7b_56%,#6f85ca_100%)] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(70,239,178,0.18),transparent_26%)]" />
      <div className="absolute -left-24 top-28 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
      <div className="absolute bottom-16 right-0 h-72 w-72 rounded-full bg-[#46efb2]/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="inline-flex items-center gap-3 self-start rounded-full bg-white/12 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#00113a]">
            <Building2 className="h-5 w-5" strokeWidth={2.1} />
          </div>
          <div>
            <div className="font-manrope text-lg font-extrabold tracking-[-0.03em]">VaultLine</div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/62">
              Financial Command
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-[31rem] sm:mt-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-white/58">
            The Digital Vault
          </p>
          <h1 className="mt-5 max-w-[9ch] font-manrope text-[clamp(3.4rem,7vw,6.25rem)] font-extrabold leading-[0.9] tracking-[-0.06em]">
            Institutional security,
            <span className="block text-[#46efb2]">unlocked</span>
            for you.
          </h1>
          <p className="mt-6 max-w-[27rem] text-base leading-8 text-white/72 sm:text-lg">
            Experience the Digital Vault, a premium onboarding environment built for high-trust
            banking relationships, verified identity flows, and precision-grade customer intake.
          </p>
        </div>

        <div className="mt-10 grid max-w-[28rem] gap-4 sm:grid-cols-2">
          {assuranceMetrics.map((metric) => (
            <AssuranceCard key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="relative mt-10 w-[188px] rotate-[-6deg] self-end rounded-[28px] bg-[#020817] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] lg:mt-auto">
          <div className="absolute inset-4 rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(117,141,213,0.2),transparent_48%),linear-gradient(160deg,#06112c,#08152f_52%,#030812)]" />
          <div className="relative h-44 overflow-hidden rounded-[22px]">
            <div className="absolute left-1/2 top-7 h-24 w-24 -translate-x-1/2 rounded-[24px] bg-[linear-gradient(160deg,#111f48,#050b1f)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
            <div className="absolute left-[3.35rem] top-[2.3rem] h-24 w-24 rotate-[24deg] rounded-[22px] border border-white/10" />
            <div className="absolute left-[3.45rem] top-[2.4rem] h-24 w-24 rotate-[48deg] rounded-[22px] border border-white/6" />
            <div className="absolute bottom-8 left-5 h-[3px] w-9 rounded-full bg-[#46efb2]" />
            <div className="absolute bottom-6 left-5 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/58">
              Secure Core
            </div>
            <div className="absolute bottom-3 left-5 text-sm font-semibold text-white">
              Protocol v4.2
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
