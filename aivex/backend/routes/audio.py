from fastapi import APIRouter, UploadFile, File

from whisper_service import transcribe_audio

router = APIRouter()


@router.post("/transcribe-audio")
async def transcribe(file: UploadFile = File(...)):
    return await transcribe_audio(file)
