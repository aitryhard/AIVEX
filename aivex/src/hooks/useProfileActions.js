import { generateId } from "../utils/generateId";

export function useProfileActions({
  profile,
  setProfile,
  customProfiles,
  setCustomProfiles,
  newProfile,
  setNewProfile,
  setProfileCreatorOpen,
  editingProfile,
  setEditingProfile,
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

  function startEditProfile(profile) {
    setNewProfile({
      name: profile.name,
      length: profile.length || "standard",
      thinking: profile.thinking || "standard",
      prompt: profile.prompt || "",
    });
    setEditingProfile(profile);
    setProfileCreatorOpen(true);
  }

  function createCustomProfile() {
    const profileNumber = customProfiles.length + 1;

    const finalProfile = {
      id: generateId(),
      name: newProfile.name.trim() || `Профиль ${profileNumber}`,
      length: newProfile.length || "standard",
      thinking: newProfile.thinking || "standard",
      prompt: newProfile.prompt || "",
    };

    setCustomProfiles((prev) => [...prev, finalProfile]);
    setProfile(finalProfile.name);
    setProfileCreatorOpen(false);

    setNewProfile({
      name: "",
      length: "standard",
      thinking: "standard",
      prompt: "",
    });
  }

  function updateCustomProfile() {
    const updated = {
      ...editingProfile,
      name: newProfile.name.trim() || editingProfile.name,
      length: newProfile.length || "standard",
      thinking: newProfile.thinking || "standard",
      prompt: newProfile.prompt || "",
    };

    setCustomProfiles((prev) =>
      prev.map((p) => (p.id === editingProfile.id ? updated : p)),
    );

    if (profile === editingProfile.name) {
      setProfile(updated.name);
    }

    setProfileCreatorOpen(false);
    setEditingProfile(null);

    setNewProfile({
      name: "",
      length: "standard",
      thinking: "standard",
      prompt: "",
    });
  }

  function closeProfileCreator() {
    setProfileCreatorOpen(false);
    setEditingProfile(null);
    setNewProfile({
      name: "",
      length: "standard",
      thinking: "standard",
      prompt: "",
    });
  }

  return {
    deleteCustomProfile,
    createCustomProfile,
    updateCustomProfile,
    startEditProfile,
    closeProfileCreator,
  };
}
