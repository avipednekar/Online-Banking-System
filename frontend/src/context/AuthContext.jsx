import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const TOKEN_STORAGE_KEY = "bank_token";
const USER_STORAGE_KEY = "bank_user";

const AuthContext = createContext(null);

function readStoredValue(key) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(key) || "";
}

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredValue(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);

    if (typeof window === "undefined") {
      return;
    }

    if (nextToken) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (nextUser) {
      window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  function clearSession() {
    persistSession("", null);
  }

  async function refreshProfile(activeToken = token) {
    if (!activeToken) {
      clearSession();
      return null;
    }

    const profile = await authService.getProfile(activeToken);
    persistSession(activeToken, profile);
    return profile;
  }

  async function authenticate(mode, payload) {
    setAuthLoading(true);
    try {
      const response =
        mode === "register"
          ? await authService.register(payload)
          : await authService.login(payload);

      persistSession(response.token, {
        userId: response.userId,
        username: response.username,
        role: response.role
      });

      const profile = await refreshProfile(response.token);
      return {
        response,
        profile
      };
    } finally {
      setAuthLoading(false);
    }
  }

  function login(credentials) {
    return authenticate("login", credentials);
  }

  function register(payload) {
    return authenticate("register", payload);
  }

  function logout() {
    clearSession();
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setAuthReady(true);
        return;
      }

      setAuthLoading(true);
      try {
        await refreshProfile(token);
      } catch {
        clearSession();
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setAuthReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      authReady,
      authLoading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      refreshProfile
    }),
    [token, user, authReady, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return value;
}
