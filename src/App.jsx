import { useRef, useState } from "react";
import { motion } from "framer-motion";

import { START_MESSAGES } from "./constants/startMessages";
import { renderMarkdown } from "./utils/renderMarkdown";

import ChatMessages from "./chat/ChatMessages";
import FooterInput from "./layout/FooterInput";
import Header from "./layout/Header";
import SplashScreen from "./layout/SplashScreen";
import SettingsPanel from "./layout/SettingsPanel";
import ThemeCreatorPanel from "./layout/ThemeCreatorPanel";
import ProfileCreatorPanel from "./layout/ProfileCreatorPanel";
import UpdateBanner from "./layout/UpdateBanner";
import ActivationScreen from "./layout/ActivationScreen";
import DragOverlay from "./layout/DragOverlay";
import MainShell from "./layout/MainShell";

import { useBackendStatus } from "./hooks/useBackendStatus";
import { useActivation } from "./hooks/useActivation";
import { useAppVersion } from "./hooks/useAppVersion";
import { useUpdater } from "./hooks/useUpdater";
import { useAutoClipboard } from "./hooks/useAutoClipboard";
import { useSplashScreen } from "./hooks/useSplashScreen";
import { useChatScroll } from "./hooks/useChatScroll";
import { usePersistentState } from "./hooks/usePersistentState";
import { useWindowPanels } from "./hooks/useWindowPanels";
import { useProfileHotkeys } from "./hooks/useProfileHotkeys";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useChatActions } from "./hooks/useChatActions";
import { useThemeActions } from "./hooks/useThemeActions";
import { useProfileActions } from "./hooks/useProfileActions";
import { useClearChat } from "./hooks/useClearChat";
import { usePanelStyles } from "./hooks/usePanelStyles";
import { DEFAULT_UI_SETTINGS } from "./constants/defaultUiSettings";
import { STORAGE_KEYS } from "./constants/storageKeys";

function getRandomStartMessage() {
  return START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)];
}

