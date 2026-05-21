import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  createAdminDeliveryPartner,
  fetchAdminDeliveryTeam,
  markDeliveryPayoutPaid,
  updateDeliveryPartnerBlockedStatus,
} from "../../services/adminService";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

function formatDateTime(value) {
  if (!value) {
    return "Not requested yet";
  }

  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    return value;
  }

  return next.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageDeliveryBoys() {
  const [deliveryTeam, setDeliveryTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [search, setSearch] = useState("");
  const [payoutReference, setPayoutReference] = useState("");
  const [activePayoutMemberId, setActivePayoutMemberId] = useState(null);
  const [savingPayoutMemberId, setSavingPayoutMemberId] = useState(null);

  useEffect(() => {
    async function loadDeliveryTeam() {
      try {
        setLoading(true);
        setError("");
        setDeliveryTeam(await fetchAdminDeliveryTeam());
      } catch (loadError) {
        setError(loadError.message || "Delivery team could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadDeliveryTeam();
  }, []);

  const filteredDeliveryTeam = useMemo(() => {
    if (!search.trim()) {
      return deliveryTeam;
    }

    const query = search.trim().toLowerCase();
    return deliveryTeam.filter((member) =>
      [member.name, member.email, member.phone, member.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [deliveryTeam, search]);

  const stats = useMemo(
    () => ({
      total: deliveryTeam.length,
      available: deliveryTeam.filter((member) => !member.blocked && member.status === "Available").length,
      onDelivery: deliveryTeam.filter((member) => member.status === "On Delivery").length,
      blocked: deliveryTeam.filter((member) => member.blocked).length,
      pendingPayout: deliveryTeam.reduce(
        (sum, member) => sum + Number(member.pendingPayoutAmount || 0),
        0
      ),
    }),
    [deliveryTeam]
  );

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950">Manage Delivery Team</h1>
              <p className="mt-2 text-sm text-slate-500">
                Track delivery partner availability, add new delivery logins, and manage active assignment counts.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!loading && !error ? (
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {deliveryTeam.length} active team members
                </div>
              ) : null}
              <Button variant="accent" className="w-full px-5 py-3 font-black sm:w-auto" onClick={() => setShowModal(true)}>
                Add Delivery Partner
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total partners</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{stats.total}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Available</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{stats.available}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">On delivery</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{stats.onDelivery}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{stats.blocked}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:col-span-2 xl:col-span-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending payout liability</p>
              <p className="mt-3 text-3xl font-black text-slate-950">Rs.{stats.pendingPayout.toFixed(0)}</p>
            </div>
          </div>

          <label className="mt-6 flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Search by delivery partner name, phone, email, or status"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading delivery team...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredDeliveryTeam.length ? (
                filteredDeliveryTeam.map((member) => (
                  <div key={member.userId} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                      <p className="text-xl font-black text-slate-950">{member.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{member.phone || member.email}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {member.ordersCount} assignments
                      </p>
                      </div>
                    <div className="flex items-center gap-3">
                      <span
                          className={`rounded-full px-4 py-2 text-sm font-bold ${
                            member.blocked
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {member.status}
                        </span>
                        <button
                          type="button"
                          disabled={updatingMemberId === member.userId}
                          onClick={async () => {
                            try {
                              setUpdatingMemberId(member.userId);
                              setError("");
                              const updated = await updateDeliveryPartnerBlockedStatus(member.userId, !member.blocked);
                              setDeliveryTeam((current) =>
                                current.map((item) => (item.userId === updated.userId ? updated : item))
                              );
                            } catch (updateError) {
                              setError(updateError.message || "Delivery partner status could not be updated.");
                            } finally {
                              setUpdatingMemberId(null);
                            }
                          }}
                          className={`rounded-xl px-4 py-2 text-xs font-black ${
                            member.blocked
                              ? "bg-emerald-100 text-emerald-700"
                              : "border border-red-200 bg-white text-red-600"
                          }`}
                        >
                          {updatingMemberId === member.userId
                            ? "Updating..."
                            : member.blocked
                              ? "Unblock Login"
                              : "Block Login"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Delivery status</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          {String(member.deliveryBoyStatus || "AT_SHOP").replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Active batch</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          {member.activeBatchId ? `#${member.activeBatchId}` : "No live batch"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Live batch payout</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.activeBatchTotalEarning || 0).toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cash collected</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.cashCollectedAmount || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">UPI collected</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.upiCollectedAmount || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending payout</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.pendingPayoutAmount || 0).toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ready to withdraw</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.availableForWithdrawalAmount || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Requested this week</p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          Rs.{Number(member.requestedPayoutAmount || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Next request window</p>
                        <p className="mt-2 text-sm font-black text-slate-950">
                          {member.withdrawalEligible
                            ? "Open now"
                            : formatDateTime(member.nextWithdrawalAvailableAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      Latest weekly withdrawal request:{" "}
                      <span className="font-black text-slate-900">
                        {formatDateTime(member.lastPayoutRequestedAt)}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                      <input
                        className="store-input lg:max-w-xs"
                        placeholder="Payout reference"
                        value={activePayoutMemberId === member.userId ? payoutReference : ""}
                        onChange={(event) => {
                          setActivePayoutMemberId(member.userId);
                          setPayoutReference(event.target.value);
                        }}
                      />
                      <Button
                        type="button"
                        variant="accent"
                        className="px-5 py-3 font-black"
                        disabled={Number(member.requestedPayoutAmount || 0) <= 0 || savingPayoutMemberId === member.userId}
                        onClick={async () => {
                          try {
                            setActivePayoutMemberId(member.userId);
                            setSavingPayoutMemberId(member.userId);
                            setError("");
                            const updated = await markDeliveryPayoutPaid(member.userId, {
                              referenceId: payoutReference,
                            });
                            setDeliveryTeam((current) =>
                              current.map((item) => (item.userId === updated.userId ? updated : item))
                            );
                            setPayoutReference("");
                          } catch (updateError) {
                            setError(updateError.message || "Delivery payout could not be updated.");
                          } finally {
                            setSavingPayoutMemberId(null);
                            setActivePayoutMemberId(null);
                          }
                        }}
                      >
                        {savingPayoutMemberId === member.userId ? "Saving..." : "Mark Weekly Payout Paid"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  No delivery partner matched the current search.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Modal
        open={showModal}
        title="Add Delivery Partner"
        onClose={() => {
          setShowModal(false);
          setForm(emptyForm);
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              setSubmitting(true);
              setError("");
              const created = await createAdminDeliveryPartner(form);
              setDeliveryTeam((current) => [created, ...current]);
              setShowModal(false);
              setForm(emptyForm);
            } catch (submitError) {
              setError(submitError.message || "Delivery partner could not be created.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <input
            className="store-input"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="store-input"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="store-input"
            placeholder="Mobile number"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            type="password"
            className="store-input"
            placeholder="Temporary password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            The delivery partner will use this mobile number and password on the delivery login screen.
          </div>
          <Button variant="accent" className="w-full py-4 font-black" type="submit">
            {submitting ? "Creating..." : "Create Delivery Login"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
