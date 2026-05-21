import {
  CheckCircle2,
  ClipboardCheck,
  CircleSlash2,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";
import { useOrders } from "../../context/OrderContext";
import { getOrderProgressSteps, getOrderStatusLabel } from "../../utils/orderStatus";

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const { orders } = useOrders();
  const order = orders.find((item) => item.orderNumber === orderNumber);
  const steps = getOrderProgressSteps(order);
  const stepIcons = {
    ORDER_PLACED: ClipboardCheck,
    ADMIN_CONFIRMED: ShieldCheck,
    ASSIGNED_TO_DELIVERY: PackageCheck,
    PICKED_BY_DELIVERY: Truck,
    ORDER_COMPLETED: CheckCircle2,
    ORDER_CANCELLED: CircleSlash2,
  };

  if (!order) {
    return (
      <div className="page-shell">
        <TopBar />
        <Header />
        <main className="store-shell py-6">
          <BackButton fallback="/my-orders" className="mb-5" />
          <div className="soft-panel p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Tracking Unavailable
            </p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">
              This order could not be found.
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Refresh your orders list and try opening the tracking page again.
            </p>
            <Link
              to="/my-orders"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Go to My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/my-orders" className="mb-5" />
        <div className="soft-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Tracking Order</p>
              <h1 className="text-4xl font-black text-slate-950">{orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-500">
                Real-time delivery workflow for your order from placement to final handoff.
              </p>
            </div>
            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800">
              {getOrderStatusLabel(order?.status)}
            </span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#ececec,_#d8dde7)] p-6">
              <div className="flex h-72 items-center justify-center rounded-[1.25rem] border border-white/50 bg-white/30">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
                    <MapPinned className="h-7 w-7 text-slate-700" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-700">Live tracking map area</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Route and delivery movement can be shown here when live map integration is enabled.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Delivery Timeline
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-950">
                      Track each operational step
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const Icon = stepIcons[step.key] || ClipboardCheck;

                    return (
                      <div key={step.key} className="relative flex gap-4">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                              step.done
                                ? "border-green-200 bg-green-500 text-white"
                                : step.current
                                  ? "border-yellow-300 bg-yellow-400 text-slate-950"
                                  : "border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {index !== steps.length - 1 ? (
                            <div
                              className={`mt-2 h-full min-h-10 w-px ${
                                step.done ? "bg-green-200" : "bg-slate-200"
                              }`}
                            />
                          ) : null}
                        </div>
                        <div
                          className={`flex-1 rounded-[1.35rem] border p-4 ${
                            step.done
                              ? "border-green-200 bg-green-50/80"
                              : step.current
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p
                              className={`text-base font-black ${
                                step.done
                                  ? "text-green-800"
                                  : step.current
                                    ? "text-slate-950"
                                    : "text-slate-700"
                              }`}
                            >
                              {step.label}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                step.done
                                  ? "bg-green-100 text-green-700"
                                  : step.current
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {step.done ? "Completed" : step.current ? "In Progress" : "Pending"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                          <p className="mt-3 text-xs font-semibold text-slate-500">
                            {step.timestamp ? `Updated: ${step.timestamp}` : "Waiting for this step to begin"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {order?.deliveryAddress ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <p className="font-black text-slate-900">Delivery Address</p>
                  <p className="mt-2">{order.deliveryAddress}</p>
                </div>
              ) : null}
              <Link to="/my-orders" className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                Back to My Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
