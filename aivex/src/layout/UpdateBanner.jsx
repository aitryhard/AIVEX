import { AnimatePresence, motion } from "framer-motion";

function UpdateBanner({
  updateStatus,
  showSplash,
  setSplashMode,
  setShowSplash,
}) {
  return (
    <AnimatePresence>
      {updateStatus && !showSplash && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute top-[118px] left-1/2 -translate-x-1/2 z-[9999] rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl px-4 py-3 shadow-2xl flex items-center gap-3"
        >
          <span className="text-xs text-white/75">
            {updateStatus === "available"
            ? "Доступно обновление"
            : "Обновление готово"}
          </span>

          {updateStatus === "available" && (
            <button
                onClick={() => window.aivexWindow.downloadUpdate()}
                className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
            >
                Скачать
            </button>
        )}

          {updateStatus === "downloaded" && (
            <button
              onClick={() => {
                setSplashMode("update");
                setShowSplash(true);

                setTimeout(() => {
                  window.aivexWindow.installUpdate();
                }, 700);
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
            >
              Обновить
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpdateBanner;