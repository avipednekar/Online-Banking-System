import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authService } from "../services/authService";

const TOKEN_REFRESH_WINDOW_MS = 10_000;
const LONG_LIVED_REFRESH_BUFFER_MS = 60_000;
const SHORT_LIVED_REFRESH_BUFFER_MS = 10_000;

const AuthContext = createContext(null);
let sharedRefreshPromise = null;

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const refreshTimerRef = useRef(null);
  const refreshInFlightRef = useRef(null);
  const accessTokenExpiryRef = useRef(0);

  function scheduleTokenRefresh(expiresInMs) {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const lifetimeMs = Number(expiresInMs || 0);
    if (!Number.isFinite(lifetimeMs) || lifetimeMs <= 0 || typeof window === "undefined") {
      return;
    }

    const refreshDelayMs =
      lifetimeMs > 120_000
        ? Math.max(lifetimeMs - LONG_LIVED_REFRESH_BUFFER_MS, 1_000)
        : Math.max(lifetimeMs - SHORT_LIVED_REFRESH_BUFFER_MS, 1_000);

    refreshTimerRef.current = window.setTimeout(() => {
      void refreshSession();
    }, refreshDelayMs);
  }

  function applyAccessSession(authResponse, nextUser) {
    setToken(authResponse?.token || "");
    if (nextUser !== undefined) {
      setUser(nextUser);
    }

    accessTokenExpiryRef.current = authResponse?.expiresIn
      ? Date.now() + Number(authResponse.expiresIn)
      : 0;

    if (authResponse?.token && authResponse?.expiresIn) {
      scheduleTokenRefresh(authResponse.expiresIn);
    } else if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }

  function clearSession() {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    accessTokenExpiryRef.current = 0;
    setToken("");
    setUser(null);
  }

  async function refreshSession({ clearOnFailure = true } = {}) {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    if (sharedRefreshPromise) {
      refreshInFlightRef.current = sharedRefreshPromise;
      try {
        const response = await sharedRefreshPromise;
        applyAccessSession(response, (currentUser) =>
          currentUser || {
            userId: response.userId,
            username: response.username,
            role: response.role
          }
        );
        return response;
      } finally {
        refreshInFlightRef.current = null;
      }
    }

    const refreshPromise = (async () => {
      const response = await authService.refresh();
      applyAccessSession(response, (currentUser) =>
        currentUser || {
          userId: response.userId,
          username: response.username,
          role: response.role
        }
      );
      return response;
    })();

    refreshInFlightRef.current = refreshPromise;
    sharedRefreshPromise = refreshPromise;

    try {
      return await refreshPromise;
    } catch (error) {
      if (clearOnFailure) {
        clearSession();
      }
      throw error;
    } finally {
      refreshInFlightRef.current = null;
      sharedRefreshPromise = null;
    }
  }

  async function getValidAccessToken() {
    if (token && accessTokenExpiryRef.current - Date.now() > TOKEN_REFRESH_WINDOW_MS) {
      return token;
    }

    const refreshed = await refreshSession();
    return refreshed.token;
  }

  async function refreshProfile(activeToken = token) {
    try {
      const resolvedToken = activeToken || (await getValidAccessToken());
      const profile = await authService.getProfile(resolvedToken);
      setUser(profile);
      return profile;
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }

      const refreshed = await refreshSession();
      const profile = await authService.getProfile(refreshed.token);
      setUser(profile);
      return profile;
    }
  }

  async function authenticate(mode, payload) {
    setAuthLoading(true);
    try {
      const response =
        mode === "register"
          ? await authService.register(payload)
          : await authService.login(payload);

      applyAccessSession(response, {
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

  async function logout() {
    clearSession();

    try {
      await authService.logout();
    } catch {
      /* best-effort logout; local session is already cleared */
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setAuthLoading(true);
      try {
        const response = await refreshSession({ clearOnFailure: false });
        await refreshProfile(response.token);
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
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
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
      refreshProfile,
      getValidAccessToken
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
