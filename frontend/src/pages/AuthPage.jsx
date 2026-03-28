import { useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  LineChart,
  LockKeyhole,
  Send,
  ShieldCheck
} from "lucide-react";
import { VaultAuthTabs } from "../components/auth/VaultAuthTabs";
import { VaultLoginPanel } from "../components/auth/VaultLoginPanel";
import { VaultRegisterPanel } from "../components/auth/VaultRegisterPanel";
import { VaultTrustPanel } from "../components/auth/VaultTrustPanel";
import {
  assuranceMetrics,
  featureCards,
  footerGroups,
  heroStats,
  navigationLinks,
  onboardingSteps
} from "../constants/authLayout";
import { useAuthForms } from "../hooks/useAuthForms";

const featureIcons = {
  "secure-assets": ShieldCheck,
  "quick-transfers": Send,
  "smart-analytics": LineChart,
  "institutional-integrity": BadgeCheck
};

function FeatureCard({ feature }) {
  const Icon = featureIcons[feature.id] || ShieldCheck;
  const classes = [
    "vault-feature-card",
    feature.size === "wide" ? "is-wide" : "is-compact",
    feature.tone === "dark" ? "is-dark" : "",
    feature.tone === "visual" ? "is-visual" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="vault-feature-head">
        <span className="vault-feature-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
        <p>{feature.eyebrow}</p>
      </div>
      <h3>{feature.title}</h3>
      <p className="vault-feature-description">{feature.description}</p>
      <div className="vault-feature-tags">
        {feature.accents.map((accent) => (
          <span key={accent}>{accent}</span>
        ))}
      </div>
    </article>
  );
}

