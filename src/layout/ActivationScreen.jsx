import { Minus, Square, X, LoaderCircle } from "lucide-react";

function ActivationScreen({ activationStatus, setActivationStatus }) {
  return (
    <main className="w-screen h-screen bg-black text-white overflow-hidden">
      <div className="h-8 flex items-center justify-end px-4 pt-[2px] pb-[2px] border-b border-white/10 bg-black/30 backdrop-blur-2xl draggable">
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={() => window.aivexWindow?.minimize()}
            className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <Minus size={16} />
          </button>

          <button
            onClick={() => window.aivexWindow?.maximize()}
            className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <Square size={13} />
          </button>

          <button
            onClick={() => window.aivexWindow?.close()}
            className="w-8 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-red-300 hover:bg-red-500/15 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-32px)] flex items-center justify-center">
        <div className="w-[340px] rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8 text-center">
          <div className="text-3xl font-bold tracking-tight">Aivex</div>

          <div className="mt-6 text-white/80 text-sm">
            {activationStatus.status === "pending"
              ? "Ожидание активации..."
              : activationStatus.status === "denied"
                ? "Доступ отклонён"
                : "Ошибка подключения к серверу"}
          </div>

          <div className="mt-4 text-xs text-white/35">
            Приложение ожидает подтверждения устройства.
          </div>

          <div className="mt-7 flex justify-center">
            <LoaderCircle size={26} className="animate-spin text-white/50" />
          </div>

          <button
            onClick={() =>
              window.aivexWindow?.getActivationStatus().then(setActivationStatus)
            }
            className="mt-6 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/70 hover:bg-white/15 hover:text-white transition"
          >
            Проверить снова
          </button>
        </div>
      </div>
    </main>
  );
}

export default ActivationScreen;