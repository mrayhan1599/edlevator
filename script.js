import {
  supabaseClient,
  signOut,
  getSession,
  getUserProfile,
  onAuthStateChange,
} from "./auth.js";

const SAMPLE_COURSES = [
  {
    id: "sample-ipa-tech",
    title: "Pengantar Teknik & Teknologi",
    category: "IPA - Teknik",
    level: "Pemula",
    hours: 12,
    rating: 4.8,
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
let courseCache = [];
let enrollmentsContainer = null;
let dashboardMessage = null;
let dashboardCoursesList = null;
let searchInputEl = null;
let categoryFilterEl = null;
let levelFilterEl = null;
let statTotalCourseEl = null;
let statTotalHoursEl = null;
let statAverageRatingEl = null;
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

  const name = cachedProfile?.full_name || cachedSession.user?.email || "Pengguna";

  navAuthEl.innerHTML = `
    <span class="nav-greeting">Halo, ${name}</span>
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
        <span>Rating ${(course.rating ?? 0).toFixed(1)}</span>
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

function updateCourseStats(list) {
  if (!statTotalCourseEl || !statTotalHoursEl || !statAverageRatingEl) {
    return;
  }

  const totalCourse = list.length;
  const totalHours = list.reduce((sum, item) => sum + (item.hours ?? 0), 0);
  const totalRating = list.reduce((sum, item) => sum + (Number(item.rating) || 0), 0);
  const averageRating = totalCourse > 0 ? totalRating / totalCourse : 0;

  statTotalCourseEl.textContent = totalCourse.toString();
  statTotalHoursEl.textContent = `${totalHours} jam`;
  statAverageRatingEl.textContent = averageRating.toFixed(1);
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
    updateCourseStats([]);
    return;
  }

  filtered.forEach((course) => {
    dashboardCoursesList.appendChild(renderCourseCard(course));
  });

  updateCourseStats(filtered);
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
    updateCourseStats([]);
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
    return;
  }

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
  } catch (error) {
    console.error(error);
    cachedSession = null;
    cachedProfile = null;
  }

  renderNavbar();
  updateDashboardAccess();
  refreshMyEnrollmentsUI();
  updateAdminPanel();
}

function initializeEventListeners() {
  searchInputEl?.addEventListener("input", applyCourseFilters);
  categoryFilterEl?.addEventListener("change", applyCourseFilters);
  levelFilterEl?.addEventListener("change", applyCourseFilters);
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
  statAverageRatingEl = document.getElementById("stat-average-rating");
  adminPanelEl = document.getElementById("admin-panel");
  adminMessageEl = document.getElementById("admin-message");
  adminUsersBody = document.querySelector("#admin-users tbody");
  adminEnrollmentsBody = document.querySelector("#admin-enrollments tbody");
  adminCourseFilter = document.getElementById("admin-filter-course");
  adminStatusFilter = document.getElementById("admin-filter-status");
  adminEmptyState = document.getElementById("admin-empty-state");

  initializeEventListeners();
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
