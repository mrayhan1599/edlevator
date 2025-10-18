import {
  supabaseClient,
  signOut,
  getSession,
  getUserProfile,
  onAuthStateChange,
} from "./auth.js";

const PROFILE_STORAGE_PREFIX = "edlevator:profile:";

const SAMPLE_COURSES = [
  {
    id: "sample-ipa-tech",
    title: "Pengantar Teknik & Teknologi",
    category: "IPA - Teknik",
    level: "Pemula",
    hours: 12,
    rating: 4.8,
    average_score: 96,
    instructor: "Tim Mentor Edlevator",
    isSample: true,
  },
  {
    id: "sample-ipa-med",
    title: "Dasar Kedokteran Modern",
    category: "IPA - Kedokteran",
    level: "Menengah",
    hours: 10,
    rating: 4.7,
    average_score: 94,
    instructor: "Dr. Aureliani",
    isSample: true,
  },
  {
    id: "sample-ips-biz",
    title: "Manajemen Bisnis Digital",
    category: "IPS - Manajemen",
    level: "Pemula",
    hours: 8,
    rating: 4.6,
    average_score: 92,
    instructor: "Mentor Startup",
    isSample: true,
  },
  {
    id: "sample-ips-comm",
    title: "Komunikasi Strategis & Branding",
    category: "IPS - Komunikasi",
    level: "Menengah",
    hours: 9,
    rating: 4.5,
    average_score: 90,
    instructor: "Praktisi Media",
    isSample: true,
  },
];

export async function loadCourses() {
  const { data, error } = await supabaseClient
    .from("courses")
    .select("id, title, category, level, hours, rating, instructor")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  if (data && data.length > 0) {
    return data;
  }

  return SAMPLE_COURSES;
}

export async function enroll(courseId) {
  const session = await getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  const userId = session.user.id;

  const { data: existing, error: existingError } = await supabaseClient
    .from("enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    console.error(existingError);
    alert("Terjadi kesalahan saat mengecek pendaftaran.");
    return null;
  }

  if (existing) {
    alert("Kamu sudah mendaftar kursus ini.");
    return existing;
  }

  const { data, error } = await supabaseClient
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      status: "pending",
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(error);
    alert("Tidak dapat mendaftar kursus. Coba lagi nanti.");
    return null;
  }

  alert("Pendaftaran kursus berhasil! Status saat ini: pending.");

  if (typeof refreshMyEnrollmentsUI === "function") {
    refreshMyEnrollmentsUI();
  }

  return data;
}

export async function myEnrollments() {
  const session = await getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("enrollments")
    .select(
      "id, status, created_at, course_id, courses(id, title, category, level, hours, rating, instructor)"
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    ...item,
    course: item.courses,
  }));
}

let cachedSession = null;
let cachedProfile = null;
let cachedProfileDetails = null;
let cachedAvatarDataUrl = null;
let courseCache = [];
let cachedEnrollments = [];
let enrollmentsContainer = null;
let dashboardMessage = null;
let dashboardCoursesList = null;
let searchInputEl = null;
let categoryFilterEl = null;
let levelFilterEl = null;
let statTotalCourseEl = null;
let statTotalHoursEl = null;
let statAverageScoreEl = null;
let navAuthEl = null;
let adminPanelEl = null;
let adminMessageEl = null;
let adminUsersBody = null;
let adminEnrollmentsBody = null;
let adminCourseFilter = null;
let adminStatusFilter = null;
let adminEmptyState = null;
let adminCoursesCache = [];
let adminEnrollmentsCache = [];
let adminProfilesCache = [];
let avatarForm = null;
let avatarInputEl = null;
let avatarPreviewEl = null;
let avatarFeedbackEl = null;
let passwordForm = null;
let passwordFeedbackEl = null;
let profileInfoForm = null;
let profileInfoFeedbackEl = null;
let certificatesContainer = null;
let profileEmailInput = null;
let selectedAvatarDataUrl = null;

