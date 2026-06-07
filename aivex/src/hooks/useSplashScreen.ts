import { useEffect, useState } from "react";

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashMode, setSplashMode] = useState("startup");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return {
    showSplash,
    setShowSplash,
    splashMode,
    setSplashMode,
  };
}
