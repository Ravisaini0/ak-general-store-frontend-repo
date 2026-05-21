import { Clock3, MapPinned, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const shopLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "Offers", to: "/offers" },
    { label: "Fresh Flour Service", to: "/aata-chakki-booking" },
    { label: "Cart", to: "/cart" },
    { label: "Track Orders", to: "/my-orders" },
  ];

  return (
    <footer className="mt-14 border-t border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fbf7ef_100%)]">
      <div className="store-shell py-10">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.95fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-yellow-400">
                  AK
                </div>
                <div>
                  <p className="text-lg font-black text-slate-950">AK General Store</p>
                  <p className="text-sm text-slate-500">
                    Fresh groceries, daily essentials, and fast local delivery
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                Shop pantry staples, household essentials, and fresh flour service from one
                trusted local store. Simple ordering, reliable support, and quick fulfilment for
                everyday needs.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-bold text-slate-800">
                  Free delivery above Rs299
                </span>
                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-bold text-slate-800">
                  Support available 24/7
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Shop</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {shopLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                  Customer Care
                </p>
                <div className="mt-4 grid gap-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-yellow-700" />
                    <div>
                      <p className="font-semibold text-slate-900">Call Support</p>
                      <a href="tel:9483989109" className="transition hover:text-slate-950">
                        9483989109
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-yellow-700" />
                    <div>
                      <p className="font-semibold text-slate-900">Email Support</p>
                      <a
                        href="mailto:support@akgeneralstore.com"
                        className="break-all transition hover:text-slate-950"
                      >
                        support@akgeneralstore.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-yellow-700" />
                    <div>
                      <p className="font-semibold text-slate-900">Working Hours</p>
                      <p>24/7 assistance for orders, support, and store enquiries</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-0.5 h-5 w-5 text-yellow-700" />
                  <div>
                    <p className="font-semibold text-slate-900">Visit Store</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Open the live Google Maps location for visit planning, navigation, or
                      delivery coordination.
                    </p>
                    <a
                      href="https://maps.app.goo.gl/ttN9v89e39Aw4x1W7?g_st=aw"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
                    >
                      Open Store Location
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 AK General Store. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <span>Secure ordering</span>
              <span>Fast local delivery</span>
              <span>Customer-first support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
