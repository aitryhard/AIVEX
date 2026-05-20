import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";

function ChatMessages({
  messages,
  isLoading,
  chatEndRef,
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
  setSettingsOpen,
  setProfileMenu,
  setProfileCreatorOpen,
}) {
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
        {messages.map((item, index) => (
          <MessageBubble
            key={index}
            item={item}
            index={index}
            userBubbleStyle={userBubbleStyle}
            aiBubbleStyle={aiBubbleStyle}
            openedImages={openedImages}
            setOpenedImages={setOpenedImages}
            copyText={copyText}
            copyCode={copyCode}
            copiedCode={copiedCode}
            uiSettings={uiSettings}
            renderMarkdown={renderMarkdown}
            setIsTyping={setIsTyping}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && !messages.some((msg) => msg.type === "audio-status") && (
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
  );
}

export default ChatMessages;