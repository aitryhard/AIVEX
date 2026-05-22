from fastapi import APIRouter

from whisper_service import get_whisper_status

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/whisper-status")
async def whisper_status():
    return get_whisper_status()
