import { API_URL } from "./config";
import { ENDPOINTS } from "./endpoints";

const TIER_MODEL = {
  free: "openai/gpt-4o-mini",
  pro: "openai/gpt-4o",
  premium: "openai/gpt-4o",
};

let deviceIdCache = null;

export function getDeviceId() {
  if (window.aivexWindow?.getDeviceId) {
    if (!deviceIdCache) {
      deviceIdCache = window.aivexWindow.getDeviceId();
    }
    return deviceIdCache;
  }
  return Promise.resolve("");
}

export async function sendChatRequest({
  text,
  profile,
  images,
  customPrompt,
  history,
  signal,
  currentTier,
}) {
  const model = TIER_MODEL[currentTier] || "openai/gpt-4o-mini";
  const device_id = await getDeviceId();

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
      model,
      device_id,
    }),

    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();

  if (data.error) {
    const errorMessages = {
      device_id_required: "Устройство не идентифицировано.",
      server_unreachable: "Сервер недоступен. Проверьте подключение к интернету.",
      server_timeout: "Сервер не отвечает. Попробуйте позже.",
      server_error: "Ошибка сервера. Попробуйте позже.",
      too_many_requests: "Слишком много запросов. Подождите немного.",
    };
    throw new Error(errorMessages[data.error] || data.error);
  }

  return data;
}