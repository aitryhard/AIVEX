import { useEffect, useState } from "react";
import type { UpdateProgress } from "../types";

export function useUpdater() {
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null);

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
