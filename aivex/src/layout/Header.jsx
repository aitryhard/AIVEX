import {
  Minus,
  Square,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { DEFAULT_PROFILES } from "../constants/defaultProfiles";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";
import { useProfile } from "../contexts/ProfileContext";

function Header({ backendOnline }) {
  const { clearChat } = useChat();
  const { panelAccentStyle, setSettingsOpen, setThemeCreatorOpen } = useSettings();
  const {
    profile, setProfile,
    customProfiles,
    profileMenu, setProfileMenu,
    profileRef,
    deleteCustomProfile,
    setProfileCreatorOpen,
  } = useProfile();

  return (
    <>
      <div className="h-8 flex items-center justify-end px-4 pt-[2px] pb-[2px] border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable">
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={() => window.aivexWindow?.minimize()}
            className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={() => window.aivexWindow?.maximize()}
            className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <Square size={13} />
          </button>

          <button
            onClick={() => window.aivexWindow?.close()}
            className="w-8 h-6.5 rounded-lg flex items-center justify-center text-white/50 hover:text-red-300 hover:bg-red-500/15 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <header
        onMouseDown={() => {
          setSettingsOpen(false);
          setProfileMenu(false);
          setProfileCreatorOpen(false);
          setThemeCreatorOpen(false);
        }}
        className="p-5 border-b border-white/10 flex items-center justify-between"
      >
        <div className="flex items-center">
          <h1 className="text-[24px] leading-none tracking-tight font-['Space_Grotesk'] font-bold">
            Aivex
          </h1>

          <div
            className={
              backendOnline
                ? "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"
                : "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]"
            }
          />
        </div>

        <div className="flex items-center gap-2 leading-none">
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              setSettingsOpen((prev) => !prev);
              setProfileMenu(false);
              setProfileCreatorOpen(false);
              setThemeCreatorOpen(false);
            }}
            className="no-drag w-9 h-9 rounded-2xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl flex items-center justify-center"
          >
            <SlidersHorizontal strokeWidth={1.8} size={15} />
          </button>

          <button
            onClick={clearChat}
            className="no-drag px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl"
          >
            Очистить
          </button>

          <div className="relative no-drag">
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                setProfileMenu((prev) => !prev);
                setSettingsOpen(false);
                setProfileCreatorOpen(false);
                setThemeCreatorOpen(false);
              }}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 hover:bg-white/15 transition backdrop-blur-xl"
            >
              {profile}
            </button>

            <AnimatePresence>
              {profileMenu && (
                <motion.div
                  ref={profileRef}
                  style={panelAccentStyle}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-[#0f0f10]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
                >
                  {[
                    ...DEFAULT_PROFILES,
                    ...customProfiles.map((item) => ({
                      name: item.name,
                      desc: "Пользовательский профиль",
                    })),
                  ].map((item) => (
                    <div key={item.name} className="relative w-full">
                      <button
                        onClick={() => {
                          setProfile(item.name);
                          setProfileMenu(false);
                        }}
                        className={
                          profile === item.name
                            ? "w-full px-4 py-3 text-left bg-white/15 text-white"
                            : "w-full px-4 py-3 text-left text-white/70 hover:bg-white/10 hover:text-white transition"
                        }
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {item.name}
                          </div>

                          <div
                            className={
                              profile === item.name
                                ? "text-[11px] text-white/60 mt-1 leading-tight"
                                : "text-[11px] text-white/35 mt-1 leading-tight"
                            }
                          >
                            {item.desc}
                          </div>
                        </div>
                      </button>

                      {customProfiles.some(
                        (p) => p.name === item.name,
                      ) && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            deleteCustomProfile(item.name);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white/25 hover:text-red-300 hover:bg-red-500/10 transition flex items-center justify-center text-[14px] leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setProfileMenu(false);
                      setProfileCreatorOpen(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition border-t border-white/10"
                  >
                    + Создать профиль
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
