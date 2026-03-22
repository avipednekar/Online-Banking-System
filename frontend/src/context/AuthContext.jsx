import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const TOKEN_STORAGE_KEY = "bank_token";
const USER_STORAGE_KEY = "bank_user";

const AuthContext = createContext(null);

function readStoredUser() {
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
  const [token, setToken] = useState(() => window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [user, setUser] = useState(readStoredUser);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);

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

    const profile = await apiRequest("/auth/me", { token: activeToken });
    persistSession(activeToken, profile);
    return profile;
  }

  async function authenticate(path, payload) {
    setAuthLoading(true);
    try {
      const response = await apiRequest(path, {
        method: "POST",
        body: payload
      });

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

  async function login(credentials) {
    return authenticate("/auth/login", credentials);
  }

  async function register(payload) {
    return authenticate("/auth/register", payload);
  }

  function logout() {
    clearSession();
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
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

    bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return value;
}
