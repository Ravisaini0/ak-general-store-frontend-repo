import { Search, ShieldBan, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  deleteCustomer,
  fetchAdminCustomers,
  updateCustomerBlockedStatus,
} from "../../services/adminService";

function matchesCustomer(customer, query) {
  const haystack = [
    customer.name,
    customer.email,
    customer.phone,
    customer.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");
        setCustomers(await fetchAdminCustomers());
      } catch (loadError) {
        setError(loadError.message || "Customers could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const queryMatch = !search.trim() || matchesCustomer(customer, search.trim());
      const statusMatch =
        statusFilter === "ALL" ||
        (statusFilter === "BLOCKED" && customer.blocked) ||
        (statusFilter === "ACTIVE" && !customer.blocked);

      return queryMatch && statusMatch;
    });
  }, [customers, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((item) => !item.blocked).length,
      blocked: customers.filter((item) => item.blocked).length,
      ordering: customers.filter((item) => Number(item.ordersCount || 0) > 0).length,
    }),
    [customers]
  );

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-950">Manage Customers</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Search customers, review account health, block misuse, and remove duplicate or invalid accounts.
                </p>
              </div>
              {!loading && !error ? (
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {filteredCustomers.length} of {customers.length} customers
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <Users className="h-5 w-5 text-slate-900" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Total customers</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{stats.total}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Active accounts</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{stats.active}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked accounts</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{stats.blocked}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ordering customers</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{stats.ordering}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Search by customer name, email, phone, or status"
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
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading customers...
            </div>
          ) : filteredCustomers.length ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.userId}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-black text-slate-950">{customer.name}</p>
                      <p className="mt-2 text-sm text-slate-600">{customer.email}</p>
                      <p className="mt-1 text-sm text-slate-500">{customer.phone || "No phone number"}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                        customer.blocked
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Orders</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{customer.ordersCount}</p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Role</p>
                      <p className="mt-1 text-lg font-black text-slate-950">{customer.role}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={updatingCustomerId === customer.userId}
                      onClick={async () => {
                        try {
                          setUpdatingCustomerId(customer.userId);
                          setError("");
                          const updated = await updateCustomerBlockedStatus(
                            customer.userId,
                            !customer.blocked
                          );
                          setCustomers((current) =>
                            current.map((item) =>
                              item.userId === updated.userId ? updated : item
                            )
                          );
                        } catch (updateError) {
                          setError(updateError.message || "Customer status could not be updated.");
                        } finally {
                          setUpdatingCustomerId(null);
                        }
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${
                        customer.blocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "border border-red-200 bg-white text-red-600"
                      }`}
                    >
                      <ShieldBan className="h-4 w-4" />
                      {updatingCustomerId === customer.userId
                        ? "Updating..."
                        : customer.blocked
                          ? "Unblock Customer"
                          : "Block Customer"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingCustomerId === customer.userId}
                      onClick={async () => {
                        try {
                          setDeletingCustomerId(customer.userId);
                          setError("");
                          await deleteCustomer(customer.userId);
                          setCustomers((current) =>
                            current.filter((item) => item.userId !== customer.userId)
                          );
                        } catch (deleteError) {
                          setError(deleteError.message || "Customer could not be deleted.");
                        } finally {
                          setDeletingCustomerId(null);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingCustomerId === customer.userId ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No customers matched the current search or filter.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
