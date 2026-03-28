import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Mail,
  MapPinned,
  Phone,
  UserRound,
  UserRoundCheck
} from "lucide-react";
import { countryOptions, registerSteps } from "../../constants/authLayout";
import { genderOptions } from "../../constants/forms";
import { validateRegistration } from "../../utils/validation";
import { VaultField } from "./VaultField";
import { VaultRegisterProgress } from "./VaultRegisterProgress";
import { VaultSectionHeading } from "./VaultSectionHeading";

const stepFieldMap = [
  ["fullName", "username", "email", "phoneNumber", "gender", "dateOfBirth", "occupation"],
  ["addressLine1", "city", "state", "postalCode", "country"],
  ["password"]
];

function pickStepErrors(values, stepIndex) {
  const validationErrors = validateRegistration(values);
  const currentFields = stepFieldMap[stepIndex];

  return Object.fromEntries(
    Object.entries(validationErrors).filter(([field]) => currentFields.includes(field))
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="vault-summary-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

export function VaultRegisterPanel({ form, isLoading, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [consentError, setConsentError] = useState("");

  const currentStep = registerSteps[activeStep];

  const summaryItems = useMemo(
    () => [
      { label: "Profile", value: form.values.fullName },
      { label: "Username", value: form.values.username },
      { label: "Email", value: form.values.email },
      { label: "Phone", value: form.values.phoneNumber },
      {
        label: "Residency",
        value: [form.values.city, form.values.state, form.values.country].filter(Boolean).join(", ")
      },
      { label: "Occupation", value: form.values.occupation }
    ],
    [form.values]
  );

  function advanceStep() {
    const nextErrors = pickStepErrors(form.values, activeStep);
    form.setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setActiveStep((current) => Math.min(current + 1, registerSteps.length - 1));
  }

  function retreatStep() {
    form.setErrors({});
    setConsentError("");
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event) {
    if (activeStep < registerSteps.length - 1) {
      event.preventDefault();
      advanceStep();
      return;
    }

    if (!consentAccepted) {
      event.preventDefault();
      setConsentError("You must acknowledge the terms to continue.");
      return;
    }

    setConsentError("");
    await onSubmit(event);
  }

  return (
    <form onSubmit={handleSubmit} className="vault-auth-form vault-register-form">
      <div className="vault-register-header">
        <VaultSectionHeading step={currentStep.stepLabel} title={currentStep.title} />
        <p className="vault-form-intro">{currentStep.description}</p>
      </div>

      <VaultRegisterProgress steps={registerSteps} activeStep={activeStep} />

      <div className="vault-register-stage">
        {activeStep === 0 ? (
          <div className="vault-field-grid vault-field-grid-two">
            <VaultField
              label="Full name"
              name="fullName"
              value={form.values.fullName}
              onChange={form.setValue}
              error={form.errors.fullName}
              icon={UserRound}
              placeholder="Jonathan Doe"
              required
            />
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
              label="Email address"
              name="email"
              type="email"
              value={form.values.email}
              onChange={form.setValue}
              error={form.errors.email}
              icon={Mail}
              placeholder="j.doe@example.com"
              required
            />
            <VaultField
              label="Phone number"
              name="phoneNumber"
              value={form.values.phoneNumber}
              onChange={form.setValue}
              error={form.errors.phoneNumber}
              icon={Phone}
              placeholder="+91 98765 43210"
              required
            />
            <VaultField
              label="Gender"
              name="gender"
              as="select"
              value={form.values.gender}
              onChange={form.setValue}
              error={form.errors.gender}
              icon={UserRoundCheck}
              options={genderOptions}
            />
            <VaultField
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              value={form.values.dateOfBirth}
              onChange={form.setValue}
              error={form.errors.dateOfBirth}
              icon={BadgeCheck}
              required
            />
            <VaultField
              label="Occupation"
              name="occupation"
              value={form.values.occupation}
              onChange={form.setValue}
              error={form.errors.occupation}
              icon={BriefcaseBusiness}
              placeholder="Senior Analyst"
              required
              className="vault-span-two"
            />
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="vault-field-grid vault-field-grid-two">
            <VaultField
              label="Residential address"
              name="addressLine1"
              value={form.values.addressLine1}
              onChange={form.setValue}
              error={form.errors.addressLine1}
              icon={MapPinned}
              placeholder="123 Financial District Blvd"
              required
              className="vault-span-two"
            />
            <VaultField
              label="Address line 2"
              name="addressLine2"
              value={form.values.addressLine2}
              onChange={form.setValue}
              error={form.errors.addressLine2}
              placeholder="Suite, tower, apartment"
              className="vault-span-two"
            />
            <VaultField
              label="City"
              name="city"
              value={form.values.city}
              onChange={form.setValue}
              error={form.errors.city}
              placeholder="Mumbai"
              required
            />
            <VaultField
              label="State / Province"
              name="state"
              value={form.values.state}
              onChange={form.setValue}
              error={form.errors.state}
              placeholder="MH"
              required
            />
            <VaultField
              label="Postal code"
              name="postalCode"
              value={form.values.postalCode}
              onChange={form.setValue}
              error={form.errors.postalCode}
              placeholder="400001"
              required
            />
            <VaultField
              label="Country"
              name="country"
              as="select"
              value={form.values.country}
              onChange={form.setValue}
              error={form.errors.country}
              icon={Globe2}
              options={countryOptions}
              required
            />
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="vault-final-stage">
            <div className="vault-field-grid">
              <VaultField
                label="Security password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.values.password}
                onChange={form.setValue}
                error={form.errors.password}
                icon={LockKeyhole}
                placeholder="Minimum 8 characters"
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

            <div className="vault-summary-grid">
              {summaryItems.map((item) => (
                <SummaryItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <label className="vault-consent">
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
                I agree to the <strong>Terms of Sovereignty</strong> and the{" "}
                <strong>Privacy Mandate</strong>.
              </span>
            </label>
            {consentError ? <p className="vault-consent-error">{consentError}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="vault-step-actions">
        <button
          type="button"
          onClick={retreatStep}
          className="vault-secondary-button"
          disabled={activeStep === 0 || isLoading}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>

        <button type="submit" disabled={isLoading} className="vault-primary-button">
          {activeStep === registerSteps.length - 1
            ? isLoading
              ? "Initializing secure onboarding..."
              : "Initialize Secure Onboarding"
            : "Continue to next step"}
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}
