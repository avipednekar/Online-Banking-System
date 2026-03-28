export function VaultSectionHeading({ step, title }) {
  return (
    <div className="mt-8 flex items-center gap-3 first:mt-0">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#00113a] text-[0.66rem] font-semibold tracking-[0.16em] text-white">
        {step}
      </span>
      <h2 className="font-manrope text-[1.02rem] font-extrabold text-[#102146]">{title}</h2>
    </div>
  );
}
