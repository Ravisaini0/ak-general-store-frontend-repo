import { ArrowRight, CheckCircle2, MapPinned, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import DeliveryOrderCard from "../../components/delivery/DeliveryOrderCard";
import DeliveryStats from "../../components/delivery/DeliveryStats";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryDashboard() {
  const { session } = useAuth();
  const { orders, pickOrder, refreshOrders } = useOrders();
  const completedOrders = orders.filter((order) => order.status === "ORDER_COMPLETED");
  const deliveredCount = completedOrders.length;
  const assignedOrders = orders.filter((order) => order.status === "ASSIGNED_TO_DELIVERY").length;
  const activeOrders = orders.filter((order) => order.status !== "ORDER_COMPLETED");
  const earnings = completedOrders.reduce((sum, order) => sum + Number(order.deliveryEarningAmount || 0), 0);
  const cashCollected = completedOrders.reduce((sum, order) => sum + Number(order.cashCollectedAmount || 0), 0);
  const upiCollected = completedOrders.reduce((sum, order) => sum + Number(order.upiCollectedAmount || 0), 0);
  const pendingPayout = completedOrders.reduce(
    (sum, order) =>
      sum + (order.payoutStatus === "PAID" ? 0 : Number(order.deliveryEarningAmount || 0)),
    0
  );

  return (
    <DeliveryLayout
      title="Delivery Dashboard"
      description="Monitor assigned orders, start route execution, and keep delivery completion times under control."
      onRefresh={refreshOrders}
      actions={
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          {session?.name || "Delivery Partner"} is online
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f1720,_#1e293b)] p-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-300">Hello, {session?.name || "Rajesh"}</p>
              <h2 className="mt-2 text-3xl font-black">Daily route operations</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Review fresh assignments, start deliveries on time, and close completed orders with proof of handoff.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <DeliveryStats label="Assigned" value={String(assignedOrders)} hint="Ready to accept" />
              <DeliveryStats label="Delivered" value={String(deliveredCount)} hint="Completed successfully" />
              <DeliveryStats label="Earnings" value={`Rs${earnings.toFixed(0)}`} hint="Estimated current payout" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-950">Assigned Orders</h3>
                <p className="mt-1 text-sm text-slate-500">Orders waiting for pickup or already out for delivery.</p>
              </div>
              <Link
                to="/delivery/assigned-orders"
                className="inline-flex items-center gap-2 text-sm font-black text-slate-900"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {activeOrders.length ? (
                activeOrders.slice(0, 4).map((order) => (
                  <DeliveryOrderCard
                    key={order.orderNumber}
                    order={order}
                    onAccept={
                      order.status === "ASSIGNED_TO_DELIVERY"
                        ? () => pickOrder(order.orderNumber)
                        : undefined
                    }
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No assigned orders are available right now.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-xl font-black text-slate-950">Execution checklist</h3>
              <div className="mt-4 space-y-3">
                {[
                  { icon: PackageCheck, title: "Accept assigned orders", copy: "Start only orders mapped to your panel." },
                  { icon: MapPinned, title: "Open navigation", copy: "Use the exact delivery address before moving." },
                  { icon: CheckCircle2, title: "Mark delivered", copy: "Update status only after successful handoff." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white bg-white p-4">
                    <item.icon className="h-5 w-5 text-slate-900" />
                    <p className="mt-3 font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xl font-black text-slate-950">Collection snapshot</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cash collected</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs{cashCollected.toFixed(0)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">UPI collected</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs{upiCollected.toFixed(0)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending payout</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs{pendingPayout.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {activeOrders[0] ? (
              <Link
                to={`/delivery/order/${activeOrders[0].orderNumber}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-4 py-4 text-sm font-black text-slate-950"
              >
                Open Current Order Details
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </DeliveryLayout>
  );
}
