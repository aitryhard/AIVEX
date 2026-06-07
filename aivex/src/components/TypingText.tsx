import { useEffect, useRef, useState } from "react";
import type { UiSettings } from "../types";

function playDing() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    o.type = "sine";
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.3);
  } catch { /* audio not supported */ }
}

function getChunkSize(textLength: number): number {
  if (textLength <= 200) return 1;
  if (textLength <= 800) return 2;
  if (textLength <= 2000) return 4;
  if (textLength <= 5000) return 8;
  return 16;
}

function getIntervalMs(textLength: number): number {
  if (textLength <= 200) return 30;
  if (textLength <= 800) return 28;
  if (textLength <= 2000) return 24;
  if (textLength <= 5000) return 20;
  return 16;
}

const MAX_ANIMATION_MS = 5000;

export default function TypingText({
  text,
  copyCode,
  copiedCode,
  uiSettings,
  renderMarkdown,
  onComplete,
}: {
  text: string;
  copyCode: (code: string) => void;
  copiedCode: string;
  uiSettings: UiSettings;
  renderMarkdown: (text: string, copyCode: (code: string) => void, copiedCode: string, uiSettings: UiSettings) => React.ReactElement;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed("");

    const len = text.length;
    const chunk = getChunkSize(len);
    const intervalMs = getIntervalMs(len);

    const estimatedMs = (len / chunk) * intervalMs;
    const speedup = estimatedMs > MAX_ANIMATION_MS ? estimatedMs / MAX_ANIMATION_MS : 1;

    const effectiveInterval = Math.max(8, Math.round(intervalMs / speedup));
    const effectiveChunk = Math.max(1, Math.round(chunk * speedup));

    let index = 0;

    const timer = setInterval(() => {
      index += effectiveChunk;

      setDisplayed(text.slice(0, index));

      window.dispatchEvent(new Event("aivex-scroll"));

      if (index >= len) {
        clearInterval(timer);
        onCompleteRef.current?.();
        playDing();
      }
    }, effectiveInterval);

    return () => clearInterval(timer);
  }, [text]);

  return renderMarkdown(
    displayed,
    copyCode,
    copiedCode,
    uiSettings,
  );
}
