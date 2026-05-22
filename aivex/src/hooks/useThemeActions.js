import { DEFAULT_UI_SETTINGS } from "../constants/defaultUiSettings";

export function useThemeActions({
  uiSettings,
  setUiSettings,
  customThemes,
  setCustomThemes,
  newThemeName,
  setNewThemeName,
  setThemeCreatorOpen,
  setSettingsOpen,
}) {
  function applyThemePreset(preset) {
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

    const finalTheme = {
      id: crypto.randomUUID(),
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

  function deleteCustomTheme(themeId) {
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