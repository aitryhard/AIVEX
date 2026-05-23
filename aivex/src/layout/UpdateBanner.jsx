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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[99999] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-[180px] h-[180px] rounded-3xl border border-white/[0.06] backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center pointer-events-auto"
            style={{ background: "rgba(12,12,14,0.96)" }}
          >
            <div className="text-center">
              <div className="text-[32px] tracking-tight font-['Space_Grotesk'] font-bold text-white">
                Aivex
              </div>

              <div className="mt-3 text-sm text-white/45 leading-tight px-4">
                {updateStatus === "available"
                  ? "Доступно обновление"
                  : "Обновление готово"}
              </div>
            </div>

            {updateStatus === "available" && (
              <button
                onClick={() => window.aivexWindow?.downloadUpdate()}
                className="mt-4 px-4 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
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
                    window.aivexWindow?.installUpdate();
                  }, 700);
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
              >
                Обновить
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpdateBanner;