import { apiFetch } from "./api";

const SETTINGS_PATH = "/api/store/settings";
const BOOTSTRAP_CACHE_KEY = "__AK_STORE_BOOTSTRAP_CACHE__";
const CACHE_TTL_MS = 60 * 1000;

let settingsCache = null;
let settingsPromise = null;

function getBootstrappedSettings() {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window[BOOTSTRAP_CACHE_KEY]?.[SETTINGS_PATH];
  if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS) {
    return null;
  }

  return cached.payload?.data || null;
}

export async function fetchPublicStoreSettings() {
  const bootstrappedSettings = getBootstrappedSettings();
  if (bootstrappedSettings) {
    settingsCache = {
      data: bootstrappedSettings,
      savedAt: Date.now(),
    };
    return bootstrappedSettings;
  }

  if (settingsCache && Date.now() - settingsCache.savedAt <= CACHE_TTL_MS) {
    return settingsCache.data;
  }

  if (!settingsPromise) {
    settingsPromise = apiFetch(SETTINGS_PATH)
      .then((response) => {
        settingsCache = {
          data: response.data,
          savedAt: Date.now(),
        };
        return response.data;
      })
      .finally(() => {
        settingsPromise = null;
      });
  }

  return settingsPromise;
}
