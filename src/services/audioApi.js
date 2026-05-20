import { API_URL } from "./config";
import { ENDPOINTS } from "./endpoints";

export async function transcribeAudio(blob) {
  const formData = new FormData();

  formData.append("file", blob, "desktop-audio.webm");

  const response = await fetch(`${API_URL}${ENDPOINTS.TRANSCRIBE_AUDIO}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}