function formatHours(hours) {
  return `${hours} jam`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderNavbar() {
  if (!navAuthEl) {
    return;
  }

  if (!cachedSession) {
    navAuthEl.innerHTML = `
      <a class="btn secondary" href="login.html">Login</a>
      <a class="btn" href="daftar.html">Daftar</a>
    `;
    return;
  }

  const displayName =
    cachedProfileDetails?.fullName?.trim() ||
    cachedProfile?.full_name ||
    cachedSession.user?.user_metadata?.full_name ||
    cachedSession.user?.email ||
    "Pengguna";

  navAuthEl.innerHTML = `
    <span class="nav-greeting">Halo, ${displayName}</span>
    <button type="button" class="btn secondary" id="logout-button">Logout</button>
  `;

  const logoutButton = navAuthEl.querySelector("#logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut();
        await updateSession();
      } catch (error) {
        console.error(error);
        alert("Gagal logout. Coba lagi.");
      }
    });
  }
}

function updateDashboardAccess() {
  if (!dashboardMessage) {
    return;
  }

  if (!cachedSession) {
    dashboardMessage.textContent =
      "Masuk untuk mengakses dashboard dan mendaftar kursus.";
    return;
  }

  dashboardMessage.textContent =
    "Jelajahi kursus dan daftarkan dirimu sesuai minat.";
}

function renderCourseCard(course) {
  const wrapper = document.createElement("article");
  wrapper.className = "course-card";
  const enrollLabel = course.isSample ? "Segera Hadir" : "Daftar";
  const enrollAttributes = course.isSample
    ? "disabled"
    : `data-action="enroll" data-course-id="${course.id}"`;
  const averageScore = getCourseAverageScore(course);
  const averageScoreLabel =
    typeof averageScore === "number" ? `${averageScore.toFixed(0)} / 100` : "-";
  const ratingLabel =
    typeof course.rating === "number" ? `${course.rating.toFixed(1)}` : "-";
  wrapper.innerHTML = `
    <div class="course-header">
      <div>
        <h2>${course.title}</h2>
        <div class="course-meta">
          <span class="badge">${course.category ?? ""}</span>
          <span>${course.instructor ?? ""}</span>
        </div>
      </div>
      <div class="course-meta">
        <span>${formatHours(course.hours ?? 0)}</span>
        <span>Rating ${ratingLabel}</span>
        <span>Nilai rata-rata ${averageScoreLabel}</span>
        <span class="badge">${course.level ?? ""}</span>
      </div>
    </div>
    <div class="course-actions">
      <button type="button" class="btn secondary" data-action="preview">Lihat Detail</button>
      <button type="button" class="btn" ${enrollAttributes}>${enrollLabel}</button>
    </div>
  `;

  const enrollButton = wrapper.querySelector(".course-actions .btn:last-child");
  if (enrollButton && !course.isSample) {
    enrollButton.addEventListener("click", () => {
      enroll(course.id);
    });
  }

  return wrapper;
}

function applyCourseFilters() {
  if (!dashboardCoursesList) {
    return;
  }

  const keyword = (searchInputEl?.value ?? "").trim().toLowerCase();
  const category = categoryFilterEl?.value ?? "";
  const level = levelFilterEl?.value ?? "";

  const filtered = courseCache.filter((course) => {
    const matchesKeyword =
      keyword === "" ||
      course.title?.toLowerCase().includes(keyword) ||
      course.instructor?.toLowerCase().includes(keyword) ||
      course.category?.toLowerCase().includes(keyword);

    const matchesCategory =
      category === "" ||
      (course.category ?? "").toLowerCase() === category.toLowerCase();
    const matchesLevel =
      level === "" || (course.level ?? "").toLowerCase() === level.toLowerCase();

    return matchesKeyword && matchesCategory && matchesLevel;
  });

  dashboardCoursesList.innerHTML = "";

  if (filtered.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Kursus tidak ditemukan. Coba ubah kata kunci atau filter.";
    message.className = "empty-state";
    dashboardCoursesList.appendChild(message);
    return;
  }

  filtered.forEach((course) => {
    dashboardCoursesList.appendChild(renderCourseCard(course));
  });

  updateUserStats();
}

async function initializeCourseFilters() {
  if (!dashboardCoursesList) {
    return;
  }

  try {
    courseCache = await loadCourses();
  } catch (error) {
    console.error(error);
    dashboardCoursesList.innerHTML =
      "<p class=\"empty-state\">Gagal memuat kursus. Coba muat ulang halaman.</p>";
    return;
  }

  const categories = Array.from(
    new Set(courseCache.map((course) => course.category).filter(Boolean))
  );
  const levels = Array.from(
    new Set(courseCache.map((course) => course.level).filter(Boolean))
  );

  if (categoryFilterEl) {
    const currentValues = Array.from(categoryFilterEl.options).map((opt) => opt.value);
    categories.forEach((category) => {
      if (!currentValues.includes(category)) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilterEl.appendChild(option);
      }
    });
  }

  if (levelFilterEl) {
    const currentValues = Array.from(levelFilterEl.options).map((opt) => opt.value);
    levels.forEach((level) => {
      if (!currentValues.includes(level)) {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        levelFilterEl.appendChild(option);
      }
    });
  }

  applyCourseFilters();
}

