from fastapi import APIRouter

from app.db.seed_data import EMERGENCY_CONTACTS

router = APIRouter(tags=["emergency"])


@router.get("/emergency")
def emergency():
    return {
        "contacts": EMERGENCY_CONTACTS,
        "guidance": [
            "Bila Anda atau orang di dekat Anda dalam bahaya saat ini, hubungi layanan darurat lebih dulu.",
            "Sebutkan lokasi selengkap mungkin: kelurahan, patokan, dan nomor yang bisa dihubungi.",
            "Tetap bersama orang tersebut bila aman untuk dilakukan, dan jauhkan benda berbahaya.",
        ],
        "note": (
            "Kontak di atas ditinjau terakhir 25 Oktober 2026 dari sumber resmi. "
            "Nomor dapat berubah; bila tidak tersambung, gunakan 112 atau IGD terdekat."
        ),
    }
