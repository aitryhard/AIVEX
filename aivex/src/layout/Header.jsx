import {
  Minus,
  Square,
  X,
  Pin,
  SlidersHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { DEFAULT_PROFILES } from "../constants/defaultProfiles";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";
import { useProfile } from "../contexts/ProfileContext";

function Header({ backendOnline }) {
  const { clearChat, isTyping, isLoading } = useChat();
  const { panelAccentStyle, setSettingsOpen, setThemeCreatorOpen, setSubscriptionOpen, openSubscriptionAt, currentTier } = useSettings();
  const FREE_PROFILES = ["Quick", "Detailed"];

  const {
    profile, setProfile,
    customProfiles,
    profileMenu, setProfileMenu,
    profileRef,
    deleteCustomProfile,
    startEditProfile,
    setProfileCreatorOpen,
  } = useProfile();

  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (!window.aivexWindow) return;
    window.aivexWindow.getAlwaysOnTop().then(setPinned);
  }, []);

  function togglePin() {
    const next = !pinned;
    setPinned(next);
    window.aivexWindow?.setAlwaysOnTop(next);
  }

  function handleProfileClick(name) {
    if (currentTier === "free" && !FREE_PROFILES.includes(name)) {
      setProfileMenu(false);
      openSubscriptionAt("pro");
      return;
    }
    setProfile(name);
    setProfileMenu(false);
  }

  return (
    <>
      <div className="h-8 flex items-center justify-between px-4 pt-[2px] pb-[2px] border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable transition-[border-color] duration-300">
        <div className="flex items-center no-drag">
          <button
            onClick={togglePin}
            className={`w-8 h-6.5 rounded-lg flex items-center justify-center transition ${pinned ? "text-white/70 hover:text-white" : "text-white/25 hover:text-white/50"}`}
          >
            <Pin size={14} strokeWidth={pinned ? 2.5 : 1.5} />
          </button>
        </div>

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
          setSubscriptionOpen(false);
          setProfileMenu(false);
          setProfileCreatorOpen(false);
          setThemeCreatorOpen(false);
        }}
        className="p-5 border-b border-white/10 flex items-center justify-between transition-[border-color] duration-300"
      >
        <div className="flex items-center">
          <h1 className="text-[24px] leading-none tracking-tight font-['Space_Grotesk'] font-bold text-white [text-shadow:0_0_30px_rgba(255,255,255,0.12)]">
            Aivex
          </h1>

          <div
            className={
              backendOnline
                ? "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]"
                : "ml-3 mt-[2px] w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]"
            }
            title={backendOnline ? "Бэкенд подключён" : "Бэкенд отключён"}
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
              setSubscriptionOpen(false);
            }}
            className="no-drag w-9 h-9 rounded-2xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/15 hover:text-white transition backdrop-blur-xl flex items-center justify-center"
          >
            <SlidersHorizontal strokeWidth={1.8} size={15} />
          </button>

          <button
            onMouseDown={() => setSubscriptionOpen(false)}
            onClick={isTyping || isLoading ? undefined : clearChat}
            title="Очистить чат"
            className={`no-drag w-9 h-9 rounded-2xl border transition backdrop-blur-xl flex items-center justify-center ${
              isTyping || isLoading
                ? "bg-white/5 border-white/5 text-white/30"
                : "bg-white/10 border-white/10 text-white/80 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Trash2 strokeWidth={1.8} size={15} />
          </button>

          <div className="relative no-drag">
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                setProfileMenu((prev) => !prev);
                setSettingsOpen(false);
                setSubscriptionOpen(false);
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
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl border overflow-hidden z-50"
                  style={panelAccentStyle}
                >
                  {[
                    ...DEFAULT_PROFILES,
                    ...customProfiles.map((item) => ({
                      name: item.name,
                      desc: "Пользовательский профиль",
                    })),
                  ].map((item) => {
                    const locked = currentTier === "free" && !FREE_PROFILES.includes(item.name);
                    return (
                      <div key={item.name} className="relative w-full">
                        <button
                          onClick={() => handleProfileClick(item.name)}
                          className={
                            profile === item.name
                              ? "w-full px-4 py-3 pr-12 text-left bg-white/[0.06] text-white"
                              : locked
                                ? "w-full px-4 py-3 pr-12 text-left text-white/20 cursor-not-allowed"
                                : "w-full px-4 py-3 pr-12 text-left text-white/60 hover:bg-white/[0.03] hover:text-white/80 transition"
                          }
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {item.name}
                            </div>

                            <div
                              className={
                                profile === item.name
                                  ? "text-[11px] text-white/50 mt-0.5 leading-tight"
                                  : "text-[11px] text-white/25 mt-0.5 leading-tight"
                              }
                            >
                              {item.desc}
                            </div>
                          </div>
                        </button>

                        {customProfiles.some(
                          (p) => p.name === item.name,
                        ) && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setProfileMenu(false);
                                const found = customProfiles.find((p) => p.name === item.name);
                                if (found) startEditProfile(found);
                              }}
                              className="w-5 h-5 rounded-full text-white/10 hover:text-white/40 hover:bg-white/[0.06] transition flex items-center justify-center"
                            >
                              <Pencil size={10} />
                            </button>
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteCustomProfile(item.name);
                              }}
                              className="w-5 h-5 rounded-full text-white/15 hover:text-red-300 hover:bg-red-500/10 transition flex items-center justify-center text-[12px] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {currentTier === "premium" && (
                    <button
                      onClick={() => {
                        setProfileMenu(false);
                        setProfileCreatorOpen(true);
                      }}
                      className="w-full px-4 py-3 pr-4 text-left text-sm text-white/50 hover:bg-white/[0.03] hover:text-white/70 transition border-t border-white/[0.06]"
                    >
                      + Создать профиль
                    </button>
                  )}
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
