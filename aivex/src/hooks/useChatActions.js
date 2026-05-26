import { useRef, useState } from "react";
import { START_MESSAGES } from "../constants/startMessages";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";
import { getTime } from "../utils/getTime";
import { buildCustomPrompt } from "../utils/buildCustomPrompt";
import { generateFilename } from "../utils/generateFilename";
import { generateId } from "../utils/generateId";
import { sendChatRequest } from "../services/chatapi";

function getDailyCount() {
  const today = new Date().toISOString().slice(0, 10);
  const raw = localStorage.getItem("aivex_daily_count");
  if (!raw) return { date: today, count: 0 };
  const parsed = JSON.parse(raw);
  if (parsed.date !== today) return { date: today, count: 0 };
  return parsed;
}

function setDailyCount(count) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem("aivex_daily_count", JSON.stringify({ date: today, count }));
}

const DAILY_FREE_LIMIT = 50;

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
  currentTier,
}) {
  const abortControllerRef = useRef(null);
  const sendInProgressRef = useRef(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [copiedText, setCopiedText] = useState("");

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

    setCopiedText(text);

    setTimeout(() => {
      setCopiedText("");
    }, 2000);
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
    if (isLoading || isTyping || sendInProgressRef.current) return;
    sendInProgressRef.current = true;

    if (currentTier === "free") {
      const daily = getDailyCount();
      if (daily.count >= DAILY_FREE_LIMIT) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "ai",
            text: `Достигнут лимит ${DAILY_FREE_LIMIT} сообщений в день на Free-тарифе.`,
            time: new Date().toLocaleTimeString(),
            profile: "System",
          },
        ]);
        return;
      }
      setDailyCount(daily.count + 1);
    }

    const userMessage = messageInputRef.current?.value.trim() || "";

    if (!userMessage && clipboardImages.length === 0) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsTyping(false);

    const displayMessage = userMessage || "";

    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "user",
        text: displayMessage,
        time: getTime(),
        profile: profile,
        images: clipboardImages,
      },
    ]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    setClipboardImages([]);

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (controller.signal.aborted) return;

    setIsLoading(true);

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
            currentTier,

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
        const fileName = generateFilename(data.response);
        const saveResult = await window.aivexWindow.saveTextFile(data.response, fileName);

        setIsLoading(false);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "ai",
            file: saveResult?.saved
              ? { path: saveResult.path, name: fileName + ".txt" }
              : null,
            text: saveResult?.saved
              ? ""
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
            id: generateId(),
            role: "ai",
            text: data.response,
            time: getTime(),
            profile: profile,
            animate: true,
        },
        ]);

      setClipboardImages([]);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "ai",
          text: `Ошибка: ${error.message}`,
          time: getTime(),
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      sendInProgressRef.current = false;
    }
  }

  return {
    copiedCode,
    copiedText,
    copyText,
    copyCode,
    sendMessage,
    cancelRequest,
  };
}