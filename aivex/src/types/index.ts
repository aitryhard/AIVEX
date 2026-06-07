export interface Profile {
  id?: string
  name: string
  length?: "short" | "standard" | "detailed"
  thinking?: "fast" | "standard" | "deep"
  prompt?: string
  desc?: string
  style?: string
}

export interface UiSettings {
  opacity: number
  panelColor: string
  aiColor: string
  userColor: string
}

export interface ThemePreset {
  id?: string
  name: string
  opacity: number
  panelColor: string
  aiColor: string
  userColor: string
}

export interface Message {
  id: string
  role: "user" | "ai"
  text: string
  time: string
  type?: string
  profile?: string
  images?: string[]
  animate?: boolean
  file?: { path: string; name: string } | null
}

export interface ChatResponse {
  response: string
  error?: string
}

export interface SubscriptionInfo {
  tier: string
  expires_at?: string
}

export interface UpdateProgress {
  percent: number
}

export interface BackendRestartInfo {
  attempt: number
  max: number
  error?: string
  fatal?: boolean
}

export interface DailyCount {
  date: string
  count: number
}

export interface ScreenPeekAnalysisResult {
  isActive: boolean
  lastAnalysis: string
  analysisHistory: string[]
  isAnalyzing: boolean
  error: string
  start: () => Promise<void>
  stop: () => Promise<void>
  sendAnalysisToChat: (text: string) => void
}

export interface AivexWindow {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  getVersion: () => Promise<string>
  getDeviceId: () => Promise<string>
  getSubscription: () => Promise<SubscriptionInfo>
  createPayment: (tier: string) => Promise<{ url?: string; error?: string; detail?: string }>
  getAlwaysOnTop: () => Promise<boolean>
  setAlwaysOnTop: (v: boolean) => Promise<void>
  resizeWindow: (w: number, h: number) => Promise<void>
  resetWindowSize: () => Promise<void>
  saveTextFile: (c: string, n: string) => Promise<{ saved: boolean; path?: string }>
  openExternal: (url: string) => Promise<void>
  openFile: (p: string) => Promise<void>
  openImage?: (src: string) => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  onUpdateAvailable: (cb: () => void) => () => void
  onUpdateProgress: (cb: (p: UpdateProgress) => void) => () => void
  onUpdateDownloaded: (cb: () => void) => () => void
  getClipboardText: () => Promise<string>
  getClipboardImage: () => Promise<string | null>
  restartBackend: () => Promise<void>
  importJSON: () => Promise<string | null>
  startAudioCapture: () => Promise<void>
  stopAudioCapture: () => Promise<string>
  onBackendRestart: (cb: (event: unknown, info: BackendRestartInfo) => void) => () => void
  onBeforeMinimize: (cb: () => void) => () => void
  onRestore: (cb: () => void) => () => void
  completeMinimize: () => void
  captureScreen?: () => Promise<string>
  getScreenSize?: () => Promise<{ width: number; height: number }>
  onScreenPeekToggle?: (cb: () => void) => () => void
  getActivationStatus?: () => Promise<{ status: string }>
}

export interface ChatContextValue {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  isTyping: boolean
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  clipboardImages: string[]
  setClipboardImages: React.Dispatch<React.SetStateAction<string[]>>
  copiedCode: string
  copiedText: string
  sendMessage: () => void
  cancelRequest: () => void
  copyText: (text: string) => void
  copyCode: (code: string) => void
  clearChat: () => void
  chatEndRef: React.RefObject<HTMLDivElement | null>
  freeMessagesLeft: number
  freeMessagesLimit: number
  isRecording: boolean
  startDesktopAudioRecording: () => void
  stopDesktopAudioRecording: () => void
  whisperReady: boolean
  whisperLoading: boolean
  whisperFailed: boolean
  autoClipboard: boolean
  setAutoClipboard: React.Dispatch<React.SetStateAction<boolean>>
  isScreenPeeking: boolean
  startScreenPeek: () => Promise<void>
  stopScreenPeek: () => Promise<void>
  screenPeekAnalysis: string
  screenPeekHistory: string[]
  screenPeekAnalyzing: boolean
  screenPeekError: string
  sendAnalysisToChat: (text: string) => void
  screenPeekPrompt: string
  setScreenPeekPrompt: React.Dispatch<React.SetStateAction<string>>
}

export interface SettingsContextValue {
  uiSettings: UiSettings
  setUiSettings: React.Dispatch<React.SetStateAction<UiSettings>>
  panelStyle: React.CSSProperties
  aiBubbleStyle: React.CSSProperties
  userBubbleStyle: React.CSSProperties
  panelAccentStyle: React.CSSProperties
  isDark: boolean
  customThemes: ThemePreset[]
  setCustomThemes: React.Dispatch<React.SetStateAction<ThemePreset[]>>
  applyThemePreset: (preset: ThemePreset) => void
  createCustomTheme: () => void
  deleteCustomTheme: (themeId: string) => void
  resetUiSettings: () => void
  settingsOpen: boolean
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
  subscriptionOpen: boolean
  setSubscriptionOpen: React.Dispatch<React.SetStateAction<boolean>>
  subscriptionTargetTier: string | null
  openSubscriptionAt: (tier: string | null) => void
  currentTier: string
  subscriptionExpiresAt: string | null
  deviceId: string
  screenPeekPrompt: string
  setScreenPeekPrompt: React.Dispatch<React.SetStateAction<string>>
  activeColorTarget: string
  setActiveColorTarget: React.Dispatch<React.SetStateAction<string>>
  themeCreatorOpen: boolean
  setThemeCreatorOpen: React.Dispatch<React.SetStateAction<boolean>>
  newThemeName: string
  setNewThemeName: React.Dispatch<React.SetStateAction<string>>
  appVersion: string
}

export interface ProfileContextValue {
  profile: string
  setProfile: (name: string) => void
  customProfiles: Profile[]
  setCustomProfiles: React.Dispatch<React.SetStateAction<Profile[]>>
  profileMenu: boolean
  setProfileMenu: React.Dispatch<React.SetStateAction<boolean>>
  profileCreatorOpen: boolean
  setProfileCreatorOpen: React.Dispatch<React.SetStateAction<boolean>>
  deleteCustomProfile: (profileName: string) => void
  createCustomProfile: () => void
  updateCustomProfile: () => void
  startEditProfile: (profile: Profile) => void
  closeProfileCreator: () => void
  newProfile: { name: string; length: string; thinking: string; prompt: string }
  setNewProfile: React.Dispatch<React.SetStateAction<{ name: string; length: string; thinking: string; prompt: string }>>
  editingProfile: Profile | null
  setEditingProfile: React.Dispatch<React.SetStateAction<Profile | null>>
  profileRef: React.RefObject<HTMLDivElement | null>
}

declare global {
  interface Window {
    aivexWindow?: AivexWindow
    __TAURI_INTERNALS__?: unknown
  }
}
