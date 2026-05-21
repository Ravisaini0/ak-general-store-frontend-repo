import Footer from "../components/common/Footer";
import BackButton from "../components/common/BackButton";
import Header from "../components/common/Header";
import TopBar from "../components/common/TopBar";
import CartItem from "../components/cart/CartItem";
import CartSidebar from "../components/cart/CartSidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleOrderNow = () => {
    if (session?.role !== "user") {
      navigate("/login", {
        state: {
          from: { pathname: "/checkout" },
        },
      });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Your Cart</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review items before checkout. Delivery bar automatically updates.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.length ? (
              <>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                    onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                    onRemove={() => removeFromCart(item.product.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-4 py-4 text-base font-black text-slate-950 transition hover:-translate-y-0.5"
                >
                  Order Now
                </button>
              </>
            ) : (
              <div className="card-surface p-8 text-center text-slate-500">
                Your cart is empty. Add products from the home page to continue.
              </div>
            )}
          </div>
          <CartSidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
