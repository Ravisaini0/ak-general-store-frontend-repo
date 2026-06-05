import { apiFetch } from "./api";

export async function fetchPublicCoupons() {
  const response = await apiFetch("/api/coupons/public");
  return response.data;
}

export async function validateCouponCode(code, orderAmount) {
  const response = await apiFetch("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({
      code,
      orderAmount,
    }),
  });

  return response.data;
}
