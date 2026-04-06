import { apiRequest } from "./api";

export const adminService = {
  getOverview(token) {
    return apiRequest("/admin/overview", { token });
  },
  getCustomers(token, page = 0, size = 20) {
    return apiRequest(`/admin/customers?page=${page}&size=${size}`, { token });
  },
  getAccountRequests(token) {
    return apiRequest("/admin/account-requests", { token });
  },
  updateKyc(token, userId, kycStatus) {
    return apiRequest(`/admin/customers/${userId}/kyc`, {
      method: "PATCH",
      token,
      body: { kycStatus }
    });
  },
  approveAccountRequest(token, requestId) {
    return apiRequest(`/admin/account-requests/${requestId}/approve`, {
      method: "PATCH",
      token
    });
  },
  approveTransfer(token, transferId) {
    return apiRequest(`/admin/transfers/${transferId}/approve`, {
      method: "PATCH",
      token
    });
  }
};
