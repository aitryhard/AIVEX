import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { DEFAULT_UI_SETTINGS } from "../constants/defaultUiSettings";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { THEME_PRESETS } from "../constants/themePresets";

import { useBackendStatus } from "./useBackendStatus";
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
import { useSubscriptionTier } from "./useSubscriptionTier";
import type { Message, Profile, UiSettings, ThemePreset } from "../types";

export function useAppState() {
  const appVersion = useAppVersion();
  const { updateStatus, downloadProgress } = useUpdater();
  const { backendOnline, restartInfo } = useBackendStatus();
  const { whisperReady, whisperLoading, whisperFailed } = useWhisperStatus();
  const { showSplash, setShowSplash, splashMode, setSplashMode } =
    useSplashScreen();

  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    window.aivexWindow?.getDeviceId().then((id) => {
      if (id) setDeviceId(id.slice(0, 8));
    }).catch(() => {});
  }, []);

  const [customProfiles, setCustomProfiles] = usePersistentState<Profile[]>(
    STORAGE_KEYS.CUSTOM_PROFILES,
    [],
  );

  const [customThemes, setCustomThemes] = usePersistentState<ThemePreset[]>(
    STORAGE_KEYS.CUSTOM_THEMES,
    [],
  );

  const [uiSettings, setUiSettings] = usePersistentState<UiSettings>(
    STORAGE_KEYS.UI_SETTINGS,
    DEFAULT_UI_SETTINGS,
  );

  const [profile, setProfile] = usePersistentState<string>(STORAGE_KEYS.PROFILE, "Tutor");

  const [autoClipboard, setAutoClipboard] = usePersistentState<boolean>(
    STORAGE_KEYS.AUTO_CLIPBOARD,
    true,
  );

  const [screenPeekPrompt, setScreenPeekPrompt] = usePersistentState<string>(
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
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [activeColorTarget, setActiveColorTarget] = useState("panelColor");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionTargetTier, setSubscriptionTargetTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState("free");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [clipboardImages, setClipboardImages] = useState<string[]>([]);

  const openSubscriptionAt = useCallback((tier: string | null) => {
    setSubscriptionTargetTier(tier);
    setSubscriptionOpen(true);
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  const tierInitialisedRef = useSubscriptionTier({ setCurrentTier, setSubscriptionExpiresAt });

  useEffect(() => {
    if (!tierInitialisedRef.current) return;
    if (currentTier !== "free") return;

    const freeProfiles = ["Quick", "Detailed"];
    const freeThemes = ["Midnight", "AMOLED", "Slime"];

    setProfile((prev: string) => {
      if (freeProfiles.includes(prev)) return prev;
      return "Quick";
    });

    setUiSettings((prev: UiSettings) => {
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

  const chatContextValue = useMemo(() => ({
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
    whisperReady, whisperLoading, whisperFailed,
    autoClipboard, setAutoClipboard,
    isScreenPeeking, startScreenPeek, stopScreenPeek,
    screenPeekAnalysis, screenPeekHistory, screenPeekAnalyzing, screenPeekError, sendAnalysisToChat,
    screenPeekPrompt, setScreenPeekPrompt,
  }), [
    messages, isLoading, isTyping, clipboardImages,
    copiedCode, copiedText, sendMessage, cancelRequest, copyText, copyCode,
    clearChat, freeMessagesLeft, freeMessagesLimit,
    isRecording, startDesktopAudioRecording, stopDesktopAudioRecording,
    whisperReady, whisperLoading, whisperFailed,
    autoClipboard, isScreenPeeking, startScreenPeek, stopScreenPeek,
    screenPeekAnalysis, screenPeekHistory, screenPeekAnalyzing, screenPeekError, sendAnalysisToChat,
    screenPeekPrompt, setScreenPeekPrompt,
  ]);

  const settingsContextValue = useMemo(() => ({
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
  }), [
    uiSettings, panelStyle, aiBubbleStyle, userBubbleStyle, panelAccentStyle, isDark,
    customThemes, applyThemePreset, createCustomTheme, deleteCustomTheme, resetUiSettings,
    settingsOpen, subscriptionOpen, subscriptionTargetTier, openSubscriptionAt,
    currentTier, subscriptionExpiresAt, deviceId,
    screenPeekPrompt, activeColorTarget, themeCreatorOpen, newThemeName, appVersion,
  ]);

  const profileContextValue = useMemo(() => ({
    profile, setProfile,
    customProfiles, setCustomProfiles,
    profileMenu, setProfileMenu,
    profileCreatorOpen, setProfileCreatorOpen,
    deleteCustomProfile, createCustomProfile, updateCustomProfile, startEditProfile, closeProfileCreator,
    newProfile, setNewProfile,
    editingProfile, setEditingProfile,
    profileRef,
  }), [
    profile, customProfiles, profileMenu, profileCreatorOpen,
    deleteCustomProfile, createCustomProfile, updateCustomProfile, startEditProfile, closeProfileCreator,
    newProfile, editingProfile,
  ]);

  return {
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
