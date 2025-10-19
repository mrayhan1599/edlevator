const PROGRAM_TRACKS = {
  ipa: {
    label: "Jurusan IPA",
    heroTitle: "Rumpun IPA",
    description: "Jelajahi sains, teknologi, dan kesehatan dalam rumpun IPA.",
    heading: "Sub-kategori unggulan rumpun IPA",
    programs: [
      {
        title: "Teknik & Teknologi",
        detailsUrl: "teknik-pertambangan.html",
        iconUrl: "assets/icons/engineering.svg",
      },
      {
        title: "Kedokteran & Kesehatan",
        iconUrl: "assets/icons/health.svg",
      },
      {
        title: "Ilmu Hayati & Lingkungan",
        iconUrl: "assets/icons/environment.svg",
      },
    ],
  },
  ips: {
    label: "Jurusan IPS",
    heroTitle: "Rumpun IPS",
    description: "Telusuri bisnis, komunikasi, dan ilmu sosial di rumpun IPS.",
    heading: "Sub-kategori unggulan rumpun IPS",
    programs: [
      {
        title: "Manajemen & Bisnis",
        iconUrl: "assets/icons/business.svg",
      },
      {
        title: "Komunikasi & Media",
        iconUrl: "assets/icons/communication.svg",
      },
      {
        title: "Hukum & Ilmu Politik",
        iconUrl: "assets/icons/law.svg",
      },
    ],
  },
};

function createProgramCard(program) {
  const destination = program.detailsUrl || "dashboard.html";

  const card = document.createElement("a");
  card.className = "program-card";
  card.href = destination;
  card.setAttribute("aria-label", `Lihat detail ${program.title}`);

  const cardContent = document.createElement("div");
  cardContent.className = "program-card__content";

  if (program.iconUrl) {
    const iconWrapper = document.createElement("span");
    iconWrapper.className = "program-card__icon";

    const iconImage = document.createElement("img");
    iconImage.src = program.iconUrl;
    iconImage.alt = "";
    iconImage.loading = "lazy";
    iconImage.decoding = "async";
    iconImage.addEventListener("error", () => {
      iconWrapper.remove();
    });

    iconWrapper.appendChild(iconImage);
    cardContent.appendChild(iconWrapper);
  }

  const titleEl = document.createElement("span");
  titleEl.className = "program-card__title";
  titleEl.textContent = program.title;
  cardContent.appendChild(titleEl);

  card.appendChild(cardContent);

  return card;
}

function setActiveTrack(trackKey) {
  const track = PROGRAM_TRACKS[trackKey];
  const programsContainer = document.getElementById("explore-programs");
  const trackLabel = document.getElementById("explore-track-label");
  const trackHeading = document.getElementById("explore-track-heading");
  const heroTitle = document.getElementById("explore-hero-title");
  const heroSubtitle = document.getElementById("explore-hero-subtitle");

  if (!track || !programsContainer || !trackLabel || !trackHeading || !heroTitle) {
    return;
  }

  trackLabel.textContent = track.label;
  trackHeading.textContent = track.heading ?? track.description ?? track.label;
  heroTitle.textContent = track.heroTitle ?? track.label;

  if (heroSubtitle) {
    const description = track.description ?? "";
    heroSubtitle.textContent = description;
    heroSubtitle.toggleAttribute("hidden", description.trim() === "");
  }

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
