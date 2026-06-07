import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { initTauriBridge } from "./services/tauriBridge";

window.onerror = (msg: string | Event, source?: string, line?: number, col?: number, error?: Error) => {
  console.error("GLOBAL ERROR:", msg, "AT", source, line, col, error);
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  console.error("UNHANDLED REJECTION:", event.reason);
};

async function boot() {
  try {
    await initTauriBridge();
  } catch (e) {
    console.error("Tauri bridge init failed:", e);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

boot();
