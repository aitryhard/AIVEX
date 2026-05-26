export function useClearChat({
  messages,
  setMessages,
  messageInputRef,
  setClipboardImages,
  setSettingsOpen,
  setProfileMenu,
  isTyping,
}) {
  function clearChat() {
    if (isTyping) return;
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