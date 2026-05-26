import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";
import { useProfile } from "../contexts/ProfileContext";
import { START_MESSAGES } from "../constants/startMessages";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function ChatMessages({ renderMarkdown }) {
  const { messages, isLoading, chatEndRef } = useChat();
  const { setSettingsOpen } = useSettings();
  const { setProfileMenu, setProfileCreatorOpen } = useProfile();
  const [startMessage] = useState(() => START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)]);
  const [cleared, setCleared] = useState(false);
  const prevLengthRef = useRef(messages.length);

  const hasOnlyStartMessages = messages.every((m) => START_MESSAGES.includes(m.text));
  const currentStart = messages.find((m) => START_MESSAGES.includes(m.text));
  const showStart = currentStart || (messages.length === 0 && !cleared ? { role: "ai", text: startMessage, time: "" } : null);

  useEffect(() => {
    const prev = prevLengthRef.current;
    prevLengthRef.current = messages.length;

    if (prev > 0 && messages.length === 0) {
      setCleared(true);
      const timer = setTimeout(() => setCleared(false), 260);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  return (
    <div
      onMouseDown={() => {
        setSettingsOpen(false);
        setProfileMenu(false);
        setProfileCreatorOpen(false);
      }}
      className="flex-1 overflow-y-auto p-5 pb-[220px] space-y-4 scrollbar-hide"
    >
      <AnimatePresence>
        {messages
          .filter((m) => !START_MESSAGES.includes(m.text))
          .map((item, index) => (
            <MessageBubble
              key={item.id || (item.text + index)}
              item={item}
              index={index}
              renderMarkdown={renderMarkdown}
            />
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {showStart && hasOnlyStartMessages && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center justify-center w-full pt-16"
          >
            <div className="text-center">
              <p className="text-sm text-white/20 leading-relaxed max-w-xs">
                {showStart.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && !messages.some((msg) => msg.type === "audio-status") && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-fit rounded-[28px] rounded-tl-md bg-white/10 border border-white/10 px-4 py-3"
          >
            <div className="flex items-center gap-3 text-sm text-white/60">
              <TypingDots />
              <span className="text-white/40">Aivex думает</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={chatEndRef} />
    </div>
  );
}

export default ChatMessages;
