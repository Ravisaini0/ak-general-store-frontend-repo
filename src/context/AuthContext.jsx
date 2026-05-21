import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = "ak-general-store-session";
const MAX_STORED_AVATAR_LENGTH = 180000;

function normalizeRole(role = "user") {
  const value = String(role).toLowerCase();

  if (value === "customer") {
    return "user";
  }

  return value;
}

function sanitizeAvatar(avatar) {
  if (typeof avatar !== "string") {
    return null;
  }

  const trimmedAvatar = avatar.trim();
  if (!trimmedAvatar) {
    return null;
  }

  return trimmedAvatar.length <= MAX_STORED_AVATAR_LENGTH ? trimmedAvatar : null;
}

function createPersistedSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    ...session,
    avatar: sanitizeAvatar(session.avatar),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
      return storedValue ? createPersistedSession(JSON.parse(storedValue)) : null;
    } catch {
      return null;
    }
  });

  const login = (role, payload) => {
    const nextSession = {
      role: normalizeRole(role),
      name: payload?.name || "AK User",
      email: payload?.email || "",
      userId: Number(payload?.userId || 0),
      token: payload?.token || null,
      avatar: payload?.avatar || null,
      phone: payload?.phone || null,
      blocked: Boolean(payload?.blocked),
    };

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(createPersistedSession(nextSession)));
      } catch {
        try {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
          // Ignore storage failures and continue with in-memory state.
        }
      }
    }

    setSession(nextSession);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    setSession(null);
  };

  const updateProfile = (payload) => {
    setSession((current) =>
      current
        ? {
            ...current,
            ...payload,
          }
        : current
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(createPersistedSession(session)));
    } catch {
      try {
        window.localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            ...createPersistedSession(session),
            avatar: null,
          })
        );
      } catch {
        // Ignore storage failures and continue with in-memory state.
      }
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    window.localStorage.removeItem("ak-general-store-profiles");

    const handleExpiredSession = () => {
      setSession(null);
    };

    window.addEventListener("ak-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("ak-auth-expired", handleExpiredSession);
  }, []);

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
      updateProfile,
      isUser: session?.role === "user",
      isAdmin: session?.role === "admin",
      isDelivery: session?.role === "delivery",
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
