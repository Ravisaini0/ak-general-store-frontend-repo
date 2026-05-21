import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
} from "../../services/adminService";

const emptyForm = {
  code: "",
  discountType: "FLAT",
  discountValue: "",
  minimumOrderAmount: "",
  maxUsesPerUser: "",
  maxTotalUses: "",
  expiryDate: "",
  firstOrderOnly: false,
  active: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoupons() {
      try {
        setCoupons(await fetchCoupons());
      } catch (loadError) {
        setError(loadError.message || "Coupons could not be loaded.");
      }
    }

    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue || ""),
      minimumOrderAmount: String(coupon.minimumOrderAmount || ""),
      maxUsesPerUser: String(coupon.maxUsesPerUser || ""),
      maxTotalUses: String(coupon.maxTotalUses || ""),
      expiryDate: coupon.expiryDate || "",
      firstOrderOnly: Boolean(coupon.firstOrderOnly),
      active: Boolean(coupon.active),
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount || 0),
        maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : null,
        maxTotalUses: form.maxTotalUses ? Number(form.maxTotalUses) : null,
        expiryDate: form.expiryDate || null,
        firstOrderOnly: Boolean(form.firstOrderOnly),
        active: Boolean(form.active),
      };

      if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.id, payload);
        setCoupons((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createCoupon(payload);
        setCoupons((current) => [created, ...current]);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingCoupon(null);
      setError("");
    } catch (submitError) {
      setError(submitError.message || "Coupon could not be saved.");
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete ${coupon.code}?`)) {
      return;
    }

    try {
      await deleteCoupon(coupon.id);
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
    } catch (deleteError) {
      setError(deleteError.message || "Coupon could not be deleted.");
    }
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950">Coupons</h1>
              <p className="mt-2 text-sm text-slate-500">
                Configure coupon discounts, usage limits, expiry dates, and first-order rules.
              </p>
            </div>
            <Button variant="accent" className="w-full px-5 py-3 font-black sm:w-auto" onClick={openCreate}>
              Add Coupon
            </Button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-2xl font-black text-slate-950">{coupon.code}</p>
                    <p className="mt-2 font-semibold text-slate-700">
                      {coupon.discountType} · {coupon.discountValue}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      coupon.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                  <p>Minimum order: Rs{coupon.minimumOrderAmount || 0}</p>
                  <p>Per user limit: {coupon.maxUsesPerUser || "Unlimited"}</p>
                  <p>Total limit: {coupon.maxTotalUses || "Unlimited"}</p>
                  <p>Used count: {coupon.currentTotalUses || 0}</p>
                  <p>Expiry: {coupon.expiryDate || "No expiry"}</p>
                  <p>First order only: {coupon.firstOrderOnly ? "Yes" : "No"}</p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
                    onClick={() => openEdit(coupon)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-red-300 px-4 py-2 text-xs font-black text-red-700"
                    onClick={() => handleDelete(coupon)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Modal
        open={showModal}
        title={editingCoupon ? "Edit Coupon" : "Add Coupon"}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            className="store-input md:col-span-2"
            placeholder="Coupon code"
            value={form.code}
            onChange={(event) =>
              setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
            }
          />
          <select
            className="store-input"
            value={form.discountType}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountType: event.target.value }))
            }
          >
            <option value="FLAT">Flat</option>
            <option value="PERCENT">Percent</option>
          </select>
          <input
            className="store-input"
            placeholder="Discount value"
            value={form.discountValue}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountValue: event.target.value }))
            }
          />
          <input
            className="store-input"
            placeholder="Minimum order amount"
            value={form.minimumOrderAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, minimumOrderAmount: event.target.value }))
            }
          />
          <input
            className="store-input"
            placeholder="Max uses per user"
            value={form.maxUsesPerUser}
            onChange={(event) =>
              setForm((current) => ({ ...current, maxUsesPerUser: event.target.value }))
            }
          />
          <input
            className="store-input"
            placeholder="Max total uses"
            value={form.maxTotalUses}
            onChange={(event) =>
              setForm((current) => ({ ...current, maxTotalUses: event.target.value }))
            }
          />
          <input
            type="date"
            className="store-input"
            value={form.expiryDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, expiryDate: event.target.value }))
            }
          />
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.firstOrderOnly}
              onChange={(event) =>
                setForm((current) => ({ ...current, firstOrderOnly: event.target.checked }))
              }
            />
            First order only
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
            />
            Coupon is active
          </label>
          <Button variant="accent" className="w-full py-4 font-black md:col-span-2" type="submit">
            {editingCoupon ? "Update Coupon" : "Create Coupon"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
