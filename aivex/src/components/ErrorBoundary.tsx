import { Component, ReactNode, ErrorInfo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-[99999] flex items-center justify-center bg-black/80"
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
                <div className="text-[32px] tracking-tight font-['Space_Grotesk'] font-bold text-white">
                  Aivex
                </div>

                <div className="mt-3 text-sm text-white/45 leading-tight px-4">
                  Что-то пошло не так
                </div>
              </div>

              <button
                onClick={this.handleReset}
                className="mt-4 px-4 py-1.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition"
              >
                Попробовать снова
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}
