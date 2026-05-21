import { apiFetch } from "./api";

export async function placeOrder(payload) {
  const response = await apiFetch("/api/orders/place", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function fetchMyOrders(userId = 1) {
  const response = await apiFetch("/api/orders/my-orders");
  return response.data || [];
}

export async function cancelOrder(orderNumber) {
  const response = await apiFetch(`/api/orders/${orderNumber}/cancel`, {
    method: "PUT",
  });

  return response.data;
}
