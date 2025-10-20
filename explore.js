import { PROGRAM_TRACKS, createProgramSlug } from "./explore-data.js";

let baseSubtitle = "";
let subtitleRef = null;

function getProgramDestination(trackKey, program) {
  const slug = program.slug || createProgramSlug(program.title);
  const params = new URLSearchParams({ track: trackKey, sub: slug });
  return `subcat.html?${params.toString()}`;
}

function createProgramCard(program, trackKey) {
  const card = document.createElement("a");
  card.className = "program-card";
  card.dataset.track = trackKey;
  card.href = getProgramDestination(trackKey, program);
  card.setAttribute("aria-label", `Jelajahi jurusan dalam ${program.title}`);

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

  if (subtitleRef) {
    const sectionDescription = track.sectionDescription ?? baseSubtitle;
    subtitleRef.textContent = sectionDescription || baseSubtitle;
  }

  programsContainer.innerHTML = "";
  track.programs.forEach((program) => {
    programsContainer.appendChild(createProgramCard(program, trackKey));
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

  subtitleRef = document.querySelector(".explore-section-subtitle");
  baseSubtitle = subtitleRef?.textContent?.trim() ?? "";

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

  const params = new URLSearchParams(window.location.search);
  const requestedTrack = params.get("track");
  const requestedTab = requestedTrack
    ? Array.from(tabButtons).find((button) => button.dataset.track === requestedTrack)
    : null;

  const initialTab = requestedTab || document.querySelector(".explore-tab.is-active") || tabButtons[0];

  if (initialTab) {
    updateActiveTab(initialTab);
    setActiveTrack(initialTab.dataset.track);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExplorePage);
} else {
  initializeExplorePage();
}
