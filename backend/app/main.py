from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.startup_data import startup_data

app = FastAPI(
    title="JejakMental API",
    description="Direktori layanan kesehatan jiwa Kota Palu",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "released": settings.data_reviewed_on.isoformat()}


# Vercel serverless tidak menjalankan event startup secara andal, jadi
# penyiapan data dijalankan sekali saat modul dimuat (idempoten).
with startup_data():
    pass
