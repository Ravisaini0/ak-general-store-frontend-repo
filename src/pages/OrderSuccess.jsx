import { Check } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { useOrders } from "../context/OrderContext";
import { getOrderStatusLabel } from "../utils/orderStatus";

function canCancelOrder(status) {
  return status === "ORDER_PLACED" || status === "ADMIN_CONFIRMED";
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cancelOrder } = useOrders();
  const [order, setOrder] = useState(state?.order || null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const handleCancelOrder = async () => {
    if (!order?.orderNumber) {
      return;
    }

    if (!window.confirm("Do you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);
      setError("");
      const updatedOrder = await cancelOrder(order.orderNumber);
      setOrder(updatedOrder);
    } catch (cancelError) {
      setError(cancelError.message || "Order could not be cancelled.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f9f5ec,_#f4efe4)] px-4 py-8">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-9">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100/80 text-green-600 shadow-inner">
          <Check className="h-12 w-12 stroke-[3]" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-green-700">Order Placed!</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          Your order has been placed successfully and is now in the order workflow.
        </p>

          <div className="mt-7 rounded-[1.5rem] bg-slate-50 px-5 py-6 text-sm text-slate-600">
            <p className="text-base font-black text-slate-900">Order ID</p>
            <p className="mt-3 text-[1.75rem] font-black tracking-tight text-slate-950">
              {order?.orderNumber || "#ORDER"}
            </p>
            <div className="mt-5 space-y-2.5">
              <p>
                Order Status:{" "}
                <span className="font-semibold text-slate-900">
                  {getOrderStatusLabel(order?.status || "ORDER_PLACED")}
                </span>
              </p>
              <p>
                Estimated Delivery: <span className="font-semibold text-slate-900">10-30 min</span>
              </p>
              <p>
                Payment Status:{" "}
              <span className="font-bold uppercase text-slate-900">
                {order?.paymentStatus || "PENDING"}
              </span>
            </p>
          </div>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          variant="accent"
          className="mt-8 w-full rounded-[1rem] py-4 text-base font-black"
          type="button"
          onClick={() => navigate("/")}
        >
          Go to Home
        </Button>
        <Link
          to="/my-orders"
          className="mt-3 inline-flex w-full items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
        >
          Check My Orders
        </Link>
        {canCancelOrder(order?.status) ? (
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="mt-3 inline-flex w-full items-center justify-center rounded-[1rem] border border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
