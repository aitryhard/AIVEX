import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProfile } from "../contexts/ProfileContext";
import { useSettings } from "../contexts/SettingsContext";

function ProfileCreatorPanel() {
  const {
    profileCreatorOpen, setProfileCreatorOpen,
    newProfile, setNewProfile,
    customProfiles,
    createCustomProfile, updateCustomProfile, closeProfileCreator,
    editingProfile,
  } = useProfile();
  const { panelAccentStyle } = useSettings();
  const panelRef = useRef(null);
  const isEdit = !!editingProfile;

  useEffect(() => {
    if (!profileCreatorOpen) return;

    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closeProfileCreator();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileCreatorOpen, closeProfileCreator]);

  const useCustomPrompt = !!newProfile.prompt;

  return (
    <AnimatePresence>
      {profileCreatorOpen && (
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
            <h2 className="text-sm font-medium text-white/70 tracking-wide">{isEdit ? "Редактировать" : "Создать профиль"}</h2>
            <button
              onClick={closeProfileCreator}
              className="w-6 h-6 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-white/40 mb-4 -mt-3">
            Настрой стиль поведения Aivex.
          </p>

          <div className="text-xs text-white/40 mb-2">Название</div>
          <input
            value={newProfile.name}
            onChange={(e) =>
              setNewProfile((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder={`Профиль ${customProfiles.length + 1}`}
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-sm text-white/70 placeholder:text-white/25 outline-none"
          />

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setNewProfile((prev) => ({ ...prev, prompt: "" }))}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                useCustomPrompt
                  ? "border border-white/[0.06] bg-white/[0.015] text-white/40 hover:text-white/60"
                  : "bg-white text-black"
              }`}
            >
              Конструктор
            </button>
            <button
              onClick={() => setNewProfile((prev) => ({ ...prev, prompt: prev.prompt || "Ты — полезный AI-ассистент Aivex." }))}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                useCustomPrompt
                  ? "bg-white text-black"
                  : "border border-white/[0.06] bg-white/[0.015] text-white/40 hover:text-white/60"
              }`}
            >
              Свой промпт
            </button>
          </div>

          {useCustomPrompt ? (
            <div className="mt-4">
              <div className="text-xs text-white/40 mb-2">Системный промпт</div>
              <textarea
                value={newProfile.prompt}
                onChange={(e) =>
                  setNewProfile((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                placeholder="Напиши свой системный промпт..."
                rows={6}
                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-sm text-white/70 placeholder:text-white/25 outline-none resize-none"
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-xs text-white/40 mb-2">Длина ответа</div>
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
                          ? "py-2.5 rounded-2xl bg-white text-black text-xs font-medium"
                          : "py-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-white/40 text-xs hover:bg-white/[0.03]"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/40 mb-2">Глубина анализа</div>
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
                          ? "py-2.5 rounded-2xl bg-white text-black text-xs font-medium"
                          : "py-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-white/40 text-xs hover:bg-white/[0.03]"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={isEdit ? updateCustomProfile : createCustomProfile}
            className="w-full mt-5 py-2.5 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            {isEdit ? "Сохранить" : "Создать"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProfileCreatorPanel;
