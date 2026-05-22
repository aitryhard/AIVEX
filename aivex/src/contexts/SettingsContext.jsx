import { createContext, useContext } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children, value }) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);

  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");

  return ctx;
}
