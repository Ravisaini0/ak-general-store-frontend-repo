import { CheckCircle2, Clock3, MapPinned, Phone, QrCode, ScanSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import { useOrders } from "../../context/OrderContext";
import { fetchPaymentConfig } from "../../services/paymentService";
import { getOrderStatusLabel, getOrderProgressSteps } from "../../utils/orderStatus";
import { buildQrPreviewUrl, buildUpiPaymentLink } from "../../utils/payment";

export default function DeliveryOrderDetails() {
  const { id } = useParams();
  const { orders, pickOrder, deliverOrder, refreshOrders } = useOrders();
  const [collectionMethod, setCollectionMethod] = useState("CASH");
  const [upiReference, setUpiReference] = useState("");
  const [actionError, setActionError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState({
    businessName: "AK General Store",
    upiMerchantName: "AK General Store",
    upiId: "",
  });
  const order = orders.find((item) => item.orderNumber === id);
  const steps = getOrderProgressSteps(order);
  const hasExactPin =
    Number.isFinite(Number(order?.deliveryLatitude)) &&
    Number.isFinite(Number(order?.deliveryLongitude));
  const encodedAddress = encodeURIComponent(order?.deliveryAddress || "Customer location");
  const mapsUrl = hasExactPin
    ? `https://www.google.com/maps/dir/?api=1&destination=${Number(order.deliveryLatitude)},${Number(order.deliveryLongitude)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const requiresCollection = order?.paymentMode === "COD" && order?.paymentStatus !== "SUCCESS";

  useEffect(() => {
    fetchPaymentConfig()
      .then(setPaymentConfig)
      .catch(() => {
        setPaymentConfig({
          businessName: "AK General Store",
          upiMerchantName: "AK General Store",
          upiId: "",
        });
      });
  }, []);

  const deliveryUpiLink = useMemo(
    () =>
      requiresCollection && collectionMethod === "UPI" && paymentConfig.upiId
        ? buildUpiPaymentLink({
            upiId: paymentConfig.upiId,
            merchantName: paymentConfig.upiMerchantName || paymentConfig.businessName,
            amount: Number(order?.totalAmount || 0),
            note: `${order?.orderNumber || "AK Order"} COD collection`,
          })
        : "",
    [
      collectionMethod,
      order?.orderNumber,
      order?.totalAmount,
      paymentConfig.businessName,
      paymentConfig.upiId,
      paymentConfig.upiMerchantName,
      requiresCollection,
    ]
  );
  const deliveryQrPreviewUrl = deliveryUpiLink ? buildQrPreviewUrl(deliveryUpiLink) : "";

  const handleDelivered = async () => {
    try {
      setActionError("");
      if (requiresCollection && collectionMethod === "UPI" && !upiReference.trim()) {
        setActionError("Enter the UPI reference before closing this delivery.");
        return;
      }

      await deliverOrder(order.orderNumber, {
        collectionMethod: requiresCollection ? collectionMethod : "ONLINE",
        referenceId: collectionMethod === "UPI" ? upiReference.trim() : undefined,
      });
    } catch (error) {
      setActionError(error.message || "Delivery completion could not be saved.");
    }
  };

  return (
    <DeliveryLayout
      title="Order Details"
      description="Open navigation, collect payment safely when required, and close the delivery with full backend tracking."
      onRefresh={refreshOrders}
      actions={
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
          {getOrderStatusLabel(order?.status)}
        </span>
      }
    >
      {!order ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          This order could not be found in the current delivery queue.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Live route</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{order.orderNumber || "#ORDER"}</p>
                  <p className="mt-2 text-sm text-slate-500">{order.deliveryAddress || "Customer address"}</p>
                  {order.deliveryLocationLabel ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      Delivery pin: {order.deliveryLocationLabel}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-900">Estimated delivery</p>
                  <p className="mt-1 text-slate-500">10 to 30 minutes</p>
                  {order.servingStoreName ? (
                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      Serving store: {order.servingStoreName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="h-80 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,_#ececec,_#d8dde7)] p-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-full items-center justify-center rounded-[1.25rem] border border-white/60 bg-[linear-gradient(135deg,_rgba(255,255,255,0.55),_rgba(59,130,246,0.12))]"
              >
                <div className="text-center">
                  <MapPinned className="mx-auto h-10 w-10 text-blue-600" />
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    {hasExactPin ? "Open exact customer pin in Google Maps" : "Open route in Google Maps"}
                  </p>
                </div>
              </a>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${order.customerPhone || ""}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                >
                  <Phone className="h-4 w-4" />
                  Call customer
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                >
                  <ScanSearch className="h-4 w-4" />
                  Open navigation
                </a>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="mt-2 font-black text-slate-950">{order.customerName || "Customer"}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.customerPhone || "+91 9876543210"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p>
                  <p className="mt-2 font-black text-slate-950">{order.paymentMode}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.paymentStatus}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Order value</p>
                  <p className="mt-2 font-black text-slate-950">Rs{order.totalAmount}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.itemNames?.join(", ") || "Grocery order"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-xl font-black text-slate-950">Status timeline</h3>
              <div className="mt-4 space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.key}
                    className={`rounded-2xl border px-4 py-4 ${
                      step.done ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-black ${step.done ? "text-green-800" : "text-slate-700"}`}>
                          {step.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                      </div>
                      {step.timestamp ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {step.timestamp}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {requiresCollection ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-slate-900" />
                  <h3 className="text-xl font-black text-slate-950">Collect COD Payment</h3>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Capture how the customer paid at delivery. This is tracked live for admin cash reconciliation and payout settlement.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCollectionMethod("CASH")}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      collectionMethod === "CASH"
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="font-black text-slate-950">Cash received</p>
                    <p className="mt-1 text-sm text-slate-500">Customer paid in cash to the delivery partner.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionMethod("UPI")}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      collectionMethod === "UPI"
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="font-black text-slate-950">UPI received</p>
                    <p className="mt-1 text-sm text-slate-500">Customer scans the QR and pays digitally.</p>
                  </button>
                </div>

                {collectionMethod === "UPI" ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                        {deliveryQrPreviewUrl ? (
                          <img
                            src={deliveryQrPreviewUrl}
                            alt="Delivery collection QR"
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex min-h-[170px] items-center justify-center rounded-xl bg-slate-100 px-3 text-center text-sm text-slate-500">
                            QR will appear when a delivery UPI handle is available.
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-950">Receive with delivery UPI</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Ask the customer to scan this QR, then enter the UPI reference to close the order safely.
                        </p>
                        <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">
                            {paymentConfig.upiMerchantName || paymentConfig.businessName}
                          </p>
                          <p className="mt-1">{paymentConfig.upiId || "UPI ID not configured"}</p>
                        </div>
                        {deliveryUpiLink ? (
                          <a
                            href={deliveryUpiLink}
                            className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900"
                          >
                            Open UPI App
                          </a>
                        ) : null}
                        <input
                          className="store-input mt-4"
                          placeholder="Enter UPI reference"
                          value={upiReference}
                          onChange={(event) => setUpiReference(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {actionError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}

            {order.status === "ASSIGNED_TO_DELIVERY" ? (
              <Button
                type="button"
                variant="accent"
                className="w-full gap-2 py-4 font-black"
                onClick={() => pickOrder(order.orderNumber)}
              >
                Start Delivery
              </Button>
            ) : null}
            {order.status === "PICKED_BY_DELIVERY" ? (
              <Button
                type="button"
                className="w-full gap-2 bg-green-500 py-4 font-black text-white hover:bg-green-400"
                onClick={handleDelivered}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Delivered
              </Button>
            ) : null}
          </section>
        </div>
      )}
    </DeliveryLayout>
  );
}
