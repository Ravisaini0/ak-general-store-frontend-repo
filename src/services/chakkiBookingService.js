import { apiFetch } from "./api";

export async function createChakkiBooking(payload) {
  const response = await apiFetch("/api/chakki-bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function fetchMyChakkiBookings() {
  const response = await apiFetch("/api/chakki-bookings/my");
  return response.data || [];
}

export async function fetchAdminChakkiBookings() {
  const response = await apiFetch("/api/admin/chakki-bookings");
  return response.data || [];
}

export async function updateChakkiBookingStatus(bookingId, status) {
  const response = await apiFetch(`/api/admin/chakki-bookings/${bookingId}/status?status=${status}`, {
    method: "PUT",
  });

  return response.data;
}
