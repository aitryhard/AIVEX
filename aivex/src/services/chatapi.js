import { API_URL } from "./config";
import { ENDPOINTS } from "./endpoints";

export async function sendChatRequest({
  text,
  profile,
  images,
  customPrompt,
  history,
  signal,
}) {
  const response = await fetch(`${API_URL}${ENDPOINTS.CHAT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      text,
      profile,
      images,
      custom_prompt: customPrompt,
      history,
    }),

    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}