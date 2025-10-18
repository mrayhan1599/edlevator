const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    description: "Sub-kategori favorit di rumpun IPA dengan fokus pada sains, teknologi, dan kesehatan.",
    programs: [
      {
        title: "Teknik & Teknologi",
        detailsUrl: "teknik-pertambangan.html",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EEF2FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M28%2052h24a4%204%200%200%200%204-4V32a4%204%200%200%200-4-4H28a4%204%200%200%200-4%204v16a4%204%200%200%200%204%204z%27%20fill%3D%27%234F46E5%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2048h20V36H30z%27%20fill%3D%27white%27/%3E%0A%20%20%3Crect%20x%3D%2734%27%20y%3D%2724%27%20width%3D%2712%27%20height%3D%276%27%20rx%3D%272%27%20fill%3D%27%236366F1%27/%3E%0A%20%20%3Ccircle%20cx%3D%2730%27%20cy%3D%2758%27%20r%3D%274%27%20fill%3D%27%2322C55E%27/%3E%0A%20%20%3Ccircle%20cx%3D%2750%27%20cy%3D%2758%27%20r%3D%274%27%20fill%3D%27%2322C55E%27/%3E%0A%3C/svg%3E",
        summary:
          "Belajar teknologi digital, pemrograman, dan rekayasa sistem yang siap pakai di industri.",
        majors: [
          "Teknik Informatika",
          "Sistem Informasi",
          "Teknik Industri",
          "Teknik Elektro",
          "Teknik Mesin"
        ]
      },
      {
        title: "Kedokteran & Kesehatan",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23ECFDF5%27/%3E%0A%20%20%3Cpath%20d%3D%27M40%2020c-9%200-16%207-16%2016s7%2020%2016%2024c9-4%2016-15%2016-24s-7-16-16-16z%27%20fill%3D%27%2310B981%27/%3E%0A%20%20%3Cpath%20d%3D%27M44%2034h-4v-4h-4v4h-4v4h4v4h4v-4h4z%27%20fill%3D%27white%27/%3E%0A%3C/svg%3E",
        summary:
          "Pelajari dasar ilmu kesehatan, praktik klinis virtual, dan kesiapan profesi kedokteran.",
        majors: [
          "Pendidikan Dokter",
          "Keperawatan",
          "Farmasi",
          "Gizi",
          "Kesehatan Masyarakat"
        ]
      },
      {
        title: "Ilmu Hayati & Lingkungan",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EFF6FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2020h16l-4%2016%2012%2018H24l12-18z%27%20fill%3D%27%233B82F6%27/%3E%0A%20%20%3Ccircle%20cx%3D%2740%27%20cy%3D%2730%27%20r%3D%274%27%20fill%3D%27white%27/%3E%0A%20%20%3Ccircle%20cx%3D%2728%27%20cy%3D%2756%27%20r%3D%274%27%20fill%3D%27%23FACC15%27/%3E%0A%20%20%3Ccircle%20cx%3D%2752%27%20cy%3D%2756%27%20r%3D%274%27%20fill%3D%27%23FACC15%27/%3E%0A%3C/svg%3E",
        summary:
          "Eksplorasi biologi, kimia, dan konservasi lingkungan dengan pendekatan ilmiah modern.",
        majors: [
          "Biologi",
          "Kimia",
          "Teknologi Pangan",
          "Teknik Lingkungan",
          "Agribisnis"
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
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EEF2FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M26%2030h28v28H26z%27%20fill%3D%27%234F46E5%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2044c2%202%206%202%208%200s6-2%208%200v8H32z%27%20fill%3D%27white%27%20opacity%3D%270.85%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2034h16v6H32z%27%20fill%3D%27white%27/%3E%0A%20%20%3Ccircle%20cx%3D%2740%27%20cy%3D%2724%27%20r%3D%276%27%20fill%3D%27%2322C55E%27/%3E%0A%3C/svg%3E",
        summary:
          "Pendalaman manajemen, kewirausahaan, dan strategi bisnis modern.",
        majors: [
          "Manajemen",
          "Akuntansi",
          "Bisnis Digital",
          "Kewirausahaan",
          "Administrasi Bisnis"
        ]
      },
      {
        title: "Komunikasi & Media",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EFF6FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M24%2024h32v22H24z%27%20fill%3D%27%233B82F6%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2030h20v6H30z%27%20fill%3D%27white%27%20opacity%3D%270.9%27/%3E%0A%20%20%3Cpath%20d%3D%27M26%2050l-6%2010%2012-6h20a6%206%200%200%200%206-6V46H26z%27%20fill%3D%27%234F46E5%27/%3E%0A%20%20%3Ccircle%20cx%3D%2748%27%20cy%3D%2736%27%20r%3D%273%27%20fill%3D%27%2322C55E%27/%3E%0A%3C/svg%3E",
        summary:
          "Kembangkan kemampuan storytelling, produksi konten, dan strategi komunikasi massa.",
        majors: [
          "Ilmu Komunikasi",
          "Hubungan Masyarakat",
          "Broadcasting",
          "Periklanan",
          "Jurnalistik"
        ]
      },
      {
        title: "Hukum & Ilmu Politik",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23F5F3FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M24%2050h32v10H24z%27%20fill%3D%27%234C1D95%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2020l-8%2014h36l-8-14H30z%27%20fill%3D%27%237C3AED%27/%3E%0A%20%20%3Crect%20x%3D%2734%27%20y%3D%2734%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27white%27%20opacity%3D%270.9%27/%3E%0A%20%20%3Cpath%20d%3D%27M34%2044h12v6H34z%27%20fill%3D%27%2322C55E%27%20opacity%3D%270.9%27/%3E%0A%3C/svg%3E",
        summary:
          "Dalami hukum, kebijakan publik, dan dinamika politik kontemporer.",
        majors: [
          "Ilmu Hukum",
          "Ilmu Politik",
          "Hubungan Internasional",
          "Kriminologi",
          "Administrasi Publik"
        ]
      }
    ]
  }
};

