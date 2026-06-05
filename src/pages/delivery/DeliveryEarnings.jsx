import { ArrowUpCircle, BadgeIndianRupee, Clock3, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/common/Button";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import { useOrders } from "../../context/OrderContext";
import { usePublicStoreSettings } from "../../hooks/usePublicStoreSettings";
import { requestWeeklyWithdrawal } from "../../services/deliveryService";

function sumEarnings(orders) {
  return orders.reduce((sum, order) => sum + Number(order.deliveryEarningAmount || 0), 0);
}

function formatCurrency(value) {
  return `Rs${Number(value || 0).toFixed(0)}`;
}

function formatDateTime(value) {
  if (!value) {
    return "Not requested yet";
  }

  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    return value;
  }

  return next.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DeliveryEarnings() {
  const { orders, refreshOrders } = useOrders();
  const {
    deliveryBasePayoutAmount: basePayoutValue,
    deliveryAdditionalPayoutAmount: additionalPayoutValue,
  } = usePublicStoreSettings();
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const basePayout = Number(basePayoutValue || 20);
  const additionalPayout = Number(additionalPayoutValue || 10);

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "ORDER_COMPLETED"),
    [orders]
  );

  const earnings = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = completedOrders.filter(
      (order) => new Date(order.deliveredAt || order.createdAt).toDateString() === todayKey
    );
    const weekOrders = completedOrders.filter(
      (order) => new Date(order.deliveredAt || order.createdAt) >= weekStart
    );
    const monthOrders = completedOrders.filter(
      (order) => new Date(order.deliveredAt || order.createdAt) >= monthStart
    );

    return [
      { day: "Today", amount: sumEarnings(todayOrders) },
      { day: "This Week", amount: sumEarnings(weekOrders) },
      { day: "This Month", amount: sumEarnings(monthOrders) },
    ];
  }, [completedOrders]);

  const paidOut = completedOrders.reduce(
    (sum, order) =>
      sum + (order.payoutStatus === "PAID" ? Number(order.deliveryEarningAmount || 0) : 0),
    0
  );
  const requestedPayout = completedOrders.reduce(
    (sum, order) =>
      sum + (order.payoutStatus === "REQUESTED" ? Number(order.deliveryEarningAmount || 0) : 0),
    0
  );
  const availableForWithdrawal = completedOrders.reduce(
    (sum, order) =>
      sum +
      ((order.payoutStatus === "PENDING" || !order.payoutStatus)
        ? Number(order.deliveryEarningAmount || 0)
        : 0),
    0
  );
  const latestRequestedAt = completedOrders
    .map((order) => order.payoutRequestedAt)
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
  const nextWithdrawalDate = latestRequestedAt
    ? new Date(new Date(latestRequestedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;
  const withdrawalEligible =
    requestedPayout <= 0 &&
    availableForWithdrawal > 0 &&
    (!nextWithdrawalDate || new Date() >= nextWithdrawalDate);

  const earningRuleText = `Single live route order pays Rs${basePayout}. If you carry more orders on the same active route, each extra order pays Rs${additionalPayout}.`;

  return (
    <DeliveryLayout
      title="Delivery Earnings"
      description="Track fixed delivery earnings, weekly payout requests, and admin settlements."
      onRefresh={refreshOrders}
    >
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f1720,_#1e293b)] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Fixed payout rule</p>
          <p className="mt-3 text-4xl font-black">{formatCurrency(sumEarnings(completedOrders))}</p>
          <p className="mt-2 text-sm text-slate-300">
            {completedOrders.length} delivered orders are included in lifetime delivery earnings.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            {earningRuleText}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {earnings.map((item) => (
            <div key={item.day} className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{item.day}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Paid by admin</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(paidOut)}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Under review</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(requestedPayout)}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Ready to withdraw</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatCurrency(availableForWithdrawal)}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-slate-900" />
            <h3 className="text-xl font-black text-slate-950">Weekly Withdrawal</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            You can request a payout once every 7 days. Admin can then settle the requested amount and track the reference.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Latest request</p>
              <p className="mt-2 text-sm font-black text-slate-950">{formatDateTime(latestRequestedAt)}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Next request window</p>
              <p className="mt-2 text-sm font-black text-slate-950">
                {withdrawalEligible || !nextWithdrawalDate
                  ? "Open now"
                  : formatDateTime(nextWithdrawalDate.toISOString())}
              </p>
            </div>
          </div>

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}
          {actionError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}

          <Button
            type="button"
            variant="accent"
            className="mt-5 w-full gap-2 py-4 font-black"
            disabled={!withdrawalEligible || requesting}
            onClick={async () => {
              try {
                setRequesting(true);
                setActionError("");
                setSuccessMessage("");
                await requestWeeklyWithdrawal();
                await refreshOrders();
                setSuccessMessage(
                  "Weekly payout request sent to admin. Your delivered earnings are now waiting for settlement."
                );
              } catch (error) {
                setActionError(error.message || "Weekly payout request could not be submitted.");
              } finally {
                setRequesting(false);
              }
            }}
          >
            <ArrowUpCircle className="h-4 w-4" />
            {requesting ? "Submitting request..." : "Request Weekly Withdrawal"}
          </Button>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                Weekly rule: one request in 7 days. Amounts under review stay locked until admin marks the payout as paid.
              </p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <BadgeIndianRupee className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                Fixed route rule: the first active order pays{" "}
                <span className="font-black text-slate-900">Rs{basePayout}</span>, and every extra
                same-route order pays{" "}
                <span className="font-black text-slate-900">Rs{additionalPayout}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
}
