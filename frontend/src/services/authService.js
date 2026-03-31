import { apiRequest } from "./api";

export const authService = {
  login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: credentials
    });
  },
  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: payload
    });
  },
  getProfile(token) {
    return apiRequest("/auth/me", { token });
  },
  refresh() {
    return apiRequest("/auth/refresh", {
      method: "POST"
    });
  },
  logout() {
    return apiRequest("/auth/logout", {
      method: "POST"
    });
  }
};
