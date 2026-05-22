import { useEffect, useState } from "react";

export function useActivation() {
  const [activationStatus, setActivationStatus] = useState(null);

  useEffect(() => {
    if (!window.aivexWindow) return;

    async function checkActivation() {
      try {
        const result = await window.aivexWindow.getActivationStatus();

        setActivationStatus(result);
      } catch {
        setActivationStatus({
          allowed: false,
          status: "server_error",
        });
      }
    }

    checkActivation();

    const interval = setInterval(checkActivation, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    activationStatus,
    setActivationStatus,
  };
}