import { useEffect, useRef, useState, useCallback } from "react";

import { DEFAULT_UI_SETTINGS } from "../constants/defaultUiSettings";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { THEME_PRESETS } from "../constants/themePresets";

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

export function useAppState() {
  const appVersion = useAppVersion();
  const { updateStatus, downloadProgress } = useUpdater();
  const { activationStatus, setActivationStatus } = useActivation();
  const { backendOnline, restartInfo } = useBackendStatus(activationStatus);
  const { whisperReady, whisperLoading, whisperFailed } = useWhisperStatus();
  const { showSplash, setShowSplash, splashMode, setSplashMode } =
    useSplashScreen();

  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    window.aivexWindow?.getDeviceId().then((id) => {
      if (id) setDeviceId(id.slice(0, 8));
    }).catch(() => {});
  }, []);

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

  const [screenPeekPrompt, setScreenPeekPrompt] = usePersistentState(
    STORAGE_KEYS.SCREEN_PEEK_PROMPT,
    "",
  );

  const [themeCreatorOpen, setThemeCreatorOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  const [profileCreatorOpen, setProfileCreatorOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    length: "standard",
    thinking: "standard",
    prompt: "",
  });
  const [editingProfile, setEditingProfile] = useState(null);

  const [activeColorTarget, setActiveColorTarget] = useState("panelColor");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionTargetTier, setSubscriptionTargetTier] = useState(null);
  const [currentTier, setCurrentTier] = useState("free");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [clipboardImages, setClipboardImages] = useState([]);

  const openSubscriptionAt = useCallback((tier) => {
    setSubscriptionTargetTier(tier);
    setSubscriptionOpen(true);
  }, []);

  const [messages, setMessages] = useState([]);

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messageInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const settingsRef = useRef(null);
  const subscriptionRef = useRef(null);
  const profileRef = useRef(null);

  const { panelStyle, aiBubbleStyle, userBubbleStyle, panelAccentStyle, isDark } =
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

  const { deleteCustomProfile, createCustomProfile, updateCustomProfile, startEditProfile, closeProfileCreator } = useProfileActions({
    profile,
    setProfile,
    customProfiles,
    setCustomProfiles,
    newProfile,
    setNewProfile,
    setProfileCreatorOpen,
    editingProfile,
    setEditingProfile,
  });

  const clearChat = useClearChat({
    messages,
    setMessages,
    messageInputRef,
    setClipboardImages,
    setSettingsOpen,
    setProfileMenu,
    isTyping,
    isLoading,
  });

  const { copiedCode, copiedText, copyText, copyCode, sendMessage, cancelRequest, freeMessagesLeft, freeMessagesLimit } =
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
    currentTier,
    subscriptionExpiresAt,
    });

  const {
    isRecording,
    isMicRecording,
    startDesktopAudioRecording,
    stopDesktopAudioRecording,
    startMicRecording,
    stopMicRecording,
  } = useAudioRecording({
    setMessages,
    setIsLoading,
  });

  useProfileHotkeys({
    profile,
    setProfile,
    customProfiles,
    currentTier,
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

  const tierInitialisedRef = useRef(false);

  useEffect(() => {
    function fetchTier() {
      if (!window.aivexWindow) return Promise.resolve();
      return window.aivexWindow.getSubscription().then((sub) => {
        if (sub?.tier) {
          setCurrentTier(sub.tier);
          setSubscriptionExpiresAt(sub.expires_at || null);
          tierInitialisedRef.current = true;
        }
      }).catch(() => {});
    }

    fetchTier();

    function onFocus() { fetchTier(); }
    window.addEventListener("focus", onFocus);

    const interval = setInterval(fetchTier, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!tierInitialisedRef.current) return;
    if (currentTier !== "free") return;

    const freeProfiles = ["Quick", "Detailed"];
    const freeThemes = ["Midnight", "AMOLED", "Slime"];

    setProfile((prev) => {
      if (freeProfiles.includes(prev)) return prev;
      return "Quick";
    });

    setUiSettings((prev) => {
      const match = THEME_PRESETS.find(
        (t) =>
          t.panelColor === prev.panelColor &&
          t.aiColor === prev.aiColor &&
          t.userColor === prev.userColor,
      );
      if (match && !freeThemes.includes(match.name)) {
        return { ...prev, ...THEME_PRESETS[0] };
      }
      return prev;
    });

    setCustomProfiles([]);
    setCustomThemes([]);
  }, [currentTier]);

  const {
    isActive: isScreenPeeking,
    lastAnalysis: screenPeekAnalysis,
    analysisHistory: screenPeekHistory,
    isAnalyzing: screenPeekAnalyzing,
    error: screenPeekError,
    start: startScreenPeek,
    stop: stopScreenPeek,
    sendAnalysisToChat,
  } = useScreenPeek({ setMessages, profile, customProfiles, screenPeekPrompt });

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
    freeMessagesLeft, freeMessagesLimit,
    isRecording, startDesktopAudioRecording, stopDesktopAudioRecording,
    isMicRecording, startMicRecording, stopMicRecording,
    whisperReady, whisperLoading, whisperFailed,
    autoClipboard, setAutoClipboard,
    isScreenPeeking, startScreenPeek, stopScreenPeek,
    screenPeekAnalysis, screenPeekHistory, screenPeekAnalyzing, screenPeekError, sendAnalysisToChat,
    screenPeekPrompt, setScreenPeekPrompt,
  };

  const settingsContextValue = {
    uiSettings, setUiSettings,
    panelStyle, aiBubbleStyle, userBubbleStyle, panelAccentStyle, isDark,
    customThemes, setCustomThemes,
    applyThemePreset, createCustomTheme, deleteCustomTheme, resetUiSettings,
    settingsOpen, setSettingsOpen,
    subscriptionOpen, setSubscriptionOpen,
    subscriptionTargetTier, openSubscriptionAt,
    currentTier,
    subscriptionExpiresAt,
    deviceId,
    screenPeekPrompt, setScreenPeekPrompt,
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
    deleteCustomProfile, createCustomProfile, updateCustomProfile, startEditProfile, closeProfileCreator,
    newProfile, setNewProfile,
    editingProfile, setEditingProfile,
    profileRef,
  };

  return {
    activationStatus, setActivationStatus,
    backendOnline, restartInfo,
    showSplash, setShowSplash, splashMode, setSplashMode,
    updateStatus, downloadProgress,
    isDragging, setIsDragging,
    setClipboardImages,
    settingsRef, subscriptionRef,
    subscriptionOpen, setSubscriptionOpen,
    subscriptionTargetTier, setSubscriptionTargetTier,
    currentTier, setCurrentTier,
    subscriptionExpiresAt,
    chatContextValue,
    settingsContextValue,
    profileContextValue,
  };
}
