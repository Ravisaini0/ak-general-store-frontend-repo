import { Percent, Ticket, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import BackButton from "../../components/common/BackButton";
import { Link } from "react-router-dom";
import { usePublicStoreSettings } from "../../hooks/usePublicStoreSettings";
import { fetchPublicCoupons } from "../../services/couponService";

function buildCouponDescription(coupon) {
  const minimumOrder = Number(coupon.minimumOrderAmount || 0);
  if (String(coupon.discountType).toUpperCase() === "PERCENT") {
    return `${
      Number(coupon.discountValue || 0).toFixed(0)
    }% off${minimumOrder > 0 ? ` on carts above Rs${minimumOrder}` : ""}.`;
  }

  return `Flat Rs${Number(coupon.discountValue || 0).toFixed(0)} off${
    minimumOrder > 0 ? ` on carts above Rs${minimumOrder}` : ""
  }.`;
}

export default function Offers() {
  const { freeDeliveryThreshold } = usePublicStoreSettings();
  const [liveCoupons, setLiveCoupons] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchPublicCoupons()
      .then((response) => {
        if (!cancelled) {
          setLiveCoupons(Array.isArray(response) ? response : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLiveCoupons([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const offers = useMemo(() => {
    const couponOffers = liveCoupons.slice(0, 4).map((coupon) => ({
      title:
        String(coupon.discountType).toUpperCase() === "PERCENT"
          ? `${Number(coupon.discountValue || 0).toFixed(0)}% Off`
          : `Flat Rs${Number(coupon.discountValue || 0).toFixed(0)} Off`,
      code: coupon.code,
      description: buildCouponDescription(coupon),
      icon: String(coupon.discountType).toUpperCase() === "PERCENT" ? Percent : Ticket,
    }));

    return [
      ...couponOffers,
      {
        title: `Free Delivery Above Rs${freeDeliveryThreshold}`,
        code: "AUTO",
        description: "Delivery charges are waived automatically when your cart crosses the threshold.",
        icon: Truck,
      },
    ];
  }, [freeDeliveryThreshold, liveCoupons]);

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
            Use these live DB-backed offers while shopping. You can browse products and apply the
            best deal at checkout.
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
