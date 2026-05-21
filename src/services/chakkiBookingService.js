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
