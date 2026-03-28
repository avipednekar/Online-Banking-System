import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  LineChart,
  Send,
  ShieldCheck
} from "lucide-react";
import { RouteLink } from "../components/common/RouteLink";
import {
  assuranceMetrics,
  featureCards,
  footerGroups,
  heroStats,
  navigationLinks,
  onboardingSteps
} from "../constants/authLayout";

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
            <RouteLink to="/login">{link}</RouteLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingPage() {
  return (
    <section className="vault-landing">
      <header className="vault-nav-shell">
        <nav className="vault-nav">
          <RouteLink className="vault-brand" to="/">
            <span className="vault-brand-mark" aria-hidden="true">
              <Building2 size={18} strokeWidth={2.1} />
            </span>
            <span>
              <strong>Vault Financial</strong>
              <small>Digital Vault Banking</small>
            </span>
          </RouteLink>

          <div className="vault-nav-links">
            {navigationLinks.map((item) => (
              <a key={item} href="#features">
                {item}
              </a>
            ))}
          </div>

          <div className="vault-nav-actions">
            <RouteLink to="/login" className="vault-ghost-button">
              Login
            </RouteLink>
            <RouteLink to="/register" className="vault-primary-button">
              Open Account
            </RouteLink>
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
            <RouteLink to="/register" className="vault-primary-button">
              Get Started
            </RouteLink>
            <a href="#features" className="vault-secondary-button">
              View Platform
            </a>
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
              <RouteLink to="/login" className="vault-inline-link">
                Enter secure workspace
                <ChevronRight size={16} strokeWidth={2} />
              </RouteLink>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="vault-section vault-section-muted">
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
            <article
              key={step.id}
              className={`vault-step-card ${index === onboardingSteps.length - 1 ? "is-active" : ""}`.trim()}
            >
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
          <RouteLink to="/register" className="vault-primary-button">
            Start your onboarding
          </RouteLink>
        </div>
      </section>

      <section className="vault-cta-strip">
        <div>
          <span className="vault-block-label">Institutional design system</span>
          <h2>Built to feel secure before the first transaction even happens.</h2>
        </div>
        <RouteLink to="/login" className="vault-primary-button">
          Login to Vault
          <ArrowRight size={16} strokeWidth={2} />
        </RouteLink>
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
            <RouteLink to="/login">Privacy Policy</RouteLink>
            <RouteLink to="/login">Terms of Service</RouteLink>
            <RouteLink to="/login">Cookie Settings</RouteLink>
          </div>
        </div>
      </footer>
    </section>
  );
}
