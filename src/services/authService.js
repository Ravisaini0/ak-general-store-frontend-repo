import { API_BASE_URL, apiFetch } from "./api";

function mapRole(role = "CUSTOMER") {
  const value = String(role).toUpperCase();

  if (value === "ADMIN") {
    return "admin";
  }

  if (value === "DELIVERY") {
    return "delivery";
  }

  return "user";
}

function normalizeAssetUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  return value.startsWith("/") ? `${API_BASE_URL}${value}` : value;
}

function mapAuthPayload(payload = {}) {
  return {
    token: payload.token || null,
    role: mapRole(payload.role),
    name: payload.name || "AK User",
    email: payload.email || "",
    phone: payload.phone || "",
    emailVerified: Boolean(payload.emailVerified),
    blocked: Boolean(payload.blocked),
    userId: Number(payload.userId || 1),
    avatar: normalizeAssetUrl(payload.avatar),
  };
}

export async function loginWithCredentials({ email, password }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return mapAuthPayload(response.data);
}

export async function requestUserLoginOtp({ email, password }) {
  const response = await apiFetch("/api/auth/request-login-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return response.data;
}

export async function completeUserLogin({ email, password, verificationToken }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      verificationToken,
    }),
  });

  return mapAuthPayload(response.data);
}

export async function registerAccount({
  name,
  email,
  phone,
  password,
  verificationToken = "",
}) {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
      verificationToken,
      role: "CUSTOMER",
    }),
  });

  return mapAuthPayload(response.data);
}

export async function requestRegistrationOtp(identifier) {
  const response = await apiFetch("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      purpose: "REGISTER",
    }),
  });

  return response.data;
}

export async function verifyRegistrationOtp(identifier, code) {
  const response = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      code,
      purpose: "REGISTER",
    }),
  });

  return response.data;
}

export async function verifyLoginOtp(identifier, code) {
  const response = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      code,
      purpose: "LOGIN",
    }),
  });

  return response.data;
}

export async function loginAdmin({ email, password }) {
  const payload = await loginWithCredentials({ email, password });

  if (payload.role !== "admin") {
    throw new Error("This account does not have admin access.");
  }

  return payload;
}

export async function loginDelivery({ phone, password }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone,
      password,
    }),
  });

  const payload = mapAuthPayload(response.data);
  if (payload.role !== "delivery") {
    throw new Error("This account does not have delivery access.");
  }

  return payload;
}

export async function uploadProfileAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/auth/profile/avatar", {
    method: "POST",
    body: formData,
  });

  return normalizeAssetUrl(response.data?.imageUrl || "");
}

export async function removeProfileAvatar() {
  await apiFetch("/api/auth/profile/avatar", {
    method: "DELETE",
  });
}
