import { createContext, useContext } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children, value }) {
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext);

  if (!ctx) throw new Error("useChat must be used within ChatProvider");

  return ctx;
}
