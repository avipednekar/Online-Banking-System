import { FormField } from "../forms/FormField";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";

export function TransferPanel({ form, accounts, beneficiaries, isLoading, onSubmit }) {
  return (
    <Panel>
      <h2>Transfer funds</h2>
      <form className="form-grid compact-grid" onSubmit={onSubmit}>
        <FormField
          label="From account"
          name="fromAccountNumber"
          as="select"
          value={form.values.fromAccountNumber}
          onChange={form.setValue}
          error={form.errors.fromAccountNumber}
          options={[
            { value: "", label: "Select source" },
            ...accounts.map((account) => ({
              value: account.accountNumber,
              label: account.accountNumber
            }))
          ]}
        />
        <FormField
          label="Approved beneficiary"
          name="toAccountNumber"
          as="select"
          value={form.values.toAccountNumber}
          onChange={form.setValue}
          options={[
            { value: "", label: "Select beneficiary" },
            ...beneficiaries.map((beneficiary) => ({
              value: beneficiary.accountNumber,
              label: `${beneficiary.nickname} - ${beneficiary.accountNumber}`
            }))
          ]}
        />
        <FormField
          label="To account"
          name="toAccountNumber"
          value={form.values.toAccountNumber}
          onChange={form.setValue}
          error={form.errors.toAccountNumber}
          required
        />
        <FormField
          label="Amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.values.amount}
          onChange={form.setValue}
          error={form.errors.amount}
          required
        />
        <SubmitButton
          isLoading={isLoading}
          idleLabel="Transfer"
          loadingLabel="Transferring..."
          disabled={isLoading}
        />
      </form>
    </Panel>
  );
}
