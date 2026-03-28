import { useState } from "react";
import { VaultAuthTabs } from "../components/auth/VaultAuthTabs";
import { VaultBrandPanel } from "../components/auth/VaultBrandPanel";
import { VaultLoginPanel } from "../components/auth/VaultLoginPanel";
import { VaultRegisterPanel } from "../components/auth/VaultRegisterPanel";
import { useAuthForms } from "../hooks/useAuthForms";

export default function AuthPage() {
  const { authLoading, loginForm, registerForm, submitLogin, submitRegistration } = useAuthForms();
  const [activeTab, setActiveTab] = useState("register");

  return (
    <section className="auth-experience overflow-hidden rounded-[34px] bg-[#f7f9fb] shadow-[0_32px_90px_-48px_rgba(25,28,30,0.38)]">
      <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-[minmax(0,1.06fr)_minmax(430px,0.94fr)]">
        <VaultBrandPanel />

        <div className="relative bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex h-full w-full max-w-[34rem] flex-col rounded-[30px] bg-white/88 p-6 shadow-[0_32px_80px_-46px_rgba(25,28,30,0.32)] backdrop-blur-xl sm:p-8">
            <header>
              <h2 className="font-manrope text-[2.2rem] font-extrabold tracking-[-0.05em] text-[#102146] sm:text-[2.6rem]">
                Welcome to the Vault
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5f6f90] sm:text-base">
                Access your global financial headquarters through a secure, verified onboarding
                experience.
              </p>
            </header>

            <VaultAuthTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "register" ? (
              <VaultRegisterPanel
                form={registerForm}
                isLoading={authLoading}
                onSubmit={submitRegistration}
              />
            ) : (
              <VaultLoginPanel
                form={loginForm}
                isLoading={authLoading}
                onSubmit={submitLogin}
              />
            )}

            <footer className="mt-10 border-t border-[#eef1f6] pt-5 text-[0.7rem] uppercase tracking-[0.18em] text-[#8b97af] sm:flex sm:items-center sm:justify-between">
              <span>(c) 2026 VaultLine Financial Institutional Services.</span>
              <div className="mt-3 flex gap-5 sm:mt-0">
                <span>Support</span>
                <span>Transparency</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
}
