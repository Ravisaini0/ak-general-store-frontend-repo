import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ShieldCheck,
  Truck,
  Wheat,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import TopBar from "../components/common/TopBar";
import BottomCartBar from "../components/cart/BottomCartBar";
import CategoryCard from "../components/product/CategoryCard";
import ProductGrid from "../components/product/ProductGrid";
import { usePublicStoreSettings } from "../hooks/usePublicStoreSettings";
import { useStoreData } from "../hooks/useStoreData";
import { fetchProductPage } from "../services/productService";

function getPaginationNumbers(currentPage, totalPages) {
  return Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])
  ).filter((page) => page >= 1 && page <= totalPages);
}

export default function Home() {
  const { categories, loading, error, backendReady } = useStoreData({ includeProducts: false });
  const { freeDeliveryThreshold } = usePublicStoreSettings();
  const categoryRailRef = useRef(null);
  const [categoryRailPaused, setCategoryRailPaused] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = Math.max(1, categories.length || 6);
  const [productPageData, setProductPageData] = useState({
    products: [],
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const totalProductPages = Math.max(1, Number(productPageData.totalPages || 1));
  const safeProductPage = Math.min(productPage, totalProductPages);
  const paginationNumbers = getPaginationNumbers(safeProductPage, totalProductPages);
  const heroImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80";

  useEffect(() => {
    const rail = categoryRailRef.current;
    if (!rail || categoryRailPaused || categories.length <= 3) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      if (maxScrollLeft <= 0) {
        return;
      }

      const nextLeft = rail.scrollLeft + Math.min(220, rail.clientWidth * 0.65);
      rail.scrollTo({
        left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, [categories.length, categoryRailPaused]);

  useEffect(() => {
    setProductPage(1);
  }, [categories.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadProductPage() {
      try {
        setProductsLoading(true);
        setProductsError("");
        const data = await fetchProductPage({
          page: productPage,
          size: productsPerPage,
        });

        if (cancelled) {
          return;
        }

        setProductPageData(data);
      } catch (loadError) {
        if (!cancelled) {
          setProductPageData({ products: [], page: 1, totalPages: 1, totalItems: 0 });
          setProductsError(loadError.message || "Products could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    loadProductPage();

    return () => {
      cancelled = true;
    };
  }, [productPage, productsPerPage]);

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

        <section id="all-categories" className="mt-6 scroll-mt-36 soft-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">All Categories</h2>
            <span className="text-xs font-bold text-slate-400">
            {loading ? "Loading..." : backendReady ? "Live API" : "Backend Offline"}
            </span>
          </div>
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div
            ref={categoryRailRef}
            className="category-carousel flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
            onFocus={() => setCategoryRailPaused(true)}
            onBlur={() => setCategoryRailPaused(false)}
            onMouseEnter={() => setCategoryRailPaused(true)}
            onMouseLeave={() => setCategoryRailPaused(false)}
            onTouchStart={() => setCategoryRailPaused(true)}
            onTouchEnd={() => setCategoryRailPaused(false)}
          >
            {categories.map((category) => (
              <div key={category.id} className="min-w-[148px] snap-start sm:min-w-[160px] lg:min-w-[174px]">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Products</h2>
              <p className="mt-1 text-sm text-slate-500">
                First page shows one product from each category. Use next pages for more items.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {productsLoading ? "Loading products..." : `Page ${safeProductPage} of ${totalProductPages}`}
            </span>
          </div>
          {productsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {productsError}
            </div>
          ) : productsLoading ? (
            <div className="grid grid-fit gap-4 sm:gap-6">
              {Array.from({ length: productsPerPage }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white" />
              ))}
            </div>
          ) : (
            <ProductGrid products={productPageData.products || []} />
          )}
          {totalProductPages > 1 ? (
            <div className="mt-6 flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safeProductPage <= 1}
                onClick={() => setProductPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {paginationNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-black ${
                      pageNumber === safeProductPage
                        ? "bg-yellow-400 text-slate-950"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() => setProductPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                  Total {totalProductPages}
                </span>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safeProductPage >= totalProductPages}
                onClick={() => setProductPage((page) => Math.min(totalProductPages, page + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
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
