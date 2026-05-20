import { useEffect } from "react";

export function useChatScroll({
  chatEndRef,
  messages,
  isLoading,
  isTyping,
}) {
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: isTyping ? "auto" : "smooth",
    });
  }, [chatEndRef, messages, isLoading, isTyping]);

  useEffect(() => {
    function handleTypingScroll() {
      chatEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }

    window.addEventListener("aivex-scroll", handleTypingScroll);

    return () => {
      window.removeEventListener("aivex-scroll", handleTypingScroll);
    };
  }, [chatEndRef]);
}