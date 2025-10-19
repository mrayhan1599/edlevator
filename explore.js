import { loadCourses } from "./script.js";

const TRACK_CONFIG = {
  ipa: {
    label: "Jurusan IPA",
    heroTitle: "Rumpun IPA",
    description: "Jelajahi sains, teknologi, dan kesehatan dalam rumpun IPA.",
    heading: "Sub-kategori unggulan rumpun IPA",
    fallbackPrograms: [
      {
        title: "Teknik & Teknologi",
        detailsUrl: "teknik-pertambangan.html",
      },
      {
        title: "Kedokteran & Kesehatan",
      },
      {
        title: "Ilmu Hayati & Lingkungan",
      },
    ],
  },
  ips: {
    label: "Jurusan IPS",
    heroTitle: "Rumpun IPS",
    description: "Telusuri bisnis, komunikasi, dan ilmu sosial di rumpun IPS.",
    heading: "Sub-kategori unggulan rumpun IPS",
    fallbackPrograms: [
      {
        title: "Manajemen & Bisnis",
      },
      {
        title: "Komunikasi & Media",
      },
      {
        title: "Hukum & Ilmu Politik",
      },
    ],
  },
};

const TRACK_KEYS = Object.keys(TRACK_CONFIG);

const trackPrograms = {
  ipa: [],
  ips: [],
};

const TEKNIK_PERTAMBANGAN_TITLE = "Teknik Pertambangan";

function createProgramCard(program) {
  const destination = program.detailsUrl || "dashboard.html";

  const card = document.createElement("a");
  card.className = "program-card";
  card.href = destination;
  card.setAttribute("aria-label", `Lihat detail ${program.title}`);

  const cardContent = document.createElement("div");
  cardContent.className = "program-card__content";

  const titleEl = document.createElement("span");
  titleEl.className = "program-card__title";
  titleEl.textContent = program.title;
  cardContent.appendChild(titleEl);

  if (program.badge) {
    const badgeEl = document.createElement("span");
    badgeEl.className = "program-card__badge";
    badgeEl.textContent = program.badge;
    cardContent.appendChild(badgeEl);
  }

  if (Array.isArray(program.meta) && program.meta.length > 0) {
    const metaList = document.createElement("ul");
    metaList.className = "program-card__meta";
    program.meta.forEach((item) => {
      const metaItem = document.createElement("li");
      metaItem.textContent = item;
      metaList.appendChild(metaItem);
    });
    cardContent.appendChild(metaList);
  }

  card.appendChild(cardContent);

  return card;
}

function setActiveTrack(trackKey) {
  const track = TRACK_CONFIG[trackKey];
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
  const programs = trackPrograms[trackKey] ?? [];
  const items = programs.length > 0 ? programs : track.fallbackPrograms;

  items.forEach((program) => {
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

async function initializeExplorePage() {
  const tabButtons = document.querySelectorAll(".explore-tab");

  if (!tabButtons.length) {
    return;
  }

  try {
    await hydrateTrackPrograms();
  } catch (error) {
    console.error(error);
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const trackKey = button.dataset.track;
      if (!trackKey || !TRACK_CONFIG[trackKey]) {
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
  document.addEventListener("DOMContentLoaded", () => {
    initializeExplorePage();
  });
} else {
  initializeExplorePage();
}

function normalizeTrackKey(value) {
  return (value ?? "").toString().trim().toLowerCase();
}

function formatCourseMeta(course) {
  const meta = [];

  if (course.level) {
    meta.push(course.level);
  }

  const hoursValue = Number.parseInt(course.hours, 10);
  if (Number.isFinite(hoursValue) && !Number.isNaN(hoursValue) && hoursValue > 0) {
    meta.push(`${hoursValue} jam`);
  }

  const ratingValue = course.rating
    ? Number.parseFloat(course.rating)
    : null;

  if (Number.isFinite(ratingValue) && ratingValue > 0) {
    meta.push(`Rating ${ratingValue.toFixed(1)}`);
  }

  if (course.instructor) {
    meta.push(course.instructor);
  }

  return meta;
}

function toProgramFromCourse(course) {
  const title = course.title ?? "Kursus";
  const normalizedTitle = title.toLowerCase();
  const detailsUrl = normalizedTitle.includes(
    TEKNIK_PERTAMBANGAN_TITLE.toLowerCase()
  )
    ? "teknik-pertambangan.html"
    : "dashboard.html";

  return {
    id: course.id,
    title,
    detailsUrl,
    badge: course.category ?? null,
    meta: formatCourseMeta(course),
  };
}

async function hydrateTrackPrograms() {
  try {
    const courses = await loadCourses();
    TRACK_KEYS.forEach((key) => {
      trackPrograms[key] = [];
    });

    courses.forEach((course) => {
      const trackKey = normalizeTrackKey(course.track);
      if (!TRACK_KEYS.includes(trackKey)) {
        return;
      }
      trackPrograms[trackKey].push(toProgramFromCourse(course));
    });
  } catch (error) {
    console.error(error);
    TRACK_KEYS.forEach((key) => {
      trackPrograms[key] = [];
    });
  }
}
