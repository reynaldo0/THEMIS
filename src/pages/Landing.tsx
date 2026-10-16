const PIPELINE = [
  { step: "01", title: "4 Kamera Fisheye Plafon", desc: "Empat kamera ceiling fisheye per gerbong menangkap area lantai 360°." },
  { step: "02", title: "Preprocessing", desc: "Koreksi distorsi lensa, kalibrasi, dan penyesuaian pencahayaan." },
  { step: "03", title: "Spatial Segmentation", desc: "Model AI memisahkan area lantai dari objek non-penumpang." },
  { step: "04", title: "Occupancy Grid 4-Zone", desc: "Setiap kamera menghasilkan grid okupansi per kuadran gerbong." },
  { step: "05", title: "Fusion Engine", desc: "Empat grid digabung dengan pembobotan untuk skor spasial tunggal." },
  { step: "06", title: "Density Classification", desc: "Okupansi diklasifikasi: Lengang, Sedang, atau Padat." },
  { step: "07", title: "Redistribution AI", desc: "Rekomendasi perpindahan penumpang antar gerbong berbasis skor." },
  { step: "08", title: "CALES & Door Logic", desc: "Kesehatan bogie + aturan pembukaan pintu tengah saat gerbong padat." },
  { step: "09", title: "PipelineState Output", desc: "State real-time dikirim via WebSocket ke digital twin 3D." },
];

const FEATURES = [
  {
    title: "Spatial Occupancy Intelligence",
    desc: "Bukan sekadar hitung orang — THEMIS menilai ruang lantai yang benar-benar bisa digunakan penumpang di tiap gerbong.",
  },
  {
    title: "Fusion 4 Kamera per Gerbong",
    desc: "Data 4 kamera fisheye digabung dengan pembobotan zone untuk menghasilkan estimasi yang stabil dan tahan noise.",
  },
  {
    title: "AI Redistribusi Penumpang",
    desc: "Saat satu gerbong padat, sistem merekomendasikan gerbong tujuan dengan confidence score dan prioritas gerbong wanita.",
  },
  {
    title: "Prediksi 15 Menit",
    desc: "Tren okupansi tiap gerbong diprediksi 15 menit ke depan sehingga petugas dapat bertindak sebelum eskalasi.",
  },
  {
    title: "CALES — Kesehatan Bogie",
    desc: "Skor perawatan bogie (wheel flange, air spring, chevron rubber) dengan estimasi sisa umur pakai.",
  },
  {
    title: "Pintu & Pengumuman Otomatis",
    desc: "Pintu tengah terbuka saat redistribusi valid, disertai pengumuman suara berbahasa Indonesia.",
  },
];

const INDICATORS = [
  { name: "Kosong", range: "< 40% okupansi", color: "#16A34A", desc: "Seluruh gerbong lega. Kondisi ideal awal rute atau transit." },
  { name: "Sedang", range: "40% – 70% okupansi", color: "#F59E0B", desc: "Trafik seimbang. Sebagian gerbong mulai terisi namun masih nyaman." },
  { name: "Penuh", range: "> 70% okupansi", color: "#ED242B", desc: "Gerbong padat. Sistem aktif merekomendasikan redistribusi penumpang." },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-background text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <img src="/themis-icon.svg" alt="" className="h-5 w-5" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight">
              PROJECT <span className="gradient-text">THEMIS</span>
            </span>
          </div>
          <nav className="flex items-center gap-4 text-[12.5px] text-muted">
            <a href="#fitur" className="hidden hover:text-ink sm:inline">Fitur</a>
            <a href="#pipeline" className="hidden hover:text-ink sm:inline">Pipeline</a>
            <a href="#indikator" className="hidden hover:text-ink sm:inline">Indikator</a>
            <a
              href="#/dashboard"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
            >
              Buka Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pt-16">
        <div className="animate-fade-in max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            AI-powered Railway Decision Intelligence
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[42px]">
            Spatial Occupancy Intelligence untuk{" "}
            <span className="gradient-text">KRL Commuter Line</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
            THEMIS mengestimasi <strong className="text-ink">ruang layak</strong> setiap gerbong menggunakan 4 kamera
            fisheye plafon — bukan sekadar menghitung orang. Hasilnya: density real-time, rekomendasi redistribusi,
            dan digital twin 3D yang siap dihubungkan ke pipeline Blender &amp; Unity.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#/dashboard"
              className="rounded-xl bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Buka Dashboard 3D →
            </a>
            <a
              href="#pipeline"
              className="rounded-xl border border-line bg-white px-5 py-2.5 text-[13.5px] font-semibold text-ink transition hover:border-primary/30"
            >
              Lihat Cara Kerja
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "10", l: "gerbong (SF10)" },
            { k: "40", l: "kamera fisheye" },
            { k: "3", l: "indikator density" },
            { k: "15 mnt", l: "horizon prediksi" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl px-4 py-3.5">
              <div className="font-display text-xl font-bold text-ink">{s.k}</div>
              <div className="mt-0.5 text-[11.5px] text-muted">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Indikator */}
      <section id="indikator" className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-ink">Tiga Kondisi Okupansi</h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
            Setiap gerbong diklasifikasi otomatis berdasarkan perbandingan okupansi terhadap kapasitas. Threshold
            mengikuti aturan backend THEMIS: di bawah 40% lega, 40–70% sedang, di atas 70% padat.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {INDICATORS.map((i) => (
              <div key={i.name} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: i.color, boxShadow: `0 0 0 4px ${i.color}22` }}
                  />
                  <span className="font-display text-lg font-bold text-ink">{i.name}</span>
                </div>
                <div className="mt-2 font-mono text-[12px] font-semibold" style={{ color: i.color }}>
                  {i.range}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{i.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[12px] text-faint">
            Catatan: gerbong 1 &amp; 6 ditandai sebagai gerbong wanita — rekomendasi redistribusi memberi prioritas
            pada gerbong tujuan tersebut.
          </p>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl font-bold text-ink">Fitur Utama</h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
          Dirancang untuk operation control center: data ringkas, keputusan jelas, tanpa informasi yang membingungkan.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 transition glass-hover">
              <h3 className="font-display text-[15px] font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-ink">Pipeline V6</h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
            Sembilan tahap dari piksel kamera sampai keputusan operasional — seluruh logika di dashboard 3D mengikuti
            pipeline ini.
          </p>
          <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE.map((p) => (
              <li key={p.step} className="glass flex gap-3.5 rounded-2xl p-4">
                <span className="mt-0.5 font-mono text-[13px] font-bold text-secondary">{p.step}</span>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="gradient-border rounded-3xl">
          <div className="rounded-3xl bg-white px-6 py-10 text-center sm:px-10">
            <h2 className="font-display text-2xl font-bold text-ink">Jelajahi Digital Twin 3D</h2>
            <p className="mx-auto mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
              Lihat langsung 10 gerbong dengan model 3D dari Blender — status Kosong, Sedang, dan Penuh berubah secara
              real-time, lengkap dengan rekomendasi redistribusi dan animasi pintu.
            </p>
            <a
              href="#/dashboard"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Masuk Dashboard 3D →
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-[11.5px] text-faint sm:flex-row">
          <span>AI-powered Railway Decision Intelligence Platform</span>
          <span>Frontend demo · data simulasi · themis-3d</span>
        </div>
      </footer>
    </div>
  );
}
