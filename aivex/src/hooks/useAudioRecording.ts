import { useRef, useState, Dispatch, SetStateAction } from "react";
import { getTime } from "../utils/getTime";
import { generateFilename } from "../utils/generateFilename";
import { generateId } from "../utils/generateId";
import { transcribeAudio } from "../services/audioApi";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";
import type { Message } from "../types";

export function useAudioRecording({
  setMessages,
  setIsLoading,
}: {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const activeAudioStatusIdRef = useRef<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);

  function addStatusMessage(text: string): string {
    const audioStatusId = generateId();
    activeAudioStatusIdRef.current = audioStatusId;
    setMessages((prev) => [
      ...prev.filter((msg) => msg.id !== "audio-status"),
      { id: audioStatusId, role: "ai", type: "audio-status", text, time: getTime() },
    ]);
    return audioStatusId;
  }

  async function handleTranscription(blob: Blob) {
    const audioStatusId = activeAudioStatusIdRef.current;
    setMessages((prev) => prev.map((m) => (m.id === audioStatusId ? { ...m, text: "Aivex думает..." } : m)));
    setIsLoading(true);
    try {
      const data = await transcribeAudio(blob) as { text?: string };
      const transcribedText = data.text || "Не удалось распознать аудио.";
      if (transcribedText.length > MAX_CHAT_RESPONSE_LENGTH) {
        const fileName = generateFilename(transcribedText);
        const saveResult = await window.aivexWindow?.saveTextFile(transcribedText, fileName);
        setMessages((prev) => prev.map((m) =>
          m.id === audioStatusId ? { ...m, type: "normal", text: saveResult?.saved ? "" : transcribedText, file: saveResult?.saved ? { path: saveResult.path!, name: fileName + ".txt" } : null, time: getTime() } : m));
      } else {
        setMessages((prev) => prev.map((m) =>
          m.id === audioStatusId ? { ...m, type: "normal", text: transcribedText, time: getTime() } : m));
      }
    } catch (error) {
      setMessages((prev) => prev.map((m) =>
        m.id === audioStatusId ? { ...m, type: "normal", text: `Ошибка распознавания: ${(error as Error).message}`, time: getTime() } : m));
    } finally {
      activeAudioStatusIdRef.current = null;
      setIsLoading(false);
      setIsRecording(false);
    }
  }

  async function startDesktopAudioRecording() {
    try {
      await window.aivexWindow?.startAudioCapture();
      addStatusMessage("Распознаю аудио...");
      setIsRecording(true);
    } catch (error) { console.error("Recording error:", error); }
  }

  async function stopDesktopAudioRecording() {
    const dataUrl = await window.aivexWindow?.stopAudioCapture();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    handleTranscription(blob);
  }

  return {
    isRecording,
    startDesktopAudioRecording,
    stopDesktopAudioRecording,
  };
}
