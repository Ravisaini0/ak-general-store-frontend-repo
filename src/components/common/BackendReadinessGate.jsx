import { useEffect, useState } from "react";
import Loader from "./Loader";
import {
  startBackendHeartbeat,
  waitForBackendReadiness,
} from "../../services/backendReadinessService";

export default function BackendReadinessGate({ children }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState({
    currentLabel: "Backend",
    completed: 0,
    total: 4,
    attempt: 1,
    retrying: false,
    message: "Connecting to AK General Store...",
  });

  useEffect(() => {
    let cancelled = false;
    let stopHeartbeat = () => {};

    async function boot() {
      await waitForBackendReadiness({
        onProgress: (nextProgress) => {
          if (!cancelled) {
            setProgress(nextProgress);
          }
        },
      });

      if (cancelled) {
        return;
      }

      stopHeartbeat = startBackendHeartbeat();
      setReady(true);
    }

    boot();

    return () => {
      cancelled = true;
      stopHeartbeat();
    };
  }, []);

  if (!ready) {
    return <Loader progress={progress} />;
  }

  return children;
}
