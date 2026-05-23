import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";
import { useProfile } from "../contexts/ProfileContext";
import { START_MESSAGES } from "../constants/startMessages";

function getRandomStartMessage() {
  return START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)];
}

function ChatMessages({ renderMarkdown }) {
  const { messages, isLoading, chatEndRef } = useChat();
  const { setSettingsOpen } = useSettings();
  const { setProfileMenu, setProfileCreatorOpen } = useProfile();
  const [startMessage] = useState(() => getRandomStartMessage());
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
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-fit rounded-[28px] rounded-tl-md bg-white/10 border border-white/10 px-4 py-2"
          >
            <span className="text-sm italic text-white/60">{showStart.text}</span>
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
            className="w-fit rounded-[28px] rounded-tl-md bg-white/10 border border-white/10 px-4 py-2"
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
  );
}

export default ChatMessages;
