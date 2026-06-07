import { useEffect, useState, RefObject } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useAutoClipboard({
  autoClipboard,
  messageInputRef,
  setClipboardImages,
}: {
  autoClipboard: boolean;
  messageInputRef: RefObject<HTMLTextAreaElement | null>;
  setClipboardImages: Dispatch<SetStateAction<string[]>>;
}) {
  const [lastClipboard, setLastClipboard] = useState("");
  const [lastClipboardImage, setLastClipboardImage] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!window.aivexWindow) return;
      if (!autoClipboard) return;

      try {
        const imageData = await window.aivexWindow.getClipboardImage();

        if (imageData && imageData !== lastClipboardImage) {
          setClipboardImages((prev) => [...prev, imageData]);
          setLastClipboardImage(imageData);
        }
      } catch (err) {
        console.error("Clipboard image error:", err);
      }

      try {
        const clipboardText = await window.aivexWindow.getClipboardText();

        if (
          clipboardText &&
          clipboardText.length > 0 &&
          clipboardText !== lastClipboard
        ) {
          if (messageInputRef.current && !messageInputRef.current.value.trim()) {
            messageInputRef.current.value = clipboardText;
          }
          setLastClipboard(clipboardText);
        }
      } catch (err) {
        console.error("Clipboard text error:", err);
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
