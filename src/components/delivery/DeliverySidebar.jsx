import { Bike, ClipboardList, IndianRupee, LogOut, MapPinned, ShieldCheck, User2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";

const baseLinks = [
  { label: "Dashboard", to: "/delivery/dashboard", icon: Bike },
  { label: "Assigned", to: "/delivery/assigned-orders", icon: ClipboardList },
  { label: "Earnings", to: "/delivery/earnings", icon: IndianRupee },
  { label: "Profile", to: "/delivery/profile", icon: User2 },
];

export default function DeliverySidebar() {
  const location = useLocation();
  const { session, logout } = useAuth();
  const { orders } = useOrders();
  const trackingOrder = orders.find(
    (order) => order.status === "ASSIGNED_TO_DELIVERY" || order.status === "PICKED_BY_DELIVERY"
  );
  const links = [
    ...baseLinks.slice(0, 2),
    {
      label: "Tracking",
      to: trackingOrder ? `/delivery/tracking/${trackingOrder.orderNumber}` : "/delivery/assigned-orders",
      icon: MapPinned,
    },
    ...baseLinks.slice(2),
  ];

  return (
    <aside className="h-full rounded-[1.75rem] bg-[#0f1720] p-4 text-white shadow-soft">
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-slate-950">
            <Bike className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Delivery Desk</p>
            <p className="text-sm font-black text-white">{session?.name || "Delivery Partner"}</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <p className="font-semibold text-white">{session?.phone || "9876543210"}</p>
          <p className="mt-1 text-xs text-slate-400">Secure route and delivery operations panel</p>
        </div>
      </div>

      <nav className="mt-4 flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            location.pathname === link.to ||
            (link.label === "Tracking"
              ? location.pathname.startsWith("/delivery/tracking")
              : false);

          return (
            <Link
              key={link.label}
              to={link.to}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-yellow-400 text-slate-950" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
          <div>
            <p className="text-sm font-black text-white">Delivery compliance</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Accept only assigned orders, confirm route details, and mark delivered after handoff.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 lg:mt-6 lg:justify-start"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
