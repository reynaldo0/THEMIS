import { lazy, Suspense, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Camera,
  DoorOpen,
  Gauge,
  Layers,
  Menu,
  Radar,
  ScanLine,
  Shuffle,
  Target,
  TrainFront,
  TrendingUp,
  Users,
  Waves,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

// 3D dimuat malas agar chunk three.js tidak menahan paint pertama landing page.
const LandingTrain = lazy(() =>
  import("@/three/LandingTrain").then((m) => ({ default: m.LandingTrain })),
);

const SECTIONS = [
  { id: "tujuan", label: "Tujuan" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "indikator", label: "Indikator" },
  { id: "fitur", label: "Fitur" },
];

const BG = {
  hero: "linear-gradient(180deg,#e9edfb 0%,#efeafa 46%,#f6f8fc 100%)",
  purpose: "#eef2fc",
  how: "#ffffff",
  indicator: "#fbf5ef",
  feature: "#f6f8fc",
  cta: "#eef2fc",
  footer: "#e9edfb",
};

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

const PURPOSE = [
  {
    icon: Target,
    tag: "Masalah",
    title: "Kepadatan tidak merata",
    desc: "Penumpang menumpuk di beberapa gerbong sementara gerbong lain lega. Menghitung jumlah orang saja tidak menangkap seberapa sempit ruang gerak yang tersisa.",
  },
  {
    icon: Radar,
    tag: "Pendekatan",
    title: "Okupansi spasial, bukan sekadar hitung orang",
    desc: "THEMIS menilai ruang lantai yang benar-benar bisa dipakai dari 4 kamera fisheye plafon, lalu menggabungkannya menjadi satu skor ruang per gerbong.",
  },
  {
    icon: TrendingUp,
    tag: "Dampak",
    title: "Distribusi penumpang yang lebih merata",
    desc: "Rekomendasi redistribusi tepat waktu dan pengumuman otomatis membantu menyeimbangkan okupansi antar gerbong sehingga perjalanan lebih nyaman.",
  },
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
    desc: "Menilai ruang lantai yang benar-benar bisa digunakan penumpang di tiap gerbong, bukan sekadar hitung orang.",
    span: "lg:col-span-2",
  },
  { icon: Layers, title: "Fusion 4 Kamera", desc: "Empat kamera fisheye digabung dengan pembobotan zone untuk estimasi yang stabil dan tahan noise.", span: "" },
  { icon: Shuffle, title: "AI Redistribusi", desc: "Gerbong tujuan disarankan otomatis dengan confidence score dan prioritas gerbong wanita.", span: "" },
  {
    icon: TrendingUp,
    title: "Prediksi 15 Menit",
    desc: "Tren okupansi tiap gerbong diproyeksikan 15 menit ke depan sehingga petugas dapat bertindak lebih dulu.",
    span: "lg:col-span-2",
  },
  { icon: Activity, title: "CALES — Kesehatan Bogie", desc: "Skor perawatan bogie dengan estimasi sisa umur pakai tiap komponen.", span: "" },
  { icon: DoorOpen, title: "Pintu & Pengumuman Otomatis", desc: "Pintu tengah terbuka saat redistribusi valid, disertai pengumuman suara dua bahasa.", span: "" },
];

const STATS = [
  { icon: TrainFront, k: "10", l: "gerbong (SF10)" },
  { icon: Camera, k: "40", l: "kamera fisheye" },
  { icon: Gauge, k: "3", l: "indikator density" },
  { icon: Users, k: "15 mnt", l: "horizon prediksi" },
];

