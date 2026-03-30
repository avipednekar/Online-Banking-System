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
  refresh(refreshToken) {
    return apiRequest("/auth/refresh", {
      method: "POST",
      body: { refreshToken }
    });
  },
  logout(refreshToken) {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: { refreshToken }
    });
  }
};
