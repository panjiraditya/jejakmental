from datetime import date, timedelta

from app.db.seed_data import WHO5_OPTIONS

DISCLAIMER = (
    "Ini bukan diagnosis. Skrining hanya gambaran singkat tentang kesejahteraan "
    "Anda dalam dua minggu terakhir dan tidak menggantikan penilaian tenaga "
    "profesional. Bila Anda merasa ada yang mengganggu, berbicara dengan psikolog "
    "atau psikiater adalah langkah yang wajar."
)

LEVELS = [
    (0, 7, "perlu_perhatian"),
    (8, 12, "rendah"),
    (13, 17, "cukup"),
    (18, 25, "baik"),
]


def grading(score: int) -> dict:
    level = "baik"
    for lo, hi, name in LEVELS:
        if lo <= score <= hi:
            level = name

    if score <= 7:
        return {
            "level": level,
            "headline": "Kesejahteraan Anda sedang terasa rendah akhir-akhir ini",
            "meaning": (
                "Jawaban Anda menunjukkan bahwa dua minggu terakhir terasa berat. "
                "Hal seperti ini bisa dialami siapa saja dan bukan tanda kelemahan. "
                "Banyak orang membaik setelah berbicara dengan tenaga profesional atau "
                "orang yang mereka percaya."
            ),
            "suggestions": [
                "Pertimbangkan bicara dengan psikolog di puskesmas terdekat (gratis) minggu ini.",
                "Ceritakan hasil ini kepada satu orang yang Anda percaya.",
                "Bila pernah terlintas pikiran menyakiti diri, hubungi layanan darurat di halaman Bantuan.",
                "Jaga tidur dan makan; tetap lakukan hal kecil yang biasanya membantu.",
            ],
        }
    if score <= 12:
        return {
            "level": level,
            "headline": "Ada bagian dari hari-hari Anda yang terasa berat",
            "meaning": (
                "Skor Anda rendah-sedang. Artinya sebagian waktu terasa melelahkan, "
                "namun masih ada momen yang terasa baik. Ini titik yang tepat untuk "
                "menata dukungan sebelum beban menumpuk."
            ),
            "suggestions": [
                "Coba tulis singkat apa saja yang paling menguras energi dua minggu ini.",
                "Lihat opsi konseling yang terjangkau atau gratis di direktori.",
                "Atur satu percakapan dengan orang dekat tanpa harus menceritakan semuanya.",
            ],
        }
    if score <= 17:
        return {
            "level": level,
            "headline": "Kesejahteraan Anda tergolong cukup",
            "meaning": (
                "Anda melaporkan cukup banyak momen baik, meski belum sepenuhnya "
                "stabil. Menjaga ritme yang sudah berjalan biasanya lebih mudah "
                "daripada memulai dari nol saat kondisi memburuk."
            ),
            "suggestions": [
                "Catat hal kecil yang membantu Anda merasa lebih tenang bulan ini.",
                "Tentukan tanda-tanda awal ketika Anda mulai kehilangan tenaga, agar tahu kapan mencari bantuan.",
                "Bila ada keluhan fisik yang berulang tanpa sebab jelas, pertimbangkan pemeriksaan ke faskes.",
            ],
        }
    return {
        "level": level,
        "headline": "Kesejahteraan Anda tergolong baik",
        "meaning": (
            "Dua minggu terakhir Anda merasa cukup bersemangat dan rileks. "
            "Skrining ini tetap tidak menutup kemungkinan adanya hal yang ingin "
            "Anda bicarakan."
        ),
        "suggestions": [
            "Teruskan kebiasaan yang mendukung, dan kenali hal yang menguras energi Anda.",
            "Bila suatu hari kondisi berubah, Anda bisa mengulang skrining ini.",
        ],
    }


def score_who5(answers: dict[int, int]) -> int:
    return sum(int(v) for v in answers.values())


def next_date_for_weekday(target: int, start: date | None = None) -> date:
    """Tanggal terdekat (termasuk hari ini) untuk hari dalam pekan, 0 = Senin."""
    today = start or date.today()
    delta = (target - today.weekday()) % 7
    return today + timedelta(days=delta)


def who5_options() -> list[dict]:
    return WHO5_OPTIONS
