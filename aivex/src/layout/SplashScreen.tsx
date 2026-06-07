import { AnimatePresence, motion } from "framer-motion";

function SplashScreen({ showSplash, splashMode }: { showSplash: boolean; splashMode: string }) {
  return (
    <AnimatePresence>
      {showSplash && (
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
            className="w-[180px] h-[180px] rounded-3xl border border-white/[0.06] backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center"
            style={{ background: "rgba(12,12,14,0.96)" }}
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                }}
                className="text-[32px] tracking-tight font-['Space_Grotesk'] font-bold text-white"
              >
                Aivex
              </motion.div>

              {splashMode === "update" && (
                <div className="mt-3 text-sm text-white/45">
                  Обновляюсь...
                </div>
              )}
            </div>

            <div className="flex gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-2.5 h-2.5 rounded-full bg-white/75"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
