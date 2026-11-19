from datetime import date
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Lokal: SQLite. Produksi: postgresql+psycopg://user:pass@host:5432/db
    database_url: str = "sqlite:///./jejakmental.db"

    secret_key: str = "dev-secret-key-ganti-sebelum-produksi"
    algorithm: str = "HS256"
    session_hours: int = 24 * 7
    cookie_name: str = "jm_session"
    # Set true ketika frontend dan backend berada di domain berbeda (produksi).
    cookie_secure: bool = False

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    timezone_label: str = "WITA"

    # Data layanan wajib ditinjau berkala (risiko #1 di PRD). Halaman UI
    # menampilkan tanggal tinjauan terakhir agar pengguna tahu kesegaran data.
    data_reviewed_on: date = date(2026, 10, 25)

    # Mode demo mengizinkan jadwal contoh (ditandai jelas di UI).
    demo_schedule_enabled: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
