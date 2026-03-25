import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { SectionErrorState } from "../feedback/SectionErrorState";
import { FormField } from "../forms/FormField";
import { SubmitButton } from "../forms/SubmitButton";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";

export function BeneficiariesPanel({
  form,
  beneficiaries,
  isLoading,
  loadError,
  saveLoading,
  lookup,
  lookupError,
  lookupLoading,
  onRefresh,
  onSubmit,
  onFieldChange,
  onVerifyAccount
}) {
  const isVerified = lookup?.accountNumber === String(form.values.accountNumber || "").trim();

  return (
    <Panel>
      <SectionHeader
        title="Beneficiaries"
        action={
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={isLoading}
            idleLabel="Refresh"
            loadingLabel="Refreshing..."
            onClick={onRefresh}
            disabled={isLoading}
          />
        }
      />
      <form className="form-grid compact-grid" onSubmit={onSubmit}>
        <FormField
          label="Nickname"
          name="nickname"
          value={form.values.nickname}
          onChange={onFieldChange}
          error={form.errors.nickname}
          required
        />
        <FormField
          label="Bank name"
          name="bankName"
          value={form.values.bankName}
          onChange={onFieldChange}
          error={form.errors.bankName}
          disabled
          required
        />
        <FormField
          label="Beneficiary account"
          name="accountNumber"
          value={form.values.accountNumber}
          onChange={onFieldChange}
          onBlur={() => onVerifyAccount(form.values.accountNumber)}
          error={form.errors.accountNumber}
          required
        />
        <div className="button-row">
          <SubmitButton
            type="button"
            variant="secondary"
            isLoading={lookupLoading}
            idleLabel="Verify account"
            loadingLabel="Verifying..."
            onClick={() => onVerifyAccount(form.values.accountNumber)}
            disabled={lookupLoading}
          />
          <SubmitButton
            isLoading={saveLoading}
            idleLabel="Save beneficiary"
            loadingLabel="Saving beneficiary..."
            disabled={saveLoading || lookupLoading || !isVerified}
          />
        </div>
      </form>
      {lookupError ? (
        <SectionErrorState title="Beneficiary verification failed" message={lookupError} />
      ) : null}
      {isVerified ? (
        <article className="profile-card">
          <span>Verified beneficiary</span>
          <strong>{lookup.accountHolderName}</strong>
          <p>{lookup.accountNumber}</p>
          <p>
            {lookup.accountType} | {lookup.accountStatus} | {lookup.bankName}
          </p>
        </article>
      ) : null}
      {isLoading ? (
        <LoadingState compact title="Loading beneficiaries" message="Fetching transfer destinations." />
      ) : null}
      {loadError ? (
        <SectionErrorState
          message={loadError}
          action={
            <button type="button" className="secondary" onClick={onRefresh}>
              Retry
            </button>
          }
        />
      ) : null}
      {!isLoading && !loadError && beneficiaries.length === 0 ? (
        <EmptyState
          title="No beneficiaries added"
          message="Save a beneficiary to speed up transfers."
        />
      ) : null}
      <div className="transaction-list">
        {beneficiaries.map((beneficiary) => (
          <article key={beneficiary.id} className="transaction-card">
            <span>{beneficiary.bankName}</span>
            <strong>{beneficiary.nickname}</strong>
            <p>{beneficiary.accountNumber}</p>
            <p>{beneficiary.accountHolderName}</p>
            <time>{new Date(beneficiary.createdAt).toLocaleString()}</time>
          </article>
        ))}
      </div>
    </Panel>
  );
}
