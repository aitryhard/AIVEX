import { useEffect, useState } from "react";

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