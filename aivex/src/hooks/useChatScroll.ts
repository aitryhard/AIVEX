import { useEffect, RefObject } from "react";
import type { Message } from "../types";

export function useChatScroll({
  chatEndRef,
  messages,
  isLoading,
  isTyping,
}: {
  chatEndRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
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
