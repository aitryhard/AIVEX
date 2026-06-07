import { useEffect, RefObject } from "react";

export function useWindowPanels({
  settingsRef,
  profileRef,
  setSettingsOpen,
  setProfileMenu,
}: {
  settingsRef: RefObject<HTMLDivElement | null>;
  profileRef: RefObject<HTMLDivElement | null>;
  setSettingsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setProfileMenu: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef, profileRef, setSettingsOpen, setProfileMenu]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      setSettingsOpen(false);
      setProfileMenu(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [setSettingsOpen, setProfileMenu]);
}
