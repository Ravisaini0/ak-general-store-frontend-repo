import { Clock3, MapPinned, PackageCheck } from "lucide-react";
import { getOrderStatusLabel } from "../../utils/orderStatus";

function formatOrderItems(order) {
  if (order.orderItems?.length) {
    return order.orderItems.map((item) => `${item.productName} x${item.quantity}`).join(", ");
  }

  return order.itemNames?.join(", ") || "Grocery order";
}

function getStatusTone(status) {
  switch (status) {
    case "ASSIGNED_TO_DELIVERY":
      return "bg-yellow-100 text-yellow-800";
    case "PICKED_BY_DELIVERY":
      return "bg-blue-100 text-blue-800";
    case "ORDER_COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function DeliveryOrderCard({ order, onAccept }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">{order.orderNumber || order.id}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{order.customerName || order.customer}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <MapPinned className="h-3.5 w-3.5" />
                {order.deliveryAddress || "Delivery address pending"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                <Clock3 className="h-3.5 w-3.5" />
                {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Just now"}
              </span>
            </div>
          </div>
        </div>
        <div className="lg:text-right">
          <p className="font-black text-slate-950">Rs{order.totalAmount || order.total}</p>
          <p className="mt-1 text-xs text-slate-500">{formatOrderItems(order)}</p>
          <p
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(order.status)}`}
          >
            {getOrderStatusLabel(order.status)}
          </p>
          {onAccept ? (
            <button
              type="button"
              onClick={onAccept}
              className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-400"
            >
              Start
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
