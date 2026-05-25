import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path

    return Path(__file__).parent / relative_path


def env_path():
    env = None
    if hasattr(sys, "_MEIPASS"):
        env = Path(sys.executable).parent / ".env"
    else:
        env = Path(__file__).parent / ".env"

    if env.exists():
        return env

    fallback = env.with_suffix(".env.example")
    if fallback.exists():
        return fallback

    return env


FFMPEG_DIR = resource_path("ffmpeg")

os.environ["PATH"] = str(FFMPEG_DIR) + os.pathsep + os.environ.get("PATH", "")

loaded = load_dotenv(env_path())
if not loaded:
    print("WARNING: .env file not found, using environment variables only")
