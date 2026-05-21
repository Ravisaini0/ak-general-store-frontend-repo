import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../utils/formatPrice";

export default function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/profile" className="mb-5" />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-950">My Wishlist</h1>
            <p className="mt-2 text-sm text-slate-500">Your saved products appear here for quick access.</p>
          </div>
          <div className="store-chip">
            <Heart className="h-4 w-4" />
            {wishlistItems.length} saved
          </div>
        </div>

        {!wishlistItems.length ? (
          <div className="soft-panel p-8 text-center">
            <p className="text-slate-500">Your wishlist is empty at the moment.</p>
            <Link to="/" className="mt-4 inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wishlistItems.map((product) => (
              <div key={product.id} className="soft-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button onClick={() => navigate(`/product/${product.id}`)} className="text-left text-lg font-black text-slate-950">
                      {product.name}
                    </button>
                    <p className="mt-1 text-sm text-slate-500">{product.unit}</p>
                    <p className="mt-3 text-xl font-black text-slate-950">{formatPrice(product.price)}</p>
                  </div>
                  <button onClick={() => removeFromWishlist(product.id)} className="rounded-xl border border-red-200 p-2 text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-slate-950"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
