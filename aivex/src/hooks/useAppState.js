import { useRef, useState } from "react";

import { START_MESSAGES } from "../constants/startMessages";
import { DEFAULT_UI_SETTINGS } from "../constants/defaultUiSettings";
import { STORAGE_KEYS } from "../constants/storageKeys";

import { useBackendStatus } from "./useBackendStatus";
import { useActivation } from "./useActivation";
import { useAppVersion } from "./useAppVersion";
import { useUpdater } from "./useUpdater";
import { useAutoClipboard } from "./useAutoClipboard";
import { useSplashScreen } from "./useSplashScreen";
import { useChatScroll } from "./useChatScroll";
import { usePersistentState } from "./usePersistentState";
import { useWindowPanels } from "./useWindowPanels";
import { useProfileHotkeys } from "./useProfileHotkeys";
import { useAudioRecording } from "./useAudioRecording";
import { useChatActions } from "./useChatActions";
import { useThemeActions } from "./useThemeActions";
import { useProfileActions } from "./useProfileActions";
import { useClearChat } from "./useClearChat";
import { usePanelStyles } from "./usePanelStyles";
import { useWhisperStatus } from "./useWhisperStatus";
import { useScreenPeek } from "./useScreenPeek";

function getRandomStartMessage() {
  return START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)];
}

export function useAppState() {
  const appVersion = useAppVersion();
  const updateStatus = useUpdater();
  const { activationStatus, setActivationStatus } = useActivation();
  const { backendOnline, restartInfo } = useBackendStatus(activationStatus);
  const { whisperReady, whisperLoading } = useWhisperStatus();
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
    setSettingsOpen,
    setProfileMenu,
  });

  const { copiedCode, copiedText, copyText, copyCode, sendMessage, cancelRequest } =
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

  const {
    isActive: isScreenPeeking,
    lastAnalysis: screenPeekAnalysis,
    isAnalyzing: screenPeekAnalyzing,
    error: screenPeekError,
    start: startScreenPeek,
    stop: stopScreenPeek,
  } = useScreenPeek({ setMessages });

  const chatContextValue = {
    messages, setMessages,
    isLoading, setIsLoading,
    isTyping, setIsTyping,
    messageInputRef, imageInputRef,
    clipboardImages, setClipboardImages,
    copiedCode, copiedText,
    sendMessage, cancelRequest, copyText, copyCode,
    clearChat,
    chatEndRef,
    isRecording, startDesktopAudioRecording, stopDesktopAudioRecording,
    whisperReady, whisperLoading,
    autoClipboard, setAutoClipboard,
    isScreenPeeking, startScreenPeek, stopScreenPeek,
    screenPeekAnalysis, screenPeekAnalyzing, screenPeekError,
  };

  const settingsContextValue = {
    uiSettings, setUiSettings,
    panelStyle, aiBubbleStyle, userBubbleStyle, panelAccentStyle,
    customThemes, setCustomThemes,
    applyThemePreset, createCustomTheme, deleteCustomTheme, resetUiSettings,
    settingsOpen, setSettingsOpen,
    activeColorTarget, setActiveColorTarget,
    themeCreatorOpen, setThemeCreatorOpen,
    newThemeName, setNewThemeName,
    appVersion,
  };

  const profileContextValue = {
    profile, setProfile,
    customProfiles, setCustomProfiles,
    profileMenu, setProfileMenu,
    profileCreatorOpen, setProfileCreatorOpen,
    deleteCustomProfile, createCustomProfile,
    newProfile, setNewProfile,
    profileRef,
  };

  return {
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
  };
}
