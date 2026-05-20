import { useEffect, useState } from "react";

export function useUpdater() {
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    if (!window.aivexWindow) return;

    window.aivexWindow.onUpdateAvailable(() => {
      setUpdateStatus("available");
    });

    window.aivexWindow.onUpdateDownloaded(() => {
      setUpdateStatus("downloaded");
    });
  }, []);

  return updateStatus;
}