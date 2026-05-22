import { useMemo } from "react";

export function usePanelStyles(uiSettings) {
  return useMemo(() => {
    const opacityHex = Math.round((uiSettings.opacity / 100) * 255)
      .toString(16)
      .padStart(2, "0");

    return {
      panelStyle: {
        backgroundColor: `${uiSettings.panelColor}${opacityHex}`,
      },

      aiBubbleStyle: {
        backgroundColor: `${uiSettings.aiColor}12`,
      },

      userBubbleStyle: {
        backgroundColor: `${uiSettings.userColor}26`,
      },

      panelAccentStyle: {
        backgroundColor: `${uiSettings.panelColor}F2`,
        borderColor: `${uiSettings.userColor}22`,
        boxShadow: `0 0 25px ${uiSettings.userColor}10`,
      },
    };
  }, [uiSettings]);
}