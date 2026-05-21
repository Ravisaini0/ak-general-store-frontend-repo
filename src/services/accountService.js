import { apiFetch } from "./api";

export async function requestPasswordReset(identifier) {
  const response = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });

  return response.data;
}

export async function verifyPasswordResetOtp(identifier, code) {
  const response = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      code,
      purpose: "RESET_PASSWORD",
    }),
  });

  return response.data;
}

export async function resetPassword({ identifier, verificationToken, newPassword }) {
  const response = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      verificationToken,
      newPassword,
    }),
  });

  return response.data;
}
