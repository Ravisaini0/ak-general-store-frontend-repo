import { useEffect, useState } from "react";
import BackButton from "../../components/common/BackButton";
import Button from "../../components/common/Button";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
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

export default function AataChakkiBooking() {
  const [form, setForm] = useState(defaultForm);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetchMyChakkiBookings();
        setBookings(response);
      } catch {
        setBookings([]);
      }
    }

    loadBookings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const booking = await createChakkiBooking({
      ...form,
      quantityKg: Number(form.quantityKg),
    });
    setBookings((current) => [booking, ...current]);
    setForm(defaultForm);
    setMessage("Chakki booking placed successfully.");
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/profile" className="mb-5" />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="soft-panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Fresh Flour Service</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Aata Chakki Booking</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Schedule grain pickup, milling, and doorstep delivery from AK General Store.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="store-input" placeholder="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              <input className="store-input" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              <textarea className="store-input min-h-[120px] md:col-span-2" placeholder="Pickup Address" value={form.pickupAddress} onChange={(event) => setForm((current) => ({ ...current, pickupAddress: event.target.value }))} />
              <select className="store-input" value={form.grainType} onChange={(event) => setForm((current) => ({ ...current, grainType: event.target.value }))}>
                <option>Wheat</option>
                <option>Multi Grain</option>
                <option>Maize</option>
                <option>Bajra</option>
              </select>
              <input className="store-input" type="number" min="1" placeholder="Quantity (kg)" value={form.quantityKg} onChange={(event) => setForm((current) => ({ ...current, quantityKg: event.target.value }))} />
              <select className="store-input md:col-span-2" value={form.preferredSlot} onChange={(event) => setForm((current) => ({ ...current, preferredSlot: event.target.value }))}>
                <option>Today Evening</option>
                <option>Tomorrow Morning</option>
                <option>Tomorrow Evening</option>
              </select>
              <textarea className="store-input min-h-[100px] md:col-span-2" placeholder="Additional notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              {message ? <p className="md:col-span-2 text-sm text-green-700">{message}</p> : null}
              <div className="md:col-span-2">
                <Button variant="accent" className="px-6 py-3 font-black" type="submit">
                  Book Chakki Service
                </Button>
              </div>
            </form>
          </section>

          <section className="soft-panel p-6">
            <h2 className="text-2xl font-black text-slate-950">My Chakki Bookings</h2>
            <div className="mt-5 space-y-4">
              {bookings.length ? (
                bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-black text-slate-950">{booking.grainType}</p>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{booking.pickupAddress}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {booking.quantityKg} kg · {booking.preferredSlot || "Flexible slot"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No chakki bookings yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
