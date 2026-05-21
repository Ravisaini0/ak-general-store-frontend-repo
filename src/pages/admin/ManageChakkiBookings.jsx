import { Clock3, Search, ShieldCheck, Wheat } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import {
  fetchAdminChakkiBookings,
  updateChakkiBookingStatus,
} from "../../services/chakkiBookingService";

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "BOOKED", label: "Booked" },
  { value: "PICKUP_CONFIRMED", label: "Pickup Confirmed" },
  { value: "IN_MILLING", label: "In Milling" },
  { value: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatStatus(status) {
  return statusOptions.find((option) => option.value === status)?.label || "Booked";
}

function getStatusBadge(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    case "READY_FOR_DELIVERY":
      return "bg-sky-100 text-sky-800";
    case "IN_MILLING":
      return "bg-amber-100 text-amber-800";
    case "PICKUP_CONFIRMED":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function matchesBooking(booking, query) {
  const haystack = [
    booking.customerName,
    booking.customerEmail,
    booking.fullName,
    booking.phone,
    booking.pickupAddress,
    booking.grainType,
    booking.preferredSlot,
    booking.status,
    formatStatus(booking.status),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default function ManageChakkiBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAdminChakkiBookings()
      .then(setBookings)
      .catch((loadError) => setError(loadError.message || "Fresh Flour Service bookings could not be loaded."));
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchMatch = !search.trim() || matchesBooking(booking, search.trim());
      const statusMatch = statusFilter === "ALL" || booking.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      active: bookings.filter((booking) => !["COMPLETED", "CANCELLED"].includes(booking.status)).length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
      quantity: bookings.reduce((sum, booking) => sum + Number(booking.quantityKg || 0), 0),
    }),
    [bookings]
  );

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      const updated = await updateChakkiBookingStatus(bookingId, status);
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? updated : booking))
      );
      setMessage(`Booking status updated to ${formatStatus(status)}.`);
    } catch (updateError) {
      setError(updateError.message || "Booking status could not be updated.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-950">Fresh Flour Service Bookings</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Review every chakki booking, pickup address, customer contact, and service status from one place.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                {filteredBookings.length} of {bookings.length} bookings
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Wheat className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Total requests</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{stats.total}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Clock3 className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Active pipeline</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{stats.active}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Completed</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{stats.completed}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <Wheat className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Total quantity</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{stats.quantity} kg</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Search by customer, email, phone, grain type, pickup address, or slot"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="store-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xl font-black text-slate-950">
                          {booking.grainType} - {booking.quantityKg} kg
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${getStatusBadge(booking.status)}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Customer</p>
                          <p className="mt-2 text-sm font-black text-slate-950">{booking.customerName || booking.fullName}</p>
                          <p className="mt-1 text-sm text-slate-500">{booking.customerEmail || "No email available"}</p>
                          <p className="mt-1 text-sm text-slate-500">{booking.phone}</p>
                        </div>
                        <div className="rounded-2xl border border-white bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Pickup Address</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{booking.pickupAddress}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold">
                          Pickup slot: {booking.preferredSlot || "Flexible pickup"}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold">
                          Booked: {formatDate(booking.createdAt)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold">
                          Last update: {formatDate(booking.updatedAt || booking.createdAt)}
                        </span>
                      </div>
                      {booking.notes ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Notes</p>
                          <p className="mt-2 text-sm text-slate-600">{booking.notes}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 xl:w-[290px]">
                      <p className="text-sm font-black text-slate-950">Service Status</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Move this chakki request through pickup, milling, and delivery completion.
                      </p>
                      <div className="mt-4 space-y-3">
                        {statusOptions
                          .filter((option) => option.value !== "ALL")
                          .map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={booking.status === option.value ? "secondary" : "ghost"}
                              className="w-full justify-between px-4 py-3 font-black"
                              disabled={updatingId === booking.id || booking.status === option.value}
                              onClick={() => handleStatusUpdate(booking.id, option.value)}
                            >
                              <span>{option.label}</span>
                              <span className="text-xs">
                                {updatingId === booking.id && booking.status !== option.value ? "Updating..." : ""}
                              </span>
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No Fresh Flour Service bookings matched the current filters.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
