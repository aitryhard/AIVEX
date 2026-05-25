import os
import tempfile

import whisper
from fastapi import UploadFile

model = None
model_loading = False
model_loaded = False


def preload_whisper():
    global model, model_loading, model_loaded

    model_loading = True

    try:
        model = whisper.load_model("tiny")
        model_loaded = True
    except Exception:
        model_loaded = False
    finally:
        model_loading = False


async def transcribe_audio(file: UploadFile):
    global model

    if model is None:
        return {
            "text": "Модель распознавания ещё загружается, попробуйте через несколько секунд."
        }

    try:
        suffix = os.path.splitext(file.filename)[1] or ".webm"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(await file.read())
            temp_path = temp.name

        result = model.transcribe(
            temp_path,
            language="ru",
            fp16=False,
            temperature=0,
            condition_on_previous_text=True,
        )

        return {"text": result["text"]}

    except Exception as e:
        return {"text": f"Ошибка распознавания: {str(e)}"}

    finally:
        if "temp_path" in locals() and os.path.exists(temp_path):
            os.remove(temp_path)


def get_whisper_status():
    return {"loaded": model_loaded, "loading": model_loading}
