import { useEffect, useRef, MutableRefObject } from "react";

export function useSubscriptionTier({
  setCurrentTier,
  setSubscriptionExpiresAt,
}: {
  setCurrentTier: (tier: string) => void;
  setSubscriptionExpiresAt: (expires: string | null) => void;
}): MutableRefObject<boolean> {
  const tierInitialisedRef = useRef(false);

  useEffect(() => {
    function fetchTier() {
      if (!window.aivexWindow) return Promise.resolve();
      return window.aivexWindow.getSubscription().then((sub) => {
        if (sub?.tier) {
          setCurrentTier(sub.tier);
          setSubscriptionExpiresAt(sub.expires_at || null);
          tierInitialisedRef.current = true;
        }
      }).catch(() => {});
    }

    fetchTier();

    function onFocus() { fetchTier(); }
    window.addEventListener("focus", onFocus);

    const interval = setInterval(fetchTier, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [setCurrentTier, setSubscriptionExpiresAt]);

  return tierInitialisedRef;
}
