import { API_BASE_URL } from "./api";

const CORE_ENDPOINTS = [
  { key: "health", label: "Backend", path: "/api/health", timeoutMs: 20000 },
  { key: "settings", label: "Store settings", path: "/api/store/settings", timeoutMs: 25000 },
  { key: "categories", label: "Categories", path: "/api/categories", timeoutMs: 30000 },
  { key: "products", label: "Products", path: "/api/products/page?page=1&size=1", timeoutMs: 30000 },
];

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchJsonWithTimeout(path, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function checkBackendReadiness(onProgress) {
  const results = [];

  for (const endpoint of CORE_ENDPOINTS) {
    onProgress?.({
      currentLabel: endpoint.label,
      completed: results.length,
      total: CORE_ENDPOINTS.length,
    });

    const payload = await fetchJsonWithTimeout(endpoint.path, endpoint.timeoutMs);
    results.push({
      ...endpoint,
      payload,
    });
  }

  onProgress?.({
    currentLabel: "Store ready",
    completed: CORE_ENDPOINTS.length,
    total: CORE_ENDPOINTS.length,
  });

  return results;
}

export async function waitForBackendReadiness({ onProgress, retryDelayMs = 3500 } = {}) {
  let attempt = 0;

  while (true) {
    try {
      attempt += 1;
      return await checkBackendReadiness((progress) => {
        onProgress?.({
          ...progress,
          attempt,
          retrying: false,
        });
      });
    } catch (error) {
      onProgress?.({
        currentLabel: "Waking backend",
        completed: 0,
        total: CORE_ENDPOINTS.length,
        attempt,
        retrying: true,
        message:
          error.name === "AbortError"
            ? "Backend is taking longer than usual. Retrying..."
            : "Backend is starting. Retrying...",
      });
      await wait(retryDelayMs);
    }
  }
}

export function startBackendHeartbeat() {
  if (typeof window === "undefined") {
    return () => {};
  }

  let stopped = false;
  let running = false;

  const ping = async () => {
    if (stopped || running) {
      return;
    }

    running = true;
    try {
      await fetchJsonWithTimeout("/api/health", 10000);
    } catch {
      // The readiness gate handles user-visible recovery. Heartbeat should stay quiet.
    } finally {
      running = false;
    }
  };

  ping();
  const intervalId = window.setInterval(ping, 5 * 60 * 1000);

  return () => {
    stopped = true;
    window.clearInterval(intervalId);
  };
}
