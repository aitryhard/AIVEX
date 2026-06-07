import { createContext, useContext, ReactNode } from "react";
import type { SettingsContextValue } from "../types";

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children, value }: { children: ReactNode; value: SettingsContextValue }) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);

  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");

  return ctx;
}
