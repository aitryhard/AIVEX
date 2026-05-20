import { useRef, useState } from "react";
import { START_MESSAGES } from "../constants/startMessages";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";
import { getTime } from "../utils/getTime";
import { buildCustomPrompt } from "../utils/buildCustomPrompt";
import { sendChatRequest } from "../services/chatApi";

export function useChatActions({
  activationStatus,
  isLoading,
  isTyping,
  setIsLoading,
  setIsTyping,
  messages,
  setMessages,
  messageInputRef,
  clipboardImages,
  setClipboardImages,
  customProfiles,
  profile,
}) {
  const abortControllerRef = useRef(null);
  const [copiedCode, setCopiedCode] = useState("");

  function cancelRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setIsTyping(false);
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  async function copyCode(code) {
    await navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  }

  async function sendMessage() {
    if (!activationStatus?.allowed) return;
    if (isLoading || isTyping) return;

    const userMessage = messageInputRef.current?.value.trim() || "";

    if (!userMessage && clipboardImages.length === 0) return;

    setIsTyping(false);

    const displayMessage = userMessage || "";

    setIsLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: displayMessage,
        time: getTime(),
        images: clipboardImages,
      },
    ]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsLoading(true);

    setClipboardImages([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const safeCustomProfiles = Array.isArray(customProfiles)
        ? customProfiles
        : [];

      const activeCustomProfile = safeCustomProfiles.find(
        (item) => item.name === profile,
      );

        const data = await sendChatRequest({
            text: userMessage,
            profile,
            images: clipboardImages,

            customPrompt: activeCustomProfile
                ? buildCustomPrompt(activeCustomProfile)
                : null,

            history: messages
                .filter((msg) => !START_MESSAGES.includes(msg.text))
                .map((msg) => ({
                role: msg.role === "ai" ? "assistant" : "user",
                content: msg.text,
                })),

            signal: controller.signal,
        });

      if (data.response.length > MAX_CHAT_RESPONSE_LENGTH) {
        const saveResult = await window.aivexWindow.saveTextFile(data.response);

        setIsLoading(false);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: saveResult?.saved
              ? `Ответ получился слишком большим, поэтому я сохранил его в текстовый файл:\n\n${saveResult.path}`
              : "Ответ получился слишком большим, но файл не был сохранён.",
            time: getTime(),
          },
        ]);

        setClipboardImages([]);
        return;
      }

        setIsLoading(false);

        await new Promise((resolve) => setTimeout(resolve, 900));

        setIsTyping(true);

        setMessages((prev) => [
        ...prev,
        {
            role: "ai",
            text: data.response,
            time: getTime(),
            animate: true,
        },
        ]);

      setClipboardImages([]);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Ошибка: ${error.message}`,
          time: getTime(),
        },
      ]);
    } finally {
      abortControllerRef.current = null;
    }
  }

  return {
    copiedCode,
    copyText,
    copyCode,
    sendMessage,
    cancelRequest,
  };
}