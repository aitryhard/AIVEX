import traceback
import os

import httpx
from fastapi import APIRouter

from models import ChatRequest

router = APIRouter()

ACTIVATION_SERVER = os.getenv("ACTIVATION_SERVER", "https://server-activation-06sn.onrender.com")


@router.post("/chat")
async def chat(payload: ChatRequest):
    try:
        if not payload.device_id:
            return {"error": "device_id is required"}

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{ACTIVATION_SERVER}/chat",
                json=payload.model_dump(),
            )

        if response.status_code != 200:
            error_detail = "server_error"
            try:
                body = response.json()
                error_detail = body.get("detail", "server_error")
            except Exception:
                error_detail = response.text or "server_error"
            return {"error": error_detail}

        return response.json()

    except httpx.ConnectError:
        return {"error": "server_unreachable"}
    except httpx.TimeoutException:
        return {"error": "server_timeout"}
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
