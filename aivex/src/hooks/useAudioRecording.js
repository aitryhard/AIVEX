import { useRef, useState } from "react";
import { getTime } from "../utils/getTime";
import { generateFilename } from "../utils/generateFilename";
import { generateId } from "../utils/generateId";
import { transcribeAudio } from "../services/audioApi";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";

export function useAudioRecording({ setMessages, setIsLoading }) {
  const activeAudioStatusIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isMicRecording, setIsMicRecording] = useState(false);

  function addStatusMessage(text) {
    const audioStatusId = generateId();
    activeAudioStatusIdRef.current = audioStatusId;
    setMessages((prev) => [
      ...prev.filter((msg) => msg.id !== "audio-status"),
      { id: audioStatusId, role: "ai", type: "audio-status", text, time: getTime() },
    ]);
    return audioStatusId;
  }

  async function handleTranscription(blob, stream) {
    const audioStatusId = activeAudioStatusIdRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setMessages((prev) => prev.map((m) => (m.id === audioStatusId ? { ...m, text: "Aivex думает..." } : m)));
    setIsLoading(true);
    try {
      const data = await transcribeAudio(blob);
      const transcribedText = data.text || "Не удалось распознать аудио.";
      if (transcribedText.length > MAX_CHAT_RESPONSE_LENGTH) {
        const fileName = generateFilename(transcribedText);
        const saveResult = await window.aivexWindow.saveTextFile(transcribedText, fileName);
        setMessages((prev) => prev.map((m) =>
          m.id === audioStatusId ? { ...m, type: "normal", text: saveResult?.saved ? "" : transcribedText, file: saveResult?.saved ? { path: saveResult.path, name: fileName + ".txt" } : null, time: getTime() } : m));
      } else {
        setMessages((prev) => prev.map((m) =>
          m.id === audioStatusId ? { ...m, type: "normal", text: transcribedText, time: getTime() } : m));
      }
    } catch (error) {
      setMessages((prev) => prev.map((m) =>
        m.id === audioStatusId ? { ...m, type: "normal", text: `Ошибка распознавания: ${error.message}`, time: getTime() } : m));
    } finally {
      activeAudioStatusIdRef.current = null;
      setIsLoading(false);
      setIsRecording(false);
      setIsMicRecording(false);
    }
  }

  async function startDesktopAudioRecording() {
    try {
      if (window.__TAURI_INTERNALS__) {
        await window.aivexWindow.startAudioCapture();
        addStatusMessage("Распознаю аудио...");
        setIsRecording(true);
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
      recorder.onstop = () => handleTranscription(new Blob(recordedChunksRef.current, { type: "video/webm" }), stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      addStatusMessage("Распознаю аудио...");
      setIsRecording(true);
    } catch (error) { console.error("Recording error:", error); }
  }

  async function stopDesktopAudioRecording() {
    if (window.__TAURI_INTERNALS__) {
      const dataUrl = await window.aivexWindow.stopAudioCapture();
      const blob = await (await fetch(dataUrl)).blob();
      handleTranscription(blob, null);
      return;
    }
    if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); mediaRecorderRef.current = null; }
    setIsRecording(false);
  }

  async function startMicRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
      recorder.onstop = () => handleTranscription(new Blob(recordedChunksRef.current, { type: "audio/webm" }), stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      addStatusMessage("Распознаю речь...");
      setIsMicRecording(true);
    } catch (error) { console.error("Mic error:", error); }
  }

  function stopMicRecording() {
    if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); mediaRecorderRef.current = null; }
    setIsMicRecording(false);
  }

  return {
    isRecording,
    isMicRecording,
    startDesktopAudioRecording,
    stopDesktopAudioRecording,
    startMicRecording,
    stopMicRecording,
  };
}