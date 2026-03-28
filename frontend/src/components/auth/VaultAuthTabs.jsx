function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`vault-mode-tab ${active ? "is-active" : ""}`.trim()}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function VaultAuthTabs({ activeTab, onChange }) {
  return (
    <div className="vault-mode-switch" role="tablist" aria-label="Authentication mode">
      <TabButton active={activeTab === "login"} onClick={() => onChange("login")}>
        Login
      </TabButton>
      <TabButton active={activeTab === "register"} onClick={() => onChange("register")}>
        Register
      </TabButton>
    </div>
  );
}
