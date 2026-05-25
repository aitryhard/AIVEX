import os
import sys
import logging
import urllib.request
import zipfile
import shutil
from pathlib import Path

from dotenv import load_dotenv


def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS) / relative_path

    return Path(__file__).parent / relative_path


class LogWriter:
    def __init__(self, logger, level):
        self.logger = logger
        self.level = level
        self.buffer = ""

    def write(self, message):
        if message.strip():
            self.logger.log(self.level, message.strip())

    def flush(self):
        pass


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
FFMPEG_EXE = FFMPEG_DIR / "ffmpeg.exe"

_FFMPEG_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"


def ensure_ffmpeg():
    if FFMPEG_EXE.exists():
        os.environ["PATH"] = str(FFMPEG_DIR) + os.pathsep + os.environ.get("PATH", "")
        return True

    print("FFmpeg not found, downloading...")
    try:
        FFMPEG_DIR.mkdir(parents=True, exist_ok=True)
        zip_path = FFMPEG_DIR / "ffmpeg.zip"
        urllib.request.urlretrieve(_FFMPEG_URL, zip_path)
        with zipfile.ZipFile(zip_path, "r") as z:
            for member in z.infolist():
                if member.filename.endswith("ffmpeg.exe"):
                    member.filename = os.path.basename(member.filename)
                    z.extract(member, FFMPEG_DIR)
                    break
        zip_path.unlink()
        if FFMPEG_EXE.exists():
            os.environ["PATH"] = str(FFMPEG_DIR) + os.pathsep + os.environ.get("PATH", "")
            print(f"FFmpeg downloaded: {FFMPEG_EXE}")
            return True
    except Exception as e:
        print(f"Failed to download ffmpeg: {e}")

    return False


if not ensure_ffmpeg():
    print("WARNING: FFmpeg not available, audio transcription will not work")

loaded = load_dotenv(env_path())
if not loaded:
    print("WARNING: .env file not found, using environment variables only")
