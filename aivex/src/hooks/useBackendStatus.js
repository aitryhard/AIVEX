import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/backendApi";

export function useBackendStatus(activationStatus) {
  const [backendOnline, setBackendOnline] = useState(false);
  const [restartInfo, setRestartInfo] = useState(null);

  useEffect(() => {
    if (!activationStatus?.allowed) {
      setBackendOnline(false);
      return;
    }

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

    const interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, [activationStatus]);

  useEffect(() => {
    if (!window.aivexWindow?.onBackendRestart) return;

    const handler = (_event, info) => {
      setRestartInfo(info);
    };

    const cleanup = window.aivexWindow.onBackendRestart(handler);

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return { backendOnline, restartInfo };
}
