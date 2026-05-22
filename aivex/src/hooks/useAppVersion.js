import { useEffect, useState } from "react";

export function useAppVersion() {
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    if (!window.aivexWindow) return;

    window.aivexWindow.getVersion().then(setAppVersion).catch(() => {});
  }, []);

  return appVersion;
}