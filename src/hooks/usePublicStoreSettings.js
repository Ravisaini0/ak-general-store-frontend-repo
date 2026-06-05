import { useEffect, useMemo, useState } from "react";
import { fetchPublicStoreSettings } from "../services/storeService";

const DEFAULT_SETTINGS = {
  freeDeliveryThreshold: "299",
  deliveryCharge: "40",
  supportPhone: "9483989109",
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
          freeDeliveryThreshold: response.freeDeliveryThreshold || DEFAULT_SETTINGS.freeDeliveryThreshold,
          deliveryCharge: response.deliveryCharge || DEFAULT_SETTINGS.deliveryCharge,
          supportPhone: response.supportPhone || DEFAULT_SETTINGS.supportPhone,
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
