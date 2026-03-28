import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { VaultField } from "./VaultField";
import { VaultSectionHeading } from "./VaultSectionHeading";

export function VaultLoginPanel({ form, isLoading, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
      <VaultSectionHeading step="01" title="Secure Sign In" />
      <div className="mt-4 grid gap-4">
        <VaultField
          label="Username"
          name="username"
          value={form.values.username}
          onChange={form.setValue}
          error={form.errors.username}
          icon={Fingerprint}
          placeholder="johndoe.vault"
          required
        />
        <VaultField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.values.password}
          onChange={form.setValue}
          error={form.errors.password}
          icon={LockKeyhole}
          placeholder="Enter your password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-full bg-transparent p-2 text-[#7282a2] hover:translate-y-0 hover:bg-white hover:text-[#102146]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.9} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.9} />
              )}
            </button>
          }
        />
      </div>

      <div className="mt-6 rounded-[24px] bg-[#f2f4f6] p-5 text-sm leading-7 text-[#5d6f94]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#1fce91]" strokeWidth={1.9} />
          <p className="m-0">
            Role-aware access keeps customer and administrative sessions behind the same verified
            entry point without exposing separate login surfaces.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#00113a,#758dd5)] px-6 py-4 text-sm font-semibold text-white shadow-[0_24px_48px_-30px_rgba(0,17,58,0.9)] transition duration-200 hover:translate-y-0 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Authenticating access..." : "Enter Secure Workspace"}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </form>
  );
}
