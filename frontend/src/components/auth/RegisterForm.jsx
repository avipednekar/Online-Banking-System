import { genderOptions } from "../../constants/forms";
import { FormField } from "../forms/FormField";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";

export function RegisterForm({ form, isLoading, onSubmit }) {
  return (
    <Panel>
      <h2>Customer onboarding</h2>
      <p className="muted">
        Capture the KYC profile upfront. New registrations start in pending review.
      </p>
      <form className="form-grid" onSubmit={onSubmit}>
        <FormField
          label="Full name"
          name="fullName"
          value={form.values.fullName}
          onChange={form.setValue}
          error={form.errors.fullName}
          required
        />
        <FormField
          label="Username"
          name="username"
          value={form.values.username}
          onChange={form.setValue}
          error={form.errors.username}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.setValue}
          error={form.errors.email}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.setValue}
          error={form.errors.password}
          required
        />
        <FormField
          label="Phone number"
          name="phoneNumber"
          value={form.values.phoneNumber}
          onChange={form.setValue}
          error={form.errors.phoneNumber}
          required
        />
        <FormField
          label="Gender"
          name="gender"
          as="select"
          value={form.values.gender}
          onChange={form.setValue}
          error={form.errors.gender}
          options={genderOptions}
        />
        <FormField
          label="Occupation"
          name="occupation"
          value={form.values.occupation}
          onChange={form.setValue}
          error={form.errors.occupation}
          required
        />
        <FormField
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          value={form.values.dateOfBirth}
          onChange={form.setValue}
          error={form.errors.dateOfBirth}
          required
        />
        <FormField
          label="Address line 1"
          name="addressLine1"
          value={form.values.addressLine1}
          onChange={form.setValue}
          error={form.errors.addressLine1}
          required
        />
        <FormField
          label="Address line 2"
          name="addressLine2"
          value={form.values.addressLine2}
          onChange={form.setValue}
          error={form.errors.addressLine2}
        />
        <FormField
          label="City"
          name="city"
          value={form.values.city}
          onChange={form.setValue}
          error={form.errors.city}
          required
        />
        <FormField
          label="State"
          name="state"
          value={form.values.state}
          onChange={form.setValue}
          error={form.errors.state}
          required
        />
        <FormField
          label="Postal code"
          name="postalCode"
          value={form.values.postalCode}
          onChange={form.setValue}
          error={form.errors.postalCode}
          required
        />
        <FormField
          label="Country"
          name="country"
          value={form.values.country}
          onChange={form.setValue}
          error={form.errors.country}
          required
        />
        <SubmitButton
          isLoading={isLoading}
          idleLabel="Create profile"
          loadingLabel="Creating profile..."
          disabled={isLoading}
        />
      </form>
    </Panel>
  );
}
