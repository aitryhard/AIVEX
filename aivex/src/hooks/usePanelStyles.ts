import { useMemo, CSSProperties } from "react";
import type { UiSettings } from "../types";

function hexToLuma(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function usePanelStyles(uiSettings: UiSettings) {
  return useMemo(() => {
    const opacityHex = Math.round((uiSettings.opacity / 100) * 255)
      .toString(16)
      .padStart(2, "0");

    const luma = hexToLuma(uiSettings.panelColor);
    const isDark = luma < 140;

    return {
      isDark,
      panelStyle: {
        backgroundColor: `${uiSettings.panelColor}${opacityHex}`,
      } as CSSProperties,

      aiBubbleStyle: {
        backgroundColor: `${uiSettings.aiColor}0d`,
        borderColor: `${uiSettings.aiColor}18`,
      } as CSSProperties,

      userBubbleStyle: {
        backgroundColor: `${uiSettings.userColor}22`,
        borderColor: `${uiSettings.userColor}30`,
      } as CSSProperties,

      panelAccentStyle: {
        backgroundColor: `${uiSettings.panelColor}F2`,
        borderColor: `${uiSettings.userColor}22`,
        boxShadow: `0 0 25px ${uiSettings.userColor}10`,
      } as CSSProperties,
    };
  }, [uiSettings]);
}
