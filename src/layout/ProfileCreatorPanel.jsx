import { AnimatePresence, motion } from "framer-motion";

function ProfileCreatorPanel({
  profileCreatorOpen,
  panelAccentStyle,
  newProfile,
  setNewProfile,
  customProfiles,
  createCustomProfile,
  setProfileCreatorOpen,
}) {
  return (
    <AnimatePresence>
      {profileCreatorOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={panelAccentStyle}
          className="fixed top-[91px] right-5 w-[360px] z-50 rounded-2xl border border-white/10 backdrop-blur-2xl p-4 space-y-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-white/80">
                Создать профиль
              </h2>

              <p className="text-xs text-white/55 mt-1">
                Настрой стиль поведения Aivex.
              </p>
            </div>

            <button
              onClick={() => setProfileCreatorOpen(false)}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition"
            >
              ×
            </button>
          </div>

          <input
            value={newProfile.name}
            onChange={(e) =>
              setNewProfile((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder={`Профиль ${customProfiles.length + 1}`}
            className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/35"
          />

          <div>
            <div className="text-xs text-white/60 mb-2">Длина ответа</div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["short", "Коротко"],
                ["standard", "Стандартно"],
                ["detailed", "Подробно"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setNewProfile((prev) => ({
                      ...prev,
                      length: key,
                    }))
                  }
                  className={
                    newProfile.length === key
                      ? "py-2 rounded-xl bg-white text-black text-xs"
                      : "py-2 rounded-xl bg-white/10 text-white/60 text-xs hover:bg-white/15"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/60 mb-2">Глубина анализа</div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["fast", "Быстро"],
                ["standard", "Обычно"],
                ["deep", "Глубоко"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setNewProfile((prev) => ({
                      ...prev,
                      thinking: key,
                    }))
                  }
                  className={
                    newProfile.thinking === key
                      ? "py-2 rounded-xl bg-white text-black text-xs"
                      : "py-2 rounded-xl bg-white/10 text-white/60 text-xs hover:bg-white/15"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createCustomProfile}
            className="w-full py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            Создать
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProfileCreatorPanel;