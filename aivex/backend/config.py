import os
import sys
from pathlib import Path

from dotenv import load_dotenv


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
