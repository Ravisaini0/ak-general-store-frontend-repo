import { apiFetch } from "./api";

export async function fetchAddresses() {
  const response = await apiFetch("/api/addresses");
  return response.data || [];
}

export async function createAddress(payload) {
  const response = await apiFetch("/api/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateAddress(id, payload) {
  const response = await apiFetch(`/api/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function deleteAddress(id) {
  await apiFetch(`/api/addresses/${id}`, {
    method: "DELETE",
  });
}
