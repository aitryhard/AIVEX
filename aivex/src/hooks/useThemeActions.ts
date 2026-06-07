import { useState, Dispatch, SetStateAction } from "react";
import { generateId } from "../utils/generateId";
import { DEFAULT_UI_SETTINGS } from "../constants/defaultUiSettings";
import type { UiSettings, ThemePreset } from "../types";

export function useThemeActions({
  uiSettings,
  setUiSettings,
  customThemes,
  setCustomThemes,
  newThemeName,
  setNewThemeName,
  setThemeCreatorOpen,
  setSettingsOpen,
}: {
  uiSettings: UiSettings;
  setUiSettings: Dispatch<SetStateAction<UiSettings>>;
  customThemes: ThemePreset[];
  setCustomThemes: Dispatch<SetStateAction<ThemePreset[]>>;
  newThemeName: string;
  setNewThemeName: Dispatch<SetStateAction<string>>;
  setThemeCreatorOpen: Dispatch<SetStateAction<boolean>>;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  function applyThemePreset(preset: ThemePreset) {
    setUiSettings((prev) => ({
      ...prev,
      opacity: preset.opacity,
      panelColor: preset.panelColor,
      aiColor: preset.aiColor,
      userColor: preset.userColor,
    }));
  }

  function createCustomTheme() {
    const themeNumber = customThemes.length + 1;

    const finalTheme: ThemePreset = {
      id: generateId(),
      name: newThemeName.trim() || `Стиль ${themeNumber}`,
      opacity: uiSettings.opacity,
      panelColor: uiSettings.panelColor,
      aiColor: uiSettings.aiColor,
      userColor: uiSettings.userColor,
    };

    setCustomThemes((prev) => [...prev, finalTheme]);
    setNewThemeName("");
    setThemeCreatorOpen(false);
    setSettingsOpen(true);
  }

  function deleteCustomTheme(themeId: string) {
    setCustomThemes((prev) => prev.filter((theme) => theme.id !== themeId));
  }

  function resetUiSettings() {
    setUiSettings(DEFAULT_UI_SETTINGS);
  }

  return {
    applyThemePreset,
    createCustomTheme,
    deleteCustomTheme,
    resetUiSettings,
  };
}