function FooterGroup({ group }) {
  return (
    <div>
      <h4>{group.title}</h4>
      <ul>
        {group.links.map((link) => (
          <li key={link}>
            <a href="#auth-section">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AuthPage() {
  const { authLoading, loginForm, registerForm, submitLogin, submitRegistration } = useAuthForms();
  const [activeTab, setActiveTab] = useState("register");
  const authSectionRef = useRef(null);
  const featureSectionRef = useRef(null);

  function scrollToElement(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openAuth(mode) {
    setActiveTab(mode);
    scrollToElement(authSectionRef);
  }

  return (
    <section className="vault-landing">
      <header className="vault-nav-shell">
        <nav className="vault-nav">
          <a className="vault-brand" href="#top">
            <span className="vault-brand-mark" aria-hidden="true">
              <Building2 size={18} strokeWidth={2.1} />
            </span>
            <span>
              <strong>Vault Financial</strong>
              <small>Digital Vault Banking</small>
            </span>
          </a>

          <div className="vault-nav-links">
            {navigationLinks.map((item) => (
              <a key={item} href="#features">
                {item}
              </a>
            ))}
          </div>

          <div className="vault-nav-actions">
            <button type="button" className="vault-ghost-button" onClick={() => openAuth("login")}>
              Login
            </button>
            <button type="button" className="vault-primary-button" onClick={() => openAuth("register")}>
              Open Account
            </button>
          </div>
        </nav>
      </header>

      <section id="top" className="vault-hero">
        <div className="vault-hero-copy">
          <span className="vault-pill">Next-Gen Digital Banking</span>
          <h1>
            Secure your <span>financial future</span> with clarity.
          </h1>
          <p>
            Experience the stability of an institutional vault with the fluid design of modern
            fintech. Your assets stay protected through layered security, verified onboarding, and
            precision-grade workflows.
          </p>
          <div className="vault-hero-actions">
            <button type="button" className="vault-primary-button" onClick={() => openAuth("register")}>
              Get Started
            </button>
            <button
              type="button"
              className="vault-secondary-button"
              onClick={() => scrollToElement(featureSectionRef)}
            >
              View Platform
            </button>
          </div>
          <div className="vault-stat-row">
            {heroStats.map((stat) => (
              <div key={stat.label} className="vault-stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vault-hero-visual">
          <div className="vault-device-stage">
            <div className="vault-device-glow vault-device-glow-left" />
            <div className="vault-device-glow vault-device-glow-right" />
            <div className="vault-device-frame">
              <div className="vault-device-notch" />
              <div className="vault-device-screen">
                <p className="vault-device-label">Vault</p>
                <strong>INR 12,48,230</strong>
                <span>Protected portfolio balance</span>
                <div className="vault-device-chart">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
                <div className="vault-device-footer">
                  {assuranceMetrics.map((metric) => (
                    <div key={metric.id}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="vault-hero-card">
              <span className="vault-block-label">Verified access</span>
              <strong>Ready for secure onboarding</strong>
              <p>Customer and operator sessions are routed through one validated entry surface.</p>
              <button type="button" className="vault-inline-link" onClick={() => openAuth("login")}>
                Enter secure workspace
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" ref={featureSectionRef} className="vault-section vault-section-muted">
        <div className="vault-section-header">
          <span className="vault-block-label">Engineered for Excellence</span>
          <h2>Institutional calm, without transactional drag.</h2>
          <p>
            We remove friction from high-stakes finance through layered surfaces, tight hierarchy,
            and verified action flows.
          </p>
        </div>

        <div className="vault-feature-grid">
          {featureCards.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      <section className="vault-section">
        <div className="vault-section-header vault-section-header-centered">
          <span className="vault-block-label">Your path to precision banking</span>
          <h2>Onboarding that feels exact, not exhausting.</h2>
        </div>

        <div className="vault-steps-grid">
          {onboardingSteps.map((step, index) => (
            <article key={step.id} className={`vault-step-card ${index === onboardingSteps.length - 1 ? "is-active" : ""}`.trim()}>
              <div className="vault-step-marker">{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="vault-banner-card">
          <div>
            <span className="vault-block-label">Ready for the Vault?</span>
            <h3>Join customers who prefer verified banking over disposable dashboards.</h3>
            <p>Move from account creation to operational workspace through one controlled flow.</p>
          </div>
          <button type="button" className="vault-primary-button" onClick={() => openAuth("register")}>
            Start your onboarding
          </button>
        </div>
      </section>

      <section id="auth-section" ref={authSectionRef} className="vault-section">
        <div className="vault-section-header">
          <span className="vault-block-label">Secure access</span>
          <h2>Choose your entry mode.</h2>
          <p>
            Open a new vault through a guided onboarding wizard or return through the same trusted
            entry surface.
          </p>
        </div>

        <div className="vault-auth-layout">
          <div className="vault-auth-card">
            <div className="vault-auth-card-header">
              <VaultAuthTabs activeTab={activeTab} onChange={setActiveTab} />
              <span className="vault-mini-note">
                {activeTab === "register"
                  ? "Three-step onboarding"
                  : "Instant secure sign in"}
              </span>
            </div>

            {activeTab === "register" ? (
              <VaultRegisterPanel
                form={registerForm}
                isLoading={authLoading}
                onSubmit={submitRegistration}
              />
            ) : (
              <VaultLoginPanel form={loginForm} isLoading={authLoading} onSubmit={submitLogin} />
            )}
          </div>

          <VaultTrustPanel />
        </div>
      </section>

      <section className="vault-cta-strip">
        <div>
          <span className="vault-block-label">Institutional design system</span>
          <h2>Built to feel secure before the first transaction even happens.</h2>
        </div>
        <button type="button" className="vault-primary-button" onClick={() => openAuth("register")}>
          Initialize Your Vault
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </section>

      <footer className="vault-footer">
        <div className="vault-footer-grid">
          <div className="vault-footer-brand">
            <strong>Vault Financial</strong>
            <p>
              The architectural standard for digital banking, designed for secure onboarding and
              measured financial operations.
            </p>
          </div>

          {footerGroups.map((group) => (
            <FooterGroup key={group.title} group={group} />
          ))}
        </div>

        <div className="vault-footer-meta">
          <p>(c) 2026 Vault Financial Inc. All rights reserved.</p>
          <div>
            <a href="#auth-section">Privacy Policy</a>
            <a href="#auth-section">Terms of Service</a>
            <a href="#auth-section">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </section>
  );
}
