import { createProgramSlug, getProgram, getTrack } from "./explore-data.js";

const FALLBACK_PROGRAM_ICON = "assets/icons/default-program.svg";

function createSubProgramCard(subProgram) {
  const destination = subProgram.detailsUrl || "dashboard.html";
  const card = document.createElement("a");
  card.className = "program-card";
  card.href = destination;
  card.setAttribute("aria-label", `Lihat detail ${subProgram.title}`);

  const cardContent = document.createElement("div");
  cardContent.className = "program-card__content";

  if (subProgram.emoji || subProgram.iconUrl) {
    const token = document.createElement("span");
    token.className = subProgram.emoji
      ? "program-card__token"
      : "program-card__icon";

    if (subProgram.emoji) {
      token.textContent = subProgram.emoji;
      token.setAttribute("aria-hidden", "true");
    } else if (subProgram.iconUrl) {
      const iconImage = document.createElement("img");
      iconImage.src = subProgram.iconUrl;
      iconImage.alt = "";
      iconImage.loading = "lazy";
      iconImage.decoding = "async";
      const handleIconError = () => {
        if (iconImage.dataset.fallbackApplied === "true") {
          iconImage.removeEventListener("error", handleIconError);
          token.remove();
          return;
        }

        iconImage.dataset.fallbackApplied = "true";
        iconImage.src = FALLBACK_PROGRAM_ICON;
      };

      iconImage.addEventListener("error", handleIconError);
      token.appendChild(iconImage);
    }

    cardContent.appendChild(token);
  }

  const titleEl = document.createElement("span");
  titleEl.className = "program-card__title";
  titleEl.textContent = subProgram.title;
  cardContent.appendChild(titleEl);

  if (subProgram.subtitle) {
    const subtitleEl = document.createElement("p");
    subtitleEl.className = "program-card__subtitle";
    subtitleEl.textContent = subProgram.subtitle;
    cardContent.appendChild(subtitleEl);
  }

  card.appendChild(cardContent);

  return card;
}

function resolveProgram(trackKey, slug) {
  const track = getTrack(trackKey);
  if (!track) {
    return { track: null, program: null };
  }

  if (!slug) {
    return { track, program: null };
  }

  const program =
    getProgram(trackKey, slug) ||
    track.programs.find((candidate) => createProgramSlug(candidate.title) === slug);

  return { track, program: program ?? null };
}

function redirectToExplore(trackKey) {
  const params = new URLSearchParams();
  if (trackKey && getTrack(trackKey)) {
    params.set("track", trackKey);
  }
  const search = params.toString();
  const destination = search ? `explore.html?${search}` : "explore.html";
  window.location.replace(destination);
}

function initializeSubcategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const trackKey = params.get("track") || "";
  const slug = params.get("sub") || "";

  const { track, program } = resolveProgram(trackKey, slug);

  if (!track || !program) {
    redirectToExplore(trackKey);
    return;
  }

  const breadcrumbTrack = document.getElementById("breadcrumb-track");
  const breadcrumbSubcategory = document.getElementById("breadcrumb-subcategory");
  const titleEl = document.getElementById("subcategory-title");
  const descriptionEl = document.getElementById("subcategory-description");
  const backButton = document.getElementById("subcategory-back");
  const badgeEl = document.getElementById("subcategory-badge");
  const headingEl = document.getElementById("subcategory-programs-heading");
  const programsContainer = document.getElementById("subcategory-programs");

  const trackUrlParams = new URLSearchParams({ track: trackKey });
  const trackUrl = `explore.html?${trackUrlParams.toString()}`;

  if (breadcrumbTrack) {
    breadcrumbTrack.textContent = track.label;
    breadcrumbTrack.href = trackUrl;
  }

  if (breadcrumbSubcategory) {
    breadcrumbSubcategory.textContent = program.title;
  }

  if (titleEl) {
    titleEl.textContent = program.title;
  }

  if (document.title) {
    document.title = `${program.title} - ${track.label} | Edlevator`;
  }

  if (descriptionEl) {
    const description = program.description ?? "";
    descriptionEl.textContent = description;
    descriptionEl.toggleAttribute("hidden", description.trim() === "");
  }

  if (backButton) {
    backButton.href = trackUrl;
    backButton.textContent = `Kembali ke ${track.label}`;
  }

  if (badgeEl) {
    badgeEl.textContent = track.label;
  }

  if (headingEl) {
    headingEl.textContent = program.heading ?? `Pilihan jurusan ${program.title}`;
  }

  if (!programsContainer) {
    return;
  }

  programsContainer.innerHTML = "";

  if (!Array.isArray(program.subPrograms) || program.subPrograms.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Belum ada jurusan yang ditampilkan pada sub-kategori ini.";
    programsContainer.appendChild(emptyState);
    return;
  }

  program.subPrograms.forEach((subProgram) => {
    programsContainer.appendChild(createSubProgramCard(subProgram));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSubcategoryPage);
} else {
  initializeSubcategoryPage();
}