function collapseProgramCards(container) {
  if (!container) {
    return;
  }

  container.querySelectorAll(".program-card").forEach((card) => {
    const trigger = card.querySelector(".program-card__trigger");
    const details = card.querySelector(".program-card__details");
    if (trigger && details) {
      trigger.setAttribute("aria-expanded", "false");
      details.hidden = true;
    }
    card.classList.remove("is-expanded");
  });
}

function createProgramCard(program, container) {
  const card = document.createElement("article");
  card.className = "program-card";

  const majorsMarkup = (program.majors ?? [])
    .map((major) => `<li>${major}</li>`)
    .join("");

  const detailsLink = program.detailsUrl
    ? `<a href="${program.detailsUrl}" class="btn tertiary small">Lihat detail program</a>`
    : "";

  card.innerHTML = `
    <button type="button" class="program-card__trigger" aria-expanded="false">
      <figure class="program-card__icon">
        <img src="${program.infographic}" alt="Infografis ${program.title}" loading="lazy">
      </figure>
      <div class="program-card__header">
        <h3>${program.title}</h3>
        <p>${program.summary ?? ""}</p>
      </div>
      <span class="program-card__chevron" aria-hidden="true"></span>
    </button>
    <div class="program-card__details" hidden>
      <h4>Daftar jurusan populer</h4>
      <ul class="program-card__list">
        ${majorsMarkup}
      </ul>
      <div class="program-card__actions">
        ${detailsLink}
        <a href="dashboard.html" class="btn secondary small">Lihat kelas terkait</a>
      </div>
    </div>
  `;

  const trigger = card.querySelector(".program-card__trigger");
  const details = card.querySelector(".program-card__details");

  if (trigger && details) {
    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      collapseProgramCards(container);

      if (!isExpanded) {
        trigger.setAttribute("aria-expanded", "true");
        details.hidden = false;
        card.classList.add("is-expanded");
      }
    });
  }

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
    programsContainer.appendChild(createProgramCard(program, programsContainer));
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
