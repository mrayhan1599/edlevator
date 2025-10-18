const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    heroTitle: "Rumpun IPA",
    description: "Sub-kategori favorit di rumpun IPA dengan fokus pada sains, teknologi, dan kesehatan.",
    heading: "Sub-kategori unggulan rumpun IPA",
    programs: [
      {
        title: "Teknik & Teknologi",
        icon: "🛠️",
        detailsUrl: "teknik-pertambangan.html",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23E0F2FE%27/%3E%0A%20%20%3Cpath%20d%3D%27M26%2054h28a6%206%200%200%200%206-6V32a6%206%200%200%200-6-6H26a6%206%200%200%200-6%206v16a6%206%200%200%200%206%206z%27%20fill%3D%270281C7%27%20opacity%3D%270.85%27/%3E%0A%20%20%3Crect%20x%3D%2730%27%20y%3D%2726%27%20width%3D%2720%27%20height%3D%279%27%20rx%3D%272%27%20fill%3D%2338BDF8%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2048h20v-8H30z%27%20fill%3D%27white%27/%3E%0A%20%20%3Ccircle%20cx%3D%2730%27%20cy%3D%2760%27%20r%3D%274%27%20fill%3D%2310B981%27/%3E%0A%20%20%3Ccircle%20cx%3D%2750%27%20cy%3D%2760%27%20r%3D%274%27%20fill%3D%2310B981%27/%3E%0A%3C/svg%3E",
        summary:
          "Belajar teknologi digital, pemrograman, dan rekayasa sistem yang siap pakai di industri.",
        metrics: [
          { label: "Kompetensi", value: "92" },
          { label: "Karier", value: "88" },
          { label: "Populer", value: "95" }
        ]
      },
      {
        title: "Kedokteran & Kesehatan",
        icon: "🩺",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23ECFDF5%27/%3E%0A%20%20%3Cpath%20d%3D%27M40%2020c-9%200-16%207-16%2016s7%2020%2016%2024c9-4%2016-15%2016-24s-7-16-16-16z%27%20fill%3D%2710B981%27/%3E%0A%20%20%3Cpath%20d%3D%27M44%2034h-4v-4h-4v4h-4v4h4v4h4v-4h4z%27%20fill%3D%27white%27/%3E%0A%3C/svg%3E",
        summary:
          "Pelajari dasar ilmu kesehatan, praktik klinis virtual, dan kesiapan profesi kedokteran.",
        metrics: [
          { label: "Kompetensi", value: "94" },
          { label: "Karier", value: "90" },
          { label: "Populer", value: "91" }
        ]
      },
      {
        title: "Ilmu Hayati & Lingkungan",
        icon: "🧪",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EFF6FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2020h16l-4%2016%2012%2018H24l12-18z%27%20fill%3D%273B82F6%27/%3E%0A%20%20%3Ccircle%20cx%3D%2740%27%20cy%3D%2730%27%20r%3D%274%27%20fill%3D%27white%27/%3E%0A%20%20%3Ccircle%20cx%3D%2728%27%20cy%3D%2756%27%20r%3D%274%27%20fill%3D%27%23FACC15%27/%3E%0A%20%20%3Ccircle%20cx%3D%2752%27%20cy%3D%2756%27%20r%3D%274%27%20fill%3D%27%23FACC15%27/%3E%0A%3C/svg%3E",
        summary:
          "Eksplorasi biologi, kimia, dan konservasi lingkungan dengan pendekatan ilmiah modern.",
        metrics: [
          { label: "Kompetensi", value: "89" },
          { label: "Karier", value: "84" },
          { label: "Populer", value: "87" }
        ]
      }
    ]
  },
  ips: {
    label: "Jurusan IPS",
    heroTitle: "Rumpun IPS",
    description: "Sub-kategori unggulan di rumpun IPS yang siap menyiapkan kamu menjadi pemimpin masa depan.",
    heading: "Sub-kategori unggulan rumpun IPS",
    programs: [
      {
        title: "Manajemen & Bisnis",
        icon: "📊",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23E0F2FE%27/%3E%0A%20%20%3Cpath%20d%3D%27M26%2030h28v28H26z%27%20fill%3D%2338BDF8%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2044c2%202%206%202%208%200s6-2%208%200v8H32z%27%20fill%3D%27white%27%20opacity%3D%270.9%27/%3E%0A%20%20%3Cpath%20d%3D%27M32%2034h16v6H32z%27%20fill%3D%27white%27/%3E%0A%20%20%3Ccircle%20cx%3D%2740%27%20cy%3D%2724%27%20r%3D%276%27%20fill%3D%2310B981%27/%3E%0A%3C/svg%3E",
        summary:
          "Pendalaman manajemen, kewirausahaan, dan strategi bisnis modern.",
        metrics: [
          { label: "Kompetensi", value: "88" },
          { label: "Karier", value: "93" },
          { label: "Populer", value: "90" }
        ]
      },
      {
        title: "Komunikasi & Media",
        icon: "📣",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23EFF6FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M24%2024h32v22H24z%27%20fill%3D%233B82F6%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2030h20v6H30z%27%20fill%3D%27white%27%20opacity%3D%270.9%27/%3E%0A%20%20%3Cpath%20d%3D%27M26%2050l-6%2010%2012-6h20a6%206%200%200%200%206-6V46H26z%27%20fill%3D%2338BDF8%27/%3E%0A%20%20%3Ccircle%20cx%3D%2748%27%20cy%3D%2736%27%20r%3D%273%27%20fill%3D%2310B981%27/%3E%0A%3C/svg%3E",
        summary:
          "Kembangkan kemampuan storytelling, produksi konten, dan strategi komunikasi massa.",
        metrics: [
          { label: "Kompetensi", value: "86" },
          { label: "Karier", value: "82" },
          { label: "Populer", value: "94" }
        ]
      },
      {
        title: "Hukum & Ilmu Politik",
        icon: "⚖️",
        infographic:
          "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2080%2080%27%3E%0A%20%20%3Crect%20width%3D%2780%27%20height%3D%2780%27%20rx%3D%2718%27%20fill%3D%27%23F5F3FF%27/%3E%0A%20%20%3Cpath%20d%3D%27M24%2050h32v10H24z%27%20fill%3D%237C3AED%27/%3E%0A%20%20%3Cpath%20d%3D%27M30%2020l-8%2014h36l-8-14H30z%27%20fill%3D%27%23633AB5%27/%3E%0A%20%20%3Crect%20x%3D%2734%27%20y%3D%2734%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27white%27%20opacity%3D%270.9%27/%3E%0A%20%20%3Cpath%20d%3D%27M34%2044h12v6H34z%27%20fill%3D%2310B981%27%20opacity%3D%270.9%27/%3E%0A%3C/svg%3E",
        summary:
          "Dalami hukum, kebijakan publik, dan dinamika politik kontemporer.",
        metrics: [
          { label: "Kompetensi", value: "90" },
          { label: "Karier", value: "85" },
          { label: "Populer", value: "88" }
        ]
      }
    ]
  }
};

