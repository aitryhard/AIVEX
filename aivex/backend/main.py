import threading
import logging
import sys
import warnings
from logging.handlers import RotatingFileHandler
from pathlib import Path

import config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.chat import router as chat_router
from routes.audio import router as audio_router
from whisper_service import preload_whisper

warnings.filterwarnings("ignore", message=".*on_event is deprecated.*")

log_dir = Path(sys.executable).parent if getattr(sys, "frozen", False) else Path(__file__).parent
log_path = log_dir / "aivex-backend.log"

handler = RotatingFileHandler(log_path, maxBytes=5*1024*1024, backupCount=3)
logging.basicConfig(
    handlers=[handler],
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("aivex")

app = FastAPI(title="Aivex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "null", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(audio_router)


@app.on_event("startup")
async def startup():
    logger.info("Backend starting...")
    thread = threading.Thread(target=preload_whisper, daemon=True)
    thread.start()


if __name__ == "__main__":
    import uvicorn

    try:
        logger.info("Aivex backend v1.1.3 starting on 127.0.0.1:8000")
        sys.stdout = config.LogWriter(logger, logging.INFO)
        sys.stderr = config.LogWriter(logger, logging.ERROR)

        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="warning",
        )
    except Exception as e:
        logger.error(f"Failed to start: {e}", exc_info=True)
        print(f"FATAL: {e}", file=sys.__stderr__)
        sys.exit(1)
