import { useRef, useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";
import { API_URL } from "../services/config";
import { getTime } from "../utils/getTime";
import { generateId } from "../utils/generateId";
import { getDeviceId } from "../services/chatapi";
import { buildCustomPrompt } from "../utils/buildCustomPrompt";
import type { Message, Profile } from "../types";

const DEFAULT_INTERVAL = 10000;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SCREEN_PEEK_PROFILE = "Screen Peek";

function hashDataUrl(dataUrl?: string): string {
  return dataUrl ? dataUrl.slice(-200) : "";
}

function isBlankScreenshot(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(false); return; }
      ctx.drawImage(img, 0, 0, 32, 24);
      const imageData = ctx.getImageData(0, 0, 32, 24);
      let total = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        total += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      }
      const avg = total / (imageData.data.length / 4);
      resolve(avg < 15);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

function isNewTaskResponse(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    !lower.includes("__no_task__") &&
    !lower.includes("экран не изменился") &&
    !lower.includes("скриншот не изменился") &&
    !lower.includes("контент не изменился")
  );
}

const SYSTEM_PROMPT_BASE =
  "Ты видишь скриншот экрана пользователя. Определи, есть ли на экране вопрос, задание или упражнение. Если есть — ответь на него. Если контент на экране не изменился с предыдущего скриншота — ответь ровно одним словом: __NO_CHANGE__. Если контент изменился, но нового вопроса или задачи нет — ответь ровно одним словом: __NO_TASK__. Не здоровайся, не добавляй лишнего.";

export function useScreenPeek({
  setMessages,
  profile,
  customProfiles,
  screenPeekPrompt,
}: {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  profile: string;
  customProfiles: Profile[];
  screenPeekPrompt: string;
}) {
  const [isActive, setIsActive] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState("");
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messageIdRef = useRef<string | null>(null);
  const lastHashRef = useRef("");
  const analysisHistoryRef = useRef<string[]>([]);

  const sendAnalysisToChat = useCallback((text: string) => {
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: "ai",
        type: "screen-peek",
        text,
        time: getTime(),
      },
    ]);
  }, [setMessages]);

  const getActiveCustomProfile = useCallback((): Profile | null => {
    if (!Array.isArray(customProfiles)) return null;
    return customProfiles.find((p) => p.name === profile) || null;
  }, [customProfiles, profile]);

  const getScreenPeekPrompt = useCallback((): string => {
    if (screenPeekPrompt && screenPeekPrompt.trim()) return screenPeekPrompt;
    const custom = getActiveCustomProfile();
    if (custom?.prompt) return custom.prompt;
    if (custom) {
      const built = buildCustomPrompt(custom);
      if (built) return built + "\n\n" + SYSTEM_PROMPT_BASE;
    }
    return SYSTEM_PROMPT_BASE;
  }, [getActiveCustomProfile, screenPeekPrompt]);

  const analyzeFrame = useCallback(async (dataUrl: string, forceAnalyze: boolean) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsAnalyzing(true);
    setError("");

    const currentHash = hashDataUrl(dataUrl);

    if (!forceAnalyze && currentHash === lastHashRef.current) {
      setIsAnalyzing(false);
      return;
    }
    lastHashRef.current = currentHash;

    try {
      const device_id = await getDeviceId();
      const screenPeekPrompt = getScreenPeekPrompt();
      const history = analysisHistoryRef.current.slice(-6).map((msg) => ({
        role: "assistant",
        content: msg,
      }));

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Проанализируй этот скриншот экрана.",
          profile: profile || "Tutor",
          images: [dataUrl],
          model: "openai/gpt-4o",
          custom_prompt: screenPeekPrompt,
          history,
          device_id,
        }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setError(`Ошибка ${res.status}: ${body || res.statusText}`);
        return;
      }

      const data = await res.json();
      if (controller.signal.aborted) return;

      if (data.error) {
        setError(data.error);
        return;
      }

      const text = data.response;
      if (!isNewTaskResponse(text) || text === "__NO_CHANGE__") {
        setLastAnalysis("");
        return;
      }
      setLastAnalysis(text);
      analysisHistoryRef.current.push(text);
      setAnalysisHistory([...analysisHistoryRef.current]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("ScreenPeek analysis error:", err);
      setError((prev) => prev || (err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [getScreenPeekPrompt, profile]);

  const captureAndAnalyze = useCallback(async (forceAnalyze: boolean) => {
    try {
      const dataUrl = await window.aivexWindow?.captureScreen?.();
      if (!dataUrl) return;

      const blank = await isBlankScreenshot(dataUrl);
      if (blank) return;

      analyzeFrame(dataUrl, forceAnalyze);
    } catch (err) {
      console.error("ScreenPeek capture error:", err);
    }
  }, [analyzeFrame]);

  const start = useCallback(async () => {
    if (isActive) return;

    try {
      const screenSize = await window.aivexWindow?.getScreenSize?.();
      const w = screenSize ? Math.round(screenSize.width * 0.75) : 800;
      const h = screenSize ? Math.round(screenSize.height * 0.85) : 600;
      await window.aivexWindow?.resizeWindow(w, h);
      document.body.classList.add("screen-peek-active");

      analysisHistoryRef.current = [];
      lastHashRef.current = "";

      setIsActive(true);

      captureAndAnalyze(true);
      intervalRef.current = setInterval(() => captureAndAnalyze(false), DEFAULT_INTERVAL);
    } catch (err) {
      console.error("ScreenPeek start error:", err);
      document.body.classList.remove("screen-peek-active");
      await window.aivexWindow?.resetWindowSize();
    }
  }, [isActive, captureAndAnalyze]);

  const stop = useCallback(async () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    messageIdRef.current = null;
    setLastAnalysis("");
    setError("");
    document.body.classList.remove("screen-peek-active");
    await window.aivexWindow?.resetWindowSize();
  }, []);

  useEffect(() => {
    if (!window.aivexWindow?.onScreenPeekToggle) return;
    const cleanup = window.aivexWindow.onScreenPeekToggle(() => {
      if (isActive) {
        stop();
      } else {
        start();
      }
    });
    return cleanup;
  }, [isActive, start, stop]);

  return { isActive, lastAnalysis, analysisHistory, isAnalyzing, error, start, stop, sendAnalysisToChat };
}
