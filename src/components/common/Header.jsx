import { Heart, Menu, ShoppingCart, User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useStoreData } from "../../hooks/useStoreData";
import SearchBar from "./SearchBar";

export default function Header() {
  const { totalItems } = useCart();
  const { session, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const { categories } = useStoreData();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fallbackCategoryMenu = [
    { label: "Flour, Rice & Grains", to: "/category/aata" },
    { label: "Lentils & Pulses", to: "/category/dal" },
    { label: "Oil & Ghee", to: "/category/oil" },
    { label: "Spices & Seasoning", to: "/category/masala" },
    { label: "Biscuits & Snacks", to: "/category/snacks" },
    { label: "Daily Essentials", to: "/products" },
  ];
  const categoryMenu = categories.length
    ? categories.map((category) => ({
        label: category.name,
        to: `/category/${category.slug}`,
      }))
    : fallbackCategoryMenu;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="store-shell py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <Link to="/" onClick={scrollToTop} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-yellow-400 sm:h-14 sm:w-14 sm:text-2xl">
              AK
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">A K GENERAL STORE</p>
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs">Your Daily Needs Partner</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 text-slate-700 md:hidden">
              <Link to={session?.role === "user" ? "/wishlist" : "/login"} onClick={scrollToTop} className="relative rounded-2xl border border-slate-200 p-3">
                <Heart className="h-4 w-4" />
                {wishlistItems.length ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-slate-950">
                    {wishlistItems.length}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/cart"
                onClick={scrollToTop}
                className="relative rounded-2xl border border-slate-200 p-3"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-slate-950">
                  {totalItems}
                </span>
              </Link>
              <Link to={session?.role === "user" ? "/profile" : "/login"} onClick={scrollToTop} className="rounded-2xl border border-slate-200 p-3">
                <User2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center">
            <SearchBar
              placeholder="Search flour, rice, lentils, oil, biscuits and more..."
              className="xl:flex-1"
            />

            <div className="flex flex-wrap items-center gap-2 text-slate-700 xl:ml-auto xl:flex-nowrap">
            {session?.role === "user" ? (
              <>
                <Link to="/my-orders" onClick={scrollToTop} className="hidden rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold md:flex">
                  My Orders
                </Link>
                <Link to="/address-book" onClick={scrollToTop} className="hidden rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold md:flex">
                  Addresses
                </Link>
                <Link to="/profile" onClick={scrollToTop} className="hidden items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold md:flex">
                  <User2 className="h-4 w-4" />
                  Profile
                </Link>
                <button onClick={logout} className="hidden rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold md:flex">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={scrollToTop} className="hidden items-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-semibold md:flex">
                <User2 className="h-4 w-4" />
                Login / Signup
              </Link>
            )}
            <Link to={session?.role === "user" ? "/wishlist" : "/login"} onClick={scrollToTop} className="relative hidden rounded-2xl border border-slate-200 p-3 md:flex">
              <Heart className="h-4 w-4" />
              {wishlistItems.length ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-slate-950">
                  {wishlistItems.length}
                </span>
              ) : null}
            </Link>
            <Link
              to="/cart"
              onClick={scrollToTop}
              className="relative hidden items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white md:inline-flex"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-slate-950">
                {totalItems}
              </span>
            </Link>
          </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <Link to="/products" onClick={scrollToTop} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-950">
            <Menu className="h-4 w-4" />
            All Categories
          </Link>
          <div className="category-carousel flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {categoryMenu.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={scrollToTop}
                className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/aata-chakki-booking"
              onClick={scrollToTop}
              className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Fresh Flour Service
            </Link>
          </div>
          <Link to="/offers" onClick={scrollToTop} className="shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
            Offers
          </Link>
        </div>
      </div>
    </header>
  );
}
