import { ImagePlus, AudioLines, Monitor } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useSettings } from "../contexts/SettingsContext";

function FooterInput() {
  const {
    clipboardImages, setClipboardImages,
    messageInputRef, imageInputRef,
    isLoading, isTyping, isRecording,
    autoClipboard, setAutoClipboard,
    sendMessage, cancelRequest,
    startDesktopAudioRecording, stopDesktopAudioRecording,
    whisperReady, whisperLoading, whisperFailed,
    isScreenPeeking, startScreenPeek, stopScreenPeek,
    freeMessagesLeft, freeMessagesLimit,
  } = useChat();
  const { uiSettings, currentTier, openSubscriptionAt } = useSettings();
  const isFree = currentTier === "free";
  const screenPeekAllowed = currentTier === "premium";

  return (
    <footer className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none">
      <div
        className="pointer-events-auto rounded-[28px] border border-white/10 p-3 flex flex-col shadow-2xl backdrop-blur-[40px]"
        style={{
          background: `${uiSettings.panelColor}CC`,
          borderColor: `${uiSettings.userColor}18`,
          boxShadow: `0 0 25px ${uiSettings.userColor}10`,
        }}
      >
        {clipboardImages.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {clipboardImages.map((image, index) => (
              <button
                  key={index}
                  onClick={() => window.aivexWindow?.openImage(image)}
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black/30 hover:border-white/25 transition cursor-pointer"
                >
                  <img
                    src={image}
                    alt="Clipboard"
                    className="w-full h-full object-cover"
                    onError={(e) => console.error("[CLIPBOARD IMG ERROR]", e.nativeEvent, "src starts with:", image?.slice(0, 50))}
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition">
                    <svg className="w-5 h-5 text-white/0 hover:text-white/80 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClipboardImages((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white/70 hover:text-white text-xs flex items-center justify-center z-10"
                  >
                    ×
                  </button>
                </button>
            ))}
          </div>
        )}

          <textarea
            ref={messageInputRef}
            onPaste={(e) => {
              if (isFree) return;
              const items = Array.from(e.clipboardData.items);

            const imageItems = items.filter((item) =>
              item.type.startsWith("image/"),
            );

            if (imageItems.length === 0) return;

            imageItems.forEach((item) => {
              const file = item.getAsFile();
              const reader = new FileReader();

              reader.onload = () => {
                setClipboardImages((prev) => [...prev, reader.result]);
              };

              reader.readAsDataURL(file);
            });

            e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isLoading && !isTyping) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Спросите Aivex"
          rows={3}
          disabled={isLoading || isTyping}
          className="w-full resize-none bg-transparent outline-none text-sm placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
        />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);

            files.forEach((file) => {
              const reader = new FileReader();

              reader.onload = () => {
                setClipboardImages((prev) => [...prev, reader.result]);
              };

              reader.readAsDataURL(file);
            });

            e.target.value = "";
          }}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <button
              disabled={isLoading || isTyping}
              onClick={() => isFree ? openSubscriptionAt("pro") : imageInputRef.current?.click()}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white/60"
              title={isFree ? "Изображения — откройте подписку" : "Прикрепить изображение"}
            >
              <ImagePlus size={15} />
            </button>

            <button
              disabled={(isLoading || isTyping) && !isRecording}
              onClick={
                isRecording
                  ? stopDesktopAudioRecording
                  : isFree
                    ? () => openSubscriptionAt("pro")
                    : whisperFailed || whisperLoading ? undefined : startDesktopAudioRecording
              }
              className={
                isRecording
                  ? "w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/80 border border-red-400/30 text-white hover:bg-red-500 transition"
                  : whisperFailed
                    ? "w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/20"
                    : whisperLoading || isLoading || isTyping || isFree
                      ? "w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/30"
                      : "w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition"
              }
              title={
                isRecording
                  ? "Остановить запись"
                  : isFree
                    ? "Аудио — откройте подписку"
                    : whisperFailed
                      ? "Модель распознавания не загружена"
                      : whisperLoading
                        ? "Загрузка модели распознавания..."
                        : "Записать аудио рабочего стола"
              }
            >
              <AudioLines size={15} />
            </button>

            <button
              onClick={isScreenPeeking ? stopScreenPeek : screenPeekAllowed && !isLoading && !isTyping ? startScreenPeek : screenPeekAllowed ? undefined : () => openSubscriptionAt("premium")}
              className={
                isScreenPeeking
                  ? "w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/80 border border-emerald-400/30 text-white hover:bg-emerald-500 transition"
                  : isFree
                    ? "w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/30"
                    : "w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition"
              }
              title={
                isScreenPeeking
                  ? "Остановить показ экрана"
                  : screenPeekAllowed
                    ? "Показать экран AI"
                    : "Screen Peek доступен только на Premium"
              }
            >
              <Monitor size={15} />
            </button>

            <button
              disabled={isLoading || isTyping}
              onClick={() => setAutoClipboard(!autoClipboard)}
              className={
                autoClipboard
                  ? "text-xs text-emerald-300/80 hover:text-emerald-200 transition disabled:opacity-40"
                  : "text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40"
              }
            >
              {autoClipboard ? "Буфер вкл." : "Буфер выкл."}
            </button>
          </div>

          {isFree && (
            <span className={`text-[10px] px-2 py-1 rounded-lg ${freeMessagesLeft <= 5 ? "text-red-300/80 bg-red-500/10" : "text-white/30 bg-white/[0.04]"}`}>
              {freeMessagesLeft}/{freeMessagesLimit}
            </span>
          )}

          <button
            disabled={isTyping}
            onClick={() => {
              if (isLoading) {
                cancelRequest();
              } else {
                sendMessage();
              }
            }}
            className={
              isLoading
                ? "px-5 py-2 rounded-2xl bg-red-500/80 text-white text-sm font-medium hover:bg-red-500 transition"
                : isTyping
                  ? "px-5 py-2 rounded-2xl bg-white/10 text-white/25 text-sm font-medium cursor-not-allowed"
                  : "px-5 py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            }
          >
            {isLoading ? "Отменить" : "Отправить"}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default FooterInput;
