import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/common/BackButton";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import LocationPickerModal from "../components/common/LocationPickerModal";
import TopBar from "../components/common/TopBar";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import {
  createManualPayment,
  createRazorpayOrder,
  fetchPaymentConfig,
  loadRazorpayCheckoutScript,
  markRazorpayPaymentFailed,
  verifyRazorpayPayment,
} from "../services/paymentService";
import { fetchAddresses } from "../services/addressService";
import { fetchPublicCoupons, validateCouponCode } from "../services/couponService";
import { fetchProducts } from "../services/productService";
import { fetchPublicStoreSettings } from "../services/storeService";
import { formatPrice } from "../utils/formatPrice";
import { getCurrentPosition } from "../utils/location";
import { buildQrPreviewUrl, buildUpiPaymentLink } from "../utils/payment";
import { findNearestAvailableStore, parseStoreLocations } from "../utils/storeCoverage";

function buildAddressLabel(addressItem) {
  return (
    addressItem.locationLabel ||
    addressItem.fullAddress ||
    [addressItem.line1, addressItem.line2, addressItem.city, addressItem.state, addressItem.pincode]
      .filter(Boolean)
      .join(", ")
  );
}

function formatAddressType(value) {
  if (!value) {
    return "Saved Address";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}

function buildCouponHint(coupon) {
  const minimumOrderAmount = Number(coupon?.minimumOrderAmount || 0);
  if (minimumOrderAmount > 0) {
    return `Min cart Rs${minimumOrderAmount}`;
  }

  return "Available now";
}

export default function Checkout() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { totalAmount, cartItems, clearCart } = useCart();
  const { placeOrder, syncOrder } = useOrders();
  const subtotalAmount = totalAmount;
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMode: "COD",
    upiReference: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("Home");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [serviceSettings, setServiceSettings] = useState({
    freeDeliveryThreshold: "499",
    deliveryCharge: "40",
    serviceRadiusKm: "25",
    storeLocations: "",
    enabledPayments: "COD,UPI,RAZORPAY",
  });
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState("pending");
  const [coverageMessage, setCoverageMessage] = useState("");
  const [deliveryLocationMessage, setDeliveryLocationMessage] = useState("");
  const [capturingDeliveryLocation, setCapturingDeliveryLocation] = useState(false);
  const [showChooseLocation, setShowChooseLocation] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    razorpayEnabled: false,
    razorpayKeyId: "",
    businessName: "AK General Store",
    businessLogo: "",
    upiMerchantName: "AK General Store",
    upiId: "",
    deliveryBasePayoutAmount: "20",
    deliveryAdditionalPayoutAmount: "10",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponOffers, setCouponOffers] = useState([]);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const discountAmount = Number(appliedCoupon?.discountAmount || 0);
  const freeDeliveryThreshold = Number(serviceSettings.freeDeliveryThreshold || 499);
  const standardDeliveryCharge = Number(serviceSettings.deliveryCharge || 40);
  const deliveryFee =
    subtotalAmount === 0 || subtotalAmount >= freeDeliveryThreshold ? 0 : standardDeliveryCharge;
  const grandTotal = Math.max(0, subtotalAmount + deliveryFee - discountAmount);
  const serviceRadiusKm = Number(serviceSettings.serviceRadiusKm || 25);
  const parsedStores = parseStoreLocations(serviceSettings.storeLocations, serviceRadiusKm);
  const nearestStore = findNearestAvailableStore(deliveryCoordinates, parsedStores);
  const serviceUnavailable = locationStatus === "ready" && (!nearestStore || !nearestStore.available);
  const enabledPayments = String(serviceSettings.enabledPayments || "COD,UPI,RAZORPAY")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
  const upiPaymentLink = paymentConfig.upiId
    ? buildUpiPaymentLink({
        upiId: paymentConfig.upiId,
        merchantName: paymentConfig.upiMerchantName || paymentConfig.businessName,
        amount: grandTotal,
        note: "AK General Store Order Payment",
      })
    : "";
  const upiQrPreviewUrl = upiPaymentLink ? buildQrPreviewUrl(upiPaymentLink) : "";

  useEffect(() => {
    async function loadPaymentAndStoreMeta() {
      try {
        const [config, settings, liveCoupons] = await Promise.all([
          fetchPaymentConfig().catch(() => ({
            razorpayEnabled: false,
            razorpayKeyId: "",
            businessName: "AK General Store",
            businessLogo: "",
            upiMerchantName: "AK General Store",
            upiId: "",
            deliveryBasePayoutAmount: "20",
            deliveryAdditionalPayoutAmount: "10",
          })),
          fetchPublicStoreSettings().catch(() => ({
            freeDeliveryThreshold: "499",
            deliveryCharge: "40",
            serviceRadiusKm: "25",
            storeLocations: "",
            enabledPayments: "COD,UPI,RAZORPAY",
          })),
          fetchPublicCoupons().catch(() => []),
        ]);

        setPaymentConfig(config);
        setServiceSettings({
          freeDeliveryThreshold: settings.freeDeliveryThreshold || "499",
          deliveryCharge: settings.deliveryCharge || "40",
          serviceRadiusKm: settings.serviceRadiusKm || "25",
          storeLocations: settings.storeLocations || "",
          enabledPayments: settings.enabledPayments || "COD,UPI,RAZORPAY",
        });
        setCouponOffers(Array.isArray(liveCoupons) ? liveCoupons : []);
      } catch {
        setPaymentConfig({
          razorpayEnabled: false,
          razorpayKeyId: "",
          businessName: "AK General Store",
          businessLogo: "",
          upiMerchantName: "AK General Store",
          upiId: "",
          deliveryBasePayoutAmount: "20",
          deliveryAdditionalPayoutAmount: "10",
        });
        setServiceSettings({
          freeDeliveryThreshold: "499",
          deliveryCharge: "40",
          serviceRadiusKm: "25",
          storeLocations: "",
          enabledPayments: "COD,UPI,RAZORPAY",
        });
        setCouponOffers([]);
      }
    }

    loadPaymentAndStoreMeta();
  }, []);

  useEffect(() => {
    if (enabledPayments.includes(form.paymentMode)) {
      return;
    }

    const nextMode =
      ["COD", "UPI", "RAZORPAY"].find((mode) => enabledPayments.includes(mode)) || "COD";
    setForm((current) => ({ ...current, paymentMode: nextMode }));
  }, [enabledPayments, form.paymentMode]);

  useEffect(() => {
    if (!deliveryCoordinates?.latitude || !deliveryCoordinates?.longitude) {
      setLocationStatus("pending");
      setCoverageMessage(
        "Select a saved delivery address with a delivery location or attach one to check store coverage."
      );
      return;
    }

    setLocationStatus("ready");

    if (!parsedStores.length) {
      setCoverageMessage("Store coverage is being updated. Please try again shortly.");
      return;
    }

    if (nearestStore?.available) {
      setCoverageMessage(
        `${nearestStore.name} is available for your area. Approx distance: ${nearestStore.distanceKm.toFixed(1)} KM`
      );
      return;
    }

    setCoverageMessage(
      `Currently, no store is available within ${serviceRadiusKm} KM of your selected delivery address. We'll be available in your area soon 🚀`
    );
  }, [deliveryCoordinates, nearestStore, parsedStores.length, serviceRadiusKm]);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const addresses = await fetchAddresses();
        setSavedAddresses(addresses);

        if (!addresses.length) {
          return;
        }

        const preferredAddress = addresses.find((address) => address.defaultAddress) || addresses[0];
        setSelectedAddress(preferredAddress.fullName || "Saved Address");
        setSelectedAddressId(preferredAddress.id);
        setForm((current) => ({
          ...current,
          fullName: preferredAddress.fullName || current.fullName,
          phone: preferredAddress.phone || current.phone,
          address: preferredAddress.line2
            ? `${preferredAddress.line1}, ${preferredAddress.line2}`
            : preferredAddress.line1 || current.address,
          city: preferredAddress.city || current.city,
          pincode: preferredAddress.pincode || current.pincode,
        }));

        if (preferredAddress.latitude && preferredAddress.longitude) {
          setDeliveryCoordinates({
            latitude: Number(preferredAddress.latitude),
            longitude: Number(preferredAddress.longitude),
            label: buildAddressLabel(preferredAddress),
          });
          setDeliveryLocationMessage("Saved delivery location attached from your address book.");
        }
      } catch {
        setSavedAddresses([]);
      }
    }

    if (session?.role === "user") {
      loadAddresses();
    }
  }, [session?.role]);

  useEffect(() => {
    if (!appliedCoupon?.code) {
      return;
    }

    let cancelled = false;

    async function revalidateCoupon() {
      try {
        const response = await validateCouponCode(appliedCoupon.code, subtotalAmount);
        if (!cancelled) {
          setAppliedCoupon(response);
          setCouponMessage(response.message || "Coupon applied successfully.");
          setCouponError("");
        }
      } catch (validationError) {
        if (!cancelled) {
          setAppliedCoupon(null);
          setCouponError(validationError.message || "The applied coupon is no longer valid.");
          setCouponMessage("");
        }
      }
    }

    revalidateCoupon();

    return () => {
      cancelled = true;
    };
  }, [appliedCoupon?.code, subtotalAmount]);

  if (!cartItems.length) {
    return (
      <div className="page-shell">
        <TopBar />
        <Header />
        <main className="store-shell max-w-3xl py-12">
          <BackButton fallback="/cart" />
          <div className="soft-panel p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              Cart Empty
            </p>
            <h1 className="mt-4 text-4xl font-black text-slate-950">
              Add products before continuing to checkout.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Use Buy Now from the product page or add products to the cart first.
            </p>
            <Button variant="accent" className="mt-8" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponError("");
      const response = await validateCouponCode(couponCode.trim(), subtotalAmount);
      setAppliedCoupon(response);
      setCouponCode(response.code || couponCode.trim().toUpperCase());
      setCouponMessage(response.message || "Coupon applied successfully.");
    } catch (applyError) {
      setAppliedCoupon(null);
      setCouponMessage("");
      setCouponError(applyError.message || "Coupon could not be applied.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage("");
    setCouponError("");
    setCouponCode("");
  };

  const attachCurrentLocation = async () => {
    try {
      setCapturingDeliveryLocation(true);
      const coords = await getCurrentPosition();
      setDeliveryCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: selectedAddress || "Current delivery location",
      });
      setDeliveryLocationMessage("Current location attached for this delivery address.");
      setError("");
    } catch (locationError) {
      setError(locationError.message || "Current location could not be attached.");
    } finally {
      setCapturingDeliveryLocation(false);
    }
  };

  const selectSavedAddress = (addressItem) => {
    setSelectedAddressId(addressItem.id);
    setSelectedAddress(addressItem.fullName || "Saved Address");
    setForm((current) => ({
      ...current,
      fullName: addressItem.fullName || current.fullName,
      phone: addressItem.phone || current.phone,
      address: addressItem.line2
        ? `${addressItem.line1}, ${addressItem.line2}`
        : addressItem.line1 || current.address,
      city: addressItem.city || current.city,
      pincode: addressItem.pincode || current.pincode,
    }));

    if (addressItem.latitude && addressItem.longitude) {
      setDeliveryCoordinates({
        latitude: Number(addressItem.latitude),
        longitude: Number(addressItem.longitude),
        label: buildAddressLabel(addressItem),
      });
      setDeliveryLocationMessage("Saved address location attached for backend coverage validation.");
    } else {
      setDeliveryCoordinates(null);
      setDeliveryLocationMessage("");
    }
  };

  const finishOrderFlow = (order) => {
    syncOrder(order);
    clearCart();
    navigate("/order-success", {
      state: {
        order,
      },
    });
  };

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please complete all delivery address fields.");
      return;
    }

    if (locationStatus !== "ready") {
      setError("Please attach the selected delivery location to continue with checkout.");
      return;
    }

    if (!nearestStore?.available) {
      setError(
        `Currently, no store is available within ${serviceRadiusKm} KM of your selected delivery address. We'll be available in your area soon 🚀`
      );
      return;
    }

    if (!deliveryCoordinates?.latitude || !deliveryCoordinates?.longitude) {
      setError("Please attach the selected delivery location before placing the order.");
      return;
    }

    if (form.paymentMode === "UPI" && !form.upiReference.trim()) {
      setError("Enter the UPI reference after completing the payment from the QR or your UPI app.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const liveProducts = await fetchProducts();
      const orderItems = cartItems.map((item) => {
        const matchedProduct =
          liveProducts.find((product) => Number(product.id) === Number(item.product.id)) ||
          liveProducts.find((product) => product.slug === item.product.slug) ||
          liveProducts.find(
            (product) => product.name.toLowerCase() === item.product.name.toLowerCase()
          );

        if (!matchedProduct) {
          throw new Error(`${item.product.name} could not be matched with the backend catalog.`);
        }

        return {
          productId: matchedProduct.id,
          quantity: item.quantity,
        };
      });

      const response = await placeOrder({
        userId: Number(session?.userId || 1),
        addressId: selectedAddressId,
        deliveryAddress: `${form.fullName}, ${form.phone}, ${form.address}, ${form.city}, ${form.pincode}`,
        deliveryLatitude: deliveryCoordinates.latitude,
        deliveryLongitude: deliveryCoordinates.longitude,
        deliveryLocationLabel: deliveryCoordinates.label || "Delivery location pin",
        servingStoreName: nearestStore?.name || form.city,
        deliveryLocation: nearestStore?.name || form.city,
        couponCode: appliedCoupon?.code || null,
        subtotalAmount,
        deliveryFee,
        discountAmount,
        paymentMode: form.paymentMode,
        items: orderItems,
      });

      if (form.paymentMode === "RAZORPAY") {
        if (!paymentConfig.razorpayEnabled) {
          throw new Error("Razorpay is not configured yet. Add your Razorpay keys on the backend first.");
        }

        const scriptLoaded = await loadRazorpayCheckoutScript();
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error("Razorpay checkout could not be loaded. Please check your internet connection and try again.");
        }

        const razorpayOrder = await createRazorpayOrder(response.orderId);
        const checkout = new window.Razorpay({
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: razorpayOrder.businessName || paymentConfig.businessName,
          image: razorpayOrder.businessLogo || paymentConfig.businessLogo,
          description: `Order ${response.orderNumber}`,
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {
            name: form.fullName,
            email: session?.email || "",
            contact: form.phone,
          },
          theme: {
            color: "#facc15",
          },
          handler: async (paymentResult) => {
            try {
              const verifiedOrder = await verifyRazorpayPayment({
                orderId: response.orderId,
                razorpayOrderId: paymentResult.razorpay_order_id,
                razorpayPaymentId: paymentResult.razorpay_payment_id,
                razorpaySignature: paymentResult.razorpay_signature,
              });
              finishOrderFlow(verifiedOrder);
            } catch (verificationError) {
              setError(verificationError.message || "Payment verification failed.");
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: async () => {
              try {
                const failedOrder = await markRazorpayPaymentFailed(response.orderId);
                syncOrder(failedOrder);
              } catch {
                // Keep the pending order state if failure sync is unavailable.
              } finally {
                setSubmitting(false);
              }
            },
          },
        });

        checkout.on("payment.failed", async () => {
          try {
            const failedOrder = await markRazorpayPaymentFailed(response.orderId);
            syncOrder(failedOrder);
          } catch {
            // Keep the pending order state if failure sync is unavailable.
          }
          setError("Payment failed. You can try again from checkout.");
          setSubmitting(false);
        });

        checkout.open();
        return;
      }

      if (form.paymentMode === "UPI") {
        try {
          const paymentUpdatedOrder = await createManualPayment({
            orderId: response.orderId,
            amount: grandTotal,
            paymentMode: "UPI",
            referenceId: form.upiReference || undefined,
          });
          finishOrderFlow(paymentUpdatedOrder);
          return;
        } catch (manualPaymentError) {
          throw new Error(
            manualPaymentError.message || "UPI payment details could not be recorded."
          );
        }
      }

      finishOrderFlow(response);
    } catch (placeOrderError) {
      setError(placeOrderError.message || "The order could not be placed.");
    } finally {
      if (form.paymentMode !== "RAZORPAY") {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/cart" className="mb-5" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-6">
            <div className="soft-panel p-4 sm:p-6">
              <div
                className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                  serviceUnavailable
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : locationStatus !== "ready"
                      ? "border border-amber-200 bg-amber-50 text-amber-800"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                <span className="font-black text-slate-900">Delivery Coverage:</span>{" "}
                {coverageMessage}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Delivery Address</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select the address where you want the order delivered. Home, Office, or any saved address can have its own delivery location, and backend coverage is verified using that selected location.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/address-book")}
                  className="text-sm font-bold text-slate-800 underline-offset-4 hover:underline"
                >
                  Manage saved addresses
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {(savedAddresses.length ? savedAddresses : ["Home", "Office"]).map((addressItem) => {
                  const isSavedAddress = typeof addressItem === "object";
                  const addressType = isSavedAddress
                    ? formatAddressType(addressItem.addressType)
                    : addressItem;
                  const isActive = isSavedAddress
                    ? selectedAddressId === addressItem.id
                    : selectedAddress === addressType;

                  return (
                    <button
                      key={isSavedAddress ? addressItem.id : addressType}
                      type="button"
                      onClick={() => {
                        if (isSavedAddress) {
                          selectSavedAddress(addressItem);
                          return;
                        }

                        setSelectedAddress(addressType);
                        setSelectedAddressId(null);
                        setDeliveryCoordinates(null);
                        setDeliveryLocationMessage("");
                      }}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-yellow-400 bg-yellow-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="font-black text-slate-900">{addressType}</p>
                      {isSavedAddress ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            {addressItem.fullName}
                          </p>
                          {addressItem.defaultAddress ? (
                            <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                              Default
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {isSavedAddress ? addressItem.fullAddress : "Saved address option"}
                      </p>
                      {isSavedAddress && addressItem.latitude && addressItem.longitude ? (
                        <p className="mt-3 text-xs font-semibold text-emerald-700">
                          Delivery location saved for this address
                        </p>
                      ) : isSavedAddress ? (
                        <p className="mt-3 text-xs font-semibold text-amber-700">
                          Add a delivery location to enable backend area verification
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-900">Delivery location</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Use the selected delivery address location for backend area validation and navigation. If you are sending somewhere else, search and choose that exact spot.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Button
                    variant="secondary"
                    type="button"
                    className="w-full px-5 py-3 font-black"
                    onClick={attachCurrentLocation}
                  >
                    {capturingDeliveryLocation ? "Capturing..." : "Use My Current Location"}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full px-5 py-3 font-black"
                    onClick={() => setShowChooseLocation(true)}
                  >
                    Search Delivery Location
                  </Button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Coverage is checked using the selected delivery address location, not your temporary browsing location. Home, Office, and every other saved address can keep a different delivery location.
                </p>
                {deliveryCoordinates?.latitude && deliveryCoordinates?.longitude ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                    <p className="font-bold">Delivery location attached</p>
                    <p className="mt-1">
                      {deliveryCoordinates.label || "Selected delivery location"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                    Add a delivery location for this address to enable backend service-area validation.
                  </div>
                )}
                {deliveryLocationMessage ? (
                  <p className="mt-3 text-xs font-semibold text-slate-500">{deliveryLocationMessage}</p>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  className="store-input"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(event) => handleInputChange("fullName", event.target.value)}
                />
                <input
                  className="store-input"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(event) => handleInputChange("phone", event.target.value)}
                />
                <input
                  className="store-input md:col-span-2"
                  placeholder="Address Line"
                  value={form.address}
                  onChange={(event) => handleInputChange("address", event.target.value)}
                />
                <input
                  className="store-input"
                  placeholder="City"
                  value={form.city}
                  onChange={(event) => handleInputChange("city", event.target.value)}
                />
                <input
                  className="store-input"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(event) => handleInputChange("pincode", event.target.value)}
                />
              </div>
            </div>

            <div className="soft-panel p-4 sm:p-6">
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Payment Type</h2>
              <div className="mt-4 space-y-3">
                <label
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 ${
                    enabledPayments.includes("COD")
                      ? "border-slate-200"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMode === "COD"}
                    onChange={() => handleInputChange("paymentMode", "COD")}
                    disabled={!enabledPayments.includes("COD")}
                  />
                  Cash on Delivery
                </label>
                <label
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 ${
                    enabledPayments.includes("UPI")
                      ? "border-slate-200"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMode === "UPI"}
                    onChange={() => handleInputChange("paymentMode", "UPI")}
                    disabled={!enabledPayments.includes("UPI")}
                  />
                  UPI Manual
                </label>
                <label
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-4 ${
                    paymentConfig.razorpayEnabled && enabledPayments.includes("RAZORPAY")
                      ? "border-slate-200"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMode === "RAZORPAY"}
                    onChange={() => handleInputChange("paymentMode", "RAZORPAY")}
                    disabled={!paymentConfig.razorpayEnabled || !enabledPayments.includes("RAZORPAY")}
                  />
                  Razorpay Online Payment
                </label>
              </div>
              {form.paymentMode === "UPI" ? (
                <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                      {upiQrPreviewUrl ? (
                        <img
                          src={upiQrPreviewUrl}
                          alt="UPI payment QR"
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[194px] items-center justify-center rounded-xl bg-slate-100 px-4 text-center text-sm text-slate-500">
                          Add a valid store UPI ID in admin settings to generate the live payment QR.
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-950">Scan and pay via UPI</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Pay before dispatch, then enter the transaction reference so the backend marks the order as received.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">
                          {paymentConfig.upiMerchantName || paymentConfig.businessName}
                        </p>
                        <p className="mt-1">{paymentConfig.upiId || "UPI ID not configured"}</p>
                        <p className="mt-2 font-black text-slate-950">
                          Amount: {formatPrice(grandTotal)}
                        </p>
                      </div>
                      {upiPaymentLink ? (
                        <a
                          href={upiPaymentLink}
                          className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900"
                        >
                          Open UPI App
                        </a>
                      ) : null}
                      <input
                        className="store-input mt-4 w-full"
                        placeholder="Enter UPI reference number"
                        value={form.upiReference}
                        onChange={(event) => handleInputChange("upiReference", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              {form.paymentMode === "RAZORPAY" ? (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Secure online payment is processed through Razorpay. Your payment is verified on the backend before the order is marked as paid.
                </div>
              ) : null}
              {!paymentConfig.razorpayEnabled ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Razorpay is currently disabled on this server. Add Razorpay keys in backend configuration to enable live online payments.
                </div>
              ) : null}
              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="soft-panel h-fit p-4 sm:p-6">
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Order Summary</h2>
            <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="store-input w-full"
                  placeholder="Apply coupon code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                />
                <Button
                  variant="accent"
                  className="shrink-0 px-5 py-3 font-black"
                  onClick={handleApplyCoupon}
                  type="button"
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {couponOffers.length
                  ? "Live coupons from admin settings:"
                  : "Active coupons will appear here after admin adds them."}
              </p>
              {couponOffers.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {couponOffers.slice(0, 3).map((coupon) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => setCouponCode(String(coupon.code || "").toUpperCase())}
                      className="rounded-xl border border-dashed border-yellow-300 bg-white px-3 py-2 text-left text-xs text-slate-600 transition hover:border-yellow-400 hover:bg-yellow-50"
                    >
                      <span className="block font-black text-slate-900">{coupon.code}</span>
                      <span>{buildCouponHint(coupon)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {couponMessage ? (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {couponMessage}
                </div>
              ) : null}
              {couponError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {couponError}
                </div>
              ) : null}
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3 text-sm">
                  <div>
                    <p className="font-black text-slate-900">{appliedCoupon.code} applied</p>
                    <p className="text-slate-600">
                      You saved {formatPrice(Number(appliedCoupon.discountAmount || 0))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-black uppercase tracking-[0.15em] text-slate-700"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 text-slate-600">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className="font-semibold">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
              {appliedCoupon ? (
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon Discount</span>
                  <span className="font-semibold text-green-700">- {formatPrice(discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="font-black">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Button
              variant="accent"
              className="mt-6 w-full py-4 text-base font-black disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handlePlaceOrder}
              disabled={submitting || serviceUnavailable || locationStatus !== "ready"}
            >
              {submitting
                ? "Placing Order..."
                : serviceUnavailable || locationStatus !== "ready"
                  ? "Delivery Pin Required"
                  : "Place Order"}
            </Button>
          </aside>
        </div>
      </main>
      <Footer />
      <LocationPickerModal
        open={showChooseLocation}
        onClose={() => setShowChooseLocation(false)}
        title="Search Delivery Location"
        defaultLabel={deliveryCoordinates?.label || selectedAddress}
        onApply={(location) => {
          setDeliveryCoordinates({
            latitude: location.latitude,
            longitude: location.longitude,
            label: location.label || selectedAddress || "Chosen delivery location",
          });
          setDeliveryLocationMessage("Selected delivery location attached for this order.");
          setError("");
        }}
      />
    </div>
  );
}
