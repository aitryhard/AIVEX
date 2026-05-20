import { useEffect, useState } from "react";

export function useAutoClipboard({
  autoClipboard,
  messageInputRef,
  setClipboardImages,
}) {
  const [lastClipboard, setLastClipboard] = useState("");
  const [lastClipboardImage, setLastClipboardImage] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!window.aivexWindow) return;
      if (!autoClipboard) return;

      const imageData = await window.aivexWindow.getClipboardImage();

      if (imageData && imageData !== lastClipboardImage) {
        setClipboardImages((prev) => [...prev, imageData]);

        setLastClipboardImage(imageData);
      }

      const clipboardText = await window.aivexWindow.getClipboardText();

      if (
        clipboardText &&
        clipboardText.length > 0 &&
        clipboardText !== lastClipboard
      ) {
        if (messageInputRef.current) {
          messageInputRef.current.value = clipboardText;
        }

        setLastClipboard(clipboardText);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [
    autoClipboard,
    lastClipboard,
    lastClipboardImage,
    messageInputRef,
    setClipboardImages,
  ]);
}