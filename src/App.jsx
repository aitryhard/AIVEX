import { useEffect, useRef, useState } from "react";
import { Minus, Square, X, Copy, Loader2, Check, SlidersHorizontal, LoaderCircle, ImagePlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { HexColorPicker } from "react-colorful";

function formatLanguageName(language) {
  const names = {
    js: "JavaScript",
    javascript: "JavaScript",
    jsx: "JSX",
    ts: "TypeScript",
    typescript: "TypeScript",
    tsx: "TSX",
    py: "Python",
    python: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    bash: "Bash",
    shell: "Shell",
  };

  return names[language?.toLowerCase()] || language;
}

function renderMarkdown(text, copyCode, copiedCode, uiSettings) {
  return (
    <ReactMarkdown
      components={{
        pre({ children }) {
          return <>{children}</>;
        },

        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (!inline && match) {
            const codeText = String(children).replace(/\n$/, "");

            return (
              <div
                className="my-4 overflow-hidden rounded-2xl border border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
                style={{
                  background: `${uiSettings.panelColor}88`,
                  borderColor: `${uiSettings.userColor}18`,
                }}
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-2.5 h-2.5 opacity-70 shrink-0 mt-[1px]">
                      <div className="absolute inset-0 border border-white/100 rotate-45 rounded-[1px]" />
                      <div className="absolute inset-[2px] bg-white/100 rotate-45 rounded-[1px]" />
                    </div>

                    <span className="text-[13px] text-white/90 font-semibold tracking-[0.02em] ml-1">
                      {formatLanguageName(match[1])}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(codeText)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10 transition"
                    title={copiedCode === codeText ? "Скопировано" : "Копировать"}
                  >
                    {copiedCode === codeText ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "14px 16px 16px",
                    background: "rgba(0,0,0,0.12)",
                    fontSize: "12px",
                    borderRadius: 0,
                  }}
                  codeTagProps={{
                    style: {
                      background: "rgba(0,0,0,0.12)",
                    },
                  }}
                  {...props}
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-white/90">
              {children}
            </code>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function TypingText({
  text,
  copyCode,
  copiedCode,
  uiSettings,
  onComplete,
}) { // ЭФФЕКТ ПЕЧАТАНИЯ ДЛЯ ОТВЕТОВ AI
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");

    let index = 0;

    const interval = setInterval(() => {
      index += 12;

      setDisplayed(text.slice(0, index));

      window.dispatchEvent(new Event("aivex-scroll"));

      if (index >= text.length) {
        clearInterval(interval);

        if (onComplete) {
          onComplete();
        }
      }
    }, 45);

    return () => clearInterval(interval);
  }, [text]);

  return renderMarkdown(
    displayed,
    copyCode,
    copiedCode,
    uiSettings
  );
}

function getRandomStartMessage() {
  return START_MESSAGES[
    Math.floor(Math.random() * START_MESSAGES.length)
  ];
}

const START_MESSAGES = [
  "Ожидаю запроса...",
  "Чем помочь?",
  "Готов к работе",
  "Введите сообщение...",
  "Можете отправить текст или изображение",
  "Жду ваш запрос",
  "Готов обработать данные",
];

const THEME_PRESETS = [
  {
    name: "Midnight",
    opacity: 45,
    panelColor: "#020617",
    aiColor: "#e2e8f0",
    userColor: "#3b82f6",
  },
  {
    name: "AMOLED",
    opacity: 78,
    panelColor: "#000000",
    aiColor: "#111827",
    userColor: "#22c55e",
  },
  {
    name: "Slime",
    opacity: 50,
    panelColor: "#052e16",
    aiColor: "#bbf7d0",
    userColor: "#84cc16",
  },
  {
    name: "Sakura",
    opacity: 42,
    panelColor: "#4a044e",
    aiColor: "#fbcfe8",
    userColor: "#f472b6",
  },
  {
    name: "Cherry",
    opacity: 55,
    panelColor: "#450a0a",
    aiColor: "#fecaca",
    userColor: "#ef4444",
  },
  {
    name: "Ocean",
    opacity: 48,
    panelColor: "#082f49",
    aiColor: "#bae6fd",
    userColor: "#06b6d4",
  },
  {
    name: "Violet",
    opacity: 52,
    panelColor: "#2e1065",
    aiColor: "#ddd6fe",
    userColor: "#8b5cf6",
  },
  {
    name: "Sunset",
    opacity: 50,
    panelColor: "#431407",
    aiColor: "#fed7aa",
    userColor: "#f97316",
  },
  {
    name: "Cyber",
    opacity: 55,
    panelColor: "#0f172a",
    aiColor: "#67e8f9",
    userColor: "#a855f7",
  },
];

function App() {

  // STATE //

  const [appVersion, setAppVersion] = useState("");

  const [updateStatus, setUpdateStatus] = useState(null);

  const [customProfiles, setCustomProfiles] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("aivex-custom-profiles")
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [customThemes, setCustomThemes] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("aivex-custom-themes")
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [themeCreatorOpen, setThemeCreatorOpen] = useState(false);

  const [newThemeName, setNewThemeName] = useState("");

  const [profileCreatorOpen, setProfileCreatorOpen] = useState(false);

  const [newProfile, setNewProfile] = useState({
    name: "",
    length: "standard",
    thinking: "standard",
  });

  const messageInputRef = useRef(null);

  const imageInputRef = useRef(null);

  const [showSplash, setShowSplash] = useState(true);

  const [activeColorTarget, setActiveColorTarget] = useState("panelColor");

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [uiSettings, setUiSettings] = useState(() => {
    return JSON.parse(localStorage.getItem("aivex-ui-settings")) || {
      opacity: 45,
      panelColor: "#000000",
      aiColor: "#ffffff",
      userColor: "#3b82f6",
    };
  });

  const [backendOnline, setBackendOnline] = useState(false); // СТАТУС БЭКЕНДА

  const [activationStatus, setActivationStatus] = useState(null); // СТАТУС АКТИВАЦИИ

  const [isDragging, setIsDragging] = useState(false); // ПЕРЕТАСКИВАНИЕ ФАЙЛОВ

  const [openedImages, setOpenedImages] = useState({}); // ОТКРЫТЫЕ ИЗОБРАЖЕНИЯ

  const [message, setMessage] = useState(""); // СОСТОЯНИЕ ПРИЛОЖЕНИЯ

  const [profile, setProfile] = useState(() => { // ПРОФИЛЬ
    return localStorage.getItem("aivex-profile") || "Tutor";
  });

  const [profileMenu, setProfileMenu] = useState(false); // МЕНЮ ПРОФИЛЕЙ

  const [theme, setTheme] = useState(() => { // ТЕМА
    return localStorage.getItem("aivex-theme") || "dark";
  });

  const [autoClipboard, setAutoClipboard] = useState(() => { // БУФЕР ОБМЕНА
    const saved = localStorage.getItem("aivex-auto-clipboard");
    return saved === null ? true : saved === "true";
  });

  const [lastClipboard, setLastClipboard] = useState(""); // ПОСЛЕДНИЙ БУФЕР

  const [lastClipboardImage, setLastClipboardImage] = useState(""); // ПОСЛЕДНЕЕ ИЗОБРАЖЕНИЕ В БУФЕРЕ

  const [messages, setMessages] = useState(() => [
    {
      role: "ai",
      text: getRandomStartMessage(),
      time: "",
    },
  ]);
  
  const [isTyping, setIsTyping] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // ЗАГРУЗКА
  const [copiedCode, setCopiedCode] = useState(""); // КОПИРОВАНИЕ КОДА
  const chatEndRef = useRef(null); // КОНЕЦ ЧАТА
  const abortControllerRef = useRef(null); // ОТМЕНА ЗАПРОСОВ
  const settingsRef = useRef(null); // НАСТРОЙКИ
  const profileRef = useRef(null); // ПРОФИЛЬ
  const [clipboardImages, setClipboardImages] = useState([]); // ИЗОБРАЖЕНИЕ ИЗ БУФЕРА

  function getTime() { // ВРЕМЯ СООБЩЕНИЯ
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // EFFECTS //

  useEffect(() => {
    if (!window.aivexWindow) return;

    window.aivexWindow
      .getVersion()
      .then(setAppVersion);
  }, []);

  useEffect(() => {
    if (!window.aivexWindow) return;

    async function checkActivation() {
      try {
        const result =
          await window.aivexWindow.getActivationStatus();

        setActivationStatus(result);
      } catch (err) {
        console.error("=== ACTIVATION ERROR ===");
        console.error(err);
        console.error("MESSAGE:", err?.message);
        console.error("STACK:", err?.stack);

        return {
          allowed: false,
          status: "server_error",
        };
      }
    }

    checkActivation();

    const interval = setInterval(checkActivation, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.aivexWindow) return;

    window.aivexWindow.onUpdateAvailable(() => {
      setUpdateStatus("available");
    });

    window.aivexWindow.onUpdateDownloaded(() => {
      setUpdateStatus("downloaded");
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "aivex-custom-themes",
      JSON.stringify(customThemes)
    );
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem(
      "aivex-custom-profiles",
      JSON.stringify(customProfiles)
    );
  }, [customProfiles]);

  useEffect(() => {
    if (!activationStatus?.allowed) {
      setBackendOnline(false);
      return;
    }

    async function checkBackend() {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");
        setBackendOnline(response.ok);
      } catch {
        setBackendOnline(false);
      }
    }

    checkBackend();

    const interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, [activationStatus]);

  useEffect(() => { // АВТОБУФЕР
    const interval = setInterval(async () => {
      if (!window.aivexWindow) return;
      if (!autoClipboard) return;

    const imageData = await window.aivexWindow.getClipboardImage();

    if (
      imageData &&
      imageData !== lastClipboardImage
    ) {
      setClipboardImages((prev) => [
        ...prev,
        imageData,
      ]);

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
  }, [autoClipboard, lastClipboard, lastClipboardImage]);

  useEffect(() => { // СОХРАНЕНИЕ ПРОФИЛЯ
    localStorage.setItem("aivex-profile", profile);
  }, [profile]);

  useEffect(() => { // СОХРАНЕНИЕ БУФЕРА
    localStorage.setItem("aivex-auto-clipboard", autoClipboard);
  }, [autoClipboard]);

  useEffect(() => { // АВТОСКРОЛЛ
    chatEndRef.current?.scrollIntoView({
      behavior: isTyping ? "auto" : "smooth",
    });
  }, [messages, isLoading, isTyping]);

  useEffect(() => { // СОХРАНЕНИЕ ТЕМЫ
    localStorage.setItem("aivex-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "aivex-ui-settings",
      JSON.stringify(uiSettings)
    );
  }, [uiSettings]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    function handleHotkeys(e) {
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setProfileMenu(false);
        return;
      }

      if (!e.ctrlKey || !e.shiftKey) return;

      const profiles = [
        "Quick",
        "Tutor",
        "Detailed",
        "Code",
        ...customProfiles.map((item) => item.name),
      ];

      const currentIndex = profiles.indexOf(profile);

      if (e.key === "ArrowDown") {
        e.preventDefault();

        const nextIndex =
          currentIndex === profiles.length - 1
            ? 0
            : currentIndex + 1;

        setProfile(profiles[nextIndex]);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        const prevIndex =
          currentIndex <= 0
            ? profiles.length - 1
            : currentIndex - 1;

        setProfile(profiles[prevIndex]);
      }
    }

    window.addEventListener("keydown", handleHotkeys);

    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [profile, customProfiles]);

  useEffect(() => {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1800);

      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
    function handleTypingScroll() {
      chatEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }

    window.addEventListener(
      "aivex-scroll",
      handleTypingScroll
    );

    return () => {
      window.removeEventListener(
        "aivex-scroll",
        handleTypingScroll
      );
    };
  }, []);

  // FUNCTIONS //

  function buildCustomPrompt(profile) {
    const lengthRules = {
      short: "Отвечай коротко и по делу.",
      standard: "Отвечай стандартно, понятно и без лишней воды.",
      detailed: "Отвечай подробно, структурированно и с примерами.",
    };

    const thinkingRules = {
      fast: "Думай быстро, давай практичный ответ без глубокого анализа.",
      standard: "Думай стандартно, учитывай контекст и отвечай сбалансированно.",
      deep: "Думай глубоко, анализируй задачу внимательно и давай качественный ответ.",
    };

    return `
  Ты Aivex в пользовательском профиле "${profile.name}".

  Правила:
  - ${lengthRules[profile.length]}
  - ${thinkingRules[profile.thinking]}
  - не начинай ответ словами "Ответ:" или "Пояснение:";
  - не здоровайся без причины;
  - отвечай спокойно и профессионально.
  `;
  }

  function deleteCustomProfile(profileName) {
    const currentProfiles = Array.isArray(customProfiles)
      ? customProfiles
      : [];

    const updatedProfiles = currentProfiles.filter(
      (item) => item.name !== profileName
    );

    setCustomProfiles(updatedProfiles);

    if (profile === profileName) {
      if (updatedProfiles.length > 0) {
        setProfile(updatedProfiles[updatedProfiles.length - 1].name);
      } else {
        setProfile("Tutor");
      }
    }
  }

  function createCustomProfile() {
    const profileNumber = customProfiles.length + 1;

    const finalProfile = {
      id: crypto.randomUUID(),
      name: newProfile.name.trim() || `Профиль ${profileNumber}`,
      length: newProfile.length,
      thinking: newProfile.thinking,
    };

    setCustomProfiles((prev) => [...prev, finalProfile]);
    setProfile(finalProfile.name);
    setProfileCreatorOpen(false);

    setNewProfile({
      name: "",
      length: "standard",
      thinking: "standard",
    });
  }

  function cancelRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setIsTyping(false);
  }

  function applyThemePreset(preset) {
    setUiSettings((prev) => ({
      ...prev,
      opacity: preset.opacity,
      panelColor: preset.panelColor,
      aiColor: preset.aiColor,
      userColor: preset.userColor,
    }));
  }

  function createCustomTheme() {
    const themeNumber = customThemes.length + 1;

    const finalTheme = {
      id: crypto.randomUUID(),
      name: newThemeName.trim() || `Стиль ${themeNumber}`,
      opacity: uiSettings.opacity,
      panelColor: uiSettings.panelColor,
      aiColor: uiSettings.aiColor,
      userColor: uiSettings.userColor,
    };

    setCustomThemes((prev) => [...prev, finalTheme]);
    setNewThemeName("");
    setThemeCreatorOpen(false);
    setSettingsOpen(true);
  }

  function deleteCustomTheme(themeId) {
    setCustomThemes((prev) =>
      prev.filter((theme) => theme.id !== themeId)
    );
  }

  function resetUiSettings() {
    setUiSettings({
      opacity: 45,
      panelColor: "#000000",
      aiColor: "#ffffff",
      userColor: "#3b82f6",
    });
  }

  function clearChat() { // ОЧИСТКА ЧАТА
    const hasRealMessages = messages.some(
      (msg) => !START_MESSAGES.includes(msg.text)
    );

    if (!hasRealMessages) return;

    setMessages([
      {
        role: "ai",
        text: getRandomStartMessage(),
        time: "",
      },
    ]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    setMessage("");
    setClipboardImages([]);
    setOpenedImages({});
    setSettingsOpen(false);
    setProfileMenu(false);
  }

  async function copyText(text) { // КОПИРОВАНИЕ ТЕКСТА
    await navigator.clipboard.writeText(text);
  }

  async function sendMessage() { // ОТПРАВКА СООБЩЕНИЯ
    if (!activationStatus?.allowed) return;
    if (isLoading || isTyping) return;
    const userMessage = messageInputRef.current?.value.trim() || "";

    if (!userMessage && clipboardImages.length === 0) return;
    
    setIsTyping(false);

    const displayMessage = userMessage || "";

    setIsTyping(true);
    setIsLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: displayMessage,
        time: getTime(),
        images: clipboardImages,
      },
    ]);

    if (messageInputRef.current) {
      messageInputRef.current.value = "";
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsLoading(true);

    setClipboardImages([]);

    // FETCH //

  const controller = new AbortController();
  abortControllerRef.current = controller;

    try {
      const safeCustomProfiles = Array.isArray(customProfiles)
        ? customProfiles
        : [];

      const activeCustomProfile = safeCustomProfiles.find(
        (item) => item.name === profile
      );

      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            text: userMessage,
            profile: profile,
            images: clipboardImages,

            custom_prompt: activeCustomProfile
              ? buildCustomPrompt(activeCustomProfile)
              : null,

            history: messages
              .filter(
                (msg) =>
                  !START_MESSAGES.includes(msg.text)
              )
              .map((msg) => ({
                role:
                  msg.role === "ai"
                    ? "assistant"
                    : "user",

                content: msg.text,
              })),
          }),
          signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      const MAX_CHAT_RESPONSE_LENGTH = 8000;

      if (data.response.length > MAX_CHAT_RESPONSE_LENGTH) {
        const saveResult = await window.aivexWindow.saveTextFile(data.response);

        setIsLoading(false);
        setIsTyping(false);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: saveResult?.saved
              ? `Ответ получился слишком большим, поэтому я сохранил его в текстовый файл:\n\n${saveResult.path}`
              : "Ответ получился слишком большим, но файл не был сохранён.",
            time: getTime(),
          },
        ]);

        setClipboardImages([]);
        return;
      }

      setIsLoading(false);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setIsTyping(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.response,
          time: getTime(),
          animate: true,
        },
      ]);

      setClipboardImages([]);
    } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
      setMessages((prev) => [ // ОШИБКА ПРИ ПОДКЛЮЧЕНИИ К БЭКЕНДУ
        ...prev,
        {
          role: "ai",
          text: `Ошибка: ${error.message}`,
          time: getTime(),
        },
      ]);
    } finally {
      abortControllerRef.current = null; // СБРОС КОНТРОЛЛЕРА
    }
  }

  async function copyCode(code) { // КОПИРОВАНИЕ КОДА
    await navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  }

  const isLight = theme === "light"; // СВЕТЛАЯ ТЕМА

  const appBg = isLight // ФОН ОКНА
    ? "bg-white/70 border-black/10"
    : "bg-black/45 border-white/10";

  const textColor = isLight ? "text-black" : "text-white"; // ЦВЕТ ТЕКСТА

  const secondaryText = isLight ? "text-black/50" : "text-white/50"; // ВТОРИЧНЫЙ ТЕКСТ

  const headerBg = isLight ? "bg-white/40" : "bg-black/30"; // HEADER

  const footerBg = isLight ? "bg-white/40" : "bg-black/25"; // FOOTER

  const panelStyle = {
    backgroundColor: `${uiSettings.panelColor}${Math.round(
      (uiSettings.opacity / 100) * 255
    )
      .toString(16)
      .padStart(2, "0")}`,
  };

  const aiBubbleStyle = {
    backgroundColor: `${uiSettings.aiColor}12`,
  };

  const userBubbleStyle = {
    backgroundColor: `${uiSettings.userColor}26`,
  };

  const panelAccentStyle = {
    backgroundColor: `${uiSettings.panelColor}F2`,
    borderColor: `${uiSettings.userColor}22`,
    boxShadow: `0 0 25px ${uiSettings.userColor}10`,
  };

  if (activationStatus && !activationStatus.allowed) {
    return (
      <main className="w-screen h-screen bg-black text-white overflow-hidden">
        <div className="h-8 flex items-center justify-end px-4 pt-[2px] pb-[2px] border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable">
          <div className="flex items-center gap-2 no-drag">
            <button
              onClick={() => window.aivexWindow?.minimize()}
              className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Minus size={16} />
            </button>

            <button
              onClick={() => window.aivexWindow?.maximize()}
              className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Square size={13} />
            </button>

            <button
              onClick={() => window.aivexWindow?.close()}
              className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-red-300 hover:bg-red-500/15 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-32px)] flex items-center justify-center">
          <div className="w-[340px] rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8 text-center">
            <div className="text-3xl font-bold tracking-tight">
              Aivex
            </div>

            <div className="mt-6 text-white/80 text-sm">
              {activationStatus.status === "pending"
                ? "Ожидание активации..."
                : activationStatus.status === "denied"
                ? "Доступ отклонён"
                : "Ошибка подключения к серверу"}
            </div>

            <div className="mt-4 text-xs text-white/35">
              Приложение ожидает подтверждения устройства.
            </div>

            <div className="mt-7 flex justify-center">
              <LoaderCircle
                size={26}
                className="animate-spin text-white/50"
              />
            </div>

            <button
              onClick={() =>
                window.aivexWindow
                  ?.getActivationStatus()
                  .then(setActivationStatus)
              }
              className="mt-6 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/70 hover:bg-white/15 hover:text-white transition"
            >
              Проверить снова
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="w-screen h-screen bg-transparent text-white overflow-hidden"
      onDragOver={(e) => {
        e.preventDefault();

        const hasFiles = Array.from(e.dataTransfer.types).includes("Files");

        if (hasFiles) {
          setIsDragging(true);
        }
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        if (files.length === 0) return;

        files.forEach((file) => {
          if (!file.type.startsWith("image/")) return;

          const reader = new FileReader();

          reader.onload = () => {
            setClipboardImages((prev) => [
              ...prev,
              reader.result,
            ]);
          };

          reader.readAsDataURL(file);
        });
      }}
    >

      {isDragging && (
        <div className="absolute inset-0 z-[999] bg-black/40 backdrop-blur-md flex items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-3xl border border-white/10 bg-white/10 text-white/80 text-lg font-medium">
            Отпустите изображения
          </div>
        </div>
      )}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{
          opacity: showSplash ? 0 : 1,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }} style={panelStyle} className="relative w-screen h-screen rounded-[14px] border border-white/10 backdrop-blur-[80px] shadow-none flex flex-col overflow-hidden">
        <div className="h-8 flex items-center justify-end px-4 pt-[2px] pb-[2px] border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable">
          <div className="flex items-center gap-2 no-drag">
            <button
              onClick={() => window.aivexWindow?.minimize()}
              className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Minus size={16} />
            </button>

            <button
              onClick={() => window.aivexWindow?.maximize()}
              className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Square size={13} />
            </button>

            <button
              onClick={() => window.aivexWindow?.close()}
              className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-red-300 hover:bg-red-500/15 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <header
          onMouseDown={() => {
            setSettingsOpen(false);
            setProfileMenu(false);
            setProfileCreatorOpen(false);
          }}
          className="p-5 border-b border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center">
          <h1 className="text-[24px] leading-none tracking-tight font-['Space_Grotesk'] font-bold">
            Aivex
          </h1>

            <div
              className={
                backendOnline
                  ? "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"
                  : "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]"
              }
            />
          </div>

          <div className="flex items-center gap-2 leading-none">

            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                setSettingsOpen((prev) => !prev);
                setProfileMenu(false);
                setProfileCreatorOpen(false);
              }}
              className="no-drag w-9 h-9 rounded-2xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl flex items-center justify-center"
            >
              <SlidersHorizontal strokeWidth={1.8} size={15} />
            </button>

            <button
              onClick={clearChat}
              className="no-drag px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl"
            >
              Очистить
            </button>

            <div className="relative no-drag">
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setProfileMenu((prev) => !prev);
                  setSettingsOpen(false);
                  setProfileCreatorOpen(false);
                }}
                className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 transition backdrop-blur-xl"
              >
                {profile}
              </button>

              <AnimatePresence>
                {profileMenu && (
                  <motion.div
                    ref={profileRef}
                    style={panelAccentStyle}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-[#0f0f10]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {[
                      {
                        name: "Quick",
                        desc: "Короткие быстрые ответы",
                      },
                      {
                        name: "Tutor",
                        desc: "Объясняет как преподаватель",
                      },
                      {
                        name: "Detailed",
                        desc: "Подробные глубокие ответы",
                      },
                      {
                        name: "Code",
                        desc: "Помощь с программированием",
                      },
                        ...customProfiles.map((item) => ({
                        name: item.name,
                        desc: "Пользовательский профиль",
                      })),
                    ].map((item) => (
                      <div key={item.name} className="relative w-full">
                      <button
                        onClick={() => {
                          setProfile(item.name);
                          setProfileMenu(false);
                        }}
                        className={
                          profile === item.name
                            ? "w-full px-4 py-3 text-left bg-white/15 text-white"
                            : "w-full px-4 py-3 text-left text-white/70 hover:bg-white/10 hover:text-white transition"
                        }
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {item.name}
                          </div>

                          <div
                            className={
                              profile === item.name
                                ? "text-[11px] text-white/60 mt-1 leading-tight"
                                : "text-[11px] text-white/35 mt-1 leading-tight"
                            }
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>

                      {customProfiles.some((p) => p.name === item.name) && ( // КНОПКА УДАЛЕНИЯ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ ПРОФИЛЕЙ
                      <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}

                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();

                          deleteCustomProfile(item.name);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white/25 hover:text-red-300 hover:bg-red-500/10 transition flex items-center justify-center text-[14px] leading-none"
                      >
                        ×
                      </button>
                      )}
                    </div>
                    ))}
                    <button
                      onClick={() => {
                        setProfileMenu(false);
                        setProfileCreatorOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition border-t border-white/10"
                    >
                      + Создать профиль
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

      <AnimatePresence>
        {updateStatus && !showSplash && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[118px] left-1/2 -translate-x-1/2 z-[9999] rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl px-4 py-3 shadow-2xl flex items-center gap-3"
          >
            <span className="text-xs text-white/75">
              {updateStatus === "available"
                ? "Доступно обновление..."
                : "Обновление готово"}
            </span>

            {updateStatus === "downloaded" && (
              <button
                onClick={() => window.aivexWindow.installUpdate()}
                className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
              >
                Обновить
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div ref={settingsRef} initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.18, ease: "easeOut" }} style={panelAccentStyle} className="fixed top-[91px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl">
            <div>
              <h2 className="text-sm font-medium text-white/80">
                Графика
              </h2>

              <p className="text-xs text-white/55 mt-1">
                Настрой внешний вид панели и сообщений.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 max-h-[170px] overflow-y-auto pr-1">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyThemePreset(preset)}
                    className="h-[86px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
                  >
                    <div className="text-xs font-medium text-white">
                      {preset.name}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {[preset.panelColor, preset.aiColor, preset.userColor].map(
                        (color) => (
                          <span
                            key={color}
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                  </button>
                ))}

                {customThemes.map((theme) => (
                <div key={theme.id} className="group relative h-[86px]">
                  <button
                    onClick={() => applyThemePreset(theme)}
                    className="w-full h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
                  >
                      <div className="text-xs font-medium text-white pr-5">
                        {theme.name}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        {[theme.panelColor, theme.aiColor, theme.userColor].map(
                          (color) => (
                            <span
                              key={color}
                              className="w-4 h-4 rounded-full border border-white/10"
                              style={{ backgroundColor: color }}
                            />
                          )
                        )}
                      </div>
                    </button>

                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteCustomTheme(theme.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full text-white/0 hover:text-red-300 group-hover:text-white/25 hover:bg-red-500/10 transition flex items-center justify-center text-[14px] leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setSettingsOpen(false);
                    setProfileMenu(false);
                    setProfileCreatorOpen(false);
                    setThemeCreatorOpen(true);
                  }}
                  className="h-[86px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
                >
                  <div className="text-xs font-medium text-white">
                    + Свой
                  </div>

                  <div className="text-[11px] text-white/35 mt-2">
                    Сохранить стиль
                  </div>
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-white/100">
                Прозрачность панели: {uiSettings.opacity}%
              </span>

              <input
                type="range"
                min="15"
                max="90"
                value={uiSettings.opacity}
                onChange={(e) =>
                  setUiSettings((prev) => ({
                    ...prev,
                    opacity: Number(e.target.value),
                  }))
                }
                className="w-full mt-2 accent-white focus:outline-none"
              />
            </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["panelColor", "Панель"],
                    ["aiColor", "AI"],
                    ["userColor", "Пользователь"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveColorTarget(key)}
                      className={
                        activeColorTarget === key
                          ? "p-3 rounded-2xl border border-white/20 bg-white/10 text-left transition"
                          : "p-3 rounded-2xl border border-white/10 bg-white/[0.03] text-left transition hover:bg-white/[0.05]"
                      }
                    >
                      <div className="text-xs text-white/100 font-medium">{label}</div>

                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg border border-white/10"
                          style={{ backgroundColor: uiSettings[key] }}
                        />

                        <span className="text-xs text-white/35">
                          {uiSettings[key]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
                  <HexColorPicker
                    color={uiSettings[activeColorTarget]}
                    onChange={(color) =>
                      setUiSettings((prev) => ({
                        ...prev,
                        [activeColorTarget]: color,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={resetUiSettings}
                    className="mt-0 px-4 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] text-white/60 hover:text-white hover:bg-white/15 transition"
                  >
                    Сбросить
                  </button>
                </div>
                <div className="text-[11px] text-white/35 mt-4 text-center">
                  Aivex v{appVersion}
                </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {themeCreatorOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={panelAccentStyle}
            className="fixed top-[91px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-white/80">
                  Создать стиль
                </h2>

                <p className="text-xs text-white/55 mt-1">
                  Сохранит текущие цвета и прозрачность.
                </p>
              </div>

              <button
                onClick={() => setThemeCreatorOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition"
              >
                ×
              </button>
            </div>

            <input
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder={`Стиль ${customThemes.length + 1}`}
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/35"
            />

            <button
              onClick={createCustomTheme}
              className="w-full py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            >
              Создать
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileCreatorOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={panelAccentStyle}
            className="fixed top-[91px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-white/80">
                  Создать профиль
                </h2>

                <p className="text-xs text-white/55 mt-1">
                  Настрой стиль поведения Aivex.
                </p>
              </div>

              <button
                onClick={() => setProfileCreatorOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition"
              >
                ×
              </button>
            </div>

            <input
              value={newProfile.name}
              onChange={(e) =>
                setNewProfile((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder={`Профиль ${customProfiles.length + 1}`}
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/35"
            />

            <div>
              <div className="text-xs text-white/60 mb-2">
                Длина ответа
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["short", "Коротко"],
                  ["standard", "Стандартно"],
                  ["detailed", "Подробно"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setNewProfile((prev) => ({
                        ...prev,
                        length: key,
                      }))
                    }
                    className={
                      newProfile.length === key
                        ? "py-2 rounded-xl bg-white text-black text-xs"
                        : "py-2 rounded-xl bg-white/10 text-white/60 text-xs hover:bg-white/15"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60 mb-2">
                Глубина анализа
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["fast", "Быстро"],
                  ["standard", "Обычно"],
                  ["deep", "Глубоко"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setNewProfile((prev) => ({
                        ...prev,
                        thinking: key,
                      }))
                    }
                    className={
                      newProfile.thinking === key
                        ? "py-2 rounded-xl bg-white text-black text-xs"
                        : "py-2 rounded-xl bg-white/10 text-white/60 text-xs hover:bg-white/15"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={createCustomProfile}
              className="w-full py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            >
              Создать
            </button>
          </motion.div>
        )}
      </AnimatePresence>

        <div
          onMouseDown={() => {
            setSettingsOpen(false);
            setProfileMenu(false);
            setProfileCreatorOpen(false);
          }}
          className="flex-1 overflow-y-auto p-5 pb-[220px] space-y-4 scrollbar-hide"
        >
          <AnimatePresence>
            {messages.map((item, index) => (
              <div
                key={index}
                className={
                  item.role === "user"
                    ? "flex flex-row-reverse justify-start items-end gap-2"
                    : "flex items-end gap-2"
                }
              >
                <motion.div
                style={
                  item.role === "user"
                    ? userBubbleStyle
                    : aiBubbleStyle
                }
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={
                    item.role === "user"
                      ? "w-fit max-w-[82%] rounded-[20px] rounded-br-md border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "w-fit max-w-[88%] rounded-[20px] rounded-tl-md border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  }
                >
                <div className="text-sm leading-relaxed text-white/90 prose prose-invert break-words max-w-none">
                  {item.text &&
                    (START_MESSAGES.includes(item.text) ? (
                      <span className="italic text-white/60">
                        {item.text}
                      </span>
                    ) : item.animate ? (
                        <TypingText
                          onComplete={() => setIsTyping(false)}
                          text={item.text}
                          copyCode={copyCode}
                          copiedCode={copiedCode}
                          uiSettings={uiSettings}
                        />
                    ) : (
                      renderMarkdown(item.text, copyCode, copiedCode, uiSettings)
                  ))}

                  {item.images?.length > 0 && (
                    <div className={item.text ? "mt-3" : ""}>
                      <button
                        onClick={() =>
                          setOpenedImages((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }))
                        }
                        className="italic text-white/45 hover:text-white/80 transition"
                      >
                        {item.images.length === 1
                          ? "Изображение"
                          : `Изображения (${item.images.length})`}
                      </button>

                      {openedImages[index] && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {item.images.map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                            >
                              <img
                                src={image}
                                alt="Sent"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                  {item.role === "ai" &&
                    !START_MESSAGES.includes(item.text) && (
                    <button
                      onClick={() => copyText(item.text)}
                      className="mt-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10 transition"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </motion.div>

                {item.time && (
                  <div className="text-[10px] text-white/25 mb-1 shrink-0">
                    {item.time}
                  </div>
                )}
              </div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-fit rounded-2xl rounded-tl-md bg-white/10 border border-white/10 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Loader2 size={15} className="animate-spin" />
                  <span>Aivex думает...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        <footer className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none">
          <div className="pointer-events-auto rounded-[28px] border border-white/10 bg-black/35 backdrop-blur-3xl p-3 flex flex-col shadow-2xl">
            {clipboardImages.length > 0 && (
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                {clipboardImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                  >
                    <img
                      src={image}
                      alt="Clipboard"
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() =>
                        setClipboardImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white/70 hover:text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={messageInputRef}
              onPaste={(e) => {
                const items = Array.from(e.clipboardData.items);

                const imageItems = items.filter((item) =>
                  item.type.startsWith("image/")
                );

                if (imageItems.length === 0) return;

                imageItems.forEach((item) => {
                  const file = item.getAsFile();
                  const reader = new FileReader();

                  reader.onload = () => {
                    setClipboardImages((prev) => [
                      ...prev,
                      reader.result,
                    ]);
                  };

                  reader.readAsDataURL(file);
                });

                e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading && !isTyping) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Спросите Aivex"
              rows={3}
              className="w-full resize-none bg-transparent outline-none text-sm placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                files.forEach((file) => {
                  const reader = new FileReader();

                  reader.onload = () => {
                    setClipboardImages((prev) => [
                      ...prev,
                      reader.result,
                    ]);
                  };

                  reader.readAsDataURL(file);
                });

                e.target.value = "";
              }}
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition"
                >
                  <ImagePlus size={15} />
                </button>

                <button
                  onClick={() => setAutoClipboard(!autoClipboard)}
                  className={
                    autoClipboard
                      ? "text-xs text-emerald-300/80 hover:text-emerald-200 transition"
                      : "text-xs text-white/30 hover:text-white/60 transition"
                  }
                >
                  {autoClipboard ? "Буфер вкл." : "Буфер выкл."}
                </button>
              </div>
              <button
                onClick={() => {
                  if (isTyping && !isLoading) return;

                  if (isLoading) {
                    cancelRequest();
                  } else {
                    sendMessage();
                  }
                }}
                className={
                  isLoading
                    ? "px-5 py-2 rounded-2xl bg-red-500/80 text-white text-sm font-medium hover:bg-red-500 transition"
                    : isTyping
                    ? "px-5 py-2 rounded-2xl bg-white/50 text-white/25 text-sm font-medium"
                    : "px-5 py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                }
              >
                {isLoading ? "Отменить" : "Отправить"}
              </button>
            </div>
          </div>
        </footer>
      </motion.section>
        <AnimatePresence>
          {showSplash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-[99999] flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.92,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  y: -8,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="w-[180px] h-[180px] rounded-[32px] border border-white/10 bg-black/75 backdrop-blur-3xl shadow-2xl flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.04, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                  }}
                  className="text-[32px] tracking-tight font-['Space_Grotesk'] font-bold text-white"
                >
                  Aivex
                </motion.div>

                <div className="flex gap-1.5 mt-5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        y: [0, -4, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-white/75"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}

export default App;