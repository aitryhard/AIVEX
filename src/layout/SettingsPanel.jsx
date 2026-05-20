import { AnimatePresence, motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { THEME_PRESETS } from "../constants/themePresets";

function SettingsPanel({
  settingsOpen,
  settingsRef,
  panelAccentStyle,
  customThemes,
  applyThemePreset,
  deleteCustomTheme,
  setSettingsOpen,
  setProfileMenu,
  setProfileCreatorOpen,
  setThemeCreatorOpen,
  uiSettings,
  setUiSettings,
  activeColorTarget,
  setActiveColorTarget,
  resetUiSettings,
  appVersion,
}) {
  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          ref={settingsRef}
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={panelAccentStyle}
          className="fixed top-[91px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl"
        >
          <div>
            <h2 className="text-sm font-medium text-white/80">Графика</h2>

            <p className="text-xs text-white/55 mt-1">
              Настрой внешний вид панели и сообщений.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 max-h-[170px] overflow-y-auto pr-1">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyThemePreset(preset)}
                  className="h-[86px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
                >
                  <div className="text-xs font-medium text-white">
                    {preset.name}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    {[preset.panelColor, preset.aiColor, preset.userColor].map(
                      (color) => (
                        <span
                          key={color}
                          className="w-4 h-4 rounded-full border border-white/10"
                          style={{ backgroundColor: color }}
                        />
                      ),
                    )}
                  </div>
                </button>
              ))}

              {customThemes.map((theme) => (
                <div key={theme.id} className="group relative h-[86px]">
                  <button
                    onClick={() => applyThemePreset(theme)}
                    className="w-full h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
                  >
                    <div className="text-xs font-medium text-white pr-5">
                      {theme.name}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {[theme.panelColor, theme.aiColor, theme.userColor].map(
                        (color) => (
                          <span
                            key={color}
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ backgroundColor: color }}
                          />
                        ),
                      )}
                    </div>
                  </button>

                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteCustomTheme(theme.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full text-white/0 hover:text-red-300 group-hover:text-white/25 hover:bg-red-500/10 transition flex items-center justify-center text-[14px] leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setSettingsOpen(false);
                  setProfileMenu(false);
                  setProfileCreatorOpen(false);
                  setThemeCreatorOpen(true);
                }}
                className="h-[86px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition p-3 text-left"
              >
                <div className="text-xs font-medium text-white">+ Свой</div>

                <div className="text-[11px] text-white/35 mt-2">
                  Сохранить стиль
                </div>
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-white/100">
              Прозрачность панели: {uiSettings.opacity}%
            </span>

            <input
              type="range"
              min="15"
              max="90"
              value={uiSettings.opacity}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) =>
                setUiSettings((prev) => ({
                  ...prev,
                  opacity: Number(e.target.value),
                }))
              }
              className="no-drag w-full mt-2 accent-white focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["panelColor", "Панель"],
              ["aiColor", "AI"],
              ["userColor", "Пользователь"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveColorTarget(key)}
                className={
                  activeColorTarget === key
                    ? "p-3 rounded-2xl border border-white/20 bg-white/10 text-left transition"
                    : "p-3 rounded-2xl border border-white/10 bg-white/[0.03] text-left transition hover:bg-white/[0.05]"
                }
              >
                <div className="text-xs text-white/100 font-medium">
                  {label}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg border border-white/10"
                    style={{ backgroundColor: uiSettings[key] }}
                  />

                  <span className="text-xs text-white/35">
                    {uiSettings[key]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
            <HexColorPicker
              color={uiSettings[activeColorTarget]}
              onChange={(color) =>
                setUiSettings((prev) => ({
                  ...prev,
                  [activeColorTarget]: color,
                }))
              }
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetUiSettings}
              className="mt-0 px-4 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[11px] text-white/60 hover:text-white hover:bg-white/15 transition"
            >
              Сбросить
            </button>
          </div>

          <div className="text-[11px] text-white/35 mt-4 text-center">
            Aivex v{appVersion}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsPanel;