import { useEffect, useState } from "react";
import BackButton from "../../components/common/BackButton";
import Button from "../../components/common/Button";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import LocationPickerModal from "../../components/common/LocationPickerModal";
import TopBar from "../../components/common/TopBar";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from "../../services/addressService";
import { getCurrentPosition } from "../../utils/location";

const addressTypeOptions = [
  { label: "Home", value: "HOME" },
  { label: "Office", value: "OFFICE" },
  { label: "Other", value: "OTHER" },
];

function formatAddressType(value) {
  return addressTypeOptions.find((item) => item.value === value)?.label || "Address";
}

const defaultForm = {
  fullName: "",
  phone: "",
  addressType: "HOME",
  defaultAddress: false,
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  latitude: null,
  longitude: null,
  locationLabel: "",
};

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [showChooseLocation, setShowChooseLocation] = useState(false);

  const sortAddresses = (items) =>
    [...items].sort((left, right) => {
      if (left.defaultAddress === right.defaultAddress) {
        return Number(right.id || 0) - Number(left.id || 0);
      }

      return left.defaultAddress ? -1 : 1;
    });

  useEffect(() => {
    async function loadAddresses() {
      const response = await fetchAddresses();
      setAddresses(sortAddresses(response));
    }

    loadAddresses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      setMessage("Please complete the required address fields.");
      return;
    }

    if (!form.latitude || !form.longitude) {
      setMessage("Choose the delivery location or use your current location before saving this address.");
      return;
    }

    const payload = editingId
      ? await updateAddress(editingId, form)
      : await createAddress(form);

    const refreshed = await fetchAddresses();
    setAddresses(sortAddresses(refreshed));
    setForm(defaultForm);
    setEditingId(null);
    setMessage(editingId ? "Address updated successfully." : "Address added successfully.");
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressType: address.addressType || "HOME",
      defaultAddress: Boolean(address.defaultAddress),
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      locationLabel: address.locationLabel || "",
    });
    setMessage("");
  };

  const handleUseCurrentLocation = async () => {
    try {
      setCapturingLocation(true);
      const coords = await getCurrentPosition();
      setForm((current) => ({
        ...current,
        latitude: coords.latitude,
        longitude: coords.longitude,
        locationLabel: current.locationLabel || `${formatAddressType(current.addressType)} delivery location`,
      }));
      setMessage("Current location attached to this address.");
    } catch (locationError) {
      setMessage(locationError.message || "Current location could not be captured.");
    } finally {
      setCapturingLocation(false);
    }
  };

  const handleDelete = async (addressId) => {
    await deleteAddress(addressId);
    const refreshed = await fetchAddresses();
    setAddresses(sortAddresses(refreshed));
    if (editingId === addressId) {
      setEditingId(null);
      setForm(defaultForm);
    }
    setMessage("Address removed.");
  };

  const handleClearLocation = () => {
    setForm((current) => ({
      ...current,
      latitude: null,
      longitude: null,
      locationLabel: "",
    }));
      setMessage("Delivery location removed from this address draft.");
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/profile" className="mb-5" />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="soft-panel p-6">
            <h1 className="text-4xl font-black text-slate-950">Address Book</h1>
            <p className="mt-2 text-sm text-slate-500">
              Save delivery addresses like Home, Office, or any custom drop location for faster checkout.
            </p>
            <div className="mt-6 grid gap-4">
              {addresses.length ? (
                addresses.map((address) => (
                  <div key={address.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">{address.fullName}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {address.addressType || "HOME"}
                        </p>
                      </div>
                      {address.defaultAddress ? (
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{address.fullAddress}</p>
                    <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
                    {address.locationLabel ? (
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        Location: {address.locationLabel}
                      </p>
                    ) : null}
                    <div className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                      <span
                        className={`rounded-full px-3 py-1 ${
                          address.latitude && address.longitude
                            ? "bg-emerald-600"
                            : "bg-amber-500"
                        }`}
                      >
                        {address.latitude && address.longitude ? "Pin Ready" : "Pin Required"}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(address)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No saved addresses yet.
                </div>
              )}
            </div>
          </section>

          <section className="soft-panel p-6">
            <h2 className="text-2xl font-black text-slate-950">
              {editingId ? "Update Address" : "Add New Address"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="store-input" placeholder="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              <input className="store-input" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                {addressTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, addressType: type.value }))}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${
                      form.addressType === type.value
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <input className="store-input md:col-span-2" placeholder="Address Line 1" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} />
              <input className="store-input md:col-span-2" placeholder="Address Line 2" value={form.line2} onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))} />
              <input className="store-input" placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
              <input className="store-input" placeholder="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
              <input className="store-input" placeholder="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} />
              <input className="store-input" placeholder="Landmark" value={form.landmark} onChange={(event) => setForm((current) => ({ ...current, landmark: event.target.value }))} />
              <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.defaultAddress}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, defaultAddress: event.target.checked }))
                  }
                />
                Set as default delivery address
              </label>
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-black text-slate-900">Delivery location</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Every saved address should have its own exact delivery location so backend coverage and delivery navigation work correctly.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Button
                    variant="secondary"
                    className="w-full px-5 py-3 font-black"
                    type="button"
                    onClick={handleUseCurrentLocation}
                  >
                    {capturingLocation ? "Capturing..." : "Use My Current Location"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full px-5 py-3 font-black"
                    type="button"
                    onClick={() => setShowChooseLocation(true)}
                  >
                    Search Delivery Location
                  </Button>
                </div>
                {form.latitude && form.longitude ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <p className="font-black text-emerald-900">Delivery location ready</p>
                    <p className="mt-1">
                      {form.locationLabel || `${formatAddressType(form.addressType)} delivery location selected`}
                    </p>
                    <p className="mt-2 text-xs text-emerald-800">
                      This saved delivery spot will be used for service-area validation and delivery navigation.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Add a delivery location before saving this address. Typed text alone is not enough for production delivery validation.
                  </div>
                )}
                {(form.latitude || form.longitude || form.locationLabel) ? (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-700"
                  >
                    Clear Delivery Location
                  </button>
                ) : null}
              </div>
              {message ? <p className="md:col-span-2 text-sm text-slate-600">{message}</p> : null}
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button variant="accent" className="px-6 py-3 font-black" type="submit">
                  {editingId ? "Update Address" : "Save Address"}
                </Button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(defaultForm);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />
      <LocationPickerModal
        open={showChooseLocation}
        onClose={() => setShowChooseLocation(false)}
        title="Search Address Location"
        defaultLabel={form.locationLabel}
        onApply={(location) => {
          setForm((current) => ({
            ...current,
            latitude: location.latitude,
            longitude: location.longitude,
            locationLabel:
              location.label || current.locationLabel || `${formatAddressType(current.addressType)} delivery location`,
          }));
          setMessage("Delivery location attached to this address.");
        }}
      />
    </div>
  );
}
