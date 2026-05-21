import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../utils/formatPrice";
import { getFallbackProductImage } from "../../utils/storeMappers";
import Button from "../common/Button";

const visualMap = {
  grain: "from-amber-200 to-yellow-100",
  dal: "from-orange-200 to-amber-100",
  rice: "from-lime-200 to-lime-100",
  oil: "from-yellow-300 to-orange-100",
  spice: "from-rose-200 to-orange-100",
  snack: "from-sky-200 to-cyan-100",
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { session } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-soft sm:rounded-[1.35rem]">
      <div
        className={`relative flex h-32 items-center justify-center rounded-[1rem] bg-gradient-to-br ${visualMap[product.image]} p-3 sm:h-36 sm:rounded-[1.1rem] sm:p-4`}
      >
        <button
          type="button"
          onClick={() => {
            if (session?.role === "user") {
              toggleWishlist(product);
              return;
            }

            navigate("/login", {
              state: {
                from: { pathname: `/product/${product.id}` },
                loginMessage: "Please login to save products to your wishlist.",
              },
            });
          }}
          className={`absolute right-3 top-3 rounded-full p-2 ${wishlisted ? "bg-red-500 text-white" : "bg-white/80 text-slate-700"}`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-[0.95rem] object-cover shadow-sm"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getFallbackProductImage(product);
            }}
          />
        ) : (
          <img
            src={getFallbackProductImage(product)}
            alt={product.name}
            className="h-full w-full rounded-[0.95rem] object-cover shadow-sm"
          />
        )}
      </div>
      <div className="space-y-2 px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link to={`/product/${product.id}`} className="text-sm font-bold text-slate-950">
              {product.name}
            </Link>
            <p className="text-xs text-slate-500">{product.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-black text-slate-950">{formatPrice(product.price)}</p>
            <p className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </p>
          </div>
        </div>
        <p className="min-h-10 overflow-hidden text-xs leading-5 text-slate-500">{product.description}</p>
        <div className="flex items-center gap-2">
          <Button variant="accent" className="flex-1 py-2 text-xs" onClick={() => addToCart(product)}>
            Add
          </Button>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-700"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
