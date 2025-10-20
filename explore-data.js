export const PROGRAM_ILLUSTRATIONS = {
  engineering: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi teknik dan teknologi">
    <defs>
      <linearGradient id="engrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.85" />
      </linearGradient>
      <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="20" y="28" width="320" height="144" rx="32" fill="url(#engrGradient)" opacity="0.18" />
    <rect x="52" y="56" width="112" height="88" rx="18" fill="#0ea5e9" opacity="0.22" />
    <path d="M108 76h56v40h-56z" fill="#38bdf8" opacity="0.35" />
    <circle cx="240" cy="104" r="54" fill="url(#gearGradient)" opacity="0.32" />
    <path d="M240 60l10 20 22 4-14 16 4 22-22-8-20 12 2-22-16-14 22-6z" fill="#0ea5e9" opacity="0.65" />
    <circle cx="240" cy="104" r="16" fill="#e0f2fe" opacity="0.9" />
  </svg>`,
  health: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi kedokteran dan kesehatan">
    <defs>
      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="24" y="32" width="312" height="136" rx="36" fill="url(#healthGradient)" opacity="0.16" />
    <path d="M120 76c0-20 14-36 32-36s32 16 32 36c0 36-64 72-64 72s-64-36-64-72c0-20 14-36 32-36s32 16 32 36z" fill="#f0fdf4" opacity="0.8" />
    <rect x="212" y="72" width="96" height="72" rx="20" fill="#2dd4bf" opacity="0.38" />
    <path d="M248 96h16v-16h16v16h16v16h-16v16h-16v-16h-16z" fill="#0f766e" opacity="0.75" />
  </svg>`,
  environment: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi ilmu hayati dan lingkungan">
    <defs>
      <linearGradient id="envGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="28" y="36" width="304" height="132" rx="30" fill="url(#envGradient)" opacity="0.16" />
    <circle cx="120" cy="104" r="48" fill="#22c55e" opacity="0.28" />
    <path d="M120 64c20 16 32 36 32 56s-12 32-32 32-32-12-32-32 12-40 32-56z" fill="#bbf7d0" opacity="0.8" />
    <path d="M216 148c24-36 60-48 88-28" stroke="#16a34a" stroke-width="10" stroke-linecap="round" stroke-opacity="0.45" fill="none" />
    <path d="M200 96c12-20 40-36 68-32" stroke="#4ade80" stroke-width="10" stroke-linecap="round" stroke-opacity="0.45" fill="none" />
  </svg>`,
  business: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi manajemen dan bisnis">
    <defs>
      <linearGradient id="bizGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="28" y="28" width="304" height="144" rx="34" fill="url(#bizGradient)" opacity="0.16" />
    <rect x="76" y="88" width="40" height="64" rx="12" fill="#0ea5e9" opacity="0.28" />
    <rect x="132" y="68" width="48" height="84" rx="14" fill="#38bdf8" opacity="0.32" />
    <rect x="196" y="56" width="52" height="96" rx="16" fill="#60a5fa" opacity="0.4" />
    <rect x="260" y="100" width="40" height="52" rx="12" fill="#34d399" opacity="0.45" />
    <polyline points="76,132 132,104 196,120 260,92" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.65" />
  </svg>`,
  media: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi komunikasi dan media">
    <defs>
      <linearGradient id="mediaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="24" y="32" width="312" height="136" rx="32" fill="url(#mediaGradient)" opacity="0.16" />
    <rect x="72" y="76" width="120" height="80" rx="18" fill="#a855f7" opacity="0.35" />
    <circle cx="156" cy="116" r="18" fill="#f3e8ff" opacity="0.85" />
    <path d="M220 72l68 36-68 36z" fill="#6366f1" opacity="0.42" />
    <circle cx="256" cy="108" r="42" fill="#c4b5fd" opacity="0.24" />
    <rect x="84" y="60" width="32" height="16" rx="6" fill="#ede9fe" opacity="0.85" />
  </svg>`,
  law: String.raw`<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi hukum dan ilmu politik">
    <defs>
      <linearGradient id="lawGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#facc15" stop-opacity="0.75" />
      </linearGradient>
    </defs>
    <rect x="28" y="32" width="304" height="136" rx="32" fill="url(#lawGradient)" opacity="0.16" />
    <rect x="88" y="64" width="56" height="88" rx="16" fill="#0ea5e9" opacity="0.26" />
    <rect x="152" y="76" width="56" height="76" rx="16" fill="#22d3ee" opacity="0.32" />
    <rect x="216" y="64" width="56" height="88" rx="16" fill="#facc15" opacity="0.3" />
    <path d="M88 64h184l-12-20H100z" fill="#facc15" opacity="0.45" />
    <circle cx="180" cy="132" r="18" fill="#fde68a" opacity="0.85" />
    <path d="M176 128h8v12h-8z" fill="#1f2937" opacity="0.45" />
  </svg>`,
};

export const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    heroTitle: "Jurusan IPA",
    description: "",
    heading: "Sub-kategori unggulan jurusan IPA",
    sectionDescription:
      "Pilih rumpun favoritmu lalu jelajahi daftar jurusan detail.",
    programs: [
      {
        slug: "teknik",
        title: "Teknik & Teknologi",
        iconUrl: "assets/icons/engineering.svg",
        description:
          "Kenali jurusan teknik terpopuler yang siap membangun infrastruktur, energi, hingga transformasi digital.",
        heading: "Jurusan populer di Teknik & Teknologi",
        illustration: {
          key: "engineering",
          caption: "Ilustrasi bidang Teknik & Teknologi",
        },
        subPrograms: [
          {
            title: "Teknik Sipil",
            emoji: "🏗️",
            subtitle: "Rancang dan bangun infrastruktur yang aman serta berkelanjutan.",
          },
          {
            title: "Teknik Mesin",
            emoji: "⚙️",
            subtitle: "Pelajari perancangan sistem mesin dan manufaktur industri.",
          },
          {
            title: "Teknik Elektro",
            emoji: "💡",
            subtitle: "Eksplor kelistrikan, kontrol, dan teknologi energi masa depan.",
          },
          {
            title: "Teknik Industri",
            emoji: "🏭",
            subtitle: "Optimalkan proses produksi, manajemen operasi, dan kualitas.",
          },
          {
            title: "Teknik Informatika",
            emoji: "💻",
            subtitle: "Kembangkan perangkat lunak, kecerdasan buatan, dan solusi digital.",
          },
          {
            title: "Teknik Kimia",
            emoji: "⚗️",
            subtitle: "Kolaborasikan ilmu kimia dengan proses produksi skala besar.",
          },
          {
            title: "Teknik Pertambangan",
            emoji: "⛏️",
            subtitle: "Pelajari eksplorasi sumber daya mineral yang bertanggung jawab.",
            detailsUrl: "teknik-pertambangan.html",
          },
          {
            title: "Teknik Geologi",
            emoji: "🪨",
            subtitle: "Analisis struktur bumi untuk energi, mitigasi bencana, dan lingkungan.",
          },
          {
            title: "Arsitektur",
            emoji: "📐",
            subtitle: "Desain ruang dan bangunan yang estetis sekaligus fungsional.",
          },
        ],
      },
      {
        slug: "kedokteran",
        title: "Kedokteran & Kesehatan",
        iconUrl: "assets/icons/health.svg",
        description:
          "Temukan jurusan kesehatan dari kedokteran hingga teknologi laboratorium medis dengan fokus pelayanan holistik.",
        heading: "Pilihan jurusan Kedokteran & Kesehatan",
        illustration: {
          key: "health",
          caption: "Ilustrasi bidang Kedokteran & Kesehatan",
        },
        subPrograms: [
          {
            title: "Kedokteran",
            emoji: "🩺",
            subtitle: "Belajar diagnosis, terapi, dan pencegahan penyakit secara komprehensif.",
          },
          {
            title: "Kedokteran Gigi",
            emoji: "😁",
            subtitle: "Fokus pada kesehatan gigi, mulut, dan estetik dento-fasial.",
          },
          {
            title: "Farmasi",
            emoji: "💊",
            subtitle: "Formulasi obat, manajemen apotek, hingga riset farmasi klinis.",
          },
          {
            title: "Keperawatan",
            emoji: "🤝",
            subtitle: "Memberikan asuhan keperawatan dengan pendekatan humanis dan ilmiah.",
          },
          {
            title: "Kebidanan",
            emoji: "👶",
            subtitle: "Menangani kesehatan reproduksi, kehamilan, dan persalinan.",
          },
          {
            title: "Gizi",
            emoji: "🥗",
            subtitle: "Rancang intervensi nutrisi untuk individu dan komunitas.",
          },
          {
            title: "Kesehatan Masyarakat",
            emoji: "🌍",
            subtitle: "Bangun program promotif dan preventif berskala populasi.",
          },
          {
            title: "Fisioterapi",
            emoji: "🧘",
            subtitle: "Pulihkan fungsi gerak dengan pendekatan terapi fisik profesional.",
          },
          {
            title: "Teknologi Laboratorium Medis",
            emoji: "🔬",
            subtitle: "Analisis laboratorium untuk penegakan diagnosis penyakit.",
          },
        ],
      },
      {
        slug: "ilmu-hayati",
        title: "Ilmu Hayati & Lingkungan",
        iconUrl: "assets/icons/environment.svg",
        description:
          "Eksplor jurusan biologi, pertanian, dan kelautan yang menjaga keseimbangan alam serta sumber daya hayati.",
        heading: "Jurusan favorit Ilmu Hayati & Lingkungan",
        illustration: {
          key: "environment",
          caption: "Ilustrasi bidang Ilmu Hayati & Lingkungan",
        },
        subPrograms: [
          {
            title: "Biologi",
            emoji: "🧬",
            subtitle: "Pelajari makhluk hidup dari level sel hingga ekologi.",
          },
          {
            title: "Bioteknologi",
            emoji: "🧫",
            subtitle: "Inovasi pemanfaatan organisme untuk pangan, kesehatan, dan energi.",
          },
          {
            title: "Agribisnis",
            emoji: "🌾",
            subtitle: "Manajemen usaha pertanian dari hulu sampai hilir.",
          },
          {
            title: "Agroteknologi",
            emoji: "🚜",
            subtitle: "Optimasi budidaya tanaman dengan teknologi modern.",
          },
          {
            title: "Kehutanan",
            emoji: "🌳",
            subtitle: "Kelola hutan secara lestari untuk ekonomi dan konservasi.",
          },
          {
            title: "Perikanan",
            emoji: "🐟",
            subtitle: "Kembangkan budidaya dan pengolahan hasil perairan.",
          },
          {
            title: "Ilmu Kelautan",
            emoji: "🌊",
            subtitle: "Eksplor potensi samudra dan mitigasi perubahan iklim pesisir.",
          },
          {
            title: "Teknologi Pangan",
            emoji: "🥐",
            subtitle: "Inovasi produk pangan aman, bergizi, dan berkelanjutan.",
          },
          {
            title: "Ilmu Lingkungan",
            emoji: "♻️",
            subtitle: "Solusi lintas disiplin untuk isu lingkungan dan keberlanjutan.",
          },
        ],
      },
    ],
  },
  ips: {
    label: "Jurusan IPS",
    heroTitle: "Rumpun IPS",
    description: "Telusuri bisnis, komunikasi, dan ilmu sosial di rumpun IPS.",
    heading: "Sub-kategori unggulan rumpun IPS",
    sectionDescription:
      "Temukan bidang sosial yang paling sesuai dengan potensimu.",
    programs: [
      {
        slug: "manajemen-bisnis",
        title: "Manajemen & Bisnis",
        iconUrl: "assets/icons/business.svg",
        tagline: "Strategi usaha, keuangan, hingga kewirausahaan modern.",
        description:
          "Pilih jurusan bisnis yang menyiapkan kemampuan manajerial dan kepemimpinan di berbagai industri.",
        heading: "Jurusan favorit Manajemen & Bisnis",
        illustration: {
          key: "business",
          caption: "Ilustrasi bidang Manajemen & Bisnis",
        },
        subPrograms: [
          {
            title: "Manajemen",
            emoji: "📊",
            subtitle: "Kuasi perencanaan, pengorganisasian, dan pengendalian bisnis.",
          },
          {
            title: "Akuntansi",
            emoji: "🧾",
            subtitle: "Analisis laporan keuangan dan tata kelola perusahaan.",
          },
          {
            title: "Bisnis Digital",
            emoji: "🌐",
            subtitle: "Bangun strategi bisnis di era transformasi digital.",
          },
          {
            title: "Keuangan",
            emoji: "💰",
            subtitle: "Kelola investasi, pasar modal, dan manajemen risiko.",
          },
          {
            title: "Pemasaran",
            emoji: "📣",
            subtitle: "Rancang kampanye kreatif dan riset perilaku konsumen.",
          },
          {
            title: "Kewirausahaan",
            emoji: "🚀",
            subtitle: "Kembangkan ide bisnis inovatif dan skalakan startup.",
          },
          {
            title: "Administrasi Bisnis",
            emoji: "🗂️",
            subtitle: "Kelola proses operasional perusahaan agar berjalan efisien.",
          },
          {
            title: "Ekonomi Pembangunan",
            emoji: "📈",
            subtitle: "Analisis kebijakan ekonomi makro untuk pembangunan berkelanjutan.",
          },
        ],
      },
      {
        slug: "komunikasi-media",
        title: "Komunikasi & Media",
        iconUrl: "assets/icons/media.svg",
        tagline: "Cerita kreatif, media digital, hingga hubungan masyarakat.",
        description:
          "Eksplor dunia komunikasi massa, konten digital, dan strategi media modern.",
        heading: "Jurusan favorit Komunikasi & Media",
        illustration: {
          key: "media",
          caption: "Ilustrasi bidang Komunikasi & Media",
        },
        subPrograms: [
          {
            title: "Ilmu Komunikasi",
            emoji: "🗞️",
            subtitle: "Strategi komunikasi efektif untuk berbagai audiens.",
          },
          {
            title: "Jurnalistik",
            emoji: "✍️",
            subtitle: "Produksi berita dan konten informatif lintas platform.",
          },
          {
            title: "Public Relations",
            emoji: "🤝",
            subtitle: "Bangun relasi dan citra positif organisasi.",
          },
          {
            title: "Broadcasting",
            emoji: "📺",
            subtitle: "Produksi siaran televisi dan radio profesional.",
          },
          {
            title: "Periklanan",
            emoji: "🎯",
            subtitle: "Konsep kampanye kreatif untuk brand dan produk.",
          },
          {
            title: "Digital Content",
            emoji: "📱",
            subtitle: "Ciptakan konten multimedia untuk platform digital.",
          },
          {
            title: "Komunikasi Visual",
            emoji: "🎨",
            subtitle: "Desain visual dan identitas brand yang kuat.",
          },
        ],
      },
      {
        slug: "hukum-politik",
        title: "Hukum & Ilmu Politik",
        iconUrl: "assets/icons/law.svg",
        tagline: "Telaah regulasi, pemerintahan, dan dinamika sosial.",
        description:
          "Dalami aspek hukum, kebijakan publik, dan hubungan internasional untuk solusi isu global.",
        heading: "Pilihan jurusan Hukum & Ilmu Politik",
        illustration: {
          key: "law",
          caption: "Ilustrasi bidang Hukum & Ilmu Politik",
        },
        subPrograms: [
          {
            title: "Ilmu Hukum",
            emoji: "⚖️",
            subtitle: "Pahami sistem hukum, litigasi, dan advokasi kebijakan.",
          },
          {
            title: "Ilmu Politik",
            emoji: "🏛️",
            subtitle: "Analisis dinamika kekuasaan dan tata kelola negara.",
          },
          {
            title: "Hubungan Internasional",
            emoji: "🌐",
            subtitle: "Diplomasi, geopolitik, dan kerjasama multilateral.",
          },
          {
            title: "Administrasi Publik",
            emoji: "📑",
            subtitle: "Kelola birokrasi dan pelayanan publik yang efektif.",
          },
          {
            title: "Kriminologi",
            emoji: "🕵️",
            subtitle: "Kajian kejahatan, forensik sosial, dan kebijakan kriminal.",
          },
          {
            title: "Sosiologi",
            emoji: "👥",
            subtitle: "Teliti perubahan sosial dan dinamika masyarakat.",
          },
          {
            title: "Filsafat",
            emoji: "📚",
            subtitle: "Latih berpikir kritis dan etika dalam pengambilan keputusan.",
          },
          {
            title: "Studi Kebijakan Publik",
            emoji: "🧭",
            subtitle: "Rancang intervensi kebijakan berbasis data dan riset.",
          },
        ],
      },
    ],
  },
};

export function getTrack(trackKey) {
  return PROGRAM_TRACKS[trackKey] ?? null;
}

export function getProgram(trackKey, slug) {
  const track = getTrack(trackKey);
  if (!track) {
    return null;
  }

  if (!slug) {
    return null;
  }

  return track.programs.find((program) => program.slug === slug) ?? null;
}

export function createProgramSlug(title) {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

