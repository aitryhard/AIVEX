import { useEffect } from "react";

export function useWindowPanels({
  settingsRef,
  profileRef,
  setSettingsOpen,
  setProfileMenu,
}) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef, profileRef, setSettingsOpen, setProfileMenu]);

  useEffect(() => {
    function handleEscape(e) {
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