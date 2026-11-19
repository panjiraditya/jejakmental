import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="wrap" style={{ maxWidth: '760px' }}>
      <p className="section-label" style={{ marginTop: '1rem' }}>Tentang</p>
      <h1>Direktori yang bisa diperiksa sendiri</h1>
      <p className="lead">
        JejakMental dibuat untuk satu masalah sederhana: informasi layanan
        kesehatan jiwa di Kota Palu tersebar di banyak tempat dan sering tidak
        lengkap. Kami merapikannya, tanpa mengarang yang belum pasti.
      </p>

      <hr className="rule" />

      <h2 style={{ fontSize: '1.3rem' }}>Apa yang kami cantumkan</h2>
      <ul className="suggestion-list">
        <li>
          <strong>Nama layanan, alamat, dan jenis layanan</strong> dari situs resmi
          fasilitas, profil SIRS Kementerian Kesehatan, atau kanal resmi Pemerintah
          Kota Palu.
        </li>
        <li>
          <strong>Biaya dan jam layanan</strong> hanya bila dipublikasikan. Bila tidak,
          kolomnya bertuliskan “belum dipastikan” — bukan angka kira-kira.
        </li>
        <li>
          <strong>Nama tenaga kesehatan</strong> hanya bila lembaganya sendiri
          mempublikasikannya.
        </li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Apa yang sengaja tidak kami lakukan</h2>
      <ul className="suggestion-list">
        <li>Menampilkan jadwal dokter yang belum dipastikan sebagai “tersedia”.</li>
        <li>Memberi diagnosis, skor risiko, atau saran pengobatan dari sistem.</li>
        <li>Mengirim notifikasi yang mendesak-desak atau membuat Anda merasa tertinggal.</li>
        <li>Menjual atau membagikan data pribadi pengguna.</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Tentang pengajuan janji</h2>
      <p>
        JejakMental belum terhubung ke sistem reservasi rumah sakit atau puskesmas.
        Slot bertanda “slot contoh” dipakai untuk memperlihatkan alur pengajuan.
        Setiap pengajuan berstatus menunggu dan wajib dikonfirmasi; ketersediaan
        sebenarnya tetap ditentukan oleh fasilitas. Karena itu, setiap halaman
        layanan menyediakan tombol telepon dan WhatsApp sebagai jalur tercepat.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Skrining singkat</h2>
      <p>
        Skrining memakai WHO-5 Well-Being Index — lima pertanyaan tentang dua
        minggu terakhir. Instrumen ini bukan alat diagnosis, tidak dipakai untuk
        menentukan terapi, dan hasilnya hanya untuk Anda. Bila Anda masuk, hasil
        dapat disimpan dan dihapus sendiri kapan saja.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>Sumber utama data</h2>
      <ul className="suggestion-list small">
        <li>
          <a href="https://www.rsmadani.sultengprov.go.id/" target="_blank" rel="noreferrer noopener">
            RSUD Madani Provinsi Sulawesi Tengah
          </a>{' '}
          — klinik jiwa dan klinik psikologi.
        </li>
        <li>
          <a href="https://rsudundata.sultengprov.go.id/" target="_blank" rel="noreferrer noopener">
            RSUD Undata
          </a>{' '}
          dan{' '}
          <a href="https://sirs.kemkes.go.id/fo/home/profile_rs/7271014" target="_blank" rel="noreferrer noopener">
            profil SIRS Kemenkes
          </a>.
        </li>
        <li>
          <a href="https://www.rsapkotapalu.com/" target="_blank" rel="noreferrer noopener">
            RSUD Anutapura Kota Palu
          </a>.
        </li>
        <li>
          <a href="https://palukota.go.id/empat-psikolog-klinis-mulai-bertugas-di-puskesmas-1-oktober-2025-kota-palu-prioritaskan-kesehatan-mental/" target="_blank" rel="noreferrer noopener">
            Pemerintah Kota Palu
          </a>{' '}
          dan{' '}
          <a href="https://dinkes.palukota.go.id/" target="_blank" rel="noreferrer noopener">
            Dinas Kesehatan Kota Palu
          </a>{' '}
          — program psikolog klinis di puskesmas dan PSC 119.
        </li>
        <li>
          <a href="https://www.healing119.id" target="_blank" rel="noreferrer noopener">
            Healing119.id
          </a>{' '}
          — layanan dukungan emosional Kementerian Kesehatan.
        </li>
      </ul>

      <div className="notice notice-warn" style={{ marginTop: '2rem' }}>
        <h3>Menemukan data yang keliru?</h3>
        <p>
          Data layanan berubah cepat. Bila nomor, alamat, atau jam layanan di sini
          sudah tidak sesuai, sampaikan kepada pengelola program agar diperbarui.
          Setiap entri juga mencantumkan tautan sumbernya untuk Anda periksa
          sendiri.
        </p>
      </div>

      <p style={{ marginTop: '2rem' }}>
        <Link to="/direktori" className="btn btn-primary btn-sm">Buka direktori</Link>
      </p>
    </div>
  )
}
