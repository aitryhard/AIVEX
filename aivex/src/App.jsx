import { useEffect } from "react";
import { motion } from "framer-motion";

import { renderMarkdown } from "./utils/renderMarkdown";

import ChatMessages from "./chat/ChatMessages";
import FooterInput from "./layout/FooterInput";
import Header from "./layout/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import SplashScreen from "./layout/SplashScreen";
import SettingsPanel from "./layout/SettingsPanel";
import ThemeCreatorPanel from "./layout/ThemeCreatorPanel";
import ProfileCreatorPanel from "./layout/ProfileCreatorPanel";
import UpdateBanner from "./layout/UpdateBanner";
import ActivationScreen from "./layout/ActivationScreen";
import DragOverlay from "./layout/DragOverlay";
import MainShell from "./layout/MainShell";

import { ChatProvider } from "./contexts/ChatContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ProfileProvider } from "./contexts/ProfileContext";

import { useAppState } from "./hooks/useAppState";

function App() {
  const {
    activationStatus, setActivationStatus,
    backendOnline, restartInfo,
    showSplash, setShowSplash, splashMode, setSplashMode,
    updateStatus,
    isDragging, setIsDragging,
    setClipboardImages,
    settingsRef,
    chatContextValue,
    settingsContextValue,
    profileContextValue,
  } = useAppState();

  useEffect(() => {
    const cleanupRestore = window.aivexWindow?.onRestore(() => {
      document.body.classList.add("aivex-restoring");
      setTimeout(() => {
        document.body.classList.remove("aivex-minimizing", "aivex-restoring");
      }, 160);
    });

    const cleanupMinimize = window.aivexWindow?.onBeforeMinimize(() => {
      document.body.classList.add("aivex-minimizing");
      setTimeout(() => {
        window.aivexWindow?.completeMinimize();
      }, 160);
    });

    return () => {
      cleanupRestore?.();
      cleanupMinimize?.();
    };
  }, []);

  if (activationStatus && !activationStatus.allowed) {
    return (
      <ActivationScreen
        activationStatus={activationStatus}
        setActivationStatus={setActivationStatus}
      />
    );
  }

  return (
    <MainShell
      setIsDragging={setIsDragging}
      setClipboardImages={setClipboardImages}
    >
      <ChatProvider value={chatContextValue}>
        <SettingsProvider value={settingsContextValue}>
          <ProfileProvider value={profileContextValue}>
            <DragOverlay isDragging={isDragging} />

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: showSplash ? 0 : 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={settingsContextValue.panelStyle}
              className="relative w-screen h-screen rounded-[14px] border border-white/10 backdrop-blur-[80px] shadow-none flex flex-col overflow-hidden"
            >
              <Header backendOnline={backendOnline} />

              {restartInfo && (
                <div className="px-5 py-2 bg-amber-500/15 border-b border-amber-500/20 text-xs text-amber-300/80 text-center">
                  Бэкенд перезапускается ({restartInfo.attempt}/{restartInfo.max})…
                </div>
              )}

              <UpdateBanner
                updateStatus={updateStatus}
                showSplash={showSplash}
                setSplashMode={setSplashMode}
                setShowSplash={setShowSplash}
              />

              <SettingsPanel ref={settingsRef} />

              <ThemeCreatorPanel />

              <ProfileCreatorPanel />

              <ErrorBoundary>
                <ChatMessages renderMarkdown={renderMarkdown} />
              </ErrorBoundary>

              <FooterInput />
            </motion.section>
          </ProfileProvider>
        </SettingsProvider>
      </ChatProvider>

      <SplashScreen showSplash={showSplash} splashMode={splashMode} />
    </MainShell>
  );
}

export default App;
