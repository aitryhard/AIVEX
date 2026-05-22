import { START_MESSAGES } from "../constants/startMessages";

export function useClearChat({
  messages,
  setMessages,
  messageInputRef,
  setClipboardImages,
  setSettingsOpen,
  setProfileMenu,
}) {
  function clearChat() {
    const hasRealMessages = messages.some(
      (msg) => !START_MESSAGES.includes(msg.text),
    );

    if (!hasRealMessages) return;

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