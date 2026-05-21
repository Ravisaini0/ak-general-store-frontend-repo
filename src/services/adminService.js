import { apiFetch } from "./api";

export async function fetchAdminDashboardData() {
  const response = await apiFetch("/api/admin/dashboard");
  return response.data;
}

export async function fetchAdminOrders() {
  const response = await apiFetch("/api/admin/orders");
  return response.data || [];
}

export async function updateAdminOrderStatus(orderId, status) {
  const response = await apiFetch(`/api/admin/orders/${orderId}/status?status=${status}`, {
    method: "PUT",
  });

  return response.data;
}

export async function assignOrderToDelivery(orderId, deliveryBoyId = 3) {
  const response = await apiFetch(
    `/api/admin/orders/${orderId}/assign?deliveryBoyId=${deliveryBoyId}`,
    {
      method: "PUT",
    }
  );

  return response.data;
}

export async function fetchAdminCustomers() {
  const response = await apiFetch("/api/admin/customers");
  return response.data || [];
}

export async function updateCustomerBlockedStatus(userId, blocked) {
  const response = await apiFetch(`/api/admin/customers/${userId}/blocked?blocked=${blocked}`, {
    method: "PUT",
  });

  return response.data;
}

export async function deleteCustomer(userId) {
  await apiFetch(`/api/admin/customers/${userId}`, {
    method: "DELETE",
  });
}

export async function fetchAdminDeliveryTeam() {
  const response = await apiFetch("/api/admin/delivery-team");
  return response.data || [];
}

export async function createAdminDeliveryPartner(payload) {
  const response = await apiFetch("/api/admin/delivery-team", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateDeliveryPartnerBlockedStatus(userId, blocked) {
  const response = await apiFetch(`/api/admin/delivery-team/${userId}/blocked?blocked=${blocked}`, {
    method: "PUT",
  });

  return response.data;
}

export async function markDeliveryPayoutPaid(userId, payload = {}) {
  const response = await apiFetch(`/api/admin/delivery-team/${userId}/payout`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function fetchCoupons() {
  const response = await apiFetch("/api/admin/coupons");
  return response.data || [];
}

export async function createCoupon(payload) {
  const response = await apiFetch("/api/admin/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateCoupon(id, payload) {
  const response = await apiFetch(`/api/admin/coupons/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteCoupon(id) {
  await apiFetch(`/api/admin/coupons/${id}`, {
    method: "DELETE",
  });
}

export async function fetchReports() {
  const response = await apiFetch("/api/admin/reports");
  return response.data;
}

export async function fetchAdminSettings() {
  const response = await apiFetch("/api/admin/settings");
  return response.data;
}

export async function updateAdminSettings(payload) {
  const response = await apiFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}
