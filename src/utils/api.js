const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const SESSION_STORAGE_KEY = "ak-general-store-session";
const AUTH_REDIRECT_MESSAGE_KEY = "ak-auth-redirect-message";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const session = JSON.parse(rawValue);
    return session?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const isProtectedRoute =
      path.startsWith("/api/admin") ||
      path.startsWith("/api/delivery") ||
      path.startsWith("/api/orders") ||
      path.startsWith("/api/addresses");

    if ((response.status === 401 || response.status === 403) && isProtectedRoute && typeof window !== "undefined") {
      const fallbackMessage =
        path.startsWith("/api/admin")
          ? "Your admin session expired. Please login again."
          : path.startsWith("/api/delivery")
            ? "Your delivery session expired. Please login again."
            : "Your session expired. Please login again.";

      const message =
        typeof payload === "object" && payload !== null && "message" in payload
          ? payload.message || fallbackMessage
          : fallbackMessage;

      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.sessionStorage.setItem(AUTH_REDIRECT_MESSAGE_KEY, message);
      window.dispatchEvent(
        new CustomEvent("ak-auth-expired", {
          detail: {
            path,
            status: response.status,
            message,
          },
        })
      );
    }

    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? payload.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export { API_BASE_URL };
export { AUTH_REDIRECT_MESSAGE_KEY };
