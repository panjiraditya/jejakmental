"""Data direktori JejakMental — Kota Palu.

ATURAN ISI DATA
1. Hanya memuat layanan yang dapat diverifikasi dari sumber publik (situs
   resmi faskes, SIRS Kemenkes, pemberitaan, atau kanal resmi pemkot).
2. Nama tenaga kesehatan hanya dicantumkan bila namanya dipublikasikan
   sendiri oleh lembaganya. Tarif dan jam praktik yang tidak dipublikasikan
   dibiarkan kosong (None) — bukan ditebak.
3. Slot `bookable` adalah slot CONTOH untuk mendemokan alur booking. Slot
   `call_to_book` berarti jadwal riil perlu dikonfirmasi lewat telepon.
"""

REVIEWED_ON = "2026-10-25"

FACILITIES = [
    {
        "slug": "rsud-madani",
        "name": "RSUD Madani Provinsi Sulawesi Tengah",
        "kind": "psychiatric_hospital",
        "summary": (
            "Satu-satunya rumah sakit jiwa milik pemerintah provinsi di Sulawesi "
            "Tengah dan rujukan utama kesehatan jiwa. Memiliki Klinik Jiwa (psikiater) "
            "dan Klinik Psikologi (psikolog), terapi anak, serta layanan rawat inap jiwa."
        ),
        "address": "Jl. Thalua Konchi No. 11, Kel. Mamboro Barat, Kec. Palu Utara, Kota Palu",
        "district": "Palu Utara",
        "phone": "(0451) 491605",
        "whatsapp": None,
        "website": "https://www.rsmadani.sultengprov.go.id/",
        "services": (
            "Klinik jiwa (psikiater)|Klinik psikologi|Terapi anak & tumbuh kembang|"
            "Terapi wicara|Okupasi terapi|Rawat inap jiwa|IGD 24 jam"
        ),
        "age_groups": "Anak|remaja|dewasa|lansia",
        "cost_note": (
            "Belum dirinci di situs resmi. Tersedia kelas VIP hingga kelas III; "
            "hubungi pendaftaran untuk estimasi biaya. Pasien BPJS mengikuti alur rujukan."
        ),
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": True,
        "emergency_24h": True,
        "online_available": False,
        "opening_note": "Poliklinik Senin–Kamis 07.30–16.00, Jumat 07.30–16.30. IGD 24 jam.",
        "online_note": None,
        "access_note": (
            "Berjarak sekitar 13 km dari pusat kota. Bila sulit menjangkau lokasi, "
            "mulai dari puskesmas terdekat agar bisa dirujuk."
        ),
        "source_url": "https://www.rsmadani.sultengprov.go.id/profil/sejarah/",
        "is_verified": True,
        "is_published": True,
        "slots": [
            # Jadwal riil: perlu dikonfirmasi lewat telepon.
            {"weekday": 0, "start_time": "08:00", "end_time": "12:00", "label": "Klinik Jiwa (pagi)",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 2, "start_time": "08:00", "end_time": "12:00", "label": "Klinik Jiwa (pagi)",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 4, "start_time": "08:00", "end_time": "12:00", "label": "Klinik Jiwa (pagi)",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 1, "start_time": "09:00", "end_time": "11:00", "label": "Klinik Psikologi",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 3, "start_time": "09:00", "end_time": "11:00", "label": "Klinik Psikologi",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "rsud-undata",
        "name": "RSUD Undata Provinsi Sulawesi Tengah",
        "kind": "hospital",
        "summary": (
            "Rumah sakit rujukan milik Pemprov Sulawesi Tengah dengan pelayanan "
            "kedokteran jiwa/psikiatri, psikogeriatri, dan NAPZA, dilayani satu "
            "dokter spesialis jiwa serta tim psikologi klinis."
        ),
        "address": "Jl. R.E. Martadinata, Kel. Talise, Kec. Mantikulore, Kota Palu",
        "district": "Mantikulore",
        "phone": "(0451) 4131446",
        "whatsapp": None,
        "website": "https://rsudundata.sultengprov.go.id/",
        "services": (
            "Psikiatri umum|Psikogeriatri|NAPZA|Psikologi & psikometri|"
            "Kesehatan jiwa masyarakat|IGD 24 jam"
        ),
        "age_groups": "Remaja|dewasa|lansia",
        "cost_note": (
            "Belum dipublikasikan. Poliklinik rawat jalan melayani pasien umum "
            "maupun BPJS (sesuai alur rujukan)."
        ),
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": True,
        "emergency_24h": True,
        "online_available": False,
        "opening_note": "Poliklinik rawat jalan Senin–Jumat 08.00–14.00 WITA. IGD 24 jam.",
        "online_note": None,
        "access_note": (
            "Berada di kawasan Talise, dekat jalur Trans Sulawesi sehingga mudah "
            "dijangkau dengan kendaraan umum dari arah kota."
        ),
        "source_url": "https://sirs.kemkes.go.id/fo/home/profile_rs/7271014",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 1, "start_time": "09:00", "end_time": "12:00", "label": "Poli Kedokteran Jiwa",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 3, "start_time": "09:00", "end_time": "12:00", "label": "Poli Kedokteran Jiwa",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "rsud-anutapura",
        "name": "RSUD Anutapura Kota Palu",
        "kind": "hospital",
        "summary": (
            "Rumah sakit milik Pemerintah Kota Palu dengan layanan spesialis "
            "kejiwaan dan psikolog klinis. Menyediakan pendaftaran antrean online "
            "dan poliklinik sore."
        ),
        "address": "Jl. Kangkung No. 1, Kec. Palu Barat, Kota Palu",
        "district": "Palu Barat",
        "phone": "(0451) 460570",
        "whatsapp": "0822-2724-9685",
        "website": "https://www.rsapkotapalu.com/",
        "services": (
            "Spesialis kejiwaan|Psikologi klinis|Klinik tumbuh kembang anak|"
            "Klinik lansia/geriatri|IGD 24 jam|Antrean online"
        ),
        "age_groups": "Anak|remaja|dewasa|lansia",
        "cost_note": (
            "Belum dipublikasikan untuk poli jiwa. Melayani peserta BPJS; "
            "poliklinik sore eksekutif khusus pasien tunai/asuransi swasta."
        ),
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": True,
        "emergency_24h": True,
        "online_available": False,
        "opening_note": "Pengambilan antrean Senin–Kamis & Sabtu 08.00–12.00, Jumat 08.00–10.00.",
        "online_note": None,
        "access_note": "Berada di dalam kota, dapat dijangkau angkutan umum kota.",
        "source_url": "https://www.rsapkotapalu.com/dokter",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 0, "start_time": "08:00", "end_time": "11:00", "label": "Poli Jiwa",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 2, "start_time": "08:00", "end_time": "11:00", "label": "Poli Jiwa",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "puskesmas-singgani",
        "name": "Puskesmas Singgani",
        "kind": "puskesmas",
        "summary": (
            "Puskesmas di pusat kota dengan layanan konseling psikologi klinis "
            "gratis sejak Oktober 2025, dikerjasamakan Dinkes Kota Palu dengan "
            "Bincang Psikologi. Kunjungan psikolog tertinggi di Kota Palu."
        ),
        "address": "Kec. Palu Timur, Kota Palu (cek lokasi via Dinkes Kota Palu)",
        "district": "Palu Timur",
        "phone": None,
        "whatsapp": None,
        "website": "https://dinkes.palukota.go.id/",
        "services": (
            "Konseling psikologi klinis|Skrining kesehatan jiwa|Psikoterapi sederhana|"
            "Rujukan ke psikiater"
        ),
        "age_groups": "Anak|remaja|dewasa|lansia",
        "cost_note": (
            "Konseling psikologi gratis (program Dinkes Kota Palu). Peserta BPJS "
            "mengikuti alur pelayanan biasa."
        ),
        "cost_min": 0,
        "cost_max": 0,
        "accepts_bpjs": True,
        "emergency_24h": False,
        "online_available": True,
        "opening_note": "Senin–Sabtu sesuai jam pelayanan puskesmas (praktik terbatas).",
        "online_note": "Konseling daring gratis lewat aplikasi Sangu Palu pukul 16.00–19.00 WITA.",
        "access_note": (
            "Pilihan paling terjangkau untuk langkah pertama. Tidak perlu rujukan "
            "untuk konseling; biaya Rp0."
        ),
        "source_url": "https://palukota.go.id/empat-psikolog-klinis-mulai-bertugas-di-puskesmas-1-oktober-2025-kota-palu-prioritaskan-kesehatan-mental/",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 0, "start_time": "09:00", "end_time": "12:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 5, "start_time": "09:00", "end_time": "11:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "puskesmas-birobuli",
        "name": "Puskesmas Birobuli",
        "kind": "puskesmas",
        "summary": (
            "Puskesmas dengan konseling psikolog klinis gratis yang tercover BPJS. "
            "Pasien cukup mendaftar di loket seperti layanan lain, lalu diarahkan "
            "ke layanan konseling."
        ),
        "address": "Kel. Birobuli, Kec. Palu Selatan, Kota Palu",
        "district": "Palu Selatan",
        "phone": None,
        "whatsapp": None,
        "website": "https://dinkes.palukota.go.id/",
        "services": "Konseling psikologi klinis|Skrining kesehatan jiwa|Konseling psikoterapi",
        "age_groups": "Remaja|dewasa|lansia",
        "cost_note": "Gratis dan tercover BPJS Kesehatan.",
        "cost_min": 0,
        "cost_max": 0,
        "accepts_bpjs": True,
        "emergency_24h": False,
        "online_available": True,
        "opening_note": "Senin–Sabtu mengikuti jam pelayanan puskesmas.",
        "online_note": "Konseling daring gratis lewat aplikasi Sangu Palu pukul 16.00–19.00 WITA.",
        "access_note": "Terjangkau dari kawasan Palu Selatan; layanan dibuka sejak 1 Oktober 2025.",
        "source_url": "https://palu.tribunnews.com/palu/170421/puskesmas-birobuli-sediakan-layanan-konseling-psikoterapi-gratis-tercover-bpjs-",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 2, "start_time": "09:00", "end_time": "12:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 4, "start_time": "09:00", "end_time": "12:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "puskesmas-tawaeli",
        "name": "Puskesmas Tawaeli",
        "kind": "puskesmas",
        "summary": (
            "Puskesmas di Kecamatan Palu Utara dengan konseling psikologi klinis "
            "gratis, bagian dari program kesehatan jiwa Dinkes Kota Palu."
        ),
        "address": "Kec. Tawaeli, Kota Palu",
        "district": "Tawaeli",
        "phone": None,
        "whatsapp": None,
        "website": "https://dinkes.palukota.go.id/",
        "services": "Konseling psikologi klinis|Skrining kesehatan jiwa|Rujukan",
        "age_groups": "Anak|remaja|dewasa|lansia",
        "cost_note": "Konseling psikologi gratis.",
        "cost_min": 0,
        "cost_max": 0,
        "accepts_bpjs": True,
        "emergency_24h": False,
        "online_available": True,
        "opening_note": "Senin–Sabtu mengikuti jam pelayanan puskesmas.",
        "online_note": "Konseling daring gratis lewat aplikasi Sangu Palu pukul 16.00–19.00 WITA.",
        "access_note": "Untuk warga Palu Utara dan Tawaeli agar tidak perlu ke pusat kota.",
        "source_url": "https://sulteng.antaranews.com/berita/361981/pemkot-palu-perkuat-layanan-kesehatan-mental-bagi-masyarakat",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 1, "start_time": "09:00", "end_time": "12:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "puskesmas-lere",
        "name": "Puskesmas Lere",
        "kind": "puskesmas",
        "summary": (
            "Puskesmas di Kecamatan Palu Barat dengan konseling psikologi klinis "
            "gratis, bagian dari program kesehatan jiwa Dinkes Kota Palu."
        ),
        "address": "Kec. Palu Barat, Kota Palu",
        "district": "Palu Barat",
        "phone": None,
        "whatsapp": None,
        "website": "https://dinkes.palukota.go.id/",
        "services": "Konseling psikologi klinis|Skrining kesehatan jiwa|Rujukan",
        "age_groups": "Remaja|dewasa|lansia",
        "cost_note": "Konseling psikologi gratis.",
        "cost_min": 0,
        "cost_max": 0,
        "accepts_bpjs": True,
        "emergency_24h": False,
        "online_available": True,
        "opening_note": "Senin–Sabtu mengikuti jam pelayanan puskesmas.",
        "online_note": "Konseling daring gratis lewat aplikasi Sangu Palu pukul 16.00–19.00 WITA.",
        "access_note": "Dekat kawasan kota lama Palu, dapat dijangkau angkutan kota.",
        "source_url": "https://sulteng.antaranews.com/berita/361981/pemkot-palu-perkuat-layanan-kesehatan-mental-bagi-masyarakat",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 3, "start_time": "09:00", "end_time": "12:00", "label": "Konseling psikolog",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "bincang-psikologi",
        "name": "Bincang Psikologi",
        "kind": "clinic",
        "summary": (
            "Pusat layanan psikologi swasta di Palu, mitra Dinkes Kota Palu untuk "
            "penempatan psikolog klinis di puskesmas. Melayani konseling tatap muka "
            "dan daring, termasuk psikolog klinis RSUD Undata."
        ),
        "address": "Jl. R.E. Martadinata, Lorong Nusantara (Perumahan RRI), Kel. Tondo, Kec. Mantikulore, Kota Palu",
        "district": "Mantikulore",
        "phone": "0858-1321-1246",
        "whatsapp": "0858-1321-1246",
        "website": "https://bincangpsikologi.com/",
        "services": (
            "Konseling individual|Konseling daring (Zoom)|Konseling pasangan & keluarga|"
            "Kecemasan & stres|Dukungan remaja & mahasiswa"
        ),
        "age_groups": "Remaja|dewasa",
        "cost_note": "Tarif per sesi belum dipublikasikan di situs; tanyakan lewat WhatsApp sebelum memesan.",
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": False,
        "emergency_24h": False,
        "online_available": True,
        "opening_note": "Senin–Jumat; konfirmasi jam terbaru lewat WhatsApp.",
        "online_note": "Sesi daring via Zoom, bisa diikuti dari rumah.",
        "access_note": "Pilihan bila ingin konseling cepat tanpa rujukan, biaya mandiri.",
        "source_url": "https://bincangpsikologi.com/",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 1, "start_time": "10:00", "end_time": "11:00", "label": "Sesi konseling",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 3, "start_time": "14:00", "end_time": "15:00", "label": "Sesi konseling",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "klinik-cahaya-nurani",
        "name": "Klinik Psikologi Cahaya Nurani",
        "kind": "clinic",
        "summary": (
            "Klinik psikologi yang sejak 2008 mendampingi anak berkebutuhan khusus "
            "(autisme, ADHD, cerebral palsy) melalui terapi perilaku, serta menerima "
            "konsultasi orang tua."
        ),
        "address": "Jl. Teluk Tomini No. 41, Kel. Lolu Utara, Kec. Palu Selatan, Kota Palu",
        "district": "Palu Selatan",
        "phone": "0812-4188-3700",
        "whatsapp": None,
        "website": "https://tutura.id/homepage/readmore/melongok-aktivitas-klinik-psikologi-cahaya-nurani-membersamai-anak-anak-autis-1713687105",
        "services": "Asesmen anak|Terapi perilaku (ABA)|Pendampingan autisme & ADHD|Konsultasi orang tua",
        "age_groups": "Anak",
        "cost_note": "Hubungi klinik untuk biaya asesmen dan paket terapi.",
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": False,
        "emergency_24h": False,
        "online_available": False,
        "opening_note": "Jam layanan perlu dikonfirmasi lewat telepon.",
        "online_note": None,
        "access_note": "Fokus layanan anak, cocok untuk orang tua yang mencari pendampingan terapi.",
        "source_url": "https://tutura.id/homepage/readmore/melongok-aktivitas-klinik-psikologi-cahaya-nurani-membersamai-anak-anak-autis-1713687105",
        "is_verified": True,
        "is_published": True,
        "slots": [
            {"weekday": 0, "start_time": "09:00", "end_time": "11:00", "label": "Asesmen anak",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
            {"weekday": 2, "start_time": "09:00", "end_time": "11:00", "label": "Sesi terapi",
             "capacity": 1, "mode": "call_to_book", "is_active": True},
        ],
    },
    {
        "slug": "rumah-berbagi-palu",
        "name": "Rumah Berbagi Palu",
        "kind": "nonprofit",
        "summary": (
            "Ruang layanan kesehatan mental berbasis komunitas di Palu: pendampingan, "
            "ruang cerita, dan kegiatan edukasi kesehatan jiwa."
        ),
        "address": "Jl. Watu Mapida No. 82, Kota Palu",
        "district": "Palu",
        "phone": "0851-5639-0720",
        "whatsapp": "0851-5639-0720",
        "website": "https://directmap.asia/palu/11903",
        "services": "Ruang cerita (peer support)|Pendampingan komunitas|Edukasi kesehatan mental|Rujukan",
        "age_groups": "Remaja|dewasa",
        "cost_note": "Layanan komunitas; tanyakan kontribusi/biaya via WhatsApp.",
        "cost_min": None,
        "cost_max": None,
        "accepts_bpjs": False,
        "emergency_24h": False,
        "online_available": False,
        "opening_note": "Jam kegiatan komunitas perlu dikonfirmasi lewat WhatsApp.",
        "online_note": None,
        "access_note": "Bukan layanan medis; cocok untuk dukungan sosial dan edukasi sebelum ke layanan klinis.",
        "source_url": "https://directmap.asia/palu/11903",
        "is_verified": False,
        "is_published": True,
        "slots": [],
    },
    {
        "slug": "dinkes-kota-palu",
        "name": "Dinas Kesehatan Kota Palu",
        "kind": "puskesmas",
        "summary": (
            "Pengelola program kesehatan mental Kota Palu dan penanggung jawab PSC 119. "
            "Gunakan sebagai titik awal bila belum yakin harus ke mana."
        ),
        "address": "Jl. Balai Kota Utara No. 4, Kel. Tanamodindi, Kec. Mantikulore, Kota Palu",
        "district": "Mantikulore",
        "phone": "(0451) 425140",
        "whatsapp": None,
        "website": "https://dinkes.palukota.go.id/",
        "services": "Informasi layanan kesehatan jiwa|Rujukan faskes|PSC 119 (gawat darurat medis)",
        "age_groups": "Semua usia",
        "cost_note": "Layanan informasi gratis.",
        "cost_min": 0,
        "cost_max": 0,
        "accepts_bpjs": None,
        "emergency_24h": False,
        "online_available": False,
        "opening_note": "Senin–Jumat 08.00–16.00 WITA.",
        "online_note": None,
        "access_note": "Untuk pertanyaan non-darurat tentang layanan kesehatan jiwa di Kota Palu.",
        "source_url": "https://dinkes.palukota.go.id/",
        "is_verified": True,
        "is_published": True,
        "slots": [],
    },
]

# Slot CONTOH untuk mendemokan alur booking (P0). Hanya aktif di mode demo.
# Ditandai "simulasi" di UI sehingga pengguna tidak mengira ini janji faskes.
DEMO_SLOTS = [
    # RSUD Madani — dua sesi konsultasi contoh
    {"facility": "rsud-madani", "weekday": 0, "start_time": "13:00", "end_time": "13:40",
     "label": "Konsultasi jiwa (slot contoh)", "capacity": 2, "mode": "bookable"},
    {"facility": "rsud-madani", "weekday": 2, "start_time": "13:00", "end_time": "13:40",
     "label": "Konsultasi jiwa (slot contoh)", "capacity": 2, "mode": "bookable"},
    {"facility": "rsud-madani", "weekday": 4, "start_time": "10:00", "end_time": "10:40",
     "label": "Konsultasi jiwa (slot contoh)", "capacity": 1, "mode": "bookable"},
    # Puskesmas Singgani — konseling gratis contoh
    {"facility": "puskesmas-singgani", "weekday": 1, "start_time": "13:30", "end_time": "14:10",
     "label": "Sesi konseling (slot contoh)", "capacity": 2, "mode": "bookable"},
    {"facility": "puskesmas-singgani", "weekday": 3, "start_time": "13:30", "end_time": "14:10",
     "label": "Sesi konseling (slot contoh)", "capacity": 2, "mode": "bookable"},
    # Bincang Psikologi — konseling daring contoh
    {"facility": "bincang-psikologi", "weekday": 2, "start_time": "16:00", "end_time": "16:50",
     "label": "Konseling daring (slot contoh)", "capacity": 3, "mode": "bookable"},
    {"facility": "bincang-psikologi", "weekday": 4, "start_time": "16:00", "end_time": "16:50",
     "label": "Konseling daring (slot contoh)", "capacity": 3, "mode": "bookable"},
]

# WHO-5 Well-Being Index — 5 butir, skor 0–25 untuk dua minggu terakhir.
WHO5_QUESTIONS = [
    "Saya merasa ceria dan bersemangat.",
    "Saya merasa tenang dan rileks.",
    "Saya merasa aktif dan energik.",
    "Saya bangun dengan perasaan segar dan cukup istirahat.",
    "Hari-hari saya terisi dengan hal-hal yang menarik bagi saya.",
]

WHO5_OPTIONS = [
    {"value": 0, "label": "Tidak pernah sama sekali"},
    {"value": 1, "label": "Kadang-kadang"},
    {"value": 2, "label": "Kurang dari setengah waktu"},
    {"value": 3, "label": "Lebih dari setengah waktu"},
    {"value": 4, "label": "Hampir setiap waktu"},
]

# Kontak krisis. Semua telah ditelusuri ke sumber resmi/kredibel.
EMERGENCY_CONTACTS = [
    {
        "id": "healing119",
        "name": "Healing119.id — Kemenkes RI",
        "kind": "crisis",
        "number": "119 ekstensi 8",
        "dial": "119",
        "dial_hint": "Tekan ekstensi 8 setelah tersambung.",
        "alt": "Chat via healing119.id",
        "url": "https://www.healing119.id",
        "hours": "24 jam (antrean bisa terjadi)",
        "note": "Pertolongan pertama psikologis, gratis dan anonim. Bukan terapi jangka panjang.",
        "verified_on": "2026-10-25",
    },
    {
        "id": "psc119-palu",
        "name": "PSC 119 Kota Palu",
        "kind": "medical",
        "number": "0822 7887 8119",
        "dial": "082278878119",
        "alt": "119",
        "url": "https://dinkes.palukota.go.id/",
        "hours": "24 jam",
        "note": "Ambulans dan gawat darurat medis wilayah Kota Palu. Sebutkan lokasi selengkap mungkin.",
        "verified_on": "2026-10-25",
    },
    {
        "id": "rsud-madani-igd",
        "name": "IGD RSUD Madani",
        "kind": "er",
        "number": "(0451) 491605",
        "dial": "0451491605",
        "url": "https://www.rsmadani.sultengprov.go.id/",
        "hours": "24 jam",
        "note": "Rumah sakit rujukan jiwa di Palu Utara; datang langsung ke IGD bila kondisi memburuk.",
        "verified_on": "2026-10-25",
    },
    {
        "id": "rsud-undata-igd",
        "name": "IGD RSUD Undata",
        "kind": "er",
        "number": "(0451) 4131446",
        "dial": "04514131446",
        "url": "https://rsudundata.sultengprov.go.id/",
        "hours": "24 jam",
        "note": "IGD di kawasan Talise, akses mudah dari jalur utama kota.",
        "verified_on": "2026-10-25",
    },
    {
        "id": "rsud-anutapura-igd",
        "name": "IGD RSUD Anutapura",
        "kind": "er",
        "number": "(0451) 460570",
        "dial": "0451460570",
        "url": "https://www.rsapkotapalu.com/",
        "hours": "24 jam",
        "note": "Rumah sakit milik Pemkot Palu di Jl. Kangkung.",
        "verified_on": "2026-10-25",
    },
]