function createMetricsMarkup(metrics = []) {
  if (!metrics.length) {
    return "";
  }

  const metricItems = metrics
    .map(
      (metric) => `
        <div class="program-card__metric">
          <dt>${metric.label}</dt>
          <dd>${metric.value}</dd>
        </div>
      `
    )
    .join("");

  return `<dl class="program-card__metrics">${metricItems}</dl>`;
}

function createProgramCard(program) {
  const card = document.createElement("article");
  card.className = "program-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Lihat detail ${program.title}`);

  const destination = program.detailsUrl || "dashboard.html";

  card.innerHTML = `
    <figure class="program-card__media">
      <img src="${program.infographic}" alt="Infografis ${program.title}" loading="lazy">
    </figure>
    <div class="program-card__body">
      <div class="program-card__heading">
        ${program.icon ? `<span class="program-card__emoji" aria-hidden="true">${program.icon}</span>` : ""}
        <h3>${program.title}</h3>
      </div>
      <p>${program.summary ?? ""}</p>
      ${createMetricsMarkup(program.metrics)}
    </div>
  `;

  const handleNavigate = () => {
    window.location.href = destination;
  };

  card.addEventListener("click", handleNavigate);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  });

  return card;
}

function setActiveTrack(trackKey) {
  const track = PROGRAM_TRACKS[trackKey];
  const programsContainer = document.getElementById("explore-programs");
  const trackLabel = document.getElementById("explore-track-label");
  const trackHeading = document.getElementById("explore-track-heading");
  const heroTitle = document.getElementById("explore-hero-title");
  const heroSubtitle = document.getElementById("explore-hero-subtitle");

  if (!track || !programsContainer || !trackLabel || !trackHeading || !heroTitle || !heroSubtitle) {
    return;
  }

  trackLabel.textContent = track.label;
  trackHeading.textContent = track.heading ?? track.description;
  heroTitle.textContent = track.heroTitle ?? track.label;
  heroSubtitle.textContent = track.description ?? "";

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
