import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const emptyProviders = {
  google: { configured: false, label: "Google" },
  apple: { configured: false, label: "Apple" },
  github: { configured: false, label: "GitHub" },
  x: { configured: false, label: "X" },
};

const AuthContext = createContext(null);

async function apiRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || "Request failed");
    error.code = payload.error?.code || "REQUEST_FAILED";
    error.details = payload.error?.details;
    throw error;
  }
  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [providers, setProviders] = useState(emptyProviders);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const result = await apiRequest("/auth/session");
      setUser(result.user || null);
      setProviders({ ...emptyProviders, ...result.providers });
      setEmailConfigured(result.emailConfigured !== false);
    } catch {
      setUser(null);
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const requestEmailCode = useCallback(async ({ email, name, intent, language }) => {
    return apiRequest("/auth/email/request", {
      method: "POST",
      body: JSON.stringify({ email, name, intent, language }),
    });
  }, []);

  const verifyEmailCode = useCallback(async ({ email, code }) => {
    const result = await apiRequest("/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const startOAuth = useCallback((provider) => {
    const redirect = window.location.hash.replace(/^#\//, "") || "dashboard";
    window.location.assign(`/api/auth/oauth/${provider}/start?redirect=${encodeURIComponent(redirect)}`);
  }, []);

  const value = useMemo(() => ({
    user,
    providers,
    emailConfigured,
    sessionReady,
    refreshSession,
    requestEmailCode,
    verifyEmailCode,
    startOAuth,
    logout,
  }), [
    user,
    providers,
    emailConfigured,
    sessionReady,
    refreshSession,
    requestEmailCode,
    verifyEmailCode,
    startOAuth,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
