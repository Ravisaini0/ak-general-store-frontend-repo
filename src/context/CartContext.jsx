import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "ak-general-store-cart";

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

function resolveProduct(productOrId) {
  if (typeof productOrId === "object" && productOrId !== null) {
    return normalizeProduct(productOrId);
  }

  return null;
}

function sanitizeCartItems(items) {
  return items
    .map((item) => ({
      ...item,
      quantity: Math.max(1, Number(item.quantity) || 1),
      product: normalizeProduct(item.product),
    }))
    .filter((item) => item.product?.id);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) {
      return [];
    }

    try {
      return sanitizeCartItems(JSON.parse(savedCart));
    } catch {
      return [];
    }
  });

  const addToCart = (productOrId, quantity = 1) => {
    const product = resolveProduct(productOrId);
    if (!product) return;

    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { product, quantity }];
    });
  };

  const buyNow = (productOrId, quantity = 1) => {
    const product = resolveProduct(productOrId);
    if (!product) return;

    setCartItems([{ product, quantity }]);
  };

  const updateQuantity = (productId, nextQuantity) => {
    if (nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const value = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    return {
      cartItems,
      totalItems,
      totalAmount,
      addToCart,
      buyNow,
      updateQuantity,
      removeFromCart,
      clearCart,
    };
  }, [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
