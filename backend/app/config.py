import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    env_file = BACKEND_DIR / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.port = int(os.getenv("PORT", "3105"))
        self.site_url = os.getenv("SITE_URL", "https://einvoice.doaide.com").rstrip("/")
        self.db_path = os.getenv("EINVOICE_DB_PATH", str(BACKEND_DIR / "einvoice.db"))
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.cors_origins = [
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "http://localhost:3106,https://einvoice.doaide.com").split(",")
            if o.strip()
        ]


settings = Settings()
