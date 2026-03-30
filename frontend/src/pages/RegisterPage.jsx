import { useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { RouteLink } from "../components/common/RouteLink";
import { countryOptions } from "../constants/authLayout";
import { genderOptions } from "../constants/forms";
import { useAuthForms } from "../hooks/useAuthForms";

const DECORATIVE_CARD_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHyrWateDY0qTuOJTA7gd6_u1RT5y5zUufcWTU23v2416sGAftqgcI0pM5U8cveZ7o06XnaGQ533gR1_89d_X-KqYNDHDE3qYe7sS320jEFq2ePlMuVXdJOSBi5HdEUASRxQz0qo01o_6SXM9Hik9lckUg7NtcWF72mnV8R3ZBPb6qIlv5txGbxGxaiJy7j9ppWcIfgvMunWfHsBPK1P-rgVMFQJZErXJv_BYnILXN6mvNuS-QuHgKxJ1LszHOyJdYWpZ-EPP_8YXF";

function RegisterField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  options = [],
  trailing = null,
  className = ""
}) {
  const isSelect = type === "select";

  return (
    <label className={`vault-register-field ${className}`.trim()}>
      <span>{label}</span>
      <div className="vault-register-input-shell">
        {isSelect ? (
          <select
            name={name}
            value={value}
            onChange={(event) => onChange(name, event.target.value)}
            className="vault-register-input vault-register-select"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            value={value}
            type={type}
            onChange={(event) => onChange(name, event.target.value)}
            className={`vault-register-input ${trailing ? "has-trailing" : ""}`.trim()}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${name}-error` : undefined}
            placeholder={placeholder}
          />
        )}
        {trailing ? <div className="vault-register-input-trailing">{trailing}</div> : null}
      </div>
      {error ? (
        <span id={`${name}-error`} className="vault-field-error">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function RegisterPage() {
  const { authLoading, registerForm, submitRegistration } = useAuthForms();
  const [showPassword, setShowPassword] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState("");

  const orderedCountryOptions = useMemo(() => {
    const sorted = [...countryOptions];
    sorted.sort((left, right) => {
      if (left.value === "United States") {
        return -1;
      }

      if (right.value === "United States") {
        return 1;
      }

      return left.label.localeCompare(right.label);
    });
    return sorted;
  }, []);

  async function handleSubmit(event) {
    if (!consentAccepted) {
      event.preventDefault();
      setConsentError("You must agree to the terms to continue.");
      return;
    }

    setConsentError("");
    await submitRegistration(event);
  }

  return (
    <section className="vault-register-page">
      <div className="vault-register-layout">
        <aside className="vault-register-brand-panel">
          <div className="vault-register-brand-overlay" />
          <div className="vault-register-texture" />

          <div className="vault-register-brand-content">
            <div className="vault-register-brand">
              <span className="vault-register-brand-mark" aria-hidden="true">
                <Lock size={18} strokeWidth={2.3} />
              </span>
              <span>Vault Financial</span>
            </div>

            <h1>
              Institutional security,
              <span> unlocked </span>
              for you.
            </h1>
            <p>
              Experience the Digital Vault, a new standard in asset management where precision
              meets performance.
            </p>

            <div className="vault-register-metrics">
              <article>
                <ShieldCheck size={16} strokeWidth={2} />
                <strong>99.9%</strong>
                <span>Uptime SLA</span>
              </article>
              <article>
                <Lock size={16} strokeWidth={2} />
                <strong>AES-256</strong>
                <span>Encryption</span>
              </article>
            </div>
          </div>

          <div className="vault-register-floating-card">
            <img alt="Secure Core Protocol card" src={DECORATIVE_CARD_IMAGE} />
            <div>
              <span />
              <p>Secure Core Protocol v4.2</p>
            </div>
          </div>
        </aside>

        <section className="vault-register-form-panel">
          <div className="vault-register-mobile-brand">
            <RouteLink to="/" className="vault-login-home-link">
              Vault Financial
            </RouteLink>
          </div>

          <div className="vault-register-form-wrap">
            <header className="vault-register-header-block">
              <h2>Welcome to the Vault</h2>
              <p>Access your global financial headquarters.</p>
            </header>

            <div className="vault-register-toggle">
              <RouteLink to="/login" className="vault-register-toggle-link">
                Sign In
              </RouteLink>
              <RouteLink to="/register" className="vault-register-toggle-link is-active">
                Register
              </RouteLink>
            </div>

            <form className="vault-register-form" onSubmit={handleSubmit}>
              <section className="vault-register-section">
                <div className="vault-register-section-title">
                  <span>01</span>
                  <h3>Identity Verification</h3>
                </div>

                <div className="vault-register-grid">
                  <RegisterField
                    label="Full Name"
                    name="fullName"
                    value={registerForm.values.fullName}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.fullName}
                    placeholder="Johnathan Doe"
                  />
                  <RegisterField
                    label="Username"
                    name="username"
                    value={registerForm.values.username}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.username}
                    placeholder="johndoe_vault"
                  />
                  <RegisterField
                    label="Email Address"
                    name="email"
                    value={registerForm.values.email}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.email}
                    type="email"
                    placeholder="j.doe@example.com"
                  />
                  <RegisterField
                    label="Security Password"
                    name="password"
                    value={registerForm.values.password}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.password}
                    type={showPassword ? "text" : "password"}
                    placeholder="............"
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="vault-register-visibility"
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
                  <RegisterField
                    label="Phone Number"
                    name="phoneNumber"
                    value={registerForm.values.phoneNumber}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.phoneNumber}
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <RegisterField
                    label="Gender"
                    name="gender"
                    value={registerForm.values.gender}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.gender}
                    type="select"
                    options={genderOptions}
                  />
                  <RegisterField
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={registerForm.values.dateOfBirth}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.dateOfBirth}
                    type="date"
                  />
                  <RegisterField
                    label="Occupation"
                    name="occupation"
                    value={registerForm.values.occupation}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.occupation}
                    placeholder="Senior Analyst"
                  />
                </div>
              </section>

              <section className="vault-register-section">
                <div className="vault-register-section-title">
                  <span className="is-muted">02</span>
                  <h3>Residency Details</h3>
                </div>

                <div className="vault-register-grid">
                  <RegisterField
                    label="Residential Address"
                    name="addressLine1"
                    value={registerForm.values.addressLine1}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.addressLine1}
                    placeholder="123 Financial District Blvrd"
                    className="is-wide"
                  />
                  <RegisterField
                    label="City"
                    name="city"
                    value={registerForm.values.city}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.city}
                    placeholder="New York"
                  />
                  <RegisterField
                    label="State / Province"
                    name="state"
                    value={registerForm.values.state}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.state}
                    placeholder="NY"
                  />
                  <RegisterField
                    label="Postal Code"
                    name="postalCode"
                    value={registerForm.values.postalCode}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.postalCode}
                    placeholder="10001"
                  />
                  <RegisterField
                    label="Country"
                    name="country"
                    value={registerForm.values.country}
                    onChange={registerForm.setValue}
                    error={registerForm.errors.country}
                    type="select"
                    options={orderedCountryOptions}
                  />
                </div>
              </section>

              <div className="vault-register-actions">
                <label className="vault-register-consent">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(event) => {
                      setConsentAccepted(event.target.checked);
                      if (event.target.checked) {
                        setConsentError("");
                      }
                    }}
                  />
                  <span>
                    I agree to the <strong>Terms of Service</strong> and
                    the <strong>Privacy Policy</strong>.
                  </span>
                </label>
                {consentError ? <p className="vault-consent-error">{consentError}</p> : null}

                <button type="submit" className="vault-register-submit" disabled={authLoading}>
                  {authLoading ? "Initializing secure onboarding..." : "Create Secure Account"}
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>
            </form>

            <footer className="vault-register-footer">
              <p>&copy; 2026 Vault Financial Institutional Services.</p>
              <nav>
                <span className="vault-register-footer-link">Support</span>
                <span className="vault-register-footer-link">Transparency</span>
              </nav>
            </footer>
          </div>
        </section>
      </div>
    </section>
  );
}
