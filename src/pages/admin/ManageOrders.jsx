import { CalendarDays, PackageCheck, Search, Truck, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import OrderTable from "../../components/admin/OrderTable";
import { useOrders } from "../../context/OrderContext";
import { fetchAdminDeliveryTeam } from "../../services/adminService";
import { getOrderStatusLabel } from "../../utils/orderStatus";

function matchesOrder(order, query) {
  const haystack = [
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    order.paymentMode,
    order.paymentStatus,
    order.collectionMethod,
    order.assignedDeliveryName,
    order.servingStoreName,
    order.batchId ? `batch ${order.batchId}` : "",
    order.deliveryBoyStatus,
    order.itemNames?.join(" "),
    getOrderStatusLabel(order.status),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getDateRangeBounds(dateRange, dateFrom, dateTo) {
  const now = new Date();

  switch (dateRange) {
    case "TODAY":
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
    case "LAST_7_DAYS": {
      const from = startOfDay(now);
      from.setDate(now.getDate() - 6);
      return { from, to: endOfDay(now) };
    }
    case "LAST_30_DAYS": {
      const from = startOfDay(now);
      from.setDate(now.getDate() - 29);
      return { from, to: endOfDay(now) };
    }
    case "CUSTOM":
      return {
        from: dateFrom ? startOfDay(new Date(dateFrom)) : null,
        to: dateTo ? endOfDay(new Date(dateTo)) : null,
      };
    default:
      return { from: null, to: null };
  }
}

function matchesDateRange(order, dateRange, dateFrom, dateTo) {
  const { from, to } = getDateRangeBounds(dateRange, dateFrom, dateTo);
  if (!from && !to) {
    return true;
  }

  const orderDate = new Date(order.createdAt || order.createdDate || Date.now());
  if (Number.isNaN(orderDate.getTime())) {
    return false;
  }

  if (from && orderDate < from) {
    return false;
  }
  if (to && orderDate > to) {
    return false;
  }

  return true;
}

function formatDateRangeLabel(dateRange, dateFrom, dateTo) {
  if (dateRange === "ALL") {
    return "All time";
  }
  if (dateRange === "TODAY") {
    return "Today";
  }
  if (dateRange === "LAST_7_DAYS") {
    return "Last 7 days";
  }
  if (dateRange === "LAST_30_DAYS") {
    return "Last 30 days";
  }
  if (dateRange === "CUSTOM") {
    if (dateFrom && dateTo) {
      return `${dateFrom} to ${dateTo}`;
    }
    if (dateFrom) {
      return `From ${dateFrom}`;
    }
    if (dateTo) {
      return `Until ${dateTo}`;
    }
  }
  return "Custom range";
}

export default function ManageOrders() {
  const { allOrders, confirmOrder, assignDeliveryBoy } = useOrders();
  const [deliveryTeam, setDeliveryTeam] = useState([]);
  const [assignmentError, setAssignmentError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");

  useEffect(() => {
    fetchAdminDeliveryTeam()
      .then(setDeliveryTeam)
      .catch((error) => setAssignmentError(error.message || "Delivery partners could not be loaded."));
  }, []);

  const pendingOrders = allOrders.filter((order) => order.status === "ORDER_PLACED").length;
  const assignedOrders = allOrders.filter((order) => order.status === "ASSIGNED_TO_DELIVERY").length;
  const availableDeliveryTeam = useMemo(
    () => deliveryTeam.filter((member) => !member.blocked),
    [deliveryTeam]
  );

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const queryMatch = !search.trim() || matchesOrder(order, search.trim());
      const statusMatch = statusFilter === "ALL" || order.status === statusFilter;
      const paymentMatch = paymentFilter === "ALL" || order.paymentMode === paymentFilter;
      const assignmentMatch =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "UNASSIGNED" && !order.assignedDeliveryName) ||
        (assignmentFilter === "ASSIGNED" && Boolean(order.assignedDeliveryName));
      const dateMatch = matchesDateRange(order, dateRange, dateFrom, dateTo);

      return queryMatch && statusMatch && paymentMatch && assignmentMatch && dateMatch;
    });
  }, [allOrders, assignmentFilter, dateFrom, dateRange, dateTo, paymentFilter, search, statusFilter]);

  const filteredDeliveryPartners = useMemo(() => {
    return availableDeliveryTeam.filter((member) =>
      [member.name, member.phone, member.email, member.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(deliverySearch.trim().toLowerCase())
    );
  }, [availableDeliveryTeam, deliverySearch]);

  const filteredValue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [filteredOrders]
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setAssignmentFilter("ALL");
    setDateRange("ALL");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-950">Manage Orders</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Search every order, filter the queue, confirm faster, and assign the right delivery partner.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {filteredOrders.length} of {allOrders.length} orders
                </div>
                <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-slate-700">
                  {formatDateRangeLabel(dateRange, dateFrom, dateTo)}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <PackageCheck className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Pending confirmation</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{pendingOrders}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Truck className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Ready for delivery</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{assignedOrders}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Wallet className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Filtered order value</p>
                <p className="mt-2 text-3xl font-black text-slate-950">Rs.{filteredValue}</p>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px_170px_170px_170px_auto]">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Search by order id, customer, phone, email, delivery partner, item, or store"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="store-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="ADMIN_CONFIRMED">Admin Confirmed</option>
                <option value="ASSIGNED_TO_DELIVERY">Assigned</option>
                <option value="PICKED_BY_DELIVERY">Out for Delivery</option>
                <option value="ORDER_COMPLETED">Completed</option>
                <option value="ORDER_CANCELLED">Cancelled</option>
              </select>
              <select
                className="store-input"
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
              >
                <option value="ALL">All Payments</option>
                <option value="COD">COD</option>
                <option value="UPI">UPI</option>
                <option value="RAZORPAY">Razorpay</option>
              </select>
              <select
                className="store-input"
                value={assignmentFilter}
                onChange={(event) => setAssignmentFilter(event.target.value)}
              >
                <option value="ALL">All Assignment States</option>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="ASSIGNED">Assigned</option>
              </select>
              <select
                className="store-input"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>

            {dateRange === "CUSTOM" ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
                <label className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    From Date
                  </span>
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                  />
                </label>
                <label className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    To Date
                  </span>
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                  />
                </label>
                <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Use a custom range to isolate exact business days, campaign periods, or reconciliation windows.
                </div>
              </div>
            ) : null}
          </div>

          <div className="mb-5 mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-slate-700">
            Admin flow: confirm the order first, then assign the correct delivery partner based on area and workload.
          </div>
          {assignmentError ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {assignmentError}
            </div>
          ) : null}
          {filteredOrders.length ? (
            <OrderTable
              orders={filteredOrders}
              onConfirm={confirmOrder}
              onAssign={(order) => {
                setAssignmentError("");
                setSelectedOrder(order);
                setDeliverySearch("");
              }}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No orders matched the current filters.
            </div>
          )}
        </main>
      </div>

      <Modal
        open={Boolean(selectedOrder)}
        title="Assign Delivery Partner"
        onClose={() => {
          setSelectedOrder(null);
          setAssigningUserId(null);
        }}
      >
        <div className="space-y-4">
          {selectedOrder ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-black text-slate-950">Order #{selectedOrder.orderNumber}</p>
              <p className="mt-1">{selectedOrder.customerName}</p>
              <p className="mt-1 text-slate-500">{selectedOrder.itemNames?.join(", ") || "Grocery order"}</p>
              {selectedOrder.deliveryAddress ? (
                <p className="mt-2 text-xs text-slate-500">{selectedOrder.deliveryAddress}</p>
              ) : null}
            </div>
          ) : null}

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Search partner by name, phone, email, or status"
              value={deliverySearch}
              onChange={(event) => setDeliverySearch(event.target.value)}
            />
          </label>

          {filteredDeliveryPartners.length ? (
            <div className="space-y-3">
              {filteredDeliveryPartners.map((member) => (
                <div
                  key={member.userId}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-950">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{member.phone || member.email}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {member.ordersCount} active assignments • {member.status}
                    </p>
                  </div>
                  <Button
                    variant="accent"
                    className="w-full px-4 py-3 font-black sm:w-auto"
                    onClick={async () => {
                      try {
                        setAssigningUserId(member.userId);
                        setAssignmentError("");
                        await assignDeliveryBoy(selectedOrder.orderNumber, member);
                        setSelectedOrder(null);
                      } catch (error) {
                        setAssignmentError(error.message || "Order could not be assigned.");
                      } finally {
                        setAssigningUserId(null);
                      }
                    }}
                  >
                    {assigningUserId === member.userId ? "Assigning..." : "Assign to This Partner"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No matching delivery partner found. Unblock or create a delivery partner first.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
