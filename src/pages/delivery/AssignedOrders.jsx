import { Link } from "react-router-dom";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import DeliveryOrderCard from "../../components/delivery/DeliveryOrderCard";
import { useOrders } from "../../context/OrderContext";

function formatOrderItems(order) {
  if (order.orderItems?.length) {
    return order.orderItems.map((item) => `${item.productName} x${item.quantity}`).join(", ");
  }

  return order.itemNames?.join(", ") || "Grocery order";
}

export default function AssignedOrders() {
  const { orders, pickOrder, refreshOrders } = useOrders();
  const readyOrders = orders.filter((order) => order.status === "ASSIGNED_TO_DELIVERY");
  const inTransitOrders = orders.filter((order) => order.status === "PICKED_BY_DELIVERY");

  return (
    <DeliveryLayout
      title="Assigned Orders"
      description="Review pending pickups, open route details, and move active orders toward successful delivery."
      onRefresh={refreshOrders}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total assigned</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{orders.length}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ready to start</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{readyOrders.length}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Out for delivery</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{inTransitOrders.length}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Route focus</p>
          <p className="mt-2 text-lg font-black text-slate-950">High priority</p>
          <p className="mt-1 text-sm text-slate-500">Handle oldest assigned order first.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <div key={order.orderNumber} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <DeliveryOrderCard
                order={order}
                onAccept={
                  order.status === "ASSIGNED_TO_DELIVERY"
                    ? () => pickOrder(order.orderNumber)
                    : undefined
                }
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                  <p>
                    Delivery address: <span className="font-semibold text-slate-700">{order.deliveryAddress || "Pending"}</span>
                  </p>
                  <p className="mt-1">
                    Ordered items: <span className="font-semibold text-slate-700">{formatOrderItems(order)}</span>
                  </p>
                  <p className="mt-1">
                    Batch #{order.batchId || "-"} • Earn Rs.{Number(order.deliveryEarningAmount || 0).toFixed(0)}
                    {order.batchTotalOrders ? ` • ${order.batchTotalOrders} batch orders` : ""}
                  </p>
                </div>
                <Link
                  to={`/delivery/order/${order.orderNumber}`}
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No assigned orders are available right now.
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
}
