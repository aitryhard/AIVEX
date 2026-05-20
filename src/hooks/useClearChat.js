import { START_MESSAGES } from "../constants/startMessages";

export function useClearChat({
  messages,
  setMessages,
  messageInputRef,
  setClipboardImages,
  setOpenedImages,
  setSettingsOpen,
  setProfileMenu,
  getRandomStartMessage,
}) {
  function clearChat() {
    const hasRealMessages = messages.some(
      (msg) => !START_MESSAGES.includes(msg.text),
    );

    if (!hasRealMessages) return;

    setMessages([
      {
        role: "ai",
        text: getRandomStartMessage(),
        time: "",
      },
    ]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    setClipboardImages([]);
    setOpenedImages({});
    setSettingsOpen(false);
    setProfileMenu(false);
  }

  return clearChat;
}