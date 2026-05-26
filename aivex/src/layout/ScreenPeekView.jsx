import { useState } from "react";
import { Minus, Square, X, MessageCircle, Loader2, Send, Settings } from "lucide-react";

function ScreenPeekView({ backendOnline, analysis, history, isAnalyzing, error, onStop, onSendToChat, screenPeekPrompt, setScreenPeekPrompt }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const selected = selectedIdx !== null ? history[selectedIdx] : null;
  const displayText = selected || analysis || "";

  return (
    <div className="fixed inset-0 z-40 select-none flex flex-col" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.35), inset 0 0 0 1px rgba(0,0,0,0.2)" }}>
      <div className="bg-gradient-to-b from-black/70 via-black/30 to-transparent h-14 flex items-start justify-between px-3 pt-2 draggable shrink-0">
        <div className="flex items-center gap-2.5 no-drag">
          <span className="text-base font-semibold text-white/70">Aivex</span>
          <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-400"}`} />
          {isAnalyzing && (
            <span className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-amber-400/70 bg-amber-400/10">
              <Loader2 size={12} className="animate-spin" />
              Анализ
            </span>
          )}
          {!isAnalyzing && !error && history.length > 0 && (
            <span className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-emerald-400/70 bg-emerald-400/10">
              {history.length} анализа
            </span>
          )}
          <button onClick={() => setShowPrompt(!showPrompt)} className={`ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs transition ${showPrompt ? "text-white/70 bg-white/10" : "text-white/35 hover:text-white hover:bg-white/10"}`}>
            <Settings size={13} />
          </button>
          <button onClick={onStop} className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-white/35 hover:text-white hover:bg-white/10 transition">
            <MessageCircle size={13} />
            Чат
          </button>
        </div>
        <div className="flex items-center gap-1 no-drag">
          <button onClick={() => window.aivexWindow?.minimize()} className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"><Minus size={15} /></button>
          <button onClick={() => window.aivexWindow?.maximize()} className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"><Square size={13} /></button>
          <button onClick={() => window.aivexWindow?.close()} className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-300 hover:bg-red-500/15 transition"><X size={15} /></button>
        </div>
      </div>

      {showPrompt && (
        <div className="border-b border-white/[0.06] bg-black/30 px-4 py-2">
          <textarea
            value={screenPeekPrompt}
            onChange={(e) => setScreenPeekPrompt(e.target.value)}
            placeholder="Промпт для анализа экрана... (пусто — стандартный)"
            rows={2}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-1.5 text-xs text-white/60 placeholder:text-white/20 outline-none resize-none"
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {history.length > 0 && (
          <div className="w-48 shrink-0 overflow-y-auto border-r border-white/[0.06] bg-black/30 p-2 space-y-1">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-2 rounded-xl text-[11px] transition ${
                  idx === selectedIdx ? "bg-white/[0.10] text-white/80" : "text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                }`}
              >
                <div className="truncate">{item.slice(0, 60)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-5">
            {error && <p className="text-sm text-red-300/90 leading-relaxed">{error}</p>}
            {!error && displayText && (
              <p className="text-sm text-white/85 leading-relaxed">{displayText}</p>
            )}
            {!error && isAnalyzing && !displayText && (
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Loader2 size={14} className="animate-spin" />
                Анализ экрана...
              </div>
            )}
            {!error && !isAnalyzing && !displayText && history.length === 0 && (
              <div className="text-sm text-white/30">Сканирование экрана...</div>
            )}
          </div>

          {displayText && (
            <div className="p-3 border-t border-white/[0.06] flex justify-center">
              <button
                onClick={() => onSendToChat(displayText)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs text-white/70 hover:text-white transition"
              >
                <Send size={12} />
                Отправить в чат
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScreenPeekView;
