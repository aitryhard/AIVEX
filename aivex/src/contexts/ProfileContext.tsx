import { createContext, useContext, ReactNode } from "react";
import type { ProfileContextValue } from "../types";

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children, value }: { children: ReactNode; value: ProfileContextValue }) {
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);

  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");

  return ctx;
}
