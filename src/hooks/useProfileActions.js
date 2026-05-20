export function useProfileActions({
  profile,
  setProfile,
  customProfiles,
  setCustomProfiles,
  newProfile,
  setNewProfile,
  setProfileCreatorOpen,
}) {
  function deleteCustomProfile(profileName) {
    const currentProfiles = Array.isArray(customProfiles) ? customProfiles : [];

    const updatedProfiles = currentProfiles.filter(
      (item) => item.name !== profileName,
    );

    setCustomProfiles(updatedProfiles);

    if (profile === profileName) {
      if (updatedProfiles.length > 0) {
        setProfile(updatedProfiles[updatedProfiles.length - 1].name);
      } else {
        setProfile("Tutor");
      }
    }
  }

  function createCustomProfile() {
    const profileNumber = customProfiles.length + 1;

    const finalProfile = {
      id: crypto.randomUUID(),
      name: newProfile.name.trim() || `Профиль ${profileNumber}`,
      length: newProfile.length,
      thinking: newProfile.thinking,
    };

    setCustomProfiles((prev) => [...prev, finalProfile]);
    setProfile(finalProfile.name);
    setProfileCreatorOpen(false);

    setNewProfile({
      name: "",
      length: "standard",
      thinking: "standard",
    });
  }

  return {
    deleteCustomProfile,
    createCustomProfile,
  };
}