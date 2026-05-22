from typing import List

from pydantic import BaseModel


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    text: str = ""
    profile: str = "Tutor"
    images: list[str] = []
    history: List[HistoryMessage] = []
    custom_prompt: str | None = None
