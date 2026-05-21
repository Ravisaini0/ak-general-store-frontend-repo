import { Clock3, MapPin, ShieldCheck, Wheat } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../../components/common/BackButton";
import Button from "../../components/common/Button";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import { useAuth } from "../../context/AuthContext";
import { fetchAddresses } from "../../services/addressService";
import {
  createChakkiBooking,
  fetchMyChakkiBookings,
} from "../../services/chakkiBookingService";

const defaultForm = {
  fullName: "",
  phone: "",
  pickupAddress: "",
  grainType: "Wheat",
  quantityKg: 10,
  preferredSlot: "Today Evening",
  notes: "",
};

const serviceHighlights = [
  {
    title: "Fresh pickup planning",
    description: "Schedule grain pickup from your saved Home, Office, or other preferred address.",
    icon: MapPin,
  },
  {
    title: "Clean milling workflow",
    description: "Your grain is queued for local chakki milling with a clear service status at every stage.",
    icon: Wheat,
  },
  {
    title: "Reliable delivery support",
    description: "AK General Store tracks the pickup address, slot, and service updates for every booking.",
    icon: ShieldCheck,
  },
];

function formatAddressType(value) {
  switch (value) {
    case "OFFICE":
      return "Office";
    case "OTHER":
      return "Other";
    default:
      return "Home";
  }
}

