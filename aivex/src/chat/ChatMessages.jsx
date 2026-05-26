import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
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
  const { setSettingsOpen, setSubscriptionOpen } = useSettings();
  const { setProfileMenu, setProfileCreatorOpen } = useProfile();
  const [startMessage] = useState(() => START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)]);
  const [cleared, setCleared] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const prevLengthRef = useRef(messages.length);
  const observerRef = useRef(null);
  const scrollRef = useRef(null);

  const filtered = messages.filter((m) => !START_MESSAGES.includes(m.text));
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 50);
  }, []);

  const sliced = filtered.slice(-visibleCount);

  const visibleMessages = searchTerm
    ? sliced.filter((m) => m.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    : sliced;

  useEffect(() => {
    setVisibleCount(50);
  }, [messages.length]);

  useEffect(() => {
    if (!hasMore) return;
    const el = observerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: scrollRef.current, threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

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
        setSubscriptionOpen(false);
      }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {filtered.length > 6 && (
        <div className="flex items-center gap-2 px-4 pt-2 shrink-0">
          {searchOpen ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white/60 placeholder:text-white/20 outline-none"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/10"
              title="Поиск"
            >
              <Search size={13} />
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 pb-[220px] space-y-4 scrollbar-hide">
        <div ref={observerRef} className="h-0" />

      <AnimatePresence>
        {hasMore && <div className="text-center text-[10px] text-white/15 py-1">Прокрутите вверх для загрузки</div>}
      </AnimatePresence>

      <AnimatePresence>
        {visibleMessages.map((item, index) => (
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
    </div>
  );
}

export default ChatMessages;
