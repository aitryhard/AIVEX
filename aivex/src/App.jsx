import { useEffect } from "react";
import { motion } from "framer-motion";

import { renderMarkdown } from "./utils/renderMarkdown";

import ChatMessages from "./chat/ChatMessages";
import FooterInput from "./layout/FooterInput";
import Header from "./layout/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import SplashScreen from "./layout/SplashScreen";
import SettingsPanel from "./layout/SettingsPanel";
import SubscriptionPanel from "./layout/SubscriptionPanel";
import ThemeCreatorPanel from "./layout/ThemeCreatorPanel";
import ProfileCreatorPanel from "./layout/ProfileCreatorPanel";
import ServerErrorPanel from "./layout/ServerErrorPanel";
import UpdateBanner from "./layout/UpdateBanner";
import ActivationScreen from "./layout/ActivationScreen";
import DragOverlay from "./layout/DragOverlay";
import MainShell from "./layout/MainShell";
import ScreenPeekView from "./layout/ScreenPeekView";

import { ChatProvider } from "./contexts/ChatContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ProfileProvider } from "./contexts/ProfileContext";

import { useAppState } from "./hooks/useAppState";

function App() {
  const {
    activationStatus, setActivationStatus,
    backendOnline, restartInfo,
    showSplash, setShowSplash, splashMode, setSplashMode,
    updateStatus, downloadProgress,
    isDragging, setIsDragging,
    setClipboardImages,
    settingsRef, subscriptionRef,
    subscriptionOpen, setSubscriptionOpen,
    subscriptionTargetTier, setSubscriptionTargetTier,
    currentTier,
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

  if (activationStatus && !activationStatus.allowed && activationStatus.status !== "server_error") {
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

            {chatContextValue.isScreenPeeking && (
              <ScreenPeekView
                backendOnline={backendOnline}
                analysis={chatContextValue.screenPeekAnalysis}
                history={chatContextValue.screenPeekHistory}
                isAnalyzing={chatContextValue.screenPeekAnalyzing}
                error={chatContextValue.screenPeekError}
                onStop={chatContextValue.stopScreenPeek}
                onSendToChat={chatContextValue.sendAnalysisToChat}
              />
            )}

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: showSplash ? 0 : 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={settingsContextValue.panelStyle}
              data-theme={settingsContextValue.isDark ? "dark" : "light"}
              className={`relative w-screen h-screen rounded-[14px] border backdrop-blur-[80px] shadow-none flex flex-col overflow-hidden transition-[background-color,border-color] duration-300 ${settingsContextValue.isDark ? "border-white/10" : "border-black/10"}`}
            >
              <Header backendOnline={backendOnline} />

              {restartInfo && !restartInfo.fatal && (
                <div className="px-5 py-2 bg-amber-500/15 border-b border-amber-500/20 text-xs text-amber-300/80 text-center">
                  Бэкенд перезапускается ({restartInfo.attempt}/{restartInfo.max})…
                  {restartInfo.error && (
                    <span className="block text-[10px] text-amber-300/50 mt-0.5">{restartInfo.error}</span>
                  )}
                </div>
              )}

              {restartInfo?.fatal && (
                <div className="px-5 py-2 bg-red-500/20 border-b border-red-500/30 text-xs text-red-300/90 text-center">
                  Не удалось запустить бэкенд
                  {restartInfo.error && (
                    <span className="block text-[10px] text-red-300/50 mt-0.5">{restartInfo.error}</span>
                  )}
                </div>
              )}

              <UpdateBanner
                updateStatus={updateStatus}
                downloadProgress={downloadProgress}
                showSplash={showSplash}
                setSplashMode={setSplashMode}
                setShowSplash={setShowSplash}
              />

              <SettingsPanel ref={settingsRef} />
              <SubscriptionPanel
                ref={subscriptionRef}
                open={subscriptionOpen}
                highlightTier={subscriptionTargetTier}
                onClose={() => { setSubscriptionOpen(false); setSubscriptionTargetTier(null); }}
                currentTier={currentTier}
              />

              <ThemeCreatorPanel />

              <ProfileCreatorPanel />

              <ServerErrorPanel
                activationStatus={activationStatus}
                setActivationStatus={setActivationStatus}
              />

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
