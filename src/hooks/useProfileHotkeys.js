import { useEffect } from "react";

export function useProfileHotkeys({
  profile,
  setProfile,
  customProfiles,
}) {
  useEffect(() => {
    function handleHotkeys(e) {
      if (!e.ctrlKey || !e.shiftKey) return;

      const profiles = [
        "Quick",
        "Tutor",
        "Detailed",
        "Code",
        ...customProfiles.map((item) => item.name),
      ];

      const currentIndex = profiles.indexOf(profile);

      if (e.key === "ArrowDown") {
        e.preventDefault();

        const nextIndex =
          currentIndex === profiles.length - 1 ? 0 : currentIndex + 1;

        setProfile(profiles[nextIndex]);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        const prevIndex =
          currentIndex <= 0 ? profiles.length - 1 : currentIndex - 1;

        setProfile(profiles[prevIndex]);
      }
    }

    window.addEventListener("keydown", handleHotkeys);

    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [profile, customProfiles, setProfile]);
}