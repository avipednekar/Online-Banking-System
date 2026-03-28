function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-5 py-2.5 text-sm font-semibold transition duration-200",
        active
          ? "bg-[linear-gradient(135deg,#00113a,#758dd5)] text-white shadow-[0_18px_40px_-26px_rgba(0,17,58,0.78)] hover:translate-y-0 hover:bg-[linear-gradient(135deg,#00113a,#758dd5)]"
          : "bg-transparent text-[#5d6f94] hover:translate-y-0 hover:bg-white hover:text-[#102146]"
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

export function VaultAuthTabs({ activeTab, onChange }) {
  return (
    <div className="mt-6 inline-flex w-fit rounded-[22px] bg-[#f2f4f6] p-1">
      <TabButton active={activeTab === "login"} onClick={() => onChange("login")}>
        Login
      </TabButton>
      <TabButton active={activeTab === "register"} onClick={() => onChange("register")}>
        Register
      </TabButton>
    </div>
  );
}
