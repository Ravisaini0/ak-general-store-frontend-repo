import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Button from "../../components/common/Button";
import { fetchAdminSettings, updateAdminSettings } from "../../services/adminService";
import { parseStoreLocations, serializeStoreLocations } from "../../utils/storeCoverage";

const emptyShop = {
  name: "",
  latitude: "",
  longitude: "",
  radiusKm: "25",
  mapUrl: "",
};

export default function AdminSettings() {
  const [form, setForm] = useState({
    storeName: "",
    supportPhone: "",
    supportEmail: "",
    freeDeliveryThreshold: "",
    deliveryCharge: "",
    enabledPayments: "",
    serviceRadiusKm: "25",
    storeLocations: "",
    upiMerchantName: "",
    upiId: "",
    deliveryBasePayoutAmount: "20",
    deliveryAdditionalPayoutAmount: "10",
  });
  const [shops, setShops] = useState([]);
  const [shopForm, setShopForm] = useState(emptyShop);
  const [editingShopIndex, setEditingShopIndex] = useState(null);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchAdminSettings();
        const parsedShops = parseStoreLocations(
          settings.storeLocations || "",
          Number(settings.serviceRadiusKm || 25)
        );
        setForm(settings);
        setShops(parsedShops);
        setShopForm((current) => ({ ...current, radiusKm: settings.serviceRadiusKm || "25" }));
      } catch (loadError) {
        setError(loadError.message || "Settings could not be loaded.");
      }
    }

    loadSettings();
  }, []);

  const syncStoreLocations = (nextShops, nextRadius = form.serviceRadiusKm) => {
    setShops(nextShops);
    setForm((current) => ({
      ...current,
      storeLocations: serializeStoreLocations(nextShops, nextRadius),
    }));
  };

  const persistSettings = async (nextForm, successMessage) => {
    const payload = {
      ...nextForm,
      storeLocations: serializeStoreLocations(
        parseStoreLocations(nextForm.storeLocations || "", Number(nextForm.serviceRadiusKm || 25)),
        nextForm.serviceRadiusKm
      ),
    };

    const updated = await updateAdminSettings(payload);
    const parsedShops = parseStoreLocations(
      updated.storeLocations || "",
      Number(updated.serviceRadiusKm || 25)
    );
    setForm(updated);
    setShops(parsedShops);
    setSavedMessage(successMessage);
    setError("");
    return { updated, parsedShops };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await persistSettings(
        {
          ...form,
          storeLocations: serializeStoreLocations(shops, form.serviceRadiusKm),
        },
        "Store settings updated successfully."
      );
    } catch (saveError) {
      setError(saveError.message || "Settings could not be saved.");
    }
  };

  const handleSaveShop = async () => {
    if (!shopForm.name || !shopForm.latitude || !shopForm.longitude) {
      setError("Please enter shop name, latitude, and longitude.");
      return;
    }

    const nextShop = {
      name: shopForm.name.trim(),
      latitude: Number(shopForm.latitude),
      longitude: Number(shopForm.longitude),
      radiusKm: Number(shopForm.radiusKm || form.serviceRadiusKm || 25),
      mapUrl: shopForm.mapUrl.trim(),
    };

    if (!Number.isFinite(nextShop.latitude) || !Number.isFinite(nextShop.longitude)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    try {
      const nextShops = [...shops];
      if (editingShopIndex !== null) {
        nextShops[editingShopIndex] = nextShop;
      } else {
        nextShops.push(nextShop);
      }

      const nextForm = {
        ...form,
        storeLocations: serializeStoreLocations(nextShops, form.serviceRadiusKm),
      };

      await persistSettings(
        nextForm,
        editingShopIndex !== null
          ? "Shop updated successfully."
          : "Shop added successfully."
      );
      setShopForm({ ...emptyShop, radiusKm: form.serviceRadiusKm || "25" });
      setEditingShopIndex(null);
    } catch (saveError) {
      setError(saveError.message || "Shop changes could not be saved.");
    }
  };

  const handleEditShop = (shop, index) => {
    setShopForm({
      name: shop.name || "",
      latitude: String(shop.latitude ?? ""),
      longitude: String(shop.longitude ?? ""),
      radiusKm: String(shop.radiusKm ?? form.serviceRadiusKm ?? "25"),
      mapUrl: shop.mapUrl || "",
    });
    setEditingShopIndex(index);
    setSavedMessage("");
    setError("");
  };

  const handleDeleteShop = async (index) => {
    try {
      const nextShops = shops.filter((_, shopIndex) => shopIndex !== index);
      const nextForm = {
        ...form,
        storeLocations: serializeStoreLocations(nextShops, form.serviceRadiusKm),
      };

      await persistSettings(nextForm, "Shop removed successfully.");
      if (editingShopIndex === index) {
        setShopForm({ ...emptyShop, radiusKm: form.serviceRadiusKm || "25" });
        setEditingShopIndex(null);
      }
    } catch (saveError) {
      setError(saveError.message || "Shop could not be removed.");
    }
  };

  return (
    <div className="admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="min-w-0 overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-soft sm:p-6">
          <h1 className="text-3xl font-black text-slate-950">Admin Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage store profile, live shop coverage, and delivery rules from one place.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {savedMessage ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {savedMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <section className="grid gap-4 md:grid-cols-2">
              <input
                className="store-input"
                placeholder="Store name"
                value={form.storeName}
                onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
              />
              <input
                className="store-input"
                placeholder="Support phone"
                value={form.supportPhone}
                onChange={(event) => setForm((current) => ({ ...current, supportPhone: event.target.value }))}
              />
              <input
                className="store-input md:col-span-2"
                placeholder="Support email"
                value={form.supportEmail}
                onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))}
              />
              <input
                className="store-input"
                placeholder="Free delivery threshold"
                value={form.freeDeliveryThreshold}
                onChange={(event) =>
                  setForm((current) => ({ ...current, freeDeliveryThreshold: event.target.value }))
                }
              />
              <input
                className="store-input"
                placeholder="Delivery charge"
                value={form.deliveryCharge}
                onChange={(event) => setForm((current) => ({ ...current, deliveryCharge: event.target.value }))}
              />
              <input
                className="store-input md:col-span-2"
                placeholder="Enabled payments (comma separated)"
                value={form.enabledPayments}
                onChange={(event) => setForm((current) => ({ ...current, enabledPayments: event.target.value }))}
              />
              <input
                className="store-input"
                placeholder="UPI merchant name"
                value={form.upiMerchantName}
                onChange={(event) => setForm((current) => ({ ...current, upiMerchantName: event.target.value }))}
              />
              <input
                className="store-input"
                placeholder="UPI ID"
                value={form.upiId}
                onChange={(event) => setForm((current) => ({ ...current, upiId: event.target.value }))}
              />
              <input
                className="store-input"
                placeholder="Primary delivery payout amount"
                value={form.deliveryBasePayoutAmount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, deliveryBasePayoutAmount: event.target.value }))
                }
              />
              <input
                className="store-input"
                placeholder="Additional same-route payout amount"
                value={form.deliveryAdditionalPayoutAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deliveryAdditionalPayoutAmount: event.target.value,
                  }))
                }
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Use fixed earnings for delivery routes: the first active order pays the primary amount, and every extra same-route order pays the additional amount.
              </div>
              <input
                className="store-input"
                placeholder="Default radius for new shops (KM)"
                value={form.serviceRadiusKm}
                onChange={(event) => {
                  const nextRadius = event.target.value;
                  setForm((current) => ({ ...current, serviceRadiusKm: nextRadius }));
                  syncStoreLocations(shops, nextRadius);
                  if (editingShopIndex === null) {
                    setShopForm((current) => ({ ...current, radiusKm: nextRadius }));
                  }
                }}
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Each shop can have its own radius. This default value is only used for new shops or shops without a custom radius.
              </div>
            </section>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Shop Locations
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Manage main branch and future shop coverage separately from general store settings.
              </p>
            </div>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Shop Coverage</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Add your main branch now and future branches later. Each shop can have its own radius and Google Maps link.
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                    {shops.length} shop{shops.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {shops.length ? (
                    shops.map((shop, index) => (
                      <div key={`${shop.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-lg font-black text-slate-950">{shop.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {shop.latitude}, {shop.longitude}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">Custom coverage radius: {shop.radiusKm} KM</p>
                            {shop.mapUrl ? (
                              <a
                                href={shop.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex text-sm font-bold text-blue-700 underline-offset-4 hover:underline"
                              >
                                Open branch map link
                              </a>
                            ) : null}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditShop(shop, index)}
                              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteShop(index)}
                              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                      No shop branches added yet. Add your main branch below to start live coverage checks.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-black text-slate-950">
                  {editingShopIndex !== null ? "Update Shop" : "Add Shop"}
                </h2>
                <div className="mt-4 grid gap-4">
                  <input
                    className="store-input"
                    placeholder="Shop name"
                    value={shopForm.name}
                    onChange={(event) => setShopForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <input
                    className="store-input"
                    placeholder="Latitude"
                    value={shopForm.latitude}
                    onChange={(event) =>
                      setShopForm((current) => ({ ...current, latitude: event.target.value }))
                    }
                  />
                  <input
                    className="store-input"
                    placeholder="Longitude"
                    value={shopForm.longitude}
                    onChange={(event) =>
                      setShopForm((current) => ({ ...current, longitude: event.target.value }))
                    }
                  />
                  <input
                    className="store-input"
                    placeholder="Custom radius in KM"
                    value={shopForm.radiusKm}
                    onChange={(event) => setShopForm((current) => ({ ...current, radiusKm: event.target.value }))}
                  />
                  <p className="-mt-1 text-xs leading-6 text-slate-500">
                    Example: keep main branch at <span className="font-bold text-slate-900">25 KM</span>, set a smaller branch to <span className="font-bold text-slate-900">10 KM</span>, or increase a high-capacity branch to <span className="font-bold text-slate-900">35 KM</span>.
                  </p>
                  <input
                    className="store-input"
                    placeholder="Google Maps link"
                    value={shopForm.mapUrl}
                    onChange={(event) => setShopForm((current) => ({ ...current, mapUrl: event.target.value }))}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button variant="accent" className="px-6 py-3 font-black" type="button" onClick={handleSaveShop}>
                      {editingShopIndex !== null ? "Update Shop" : "Add Shop"}
                    </Button>
                    {editingShopIndex !== null ? (
                      <Button
                        variant="ghost"
                        className="px-5 py-3 font-black"
                        type="button"
                        onClick={() => {
                          setEditingShopIndex(null);
                          setShopForm({ ...emptyShop, radiusKm: form.serviceRadiusKm || "25" });
                        }}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-900">Raw store payload</p>
              <p className="mt-1 text-xs text-slate-500">
                Stored automatically for backend coverage: Name|Latitude|Longitude|RadiusKM|GoogleMapsLink
              </p>
              <textarea
                className="store-input mt-3 min-h-[120px] w-full"
                value={form.storeLocations}
                onChange={(event) => {
                  const nextRaw = event.target.value;
                  setForm((current) => ({ ...current, storeLocations: nextRaw }));
                  setShops(parseStoreLocations(nextRaw, Number(form.serviceRadiusKm || 25)));
                }}
              />
            </div>

            <Button variant="accent" className="w-full py-4 font-black" type="submit">
              Save Settings
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
