import { Minus, Square, X, MessageCircle, Loader2 } from "lucide-react";

function ScreenPeekView({ backendOnline, analysis, isAnalyzing, error, onStop }) {
  return (
    <div className="fixed inset-0 z-40 select-none" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.35), inset 0 0 0 1px rgba(0,0,0,0.2)" }}>
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent h-14 flex items-start justify-between px-3 pt-2 draggable">
        <div className="flex items-center gap-2.5 no-drag">
          <span className="text-base font-semibold text-white/70">
            Aivex
          </span>
          <span
            className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-400"}`}
          />
          {!isAnalyzing && !error && (
            <span className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-emerald-400/70 bg-emerald-400/10">
              Наблюдение
            </span>
          )}
          {isAnalyzing && (
            <span className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-amber-400/70 bg-amber-400/10">
              Анализ...
            </span>
          )}
          <button
            onClick={onStop}
            className="ml-1 flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs text-white/35 hover:text-white hover:bg-white/10 transition"
          >
            <MessageCircle size={13} />
            Чат
          </button>
        </div>

        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={() => window.aivexWindow?.minimize()}
            className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => window.aivexWindow?.maximize()}
            className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <Square size={13} />
          </button>
          <button
            onClick={() => window.aivexWindow?.close()}
            className="w-8 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-300 hover:bg-red-500/15 transition"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-20 pb-8 px-5">
        {error && (
          <p className="text-sm text-red-300/90 leading-relaxed">
            {error}
          </p>
        )}
        {!error && analysis && (
          <div>
            <div className="text-[10px] text-white/30 mb-1 font-medium uppercase tracking-wider">
              Обнаружена задача
            </div>
            <p className="text-sm text-white/85 leading-relaxed max-h-40 overflow-y-auto scrollbar-hide">
              {analysis}
            </p>
          </div>
        )}
        {!error && isAnalyzing && !analysis && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Loader2 size={14} className="animate-spin" />
            Анализ экрана...
          </div>
        )}
        {!error && !isAnalyzing && !analysis && (
          <div className="text-sm text-white/30">
            Сканирование экрана...
          </div>
        )}
      </div>
    </div>
  );
}

export default ScreenPeekView;