async function refreshMyEnrollmentsUI() {
  if (!enrollmentsContainer) {
    return;
  }

  enrollmentsContainer.innerHTML = "";

  if (!cachedSession) {
    const message = document.createElement("p");
    message.textContent = "Masuk untuk melihat kursus yang sudah kamu daftar.";
    message.className = "empty-state";
    enrollmentsContainer.appendChild(message);
    cachedEnrollments = [];
    updateUserStats();
    renderCertificates();
    return;
  }

  let enrollments = [];
  try {
    enrollments = await myEnrollments();
  } catch (error) {
    console.error(error);
    const message = document.createElement("p");
    message.textContent = "Gagal memuat daftar kursusmu.";
    message.className = "empty-state";
    enrollmentsContainer.appendChild(message);
    cachedEnrollments = [];
    updateUserStats();
    renderCertificates();
    return;
  }

  cachedEnrollments = enrollments;
  updateUserStats();
  renderCertificates();

  if (!enrollments.length) {
    const message = document.createElement("p");
    message.textContent = "Belum ada kursus yang kamu daftar.";
    message.className = "empty-state";
    enrollmentsContainer.appendChild(message);
    return;
  }

  enrollments.forEach((item) => {
    const card = document.createElement("article");
    card.className = "course-card enrollment-card";
    card.innerHTML = `
      <div class="course-header">
        <div>
          <h3>${item.course?.title ?? "Kursus"}</h3>
          <div class="course-meta">
            <span class="badge">${item.course?.category ?? ""}</span>
            <span>Status: <strong>${item.status}</strong></span>
          </div>
        </div>
        <div class="course-meta">
          <span>${item.course?.level ?? ""}</span>
          <span>${formatHours(item.course?.hours ?? 0)}</span>
          <span>${formatDate(item.created_at)}</span>
        </div>
      </div>
    `;
    enrollmentsContainer.appendChild(card);
  });
}

async function updateSession() {
  try {
    cachedSession = await getSession();
    cachedProfile = cachedSession
      ? await getUserProfile(cachedSession.user.id).catch((error) => {
          console.error(error);
          return null;
        })
      : null;
    loadStoredProfileDetails();
  } catch (error) {
    console.error(error);
    cachedSession = null;
    cachedProfile = null;
    cachedProfileDetails = null;
    cachedAvatarDataUrl = null;
  }

  renderNavbar();
  updateDashboardAccess();
  refreshMyEnrollmentsUI();
  hydrateProfileUI();
  updateAdminPanel();
}

function initializeEventListeners() {
  searchInputEl?.addEventListener("input", applyCourseFilters);
  categoryFilterEl?.addEventListener("change", applyCourseFilters);
  levelFilterEl?.addEventListener("change", applyCourseFilters);
}

function getCourseAverageScore(course) {
  if (!course) {
    return null;
  }

  const directScore = Number(course.average_score);
  if (Number.isFinite(directScore)) {
    return Math.max(0, Math.min(100, directScore));
  }

  const rating = Number(course.rating);
  if (Number.isFinite(rating)) {
    return Math.max(0, Math.min(100, rating * 20));
  }

  return null;
}

function deriveEnrollmentScore(enrollment) {
  if (!enrollment) {
    return null;
  }

  const directScore = Number(enrollment.final_score ?? enrollment.score);
  if (Number.isFinite(directScore)) {
    return Math.max(0, Math.min(100, directScore));
  }

  return getCourseAverageScore(enrollment.course);
}

