import { apiFetch } from "./api";

export async function fetchPaymentConfig() {
  const response = await apiFetch("/api/payments/config");
  return response.data;
}

export async function createManualPayment(payload) {
  const response = await apiFetch("/api/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function createRazorpayOrder(orderId) {
  const response = await apiFetch("/api/payments/razorpay/order", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

  return response.data;
}

export async function verifyRazorpayPayment(payload) {
  const response = await apiFetch("/api/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function markRazorpayPaymentFailed(orderId) {
  const response = await apiFetch(`/api/payments/razorpay/fail/${orderId}`, {
    method: "POST",
  });

  return response.data;
}

export function loadRazorpayCheckoutScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
