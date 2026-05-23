import { useRef, useState, useCallback } from "react";
import { API_URL } from "../services/config";
import { getTime } from "../utils/getTime";

const CAPTURE_INTERVAL = 5000;

export function useScreenPeek({ setMessages }) {
  const [isActive, setIsActive] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);
  const abortRef = useRef(null);
  const messageIdRef = useRef(null);

  const analyzeFrame = useCallback(async (dataUrl) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsAnalyzing(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Проанализируй этот скриншот экрана.",
          profile: "Tutor",
          images: [dataUrl],
          model: "openai/gpt-4o",
          custom_prompt:
            "Ты видишь скриншот экрана пользователя. Определи, есть ли на экране вопрос, задание или упражнение. Если есть — ответь на него. Если нет — ответь ровно одним словом: __NO_TASK__. Не здоровайся, не добавляй лишнего.",
          history: [],
        }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const msg = `Ошибка ${res.status}: ${body || res.statusText}`;
        setError(msg);
        return;
      }

      const data = await res.json();
      if (controller.signal.aborted) return;

      const text = data.response;
      if (text === "__NO_TASK__") {
        setLastAnalysis("");
        return;
      }
      setLastAnalysis(text);
      setMessages((prev) => {
        const id = messageIdRef.current;
        if (id && prev.some((m) => m.id === id)) {
          return prev.map((m) =>
            m.id === id ? { ...m, text, time: getTime() } : m,
          );
        }
        const newId = crypto.randomUUID();
        messageIdRef.current = newId;
        return [
          ...prev,
          {
            id: newId,
            role: "ai",
            type: "screen-peek",
            text,
            time: getTime(),
          },
        ];
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("ScreenPeek analysis error:", err);
      setError((prev) => prev || err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [setMessages]);

  const captureAndAnalyze = useCallback(async () => {
    try {
      const dataUrl = await window.aivexWindow?.captureScreen();
      if (!dataUrl) return;
      analyzeFrame(dataUrl);
    } catch (err) {
      console.error("ScreenPeek capture error:", err);
    }
  }, [analyzeFrame]);

  const start = useCallback(async () => {
    if (isActive) return;

    try {
      const screenSize = await window.aivexWindow?.getScreenSize();
      const w = screenSize ? Math.round(screenSize.width * 0.75) : 800;
      const h = screenSize ? Math.round(screenSize.height * 0.85) : 600;
      await window.aivexWindow?.resizeWindow(w, h);
      document.body.classList.add("screen-peek-active");

      setIsActive(true);

      captureAndAnalyze();
      intervalRef.current = setInterval(captureAndAnalyze, CAPTURE_INTERVAL);
    } catch (err) {
      console.error("ScreenPeek start error:", err);
      document.body.classList.remove("screen-peek-active");
      await window.aivexWindow?.resetWindowSize();
    }
  }, [isActive, captureAndAnalyze]);

  const stop = useCallback(async () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
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

  return { isActive, lastAnalysis, isAnalyzing, error, start, stop };
}
