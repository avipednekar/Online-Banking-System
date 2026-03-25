import { useEffect, useMemo, useState } from "react";
import {
  initialAccountForm,
  initialBeneficiaryForm,
  initialTransferForm
} from "../constants/forms";
import { useAuth } from "../context/AuthContext";
import { customerService } from "../services/customerService";
import { useAsyncTracker } from "./useAsyncTracker";
import { useForm } from "./useForm";
import { useToast } from "./useToast";
import { collectFieldErrors } from "../utils/formatters";
import {
  validateAccount,
  validateBalance,
  validateBeneficiary,
  validateTransfer
} from "../utils/validation";

export function useCustomerWorkspace() {
  const { token, user, logout } = useAuth();
  const { notifyError, notifyInfo, notifySuccess } = useToast();
  const tracker = useAsyncTracker();
  const accountForm = useForm(initialAccountForm);
  const transferForm = useForm(initialTransferForm);
  const beneficiaryForm = useForm(initialBeneficiaryForm);
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [accountsError, setAccountsError] = useState("");
  const [beneficiariesError, setBeneficiariesError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [beneficiaryLookup, setBeneficiaryLookup] = useState(null);
  const [beneficiaryLookupError, setBeneficiaryLookupError] = useState("");

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts]
  );

  function handleSessionError(error, title) {
    if (error.status === 401) {
      logout();
      notifyError("Session expired", error.message || "Please sign in again.");
      return true;
    }

    notifyError(title, error.message || "Request failed", collectFieldErrors(error.fields));
    return false;
  }

  async function loadAccounts() {
    tracker.startAction("accounts");
    setAccountsError("");
    try {
      const data = await customerService.getAccounts(token);
      setAccounts(data);
      const primaryAccount = data[0]?.accountNumber || "";
      setSelectedAccount((current) => current || primaryAccount);
      if (!selectedAccount && primaryAccount) {
        await loadTransactions(primaryAccount);
      }
    } catch (error) {
      if (!handleSessionError(error, "Unable to load accounts")) {
        setAccountsError(error.message || "Unable to load accounts.");
      }
    } finally {
      tracker.finishAction("accounts");
    }
  }

  async function loadBeneficiaries() {
    tracker.startAction("beneficiaries");
    setBeneficiariesError("");
    try {
      const data = await customerService.getBeneficiaries(token);
      setBeneficiaries(data);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load beneficiaries")) {
        setBeneficiariesError(error.message || "Unable to load beneficiaries.");
      }
    } finally {
      tracker.finishAction("beneficiaries");
    }
  }

  async function loadTransactions(accountNumber) {
    tracker.startAction("transactions");
    setTransactionsError("");
    try {
      const data = await customerService.getTransactions(token, accountNumber);
      setTransactions(data);
      setSelectedAccount(accountNumber);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load transaction history")) {
        setTransactionsError(error.message || "Unable to load transaction history.");
      }
    } finally {
      tracker.finishAction("transactions");
    }
  }

  useEffect(() => {
    loadAccounts();
    loadBeneficiaries();
  }, []);

  function logoutUser() {
    logout();
    notifyInfo("Signed out", "You have been logged out.");
  }

  function updateBeneficiaryField(field, value) {
    beneficiaryForm.setValue(field, value);

    if (field === "accountNumber") {
      setBeneficiaryLookup(null);
      setBeneficiaryLookupError("");
    }
  }

  async function verifyBeneficiaryAccount(accountNumber = beneficiaryForm.values.accountNumber, notifyOnError = false) {
    const normalizedAccountNumber = String(accountNumber || "").trim();
    if (!normalizedAccountNumber) {
      setBeneficiaryLookup(null);
      setBeneficiaryLookupError("");
      return null;
    }

    tracker.startAction("beneficiaryLookup");
    setBeneficiaryLookupError("");
    try {
      const verified = await customerService.lookupBeneficiary(token, normalizedAccountNumber);
      setBeneficiaryLookup(verified);
      beneficiaryForm.setValue("bankName", verified.bankName);
      return verified;
    } catch (error) {
      setBeneficiaryLookup(null);
      setBeneficiaryLookupError(error.message || "Unable to verify beneficiary account.");
      beneficiaryForm.setErrors((current) => ({
        ...current,
        accountNumber: error.message || "Unable to verify beneficiary account."
      }));
      if (notifyOnError) {
        handleSessionError(error, "Beneficiary verification failed");
      }
      return null;
    } finally {
      tracker.finishAction("beneficiaryLookup");
    }
  }

  async function createAccount(event) {
    event.preventDefault();

    if (!accountForm.validate(validateAccount)) {
      notifyError("Account creation failed", "Please correct the highlighted fields.");
      return;
    }

    tracker.startAction("createAccount");
    try {
      const created = await customerService.createAccount(token, {
        ...accountForm.values,
        openingBalance: Number(accountForm.values.openingBalance)
      });
      setAccounts((current) => [...current, created]);
      setSelectedAccount(created.accountNumber);
      accountForm.reset(initialAccountForm);
      notifySuccess("Account created", `Account ${created.accountNumber} created successfully.`);
    } catch (error) {
      if (!handleSessionError(error, "Account creation failed")) {
        accountForm.setErrors(error.fields || {});
      }
    } finally {
      tracker.finishAction("createAccount");
    }
  }

  async function postBalanceAction(type) {
    const balanceErrors = validateBalance({
      accountNumber: selectedAccount,
      amount
    });

    if (Object.keys(balanceErrors).length > 0) {
      notifyError(
        type === "deposit" ? "Deposit failed" : "Withdrawal failed",
        "Provide an account and a valid amount.",
        collectFieldErrors(balanceErrors)
      );
      return;
    }

    tracker.startAction("balance");
    try {
      const updated =
        type === "deposit"
          ? await customerService.deposit(token, selectedAccount, Number(amount))
          : await customerService.withdraw(token, selectedAccount, Number(amount));

      setAccounts((current) =>
        current.map((account) =>
          account.accountNumber === updated.accountNumber ? updated : account
        )
      );
      notifySuccess(
        type === "deposit" ? "Deposit completed" : "Withdrawal completed",
        `${type === "deposit" ? "Deposit" : "Withdrawal"} posted for ${updated.accountNumber}.`
      );
      await loadTransactions(selectedAccount);
    } catch (error) {
      handleSessionError(error, type === "deposit" ? "Deposit failed" : "Withdrawal failed");
    } finally {
      tracker.finishAction("balance");
    }
  }

  async function createTransfer(event) {
    event.preventDefault();

    if (!transferForm.validate(validateTransfer)) {
      notifyError("Transfer failed", "Please correct the highlighted fields.");
      return;
    }

    tracker.startAction("transfer");
    try {
      await customerService.transfer(token, {
        ...transferForm.values,
        amount: Number(transferForm.values.amount)
      });
      transferForm.reset(initialTransferForm);
      notifySuccess("Transfer completed", "Funds were transferred successfully.");
      await loadAccounts();
      if (selectedAccount) {
        await loadTransactions(selectedAccount);
      }
    } catch (error) {
      if (!handleSessionError(error, "Transfer failed")) {
        transferForm.setErrors(error.fields || {});
      }
    } finally {
      tracker.finishAction("transfer");
    }
  }

  async function createBeneficiary(event) {
    event.preventDefault();

    if (!beneficiaryForm.validate(validateBeneficiary)) {
      notifyError("Beneficiary creation failed", "Please correct the highlighted fields.");
      return;
    }

    let verifiedAccount = beneficiaryLookup;
    if (
      !verifiedAccount ||
      verifiedAccount.accountNumber !== String(beneficiaryForm.values.accountNumber || "").trim()
    ) {
      verifiedAccount = await verifyBeneficiaryAccount(beneficiaryForm.values.accountNumber, true);
      if (!verifiedAccount) {
        return;
      }
    }

    tracker.startAction("beneficiary");
    try {
      const created = await customerService.createBeneficiary(token, {
        ...beneficiaryForm.values,
        bankName: verifiedAccount.bankName
      });
      setBeneficiaries((current) => [created, ...current]);
      beneficiaryForm.reset(initialBeneficiaryForm);
      setBeneficiaryLookup(null);
      setBeneficiaryLookupError("");
      transferForm.setValues((current) => ({
        ...current,
        toAccountNumber: created.accountNumber
      }));
      notifySuccess("Beneficiary saved", `Beneficiary ${created.nickname} added successfully.`);
    } catch (error) {
      if (!handleSessionError(error, "Beneficiary creation failed")) {
        beneficiaryForm.setErrors(error.fields || {});
      }
    } finally {
      tracker.finishAction("beneficiary");
    }
  }

  return {
    user,
    accounts,
    beneficiaries,
    transactions,
    selectedAccount,
    setSelectedAccount,
    amount,
    setAmount,
    totalBalance,
    accountForm,
    transferForm,
    beneficiaryForm,
    beneficiaryLookup,
    beneficiaryLookupError,
    tracker,
    accountsError,
    beneficiariesError,
    transactionsError,
    logoutUser,
    loadAccounts,
    loadBeneficiaries,
    loadTransactions,
    createAccount,
    postBalanceAction,
    createTransfer,
    createBeneficiary,
    updateBeneficiaryField,
    verifyBeneficiaryAccount
  };
}
