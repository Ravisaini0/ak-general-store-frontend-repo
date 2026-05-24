import { CheckCircle2, ChevronLeft, Heart, Share2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import SeoHead from "../components/common/SeoHead";
import TopBar from "../components/common/TopBar";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { fetchProductById } from "../services/productService";
import { formatPrice } from "../utils/formatPrice";
import { getFallbackProductImage } from "../utils/storeMappers";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { addToCart, buyNow, totalItems } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageFailed, setSelectedImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const wishlisted = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        if (!cancelled) {
          const nextProduct = await fetchProductById(id);
          setProduct(nextProduct);
          setSelectedImage(nextProduct.imageUrls?.[0] || nextProduct.imageUrl || getFallbackProductImage(nextProduct));
          setSelectedImageFailed(false);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setProduct(null);
          setSelectedImage("");
          setError(fetchError.message || "The product could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setSelectedImageFailed(false);
  }, [selectedImage]);

  if (loading && !product) {
    return (
      <div className="page-shell">
        <TopBar />
        <Header />
        <main className="store-shell py-10">
          <div className="soft-panel p-10 text-center text-slate-500">Loading product...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!loading && !product) {
    return (
      <div className="page-shell">
        <TopBar />
        <Header />
        <main className="store-shell py-10">
          <div className="soft-panel p-10 text-center text-red-700">
            {error || "Product could not be loaded from the backend."}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setFeedback(`${product.name} has been added to your cart.`);
  };

  const handleBuyNow = () => {
    flushSync(() => {
      buyNow(product, quantity);
    });

    if (session?.role !== "user") {
      navigate("/login", {
        state: {
          from: { pathname: "/checkout" },
        },
      });
      return;
    }

    navigate("/checkout");
  };

  const galleryImages =
    product?.imageUrls?.length
      ? product.imageUrls
      : product?.imageUrl
        ? [product.imageUrl]
        : product
          ? [getFallbackProductImage(product)]
          : [];

  const activeImage = selectedImage || galleryImages[0] || (product ? getFallbackProductImage(product) : "");

  return (
    <div className="page-shell">
      <SeoHead
        title={`${product.name} | AK General Store`}
        description={`${product.description} Order ${product.name} from AK General Store with secure checkout, live order tracking, and fast local delivery.`}
      />
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <div className="soft-panel p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
              <ChevronLeft className="h-4 w-4" />
              Product
            </div>
            <p className="order-3 w-full text-center text-sm font-bold text-slate-900 sm:order-none sm:w-auto">Product Details</p>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-slate-500" />
              <Share2 className="h-5 w-5 text-slate-500" />
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-slate-800" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-slate-950">
                  {totalItems}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#fff0c5] via-[#ffe18d] to-[#ffb637] p-8">
                {activeImage ? (
                  !selectedImageFailed ? (
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="mx-auto h-64 w-full max-w-[260px] rounded-[1.75rem] object-cover shadow-lg sm:h-80"
                      onError={() => setSelectedImageFailed(true)}
                    />
                  ) : (
                    <div className="mx-auto flex h-64 w-full max-w-[260px] items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm font-semibold text-slate-600 sm:h-80">
                      Product image unavailable
                    </div>
                  )
                ) : null}
              </div>
              {galleryImages.length > 1 ? (
                <div className="mt-4">
                  <div className="grid grid-cols-4 gap-3">
                    {galleryImages.slice(0, 8).map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(imageUrl)}
                        className={`overflow-hidden rounded-2xl border-2 transition ${
                          activeImage === imageUrl ? "border-slate-950" : "border-slate-200"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${product.name} preview ${index + 1}`}
                          className="h-16 w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    {galleryImages.slice(0, 8).map((imageUrl, index) => (
                      <span
                        key={`dot-${index}`}
                        className={`h-2.5 w-2.5 rounded-full ${
                          activeImage === imageUrl ? "bg-slate-950" : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{product.name}</h1>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{product.unit}</p>
                </div>
                <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  5% OFF
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (session?.role === "user") {
                      toggleWishlist(product);
                    } else {
                      navigate("/login", {
                        state: {
                          from: { pathname: `/product/${id}` },
                          loginMessage: "Please login to save products to your wishlist.",
                        },
                      });
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${
                    wishlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-3xl font-black text-slate-950 sm:text-4xl">
                  {loading ? "Loading..." : formatPrice(product.price)}
                </p>
                <p className="text-lg text-slate-400 line-through sm:text-xl">{formatPrice(product.originalPrice)}</p>
              </div>

              <p className="mt-6 text-sm font-black text-slate-900">About this item</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />100% Pure & Natural</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Made from carefully selected quality ingredients</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Fresh, hygienic, and secure packaging</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Trusted by local families</p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <button className="px-3 text-xl font-bold" onClick={() => setQuantity((count) => Math.max(1, count - 1))}>-</button>
                  <span className="w-12 text-center font-black">{quantity}</span>
                  <button className="px-3 text-xl font-bold" onClick={() => setQuantity((count) => count + 1)}>+</button>
                </div>
                <Button variant="accent" className="w-full min-w-0 flex-1 py-4 sm:min-w-[210px]" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>

              <Link
                to="/checkout"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-orange-300 bg-white px-4 py-4 text-sm font-bold text-slate-950"
                onClick={(event) => {
                  event.preventDefault();
                  handleBuyNow();
                }}
              >
                Buy Now
              </Link>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Get it in 10-30 minutes
                </p>
                <p className="mt-1 text-green-700">{feedback || "Fast grocery checkout is available now."}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
