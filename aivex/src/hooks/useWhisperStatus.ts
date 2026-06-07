import { useState, useEffect, useRef } from "react";
import { API_URL } from "../services/config";

interface WhisperStatus {
  whisperReady: boolean;
  whisperLoading: boolean;
  whisperFailed: boolean;
}

export function useWhisperStatus(): WhisperStatus {
  const [status, setStatus] = useState<WhisperStatus>({ whisperReady: false, whisperLoading: true, whisperFailed: false });

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function fetchStatus() {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${API_URL}/whisper-status`, {
          signal: controller.signal,
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setStatus({
            whisperReady: data.loaded,
            whisperLoading: data.loading,
            whisperFailed: !data.loaded && !data.loading,
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({ whisperReady: false, whisperLoading: false, whisperFailed: false });
        }
      } finally {
        clearTimeout(timer);
      }
    }

    retryTimer = setTimeout(fetchStatus, 2000);
    const interval = setInterval(fetchStatus, 15000);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      clearInterval(interval);
    };
  }, []);

  return status;
}
