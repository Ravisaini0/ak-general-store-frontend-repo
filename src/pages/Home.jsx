import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  Truck,
  Wheat,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import TopBar from "../components/common/TopBar";
import BottomCartBar from "../components/cart/BottomCartBar";
import CategoryCard from "../components/product/CategoryCard";
import ProductGrid from "../components/product/ProductGrid";
import { usePublicStoreSettings } from "../hooks/usePublicStoreSettings";
import { useStoreData } from "../hooks/useStoreData";

export default function Home() {
  const { categories, products, loading, error, backendReady } = useStoreData();
  const { freeDeliveryThreshold } = usePublicStoreSettings();
  const bestSelling = products.slice(0, 6);
  const heroImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80";

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-4 sm:py-5">
        <section className="overflow-hidden rounded-[1.5rem] border border-yellow-100 bg-gradient-to-r from-[#fff5d8] via-[#fff8e8] to-[#ffe9af] p-4 shadow-soft sm:rounded-[1.85rem] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[13px] font-black uppercase tracking-tight text-slate-900 sm:text-[15px]">Daily Grocery</p>
              <h1 className="mt-1 text-3xl font-black leading-tight text-orange-500 sm:text-4xl md:text-5xl">
                Best Price
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-700 sm:text-lg md:text-xl">
                Shop trusted grocery essentials, pantry staples, and fresh household picks with
                fast delivery and dependable quality.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="store-chip"><Clock3 className="h-4 w-4" />10-30 min delivery</span>
                <span className="store-chip"><Truck className="h-4 w-4" />Free delivery above Rs{freeDeliveryThreshold}</span>
                <span className="store-chip"><ShieldCheck className="h-4 w-4" />Trusted quality</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/category/aata"
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-slate-950"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-6 py-3 text-sm font-bold text-slate-900"
                >
                  View Cart
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Everyday Essentials", text: "Flour, rice, lentils, oils, snacks, and more." },
                  { title: "Fast Local Fulfilment", text: "Designed for quick delivery in nearby service areas." },
                  { title: "Simple Checkout", text: "Easy cart, address, payment, and order tracking flow." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.35rem] border border-white/60 bg-white/60 p-4 backdrop-blur-sm">
                    <p className="text-sm font-black text-slate-950">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[1.35rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),transparent_45%),linear-gradient(135deg,_#f6cf7a,_#c78a2b)] p-4 sm:rounded-[1.5rem] sm:p-5">
              <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-[1.4rem] border border-white/40 bg-white/15 p-4">
                  <img
                    src={heroImage}
                    alt="AK General Store hero"
                    className="h-56 w-full rounded-[1.1rem] object-cover shadow-lg sm:h-72"
                  />
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.25rem] border border-white/40 bg-white/60 p-4">
                    <p className="text-xs font-bold uppercase text-slate-700">AK General Store</p>
                    <p className="mt-1 text-3xl font-black text-slate-950">AK</p>
                    <p className="mt-1 text-xs text-slate-600">Your everyday grocery partner</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[#2f6f2b] p-4 text-white">
                    <p className="text-sm font-black">FAST DELIVERY</p>
                    <p className="mt-1 text-xs">Fresh essentials delivered with care.</p>
                    <div className="mt-4 inline-flex rounded-lg bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                      Order Today
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/40 bg-slate-950 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wide text-yellow-300">Why Customers Choose Us</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <p>Fresh staples for daily cooking</p>
                      <p>Transparent pricing and offers</p>
                      <p>Quick ordering for repeat purchases</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 soft-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Shop by Categories</h2>
            <span className="text-xs font-bold text-slate-400">
            {loading ? "Loading..." : backendReady ? "Live API" : "Backend Offline"}
            </span>
          </div>
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Best Selling Products</h2>
            <span className="text-xs font-bold text-slate-400">
            {backendReady ? "Live Catalog" : "Unavailable"}
            </span>
          </div>
          <ProductGrid products={bestSelling} />
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { title: "10-30 min Delivery", subtitle: "Trusted local shopping experience", icon: Truck },
            { title: "Free Delivery", subtitle: `On qualifying orders above Rs${freeDeliveryThreshold}`, icon: Clock3 },
            { title: "Cash on Delivery", subtitle: "Pay safely at your doorstep", icon: IndianRupee },
            { title: "UPI Payment", subtitle: "Fast and simple digital checkout", icon: CreditCard },
            { title: "Quality Products", subtitle: "Carefully selected grocery essentials", icon: BadgeCheck },
            { title: "Fresh Flour Service", subtitle: "Convenient local chakki support", icon: Wheat },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="soft-panel flex items-center gap-3 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200">
                  <Icon className="h-5 w-5 text-yellow-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs leading-5 text-slate-500">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
      <BottomCartBar />
    </div>
  );
}
