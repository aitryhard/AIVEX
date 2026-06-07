import { useRef, useState, Dispatch, SetStateAction } from "react";
import { START_MESSAGES } from "../constants/startMessages";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";
import { getTime } from "../utils/getTime";
import { buildCustomPrompt } from "../utils/buildCustomPrompt";
import { generateFilename } from "../utils/generateFilename";
import { generateId } from "../utils/generateId";
import { sendChatRequest } from "../services/chatapi";
import type { Message, Profile, DailyCount } from "../types";

function getDailyCount(): DailyCount {
  const today = new Date().toISOString().slice(0, 10);
  const raw = localStorage.getItem("aivex_daily_count");
  if (!raw) return { date: today, count: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) return { date: today, count: 0 };
    return parsed;
  } catch {
    return { date: today, count: 0 };
  }
}

function setDailyCount(count: number) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem("aivex_daily_count", JSON.stringify({ date: today, count }));
}

function buildHistory(messages: Message[]) {
  return messages
    .filter((msg) => !START_MESSAGES.includes(msg.text))
    .map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));
}

const DAILY_FREE_LIMIT = 50;

export function useChatActions({
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
}: {
  isLoading: boolean;
  isTyping: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  clipboardImages: string[];
  setClipboardImages: Dispatch<SetStateAction<string[]>>;
  customProfiles: Profile[];
  profile: string;
  currentTier: string;
}) {
  const abortControllerRef = useRef<AbortController | null>(null);
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

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);

    setCopiedText(text);

    setTimeout(() => {
      setCopiedText("");
    }, 2000);
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  }

  async function sendMessage() {
    if (isLoading || isTyping || sendInProgressRef.current) return;
    sendInProgressRef.current = true;

    if (currentTier === "free") {
      const daily = getDailyCount();
      if (daily.count >= DAILY_FREE_LIMIT) {
        const resetTime = new Date();
        resetTime.setDate(resetTime.getDate() + 1);
        resetTime.setHours(0, 0, 0, 0);
        const resetStr = resetTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "ai",
            text: `Достигнут лимит ${DAILY_FREE_LIMIT} сообщений в день. Тариф заработает завтра в ${resetStr}.`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            profile: "System",
          },
        ]);
        sendInProgressRef.current = false;
        return;
      }
    }

    const userMessage = messageInputRef.current?.value.trim() || "";

    if (!userMessage && clipboardImages.length === 0) {
      sendInProgressRef.current = false;
      return;
    }

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
        history: buildHistory(messages),
        signal: controller.signal,
      });

      if (currentTier === "free") {
        const daily = getDailyCount();
        setDailyCount(Math.min(daily.count + 1, DAILY_FREE_LIMIT));
      }

      if (data.response.length > MAX_CHAT_RESPONSE_LENGTH) {
        const fileName = generateFilename(data.response);
        const saveResult = await window.aivexWindow?.saveTextFile(data.response, fileName);

        setIsLoading(false);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "ai",
            file: saveResult?.saved
              ? { path: saveResult.path!, name: fileName + ".txt" }
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
      if ((error as Error).name === "AbortError") {
        return;
      }

      if ((error as Error).message?.includes("Слишком много запросов") || (error as Error).message?.includes("too_many_requests")) {
        setDailyCount(DAILY_FREE_LIMIT);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "ai",
            text: `Достигнут лимит ${DAILY_FREE_LIMIT} сообщений в день. Тариф заработает завтра.`,
            time: getTime(),
          },
        ]);
        return;
      }

      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "ai",
          text: `Ошибка: ${(error as Error).message}`,
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
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
    freeMessagesLeft: DAILY_FREE_LIMIT - getDailyCount().count,
    freeMessagesLimit: DAILY_FREE_LIMIT,
  };
}
