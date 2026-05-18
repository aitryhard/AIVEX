import { useEffect, useRef, useState } from "react";
import { Minus, Square, X, Copy, Loader2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function TypingText({ text }) { // ЭФФЕКТ ПЕЧАТАНИЯ ДЛЯ ОТВЕТОВ AI
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");

    let index = 0;

    const interval = setInterval(() => {
      index += 2;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [text]);

  return <ReactMarkdown>{displayed}</ReactMarkdown>;
}

function App() {

  // STATE //

  const [isDragging, setIsDragging] = useState(false);

  const [openedImages, setOpenedImages] = useState({}); // ОТКРЫТЫЕ ИЗОБРАЖЕНИЯ

  const [message, setMessage] = useState(""); // СОСТОЯНИЕ ПРИЛОЖЕНИЯ

  const [profile, setProfile] = useState(() => { // ПРОФИЛЬ
    return localStorage.getItem("aivex-profile") || "Tutor";
  });

  const [profileMenu, setProfileMenu] = useState(false); // МЕНЮ ПРОФИЛЕЙ

  const [theme, setTheme] = useState(() => { // ТЕМА
    return localStorage.getItem("aivex-theme") || "dark";
  });

  const [footerHeight, setFooterHeight] = useState(() => { // FOOTER
    return Number(localStorage.getItem("aivex-footer-height")) || 190;
  });

  const [autoClipboard, setAutoClipboard] = useState(() => { // БУФЕР ОБМЕНА
    const saved = localStorage.getItem("aivex-auto-clipboard");
    return saved === null ? true : saved === "true";
  });

  const [lastClipboard, setLastClipboard] = useState(""); // ПОСЛЕДНИЙ БУФЕР

  const [messages, setMessages] = useState([ // СПИСОК СООБЩЕНИЙ
    {
      role: "ai",
      text: "Ожидаю запроса...",
      time: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false); // ЗАГРУЗКА
  const [copiedCode, setCopiedCode] = useState(""); // КОПИРОВАНИЕ КОДА
  const chatEndRef = useRef(null); // КОНЕЦ ЧАТА
  const [clipboardImages, setClipboardImages] = useState([]); // ИЗОБРАЖЕНИЕ ИЗ БУФЕРА

  function getTime() { // ВРЕМЯ СООБЩЕНИЯ
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // USE EFFECTS //

  useEffect(() => { // АВТОБУФЕР
    const interval = setInterval(async () => {
      if (!window.aivexWindow) return;
      if (!autoClipboard) return;

      const imageData = await window.aivexWindow.getClipboardImage();

      if (
        imageData &&
        !clipboardImages.includes(imageData)
      ) {
        setClipboardImages((prev) => [
          ...prev,
          imageData,
        ]);
      }

      const clipboardText = await window.aivexWindow.getClipboardText();

      if (
        clipboardText &&
        clipboardText.length > 0 &&
        clipboardText !== lastClipboard
      ) {
        setMessage(clipboardText);
        setLastClipboard(clipboardText);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [autoClipboard, lastClipboard]);

  useEffect(() => { // СОХРАНЕНИЕ ПРОФИЛЯ
    localStorage.setItem("aivex-profile", profile);
  }, [profile]);

  useEffect(() => { // СОХРАНЕНИЕ FOOTER
    localStorage.setItem("aivex-footer-height", footerHeight);
  }, [footerHeight]);

  useEffect(() => { // СОХРАНЕНИЕ БУФЕРА
    localStorage.setItem("aivex-auto-clipboard", autoClipboard);
  }, [autoClipboard]);

  useEffect(() => { // АВТОСКРОЛЛ
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => { // СОХРАНЕНИЕ ТЕМЫ
    localStorage.setItem("aivex-theme", theme);
  }, [theme]);

  function startResizeFooter(e) { // ИЗМЕНЕНИЕ РАЗМЕРА
    e.preventDefault();

    const startY = e.clientY;
    const startHeight = footerHeight;

    function onMouseMove(moveEvent) { // ДВИЖЕНИЕ МЫШИ
      const diff = startY - moveEvent.clientY;
      const newHeight = Math.min(420, Math.max(150, startHeight + diff));

      setFooterHeight(newHeight);
    }

    function onMouseUp() { // ОСТАНОВКА РЕСАЙЗА
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function clearChat() { // ОЧИСТКА ЧАТА
    setMessages([
      {
        role: "ai",
        text: "Ожидаю запроса...",
        time: "",
      },
    ]);
  }

  async function copyText(text) { // КОПИРОВАНИЕ ТЕКСТА
    await navigator.clipboard.writeText(text);
  }

  async function sendMessage() { // ОТПРАВКА СООБЩЕНИЯ
    if (!message.trim() && clipboardImages.length === 0) return;

    const userMessage = message.trim();

    const displayMessage = userMessage || "";

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: displayMessage,
        time: getTime(),
        images: clipboardImages,
      },
    ]);

    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsLoading(true);

    setClipboardImages([]);

    // FETCH //

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userMessage,
          profile: profile,
          images: clipboardImages,
        }),
      });

      const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 900));

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
      setMessages((prev) => [ // ОШИБКА ПРИ ПОДКЛЮЧЕНИИ К БЭКЕНДУ
        ...prev,
        {
          role: "ai",
          text: "Ошибка подключения к AI backend. Проверь, запущен ли FastAPI.",
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false); // ОКОНЧАНИЕ ЗАГРУЗКИ
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

  return (
    <main
      className="w-screen h-screen bg-transparent text-white overflow-hidden"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

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
      <section className="w-screen h-screen rounded-[22px] border border-white/10 bg-black/45 backdrop-blur-[80px] shadow-none flex flex-col overflow-hidden">
        <div className="h-10 flex items-center justify-end px-4 border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable">
          <div className="flex items-center gap-2 no-drag">
            <button
              onClick={() => window.aivexWindow?.minimize()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Minus size={16} />
            </button>

            <button
              onClick={() => window.aivexWindow?.maximize()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <Square size={13} />
            </button>

            <button
              onClick={() => window.aivexWindow?.close()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <header className="p-5 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-wide">Aivex</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="no-drag px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl"
            >
              Clear
            </button>

            <div className="relative no-drag">
              <button
                onClick={() => setProfileMenu(!profileMenu)}
                className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 transition backdrop-blur-xl"
              >
                {profile}
              </button>

              {profileMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl overflow-hidden z-50">
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
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setProfile(item.name);
                        setProfileMenu(false);
                      }}
                      className={
                        profile === item.name
                          ? "w-full px-4 py-3 text-left bg-white/15 text-white border-l-2 border-white/70"
                          : "w-full px-4 py-3 text-left text-white/70 hover:bg-white/10 hover:text-white transition"
                      }
                    >
                      <div>
                        <div className="text-sm font-medium">{item.name}</div>

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
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={
                    item.role === "user"
                      ? "w-fit max-w-[85%] rounded-2xl rounded-br-md bg-blue-500/20 border border-blue-300/10 p-4"
                      : "w-fit max-w-[90%] rounded-2xl rounded-tl-md bg-white/10 border border-white/10 p-4"
                  }
                >
                <div className="text-sm leading-relaxed text-white/90 prose prose-invert break-words max-w-none">
                  {item.text &&
                    (item.animate ? (
                      <TypingText text={item.text} />
                    ) : (
                      <ReactMarkdown>{item.text}</ReactMarkdown>
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
                    item.text !== "Ожидаю запроса..." && (
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

        <footer
          style={{ height: `${footerHeight}px` }}
          className="relative p-5 border-t border-white/10 bg-black/25 backdrop-blur-2xl"
        >
          <div
            onMouseDown={startResizeFooter}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 cursor-ns-resize no-drag flex items-center justify-center"
          >
            <div className="w-10 h-1 rounded-full bg-white/20 hover:bg-white/40 transition" />
          </div>

          <div className="h-full rounded-2xl bg-black/30 border border-white/10 backdrop-blur-2xl p-3 flex flex-col">

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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Дополните запрос..."
              className="w-full flex-1 resize-none bg-transparent outline-none text-sm placeholder:text-white/30"
            />

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setAutoClipboard(!autoClipboard)}
                className={
                  autoClipboard
                    ? "text-xs text-emerald-300/80 hover:text-emerald-200 transition"
                    : "text-xs text-white/30 hover:text-white/60 transition"
                }
              >
                {autoClipboard ? "Clipboard on" : "Clipboard off"}
              </button>

              <button
                onClick={sendMessage}
                className="px-5 py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
              >
                Отправить
              </button>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default App;