import { apiRequest } from "./api";

export const customerService = {
  getAccounts(token) {
    return apiRequest("/accounts", { token });
  },
  createAccount(token, payload) {
    return apiRequest("/accounts", {
      method: "POST",
      token,
      body: payload
    });
  },
  deposit(token, accountNumber, amount) {
    return apiRequest(`/accounts/${accountNumber}/deposit`, {
      method: "POST",
      token,
      body: { amount }
    });
  },
  withdraw(token, accountNumber, amount) {
    return apiRequest(`/accounts/${accountNumber}/withdraw`, {
      method: "POST",
      token,
      body: { amount }
    });
  },
  transfer(token, payload) {
    return apiRequest("/accounts/transfer", {
      method: "POST",
      token,
      body: payload
    });
  },
  getTransactions(token, accountNumber) {
    return apiRequest(`/accounts/${accountNumber}/transactions`, { token });
  },
  getBeneficiaries(token) {
    return apiRequest("/beneficiaries", { token });
  },
  createBeneficiary(token, payload) {
    return apiRequest("/beneficiaries", {
      method: "POST",
      token,
      body: payload
    });
  }
};
