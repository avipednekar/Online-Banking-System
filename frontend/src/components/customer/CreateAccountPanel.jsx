import { accountTypeOptions } from "../../constants/forms";
import { FormField } from "../forms/FormField";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";

export function CreateAccountPanel({ form, isLoading, onSubmit }) {
  return (
    <Panel>
      <h2>Create account</h2>
      <form className="form-grid compact-grid" onSubmit={onSubmit}>
        <FormField
          label="Account type"
          name="accountType"
          as="select"
          value={form.values.accountType}
          onChange={form.setValue}
          error={form.errors.accountType}
          options={accountTypeOptions}
        />
        <FormField
          label="Opening balance"
          name="openingBalance"
          type="number"
          min="100"
          step="0.01"
          value={form.values.openingBalance}
          onChange={form.setValue}
          error={form.errors.openingBalance}
          required
        />
        <SubmitButton
          isLoading={isLoading}
          idleLabel="Open account"
          loadingLabel="Opening account..."
          disabled={isLoading}
        />
      </form>
      <p className="muted">Account numbers are generated automatically as 10 digits: savings start with 9 and current accounts start with 8.</p>
    </Panel>
  );
}