function updateUserStats() {
  if (!statTotalCourseEl || !statTotalHoursEl || !statAverageScoreEl) {
    return;
  }

  if (!cachedSession) {
    statTotalCourseEl.textContent = "0";
    statTotalHoursEl.textContent = formatHours(0);
    statAverageScoreEl.textContent = "0";
    return;
  }

  const totalCourse = cachedEnrollments.length;
  const totalHours = cachedEnrollments.reduce(
    (sum, item) => sum + (item.course?.hours ?? 0),
    0
  );

  const scores = cachedEnrollments
    .map((item) => deriveEnrollmentScore(item))
    .filter((score) => typeof score === "number");

  const averageScore = scores.length
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  statTotalCourseEl.textContent = totalCourse.toString();
  statTotalHoursEl.textContent = formatHours(totalHours);
  statAverageScoreEl.textContent = averageScore.toFixed(1);
}

function getProfileStorageKey(suffix) {
  if (!cachedSession?.user?.id) {
    return null;
  }
  return `${PROFILE_STORAGE_PREFIX}${cachedSession.user.id}:${suffix}`;
}

function loadStoredProfileDetails() {
  const infoKey = getProfileStorageKey("info");
  const avatarKey = getProfileStorageKey("avatar");
  const storage =
    typeof window !== "undefined" ? window.localStorage ?? null : null;

  cachedProfileDetails = null;
  cachedAvatarDataUrl = null;

  if (infoKey && storage) {
    try {
      const raw = storage.getItem(infoKey);
      cachedProfileDetails = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Gagal memuat info profil lokal", error);
      cachedProfileDetails = null;
    }
  }

  if (avatarKey && storage) {
    try {
      cachedAvatarDataUrl = storage.getItem(avatarKey) ?? null;
    } catch (error) {
      console.warn("Gagal memuat avatar lokal", error);
      cachedAvatarDataUrl = null;
    }
  }
}

function saveStoredProfileDetails(data) {
  const key = getProfileStorageKey("info");
  const storage =
    typeof window !== "undefined" ? window.localStorage ?? null : null;
  if (!key || !storage) {
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(data));
    cachedProfileDetails = data;
  } catch (error) {
    console.warn("Gagal menyimpan info profil lokal", error);
  }
}

function saveStoredAvatar(dataUrl) {
  const key = getProfileStorageKey("avatar");
  const storage =
    typeof window !== "undefined" ? window.localStorage ?? null : null;
  if (!key || !storage) {
    return;
  }

  try {
    if (dataUrl) {
      storage.setItem(key, dataUrl);
    } else {
      storage.removeItem(key);
    }
    cachedAvatarDataUrl = dataUrl;
  } catch (error) {
    console.warn("Gagal menyimpan avatar lokal", error);
  }
}

function hydrateProfileUI() {
  if (!profileInfoForm) {
    return;
  }

  const isLoggedIn = Boolean(cachedSession);

  toggleProfileForms(isLoggedIn);

  if (!isLoggedIn) {
    resetProfileForms();
    setFeedbackMessage(
      profileInfoFeedbackEl,
      "Masuk untuk mengatur detail profilmu.",
      false
    );
    setFeedbackMessage(
      avatarFeedbackEl,
      "Masuk untuk mengganti foto profil.",
      false
    );
    setFeedbackMessage(
      passwordFeedbackEl,
      "Masuk untuk mengganti kata sandi.",
      false
    );
    updateAvatarPreview();
    return;
  }

  populateProfileFormFields();
  updateAvatarPreview();
  setFeedbackMessage(profileInfoFeedbackEl, "", false);
  setFeedbackMessage(avatarFeedbackEl, "", false);
  setFeedbackMessage(passwordFeedbackEl, "", false);
}

function resetProfileForms() {
  profileInfoForm?.reset();
  passwordForm?.reset();
  if (profileEmailInput) {
    profileEmailInput.value = "";
  }
  selectedAvatarDataUrl = null;
}

function toggleProfileForms(enabled) {
  const forms = [profileInfoForm, passwordForm, avatarForm];
  forms.forEach((form) => {
    if (!form) {
      return;
    }
    Array.from(form.elements).forEach((element) => {
      if (!element) {
        return;
      }
      if (element.id === "profile-email") {
        element.disabled = true;
        return;
      }
      element.disabled = !enabled;
    });
  });
}

