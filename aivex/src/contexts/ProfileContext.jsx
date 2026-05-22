import { createContext, useContext } from "react";

const ProfileContext = createContext(null);

export function ProfileProvider({ children, value }) {
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const ctx = useContext(ProfileContext);

  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");

  return ctx;
}
