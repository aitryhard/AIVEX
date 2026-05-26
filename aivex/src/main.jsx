import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { initTauriBridge } from "./services/tauriBridge.js";

window.onerror = (msg, source, line, col, error) => {
  console.error("GLOBAL ERROR:", msg, "AT", source, line, col, error);
};

window.onunhandledrejection = (event) => {
  console.error("UNHANDLED REJECTION:", event.reason);
};

async function boot() {
  try {
    await initTauriBridge();
  } catch (e) {
    console.error("Tauri bridge init failed:", e);
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

boot();
