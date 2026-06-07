import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";

function ThemeCreatorPanel() {
  const {
    themeCreatorOpen, setThemeCreatorOpen,
    panelAccentStyle,
    newThemeName, setNewThemeName,
    customThemes,
    createCustomTheme,
  } = useSettings();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!themeCreatorOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setThemeCreatorOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [themeCreatorOpen, setThemeCreatorOpen]);

  return (
    <AnimatePresence>
      {themeCreatorOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-[96px] right-5 w-[380px] z-50 rounded-3xl border backdrop-blur-2xl p-5"
          style={panelAccentStyle}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white/70 tracking-wide">Создать стиль</h2>
            <button
              onClick={() => setThemeCreatorOpen(false)}
              className="w-6 h-6 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-white/40 mb-4 -mt-3">
            Сохранит текущие цвета и прозрачность.
          </p>

          <input
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder={`Стиль ${customThemes.length + 1}`}
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-sm text-white/70 placeholder:text-white/25 outline-none"
          />

          <button
            onClick={createCustomTheme}
            className="w-full mt-4 py-2.5 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            Создать
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ThemeCreatorPanel;