function App() {
  const appVersion = useAppVersion();
  const updateStatus = useUpdater();
  const { activationStatus, setActivationStatus } = useActivation();
  const backendOnline = useBackendStatus(activationStatus);
  const { showSplash, setShowSplash, splashMode, setSplashMode } =
    useSplashScreen();

  const [customProfiles, setCustomProfiles] = usePersistentState(
    STORAGE_KEYS.CUSTOM_PROFILES,
    [],
  );

  const [customThemes, setCustomThemes] = usePersistentState(
    STORAGE_KEYS.CUSTOM_THEMES,
    [],
  );

  const [uiSettings, setUiSettings] = usePersistentState(
    STORAGE_KEYS.UI_SETTINGS,
    DEFAULT_UI_SETTINGS,
  );

  const [profile, setProfile] = usePersistentState(STORAGE_KEYS.PROFILE, "Tutor");

  const [autoClipboard, setAutoClipboard] = usePersistentState(
    STORAGE_KEYS.AUTO_CLIPBOARD,
    true,
  );

  const [themeCreatorOpen, setThemeCreatorOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  const [profileCreatorOpen, setProfileCreatorOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    length: "standard",
    thinking: "standard",
  });

  const [activeColorTarget, setActiveColorTarget] = useState("panelColor");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [openedImages, setOpenedImages] = useState({});
  const [profileMenu, setProfileMenu] = useState(false);
  const [clipboardImages, setClipboardImages] = useState([]);

  const [messages, setMessages] = useState(() => [
    {
      role: "ai",
      text: getRandomStartMessage(),
      time: "",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messageInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  const { panelStyle, aiBubbleStyle, userBubbleStyle, panelAccentStyle } =
    usePanelStyles(uiSettings);

  const {
    applyThemePreset,
    createCustomTheme,
    deleteCustomTheme,
    resetUiSettings,
  } = useThemeActions({
    uiSettings,
    setUiSettings,
    customThemes,
    setCustomThemes,
    newThemeName,
    setNewThemeName,
    setThemeCreatorOpen,
    setSettingsOpen,
  });

  const { deleteCustomProfile, createCustomProfile } = useProfileActions({
    profile,
    setProfile,
    customProfiles,
    setCustomProfiles,
    newProfile,
    setNewProfile,
    setProfileCreatorOpen,
  });

  const clearChat = useClearChat({
    messages,
    setMessages,
    messageInputRef,
    setClipboardImages,
    setOpenedImages,
    setSettingsOpen,
    setProfileMenu,
    getRandomStartMessage,
  });

  const { copiedCode, copyText, copyCode, sendMessage, cancelRequest } =
    useChatActions({
      activationStatus,
      isLoading,
      isTyping,
      setIsLoading,
      setIsTyping,
      messages,
      setMessages,
      messageInputRef,
      clipboardImages,
      setClipboardImages,
      customProfiles,
      profile,
    });

  const {
    isRecording,
    startDesktopAudioRecording,
    stopDesktopAudioRecording,
  } = useAudioRecording({
    setMessages,
    setIsLoading,
  });

  useProfileHotkeys({
    profile,
    setProfile,
    customProfiles,
  });

  useWindowPanels({
    settingsRef,
    profileRef,
    setSettingsOpen,
    setProfileMenu,
  });

  useChatScroll({
    chatEndRef,
    messages,
    isLoading,
    isTyping,
  });

  useAutoClipboard({
    autoClipboard,
    messageInputRef,
    setClipboardImages,
  });

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
      <DragOverlay isDragging={isDragging} />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={panelStyle}
        className="relative w-screen h-screen rounded-[14px] border border-white/10 backdrop-blur-[80px] shadow-none flex flex-col overflow-hidden"
      >
        <Header
          backendOnline={backendOnline}
          clearChat={clearChat}
          setSettingsOpen={setSettingsOpen}
          profileMenu={profileMenu}
          setProfileMenu={setProfileMenu}
          setProfileCreatorOpen={setProfileCreatorOpen}
          profile={profile}
          setProfile={setProfile}
          customProfiles={customProfiles}
          deleteCustomProfile={deleteCustomProfile}
          profileRef={profileRef}
          panelAccentStyle={panelAccentStyle}
        />

        <UpdateBanner
          updateStatus={updateStatus}
          showSplash={showSplash}
          setSplashMode={setSplashMode}
          setShowSplash={setShowSplash}
        />

        <SettingsPanel
          settingsOpen={settingsOpen}
          settingsRef={settingsRef}
          panelAccentStyle={panelAccentStyle}
          customThemes={customThemes}
          applyThemePreset={applyThemePreset}
          deleteCustomTheme={deleteCustomTheme}
          setSettingsOpen={setSettingsOpen}
          setProfileMenu={setProfileMenu}
          setProfileCreatorOpen={setProfileCreatorOpen}
          setThemeCreatorOpen={setThemeCreatorOpen}
          uiSettings={uiSettings}
          setUiSettings={setUiSettings}
          activeColorTarget={activeColorTarget}
          setActiveColorTarget={setActiveColorTarget}
          resetUiSettings={resetUiSettings}
          appVersion={appVersion}
        />

        <ThemeCreatorPanel
          themeCreatorOpen={themeCreatorOpen}
          panelAccentStyle={panelAccentStyle}
          newThemeName={newThemeName}
          setNewThemeName={setNewThemeName}
          customThemes={customThemes}
          createCustomTheme={createCustomTheme}
          setThemeCreatorOpen={setThemeCreatorOpen}
        />

        <ProfileCreatorPanel
          profileCreatorOpen={profileCreatorOpen}
          panelAccentStyle={panelAccentStyle}
          newProfile={newProfile}
          setNewProfile={setNewProfile}
          customProfiles={customProfiles}
          createCustomProfile={createCustomProfile}
          setProfileCreatorOpen={setProfileCreatorOpen}
        />

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
          userBubbleStyle={userBubbleStyle}
          aiBubbleStyle={aiBubbleStyle}
          openedImages={openedImages}
          setOpenedImages={setOpenedImages}
          copyText={copyText}
          copyCode={copyCode}
          copiedCode={copiedCode}
          uiSettings={uiSettings}
          renderMarkdown={renderMarkdown}
          setIsTyping={setIsTyping}
          setSettingsOpen={setSettingsOpen}
          setProfileMenu={setProfileMenu}
          setProfileCreatorOpen={setProfileCreatorOpen}
        />

        <FooterInput
          uiSettings={uiSettings}
          clipboardImages={clipboardImages}
          setClipboardImages={setClipboardImages}
          messageInputRef={messageInputRef}
          imageInputRef={imageInputRef}
          isLoading={isLoading}
          isTyping={isTyping}
          isRecording={isRecording}
          autoClipboard={autoClipboard}
          setAutoClipboard={setAutoClipboard}
          sendMessage={sendMessage}
          cancelRequest={cancelRequest}
          startDesktopAudioRecording={startDesktopAudioRecording}
          stopDesktopAudioRecording={stopDesktopAudioRecording}
        />
      </motion.section>

      <SplashScreen showSplash={showSplash} splashMode={splashMode} />
    </MainShell>
  );
}

export default App;
