import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  DoorOpen,
  Gauge,
  Layers,
  Radar,
  Shuffle,
  TrainFront,
  TrendingUp,
  Users,
} from "lucide-react";

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

const INDICATORS = [
  { name: "Kosong", range: "< 40%", color: "#16A34A", desc: "Seluruh gerbong lega. Kondisi ideal awal rute atau transit." },
  { name: "Sedang", range: "40% – 70%", color: "#F59E0B", desc: "Trafik seimbang. Sebagian gerbong mulai terisi namun masih nyaman." },
  { name: "Penuh", range: "> 70%", color: "#ED242B", desc: "Gerbong padat. Sistem aktif merekomendasikan redistribusi penumpang." },
];

const FEATURES = [
  {
    icon: Radar,
    title: "Spatial Occupancy Intelligence",
    desc: "Bukan sekadar hitung orang — THEMIS menilai ruang lantai yang benar-benar bisa digunakan penumpang di tiap gerbong.",
    span: "lg:col-span-2",
  },
  {
    icon: Layers,
    title: "Fusion 4 Kamera",
    desc: "Empat kamera fisheye digabung dengan pembobotan zone untuk estimasi yang stabil dan tahan noise.",
    span: "",
  },
  {
    icon: Shuffle,
    title: "AI Redistribusi",
    desc: "Gerbong tujuan disarankan otomatis dengan confidence score dan prioritas gerbong wanita.",
    span: "",
  },
  {
    icon: TrendingUp,
    title: "Prediksi 15 Menit",
    desc: "Tren okupansi tiap gerbong diproyeksikan 15 menit ke depan sehingga petugas dapat bertindak lebih dulu.",
    span: "lg:col-span-2",
  },
  {
    icon: Activity,
    title: "CALES — Kesehatan Bogie",
    desc: "Skor perawatan bogie (wheel flange, air spring, chevron rubber) dengan estimasi sisa umur pakai.",
    span: "",
  },
  {
    icon: DoorOpen,
    title: "Pintu & Pengumuman Otomatis",
    desc: "Pintu tengah terbuka saat redistribusi valid, disertai pengumuman suara dua bahasa.",
    span: "",
  },
];

const STATS = [
  { icon: TrainFront, k: "10", l: "gerbong (SF10)" },
  { icon: Camera, k: "40", l: "kamera fisheye" },
  { icon: Gauge, k: "3", l: "indikator density" },
  { icon: Users, k: "15 mnt", l: "horizon prediksi" },
];

const PREVIEW = [
  { id: 1, occ: 0.84, d: "#ED242B" },
  { id: 2, occ: 0.55, d: "#F59E0B" },
  { id: 3, occ: 0.29, d: "#16A34A" },
  { id: 4, occ: 0.44, d: "#F59E0B" },
  { id: 5, occ: 0.27, d: "#16A34A" },
  { id: 6, occ: 0.72, d: "#ED242B" },
  { id: 7, occ: 0.36, d: "#16A34A" },
  { id: 8, occ: 0.51, d: "#F59E0B" },
  { id: 9, occ: 0.33, d: "#16A34A" },
  { id: 10, occ: 0.47, d: "#F59E0B" },
];

