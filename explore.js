const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    description: "Sub-kategori favorit di rumpun IPA dengan fokus pada sains, teknologi, dan kesehatan.",
    programs: [
      {
        title: "Teknik & Teknologi",
        illustration:
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Belajar coding, robotika, dan sistem cerdas dengan studi kasus industri.",
          "Project akhir berupa prototipe aplikasi atau perangkat IoT.",
          "Prospek karier: Software Engineer, Data Scientist, Product Engineer."
        ],
        sampleCourses: [
          "Dasar Pemrograman Python",
          "Rekayasa Perangkat Lunak",
          "Jaringan Komputer Modern"
        ]
      },
      {
        title: "Kedokteran & Kesehatan",
        illustration:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Materi anatomi, biokimia, dan praktik klinis virtual yang interaktif.",
          "Sesi mentoring bersama dokter muda dan praktisi kesehatan.",
          "Prospek karier: Dokter, Ahli Gizi, Peneliti Medis."
        ],
        sampleCourses: [
          "Dasar Anatomi Manusia",
          "Farmakologi Klinik",
          "Manajemen Rumah Sakit Digital"
        ]
      },
      {
        title: "Ilmu Hayati & Lingkungan",
        illustration:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Eksperimen biologi molekuler dan analisis data laboratorium.",
          "Belajar konservasi lingkungan melalui studi kasus nyata.",
          "Prospek karier: Ahli Bioteknologi, Peneliti Lingkungan, Konsultan Energi."
        ],
        sampleCourses: [
          "Genetika Terapan",
          "Ekologi dan Keberlanjutan",
          "Teknologi Pangan"
        ]
      }
    ]
  },
  ips: {
    label: "Jurusan IPS",
    description: "Sub-kategori unggulan di rumpun IPS yang siap menyiapkan kamu menjadi pemimpin masa depan.",
    programs: [
      {
        title: "Manajemen & Bisnis",
        illustration:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Simulasi bisnis digital dan studi kasus startup lokal.",
          "Mentoring kewirausahaan bersama founder dan C-Level.",
          "Prospek karier: Business Analyst, Entrepreneur, Product Manager."
        ],
        sampleCourses: [
          "Dasar Manajemen Bisnis",
          "Keuangan untuk Startup",
          "Strategi Pemasaran Digital"
        ]
      },
      {
        title: "Komunikasi & Media",
        illustration:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Belajar storytelling, produksi konten, dan analisis audiens.",
          "Workshop langsung dengan praktisi media dan public relations.",
          "Prospek karier: Content Strategist, Jurnalis, PR Specialist."
        ],
        sampleCourses: [
          "Dasar Komunikasi Massa",
          "Brand Storytelling",
          "Strategi Media Sosial"
        ]
      },
      {
        title: "Hukum & Ilmu Politik",
        illustration:
          "https://images.unsplash.com/photo-1528747045269-390fe33c19d4?auto=format&fit=crop&w=900&q=80",
        highlights: [
          "Simulasi sidang dan analisis kebijakan publik terkini.",
          "Bimbingan riset dari akademisi hukum dan politisi muda.",
          "Prospek karier: Lawyer, Policy Analyst, Diplomat."
        ],
        sampleCourses: [
          "Pengantar Ilmu Hukum",
          "Hukum Bisnis Modern",
          "Analisis Kebijakan Publik"
        ]
      }
    ]
  }
};

function createProgramCard(program) {
  const card = document.createElement("article");
  card.className = "program-card";
  card.innerHTML = `
    <figure class="program-illustration">
      <img src="${program.illustration}" alt="Ilustrasi ${program.title}" loading="lazy">
    </figure>
    <div class="program-content">
      <h3>${program.title}</h3>
      <ul class="program-highlights">
        ${program.highlights.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <div class="program-courses">
        <span>Contoh mata kuliah:</span>
        <div class="program-tags">
          ${program.sampleCourses.map((course) => `<span class="chip">${course}</span>`).join("")}
        </div>
      </div>
      <div class="program-actions">
        <a href="dashboard.html" class="btn secondary small">Lihat kelas terkait</a>
      </div>
    </div>
  `;
  return card;
}

function setActiveTrack(trackKey) {
  const track = PROGRAM_TRACKS[trackKey];
  const programsContainer = document.getElementById("explore-programs");
  const trackLabel = document.getElementById("explore-track-label");
  const trackHeading = document.getElementById("explore-track-heading");

  if (!track || !programsContainer || !trackLabel || !trackHeading) {
    return;
  }

  trackLabel.textContent = track.label;
  trackHeading.textContent = track.description;

  programsContainer.innerHTML = "";
  track.programs.forEach((program) => {
    programsContainer.appendChild(createProgramCard(program));
  });
}

function updateActiveTab(activeButton) {
  document.querySelectorAll(".explore-tab").forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
}

function initializeExplorePage() {
  const tabButtons = document.querySelectorAll(".explore-tab");

  if (!tabButtons.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const trackKey = button.dataset.track;
      if (!trackKey || !PROGRAM_TRACKS[trackKey]) {
        return;
      }
      updateActiveTab(button);
      setActiveTrack(trackKey);
    });
  });

  const firstTab = document.querySelector(".explore-tab.is-active") || tabButtons[0];
  if (firstTab) {
    const trackKey = firstTab.dataset.track;
    updateActiveTab(firstTab);
    setActiveTrack(trackKey);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExplorePage);
} else {
  initializeExplorePage();
}
