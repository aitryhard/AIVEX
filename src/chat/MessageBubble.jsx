import { Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import TypingText from "../components/TypingText";
import { START_MESSAGES } from "../constants/startMessages";

function MessageBubble({
  item,
  index,
  userBubbleStyle,
  aiBubbleStyle,
  openedImages,
  setOpenedImages,
  copyText,
  copyCode,
  copiedCode,
  uiSettings,
  renderMarkdown,
  setIsTyping,
}) {
  return (
    <div
      className={
        item.role === "user"
          ? "flex flex-row-reverse justify-start items-end gap-2"
          : "flex items-end gap-2"
      }
    >
      <motion.div
        style={item.role === "user" ? userBubbleStyle : aiBubbleStyle}
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
        <div className="markdown-content text-sm leading-7 text-white/90 prose prose-invert break-words max-w-none prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-headings:mt-5 prose-headings:mb-3">
          {item.type === "audio-status" ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 size={15} className="animate-spin" />
              <span>{item.text}</span>
            </div>
          ) : (
            item.text &&
            (START_MESSAGES.includes(item.text) ? (
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

        {item.role === "ai" && !START_MESSAGES.includes(item.text) && (
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
  );
}

export default MessageBubble;