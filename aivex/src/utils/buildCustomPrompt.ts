import type { Profile } from "../types"

export function buildCustomPrompt(profile: Profile): string {
  if (profile.prompt) {
    return profile.prompt;
  }

  const lengthRules: Record<string, string> = {
    short: "Отвечай максимально кратко — 1–3 предложения, без вступлений и заключений, сразу суть.",
    standard: "Отвечай сбалансированно: достаточно подробно для полного понимания, но без лишней воды.",
    detailed: "Отвечай развёрнуто: структурируй ответ, используй примеры, рассматривай тему с разных сторон.",
  };

  const thinkingRules: Record<string, string> = {
    fast: "Думай быстро, давай практичный ответ без глубокого анализа — скорость важнее глубины.",
    standard: "Думай стандартно, учитывай контекст и отвечай сбалансированно, без перегрузки деталями.",
    deep: "Думай глубоко, тщательно анализируй задачу, рассматривай различные аспекты и давай качественный аргументированный ответ.",
  };

  const styleGuide = profile.style
    ? `- стиль: ${profile.style};`
    : "- стиль: спокойный и профессиональный;";

  const lengthKey = profile.length ?? "standard";
  const thinkingKey = profile.thinking ?? "standard";

  return `
Ты Aivex в пользовательском профиле "${profile.name}".

Основные правила:
- ${lengthRules[lengthKey]}
- ${thinkingRules[thinkingKey]}
${styleGuide}
- не начинай ответ словами "Ответ:", "Пояснение:" или подобными шаблонными фразами;
- не здоровайся без причины, не используй вводные конструкции типа "итак", "вот", "как правило";
- если показываешь код — используй markdown-блок с указанием языка;
- отвечай на том же языке, на котором задан вопрос.
`.trim();
}
