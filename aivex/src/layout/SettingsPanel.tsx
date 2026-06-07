import { forwardRef, useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import ScrollFade from "../components/ScrollFade";
import { THEME_PRESETS } from "../constants/themePresets";
import type { UiSettings } from "../types";
import { useSettings } from "../contexts/SettingsContext";
import { useProfile } from "../contexts/ProfileContext";
import { useChat } from "../contexts/ChatContext";
import { STORAGE_KEYS } from "../constants/storageKeys";

const FREE_THEMES = ["Midnight", "Slime", "Ocean", "Violet"];

const SettingsPanel = forwardRef<HTMLDivElement>(function SettingsPanel(props, ref) {
  const {
    settingsOpen, setSettingsOpen,
    panelAccentStyle,
    customThemes,
    applyThemePreset, deleteCustomTheme, resetUiSettings,
    setThemeCreatorOpen,
    uiSettings, setUiSettings,
    activeColorTarget, setActiveColorTarget,
    appVersion,
    currentTier,
    deviceId,
    openSubscriptionAt,
  } = useSettings();
  const { setProfileMenu, setProfileCreatorOpen } = useProfile();
  const { messages } = useChat();

  const isFree = currentTier === "free";
  const themeScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [panelScrollUp, setPanelScrollUp] = useState(false);
  const [panelScrollDown, setPanelScrollDown] = useState(false);

  const updatePanelScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setPanelScrollUp(el.scrollTop > 4);
    setPanelScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
  }, []);

  const updateThemeScroll = useCallback(() => {
    const el = themeScrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
  }, []);

  useEffect(() => {
    if (settingsOpen) {
      const raf = requestAnimationFrame(() => { updatePanelScroll(); updateThemeScroll(); });
      return () => cancelAnimationFrame(raf);
    }
  }, [settingsOpen, updatePanelScroll, updateThemeScroll]);

  const setPanelRef = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, [ref]);

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-[96px] right-5 w-[380px] z-50 rounded-3xl border backdrop-blur-2xl"
          style={panelAccentStyle}
        >
          <div className="relative">
            <div
              ref={setPanelRef}
              onScroll={updatePanelScroll}
              className="max-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide p-5"
            >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white/70 tracking-wide">Настройки</h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-6 h-6 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-[11px] font-medium text-white/40 tracking-widest uppercase mb-3">Темы</h3>
              <div className="relative">
                <div
                  ref={themeScrollRef}
                  onScroll={updateThemeScroll}
                  className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto scrollbar-hide pt-1"
                >
                {THEME_PRESETS.map((preset) => {
                  const locked = isFree && !FREE_THEMES.includes(preset.name);
                  return (
                    <button
                      key={preset.name}
                      onClick={() => locked ? openSubscriptionAt("pro") : applyThemePreset(preset)}
                      className={`h-[86px] rounded-2xl border transition p-3 text-left ${locked ? "border-white/[0.04] bg-white/[0.01] opacity-30 cursor-not-allowed" : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:-translate-y-0.5"}`}
                    >
                      <div className={`text-xs font-medium ${locked ? "text-white/20" : "text-white/70"}`}>
                        {preset.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {[preset.panelColor, preset.aiColor, preset.userColor].map((color) => (
                          <span
                            key={color}
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}

                {customThemes.map((theme) => (
                  <div key={theme.id} className="group relative h-[86px]">
                    <button
                      onClick={() => isFree ? openSubscriptionAt("premium") : applyThemePreset(theme)}
                      className={`w-full h-full rounded-2xl border transition p-3 text-left ${isFree ? "border-white/[0.04] bg-white/[0.01] opacity-30 cursor-not-allowed" : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:-translate-y-0.5"}`}
                    >
                      <div className={`text-xs font-medium pr-5 ${isFree ? "text-white/20" : "text-white/70"}`}>
                        {theme.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        {[theme.panelColor, theme.aiColor, theme.userColor].map((color) => (
                          <span
                            key={color}
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                    {!isFree && (
                      <button
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteCustomTheme(theme.id!); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full text-white/0 hover:text-red-300 group-hover:text-white/25 hover:bg-red-500/10 transition flex items-center justify-center text-[14px] leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => {
                    if (isFree) {
                      setSettingsOpen(false);
                      setTimeout(() => openSubscriptionAt("premium"), 200);
                      return;
                    }
                    e.preventDefault(); e.stopPropagation();
                    setSettingsOpen(false);
                    setProfileMenu(false);
                    setProfileCreatorOpen(false);
                    setThemeCreatorOpen(true);
                  }}
                  className={`h-[86px] rounded-2xl border transition p-3 text-left ${isFree ? "border-white/[0.04] bg-white/[0.01] opacity-30 cursor-not-allowed" : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:-translate-y-0.5"}`}
                >
                  <div className={`text-xs font-medium ${isFree ? "text-white/20" : "text-white/70"}`}>+ Свой</div>
                  <div className={`text-[11px] mt-2 ${isFree ? "text-white/10" : "text-white/30"}`}>Сохранить стиль</div>
                </button>
              </div>

              <ScrollFade position="top" visible={canScrollUp} panelColor={uiSettings.panelColor} />
              <ScrollFade position="bottom" visible={canScrollDown} panelColor={uiSettings.panelColor} />
            </div>
          </div>

            <div>
              <h3 className="text-[11px] font-medium text-white/40 tracking-widest uppercase mb-3">Прозрачность</h3>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">Фон</span>
                  <span className="text-xs text-white/40 font-mono">{uiSettings.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uiSettings.opacity}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => setUiSettings((prev: UiSettings) => ({ ...prev, opacity: Number(e.target.value) }))}
                  className="no-drag w-full accent-white/60 focus:outline-none h-2"
                />
              </div>
          </div>

            <div>
              <h3 className="text-[11px] font-medium text-white/40 tracking-widest uppercase mb-3">Цвета</h3>
              <div className={`space-y-3 ${isFree ? "opacity-30" : ""}`}>
                <div className="grid grid-cols-3 gap-2">
                  {[["panelColor", "Панель"], ["aiColor", "AI"], ["userColor", "Пользователь"]].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => isFree ? openSubscriptionAt("pro") : setActiveColorTarget(key)}
                      className={`p-3 rounded-2xl border transition text-left ${activeColorTarget === key ? "border-white/20 bg-white/[0.06]" : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03]"}`}
                    >
                      <div className="text-xs text-white/70 font-medium mb-2">{label}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg border border-white/10" style={{ backgroundColor: String(uiSettings[key as keyof UiSettings]) }} />
                        <span className="text-[11px] text-white/30">{String(uiSettings[key as keyof UiSettings])}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
                  <HexColorPicker
                    color={String(uiSettings[activeColorTarget as keyof UiSettings] ?? "")}
                    onChange={(color: string) => setUiSettings((prev) => ({ ...prev, [activeColorTarget as keyof UiSettings]: color }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={async () => {
                  const data: Record<string, string> = {};
                  for (const key of Object.values(STORAGE_KEYS)) {
                    const v = localStorage.getItem(key);
                    if (v) data[key] = v;
                  }
                  await window.aivexWindow?.saveTextFile(JSON.stringify(data, null, 2), "aivex-settings.json");
                }}
                className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
              >
                Экспорт
              </button>
              <button
                onClick={async () => {
                  if (!window.aivexWindow?.importJSON) return;
                  const raw = await window.aivexWindow.importJSON();
                  if (!raw) return;
                  try {
                    const data = JSON.parse(raw);
                    if (typeof data !== "object" || data === null) throw new Error("invalid format");
                    const allowedKeys = new Set(Object.values(STORAGE_KEYS));
                    let imported = 0;
                    for (const [key, value] of Object.entries(data)) {
                      if (allowedKeys.has(key) && typeof value === "string") {
                        localStorage.setItem(key, value);
                        imported++;
                      }
                    }
                    if (imported === 0) { alert("Не найдено данных для импорта"); return; }
                    window.location.reload();
                  } catch { alert("Неверный формат файла"); }
                }}
                className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
              >
                Импорт
              </button>
              <button
                onClick={async () => {
                  if (!messages.length) return;
                  const lines = messages.map((m) => {
                    const role = m.role === "ai" ? "Aivex" : "Вы";
                    const time = m.time ? `[${m.time}]` : "";
                    return `${time} ${role}: ${m.text}`;
                  });
                  await window.aivexWindow?.saveTextFile(lines.join("\n\n---\n\n"), "aivex-chat.txt");
                }}
                className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
              >
                Чат
              </button>
              <button
                onClick={resetUiSettings}
                className="px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
              >
                Сброс
              </button>
            </div>

            <button
              onClick={() => {
                const url = "https://github.com/aitryhard/AIVEX/issues/new";
                if (window.aivexWindow?.openExternal) {
                  window.aivexWindow.openExternal(url);
                } else {
                  window.open(url, "_blank");
                }
              }}
              className="text-[11px] text-white/30 hover:text-white/60 mt-4 text-center w-full transition-colors"
            >
              Сообщить о проблеме
            </button>

            <div className="text-[11px] text-white/20 mt-1 text-center">
              Aivex v{appVersion}
              {deviceId && <span className="text-white/10"> | ID: {deviceId}...</span>}
            </div>
          </div>
          </div>

          <ScrollFade position="top" visible={panelScrollUp} panelColor={uiSettings.panelColor} rounded />
          <ScrollFade position="bottom" visible={panelScrollDown} panelColor={uiSettings.panelColor} rounded />
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SettingsPanel;
