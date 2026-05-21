import {
  ArrowRight,
  ClipboardList,
  RefreshCw,
  TicketPercent,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DashboardCard from "../../components/admin/DashboardCard";
import OrderTable from "../../components/admin/OrderTable";
import Button from "../../components/common/Button";
import { useOrders } from "../../context/OrderContext";
import {
  fetchAdminCustomers,
  fetchAdminDashboardData,
  fetchAdminDeliveryTeam,
} from "../../services/adminService";

export default function AdminDashboard() {
  const { allOrders, refreshOrders } = useOrders();
  const [dashboardData, setDashboardData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [deliveryTeam, setDeliveryTeam] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    try {
      const [dashboard, customerData, deliveryData] = await Promise.all([
        fetchAdminDashboardData(),
        fetchAdminCustomers(),
        fetchAdminDeliveryTeam(),
      ]);
      setDashboardData(dashboard);
      setCustomers(customerData);
      setDeliveryTeam(deliveryData);
    } catch {
      // Keep live local fallback when backend dashboard is unavailable.
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await Promise.all([refreshOrders(), loadDashboard()]);
    } finally {
      setRefreshing(false);
    }
  }

  const fallbackData = useMemo(() => {
    const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const pendingOrders = allOrders.filter((order) => order.status === "ORDER_PLACED").length;
    const assignedOrders = allOrders.filter(
      (order) =>
        order.status === "ASSIGNED_TO_DELIVERY" || order.status === "PICKED_BY_DELIVERY"
    ).length;
    const completedOrders = allOrders.filter((order) => order.status === "ORDER_COMPLETED").length;

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      totalCustomers: customers.length,
      totalProducts: "Live Catalog",
      pendingOrders,
      assignedOrders,
      completedOrders,
      recentOrders: allOrders.slice(0, 5),
      blockedCustomers: customers.filter((item) => item.blocked).length,
      availableDeliveryPartners: deliveryTeam.filter(
        (item) => !item.blocked && item.status === "Available"
      ).length,
      blockedDeliveryPartners: deliveryTeam.filter((item) => item.blocked).length,
      cashCollections: allOrders.reduce((sum, order) => sum + Number(order.cashCollectedAmount || 0), 0),
      upiCollections: allOrders.reduce((sum, order) => sum + Number(order.upiCollectedAmount || 0), 0),
      pendingCollections: allOrders.reduce(
        (sum, order) =>
          sum +
          (order.paymentMode === "COD" && order.paymentStatus !== "SUCCESS"
            ? Number(order.totalAmount || 0)
            : 0),
        0
      ),
      pendingPayouts: deliveryTeam.reduce(
        (sum, item) => sum + Number(item.pendingPayoutAmount || 0),
        0
      ),
    };
  }, [allOrders, customers, deliveryTeam]);

  const summary = {
    totalOrders: dashboardData?.totalOrders ?? fallbackData.totalOrders,
    totalRevenue: dashboardData?.totalRevenue ?? fallbackData.totalRevenue,
    totalCustomers: dashboardData?.customersCount ?? fallbackData.totalCustomers,
    totalProducts: dashboardData?.productsCount ?? fallbackData.totalProducts,
    pendingOrders: fallbackData.pendingOrders,
    assignedOrders: fallbackData.assignedOrders,
    completedOrders: fallbackData.completedOrders,
    recentOrders: dashboardData?.recentOrders?.length
      ? dashboardData.recentOrders
      : fallbackData.recentOrders,
    blockedCustomers: fallbackData.blockedCustomers,
    availableDeliveryPartners: fallbackData.availableDeliveryPartners,
    blockedDeliveryPartners: fallbackData.blockedDeliveryPartners,
    cashCollections: fallbackData.cashCollections,
    upiCollections: fallbackData.upiCollections,
    pendingCollections: fallbackData.pendingCollections,
    pendingPayouts: fallbackData.pendingPayouts,
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 space-y-6 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">
                Real-time overview of sales, fulfilment, customer health, and delivery readiness.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                Admin Operations
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total Orders" value={String(summary.totalOrders)} accent="from-yellow-300 to-yellow-500" />
            <DashboardCard label="Total Revenue" value={`Rs.${summary.totalRevenue}`} accent="from-green-300 to-green-500" />
            <DashboardCard label="Total Customers" value={String(summary.totalCustomers)} accent="from-cyan-300 to-cyan-500" />
            <DashboardCard label="Total Products" value={String(summary.totalProducts)} accent="from-orange-300 to-orange-500" />
          </div>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#fff7d6,_#ffffff)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                    Fulfillment health
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Actionable order pipeline</h2>
                </div>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-2 text-sm font-black text-slate-900"
                >
                  Open orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Awaiting confirmation</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{summary.pendingOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Assigned / On route</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{summary.assignedOrders}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Completed</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{summary.completedOrders}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cash collected</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs.{summary.cashCollections.toFixed(0)}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending payout liability</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">Rs.{summary.pendingPayouts.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <Link
                to="/admin/orders"
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <ClipboardList className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-lg font-black text-slate-950">Review new orders</p>
                <p className="mt-2 text-sm text-slate-500">Confirm orders and keep dispatch moving.</p>
              </Link>
              <Link
                to="/admin/customers"
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <Users className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-lg font-black text-slate-950">Customer controls</p>
                <p className="mt-2 text-sm text-slate-500">
                  {summary.blockedCustomers} blocked accounts need review.
                </p>
              </Link>
              <Link
                to="/admin/delivery-boys"
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <Truck className="h-5 w-5 text-slate-900" />
                <p className="mt-4 text-lg font-black text-slate-950">Delivery operations</p>
                <p className="mt-2 text-sm text-slate-500">
                  {summary.availableDeliveryPartners} available • {summary.blockedDeliveryPartners} blocked.
                </p>
              </Link>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Recent Orders</h2>
                <p className="text-sm text-slate-500">Live order activity</p>
              </div>
              <OrderTable orders={summary.recentOrders} />
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black text-slate-950">Customer Health</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span>Active Customers</span>
                    <span className="font-black text-slate-950">{summary.totalCustomers - summary.blockedCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span>Blocked Customers</span>
                    <span className="font-black text-slate-950">{summary.blockedCustomers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span>Delivery Partners Available</span>
                    <span className="font-black text-slate-950">{summary.availableDeliveryPartners}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black text-slate-950">Quick Controls</h3>
                <div className="mt-4 space-y-3">
                  <Link
                    to="/admin/coupons"
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Control promotions
                    <TicketPercent className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Open business reports
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
