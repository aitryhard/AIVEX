import { RefObject, Dispatch, SetStateAction } from "react";
import type { Message } from "../types";

export function useClearChat({
  messages,
  setMessages,
  messageInputRef,
  setClipboardImages,
  setSettingsOpen,
  setProfileMenu,
  isTyping,
  isLoading,
}: {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  messageInputRef: RefObject<HTMLTextAreaElement | null>;
  setClipboardImages: Dispatch<SetStateAction<string[]>>;
  setSettingsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setProfileMenu: (v: boolean | ((prev: boolean) => boolean)) => void;
  isTyping: boolean;
  isLoading: boolean;
}): () => void {
  function clearChat() {
    if (isTyping || isLoading) return;
    if (messages.length === 0) return;

    setMessages([]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    setClipboardImages([]);
    setSettingsOpen(false);
    setProfileMenu(false);
  }

  return clearChat;
}
