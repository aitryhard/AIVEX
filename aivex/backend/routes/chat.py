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

    extracted_image_data = ""

    if payload.images:
        vision_content = [
            {
                "type": "text",
                "text": "Извлеки всю полезную информацию из изображений.",
            }
        ]

        for image in payload.images:
            vision_content.append(
                {"type": "image_url", "image_url": {"url": image}}
            )

        vision_models = [
            "google/gemini-2.0-flash-001",
            "google/gemini-2.0-flash-lite-preview-02-14",
            "google/gemini-pro-vision",
        ]

        for vision_model in vision_models:
            try:
                vision_response = openai_client.chat.completions.create(
                    model=vision_model,
                    messages=[
                        {
                            "role": "system",
                            "content": """
Ты анализируешь изображения для AI ассистента Aivex.

Твоя задача:
- извлечь весь видимый текст;
- описать важные элементы;
- если это задача/тест/код/таблица — передать данные максимально точно;
- если изображений несколько — анализируй каждое по порядку;
- не отвечать на вопрос пользователя, а только подготовить информацию для другой модели.
""",
                        },
                        {"role": "user", "content": vision_content},
                    ],
                    extra_headers={
                        "HTTP-Referer": "http://localhost:5173",
                        "X-OpenRouter-Title": "Aivex",
                    },
                )

                extracted_image_data = vision_response.choices[0].message.content

                if not extracted_image_data or "does not support" in extracted_image_data.lower():
                    raise ValueError(f"Model {vision_model} returned: {extracted_image_data}")

                break
            except Exception:
                continue

    final_user_text = ""

    if payload.text:
        final_user_text += f"Запрос пользователя:\n{payload.text}\n\n"

    if extracted_image_data:
        final_user_text += (
            "Данные, извлечённые из изображений:\n" f"{extracted_image_data}"
        )

    if not final_user_text.strip():
        final_user_text = "Пользователь отправил пустой запрос."

    conversation_messages = [
        {"role": "system", "content": system_prompt}
    ]

    for msg in payload.history[-12:]:
        conversation_messages.append({"role": msg.role, "content": msg.content})

    conversation_messages.append({"role": "user", "content": final_user_text})

    completion = openai_client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=conversation_messages,
        extra_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-OpenRouter-Title": "Aivex",
        },
    )

    return {"response": completion.choices[0].message.content}
