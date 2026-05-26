import { useEffect } from "react";

export function useProfileHotkeys({
  profile,
  setProfile,
  customProfiles,
  currentTier,
}) {
  const freeProfiles = ["Quick", "Detailed"];

  useEffect(() => {
    function handleHotkeys(e) {
      if (!e.ctrlKey || !e.shiftKey) return;

      const allProfiles = [
        "Quick",
        "Tutor",
        "Detailed",
        "Code",
        ...customProfiles.map((item) => item.name),
      ];

      const profiles = currentTier === "free"
        ? allProfiles.filter((p) => freeProfiles.includes(p))
        : allProfiles;

      if (profiles.length === 0) return;

      const currentIndex = profiles.indexOf(profile);
      if (currentIndex === -1 && currentTier === "free") {
        setProfile(freeProfiles[0]);
        return;
      }

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