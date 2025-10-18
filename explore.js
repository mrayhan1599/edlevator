const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    description: "Sub-kategori favorit di rumpun IPA dengan fokus pada sains, teknologi, dan kesehatan.",
    programs: [
      {
        title: "Teknik & Teknologi",
        detailsUrl: "teknik-pertambangan.html",
        infographic:
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-engineering-industry-flaticons-flat-flat-icons.png",
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
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-medical-professions-flaticons-flat-flat-icons-2.png",
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
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-natural-science-green-technology-flaticons-flat-flat-icons.png",
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
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-business-business-management-flaticons-flat-flat-icons.png",
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
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-communication-communication-flaticons-flat-flat-icons.png",
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
          "https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-law-justice-flaticons-flat-flat-icons.png",
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
