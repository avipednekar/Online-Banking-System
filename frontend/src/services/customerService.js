import { apiRequest } from "./api";

export const customerService = {
  getAccounts(token) {
    return apiRequest("/accounts", { token });
  },
  getAccount(token, accountNumber) {
    return apiRequest(`/accounts/${accountNumber}`, { token });
  },
  getAccountRequests(token) {
    return apiRequest("/accounts/requests", { token });
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
  getTransactions(token, accountNumber, page = 0, size = 20) {
    return apiRequest(`/accounts/${accountNumber}/transactions?page=${page}&size=${size}`, { token });
  },
  getBeneficiaries(token) {
    return apiRequest("/beneficiaries", { token });
  },
  lookupBeneficiary(token, accountNumber) {
    return apiRequest(`/beneficiaries/lookup/${accountNumber}`, { token });
  },
  createBeneficiary(token, payload) {
    return apiRequest("/beneficiaries", {
      method: "POST",
      token,
      body: payload
    });
  },
  createTransfer(token, payload, idempotencyKey) {
    return apiRequest("/transfers", {
      method: "POST",
      token,
      body: payload,
      headers: { "Idempotency-Key": idempotencyKey }
    });
  }
};
