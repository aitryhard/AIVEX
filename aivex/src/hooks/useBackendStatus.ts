import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/backendApi";
import type { BackendRestartInfo } from "../types";

export function useBackendStatus() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [restartInfo, setRestartInfo] = useState<BackendRestartInfo | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const online = await checkBackendHealth();
        setBackendOnline(online);
        if (online) {
          setRestartInfo(null);
        }
      } catch {
        setBackendOnline(false);
      }
    }

    checkBackend();

    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.aivexWindow?.onBackendRestart) return;

    const handler = (_event: unknown, info: BackendRestartInfo) => {
      setRestartInfo(info);
    };

    const cleanup = window.aivexWindow.onBackendRestart(handler);

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return { backendOnline, restartInfo };
}