function populateProfileFormFields() {
  if (!profileInfoForm) {
    return;
  }

  const data = {
    fullName:
      cachedProfileDetails?.fullName ??
      cachedProfile?.full_name ??
      cachedSession?.user?.user_metadata?.full_name ??
      "",
    birthdate: cachedProfileDetails?.birthdate ?? "",
    gender: cachedProfileDetails?.gender ?? "",
    track: cachedProfileDetails?.track ?? "",
    major: cachedProfileDetails?.major ?? "",
    occupation: cachedProfileDetails?.occupation ?? "",
    company: cachedProfileDetails?.company ?? "",
    location: cachedProfileDetails?.location ?? "",
    bio: cachedProfileDetails?.bio ?? "",
  };

  const setValue = (selector, value) => {
    const element = profileInfoForm.querySelector(selector);
    if (element) {
      element.value = value ?? "";
    }
  };

  setValue("#profile-full-name", data.fullName);
  setValue("#profile-birthdate", data.birthdate);
  setValue("#profile-gender", data.gender);
  setValue("#profile-track", data.track);
  setValue("#profile-major", data.major);
  setValue("#profile-occupation", data.occupation);
  setValue("#profile-company", data.company);
  setValue("#profile-location", data.location);
  setValue("#profile-bio", data.bio);

  if (profileEmailInput) {
    profileEmailInput.value = cachedSession?.user?.email ?? "";
  }
}

function updateAvatarPreview() {
  if (!avatarPreviewEl) {
    return;
  }

  if (!cachedSession) {
    avatarPreviewEl.style.backgroundImage = "";
    avatarPreviewEl.textContent = "Inisial";
    return;
  }

  const name =
    cachedProfileDetails?.fullName ||
    cachedProfile?.full_name ||
    cachedSession.user?.user_metadata?.full_name ||
    cachedSession.user?.email ||
    "Pengguna";

  if (cachedAvatarDataUrl) {
    avatarPreviewEl.style.backgroundImage = `url(${cachedAvatarDataUrl})`;
    avatarPreviewEl.textContent = "";
  } else {
    avatarPreviewEl.style.backgroundImage = "";
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
    avatarPreviewEl.textContent = initials || "Inisial";
  }
}

function setFeedbackMessage(element, message, isSuccess) {
  if (!element) {
    return;
  }
  element.textContent = message;
  element.classList.toggle("success", Boolean(message) && isSuccess);
  element.classList.toggle("error", Boolean(message) && !isSuccess);
  if (!message) {
    element.classList.remove("success", "error");
  }
}

function initializeProfileForms() {
  if (avatarInputEl) {
    avatarInputEl.addEventListener("change", handleAvatarFileChange);
  }

  avatarForm?.addEventListener("submit", handleAvatarSubmit);
  passwordForm?.addEventListener("submit", handlePasswordSubmit);
  profileInfoForm?.addEventListener("submit", handleProfileInfoSubmit);
}

function handleAvatarFileChange(event) {
  const file = event.target?.files?.[0];
  if (!file) {
    selectedAvatarDataUrl = null;
    updateAvatarPreviewWithSelection();
    return;
  }

  if (!file.type.startsWith("image/")) {
    setFeedbackMessage(
      avatarFeedbackEl,
      "Format file tidak didukung. Gunakan PNG atau JPG.",
      false
    );
    selectedAvatarDataUrl = null;
    updateAvatarPreviewWithSelection();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedAvatarDataUrl = reader.result;
    updateAvatarPreviewWithSelection();
    setFeedbackMessage(avatarFeedbackEl, "Gambar siap disimpan.", true);
  };
  reader.onerror = () => {
    selectedAvatarDataUrl = null;
    updateAvatarPreviewWithSelection();
    setFeedbackMessage(avatarFeedbackEl, "Gagal membaca file gambar.", false);
  };
  reader.readAsDataURL(file);
}

function updateAvatarPreviewWithSelection() {
  if (!avatarPreviewEl) {
    return;
  }

  if (selectedAvatarDataUrl) {
    avatarPreviewEl.style.backgroundImage = `url(${selectedAvatarDataUrl})`;
    avatarPreviewEl.textContent = "";
  } else {
    updateAvatarPreview();
  }
}

async function handleAvatarSubmit(event) {
  event.preventDefault();
  if (!cachedSession) {
    setFeedbackMessage(
      avatarFeedbackEl,
      "Masuk terlebih dahulu untuk mengganti foto profil.",
      false
    );
    return;
  }

  if (!selectedAvatarDataUrl) {
    setFeedbackMessage(avatarFeedbackEl, "Pilih gambar terlebih dahulu.", false);
    return;
  }

  saveStoredAvatar(selectedAvatarDataUrl);
  selectedAvatarDataUrl = null;
  setFeedbackMessage(avatarFeedbackEl, "Foto profil berhasil disimpan.", true);
  updateAvatarPreview();
}

