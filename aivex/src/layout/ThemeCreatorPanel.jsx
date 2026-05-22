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

  const panelRef = useRef(null);

  useEffect(() => {
    if (!themeCreatorOpen) return;

    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
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
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={panelAccentStyle}
          className="fixed top-[96px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl"
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
  );
}

export default ThemeCreatorPanel;
