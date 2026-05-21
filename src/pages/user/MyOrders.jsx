import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../components/common/BackButton";
import Button from "../../components/common/Button";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import { formatPrice } from "../../utils/formatPrice";
import { getOrderStatusLabel } from "../../utils/orderStatus";

export default function MyOrders() {
  const { orders, refreshOrders, cancelOrder } = useOrders();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState("");

  useEffect(() => {
    if (!session?.userId) {
      setLoading(false);
      return;
    }

    refreshOrders(session.userId).finally(() => setLoading(false));
  }, [refreshOrders, session?.userId]);

  const canCancelOrder = (status) => status === "ORDER_PLACED" || status === "ADMIN_CONFIRMED";

  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm("Do you want to cancel this order?")) {
      return;
    }

    try {
      setActionError("");
      setCancellingOrderNumber(orderNumber);
      await cancelOrder(orderNumber);
    } catch (cancelError) {
      setActionError(cancelError.message || "Order could not be cancelled.");
    } finally {
      setCancellingOrderNumber("");
    }
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/profile" className="mb-5" />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-950">My Orders</h1>
            <p className="mt-2 text-sm text-slate-500">Track placed orders and current delivery status.</p>
          </div>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold" onClick={() => refreshOrders(session?.userId)}>
            Refresh
          </button>
        </div>
        {actionError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}

        <div className="space-y-4">
          {loading ? <div className="soft-panel p-6 text-slate-500">Loading your orders...</div> : null}
          {!loading && !orders.length ? <div className="soft-panel p-6 text-slate-500">No orders found for this account yet.</div> : null}
          {orders.map((order) => (
            <div key={order.orderNumber} className="soft-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-500">Order ID</p>
                  <h2 className="text-2xl font-black text-slate-950">{order.orderNumber}</h2>
                  <p className="mt-2 text-sm text-slate-500">{order.itemNames.join(", ") || "Grocery items"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{getOrderStatusLabel(order.status)}</p>
                  <p className="text-2xl font-black text-slate-950">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="store-chip">Payment: {order.paymentStatus}</span>
                <span className="store-chip">Address saved</span>
                <Link to={`/tracking/${order.orderNumber}`} className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                  Track Order
                </Link>
                {canCancelOrder(order.status) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleCancelOrder(order.orderNumber)}
                    disabled={cancellingOrderNumber === order.orderNumber}
                  >
                    {cancellingOrderNumber === order.orderNumber ? "Cancelling..." : "Cancel Order"}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
