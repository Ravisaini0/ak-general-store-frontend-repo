import { mapCategory, mapProduct } from "../utils/storeMappers";
import { API_BASE_URL, apiFetch } from "./api";

export async function fetchCategories() {
  const response = await apiFetch("/api/categories");
  return (response.data || []).map(mapCategory);
}

export async function fetchProducts(options = {}) {
  const params = new URLSearchParams();

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  const response = await apiFetch(`/api/products${params.toString() ? `?${params.toString()}` : ""}`);
  return (response.data || []).map(mapProduct);
}

export async function fetchProductById(id) {
  const response = await apiFetch(`/api/products/${id}`);
  return mapProduct(response.data);
}

export async function createProduct(payload) {
  const response = await apiFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapProduct(response.data);
}

export async function bulkImportProducts(payload) {
  const response = await apiFetch("/api/admin/products/bulk-import", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response.data,
    products: (response.data?.products || []).map(mapProduct),
  };
}

export async function updateProduct(id, payload) {
  const response = await apiFetch(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapProduct(response.data);
}

export async function deleteProduct(id) {
  await apiFetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/admin/products/upload-image", {
    method: "POST",
    body: formData,
  });

  const imageUrl = response.data?.imageUrl || "";
  return imageUrl.startsWith("/") ? `${API_BASE_URL}${imageUrl}` : imageUrl;
}

export async function createCategory(payload) {
  const response = await apiFetch("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapCategory(response.data);
}

export async function bulkImportCategories(payload) {
  const response = await apiFetch("/api/admin/categories/bulk-import", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response.data,
    categories: (response.data?.categories || []).map(mapCategory),
  };
}

export async function updateCategory(id, payload) {
  const response = await apiFetch(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapCategory(response.data);
}

export async function uploadCategoryImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/admin/categories/upload-image", {
    method: "POST",
    body: formData,
  });

  const imageUrl = response.data?.imageUrl || "";
  return imageUrl.startsWith("/") ? `${API_BASE_URL}${imageUrl}` : imageUrl;
}

export async function deleteCategory(id) {
  await apiFetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
}
