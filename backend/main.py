import os

from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel


load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

if not API_KEY:
    print("OPENROUTER_API_KEY not found")
    input("Press Enter to exit...")
    exit()


app = FastAPI(title="Aivex API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    text: str = ""
    profile: str = "Tutor"
    images: list[str] = []
    history: List[HistoryMessage] = []
    custom_prompt: str | None = None


SYSTEM_PROMPTS = {
    "Quick": """
Ты Aivex в режиме Quick.

Правила:
- отвечай кратко;
- не расписывай лишнее;
- не начинай ответ словами "Ответ:" или "Пояснение:";
- не используй шаблонные заголовки без необходимости;
- если вопрос тестовый — дай только итог и одну короткую причину.
""",

    "Tutor": """
Ты Aivex в режиме Tutor.

Правила:
- объясняй спокойно и понятно;
- помогай разобраться в теме;
- используй простые примеры;
- структурируй ответ.
""",

    "Detailed": """
Ты Aivex в режиме Detailed.

Правила:
- давай подробные ответы;
- объясняй причины и логику;
- используй примеры;
- разбивай объяснение по шагам.
""",

    "Code": """
Ты Aivex в режиме Code.

Правила:
- отвечай как технический помощник;
- объясняй кратко и по делу;
- если показываешь код — используй markdown code block;
- всегда указывай язык блока, например ```js, ```python, ```html;
- сначала объясняй идею;
- потом показывай код;
- в конце при необходимости дай готовое решение;
- не добавляй воду.
""",
}

@app.get("/health")
async def health():
    return {
        "status": "ok"
    }


@app.post("/chat")
async def chat(payload: ChatRequest):
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

    # 1. Если есть изображения — сначала анализируем их через Gemini
    if payload.images:
        vision_content = [
            {
                "type": "text",
                "text": "Извлеки всю полезную информацию из изображений."
            }
        ]

        for image in payload.images:
            vision_content.append({
                "type": "image_url",
                "image_url": {
                    "url": image
                }
            })

        vision_response = openai_client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
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
"""
                },
                {
                    "role": "user",
                    "content": vision_content
                }
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-OpenRouter-Title": "Aivex",
            },
        )

        extracted_image_data = vision_response.choices[0].message.content

    # 2. Формируем финальный запрос для GPT
    final_user_text = ""

    if payload.text:
        final_user_text += f"Запрос пользователя:\n{payload.text}\n\n"

    if extracted_image_data:
        final_user_text += (
            "Данные, извлечённые из изображений:\n"
            f"{extracted_image_data}"
        )

    if not final_user_text.strip():
        final_user_text = "Пользователь отправил пустой запрос."

    # 3. GPT даёт финальный ответ
    conversation_messages = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    for msg in payload.history[-12:]:
        conversation_messages.append({
            "role": msg.role,
            "content": msg.content,
        })

    conversation_messages.append({
        "role": "user",
        "content": final_user_text,
    })

    completion = openai_client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=conversation_messages,
        extra_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-OpenRouter-Title": "Aivex",
        },
    )

    return {
        "response": completion.choices[0].message.content
    }


if __name__ == "__main__":
    import uvicorn

    print("Starting Aivex backend...")

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
    )