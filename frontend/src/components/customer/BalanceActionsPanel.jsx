import { Panel } from "../ui/Panel";
import { SubmitButton } from "../forms/SubmitButton";
import { FormField } from "../forms/FormField";

export function BalanceActionsPanel({
  accounts,
  selectedAccount,
  amount,
  isLoading,
  onAmountChange,
  onSelectAccount,
  onDeposit,
  onWithdraw
}) {
  return (
    <Panel>
      <h2>Deposit / Withdraw</h2>
      <div className="form-grid compact-grid">
        <FormField
          label="Account"
          name="accountNumber"
          as="select"
          value={selectedAccount}
          onChange={(_, value) => onSelectAccount(value)}
          options={[
            { value: "", label: "Select account" },
            ...accounts.map((account) => ({
              value: account.accountNumber,
              label: account.accountNumber
            }))
          ]}
        />
        <FormField
          label="Amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(_, value) => onAmountChange(value)}
        />
      </div>
      <div className="button-row">
        <SubmitButton
          type="button"
          isLoading={isLoading}
          idleLabel="Deposit"
          loadingLabel="Posting..."
          onClick={onDeposit}
          disabled={isLoading}
        />
        <SubmitButton
          type="button"
          variant="secondary"
          isLoading={isLoading}
          idleLabel="Withdraw"
          loadingLabel="Posting..."
          onClick={onWithdraw}
          disabled={isLoading}
        />
      </div>
    </Panel>
  );
}
