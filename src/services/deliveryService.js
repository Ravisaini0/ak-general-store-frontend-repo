import { apiFetch } from "./api";

export async function fetchDeliveryOrders() {
  const response = await apiFetch("/api/delivery/orders");
  return response.data || [];
}

export async function acceptDeliveryOrder(orderId, deliveryBoyId = 2) {
  const response = await apiFetch(
    `/api/delivery/orders/${orderId}/accept?deliveryBoyId=${deliveryBoyId}`,
    {
      method: "PUT",
    }
  );

  return response.data;
}

export async function markDeliveryOrderCompleted(orderId, payload = {}) {
  const response = await apiFetch(`/api/delivery/orders/${orderId}/delivered`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function requestWeeklyWithdrawal() {
  await apiFetch("/api/delivery/payouts/request", {
    method: "POST",
  });
}
