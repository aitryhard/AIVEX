export function useClearChat({
  messages,
  setMessages,
  messageInputRef,
  setClipboardImages,
  setSettingsOpen,
  setProfileMenu,
  isTyping,
  isLoading,
}) {
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