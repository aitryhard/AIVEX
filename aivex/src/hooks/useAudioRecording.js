import { useRef, useState } from "react";
import { getTime } from "../utils/getTime";
import { generateFilename } from "../utils/generateFilename";
import { transcribeAudio } from "../services/audioApi";
import { MAX_CHAT_RESPONSE_LENGTH } from "../constants/chatLimits";

export function useAudioRecording({ setMessages, setIsLoading }) {
  const activeAudioStatusIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);

  async function startDesktopAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

    recorder.onstop = async () => {
    const audioStatusId = activeAudioStatusIdRef.current;

    const blob = new Blob(recordedChunksRef.current, {
        type: "audio/webm",
    });

    stream.getTracks().forEach((track) => track.stop());

    setMessages((prev) =>
        prev.map((msg) =>
        msg.id === audioStatusId
            ? {
                ...msg,
                text: "Aivex думает...",
            }
            : msg,
        ),
    );

    setIsLoading(true);

    try {
        const data = await transcribeAudio(blob);
        const transcribedText = data.text || "Не удалось распознать аудио.";

        if (transcribedText.length > MAX_CHAT_RESPONSE_LENGTH) {
          const fileName = generateFilename(transcribedText);
          const saveResult = await window.aivexWindow.saveTextFile(transcribedText, fileName);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === audioStatusId
                ? {
                    ...msg,
                    type: "normal",
                    text: saveResult?.saved ? "" : transcribedText,
                    file: saveResult?.saved
                      ? { path: saveResult.path, name: fileName + ".txt" }
                      : null,
                    time: getTime(),
                  }
                : msg,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === audioStatusId
                ? {
                    ...msg,
                    type: "normal",
                    text: transcribedText,
                    time: getTime(),
                  }
                : msg,
            ),
          );
        }
    } catch (error) {
        setMessages((prev) =>
        prev.map((msg) =>
            msg.id === audioStatusId
            ? {
                ...msg,
                type: "normal",
                text: `Ошибка распознавания аудио: ${error.message}`,
                time: getTime(),
                }
            : msg,
        ),
        );
    } finally {
        activeAudioStatusIdRef.current = null;
        setIsLoading(false);
        setIsRecording(false);
    }
    };

      mediaRecorderRef.current = recorder;
      recorder.start();

      const audioStatusId = crypto.randomUUID();

      activeAudioStatusIdRef.current = audioStatusId;

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "audio-status"),
        {
          id: audioStatusId,
          role: "ai",
          type: "audio-status",
          text: "Распознаю аудио...",
          time: getTime(),
        },
      ]);

      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  }

  function stopDesktopAudioRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
  }

  return {
    isRecording,
    startDesktopAudioRecording,
    stopDesktopAudioRecording,
  };
}