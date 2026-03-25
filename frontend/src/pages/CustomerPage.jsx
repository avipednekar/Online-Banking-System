import { StatCard } from "../components/ui/StatCard";
import { ProfileOverview } from "../components/customer/ProfileOverview";
import { CreateAccountPanel } from "../components/customer/CreateAccountPanel";
import { AccountsPanel } from "../components/customer/AccountsPanel";
import { BalanceActionsPanel } from "../components/customer/BalanceActionsPanel";
import { TransferPanel } from "../components/customer/TransferPanel";
import { BeneficiariesPanel } from "../components/customer/BeneficiariesPanel";
import { TransactionsPanel } from "../components/customer/TransactionsPanel";
import { useCustomerWorkspace } from "../hooks/useCustomerWorkspace";

export default function CustomerPage() {
  const workspace = useCustomerWorkspace();

  return (
    <>
      <section className="summary-grid">
        <StatCard
          label="Current user"
          value={workspace.user?.fullName || workspace.user?.username}
          detail={`${workspace.user?.role || "CUSTOMER"} | KYC: ${workspace.user?.kycStatus || "PENDING"}`}
          action={
            <button className="secondary" type="button" onClick={workspace.logoutUser}>
              Logout
            </button>
          }
        />
        <StatCard
          label="Accounts"
          value={workspace.accounts.length}
          detail="Managed through protected customer APIs."
        />
        <StatCard
          label="Total balance"
          value={`Rs ${workspace.totalBalance.toFixed(2)}`}
          detail="Combined live value across your accounts."
        />
      </section>

      <ProfileOverview user={workspace.user} />

      <section className="workspace-grid">
        <CreateAccountPanel
          form={workspace.accountForm}
          isLoading={workspace.tracker.isPending("createAccount")}
          onSubmit={workspace.createAccount}
        />
        <AccountsPanel
          accounts={workspace.accounts}
          selectedAccount={workspace.selectedAccount}
          isLoading={workspace.tracker.isPending("accounts")}
          error={workspace.accountsError}
          onRefresh={workspace.loadAccounts}
          onSelect={workspace.loadTransactions}
        />
        <BalanceActionsPanel
          accounts={workspace.accounts}
          selectedAccount={workspace.selectedAccount}
          amount={workspace.amount}
          isLoading={workspace.tracker.isPending("balance")}
          onAmountChange={workspace.setAmount}
          onSelectAccount={workspace.setSelectedAccount}
          onDeposit={() => workspace.postBalanceAction("deposit")}
          onWithdraw={() => workspace.postBalanceAction("withdraw")}
        />
        <TransferPanel
          form={workspace.transferForm}
          accounts={workspace.accounts}
          beneficiaries={workspace.beneficiaries}
          isLoading={workspace.tracker.isPending("transfer")}
          onSubmit={workspace.createTransfer}
        />
      </section>

      <section className="workspace-grid lower-grid">
        <BeneficiariesPanel
          form={workspace.beneficiaryForm}
          beneficiaries={workspace.beneficiaries}
          isLoading={workspace.tracker.isPending("beneficiaries")}
          loadError={workspace.beneficiariesError}
          saveLoading={workspace.tracker.isPending("beneficiary")}
          lookup={workspace.beneficiaryLookup}
          lookupError={workspace.beneficiaryLookupError}
          lookupLoading={workspace.tracker.isPending("beneficiaryLookup")}
          onRefresh={workspace.loadBeneficiaries}
          onSubmit={workspace.createBeneficiary}
          onFieldChange={workspace.updateBeneficiaryField}
          onVerifyAccount={workspace.verifyBeneficiaryAccount}
        />
        <TransactionsPanel
          transactions={workspace.transactions}
          selectedAccount={workspace.selectedAccount}
          isLoading={workspace.tracker.isPending("transactions")}
          error={workspace.transactionsError}
          onRefresh={workspace.loadTransactions}
        />
      </section>
    </>
  );
}
