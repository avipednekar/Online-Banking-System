import { useState } from "react";
import {
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
import { countryOptions } from "../../constants/authLayout";
import { genderOptions } from "../../constants/forms";
import { VaultField } from "./VaultField";
import { VaultSectionHeading } from "./VaultSectionHeading";

export function VaultRegisterPanel({ form, isLoading, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-1 flex-col">
      <VaultSectionHeading step="01" title="Identity Verification" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
        />
      </div>

      <VaultSectionHeading step="02" title="Residency Details" />
      <div className="mt-4 grid gap-4 sm:grid-cols-6">
        <VaultField
          label="Residential address"
          name="addressLine1"
          value={form.values.addressLine1}
          onChange={form.setValue}
          error={form.errors.addressLine1}
          icon={MapPinned}
          placeholder="123 Financial District Blvd"
          required
          className="sm:col-span-6"
        />
        <VaultField
          label="City"
          name="city"
          value={form.values.city}
          onChange={form.setValue}
          error={form.errors.city}
          placeholder="Mumbai"
          required
          className="sm:col-span-2"
        />
        <VaultField
          label="State / Province"
          name="state"
          value={form.values.state}
          onChange={form.setValue}
          error={form.errors.state}
          placeholder="MH"
          required
          className="sm:col-span-2"
        />
        <VaultField
          label="Postal code"
          name="postalCode"
          value={form.values.postalCode}
          onChange={form.setValue}
          error={form.errors.postalCode}
          placeholder="400001"
          required
          className="sm:col-span-2"
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
          className="sm:col-span-6"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#00113a,#758dd5)] px-6 py-4 text-sm font-semibold text-white shadow-[0_24px_48px_-30px_rgba(0,17,58,0.9)] transition duration-200 hover:translate-y-0 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Initializing secure onboarding..." : "Initialize Secure Onboarding"}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>

      <label className="mt-4 flex items-start gap-3 text-xs leading-6 text-[#6d7b98]">
        <input
          type="checkbox"
          defaultChecked
          className="mt-1 h-4 w-4 rounded border-0 bg-[#f2f4f6] text-[#00113a] focus:ring-[#1fce91]"
        />
        <span>
          I agree to the <span className="font-semibold text-[#102146]">Terms of Sovereignty</span>{" "}
          and the <span className="font-semibold text-[#102146]">Privacy Mandate</span>.
        </span>
      </label>
    </form>
  );
}
