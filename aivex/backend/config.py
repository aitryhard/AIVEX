import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path

    return Path(__file__).parent / relative_path


def env_path():
    if hasattr(sys, "_MEIPASS"):
        return Path(sys.executable).parent / ".env"

    return Path(__file__).parent / ".env"


FFMPEG_DIR = resource_path("ffmpeg")

os.environ["PATH"] = str(FFMPEG_DIR) + os.pathsep + os.environ.get("PATH", "")

load_dotenv(env_path())

API_KEY = os.getenv("OPENROUTER_API_KEY")

if not API_KEY:
    sys.exit("OPENROUTER_API_KEY not found")

openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)