async function handlePasswordSubmit(event) {
  event.preventDefault();
  if (!cachedSession) {
    setFeedbackMessage(
      passwordFeedbackEl,
      "Masuk terlebih dahulu untuk mengganti kata sandi.",
      false
    );
    return;
  }

  if (!supabaseClient) {
    setFeedbackMessage(
      passwordFeedbackEl,
      "Layanan autentikasi tidak tersedia saat ini.",
      false
    );
    return;
  }

  const newPassword = passwordForm?.querySelector("#new-password")?.value ?? "";
  const confirmPassword =
    passwordForm?.querySelector("#confirm-password")?.value ?? "";

  if (newPassword.length < 8) {
    setFeedbackMessage(
      passwordFeedbackEl,
      "Kata sandi harus memiliki minimal 8 karakter.",
      false
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setFeedbackMessage(
      passwordFeedbackEl,
      "Konfirmasi kata sandi tidak cocok.",
      false
    );
    return;
  }

  setFeedbackMessage(passwordFeedbackEl, "Memproses...", true);

  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
    passwordForm?.reset();
    setFeedbackMessage(
      passwordFeedbackEl,
      "Kata sandi berhasil diperbarui.",
      true
    );
  } catch (error) {
    console.error(error);
    setFeedbackMessage(
      passwordFeedbackEl,
      "Gagal memperbarui kata sandi. Coba lagi nanti.",
      false
    );
  }
}

function handleProfileInfoSubmit(event) {
  event.preventDefault();
  if (!cachedSession) {
    setFeedbackMessage(
      profileInfoFeedbackEl,
      "Masuk terlebih dahulu untuk menyimpan profil.",
      false
    );
    return;
  }

  const formData = new FormData(profileInfoForm);
  const payload = {
    fullName: formData.get("full-name")?.toString().trim() ?? "",
    birthdate: formData.get("birthdate")?.toString() ?? "",
    gender: formData.get("gender")?.toString() ?? "",
    track: formData.get("track")?.toString() ?? "",
    major: formData.get("major")?.toString().trim() ?? "",
    occupation: formData.get("occupation")?.toString().trim() ?? "",
    company: formData.get("company")?.toString().trim() ?? "",
    location: formData.get("location")?.toString().trim() ?? "",
    bio: formData.get("bio")?.toString().trim() ?? "",
  };

  saveStoredProfileDetails(payload);
  populateProfileFormFields();
  renderNavbar();
  updateAvatarPreview();
  setFeedbackMessage(profileInfoFeedbackEl, "Profil berhasil disimpan.", true);
}

function renderCertificates() {
  if (!certificatesContainer) {
    return;
  }

  certificatesContainer.innerHTML = "";

  if (!cachedSession) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "Masuk untuk melihat sertifikat belajarmu.";
    certificatesContainer.appendChild(message);
    return;
  }

  const completedEnrollments = cachedEnrollments.filter(
    (item) => item.status === "completed" || item.status === "paid"
  );

  if (!completedEnrollments.length) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent =
      "Belum ada sertifikat. Selesaikan kursus untuk mendapatkan sertifikat digital.";
    certificatesContainer.appendChild(message);
    return;
  }

  completedEnrollments.forEach((item) => {
    const courseTitle = item.course?.title ?? "Kursus";
    const completedAt = item.completed_at ?? item.updated_at ?? item.created_at;
    const issueDate = completedAt ? new Date(completedAt) : new Date();
    const certificateUrl =
      item.certificate_url ||
      item.certificateUrl ||
      (typeof window !== "undefined" ? window.location.href : "#");
    const score = deriveEnrollmentScore(item);
    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.set("name", courseTitle);
    linkedInUrl.searchParams.set("organizationName", "Edlevator");
    linkedInUrl.searchParams.set("certUrl", certificateUrl);
    linkedInUrl.searchParams.set("certId", String(item.id));
    if (issueDate instanceof Date && !Number.isNaN(issueDate.valueOf())) {
      linkedInUrl.searchParams.set(
        "issueYear",
        issueDate.getFullYear().toString()
      );
      linkedInUrl.searchParams.set(
        "issueMonth",
        (issueDate.getMonth() + 1).toString()
      );
    }

    const card = document.createElement("article");
    card.className = "certificate-card";
    card.innerHTML = `
      <div class="certificate-header">
        <h3>${courseTitle}</h3>
        <span class="badge">${score ? `Nilai ${score.toFixed(0)}` : "Selesai"}</span>
      </div>
      <p class="certificate-meta">Tanggal terbit: ${formatDate(
        completedAt ?? item.created_at
      )}</p>
      <div class="certificate-actions">
        <a class="btn secondary" href="${certificateUrl}" target="_blank" rel="noopener">Lihat Sertifikat</a>
        <a class="btn small" href="${linkedInUrl.toString()}" target="_blank" rel="noopener">Tambahkan ke LinkedIn</a>
      </div>
    `;

    certificatesContainer.appendChild(card);
  });
}

