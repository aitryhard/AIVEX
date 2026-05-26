import { useEffect, useState } from "react";

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
  } catch {}
}

export default function TypingText({
  text,
  copyCode,
  copiedCode,
  uiSettings,
  renderMarkdown,
  onComplete,
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");

    let index = 0;

    const interval = setInterval(() => {
      index += 12;

      setDisplayed(text.slice(0, index));

      window.dispatchEvent(new Event("aivex-scroll"));

      if (index >= text.length) {
        clearInterval(interval);

        if (onComplete) {
          onComplete();
          playDing();
        }
      }
    }, 45);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return renderMarkdown(
    displayed,
    copyCode,
    copiedCode,
    uiSettings
  );
}