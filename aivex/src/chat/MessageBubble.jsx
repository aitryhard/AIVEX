import { Component, useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TypingText from "../components/TypingText";
import { START_MESSAGES } from "../constants/startMessages";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";

function MessageBubble({ item, index, renderMarkdown }) {
  const { copyText, copyCode, copiedCode, copiedText, setIsTyping } = useChat();
  const { uiSettings, userBubbleStyle, aiBubbleStyle } = useSettings();

  return (
    <ErrorBoundary item={item}>
      <MessageContent
        item={item}
        index={index}
        renderMarkdown={renderMarkdown}
        copyText={copyText}
        copyCode={copyCode}
        copiedCode={copiedCode}
        copiedText={copiedText}
        setIsTyping={setIsTyping}
        uiSettings={uiSettings}
        userBubbleStyle={userBubbleStyle}
        aiBubbleStyle={aiBubbleStyle}
      />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[MessageBubble error]", error, info.componentStack, "item:", this.props.item);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-xs text-red-400/60 px-4 py-2">
          Ошибка отображения сообщения
        </div>
      );
    }
    return this.props.children;
  }
}

function MessageContent({
  item, index, renderMarkdown,
  copyText, copyCode, copiedCode, copiedText, setIsTyping,
  uiSettings, userBubbleStyle, aiBubbleStyle,
}) {
  const [showAllImages, setShowAllImages] = useState(false);
  const images = item.images || [];
  const overflow = images.length > 3;
  const visibleImages = overflow && !showAllImages ? images.slice(0, 2) : images;
  const overflowCount = images.length - 2;
  const isUser = item.role === "user";
  const isStart = START_MESSAGES.includes(item.text);

  return (
    <div
      className={
        isUser
          ? "flex flex-row-reverse justify-start items-end gap-2"
          : "group flex items-end gap-2"
      }
    >
      <motion.div
        style={isUser ? userBubbleStyle : aiBubbleStyle}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={
          (isUser
            ? "relative w-fit max-w-[82%] rounded-[28px] rounded-br-md border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "relative w-fit max-w-[88%] rounded-[28px] rounded-tl-md border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        )}
        >
          <div className="markdown-content text-sm text-white/90 break-words [&_p]:!m-0 [&_p]:!leading-[18px] [&_span]:!leading-[18px]">
          {item.type === "audio-status" ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 size={15} className="animate-spin" />
              <span>{item.text}</span>
            </div>
          ) : (
            item.text && (isStart ? (
              <span className="italic text-white/60">{item.text}</span>
            ) : item.animate ? (
              <TypingText
                onComplete={() => setIsTyping(false)}
                text={item.text}
                copyCode={copyCode}
                copiedCode={copiedCode}
                uiSettings={uiSettings}
                renderMarkdown={renderMarkdown}
              />
            ) : (
              renderMarkdown(item.text, copyCode, copiedCode, uiSettings)
            ))
          )}

          {images.length > 0 && (
            <div className={"flex gap-2 flex-wrap" + (item.text ? " mt-3" : "")}>
              {visibleImages.map((image, imgIndex) => (
                <button
                  key={imgIndex}
                  onClick={() => window.aivexWindow?.openImage(image)}
                  className="img-hover-parent w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 bg-black/30 hover:border-white/25 transition cursor-pointer relative"
                >
                  <img
                    src={image}
                    alt="Sent"
                    className="w-full h-full object-cover"
                    onError={(e) => console.error("[IMG ERROR]", e.nativeEvent, "src starts with:", image?.slice(0, 50))}
                  />
                  <div className="img-hover-overlay absolute inset-0 flex items-center justify-center bg-black/0 transition rounded-[28px]">
                    <svg className="img-hover-icon w-5 h-5 text-white/0 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </button>
              ))}
              {overflow && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 bg-black/50 hover:bg-black/60 transition cursor-pointer relative flex items-center justify-center"
                >
                  <span className="text-white/80 text-lg font-medium">+{overflowCount}</span>
                </button>
              )}
            </div>
          )}

          {item.file && (
            <div className={item.text ? "mt-3" : ""}>
              <button
                onClick={() => window.aivexWindow?.openFile(item.file.path)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#8B4DFF]/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B4DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-white/80 group-hover:text-white transition">
                    {item.file.name}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Нажмите чтобы открыть
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {!isUser && !isStart && item.text && (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={() => copyText(item.text)}
            className="opacity-0 group-hover:opacity-100 transition w-7 h-7 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10"
          >
            {copiedText === item.text ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {item.time && (
            <div className="text-[10px] text-white/25 whitespace-nowrap">
              {item.time}
            </div>
          )}
        </div>
      )}

      {isUser && item.time && (
        <div className="text-[10px] text-white/25 mb-1 shrink-0">
          {item.time}
        </div>
      )}
    </div>
  );
}
    >
      <motion.div
        style={isUser ? userBubbleStyle : aiBubbleStyle}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={
          isUser
            ? "relative group w-fit max-w-[82%] rounded-[28px] rounded-br-md border px-4 pt-4 pb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "relative group w-fit max-w-[88%] rounded-[28px] rounded-tl-md border px-4 pt-4 pb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        }
        >
          <div className="markdown-content text-sm text-white/90 break-words [&_p]:!m-0 [&_p]:!leading-[18px] [&_span]:!leading-[18px]">
          {item.type === "audio-status" ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 size={15} className="animate-spin" />
              <span>{item.text}</span>
            </div>
          ) : (
            item.text && (isStart ? (
              <span className="italic text-white/60">{item.text}</span>
            ) : item.animate ? (
              <TypingText
                onComplete={() => setIsTyping(false)}
                text={item.text}
                copyCode={copyCode}
                copiedCode={copiedCode}
                uiSettings={uiSettings}
                renderMarkdown={renderMarkdown}
              />
            ) : (
              renderMarkdown(item.text, copyCode, copiedCode, uiSettings)
            ))
          )}

          {images.length > 0 && (
            <div className={"flex gap-2 flex-wrap" + (item.text ? " mt-3" : "")}>
              {visibleImages.map((image, imgIndex) => (
                <button
                  key={imgIndex}
                  onClick={() => window.aivexWindow?.openImage(image)}
                  className="img-hover-parent w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 bg-black/30 hover:border-white/25 transition cursor-pointer relative"
                >
                  <img
                    src={image}
                    alt="Sent"
                    className="w-full h-full object-cover"
                    onError={(e) => console.error("[IMG ERROR]", e.nativeEvent, "src starts with:", image?.slice(0, 50))}
                  />
                  <div className="img-hover-overlay absolute inset-0 flex items-center justify-center bg-black/0 transition rounded-[28px]">
                    <svg className="img-hover-icon w-5 h-5 text-white/0 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </button>
              ))}
              {overflow && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 bg-black/50 hover:bg-black/60 transition cursor-pointer relative flex items-center justify-center"
                >
                  <span className="text-white/80 text-lg font-medium">+{overflowCount}</span>
                </button>
              )}
            </div>
          )}

          {item.file && (
            <div className={item.text ? "mt-3" : ""}>
              <button
                onClick={() => window.aivexWindow?.openFile(item.file.path)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#8B4DFF]/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B4DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-white/80 group-hover:text-white transition">
                    {item.file.name}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Нажмите чтобы открыть
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition">
            {item.time}
          </div>

          {!isUser && !isStart && item.text && (
            <button
              onClick={() => copyText(item.text)}
              className="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10 -mr-1"
            >
              {copiedText === item.text ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}

export default MessageBubble;
