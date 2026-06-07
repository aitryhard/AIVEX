import { createContext, useContext, ReactNode } from "react";
import type { ChatContextValue } from "../types";

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children, value }: { children: ReactNode; value: ChatContextValue }) {
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);

  if (!ctx) throw new Error("useChat must be used within ChatProvider");

  return ctx;
}
