import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/backendApi";

export function useBackendStatus(activationStatus) {
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    if (!activationStatus?.allowed) {
      setBackendOnline(false);
      return;
    }

    async function checkBackend() {
      try {
        const online = await checkBackendHealth();

        setBackendOnline(online);
      } catch {
        setBackendOnline(false);
      }
    }

    checkBackend();

    const interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, [activationStatus]);

  return backendOnline;
}