import { useEffect, useState } from "react";

export function useUpdater() {
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    if (!window.aivexWindow) return;

    const cleanupAvailable = window.aivexWindow.onUpdateAvailable(() => {
      setUpdateStatus("available");
    });

    const cleanupDownloaded = window.aivexWindow.onUpdateDownloaded(() => {
      setUpdateStatus("downloaded");
    });

    return () => {
      cleanupAvailable();
      cleanupDownloaded();
    };
  }, []);

  return updateStatus;
}