import traceback

from fastapi import APIRouter

from config import openai_client
from models import ChatRequest
from prompts import SYSTEM_PROMPTS

router = APIRouter()


@router.post("/chat")
async def chat(payload: ChatRequest):
    try:
        return await _chat(payload)
    except Exception as e:
        traceback.print_exc()
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})


async def _chat(payload: ChatRequest):
    system_prompt = payload.custom_prompt or SYSTEM_PROMPTS.get(
        payload.profile,
        SYSTEM_PROMPTS["Tutor"],
    )
    system_prompt += """

    Общие правила:
    - не начинай ответ словами "Ответ:" или "Пояснение:";
    - не используй шаблонные заголовки без необходимости;
    - не здоровайся без причины;
    - не используй фразы вроде "Как posso помочь?";
    - отвечай кратко, спокойно и профессионально.
    """

    conversation_messages = [
        {"role": "system", "content": system_prompt}
    ]

    for msg in payload.history[-12:]:
        conversation_messages.append({"role": msg.role, "content": msg.content})

    user_content = []

    if payload.text:
        user_content.append({"type": "text", "text": payload.text})

    for image in payload.images:
        user_content.append({"type": "image_url", "image_url": {"url": image}})

    if not user_content:
        user_content.append({"type": "text", "text": "Пользователь отправил пустой запрос."})

    conversation_messages.append({"role": "user", "content": user_content})

    print(f"[CHAT] model={payload.model} images={len(payload.images)} provider=openai")

    completion = openai_client.chat.completions.create(
        model=payload.model,
        messages=conversation_messages,
        extra_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-OpenRouter-Title": "Aivex",
            "X-OpenRouter-Provider": "openai",
        },
        max_tokens=4096,
    )

    return {"response": completion.choices[0].message.content}
