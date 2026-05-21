import { apiFetch } from "./api";

export async function fetchPublicStoreSettings() {
  const response = await apiFetch("/api/store/settings");
  return response.data;
}