function formatBookingStatus(status) {
  switch (status) {
    case "PICKUP_CONFIRMED":
      return "Pickup Confirmed";
    case "IN_MILLING":
      return "In Milling";
    case "READY_FOR_DELIVERY":
      return "Ready for Delivery";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Booked";
  }
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

function formatBookingDate(value) {
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

export default function AataChakkiBooking() {
  const { session } = useAuth();
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    fullName: session?.name || "",
    phone: session?.phone || "",
  }));
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPageData() {
      try {
        const [addressResponse, bookingResponse] = await Promise.all([
          fetchAddresses().catch(() => []),
          fetchMyChakkiBookings().catch(() => []),
        ]);

        setAddresses(addressResponse);
        setBookings(bookingResponse);

        const preferredAddress =
          addressResponse.find((item) => item.defaultAddress) || addressResponse[0] || null;

        if (preferredAddress) {
          setSelectedAddressId(preferredAddress.id);
          setForm((current) => ({
            ...current,
            fullName: preferredAddress.fullName || session?.name || current.fullName,
            phone: preferredAddress.phone || session?.phone || current.phone,
            pickupAddress: preferredAddress.fullAddress || current.pickupAddress,
          }));
        }
      } catch {
        setAddresses([]);
        setBookings([]);
      }
    }

    loadPageData();
  }, [session?.name, session?.phone]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => Number(address.id) === Number(selectedAddressId)) || null,
    [addresses, selectedAddressId]
  );

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setForm((current) => ({
      ...current,
      fullName: address.fullName || current.fullName,
      phone: address.phone || current.phone,
      pickupAddress: address.fullAddress || current.pickupAddress,
    }));
    setMessage("Pickup address updated from your saved address book.");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const booking = await createChakkiBooking({
        ...form,
        quantityKg: Number(form.quantityKg),
      });
      setBookings((current) => [booking, ...current]);
      setForm({
        ...defaultForm,
        fullName: selectedAddress?.fullName || session?.name || "",
        phone: selectedAddress?.phone || session?.phone || "",
        pickupAddress: selectedAddress?.fullAddress || "",
      });
      setMessage("Fresh Flour Service booking placed successfully.");
    } catch (submitError) {
      setError(submitError.message || "Chakki booking could not be placed right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/profile" className="mb-5" />

        <section className="soft-panel overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                Fresh Flour Service
              </p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
                Aata Chakki Booking
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Book grain pickup, milling, and delivery with a cleaner production-style service flow.
                Select your saved pickup address, choose the preferred slot, and track every booking status.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  Fresh pickup planning
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
                  Local milling support
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
                  Status updates included
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {serviceHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-black text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="soft-panel p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Pickup Details</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a saved pickup address first so your booking starts with the correct customer location.
                </p>
              </div>
              <Link
                to="/address-book"
                className="inline-flex rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                Manage Pickup Addresses
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {addresses.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((address) => {
                    const active = Number(selectedAddressId) === Number(address.id);
                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => handleAddressSelect(address)}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          active
                            ? "border-yellow-400 bg-yellow-50 shadow-soft"
                            : "border-slate-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">{address.fullName}</p>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              {formatAddressType(address.addressType)}
                            </p>
                          </div>
                          {address.defaultAddress ? (
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{address.fullAddress}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">{address.phone}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Add a saved address first so pickup planning stays accurate and professional.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                className="store-input"
                placeholder="Pickup Contact Name"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
              />
              <input
                className="store-input"
                placeholder="Pickup Contact Phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
              <textarea
                className="store-input min-h-[120px] md:col-span-2"
                placeholder="Pickup Address"
                value={form.pickupAddress}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pickupAddress: event.target.value }))
                }
              />
              <select
                className="store-input"
                value={form.grainType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, grainType: event.target.value }))
                }
              >
                <option>Wheat</option>
                <option>Multi Grain</option>
                <option>Maize</option>
                <option>Bajra</option>
              </select>
              <input
                className="store-input"
                type="number"
                min="1"
                placeholder="Quantity (kg)"
                value={form.quantityKg}
                onChange={(event) =>
                  setForm((current) => ({ ...current, quantityKg: event.target.value }))
                }
              />
              <select
                className="store-input md:col-span-2"
                value={form.preferredSlot}
                onChange={(event) =>
                  setForm((current) => ({ ...current, preferredSlot: event.target.value }))
                }
              >
                <option>Today Evening</option>
                <option>Tomorrow Morning</option>
                <option>Tomorrow Evening</option>
                <option>Flexible Pickup Slot</option>
              </select>
              <textarea
                className="store-input min-h-[110px] md:col-span-2"
                placeholder="Notes for pickup team, grain instructions, or milling preference"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />

              {selectedAddress ? (
                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-black text-slate-950">Current pickup address source</p>
                  <p className="mt-2">{selectedAddress.fullAddress}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Update the selected saved address in Address Book if your Home, Office, or pickup spot changes.
                  </p>
                </div>
              ) : null}

              {message ? (
                <p className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button
                  variant="accent"
                  className="px-6 py-3 font-black"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Booking Service..." : "Book Chakki Service"}
                </Button>
                <Link
                  to="/address-book"
                  className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                >
                  Update Pickup Address
                </Link>
              </div>
            </form>
          </section>

          <section className="space-y-6">
            <div className="soft-panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">My Chakki Bookings</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review every service request with pickup address, slot, and latest status.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {bookings.length ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="rounded-[1.45rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-black text-slate-950">
                            {booking.grainType} - {booking.quantityKg} kg
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            Pickup slot: {booking.preferredSlot || "Flexible pickup"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${getStatusBadge(booking.status)}`}
                        >
                          {formatBookingStatus(booking.status)}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{booking.pickupAddress}</p>
                      {booking.notes ? (
                        <p className="mt-3 text-sm text-slate-500">Notes: {booking.notes}</p>
                      ) : null}
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Booked {formatBookingDate(booking.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    No chakki bookings yet. Your fresh flour service requests will appear here once booked.
                  </div>
                )}
              </div>
            </div>

            <div className="soft-panel p-6">
              <h3 className="text-xl font-black text-slate-950">What happens next</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">1. Pickup review</p>
                  <p className="mt-2 text-sm text-slate-500">
                    AK General Store reviews your slot and confirms the selected pickup address.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">2. Milling service</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Your grain moves into the milling queue with status updates visible in this page.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">3. Delivery completion</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Once the chakki order is ready, the service status moves to ready-for-delivery and then completed.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
