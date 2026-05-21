import { BarChart3, Boxes, ClipboardList, LayoutDashboard, LogOut, Settings, Shapes, Truck, Users, TicketPercent } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Categories", to: "/admin/categories", icon: Shapes },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Delivery Team", to: "/admin/delivery-boys", icon: Truck },
  { label: "Coupons", to: "/admin/coupons", icon: TicketPercent },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout, session } = useAuth();

  return (
    <aside className="h-full rounded-[1.75rem] bg-[#151d27] p-4 text-white shadow-soft lg:sticky lg:top-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Admin Panel</p>
        <p className="mt-2 text-3xl font-black text-yellow-400">ak</p>
        <p className="text-sm font-bold">A K GENERAL STORE</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-sm font-black text-white">{session?.name || "Store Admin"}</p>
          <p className="mt-1 text-xs text-slate-400">{session?.email || "owner@akstore.com"}</p>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {links.map((link) => {
          const active = location.pathname === link.to;
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              to={link.to}
              className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-yellow-400 text-slate-950" : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-4">
        <p className="text-sm font-black text-white">Operations checklist</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Confirm fresh orders quickly, assign delivery partners after packing, and review revenue trends daily.
        </p>
      </div>
      <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 lg:mt-6 lg:justify-start">
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
