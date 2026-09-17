import { mapCategory, mapProduct } from "../utils/storeMappers";
import { API_BASE_URL, apiFetch } from "./api";

const CATEGORIES_PATH = "/api/categories";
const BOOTSTRAP_CACHE_KEY = "__AK_STORE_BOOTSTRAP_CACHE__";
const CACHE_TTL_MS = 60 * 1000;

let categoriesCache = null;
let categoriesPromise = null;

function getBootstrappedCategories() {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window[BOOTSTRAP_CACHE_KEY]?.[CATEGORIES_PATH];
  if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS) {
    return null;
  }

  return cached.payload?.data || null;
}

export async function fetchCategories() {
  const bootstrappedCategories = getBootstrappedCategories();
  if (bootstrappedCategories) {
    categoriesCache = {
      data: bootstrappedCategories,
      savedAt: Date.now(),
    };
    return (bootstrappedCategories || []).map(mapCategory);
  }

  if (categoriesCache && Date.now() - categoriesCache.savedAt <= CACHE_TTL_MS) {
    return (categoriesCache.data || []).map(mapCategory);
  }

  if (!categoriesPromise) {
    categoriesPromise = apiFetch(CATEGORIES_PATH)
      .then((response) => {
        categoriesCache = {
          data: response.data || [],
          savedAt: Date.now(),
        };
        return categoriesCache.data;
      })
      .finally(() => {
        categoriesPromise = null;
      });
  }

  const categories = await categoriesPromise;
  return (categories || []).map(mapCategory);
}

export async function fetchProducts(options = {}) {
  const params = new URLSearchParams();

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  const response = await apiFetch(`/api/products${params.toString() ? `?${params.toString()}` : ""}`);
  return (response.data || []).map(mapProduct);
}

export async function fetchProductPage(options = {}) {
  const params = new URLSearchParams();
  params.set("page", String(options.page || 1));
  params.set("size", String(options.size || 8));

  const response = await apiFetch(`/api/products/page?${params.toString()}`);
  const data = response.data || {};
  return {
    ...data,
    products: (data.products || []).map(mapProduct),
  };
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
