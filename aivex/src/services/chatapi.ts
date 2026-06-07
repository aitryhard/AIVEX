import { API_URL } from "./config";
import { ENDPOINTS } from "./endpoints";
import type { ChatResponse, Message, Profile } from "../types";

const TIER_MODEL: Record<string, string> = {
  free: "openai/gpt-4o-mini",
  pro: "openai/gpt-4o",
  premium: "openai/gpt-4o",
};

const responseCache = new Map<string, ChatResponse>();
const MAX_CACHE_SIZE = 50;

let deviceIdCache: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (window.aivexWindow?.getDeviceId) {
    if (!deviceIdCache) {
      deviceIdCache = await window.aivexWindow.getDeviceId();
    }
    return deviceIdCache;
  }
  return "";
}

export async function sendChatRequest({
  text,
  profile,
  images,
  customPrompt,
  history,
  signal,
  currentTier,
}: {
  text: string;
  profile: string;
  images?: string[];
  customPrompt?: string | null;
  history: { role: string; content: string }[];
  signal: AbortSignal;
  currentTier: string;
}): Promise<ChatResponse> {
  const model = TIER_MODEL[currentTier] || "openai/gpt-4o-mini";
  const device_id = await getDeviceId();

  const cacheKey = `${text}|${profile}|${(images || []).length}|${customPrompt || ""}|${JSON.stringify(history)}|${model}`;
  if (responseCache.has(cacheKey) && !images?.length) {
    return responseCache.get(cacheKey)!;
  }

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

  const data: ChatResponse = await response.json();

  if (data.error) {
    const errorMessages: Record<string, string> = {
      device_id_required: "Устройство не идентифицировано.",
      server_unreachable: "Сервер недоступен. Проверьте подключение к интернету.",
      server_timeout: "Сервер не отвечает. Попробуйте позже.",
      server_error: "Ошибка сервера. Попробуйте позже.",
      too_many_requests: "Слишком много запросов. Подождите немного.",
    };
    throw new Error(errorMessages[data.error] || data.error);
  }

  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(cacheKey, data);

  return data;
}
