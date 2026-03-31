import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { RouteLink } from "../components/common/RouteLink";
import { useAuthForms } from "../hooks/useAuthForms";

function LoginField({
  label,
  name,
  value,
  onChange,
  error,
  icon: Icon,
  type = "text",
  placeholder,
  trailing = null
}) {
  return (
    <label className="vault-login-field">
      {label ? <span>{label}</span> : null}
      <div className="vault-login-input-shell">
        <Icon className="vault-login-input-icon" size={16} strokeWidth={1.9} />
        <input
          name={name}
          value={value}
          type={type}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          placeholder={placeholder}
          className={`vault-login-input ${trailing ? "has-trailing" : ""}`.trim()}
          required
        />
        {trailing ? <div className="vault-login-input-trailing">{trailing}</div> : null}
      </div>
      {error ? (
        <span id={`${name}-error`} className="vault-field-error">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function LoginPage() {
  const { authLoading, loginForm, submitLogin } = useAuthForms();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="vault-login-page">
      <div className="vault-login-layout">
        <aside className="vault-login-brand-panel">
          <div className="vault-login-brand-overlay" />
          <div className="vault-login-network" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="vault-login-brand-content">
            <div className="vault-login-shield">
              <ShieldCheck size={38} strokeWidth={2.2} />
            </div>
            <h1>Vault Financial</h1>
            <p>Secure your assets with institutional precision.</p>

            <div className="vault-login-badges">
              <div>
                <ShieldCheck size={18} strokeWidth={2} />
                <span>ISO 27001 Certified</span>
              </div>
              <div>
                <LockKeyhole size={18} strokeWidth={2} />
                <span>AES-256 Encrypted</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="vault-login-form-panel">
          <div className="vault-login-mobile-brand">
            <RouteLink to="/" className="vault-login-home-link">
              Vault Financial
            </RouteLink>
          </div>

          <div className="vault-login-form-wrap">
            <div className="vault-login-header">
              <RouteLink to="/" className="vault-login-back-link">
                &larr; Back to home
              </RouteLink>
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access your secure portfolio.</p>
            </div>

            <form className="vault-login-form-card" onSubmit={submitLogin}>
              <LoginField
                label="Username"
                name="username"
                value={loginForm.values.username}
                onChange={loginForm.setValue}
                error={loginForm.errors.username}
                icon={UserRound}
                placeholder="Enter your registered identifier"
              />

              <div className="vault-login-password-header">
                <span>Password</span>
                <span className="vault-login-text-muted">
                  Forgot Password? <em>Coming Soon</em>
                </span>
              </div>

              <LoginField
                label=""
                name="password"
                value={loginForm.values.password}
                onChange={loginForm.setValue}
                error={loginForm.errors.password}
                icon={LockKeyhole}
                type={showPassword ? "text" : "password"}
                placeholder="........"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="vault-login-visibility"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={1.9} />
                    ) : (
                      <Eye size={16} strokeWidth={1.9} />
                    )}
                  </button>
                }
              />

              <button type="submit" className="vault-login-submit" disabled={authLoading}>
                {authLoading ? "Authenticating..." : "Sign In to Vault"}
                <ArrowRight size={18} strokeWidth={2} />
              </button>
            </form>

            <div className="vault-login-divider">
              <span>Or institutional access</span>
            </div>

            <div className="vault-login-alt-actions">
              <button type="button" className="vault-login-alt-button" disabled>
                <Fingerprint size={16} strokeWidth={2} />
                Biometrics
              </button>
              <button type="button" className="vault-login-alt-button" disabled>
                <KeyRound size={16} strokeWidth={2} />
                SSO
              </button>
            </div>

            <p className="vault-login-signup">
              Don&apos;t have an account? <RouteLink to="/register">Create Account</RouteLink>
            </p>
          </div>
        </section>
      </div>

      <footer className="vault-login-footer">
        <p>&copy; 2026 The Digital Vault. All rights reserved.</p>
        <nav>
          <span className="vault-login-footer-link">Privacy Policy</span>
          <span className="vault-login-footer-link">Terms of Service</span>
          <span className="vault-login-footer-link">Security Guarantee</span>
          <span className="vault-login-footer-link">Contact</span>
        </nav>
      </footer>
    </section>
  );
}
