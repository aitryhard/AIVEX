import { LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";

function ServerErrorPanel({ activationStatus, setActivationStatus }) {
  const { panelAccentStyle } = useSettings();

  return (
    <AnimatePresence>
      {activationStatus?.status === "server_error" && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-[96px] right-5 w-[380px] z-50 rounded-3xl border backdrop-blur-2xl p-5"
          style={panelAccentStyle}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white/70 tracking-wide">Aivex</h2>
            <LoaderCircle size={16} className="animate-spin text-white/30" />
          </div>

          <p className="text-sm text-white/70">Ошибка подключения к серверу</p>
          <p className="text-xs text-white/35 mt-2 leading-relaxed">
            Приложение ожидает восстановления соединения.
          </p>

          <button
            onClick={() =>
              window.aivexWindow?.getActivationStatus().then(setActivationStatus)
            }
            className="mt-4 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition"
          >
            Проверить снова
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ServerErrorPanel;
