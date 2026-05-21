import {
  BarChart3,
  CreditCard,
  Download,
  Printer,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import {
  fetchAdminCustomers,
  fetchAdminDeliveryTeam,
  fetchAdminOrders,
} from "../../services/adminService";

function isSameDay(dateLeft, dateRight) {
  return (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getDate() === dateRight.getDate()
  );
}

function formatCurrency(value) {
  return `Rs.${Number(value || 0).toFixed(0)}`;
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    return value;
  }

  return next.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsvValue(value) {
  const next = String(value ?? "");
  if (next.includes(",") || next.includes('"') || next.includes("\n")) {
    return `"${next.replace(/"/g, '""')}"`;
  }
  return next;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function openPrintWindow(report, customersCount, deliveryCount) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
  if (!printWindow) {
    return;
  }

  const statusRows = report.statusBreakdown
    .map(
      ([status, count]) =>
        `<tr><td>${status}</td><td style="text-align:right;font-weight:700;">${count}</td></tr>`
    )
    .join("");

  const paymentRows = report.paymentBreakdown
    .map(
      ([mode, count]) =>
        `<tr><td>${mode}</td><td style="text-align:right;font-weight:700;">${count}</td></tr>`
    )
    .join("");

  const recentRows = report.recentOrders
    .map(
      (order) => `
        <tr>
          <td>#${order.orderNumber}</td>
          <td>${order.customerName || "Customer"}</td>
          <td>${order.servingStoreName || "Primary store"}</td>
          <td>${order.paymentMode || "COD"}</td>
          <td>${order.status || "ORDER_PLACED"}</td>
          <td style="text-align:right;">${formatCurrency(order.amount)}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>AK General Store Reports</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
          h1 { margin-bottom: 4px; }
          h2 { margin: 28px 0 12px; }
          .muted { color: #64748b; font-size: 14px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
          .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px; background: #f8fafc; }
          .label { text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; color: #64748b; font-weight: 700; }
          .value { font-size: 28px; font-weight: 800; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
          th { color: #64748b; font-weight: 700; }
          @media print { body { margin: 16px; } }
        </style>
      </head>
      <body>
        <h1>AK General Store Reports</h1>
        <p class="muted">Generated on ${formatDateTime(new Date().toISOString())}</p>
        <div class="grid">
          <div class="card"><div class="label">Total Revenue</div><div class="value">${formatCurrency(report.totalRevenue)}</div></div>
          <div class="card"><div class="label">Total Orders</div><div class="value">${report.totalOrders}</div></div>
          <div class="card"><div class="label">Customers</div><div class="value">${customersCount}</div></div>
          <div class="card"><div class="label">Delivery Partners</div><div class="value">${deliveryCount}</div></div>
        </div>

        <h2>Operations Summary</h2>
        <table>
          <tr><td>Today Revenue</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.todayRevenue)}</td></tr>
          <tr><td>7 Day Revenue</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.weeklyRevenue)}</td></tr>
          <tr><td>30 Day Revenue</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.monthlyRevenue)}</td></tr>
          <tr><td>Orders Today</td><td style="text-align:right;font-weight:700;">${report.todayOrders}</td></tr>
          <tr><td>Orders Last 7 Days</td><td style="text-align:right;font-weight:700;">${report.weeklyOrders}</td></tr>
          <tr><td>Orders Last 30 Days</td><td style="text-align:right;font-weight:700;">${report.monthlyOrders}</td></tr>
          <tr><td>Cash Collections</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.cashCollections)}</td></tr>
          <tr><td>UPI Collections</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.upiCollections)}</td></tr>
          <tr><td>Pending Collections</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.pendingCollections)}</td></tr>
          <tr><td>Pending Delivery Payouts</td><td style="text-align:right;font-weight:700;">${formatCurrency(report.pendingPayout)}</td></tr>
        </table>

        <h2>Payment Mix</h2>
        <table>${paymentRows}</table>

        <h2>Status Mix</h2>
        <table>${statusRows}</table>

        <h2>Recent Order Records</h2>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Payment</th>
              <th>Status</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${recentRows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deliveryTeam, setDeliveryTeam] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportSources() {
      try {
        setLoading(true);
        setError("");
        const [ordersResponse, customersResponse, deliveryResponse] = await Promise.all([
          fetchAdminOrders(),
          fetchAdminCustomers(),
          fetchAdminDeliveryTeam(),
        ]);
        setOrders(ordersResponse);
        setCustomers(customersResponse);
        setDeliveryTeam(deliveryResponse);
      } catch (loadError) {
        setError(loadError.message || "Reports could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadReportSources();
  }, []);

  const report = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const normalizedOrders = orders.map((order) => ({
      ...order,
      createdDate: order.createdAt ? new Date(order.createdAt) : new Date(),
      amount: Number(order.totalAmount || order.total || 0),
    }));

    const todayOrders = normalizedOrders.filter((order) => isSameDay(order.createdDate, now));
    const weeklyOrders = normalizedOrders.filter((order) => order.createdDate >= sevenDaysAgo);
    const monthlyOrders = normalizedOrders.filter((order) => order.createdDate >= thirtyDaysAgo);

    const paymentBreakdown = normalizedOrders.reduce((accumulator, order) => {
      const key = order.paymentMode || "UNKNOWN";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const statusBreakdown = normalizedOrders.reduce((accumulator, order) => {
      const key = order.status || "UNKNOWN";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const topCustomers = normalizedOrders.reduce((accumulator, order) => {
      const key = order.customerEmail || order.customerPhone || order.customerName || order.userId;
      const current = accumulator.get(key) || {
        label: order.customerName || "Customer",
        orders: 0,
        revenue: 0,
      };
      current.orders += 1;
      current.revenue += order.amount;
      accumulator.set(key, current);
      return accumulator;
    }, new Map());

    const topProducts = normalizedOrders.reduce((accumulator, order) => {
      (order.itemNames || []).forEach((item) => {
        accumulator.set(item, (accumulator.get(item) || 0) + 1);
      });
      return accumulator;
    }, new Map());

    return {
      totalRevenue: normalizedOrders.reduce((sum, order) => sum + order.amount, 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.amount, 0),
      weeklyRevenue: weeklyOrders.reduce((sum, order) => sum + order.amount, 0),
      monthlyRevenue: monthlyOrders.reduce((sum, order) => sum + order.amount, 0),
      totalOrders: normalizedOrders.length,
      todayOrders: todayOrders.length,
      weeklyOrders: weeklyOrders.length,
      monthlyOrders: monthlyOrders.length,
      paymentBreakdown: Object.entries(paymentBreakdown),
      statusBreakdown: Object.entries(statusBreakdown),
      topCustomers: [...topCustomers.values()]
        .sort((left, right) => right.revenue - left.revenue)
        .slice(0, 5),
      topProducts: [...topProducts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6),
      recentOrders: normalizedOrders.slice(0, 10),
      cashCollections: normalizedOrders.reduce((sum, order) => sum + Number(order.cashCollectedAmount || 0), 0),
      upiCollections: normalizedOrders.reduce((sum, order) => sum + Number(order.upiCollectedAmount || 0), 0),
      pendingCollections: normalizedOrders.reduce(
        (sum, order) =>
          sum + (order.paymentMode === "COD" && order.paymentStatus !== "SUCCESS" ? order.amount : 0),
        0
      ),
      paidOut: normalizedOrders.reduce(
        (sum, order) =>
          sum + (order.payoutStatus === "PAID" ? Number(order.deliveryEarningAmount || 0) : 0),
        0
      ),
      pendingPayout: normalizedOrders.reduce(
        (sum, order) =>
          sum + (order.payoutStatus === "PAID" ? 0 : Number(order.deliveryEarningAmount || 0)),
        0
      ),
    };
  }, [orders]);

  const exportReportCsv = () => {
    const rows = [
      ["AK General Store Reports"],
      ["Generated At", formatDateTime(new Date().toISOString())],
      [],
      ["Summary"],
      ["Metric", "Value"],
      ["Total Revenue", report.totalRevenue],
      ["Today Revenue", report.todayRevenue],
      ["7 Day Revenue", report.weeklyRevenue],
      ["30 Day Revenue", report.monthlyRevenue],
      ["Total Orders", report.totalOrders],
      ["Today Orders", report.todayOrders],
      ["7 Day Orders", report.weeklyOrders],
      ["30 Day Orders", report.monthlyOrders],
      ["Customers", customers.length],
      ["Delivery Partners", deliveryTeam.length],
      ["Cash Collections", report.cashCollections],
      ["UPI Collections", report.upiCollections],
      ["Pending Collections", report.pendingCollections],
      ["Pending Delivery Payouts", report.pendingPayout],
      [],
      ["Recent Orders"],
      ["Order Number", "Customer", "Store", "Payment", "Status", "Amount", "Created At"],
      ...report.recentOrders.map((order) => [
        order.orderNumber,
        order.customerName,
        order.servingStoreName || "Primary store",
        order.paymentMode,
        order.status,
        order.amount,
        formatDateTime(order.createdAt),
      ]),
    ];

    downloadCsv("ak-general-store-reports.csv", rows);
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-950">Reports</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  Enterprise reporting for revenue, payment mix, fulfilment health, customer activity, and current order records.
                </p>
              </div>
              {!loading && !error ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" className="gap-2 px-4 py-3 font-black" onClick={exportReportCsv}>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    variant="accent"
                    className="gap-2 px-4 py-3 font-black"
                    onClick={() => openPrintWindow(report, customers.length, deliveryTeam.length)}
                  >
                    <Printer className="h-4 w-4" />
                    Print Report
                  </Button>
                </div>
              ) : null}
            </div>

            {!loading && !error ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {orders.length} orders in live records
                </div>
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {customers.length} customers
                </div>
                <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                  {deliveryTeam.length} delivery partners
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading reports...
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Total Revenue", formatCurrency(report.totalRevenue), BarChart3, "Current lifetime business value"],
                  ["Today Revenue", formatCurrency(report.todayRevenue), Receipt, "Daily closure and cash flow"],
                  ["Total Orders", report.totalOrders, ShoppingBag, "All live orders in reporting records"],
                  ["Customers", customers.length, Users, "Current registered customer base"],
                ].map(([label, value, Icon, note]) => (
                  <div key={label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                    <Icon className="h-5 w-5 text-slate-900" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                    <p className="mt-2 text-sm text-slate-500">{note}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">Revenue Windows</p>
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between rounded-xl bg-white px-4 py-3">
                      <span>Today</span>
                      <span className="font-black">{formatCurrency(report.todayRevenue)}</span>
                    </div>
                    <div className="flex justify-between rounded-xl bg-white px-4 py-3">
                      <span>Last 7 Days</span>
                      <span className="font-black">{formatCurrency(report.weeklyRevenue)}</span>
                    </div>
                    <div className="flex justify-between rounded-xl bg-white px-4 py-3">
                      <span>Last 30 Days</span>
                      <span className="font-black">{formatCurrency(report.monthlyRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">Payment Mix</p>
                    <CreditCard className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    {report.paymentBreakdown.map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                          <CreditCard className="h-4 w-4 text-slate-500" />
                          {mode}
                        </span>
                        <span className="font-black text-slate-950">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">Fulfilment Mix</p>
                    <Truck className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    {report.statusBreakdown.map(([status, count]) => (
                      <div key={status} className="flex justify-between rounded-xl bg-white px-4 py-3">
                        <span>{status}</span>
                        <span className="font-black text-slate-950">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-4">
                {[
                  ["Cash Collections", formatCurrency(report.cashCollections)],
                  ["UPI Collections", formatCurrency(report.upiCollections)],
                  ["Pending Collections", formatCurrency(report.pendingCollections)],
                  ["Pending Delivery Payouts", formatCurrency(report.pendingPayout)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-950">Order Frequency</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {[
                      ["Today", report.todayOrders],
                      ["Last 7 Days", report.weeklyOrders],
                      ["Last 30 Days", report.monthlyOrders],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                        <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 xl:col-span-2">
                  <p className="text-sm font-black text-slate-950">Operational Snapshot</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked Customers</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {customers.filter((customer) => customer.status === "Blocked").length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Available Delivery</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {
                          deliveryTeam.filter((member) =>
                            String(member.status || "").toLowerCase().includes("available")
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked Delivery</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {deliveryTeam.filter((member) => member.blocked).length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Top Revenue Window</p>
                      <p className="mt-2 text-lg font-black text-slate-950">
                        {report.monthlyRevenue >= report.weeklyRevenue ? "30 Day Cycle" : "7 Day Cycle"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-950">Top Customers by Revenue</p>
                  <div className="mt-4 space-y-3">
                    {report.topCustomers.length ? (
                      report.topCustomers.map((customer) => (
                        <div key={customer.label} className="rounded-xl bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-900">{customer.label}</p>
                            <span className="font-black text-slate-950">{formatCurrency(customer.revenue)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{customer.orders} orders</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">
                        No customer revenue records are available yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-950">Top Products by Order Count</p>
                  <div className="mt-4 space-y-3">
                    {report.topProducts.length ? (
                      report.topProducts.map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                          <p className="font-semibold text-slate-900">{name}</p>
                          <span className="font-black text-slate-950">{count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">
                        Product movement will appear here once orders are placed.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">Recent Order Records</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Latest orders across stores, payment modes, and fulfilment states.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                    Last {report.recentOrders.length} records
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Created</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recentOrders.map((order) => (
                        <tr key={order.orderId || order.orderNumber} className="border-t border-slate-200">
                          <td className="px-3 py-3 font-semibold text-slate-900">#{order.orderNumber}</td>
                          <td className="px-3 py-3 text-slate-700">{order.customerName}</td>
                          <td className="px-3 py-3 text-slate-700">{order.servingStoreName || "Primary store"}</td>
                          <td className="px-3 py-3 text-slate-700">{order.paymentMode}</td>
                          <td className="px-3 py-3 text-slate-700">{order.status}</td>
                          <td className="px-3 py-3 text-slate-700">{formatDateTime(order.createdAt)}</td>
                          <td className="px-3 py-3 text-right font-black text-slate-950">{formatCurrency(order.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
