import { apiRequest } from "./api";

export const adminService = {
  getOverview(token) {
    return apiRequest("/admin/overview", { token });
  },
  getCustomers(token) {
    return apiRequest("/admin/customers", { token });
  },
  updateKyc(token, userId, kycStatus) {
    return apiRequest(`/admin/customers/${userId}/kyc`, {
      method: "PATCH",
      token,
      body: { kycStatus }
    });
  }
};
