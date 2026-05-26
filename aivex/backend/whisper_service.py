import os
import tempfile

model = None
model_loading = False
model_loaded = False


def preload_whisper():
    global model, model_loading, model_loaded

    model_loading = True

    try:
        import whisper
        model = whisper.load_model("base")
        model_loaded = True
    except Exception:
        model_loaded = False
        import threading
        threading.Timer(30.0, preload_whisper).start()
    finally:
        model_loading = False


async def transcribe_audio(file):
    from fastapi import UploadFile

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
            temperature=0.2,
            compression_ratio_threshold=2.0,
            logprob_threshold=-1.0,
            no_speech_threshold=0.6,
            condition_on_previous_text=False,
        )

        return {"text": result["text"]}

    except Exception as e:
        return {"text": f"Ошибка распознавания: {str(e)}"}

    finally:
        if "temp_path" in locals() and os.path.exists(temp_path):
            os.remove(temp_path)


def get_whisper_status():
    return {"loaded": model_loaded, "loading": model_loading}