export function Landing() {
  return (
    <div className="min-h-dvh scroll-smooth bg-background text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#/" className="flex items-center">
            <img src="/themis-logo.png" alt="THEMIS" className="h-7 w-auto sm:h-8" />
          </a>
          <nav className="flex items-center gap-5 text-[12.5px] font-medium text-muted">
            <a href="#fitur" className="hidden transition hover:text-ink sm:inline">Fitur</a>
            <a href="#indikator" className="hidden transition hover:text-ink sm:inline">Indikator</a>
            <a href="#pipeline" className="hidden transition hover:text-ink sm:inline">Pipeline</a>
            <a
              href="#/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Dashboard
              <ArrowRight size={14} />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, #ec6c25, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-[-8%] h-[380px] w-[380px] rounded-full opacity-[0.14] blur-3xl"
          style={{ background: "radial-gradient(circle, #2d2a70, transparent 70%)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-20">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              AI-powered Railway Decision Intelligence
            </span>
            <h1 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-tight text-ink sm:text-[46px]">
              Kenali <span className="gradient-text">ruang layak</span> tiap gerbong,
              bukan sekadar jumlah orang.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
              THEMIS mengestimasi okupansi spasial KRL Commuter Line dari empat kamera fisheye
              plafon, lalu mengubahnya menjadi keputusan: density real-time, rekomendasi
              redistribusi penumpang, dan digital twin 3D.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Buka Dashboard 3D
                <ArrowRight size={16} />
              </a>
              <a
                href="#pipeline"
                className="rounded-xl border border-line bg-white px-5 py-3 text-[13.5px] font-semibold text-ink transition hover:border-primary/30"
              >
                Lihat cara kerja
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-muted">
              {["Fusion 4 kamera", "Redistribusi otomatis", "Prediksi 15 menit"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroPreview />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.l} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Icon size={17} />
                  </span>
                  <div>
                    <div className="font-display text-lg font-bold leading-none text-ink">{s.k}</div>
                    <div className="mt-1 text-[11px] text-muted">{s.l}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Indikator */}
      <section id="indikator" className="scroll-mt-20 border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Klasifikasi"
            title="Tiga kondisi okupansi"
            desc="Setiap gerbong diklasifikasi otomatis terhadap kapasitas. Threshold mengikuti aturan backend THEMIS: di bawah 40% lega, 40–70% sedang, di atas 70% padat."
          />

          <div className="mt-8 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-full w-full">
              <div className="h-full" style={{ width: "40%", background: "#16A34A" }} />
              <div className="h-full" style={{ width: "30%", background: "#F59E0B" }} />
              <div className="h-full" style={{ width: "30%", background: "#ED242B" }} />
            </div>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10.5px] text-faint">
            <span>0%</span>
            <span>40%</span>
            <span>70%</span>
            <span>100%</span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {INDICATORS.map((i) => (
              <div key={i.name} className="glass rounded-2xl p-5 transition glass-hover">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: i.color, boxShadow: `0 0 0 4px ${i.color}22` }}
                  />
                  <span className="font-display text-lg font-bold text-ink">{i.name}</span>
                  <span className="ml-auto font-mono text-[12px] font-semibold" style={{ color: i.color }}>
                    {i.range}
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{i.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[12px] text-faint">
            Gerbong 1 &amp; 6 ditandai gerbong wanita — rekomendasi redistribusi memprioritaskan gerbong tujuan tersebut.
          </p>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <SectionHead
          eyebrow="Kemampuan"
          title="Dirancang untuk operation control center"
          desc="Data ringkas, keputusan jelas, tanpa informasi yang membingungkan."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`glass group rounded-2xl p-5 transition glass-hover ${f.span}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="scroll-mt-20 border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Arsitektur"
            title="Pipeline V6"
            desc="Sembilan tahap dari piksel kamera sampai keputusan operasional — seluruh logika dashboard 3D mengikuti pipeline ini."
          />
          <ol className="mt-8 grid gap-x-8 gap-y-0 lg:grid-cols-2">
            {PIPELINE.map((p, idx) => (
              <li key={p.step} className="relative flex gap-4 pb-6">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-white font-mono text-[12px] font-bold text-primary shadow-sm">
                    {p.step}
                  </span>
                  {idx < PIPELINE.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-gradient-to-b from-primary/25 to-transparent" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="text-[13.5px] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="gradient-border rounded-3xl">
          <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-12 text-center sm:px-10">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Jelajahi digital twin 3D</h2>
            <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
              Lihat 10 gerbong dengan model 3D dari Blender. Status Kosong, Sedang, dan Penuh
              berubah real-time, lengkap dengan rekomendasi redistribusi dan animasi pintu.
            </p>
            <a
              href="#/dashboard"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Masuk Dashboard 3D
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row">
          <img src="/themis-logo.png" alt="THEMIS" className="h-6 w-auto opacity-80" />
          <span className="text-[11.5px] text-faint">AI-powered Railway Decision Intelligence · data simulasi</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">{eyebrow}</span>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">{title}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function HeroPreview() {
  const source = PREVIEW[0];
  const target = PREVIEW[2];
  return (
    <div className="animate-fade-in rounded-3xl border border-line bg-white/70 p-2.5 shadow-[0_24px_60px_-30px_rgba(45,42,112,0.45)] backdrop-blur">
      {/* window chrome */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ED242B]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]/70" />
        <span className="ml-2 truncate rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-faint">
          themis-3d · dashboard
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#eef2fb] to-[#e4e9f6] p-4 sm:p-5">
        {/* sky glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(236,108,37,0.18), transparent)" }}
        />

        {/* platform */}
        <div className="relative flex items-end justify-center gap-[3px] pt-10">
          {PREVIEW.map((c) => {
            const h = 26 + c.occ * 60;
            return (
              <div key={c.id} className="relative flex flex-1 flex-col items-center" style={{ minWidth: 0 }}>
                {c.id === source.id && (
                  <span className="mb-1 whitespace-nowrap rounded-full bg-[#ED242B] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                    Penuh
                  </span>
                )}
                {c.id === target.id && (
                  <span className="mb-1 whitespace-nowrap rounded-full bg-[#16A34A] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                    Tujuan
                  </span>
                )}
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: h,
                    background: `linear-gradient(180deg, ${c.d}, ${c.d}cc)`,
                    boxShadow: `0 6px 14px -8px ${c.d}`,
                  }}
                />
                <span className="mt-1 font-mono text-[8px] text-faint">{String(c.id).padStart(2, "0")}</span>
              </div>
            );
          })}
          {/* rail */}
          <div className="absolute bottom-[13px] left-0 right-0 h-[2px] bg-primary/20" />
        </div>

        {/* redistribution caption */}
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-secondary/25 bg-white/80 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary/12 text-secondary">
              <Shuffle size={13} />
            </span>
            <div className="leading-tight">
              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">Pindah Penumpang</div>
              <div className="font-mono text-[10px] text-muted">G01 → G03 · +48 orang</div>
            </div>
          </div>
          <span className="flex items-center gap-1 font-mono text-[10px] text-green">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-green" />
            92% yakin
          </span>
        </div>
      </div>

      {/* kpi chips */}
      <div className="grid grid-cols-3 gap-2 p-2.5">
        {[
          { l: "Okupansi rata-rata", v: "48%", c: "#F59E0B" },
          { l: "Gerbong padat", v: "2 / 10", c: "#ED242B" },
          { l: "Aksi redistribusi", v: "Aktif", c: "#16A34A" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-line bg-white px-2.5 py-2">
            <div className="text-[9px] uppercase tracking-wider text-faint">{k.l}</div>
            <div className="mt-0.5 font-display text-[15px] font-bold" style={{ color: k.c }}>
              {k.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
