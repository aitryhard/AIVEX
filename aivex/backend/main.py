import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.chat import router as chat_router
from routes.audio import router as audio_router
from whisper_service import preload_whisper

app = FastAPI(title="Aivex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(audio_router)


@app.on_event("startup")
async def startup():
    thread = threading.Thread(target=preload_whisper, daemon=True)
    thread.start()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