export function Landing() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Smooth scroll ke section tanpa mengubah hash (hash dipakai router).
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: tandai section yang sedang dilihat.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(en.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-dvh bg-[#f6f8fc] text-ink">
      {/* ===== Nav ===== */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors",
          scrolled
            ? "border-line bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md"
            : "border-transparent bg-white/40 backdrop-blur",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#/" className="flex items-center">
            <img src="/themis-logo.png" alt="THEMIS" className="h-7 w-auto sm:h-8" />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={go(s.id)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[12.5px] font-medium transition",
                  active === s.id ? "text-primary" : "text-muted hover:text-ink",
                )}
              >
                {s.label}
                {active === s.id && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </a>
            ))}
            <a
              href="#/dashboard"
              className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Dashboard
              <ArrowRight size={14} />
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/80 text-ink transition hover:border-primary/30 md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-white/95 backdrop-blur-md md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={go(s.id)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-[14px] font-medium transition",
                    active === s.id ? "bg-primary/5 text-primary" : "text-muted hover:bg-slate-50",
                  )}
                >
                  {s.label}
                </a>
              ))}
              <a
                href="#/dashboard"
                className="mb-2 mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-white"
              >
                Dashboard
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden" style={{ background: BG.hero }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-12%] h-[460px] w-[460px] rounded-full opacity-[0.18] blur-3xl"
          style={{ background: "radial-gradient(circle,#ec6c25,transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 left-[-10%] h-[420px] w-[420px] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle,#2d2a70,transparent 70%)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pt-16">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              AI-powered Railway Decision Intelligence
            </span>
            <h1 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-tight text-ink sm:text-[46px]">
              Kenali <span className="gradient-text">ruang layak</span> tiap gerbong, bukan sekadar jumlah orang.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
              THEMIS mengestimasi okupansi spasial KRL Commuter Line dari empat kamera fisheye plafon,
              lalu mengubahnya menjadi keputusan: density real-time, rekomendasi redistribusi penumpang,
              dan digital twin 3D.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Buka Dashboard 3D
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={go("cara-kerja")}
                className="rounded-xl border border-line bg-white/80 px-5 py-3 text-[13.5px] font-semibold text-ink backdrop-blur transition hover:border-primary/30"
              >
                Lihat cara kerja
              </button>
            </div>
          </div>

          <div className="animate-fade-in relative">
            <div className="relative h-[300px] overflow-hidden rounded-[28px] border border-white/70 bg-white/40 shadow-[0_30px_70px_-40px_rgba(45,42,112,0.55)] backdrop-blur-sm sm:h-[380px] lg:h-[450px]">
              <Suspense fallback={<div className="skeleton-shimmer h-full w-full" />}>
                <LandingTrain />
              </Suspense>
              <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/70 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary backdrop-blur">
                Digital Twin · 3D
              </span>
              <span className="pointer-events-none absolute bottom-4 right-4 hidden rounded-full bg-white/70 px-3 py-1 text-[10px] text-muted backdrop-blur sm:block">
                seret untuk memutar
              </span>
            </div>
            <div className="animate-float-slow pointer-events-none absolute -left-3 top-6 hidden rounded-2xl border border-line bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:block">
              <div className="font-mono text-[9px] uppercase tracking-wider text-faint">Okupansi rata-rata</div>
              <div className="font-display text-lg font-bold text-green">48%</div>
            </div>
            <div className="animate-float-slow pointer-events-none absolute -right-2 bottom-10 hidden rounded-2xl border border-line bg-white/90 px-3 py-2 shadow-sm backdrop-blur sm:block" style={{ animationDelay: "1.5s" }}>
              <div className="font-mono text-[9px] uppercase tracking-wider text-faint">Redistribusi</div>
              <div className="flex items-center gap-1.5 font-display text-lg font-bold text-secondary">
                <Shuffle size={14} /> Aktif
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.l} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

        <WaveDivider fill={BG.purpose} accent="#dbe3f7" />
      </section>

      {/* ===== Tujuan ===== */}
      <section id="tujuan" className="relative scroll-mt-20" style={{ background: BG.purpose }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Tujuan"
            title="Mengapa THEMIS dibuat"
            desc="Kenyamanan penumpang bukan hanya soal berapa orang di dalam gerbong, tetapi seberapa lapang ruang yang tersisa untuk bergerak. THEMIS menjawab pertanyaan itu secara real-time."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {PURPOSE.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.tag} className="glass relative overflow-hidden rounded-2xl p-6 transition glass-hover">
                  <span className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-widest text-faint">
                    {p.tag}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/12 to-secondary/12 text-primary">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
        <WaveDivider fill={BG.how} accent="#e2e8f8" />
      </section>

      {/* ===== Cara Kerja ===== */}
      <section id="cara-kerja" className="relative scroll-mt-20" style={{ background: BG.how }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Cara Kerja"
            title="Dari piksel kamera ke keputusan"
            desc="Sembilan tahap pipeline V6 mengubah empat bidikan fisheye menjadi rekomendasi operasional yang bisa langsung ditindaklanjuti."
          />

          <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <ol className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-1">
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

            <div className="lg:sticky lg:top-24 lg:self-start">
              <InCabinPreview />
            </div>
          </div>
        </div>
        <WaveDivider fill={BG.indicator} accent="#f4e7db" />
      </section>

      {/* ===== Indikator ===== */}
      <section id="indikator" className="relative scroll-mt-20" style={{ background: BG.indicator }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Klasifikasi"
            title="Tiga kondisi okupansi"
            desc="Setiap gerbong diklasifikasi otomatis terhadap kapasitas. Threshold mengikuti aturan backend THEMIS: di bawah 40% lega, 40–70% sedang, di atas 70% padat."
          />

          <div className="mt-9 h-2.5 w-full overflow-hidden rounded-full bg-white">
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
        <WaveDivider fill={BG.feature} accent="#e4e9f6" />
      </section>

      {/* ===== Fitur ===== */}
      <section id="fitur" className="scroll-mt-20" style={{ background: BG.feature }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead
            eyebrow="Kemampuan"
            title="Dirancang untuk operation control center"
            desc="Data ringkas, keputusan jelas, tanpa informasi yang membingungkan."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`glass group rounded-2xl p-5 transition glass-hover ${f.span}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
        <WaveDivider fill={BG.cta} accent="#dde4f6" />
      </section>

      {/* ===== CTA ===== */}
      <section style={{ background: BG.cta }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="gradient-border rounded-3xl">
            <div className="flex flex-col items-center rounded-3xl bg-white/90 px-6 py-12 text-center sm:px-10">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Jelajahi digital twin 3D</h2>
              <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
                Lihat 10 gerbong dengan model 3D dari Blender. Status Kosong, Sedang, dan Penuh berubah
                setiap 20 detik, lengkap dengan rekomendasi redistribusi, umpan kamera fisheye dalam kabin,
                dan pengumuman suara dua bahasa.
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
        </div>
        <WaveDivider fill={BG.footer} accent="#dfe6f7" />
      </section>

      <footer style={{ background: BG.footer }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row">
          <img src="/themis-logo.png" alt="THEMIS" className="h-6 w-auto opacity-80" />
          <span className="text-[11.5px] text-faint">AI-powered Railway Decision Intelligence · data simulasi</span>
        </div>
      </footer>
    </div>
  );
}

function WaveDivider({ fill, accent }: { fill: string; accent?: string }) {
  return (
    <div className="relative -mb-px w-full overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="block h-[52px] w-full sm:h-[82px]">
        {accent && (
          <path
            d="M0,52 C240,98 480,12 720,38 C960,64 1200,98 1440,52 L1440,100 L0,100 Z"
            fill={accent}
            opacity="0.55"
          />
        )}
        <path
          d="M0,64 C240,104 480,24 720,48 C960,72 1200,104 1440,64 L1440,100 L0,100 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-secondary">
        <Waves size={13} />
        {eyebrow}
      </span>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-[28px]">{title}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

/** Pratinjau umpan kamera fisheye dalam kabin (kamera 01). */
function InCabinPreview() {
  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-[#f4f7fd] to-[#eaeffa] p-5 shadow-[0_24px_60px_-36px_rgba(45,42,112,0.5)]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ScanLine size={15} />
        </span>
        <div>
          <div className="text-[12.5px] font-semibold text-ink">Kamera dalam kabin</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-faint">CAM 01 · Fisheye · Gerbong 1</div>
        </div>
      </div>

      <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-black">
        <img src="/fisheye-cam1.jpg" alt="Umpan fisheye dalam kabin" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 60px 22px rgba(0,0,0,0.9)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)",
          }}
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/90">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#ED242B]" />
          Live
        </span>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">
        Satu lensa fisheye di plafon menangkap seluruh lantai gerbong; THEMIS memisahkan area yang dapat
        digunakan penumpang untuk menghitung okupansi ruang.
      </p>
    </div>
  );
}
