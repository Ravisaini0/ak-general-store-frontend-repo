import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = "ak-general-store-session";
const PROFILE_STORAGE_KEY = "ak-general-store-profiles";

function normalizeRole(role = "user") {
  const value = String(role).toLowerCase();

  if (value === "customer") {
    return "user";
  }

  return value;
}

function getProfileKey(payload = {}) {
  const userId = Number(payload?.userId || 0);
  if (userId) {
    return `user:${userId}`;
  }

  if (payload?.email) {
    return `email:${String(payload.email).toLowerCase()}`;
  }

  if (payload?.phone) {
    return `phone:${String(payload.phone)}`;
  }

  return "";
}

function readStoredProfiles() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function writeStoredProfiles(profiles) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function mergeStoredProfile(payload = {}) {
  const profileKey = getProfileKey(payload);
  if (!profileKey) {
    return payload;
  }

  const storedProfiles = readStoredProfiles();
  const storedProfile = storedProfiles[profileKey] || {};

  return {
    ...payload,
    ...storedProfile,
    avatar: storedProfile.avatar || payload.avatar || null,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
      return storedValue ? mergeStoredProfile(JSON.parse(storedValue)) : null;
    } catch {
      return null;
    }
  });

  const login = (role, payload) => {
    const nextSession = mergeStoredProfile({
      role: normalizeRole(role),
      name: payload?.name || "AK User",
      email: payload?.email || "",
      userId: Number(payload?.userId || 0),
      token: payload?.token || null,
      avatar: payload?.avatar || null,
      phone: payload?.phone || null,
      blocked: Boolean(payload?.blocked),
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
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
        ? (() => {
            const nextSession = {
              ...current,
              ...payload,
            };

            const profileKey = getProfileKey(nextSession);
            if (profileKey) {
              const storedProfiles = readStoredProfiles();
              writeStoredProfiles({
                ...storedProfiles,
                [profileKey]: {
                  ...(storedProfiles[profileKey] || {}),
                  avatar: nextSession.avatar || null,
                },
              });
            }

            return nextSession;
          })()
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

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

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
