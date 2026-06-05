import { Percent, Ticket, Truck } from "lucide-react";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import BackButton from "../../components/common/BackButton";
import { Link } from "react-router-dom";
import { usePublicStoreSettings } from "../../hooks/usePublicStoreSettings";

export default function Offers() {
  const { freeDeliveryThreshold } = usePublicStoreSettings();
  const offers = [
    {
      title: "Flat Rs50 Off",
      code: "AK50",
      description: "Get instant savings on grocery carts above Rs499.",
      icon: Ticket,
    },
    {
      title: "First Order 10% Off",
      code: "FIRST10",
      description: "New customers can unlock 10% savings on their first order.",
      icon: Percent,
    },
    {
      title: `Free Delivery Above Rs${freeDeliveryThreshold}`,
      code: "AUTO",
      description: "Delivery charges are waived automatically when your cart crosses the threshold.",
      icon: Truck,
    },
  ];

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <section className="soft-panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Best Deals</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Offers & Savings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Use these live offer ideas while shopping. You can browse products and apply the best deal at checkout.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {offers.map((offer) => {
              const Icon = offer.icon;
              return (
                <div key={offer.code} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="inline-flex rounded-2xl bg-yellow-100 p-3">
                    <Icon className="h-5 w-5 text-yellow-700" />
                  </div>
                  <h2 className="mt-4 text-xl font-black text-slate-950">{offer.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                  <div className="mt-4 rounded-xl border border-dashed border-yellow-300 bg-white px-4 py-3 text-sm font-black text-slate-900">
                    Code: {offer.code}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
