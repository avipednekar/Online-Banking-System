import { apiRequest } from "./api";

export const adminService = {
  getOverview(token) {
    return apiRequest("/admin/overview", { token });
  },
  getCustomers(token, { page = 0, size = 25, search = "", kycStatus = "", signal } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    if (search) {
      params.set("search", search);
    }

    if (kycStatus) {
      params.set("kycStatus", kycStatus);
    }

    return apiRequest(`/admin/customers?${params.toString()}`, { token, signal });
  },
  getCustomerDetail(token, userId, { signal } = {}) {
    return apiRequest(`/admin/customers/${userId}`, { token, signal });
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
