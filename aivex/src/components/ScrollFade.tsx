import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollFadeProps {
  position: "top" | "bottom"
  visible: boolean
  panelColor: string
  rounded?: boolean
}

export default function ScrollFade({ position, visible, panelColor, rounded }: ScrollFadeProps) {
  const isTop = position === "top";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className={`absolute ${isTop ? "top-0" : "bottom-0"} left-0 right-0 h-8 flex items-start justify-center pointer-events-none overflow-hidden ${rounded && isTop ? "rounded-t-3xl" : ""} ${rounded && !isTop ? "rounded-b-3xl" : ""}`}
          style={{ background: `linear-gradient(to ${isTop ? "bottom" : "top"}, ${panelColor}F2 60%, transparent)` }}
        >
          <div className={`${isTop ? "mt-1" : "mt-4"} ${isTop ? "animate-bounce-arrow-up" : "animate-bounce-arrow-down"}`}>
            <ChevronDown size={12} className={`text-white/25 ${isTop ? "rotate-180" : ""}`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
