import { getOrderStatusLabel } from "../../utils/orderStatus";

function getStatusTone(status) {
  switch (status) {
    case "ORDER_PLACED":
      return "bg-yellow-100 text-yellow-800";
    case "ADMIN_CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "ASSIGNED_TO_DELIVERY":
      return "bg-indigo-100 text-indigo-800";
    case "PICKED_BY_DELIVERY":
      return "bg-orange-100 text-orange-800";
    case "ORDER_COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    case "ORDER_CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function OrderTable({ orders, onConfirm, onAssign }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="space-y-4 p-4 xl:hidden">
        {orders.map((order, index) => (
          <div key={order.orderNumber || order.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black text-slate-950">#{order.orderNumber || order.id}</p>
                <p className="mt-2 font-semibold text-slate-900">{order.customerName || order.customer}</p>
                <p className="mt-1 text-xs text-slate-500">{order.customerEmail || order.customerPhone || "Customer profile"}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-black text-slate-950">Rs.{order.totalAmount || order.total}</p>
                <p className="mt-1 text-sm text-slate-500">{order.paymentMode || order.paymentType}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Date</p>
                <p className="mt-1">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : `12 May, ${10 + index}:30 AM`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
                <p className="mt-1">{order.itemNames?.join(", ") || "Grocery order"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Payment state</p>
                <p className="mt-1">
                  {order.paymentStatus || "PENDING"}
                  {order.collectionMethod ? ` • ${order.collectionMethod}` : ""}
                </p>
              </div>
              {order.servingStoreName ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Store</p>
                  <p className="mt-1">{order.servingStoreName}</p>
                </div>
              ) : null}
              {order.batchId ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Batch</p>
                  <p className="mt-1">
                    Batch #{order.batchId} • {order.batchTotalOrders || 0} orders • Rs.
                    {Number(order.batchTotalEarning || 0).toFixed(0)}
                  </p>
                </div>
              ) : null}
              {order.assignedDeliveryName ? (
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned delivery</p>
                  <p className="mt-1">
                    {order.assignedDeliveryName}
                    {order.deliveryBoyStatus ? ` • ${String(order.deliveryBoyStatus).replaceAll("_", " ")}` : ""}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery earning</p>
                <p className="mt-1">Rs.{Number(order.deliveryEarningAmount || 0).toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {onConfirm && order.status === "ORDER_PLACED" ? (
                <button
                  type="button"
                  onClick={() => onConfirm(order.orderNumber)}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"
                >
                  Confirm
                </button>
              ) : null}
              {onAssign && order.status === "ADMIN_CONFIRMED" ? (
                <button
                  type="button"
                  onClick={() => onAssign(order)}
                  className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-slate-950"
                >
                  Assign Delivery
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Batch / Delivery</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderNumber || order.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-semibold text-slate-900">#{order.orderNumber || order.id}</td>
                <td className="px-4 py-4 text-slate-700">
                  <p className="font-semibold text-slate-900">{order.customerName || order.customer}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.customerEmail || order.customerPhone || "Customer profile"}</p>
                </td>
                <td className="px-4 py-4 font-semibold text-slate-950">Rs.{order.totalAmount || order.total}</td>
                <td className="px-4 py-4 text-slate-700">
                  <p className="font-semibold text-slate-900">{order.paymentMode || order.paymentType}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.paymentStatus || "PENDING"}
                    {order.collectionMethod ? ` • ${order.collectionMethod}` : ""}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {order.batchId ? `Batch #${order.batchId}` : order.servingStoreName || "Primary store"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.assignedDeliveryName || "Not assigned yet"}
                    {order.deliveryBoyStatus ? ` • ${String(order.deliveryBoyStatus).replaceAll("_", " ")}` : ""}
                  </p>
                  {order.batchId ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {order.batchTotalOrders || 0} orders • Batch earning Rs.{Number(order.batchTotalEarning || 0).toFixed(0)}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : `12 May, ${10 + index}:30 AM`}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {onConfirm && order.status === "ORDER_PLACED" ? (
                      <button
                        type="button"
                        onClick={() => onConfirm(order.orderNumber)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"
                      >
                        Confirm
                      </button>
                    ) : null}
                    {onAssign && order.status === "ADMIN_CONFIRMED" ? (
                      <button
                        type="button"
                        onClick={() => onAssign(order)}
                        className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-slate-950"
                      >
                        Assign Delivery
                      </button>
                    ) : null}
                    {order.assignedDeliveryName ? (
                      <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                        {order.assignedDeliveryName}
                      </span>
                    ) : null}
                    <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      Earn Rs.{Number(order.deliveryEarningAmount || 0).toFixed(0)}
                    </span>
                    {order.itemNames?.length ? (
                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        {order.itemNames.join(", ")}
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
