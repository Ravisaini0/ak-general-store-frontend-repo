import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = "ak-general-store-wishlist";

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  return {
    ...product,
    id: Number(product.id),
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || product.price || 0),
  };
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue).map(normalizeProduct).filter(Boolean) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) {
      return;
    }

    setWishlistItems((current) =>
      current.some((item) => item.id === normalized.id) ? current : [...current, normalized]
    );
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((current) => current.filter((item) => item.id !== Number(productId)));
  };

  const toggleWishlist = (product) => {
    const normalized = normalizeProduct(product);
    if (!normalized) {
      return;
    }

    setWishlistItems((current) =>
      current.some((item) => item.id === normalized.id)
        ? current.filter((item) => item.id !== normalized.id)
        : [...current, normalized]
    );
  };

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item.id === Number(productId));

  const value = useMemo(
    () => ({
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
    }),
    [wishlistItems]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
