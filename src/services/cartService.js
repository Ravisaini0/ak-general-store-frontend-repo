const CART_STORAGE_KEY = "ak-general-store-cart";

export function getStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveStoredCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function clearStoredCart() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
}
