import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { VaultField } from "./VaultField";
import { VaultSectionHeading } from "./VaultSectionHeading";

export function VaultLoginPanel({ form, isLoading, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="vault-auth-form vault-login-form">
      <VaultSectionHeading step="01" title="Secure Sign In" />
      <p className="vault-form-intro">
        Authenticate through the same verified entry point used to route customer and operator
        access.
      </p>

      <div className="vault-field-grid">
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
              className="vault-icon-button"
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

      <div className="vault-login-note">
        <div className="vault-note-row">
          <ShieldCheck className="vault-note-icon" strokeWidth={1.9} />
          <p>
            Role-aware access keeps customer and administrative sessions behind the same verified
            entry point without exposing separate login surfaces.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="vault-primary-button vault-form-submit"
      >
        {isLoading ? "Authenticating access..." : "Enter Secure Workspace"}
        <ArrowRight size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
