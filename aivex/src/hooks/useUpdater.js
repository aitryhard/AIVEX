import { useEffect, useState } from "react";

export function useUpdater() {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);

  useEffect(() => {
    if (!window.aivexWindow) return;

    const cleanupAvailable = window.aivexWindow.onUpdateAvailable(() => {
      setUpdateStatus("available");
    });

    const cleanupProgress = window.aivexWindow.onUpdateProgress((progress) => {
      setUpdateStatus("downloading");
      setDownloadProgress(progress);
    });

    const cleanupDownloaded = window.aivexWindow.onUpdateDownloaded(() => {
      setUpdateStatus("downloaded");
      setDownloadProgress(null);
    });

    return () => {
      cleanupAvailable();
      cleanupProgress();
      cleanupDownloaded();
    };
  }, []);

  return { updateStatus, downloadProgress };
}