async function initializeAdminPanel() {
  if (!adminPanelEl) {
    return;
  }

  if (!cachedSession) {
    adminPanelEl.hidden = true;
    if (adminMessageEl) {
      adminMessageEl.innerHTML =
        '<p class="empty-state">Silakan masuk sebagai admin untuk mengakses panel ini.</p>';
    }
    return;
  }

  if (!cachedProfile || cachedProfile.role !== "admin") {
    adminPanelEl.hidden = true;
    if (adminMessageEl) {
      adminMessageEl.innerHTML =
        '<p class="empty-state">Akses ditolak. Halaman ini khusus admin.</p>';
    }
    return;
  }

  adminPanelEl.hidden = false;
  if (adminMessageEl) {
    adminMessageEl.innerHTML = "";
  }

  try {
    const [profilesRes, enrollmentsRes, coursesRes] = await Promise.all([
      supabaseClient
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false }),
      supabaseClient
        .from("enrollments")
        .select("id, user_id, course_id, status, created_at")
        .order("created_at", { ascending: false }),
      supabaseClient
        .from("courses")
        .select("id, title")
        .order("title", { ascending: true }),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (enrollmentsRes.error) throw enrollmentsRes.error;
    if (coursesRes.error) throw coursesRes.error;

    adminProfilesCache = profilesRes.data ?? [];
    adminEnrollmentsCache = enrollmentsRes.data ?? [];
    adminCoursesCache = coursesRes.data ?? [];

    renderAdminUsers(adminProfilesCache);
    populateAdminCourseFilter();
    renderAdminEnrollments();
  } catch (error) {
    console.error(error);
    if (adminMessageEl) {
      adminMessageEl.innerHTML =
        '<p class="empty-state">Gagal memuat data admin.</p>';
    }
  }
}

function populateAdminCourseFilter() {
  if (!adminCourseFilter) {
    return;
  }

  adminCourseFilter.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Semua Kursus";
  adminCourseFilter.appendChild(defaultOption);

  adminCoursesCache.forEach((course) => {
    const option = document.createElement("option");
    option.value = String(course.id);
    option.textContent = course.title;
    adminCourseFilter.appendChild(option);
  });
}

