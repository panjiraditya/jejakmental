import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="wrap" style={{ maxWidth: '720px' }}>
      <p className="section-label" style={{ marginTop: '1rem' }}>Privasi</p>
      <h1>Data Anda tetap milik Anda</h1>
      <p className="lead">
        Kami hanya menyimpan apa yang dibutuhkan agar situs bisa berjalan. Tidak
        ada pelacakan iklan, tidak ada penjualan data, dan tidak ada profil
        perilaku pengguna.
      </p>

      <div className="stack" style={{ marginTop: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.2rem' }}>Tanpa akun</h2>
          <p>
            Anda dapat membaca direktori, melihat jadwal, dan menghubungi layanan
            tanpa akun. Skrining juga bisa diisi tanpa akun; dalam kasus itu
            jawaban tidak disimpan di server.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem' }}>Bila membuat akun</h2>
          <p>
            Kami menyimpan nama panggilan, email, kata sandi terenkripsi, nomor
            telepon (bila Anda mengisi), pengajuan janji, dan hasil skrining yang
            Anda pilih untuk disimpan. Tidak ada nomor identitas, tanggal lahir,
            atau riwayat medis.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem' }}>Siapa yang bisa melihat</h2>
          <p>
            Hanya Anda. Pengelola data di JejakMental melihat daftar pengajuan
            janji dengan nomor kontak untuk keperluan konfirmasi, namun tidak
            pernah melihat jawaban skrining atau skor Anda.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem' }}>Menghapus data</h2>
          <p>
            Hasil skrining dapat dihapus satu per satu. Seluruh akun beserta data
            terkait dapat dihapus permanen dari halaman{' '}
            <Link to="/akun">Akun saya</Link>.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem' }}>Sesi</h2>
          <p>
            Sesi masuk disimpan dalam cookie yang tidak dapat dibaca oleh skrip
            halaman. Keluar dari akun akan menghapus sesi tersebut.
          </p>
        </section>
      </div>

      <p style={{ marginTop: '2rem' }} className="small muted">
        Catatan ini disusun untuk keperluan proyek akademik dan akan diperbarui
        bila ada perubahan cara kerja sistem.
      </p>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="wrap">
      <div className="empty" style={{ marginTop: '3rem', maxWidth: '560px' }}>
        <p className="section-label">Halaman tidak ditemukan</p>
        <h1 style={{ fontSize: '1.6rem' }}>Tautannya mungkin sudah berubah</h1>
        <p className="small muted">
          Tidak apa-apa. Anda bisa kembali ke direktori atau mulai dari daftar
          layanan gratis.
        </p>
        <div className="row" style={{ marginTop: '0.9rem' }}>
          <Link to="/direktori" className="btn btn-primary btn-sm">Direktori layanan</Link>
          <Link to="/" className="btn btn-quiet btn-sm">Beranda</Link>
        </div>
      </div>
    </div>
  )
}
