import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { fetchPublicStoreSettings } from "../../services/storeService";
import { formatPrice } from "../../utils/formatPrice";

export default function CartSummary() {
  const { totalAmount, totalItems } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [storeSettings, setStoreSettings] = useState({
    freeDeliveryThreshold: "299",
    deliveryCharge: "40",
  });
  const freeDeliveryThreshold = Number(storeSettings.freeDeliveryThreshold || 299);
  const standardDeliveryCharge = Number(storeSettings.deliveryCharge || 40);
  const deliveryFee =
    totalAmount === 0 || totalAmount >= freeDeliveryThreshold ? 0 : standardDeliveryCharge;

  useEffect(() => {
    let cancelled = false;

    async function loadStoreSettings() {
      try {
        const response = await fetchPublicStoreSettings();
        if (cancelled) {
          return;
        }

        setStoreSettings({
          freeDeliveryThreshold: response.freeDeliveryThreshold || "299",
          deliveryCharge: response.deliveryCharge || "40",
        });
      } catch {
        if (!cancelled) {
          setStoreSettings({
            freeDeliveryThreshold: "299",
            deliveryCharge: "40",
          });
        }
      }
    }

    loadStoreSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCheckout = () => {
    if (!totalItems) {
      return;
    }

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
    <aside className="card-surface h-fit p-6">
      <h3 className="text-xl font-black text-slate-950">Bill Summary</h3>
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold">{formatPrice(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Delivery</span>
          <span className="font-semibold">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-base">
          <span className="font-bold text-slate-900">Total</span>
          <span className="font-black text-slate-950">{formatPrice(totalAmount + deliveryFee)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleCheckout}
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-400"
      >
        {totalItems ? "Proceed to Checkout" : "Add Products First"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        Free delivery above {formatPrice(freeDeliveryThreshold)}. Address and payment details are completed on the next page.
      </p>
    </aside>
  );
}