function renderAdminUsers(profiles = adminProfilesCache) {
  if (!adminUsersBody) {
    return;
  }

  adminUsersBody.innerHTML = "";

  if (!profiles.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = "Belum ada pengguna.";
    row.appendChild(cell);
    adminUsersBody.appendChild(row);
    return;
  }

  profiles.forEach((profile) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${profile.full_name ?? "-"}</td>
      <td>${profile.id}</td>
      <td>${profile.role ?? "user"}</td>
      <td>${formatDate(profile.created_at)}</td>
    `;
    adminUsersBody.appendChild(row);
  });
}

function renderAdminEnrollments() {
  if (!adminEnrollmentsBody) {
    return;
  }

  const courseFilterValue = adminCourseFilter?.value ?? "";
  const statusFilterValue = adminStatusFilter?.value ?? "";

  const profilesMap = new Map(
    adminProfilesCache.map((profile) => [profile.id, profile.full_name ?? profile.id])
  );

  const courseMap = new Map(adminCoursesCache.map((course) => [String(course.id), course.title]));

  const filtered = adminEnrollmentsCache.filter((enrollment) => {
    const matchesCourse =
      courseFilterValue === "" || String(enrollment.course_id) === courseFilterValue;
    const matchesStatus =
      statusFilterValue === "" || enrollment.status === statusFilterValue;
    return matchesCourse && matchesStatus;
  });

  adminEnrollmentsBody.innerHTML = "";

  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "empty-state";
    cell.textContent = "Tidak ada pendaftaran yang sesuai.";
    row.appendChild(cell);
    adminEnrollmentsBody.appendChild(row);
    if (adminEmptyState) {
      adminEmptyState.hidden = false;
    }
    return;
  }

  if (adminEmptyState) {
    adminEmptyState.hidden = true;
  }

  filtered.forEach((enrollment) => {
    const row = document.createElement("tr");
    const userName = profilesMap.get(enrollment.user_id) ?? enrollment.user_id;
    const courseTitle = courseMap.get(String(enrollment.course_id)) ?? enrollment.course_id;

    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "btn secondary small";
    actionButton.textContent = enrollment.status === "paid" ? "Sudah Lunas" : "Tandai Lunas";
    actionButton.disabled = enrollment.status === "paid";
    actionButton.addEventListener("click", () => updateEnrollmentStatus(enrollment.id));

    row.innerHTML = `
      <td>${userName}</td>
      <td>${courseTitle}</td>
      <td>${enrollment.status}</td>
      <td>${formatDate(enrollment.created_at)}</td>
    `;

    const actionCell = document.createElement("td");
    actionCell.appendChild(actionButton);
    row.appendChild(actionCell);
    adminEnrollmentsBody.appendChild(row);
  });
}

async function updateEnrollmentStatus(enrollmentId) {
  try {
    const { data, error } = await supabaseClient
      .from("enrollments")
      .update({ status: "paid" })
      .eq("id", enrollmentId)
      .select("id, status")
      .maybeSingle();

    if (error) {
      throw error;
    }

    adminEnrollmentsCache = adminEnrollmentsCache.map((item) =>
      item.id === data.id ? { ...item, status: data.status } : item
    );

    renderAdminEnrollments();
  } catch (error) {
    console.error(error);
    alert("Gagal memperbarui status pendaftaran.");
  }
}

function updateAdminPanel() {
  if (!adminPanelEl) {
    return;
  }
  initializeAdminPanel();
}

document.addEventListener("DOMContentLoaded", async () => {
  navAuthEl = document.getElementById("nav-auth");
  enrollmentsContainer = document.getElementById("my-enrollments");
  dashboardMessage = document.getElementById("dashboard-message");
  dashboardCoursesList = document.getElementById("course-list");
  searchInputEl = document.getElementById("search-input");
  categoryFilterEl = document.getElementById("category-filter");
  levelFilterEl = document.getElementById("level-filter");
  statTotalCourseEl = document.getElementById("stat-total-course");
  statTotalHoursEl = document.getElementById("stat-total-hours");
  statAverageScoreEl = document.getElementById("stat-average-score");
  avatarForm = document.getElementById("avatar-form");
  avatarInputEl = document.getElementById("avatar-input");
  avatarPreviewEl = document.getElementById("avatar-preview");
  avatarFeedbackEl = document.getElementById("avatar-feedback");
  passwordForm = document.getElementById("password-form");
  passwordFeedbackEl = document.getElementById("password-feedback");
  profileInfoForm = document.getElementById("profile-info-form");
  profileInfoFeedbackEl = document.getElementById("profile-info-feedback");
  certificatesContainer = document.getElementById("certificate-list");
  profileEmailInput = document.getElementById("profile-email");
  adminPanelEl = document.getElementById("admin-panel");
  adminMessageEl = document.getElementById("admin-message");
  adminUsersBody = document.querySelector("#admin-users tbody");
  adminEnrollmentsBody = document.querySelector("#admin-enrollments tbody");
  adminCourseFilter = document.getElementById("admin-filter-course");
  adminStatusFilter = document.getElementById("admin-filter-status");
  adminEmptyState = document.getElementById("admin-empty-state");

  initializeEventListeners();
  initializeProfileForms();
  await initializeCourseFilters();
  await updateSession();

  if (adminCourseFilter) {
    adminCourseFilter.addEventListener("change", renderAdminEnrollments);
  }
  if (adminStatusFilter) {
    adminStatusFilter.addEventListener("change", renderAdminEnrollments);
  }

  onAuthStateChange(() => {
    updateSession();
  });
});

window.addEventListener("focus", () => {
  updateSession();
});
