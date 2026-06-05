import { useEffect, useMemo, useState } from "react";
import { fetchPublicStoreSettings } from "../services/storeService";

const DEFAULT_SETTINGS = {
  storeName: "AK General Store",
  freeDeliveryThreshold: "299",
  deliveryCharge: "40",
  supportPhone: "9483989109",
  supportEmail: "support@akgeneralstore.com",
  upiMerchantName: "AK General Store",
  upiId: "",
  deliveryBasePayoutAmount: "20",
  deliveryAdditionalPayoutAmount: "10",
};

export function usePublicStoreSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetchPublicStoreSettings();
        if (cancelled) {
          return;
        }

        setSettings({
          storeName: response.storeName || DEFAULT_SETTINGS.storeName,
          freeDeliveryThreshold: response.freeDeliveryThreshold || DEFAULT_SETTINGS.freeDeliveryThreshold,
          deliveryCharge: response.deliveryCharge || DEFAULT_SETTINGS.deliveryCharge,
          supportPhone: response.supportPhone || DEFAULT_SETTINGS.supportPhone,
          supportEmail: response.supportEmail || DEFAULT_SETTINGS.supportEmail,
          upiMerchantName: response.upiMerchantName || DEFAULT_SETTINGS.upiMerchantName,
          upiId: response.upiId || DEFAULT_SETTINGS.upiId,
          deliveryBasePayoutAmount:
            response.deliveryBasePayoutAmount || DEFAULT_SETTINGS.deliveryBasePayoutAmount,
          deliveryAdditionalPayoutAmount:
            response.deliveryAdditionalPayoutAmount || DEFAULT_SETTINGS.deliveryAdditionalPayoutAmount,
        });
      } catch {
        if (!cancelled) {
          setSettings(DEFAULT_SETTINGS);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => settings, [settings]);
}
