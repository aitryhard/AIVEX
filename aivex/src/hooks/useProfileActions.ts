import { Dispatch, SetStateAction } from "react";
import { generateId } from "../utils/generateId";
import type { Profile } from "../types";

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
}: {
  profile: string;
  setProfile: (name: string) => void;
  customProfiles: Profile[];
  setCustomProfiles: Dispatch<SetStateAction<Profile[]>>;
  newProfile: { name: string; length: string; thinking: string; prompt: string };
  setNewProfile: Dispatch<SetStateAction<{ name: string; length: string; thinking: string; prompt: string }>>;
  setProfileCreatorOpen: Dispatch<SetStateAction<boolean>>;
  editingProfile: Profile | null;
  setEditingProfile: Dispatch<SetStateAction<Profile | null>>;
}) {
  function deleteCustomProfile(profileName: string) {
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

  function startEditProfile(profile: Profile) {
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

    const finalProfile: Profile = {
      id: generateId(),
      name: newProfile.name.trim() || `Профиль ${profileNumber}`,
      length: newProfile.length as "short" | "standard" | "detailed" || "standard",
      thinking: newProfile.thinking as "fast" | "standard" | "deep" || "standard",
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
    if (!editingProfile) return;

    const updated: Profile = {
      ...editingProfile,
      name: newProfile.name.trim() || editingProfile.name,
      length: newProfile.length as "short" | "standard" | "detailed" || "standard",
      thinking: newProfile.thinking as "fast" | "standard" | "deep" || "standard",
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
