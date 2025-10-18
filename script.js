import {
  supabaseClient,
  signOut,
  getSession,
  getUserProfile,
  onAuthStateChange,
} from "./auth.js";

let navProfileCleanup = null;
let navMainDropdownCleanup = null;
let navMobileCleanup = null;
let navToggleButton = null;
let navLinksList = null;
let navContainerEl = null;
let closeMobileNavMenu = () => {};

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

const AUTH_SESSION_MISSING = "AUTH_SESSION_MISSING";

const TEKNIK_PERTAMBANGAN_SLUG = "teknik-pertambangan";
const TEKNIK_PERTAMBANGAN_TITLE = "Teknik Pertambangan";
const TEKNIK_PERTAMBANGAN_REDIRECT = "courses.html#kursus-saya";

let teknikPertambanganCourseId = null;
let teknikPertambanganCourseLoaded = false;
let teknikEnrollButton = null;
let teknikEnrollLoading = false;

function isAuthSessionMissingError(error) {
  if (!error) {
    return false;
  }

  const message = (error.message ?? "").toString().toLowerCase();
  return (
    message.includes("session not found") ||
    message.includes("session missing") ||
    message.includes("session expired") ||
    message.includes("auth session")
  );
}

function toAuthSessionMissingError(error) {
  if (!isAuthSessionMissingError(error)) {
    return null;
  }

  const sessionError = new Error("AUTH_SESSION_MISSING");
  sessionError.code = AUTH_SESSION_MISSING;
  sessionError.cause = error;
  return sessionError;
}

function isColumnMissingError(error, columnName) {
  if (!error || !columnName) {
    return false;
  }

  const message = (error.message ?? "").toLowerCase();
  const details = (error.details ?? "").toLowerCase();
  const hint = (error.hint ?? "").toLowerCase();
  const code = (error.code ?? "").toString();
  const column = columnName.toLowerCase();

  if (code === "42703") {
    return true;
  }

  const combined = `${message} ${details} ${hint}`;
  return (
    combined.includes("column") &&
    combined.includes(column) &&
    (combined.includes("does not exist") || combined.includes("unknown"))
  );
}

export async function loadCourses() {
  const baseColumns = "id, title, category, level, hours, rating, instructor";
  const columnsWithActive = `${baseColumns}, is_active`;

  const { data, error } = await supabaseClient
    .from("courses")
    .select(columnsWithActive)
    .order("id", { ascending: true });

  let courses = data ?? [];

  if (error) {
    if (isColumnMissingError(error, "is_active")) {
      const fallback = await supabaseClient
        .from("courses")
        .select(baseColumns)
        .order("id", { ascending: true });

      if (fallback.error) {
        throw fallback.error;
      }

      courses = fallback.data ?? [];
    } else {
      throw error;
    }
  }

  const activeCourses = courses.filter((course) => course.is_active !== false);

  if (activeCourses.length > 0) {
    return activeCourses;
  }

  return SAMPLE_COURSES;
}

export async function enroll(courseId, options = {}) {
  const {
    status = "active",
    enrolledAt,
    onAlreadyEnrolled,
    onSuccess,
    showSuccessAlert = true,
    successMessage = "Pendaftaran kursus berhasil!",
  } = options ?? {};

  const session = await getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  const userId = session.user.id;

  const { data: existing, error: existingError } = await supabaseClient
    .from("enrollments")
    .select("id, status, course_id, enrolled_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    console.error(existingError);
    alert("Terjadi kesalahan saat mengecek pendaftaran.");
    return null;
  }

  if (existing) {
    if (typeof onAlreadyEnrolled === "function") {
      onAlreadyEnrolled(existing);
    } else {
      alert("Kamu sudah terdaftar di kursus ini.");
    }
    return existing;
  }

  const payload = {
    user_id: userId,
    course_id: courseId,
    status,
    enrolled_at: enrolledAt ?? new Date().toISOString(),
  };

  const selectColumns =
    "id, status, course_id, enrolled_at, created_at, courses(id, title)";

  let insertResult = await supabaseClient
    .from("enrollments")
    .insert(payload)
    .select(selectColumns)
    .maybeSingle();

  if (insertResult.error && isColumnMissingError(insertResult.error, "enrolled_at")) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.enrolled_at;

    insertResult = await supabaseClient
      .from("enrollments")
      .insert(fallbackPayload)
      .select("id, status, course_id, created_at, courses(id, title)")
      .maybeSingle();

    if (!insertResult.error) {
      insertResult.data = {
        ...insertResult.data,
        enrolled_at: insertResult.data?.created_at ?? null,
      };
    }
  }

  if (insertResult.error) {
    console.error(insertResult.error);
    alert("Tidak dapat mendaftar kursus. Coba lagi nanti.");
    return null;
  }

  if (showSuccessAlert) {
    alert(successMessage);
  }

  if (typeof refreshMyEnrollmentsUI === "function") {
    refreshMyEnrollmentsUI();
  }

  if (typeof onSuccess === "function") {
    onSuccess(insertResult.data);
  }

  return insertResult.data;
}

export async function myEnrollments() {
  const session = await getSession();

  if (!session) {
    return [];
  }

  const courseFields = "id, title, category, level, hours, rating, instructor";
  const fullCourseFields = `${courseFields}, is_active`;

  const query = supabaseClient
    .from("enrollments")
    .select(
      `id, status, enrolled_at, created_at, course_id, courses!inner(${fullCourseFields})`
    )
    .eq("user_id", session.user.id)
    .eq("courses.is_active", true)
    .order("enrolled_at", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  let enrollmentsData = data ?? [];

  if (error) {
    if (
      isColumnMissingError(error, "is_active") ||
      isColumnMissingError(error, "enrolled_at")
    ) {
      const fallbackQuery = supabaseClient
        .from("enrollments")
        .select(
          `id, status, created_at, course_id, courses!inner(${courseFields})`
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        throw fallbackError;
      }

      enrollmentsData = fallbackData ?? [];
    } else {
      throw error;
    }
  }

  return enrollmentsData
    .map((item) => ({
      ...item,
      enrolled_at: item.enrolled_at ?? item.created_at ?? null,
      course: item.courses,
    }))
    .filter((item) => item.course && item.course.is_active !== false);
}

let cachedSession = null;
let cachedProfile = null;
let cachedProfileDetails = null;
let cachedAvatarDataUrl = null;
let profileDetailsSupported = true;
let profilesTableSupported = true;
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
let selectedAvatarFile = null;
let cachedAvatarStoragePath = null;
let authLoading = false;

async function fetchCourseByColumn(columnName, value) {
  if (!supabaseClient) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from("courses")
      .select("id, title, is_active")
      .eq(columnName, value)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ?? null;
  } catch (error) {
    if (isColumnMissingError(error, columnName)) {
      console.warn(
        `Kolom ${columnName} tidak tersedia di tabel courses. Menggunakan metode cadangan.`
      );
      return null;
    }

    if (isColumnMissingError(error, "is_active")) {
      console.warn(
        "Kolom is_active tidak tersedia di tabel courses. Mengambil data tanpa status aktif."
      );

      const { data: fallbackData, error: fallbackError } = await supabaseClient
        .from("courses")
        .select("id, title")
        .eq(columnName, value)
        .maybeSingle();

      if (fallbackError) {
        throw fallbackError;
      }

      return fallbackData ?? null;
    }

    throw error;
  }
}

async function ensureTeknikPertambanganCourse() {
  if (teknikPertambanganCourseLoaded) {
    return teknikPertambanganCourseId;
  }

  teknikPertambanganCourseLoaded = true;

  try {
    let course = await fetchCourseByColumn("slug", TEKNIK_PERTAMBANGAN_SLUG);

    if (!course) {
      course = await fetchCourseByColumn("title", TEKNIK_PERTAMBANGAN_TITLE);
    }

    if (!course || course.is_active === false) {
      teknikPertambanganCourseId = null;
    } else {
      teknikPertambanganCourseId = course.id;
    }

    return teknikPertambanganCourseId;
  } catch (error) {
    teknikPertambanganCourseLoaded = false;
    throw error;
  }
}

function isUserEnrolledInTeknik() {
  if (!cachedSession || !teknikPertambanganCourseId) {
    return false;
  }

  return cachedEnrollments.some(
    (item) => String(item.course_id) === String(teknikPertambanganCourseId)
  );
}

function syncTeknikEnrollButtonState() {
  if (!teknikEnrollButton) {
    return;
  }

  if (teknikEnrollLoading) {
    teknikEnrollButton.textContent = "Memproses...";
    teknikEnrollButton.disabled = true;
    return;
  }

  if (!teknikPertambanganCourseLoaded) {
    teknikEnrollButton.textContent = "Memuat...";
    teknikEnrollButton.disabled = true;
    return;
  }

  if (!teknikPertambanganCourseId) {
    teknikEnrollButton.textContent = "Kursus Tidak Tersedia";
    teknikEnrollButton.disabled = true;
    return;
  }

  if (!cachedSession) {
    teknikEnrollButton.textContent = "Daftar Sekarang";
    teknikEnrollButton.disabled = false;
    return;
  }

  if (isUserEnrolledInTeknik()) {
    teknikEnrollButton.textContent = "Lanjutkan Belajar";
    teknikEnrollButton.disabled = false;
    return;
  }

  teknikEnrollButton.textContent = "Daftar Sekarang";
  teknikEnrollButton.disabled = false;
}

async function handleTeknikEnrollButtonClick() {
  if (!teknikPertambanganCourseLoaded) {
    try {
      await ensureTeknikPertambanganCourse();
    } catch (error) {
      console.error(error);
      alert(
        "Kursus Teknik Pertambangan belum tersedia. Coba lagi beberapa saat lagi."
      );
      syncTeknikEnrollButtonState();
      return;
    }
  }

  if (!teknikPertambanganCourseId) {
    syncTeknikEnrollButtonState();
    return;
  }

  if (!cachedSession) {
    window.location.href = "login.html";
    return;
  }

  if (isUserEnrolledInTeknik()) {
    window.location.href = TEKNIK_PERTAMBANGAN_REDIRECT;
    return;
  }

  teknikEnrollLoading = true;
  syncTeknikEnrollButtonState();

  try {
    const result = await enroll(teknikPertambanganCourseId, {
      showSuccessAlert: false,
      successMessage: "",
    });

    if (result) {
      alert("Kamu berhasil mendaftar Teknik Pertambangan!");
      window.location.href = TEKNIK_PERTAMBANGAN_REDIRECT;
    }
  } catch (error) {
    console.error(error);
    alert(
      "Tidak dapat mendaftarkanmu ke Teknik Pertambangan saat ini. Coba lagi nanti."
    );
  } finally {
    teknikEnrollLoading = false;
    syncTeknikEnrollButtonState();
  }
}

async function initializeTeknikPertambanganCTA() {
  if (!teknikEnrollButton) {
    return;
  }

  teknikEnrollButton.addEventListener("click", handleTeknikEnrollButtonClick);

  try {
    await ensureTeknikPertambanganCourse();
  } catch (error) {
    console.error(error);
  }

  syncTeknikEnrollButtonState();
}

const AVATAR_CACHE_KEY = "edlevator:avatar-cache";

const AVATAR_BUCKET = "avatars";
const AVATAR_SIGNED_URL_DURATION = 60 * 60 * 24 * 7; // 7 hari
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

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

function getUserDisplayName() {
  return (
    cachedProfileDetails?.fullName?.trim() ||
    cachedProfile?.full_name ||
    cachedSession?.user?.user_metadata?.full_name ||
    cachedSession?.user?.email ||
    "Pengguna"
  );
}

function getUserInitials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "E"
  );
}

function normalizeProfileValue(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value ?? null;
}

function metadataValue(metadata, key) {
  if (!metadata) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(metadata, key)) {
    return metadata[key];
  }

  const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  if (Object.prototype.hasOwnProperty.call(metadata, camelKey)) {
    return metadata[camelKey];
  }

  return null;
}

function buildProfileDetails({ detailsData = {}, metadata = {} } = {}) {
  const pickString = (value) => {
    if (typeof value === "string") {
      return value;
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  const resolveField = (key) => {
    if (
      detailsData &&
      Object.prototype.hasOwnProperty.call(detailsData, key) &&
      detailsData[key] !== null &&
      detailsData[key] !== undefined
    ) {
      return pickString(detailsData[key]);
    }
    return pickString(metadataValue(metadata, key));
  };

  const resolvedName = pickString(
    detailsData?.full_name ??
      metadataValue(metadata, "full_name") ??
      cachedProfile?.full_name ??
      metadata?.full_name ??
      metadata?.fullName ??
      cachedSession?.user?.user_metadata?.full_name ??
      cachedSession?.user?.email ??
      ""
  ).trim();

  const avatarCandidates = [
    detailsData?.avatar_data_url,
    metadataValue(metadata, "avatar_data_url"),
    cachedProfile?.avatar_url,
    cachedSession?.user?.avatar_url,
    cachedSession?.user?.photoURL,
    metadataValue(metadata, "avatar_url"),
    metadataValue(metadata, "avatarUrl"),
    metadataValue(metadata, "picture"),
    metadataValue(metadata, "image_url"),
  ];

  const avatarSource = avatarCandidates.find(
    (value) => typeof value === "string" && value.trim() !== ""
  );
  const avatarStoragePathSource =
    detailsData?.avatar_storage_path ??
    metadataValue(metadata, "avatar_storage_path") ??
    null;

  return {
    fullName: resolvedName,
    birthdate: resolveField("birthdate"),
    gender: resolveField("gender"),
    track: resolveField("track"),
    major: resolveField("major"),
    occupation: resolveField("occupation"),
    company: resolveField("company"),
    location: resolveField("location"),
    bio: resolveField("bio"),
    avatarDataUrl:
      typeof avatarSource === "string" && avatarSource.trim() !== ""
        ? avatarSource.trim()
        : null,
    avatarStoragePath:
      typeof avatarStoragePathSource === "string" &&
      avatarStoragePathSource.trim() !== ""
        ? avatarStoragePathSource
      : null,
  };
}

function readAvatarCache() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AVATAR_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Gagal membaca cache avatar", error);
    return null;
  }
}

function writeAvatarCache(entry) {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    return;
  }

  try {
    if (!entry) {
      window.localStorage.removeItem(AVATAR_CACHE_KEY);
      return;
    }

    window.localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn("Gagal menyimpan cache avatar", error);
  }
}

function clearAvatarCache() {
  writeAvatarCache(null);
}

function applyAvatarCacheFromStorage(userId) {
  if (!userId) {
    cachedAvatarDataUrl = null;
    cachedAvatarStoragePath = null;
    return;
  }

  const cache = readAvatarCache();

  if (cache && cache.userId === userId) {
    cachedAvatarDataUrl =
      cache.dataUrl ?? cachedProfileDetails?.avatarDataUrl ?? null;
    cachedAvatarStoragePath =
      cache.storagePath ?? cachedProfileDetails?.avatarStoragePath ?? null;

    if (cache.displayName) {
      const currentName = cachedProfileDetails?.fullName ?? "";
      if (!currentName || currentName.trim() === "") {
        cachedProfileDetails = {
          ...(cachedProfileDetails ?? {}),
          fullName: cache.displayName,
        };
      }
    }

    return;
  }

  cachedAvatarDataUrl = cachedProfileDetails?.avatarDataUrl ?? null;
  cachedAvatarStoragePath = cachedProfileDetails?.avatarStoragePath ?? null;
}

function syncAvatarCacheFromState() {
  const userId = cachedSession?.user?.id;

  if (!userId) {
    clearAvatarCache();
    return;
  }

  const payload = {
    userId,
    dataUrl: cachedAvatarDataUrl ?? null,
    storagePath:
      cachedAvatarStoragePath ?? cachedProfileDetails?.avatarStoragePath ?? null,
    displayName: cachedProfileDetails?.fullName ?? null,
    updatedAt: Date.now(),
  };

  writeAvatarCache(payload);
}

function hydrateSessionFromStorage() {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined" ||
    cachedSession
  ) {
    return false;
  }

  try {
    const storage = window.localStorage;
    const keys = Object.keys(storage);

    for (const key of keys) {
      if (!key.startsWith("sb-") || !key.endsWith("-auth-token")) {
        continue;
      }

      const rawValue = storage.getItem(key);
      if (!rawValue) {
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(rawValue);
      } catch (error) {
        console.warn("Gagal mengurai data sesi lokal", error);
        continue;
      }

      const session = parsed?.currentSession ?? parsed?.session ?? null;
      if (!session?.user) {
        continue;
      }

      cachedSession = session;

      const metadata = session.user.user_metadata ?? {};
      cachedProfile = {
        id: session.user.id,
        full_name:
          metadataValue(metadata, "full_name") ?? session.user.email ?? null,
        role: metadataValue(metadata, "role") ?? null,
        avatar_url: metadataValue(metadata, "avatar_url") ?? null,
      };

      if (!cachedProfileDetails) {
        cachedProfileDetails = buildProfileDetails({ metadata });
      }

      applyAvatarCacheFromStorage(session.user.id);

      return true;
    }
  } catch (error) {
    console.warn("Gagal membaca sesi dari penyimpanan lokal", error);
  }

  return false;
}

function isDataUrl(value) {
  return typeof value === "string" && value.trim().startsWith("data:");
}

async function getAvatarUrlFromStorage(path) {
  if (!path || !supabaseClient?.storage) {
    return null;
  }

  try {
    const bucket = supabaseClient.storage.from(AVATAR_BUCKET);

    const { data: signedData } = await bucket.createSignedUrl(
      path,
      AVATAR_SIGNED_URL_DURATION
    );

    if (signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    const { data: publicData } = bucket.getPublicUrl(path);

    if (publicData?.publicUrl) {
      return publicData.publicUrl;
    }

    return null;
  } catch (error) {
    console.warn("Gagal membuat URL avatar dari storage", error);
    return null;
  }
}

async function resolveAvatarUrl({
  avatarDataUrl,
  avatarStoragePath,
} = {}) {
  if (isDataUrl(avatarDataUrl)) {
    return avatarDataUrl;
  }

  if (avatarStoragePath) {
    const storageUrl = await getAvatarUrlFromStorage(avatarStoragePath);
    if (storageUrl) {
      return storageUrl;
    }
  }

  if (typeof avatarDataUrl === "string" && avatarDataUrl.trim() !== "") {
    return avatarDataUrl.trim();
  }

  return null;
}

function deriveAvatarCacheToken() {
  const sources = [
    cachedAvatarStoragePath,
    cachedProfileDetails?.avatarStoragePath,
    cachedProfile?.updated_at,
    cachedSession?.user?.updated_at,
    cachedSession?.user?.last_sign_in_at,
  ];

  for (const source of sources) {
    if (typeof source !== "string") {
      continue;
    }

    const trimmed = source.trim();
    if (!trimmed) {
      continue;
    }

    const digits = trimmed.match(/\d{6,}/g);
    if (digits && digits.length) {
      return digits[digits.length - 1];
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return String(parsed);
    }

    const normalized = trimmed.replace(/[^0-9a-z]/gi, "");
    if (normalized) {
      return normalized.slice(-12);
    }
  }

  return null;
}

function withAvatarCacheBusting(url) {
  if (!url || typeof url !== "string" || isDataUrl(url)) {
    return url;
  }

  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed, window.location.origin);

    // Signed URLs (e.g., from Supabase Storage) already contain security
    // parameters such as `token`. Menambahkan parameter tambahan akan
    // mengubah signature dan menyebabkan respons 401. Abaikan cache busting
    // untuk URL bertoken tersebut.
    if (parsed.searchParams.has("token")) {
      return parsed.toString();
    }

    const token = deriveAvatarCacheToken();

    if (token && !parsed.searchParams.has("v")) {
      parsed.searchParams.set("v", token);
    }

    return parsed.toString();
  } catch (error) {
    return url;
  }
}

function renderAvatarElement(
  element,
  { initials = "", avatarUrl = null, altText = "" } = {}
) {
  if (!element) {
    return;
  }

  element.innerHTML = "";

  const initialsSpan = document.createElement("span");
  initialsSpan.className = "avatar-initials";
  const initialsText =
    typeof initials === "string" && initials.trim() !== ""
      ? initials.trim()
      : "";
  initialsSpan.textContent = initialsText;

  if (element.getAttribute("aria-hidden") === "true") {
    initialsSpan.setAttribute("aria-hidden", "true");
  }

  element.appendChild(initialsSpan);

  if (typeof avatarUrl === "string" && avatarUrl.trim() !== "") {
    const image = document.createElement("img");
    image.src = avatarUrl.trim();
    image.alt = altText || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.className = "avatar-image";
    image.addEventListener("error", () => {
      image.remove();
      element.classList.remove("has-image");
    });
    element.appendChild(image);
    element.classList.add("has-image");
    return;
  }

  element.classList.remove("has-image");
}

async function seedProfileTablesFromMetadata(data = {}) {
  if (!cachedSession?.user?.id || !supabaseClient) {
    return false;
  }

  const metadata = cachedSession.user?.user_metadata ?? {};
  const userId = cachedSession.user.id;

  if (profilesTableSupported) {
    const fullNameSource =
      data.fullName ??
      metadata.full_name ??
      metadata.fullName ??
      metadataValue(metadata, "full_name");

    const profilePayload = { id: userId };
    if (typeof fullNameSource === "string" && fullNameSource.trim() !== "") {
      profilePayload.full_name = fullNameSource.trim();
    }

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      if (isProfilesWriteUnsupportedError(profileError)) {
        profilesTableSupported = false;
      } else {
        throw profileError;
      }
    }
  }

  if (!profileDetailsSupported) {
    return false;
  }

  const detailsPayload = {
    user_id: userId,
    birthdate: data.birthdate || metadataValue(metadata, "birthdate") || null,
    gender: normalizeProfileValue(
      data.gender ?? metadataValue(metadata, "gender")
    ),
    track: normalizeProfileValue(data.track ?? metadataValue(metadata, "track")),
    major: normalizeProfileValue(data.major ?? metadataValue(metadata, "major")),
    occupation: normalizeProfileValue(
      data.occupation ?? metadataValue(metadata, "occupation")
    ),
    company: normalizeProfileValue(
      data.company ?? metadataValue(metadata, "company")
    ),
    location: normalizeProfileValue(
      data.location ?? metadataValue(metadata, "location")
    ),
    bio: normalizeProfileValue(data.bio ?? metadataValue(metadata, "bio")),
    avatar_data_url: normalizeProfileValue(
      data.avatarDataUrl ?? metadataValue(metadata, "avatar_data_url")
    ),
    avatar_storage_path: normalizeProfileValue(
      data.avatarStoragePath ?? metadataValue(metadata, "avatar_storage_path")
    ),
  };

  const { error: insertError } = await supabaseClient
    .from("profile_details")
    .insert(detailsPayload);

  if (insertError) {
    if (insertError.code === "23505" || insertError.code === "PGRST116") {
      return false;
    }
    if (insertError.code === "23503") {
      return false;
    }
    if (isProfileDetailsUnsupportedError(insertError)) {
      profileDetailsSupported = false;
      return false;
    }
    throw insertError;
  }

  return true;
}

function getCurrentProfileData() {
  const metadata = cachedSession?.user?.user_metadata ?? {};
  const details = cachedProfileDetails ?? {};

  return {
    fullName:
      details.fullName ??
      cachedProfile?.full_name ??
      metadata.full_name ??
      metadata.fullName ??
      cachedSession?.user?.email ??
      "",
    birthdate: details.birthdate ?? metadata.birthdate ?? "",
    gender: details.gender ?? metadata.gender ?? "",
    track: details.track ?? metadata.track ?? "",
    major: details.major ?? metadata.major ?? "",
    occupation: details.occupation ?? metadata.occupation ?? "",
    company: details.company ?? metadata.company ?? "",
    location: details.location ?? metadata.location ?? "",
    bio: details.bio ?? metadata.bio ?? "",
    avatarStoragePath:
      details.avatarStoragePath ?? metadata.avatar_storage_path ?? null,
  };
}

function isProfilesWriteUnsupportedError(error) {
  if (!error) {
    return false;
  }

  const code = error.code;
  if (code === "42P01" || code === "42501") {
    return true;
  }

  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("row level security") ||
    message.includes("permission denied") ||
    message.includes("relation \"profiles\"") ||
    message.includes("table \"profiles\"")
  );
}

function isProfileDetailsUnsupportedError(error) {
  if (!error) {
    return false;
  }

  const code = error.code;
  if (code === "42P01" || code === "42501") {
    return true;
  }

  const message = (error.message ?? "").toString().toLowerCase();
  return message.includes("profile_details");
}

async function persistProfileMetadata(
  data,
  avatarDataUrl = cachedAvatarDataUrl,
  avatarStoragePath = cachedAvatarStoragePath
) {
  if (!cachedSession?.user?.id || !supabaseClient) {
    return;
  }

  const metadataPayload = {
    full_name: normalizeProfileValue(data.fullName),
    birthdate: normalizeProfileValue(data.birthdate),
    gender: normalizeProfileValue(data.gender),
    track: normalizeProfileValue(data.track),
    major: normalizeProfileValue(data.major),
    occupation: normalizeProfileValue(data.occupation),
    company: normalizeProfileValue(data.company),
    location: normalizeProfileValue(data.location),
    bio: normalizeProfileValue(data.bio),
    avatar_data_url: normalizeProfileValue(avatarDataUrl),
    avatar_storage_path: normalizeProfileValue(
      data.avatarStoragePath ?? avatarStoragePath
    ),
  };

  const { data: result, error } = await supabaseClient.auth.updateUser({
    data: metadataPayload,
  });

  if (error) {
    const sessionError = toAuthSessionMissingError(error);
    if (sessionError) {
      throw sessionError;
    }
    throw error;
  }

  if (result?.user) {
    cachedSession = {
      ...cachedSession,
      user: result.user,
    };
  }

  return metadataPayload;
}

function cleanupNavProfileMenu() {
  if (typeof navProfileCleanup === "function") {
    navProfileCleanup();
    navProfileCleanup = null;
  }
}

function cleanupMainNavDropdowns() {
  if (typeof navMainDropdownCleanup === "function") {
    navMainDropdownCleanup();
    navMainDropdownCleanup = null;
  }
}

function setupNavProfileMenu() {
  cleanupNavProfileMenu();

  if (!navAuthEl) {
    return;
  }

  const avatarButton = navAuthEl.querySelector("#nav-avatar-button");
  const menu = navAuthEl.querySelector("#nav-profile-menu");
  const logoutButton = navAuthEl.querySelector("#logout-button");

  if (!avatarButton || !menu) {
    return;
  }

  const closeMenu = () => {
    if (!menu.hasAttribute("hidden")) {
      menu.setAttribute("hidden", "");
      avatarButton.setAttribute("aria-expanded", "false");
    }
  };

  const openMenu = () => {
    if (menu.hasAttribute("hidden")) {
      menu.removeAttribute("hidden");
      avatarButton.setAttribute("aria-expanded", "true");
    }
  };

  const toggleMenu = () => {
    if (menu.hasAttribute("hidden")) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  const handleAvatarClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
  };

  const handleDocumentClick = (event) => {
    if (
      !menu.contains(event.target) &&
      event.target !== avatarButton &&
      !avatarButton.contains(event.target)
    ) {
      closeMenu();
    }
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  const handleMenuItemClick = () => {
    closeMenu();
  };

  avatarButton.addEventListener("click", handleAvatarClick);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);

  Array.from(menu.querySelectorAll("a")).forEach((link) => {
    link.addEventListener("click", handleMenuItemClick);
  });

  let logoutHandler = null;
  if (logoutButton) {
    logoutHandler = async () => {
      try {
        await signOut();
      } catch (error) {
        if (isAuthSessionMissingError(error)) {
          console.warn("Sesi sudah berakhir saat mencoba logout", error);
        } else {
          console.error(error);
          alert("Gagal logout. Coba lagi.");
          return;
        }
      }
      closeMenu();
      await updateSession();
    };
    logoutButton.addEventListener("click", logoutHandler);
  }

  navProfileCleanup = () => {
    avatarButton.removeEventListener("click", handleAvatarClick);
    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleKeydown);
    Array.from(menu.querySelectorAll("a")).forEach((link) => {
      link.removeEventListener("click", handleMenuItemClick);
    });
    if (logoutButton && logoutHandler) {
      logoutButton.removeEventListener("click", logoutHandler);
    }
  };
}

function cleanupMobileNavToggle() {
  if (typeof navMobileCleanup === "function") {
    navMobileCleanup();
    navMobileCleanup = null;
  }
  closeMobileNavMenu = () => {};
}

function setupMobileNavToggle() {
  cleanupMobileNavToggle();

  if (!navToggleButton || !navLinksList || !navContainerEl) {
    return;
  }

  const closeMenu = () => {
    navContainerEl.removeAttribute("data-mobile-open");
    navToggleButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    navContainerEl.setAttribute("data-mobile-open", "true");
    navToggleButton.setAttribute("aria-expanded", "true");
  };

  const toggleMenu = () => {
    const isOpen = navContainerEl.getAttribute("data-mobile-open") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeMenu();
      if (document.activeElement && !navContainerEl.contains(document.activeElement)) {
        navToggleButton.focus();
      }
    }
  };

  const handleResize = () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  const handleOutsideClick = (event) => {
    if (!navContainerEl.contains(event.target)) {
      closeMenu();
    }
  };

  navToggleButton.addEventListener("click", toggleMenu);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleOutsideClick);

  const menuLinks = Array.from(navLinksList.querySelectorAll("a"));
  menuLinks.forEach((item) => {
    item.addEventListener("click", handleLinkClick);
  });

  navMobileCleanup = () => {
    navToggleButton.removeEventListener("click", toggleMenu);
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("click", handleOutsideClick);
    menuLinks.forEach((item) => {
      item.removeEventListener("click", handleLinkClick);
    });
  };

  closeMobileNavMenu = closeMenu;
  closeMenu();
}

function renderNavbar() {
  if (!navAuthEl) {
    return;
  }

  cleanupNavProfileMenu();
  closeMobileNavMenu();

  if (authLoading && !cachedSession) {
    navAuthEl.innerHTML = `
      <div class="nav-auth-loading" aria-hidden="true">
        <span class="avatar-placeholder"></span>
      </div>
    `;
    return;
  }

  if (!cachedSession) {
    navAuthEl.innerHTML = `
      <a class="btn secondary" href="login.html">Login</a>
      <a class="btn" href="daftar.html">Daftar</a>
    `;
    return;
  }

  const displayName = getUserDisplayName();
  const initials =
    getUserInitials(displayName) || displayName?.[0]?.toUpperCase() || "E";

  navAuthEl.innerHTML = `
    <div class="nav-profile">
      <button type="button" class="avatar-button" id="nav-avatar-button" aria-haspopup="true" aria-expanded="false">
        <span class="avatar-visual" aria-hidden="true">
          <span class="avatar-initials">${initials}</span>
        </span>
        <span class="sr-only">Buka menu profil ${displayName}</span>
      </button>
      <div class="nav-dropdown" id="nav-profile-menu" hidden>
        <div class="nav-user-name">${displayName}</div>
        <a href="dashboard.html">Dasbor</a>
        <a href="profile.html">Profil Saya</a>
        <a href="courses.html">Kursus Saya</a>
        <a href="certificates.html">Sertifikat</a>
        <button type="button" class="dropdown-logout" id="logout-button">Logout</button>
      </div>
    </div>
  `;

  const avatarVisual = navAuthEl.querySelector(".avatar-visual");
  if (avatarVisual) {
    const normalizedAvatarUrl = cachedAvatarDataUrl
      ? withAvatarCacheBusting(cachedAvatarDataUrl)
      : null;

    renderAvatarElement(avatarVisual, {
      initials,
      avatarUrl: normalizedAvatarUrl,
      altText: `Foto profil ${displayName}`,
    });
  }

  setupNavProfileMenu();
}

function setupMainNavDropdowns() {
  cleanupMainNavDropdowns();

  const dropdownItems = Array.from(
    document.querySelectorAll(".nav-item-has-submenu")
  );

  if (!dropdownItems.length) {
    return;
  }

  const closeItem = (item) => {
    const toggle = item.querySelector(".nav-link-toggle");
    const menu = item.querySelector(".nav-submenu");

    if (toggle && menu && !menu.hasAttribute("hidden")) {
      menu.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      item.classList.remove("open");
    }
  };

  const closeAll = () => {
    dropdownItems.forEach((item) => closeItem(item));
  };

  const documentClickHandler = (event) => {
    if (dropdownItems.some((item) => item.contains(event.target))) {
      return;
    }
    closeAll();
  };

  const documentKeydownHandler = (event) => {
    if (event.key === "Escape") {
      const openItem = dropdownItems.find((item) =>
        item.classList.contains("open")
      );
      closeAll();
      const openToggle = openItem?.querySelector(".nav-link-toggle");
      openToggle?.focus();
    }
  };

  const cleanupCallbacks = [];

  dropdownItems.forEach((item) => {
    const toggle = item.querySelector(".nav-link-toggle");
    const menu = item.querySelector(".nav-submenu");

    if (!toggle || !menu) {
      return;
    }

    const getFocusableItems = () =>
      Array.from(menu.querySelectorAll("a, button"));

    const openMenu = (focusStrategy = "none") => {
      if (!menu.hasAttribute("hidden")) {
        return;
      }

      closeAll();
      menu.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      item.classList.add("open");

      const focusableItems = getFocusableItems();
      if (focusStrategy === "first") {
        focusableItems[0]?.focus();
      } else if (focusStrategy === "last") {
        focusableItems[focusableItems.length - 1]?.focus();
      }
    };

    const toggleMenu = (focusStrategy = "none") => {
      if (menu.hasAttribute("hidden")) {
        openMenu(focusStrategy);
      } else {
        menu.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        item.classList.remove("open");
      }
    };

    const handleToggleClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    };

    const handleToggleKeydown = (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggleMenu("first");
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        openMenu("first");
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        openMenu("last");
        return;
      }
    };

    const handleMenuKeydown = (event) => {
      if (event.key === "Escape") {
        menu.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        item.classList.remove("open");
        toggle.focus();
      }
    };

    const handleMenuClick = () => {
      menu.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      item.classList.remove("open");
    };

    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", handleToggleClick);
    toggle.addEventListener("keydown", handleToggleKeydown);
    menu.addEventListener("keydown", handleMenuKeydown);

    const menuLinks = Array.from(menu.querySelectorAll("a"));
    menuLinks.forEach((link) => {
      link.addEventListener("click", handleMenuClick);
    });

    cleanupCallbacks.push(() => {
      toggle.removeEventListener("click", handleToggleClick);
      toggle.removeEventListener("keydown", handleToggleKeydown);
      menu.removeEventListener("keydown", handleMenuKeydown);
      menuLinks.forEach((link) => {
        link.removeEventListener("click", handleMenuClick);
      });
    });
  });

  document.addEventListener("click", documentClickHandler);
  document.addEventListener("keydown", documentKeydownHandler);

  navMainDropdownCleanup = () => {
    cleanupCallbacks.forEach((callback) => callback());
    document.removeEventListener("click", documentClickHandler);
    document.removeEventListener("keydown", documentKeydownHandler);
  };
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
  const hasContainer = Boolean(enrollmentsContainer);

  if (hasContainer) {
    enrollmentsContainer.innerHTML = "";
  }

  if (!cachedSession) {
    cachedEnrollments = [];
    updateUserStats();
    renderCertificates();

    if (hasContainer) {
      const message = document.createElement("p");
      message.textContent = "Masuk untuk melihat kursus yang sudah kamu daftar.";
      message.className = "empty-state";
      enrollmentsContainer.appendChild(message);
    }
    syncTeknikEnrollButtonState();
    return;
  }

  try {
    cachedEnrollments = await myEnrollments();
  } catch (error) {
    console.error(error);
    cachedEnrollments = [];
    updateUserStats();
    renderCertificates();

    if (hasContainer) {
      const message = document.createElement("p");
      message.textContent = "Gagal memuat daftar kursusmu.";
      message.className = "empty-state";
      enrollmentsContainer.appendChild(message);
    }
    syncTeknikEnrollButtonState();
    return;
  }

  updateUserStats();
  renderCertificates();

  if (!hasContainer) {
    syncTeknikEnrollButtonState();
    return;
  }

  if (!cachedEnrollments.length) {
    const message = document.createElement("p");
    message.textContent = "Belum ada kursus yang diikuti.";
    message.className = "empty-state";
    enrollmentsContainer.appendChild(message);
    syncTeknikEnrollButtonState();
    return;
  }

  cachedEnrollments.forEach((item) => {
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
          <span>${item.enrolled_at ? formatDate(item.enrolled_at) : ""}</span>
        </div>
      </div>
    `;
    enrollmentsContainer.appendChild(card);
  });
  syncTeknikEnrollButtonState();
}

async function updateSession() {
  authLoading = true;
  renderNavbar();

  try {
    cachedSession = await getSession();
    cachedProfile = cachedSession
      ? await getUserProfile(cachedSession.user.id).catch((error) => {
          console.error(error);
          if (isProfilesWriteUnsupportedError(error)) {
            profilesTableSupported = false;
          }
          return null;
        })
      : null;

    if (cachedSession) {
      await loadProfileDetailsFromDatabase();
      syncAvatarCacheFromState();
    } else {
      cachedProfileDetails = null;
      cachedAvatarDataUrl = null;
      cachedAvatarStoragePath = null;
      profileDetailsSupported = true;
      profilesTableSupported = true;
      clearAvatarCache();
    }
  } catch (error) {
    console.error(error);
    cachedSession = null;
    cachedProfile = null;
    cachedProfileDetails = null;
    cachedAvatarDataUrl = null;
    cachedAvatarStoragePath = null;
    profilesTableSupported = true;
    clearAvatarCache();
  } finally {
    authLoading = false;
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

async function loadProfileDetailsFromDatabase() {
  cachedProfileDetails = null;
  cachedAvatarDataUrl = null;

  if (!cachedSession?.user?.id || !supabaseClient) {
    return;
  }

  try {
    const metadata = cachedSession.user?.user_metadata ?? {};

    if (!profileDetailsSupported) {
      cachedProfileDetails = buildProfileDetails({ metadata });
      const resolvedAvatarUrl = await resolveAvatarUrl(cachedProfileDetails);
      cachedProfileDetails.avatarDataUrl = resolvedAvatarUrl;
      cachedAvatarDataUrl = resolvedAvatarUrl;
      cachedAvatarStoragePath = cachedProfileDetails.avatarStoragePath ?? null;
      return;
    }

    const queryProfileDetails = async () =>
      supabaseClient
        .from("profile_details")
        .select(
          "birthdate, gender, track, major, occupation, company, location, bio, avatar_data_url, avatar_storage_path"
        )
        .eq("user_id", cachedSession.user.id)
        .maybeSingle();

    let { data, error } = await queryProfileDetails();

    if ((!data && !error) || error?.code === "PGRST116") {
      await seedProfileTablesFromMetadata();
      if (profileDetailsSupported) {
        const retryResult = await queryProfileDetails();
        data = retryResult.data ?? null;
        error = retryResult.error ?? null;
      }
    }

    if (error && error.code !== "PGRST116") {
      if (isProfileDetailsUnsupportedError(error)) {
        profileDetailsSupported = false;
        cachedProfileDetails = buildProfileDetails({ metadata });
        const resolvedAvatarUrl = await resolveAvatarUrl(cachedProfileDetails);
        cachedProfileDetails.avatarDataUrl = resolvedAvatarUrl;
        cachedAvatarDataUrl = resolvedAvatarUrl;
        cachedAvatarStoragePath = cachedProfileDetails.avatarStoragePath ?? null;
        return;
      }
      throw error;
    }

    cachedProfileDetails = buildProfileDetails({
      detailsData: data ?? {},
      metadata,
    });
    const resolvedAvatarUrl = await resolveAvatarUrl(cachedProfileDetails);
    cachedProfileDetails.avatarDataUrl = resolvedAvatarUrl;
    cachedAvatarDataUrl = resolvedAvatarUrl;
    cachedAvatarStoragePath = cachedProfileDetails.avatarStoragePath ?? null;
    profileDetailsSupported = true;
  } catch (error) {
    const metadata = cachedSession?.user?.user_metadata ?? {};
    if (isProfileDetailsUnsupportedError(error)) {
      profileDetailsSupported = false;
      cachedProfileDetails = buildProfileDetails({ metadata });
      const resolvedAvatarUrl = await resolveAvatarUrl(cachedProfileDetails);
      cachedProfileDetails.avatarDataUrl = resolvedAvatarUrl;
      cachedAvatarDataUrl = resolvedAvatarUrl;
      cachedAvatarStoragePath = cachedProfileDetails.avatarStoragePath ?? null;
      console.warn("Tabel profile_details tidak tersedia. Menggunakan metadata pengguna.");
      return;
    }

    console.error("Gagal memuat detail profil", error);
    cachedProfileDetails = buildProfileDetails({ metadata });
    const resolvedAvatarUrl = await resolveAvatarUrl(cachedProfileDetails);
    cachedProfileDetails.avatarDataUrl = resolvedAvatarUrl;
    cachedAvatarDataUrl = resolvedAvatarUrl;
    cachedAvatarStoragePath = cachedProfileDetails.avatarStoragePath ?? null;
  }
}

async function saveProfileDetailsToDatabase(data) {
  if (!cachedSession?.user?.id || !supabaseClient) {
    throw new Error("Layanan profil tidak tersedia");
  }

  const userId = cachedSession.user.id;
  const profilePayload = {
    id: userId,
    full_name: data.fullName?.trim() || null,
  };

  const normalize = (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
    return value ?? null;
  };

  const detailsPayload = {
    user_id: userId,
    birthdate: data.birthdate || null,
    gender: normalize(data.gender),
    track: normalize(data.track),
    major: normalize(data.major),
    occupation: normalize(data.occupation),
    company: normalize(data.company),
    location: normalize(data.location),
    bio: normalize(data.bio),
    avatar_data_url: cachedAvatarDataUrl ?? null,
    avatar_storage_path: cachedAvatarStoragePath ?? null,
  };

  let profileSaved = false;

  if (profilesTableSupported) {
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      if (isProfilesWriteUnsupportedError(profileError)) {
        profilesTableSupported = false;
      } else {
        throw profileError;
      }
    } else {
      profileSaved = true;
    }
  }

  let detailsSaved = false;

  if (profileDetailsSupported) {
    const upsertDetails = () =>
      supabaseClient
        .from("profile_details")
        .upsert(detailsPayload, { onConflict: "user_id" });

    let { error: detailsError } = await upsertDetails();

    if (detailsError?.code === "23503") {
      await seedProfileTablesFromMetadata({
        ...data,
        avatarDataUrl: cachedAvatarDataUrl ?? null,
        avatarStoragePath: cachedAvatarStoragePath ?? null,
      });
      if (profileDetailsSupported) {
        ({ error: detailsError } = await upsertDetails());
      }
    }

    if (detailsError) {
      if (isProfileDetailsUnsupportedError(detailsError)) {
        profileDetailsSupported = false;
      } else {
        throw detailsError;
      }
    } else {
      detailsSaved = true;
    }
  }

  if (!detailsSaved || !profileSaved) {
    await persistProfileMetadata(
      data,
      cachedAvatarDataUrl,
      cachedAvatarStoragePath
    );
  } else {
    persistProfileMetadata(
      data,
      cachedAvatarDataUrl,
      cachedAvatarStoragePath
    ).catch((error) => {
      console.warn("Gagal menyelaraskan metadata profil", error);
    });
  }

  if (profileSaved) {
    cachedProfile = cachedProfile
      ? { ...cachedProfile, full_name: profilePayload.full_name }
      : { id: userId, full_name: profilePayload.full_name };
  } else {
    cachedProfile = {
      id: userId,
      full_name: profilePayload.full_name,
    };
  }
  cachedProfileDetails = {
    ...data,
    avatarDataUrl: cachedAvatarDataUrl ?? null,
    avatarStoragePath: cachedAvatarStoragePath ?? null,
  };
}

async function saveAvatarToDatabase({ dataUrl, file }) {
  if (!cachedSession?.user?.id || !supabaseClient) {
    throw new Error("Layanan avatar tidak tersedia");
  }

  let avatarUrl = dataUrl || cachedAvatarDataUrl || null;
  let storagePath = cachedAvatarStoragePath || null;

  if (file) {
    try {
      const uploadResult = await uploadAvatarFile(file);
      avatarUrl = uploadResult.publicUrl;
      storagePath = uploadResult.storagePath;

      if (
        cachedAvatarStoragePath &&
        storagePath &&
        cachedAvatarStoragePath !== storagePath &&
        avatarUrl
      ) {
        deleteAvatarFromStorage(cachedAvatarStoragePath);
      }
    } catch (error) {
      const errorMessage = error?.message ?? "";
      const canFallback =
        Boolean(dataUrl) &&
        (errorMessage === "AVATAR_BUCKET_MISSING" ||
          errorMessage === "Supabase storage tidak tersedia" ||
          isAvatarBucketMissingError(error?.cause));

      if (!canFallback) {
        throw error;
      }

      console.warn(
        "Supabase storage tidak tersedia. Menyimpan avatar langsung di metadata pengguna.",
        error
      );
      avatarUrl = dataUrl;
      storagePath = null;
    }
  }

  const shouldPersistDirectUrl =
    !storagePath ||
    isDataUrl(avatarUrl) ||
    (typeof avatarUrl === "string" && !avatarUrl.includes("token="));

  const avatarDataUrlForPersistence = shouldPersistDirectUrl ? avatarUrl : null;

  const payload = {
    user_id: cachedSession.user.id,
    avatar_data_url: avatarDataUrlForPersistence,
    avatar_storage_path: storagePath,
  };

  let stored = false;

  if (profileDetailsSupported) {
    const upsertAvatar = () =>
      supabaseClient
        .from("profile_details")
        .upsert(payload, { onConflict: "user_id" });

    let { error } = await upsertAvatar();

    if (error?.code === "23503") {
      await seedProfileTablesFromMetadata({
        avatarDataUrl: avatarDataUrlForPersistence,
        avatarStoragePath: storagePath,
      });
      if (profileDetailsSupported) {
        ({ error } = await upsertAvatar());
      }
    }

    if (error) {
      if (isProfileDetailsUnsupportedError(error)) {
        profileDetailsSupported = false;
      } else {
        throw error;
      }
    } else {
      stored = true;
    }
  }

  const accessibleAvatarUrl = await resolveAvatarUrl({
    avatarDataUrl:
      avatarDataUrlForPersistence ?? avatarUrl ?? dataUrl ?? cachedAvatarDataUrl,
    avatarStoragePath: storagePath,
  });

  const currentData = getCurrentProfileData();
  currentData.avatarStoragePath = storagePath;

  if (!stored) {
    await persistProfileMetadata(
      currentData,
      avatarDataUrlForPersistence,
      storagePath
    );
  } else {
    persistProfileMetadata(
      currentData,
      avatarDataUrlForPersistence,
      storagePath
    ).catch((error) => {
      console.warn("Gagal memperbarui metadata avatar", error);
    });
  }

  cachedAvatarDataUrl = accessibleAvatarUrl;
  cachedAvatarStoragePath = storagePath;

  if (cachedProfileDetails) {
    cachedProfileDetails.avatarDataUrl = cachedAvatarDataUrl;
    cachedProfileDetails.avatarStoragePath = cachedAvatarStoragePath;
  }
}

function getAvatarFileExtension(file) {
  const namePart = file?.name?.split(".").pop()?.toLowerCase() ?? "";
  if (namePart === "jpg" || namePart === "jpeg") {
    return "jpg";
  }
  if (namePart === "png") {
    return "png";
  }
  if (namePart === "webp") {
    return "webp";
  }

  const mime = file?.type?.toLowerCase() ?? "";
  if (mime.includes("webp")) {
    return "webp";
  }
  if (mime.includes("png")) {
    return "png";
  }
  return "jpg";
}

function getAvatarContentType(extension) {
  if (extension === "png") {
    return "image/png";
  }
  if (extension === "webp") {
    return "image/webp";
  }
  return "image/jpeg";
}

function generateAvatarStoragePath(extension) {
  const safeExtension = extension || "jpg";
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const userId = cachedSession?.user?.id;
  if (!userId) {
    throw new Error("ID pengguna tidak ditemukan untuk avatar");
  }
  return `${userId}/${Date.now()}-${randomSuffix}.${safeExtension}`;
}

function isAvatarBucketMissingError(error) {
  if (!error) {
    return false;
  }
  const message = (error.message ?? "").toLowerCase();
  return (
    error.statusCode === 404 ||
    message.includes("bucket") ||
    message.includes("not found")
  );
}

async function uploadAvatarFile(file) {
  if (!supabaseClient?.storage) {
    throw new Error("Supabase storage tidak tersedia");
  }

  const extension = getAvatarFileExtension(file);
  const contentType = file?.type && ALLOWED_AVATAR_MIME_TYPES.has(file.type)
    ? file.type
    : getAvatarContentType(extension);
  const storagePath = generateAvatarStoragePath(extension);

  const { error } = await supabaseClient.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType,
    });

  if (error) {
    if (isAvatarBucketMissingError(error)) {
      const bucketError = new Error("AVATAR_BUCKET_MISSING");
      bucketError.cause = error;
      throw bucketError;
    }
    throw error;
  }

  const { data } = supabaseClient.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storagePath);

  let publicUrl = data?.publicUrl ?? null;

  if (!publicUrl) {
    try {
      const { data: signedData } = await supabaseClient.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(storagePath, AVATAR_SIGNED_URL_DURATION);
      publicUrl = signedData?.signedUrl ?? null;
    } catch (error) {
      console.warn("Gagal membuat signed URL avatar", error);
    }
  }

  return {
    storagePath,
    publicUrl,
  };
}

function deleteAvatarFromStorage(path) {
  if (!path || !supabaseClient?.storage) {
    return;
  }

  supabaseClient.storage
    .from(AVATAR_BUCKET)
    .remove([path])
    .catch((error) => {
      console.warn("Gagal menghapus avatar lama", error);
    });
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
  selectedAvatarFile = null;
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
    renderAvatarElement(avatarPreviewEl, { initials: "E" });
    avatarPreviewEl.setAttribute(
      "aria-label",
      "Pratinjau foto profil. Masuk untuk menambahkan foto."
    );
    return;
  }

  const name = getUserDisplayName();
  const initials = getUserInitials(name) || name?.[0]?.toUpperCase() || "E";

  avatarPreviewEl.setAttribute(
    "aria-label",
    `Foto profil ${name || "pengguna"}`
  );

  const previewUrl = cachedAvatarDataUrl
    ? withAvatarCacheBusting(cachedAvatarDataUrl)
    : null;

  renderAvatarElement(avatarPreviewEl, {
    initials,
    avatarUrl: previewUrl,
    altText: `Foto profil ${name || "pengguna"}`,
  });
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
    selectedAvatarFile = null;
    updateAvatarPreviewWithSelection();
    return;
  }

  const mimeType = file.type?.toLowerCase() ?? "";
  const fileName = file.name?.toLowerCase() ?? "";
  const hasSupportedMime = ALLOWED_AVATAR_MIME_TYPES.has(mimeType);
  const hasSupportedExtension =
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".webp");

  if (!hasSupportedMime && !hasSupportedExtension) {
    setFeedbackMessage(
      avatarFeedbackEl,
      "Format file tidak didukung. Gunakan PNG, JPG, atau WEBP.",
      false
    );
    selectedAvatarDataUrl = null;
    selectedAvatarFile = null;
    event.target.value = "";
    updateAvatarPreviewWithSelection();
    return;
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    setFeedbackMessage(
      avatarFeedbackEl,
      "Ukuran gambar maksimal 2 MB.",
      false
    );
    selectedAvatarDataUrl = null;
    selectedAvatarFile = null;
    event.target.value = "";
    updateAvatarPreviewWithSelection();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedAvatarDataUrl = reader.result;
    selectedAvatarFile = file;
    updateAvatarPreviewWithSelection();
    setFeedbackMessage(avatarFeedbackEl, "Gambar siap disimpan.", true);
  };
  reader.onerror = () => {
    selectedAvatarDataUrl = null;
    selectedAvatarFile = null;
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
    const name = getUserDisplayName();
    const initials =
      getUserInitials(name) || name?.[0]?.toUpperCase() || "E";
    avatarPreviewEl.setAttribute(
      "aria-label",
      `Foto profil ${name || "pengguna"}`
    );
    renderAvatarElement(avatarPreviewEl, {
      initials,
      avatarUrl: selectedAvatarDataUrl,
      altText: `Foto profil ${name || "pengguna"}`,
    });
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

  if (!selectedAvatarDataUrl || !selectedAvatarFile) {
    setFeedbackMessage(avatarFeedbackEl, "Pilih gambar terlebih dahulu.", false);
    return;
  }

  setFeedbackMessage(avatarFeedbackEl, "Menyimpan foto profil...", true);

  try {
    await saveAvatarToDatabase({
      dataUrl: selectedAvatarDataUrl,
      file: selectedAvatarFile,
    });
    await loadProfileDetailsFromDatabase();
    selectedAvatarDataUrl = null;
    selectedAvatarFile = null;
    if (avatarInputEl) {
      avatarInputEl.value = "";
    }
    setFeedbackMessage(avatarFeedbackEl, "Foto profil berhasil disimpan.", true);
    updateAvatarPreview();
    renderNavbar();
  } catch (error) {
    console.error(error);
    if (error?.code === AUTH_SESSION_MISSING) {
      setFeedbackMessage(
        avatarFeedbackEl,
        "Sesi login kamu sudah berakhir. Masuk kembali lalu coba unggah lagi.",
        false
      );
      await updateSession();
      return;
    }
    const errorMessage =
      error?.message === "AVATAR_BUCKET_MISSING"
        ? "Bucket penyimpanan avatar belum disiapkan. Ikuti panduan Supabase di README."
        : "Gagal menyimpan foto profil. Coba lagi nanti.";
    setFeedbackMessage(avatarFeedbackEl, errorMessage, false);
  }
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
      const sessionError = toAuthSessionMissingError(error);
      if (sessionError) {
        throw sessionError;
      }
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
    if (error?.code === AUTH_SESSION_MISSING) {
      setFeedbackMessage(
        passwordFeedbackEl,
        "Sesi login kamu sudah habis. Masuk kembali untuk mengganti kata sandi.",
        false
      );
      await updateSession();
      return;
    }
    setFeedbackMessage(
      passwordFeedbackEl,
      "Gagal memperbarui kata sandi. Coba lagi nanti.",
      false
    );
  }
}

async function handleProfileInfoSubmit(event) {
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

  setFeedbackMessage(profileInfoFeedbackEl, "Menyimpan profil...", true);

  try {
    await saveProfileDetailsToDatabase(payload);
    await loadProfileDetailsFromDatabase();
    populateProfileFormFields();
    renderNavbar();
    updateAvatarPreview();
    setFeedbackMessage(profileInfoFeedbackEl, "Profil berhasil disimpan.", true);
  } catch (error) {
    console.error(error);
    if (error?.code === AUTH_SESSION_MISSING) {
      setFeedbackMessage(
        profileInfoFeedbackEl,
        "Sesi login kamu sudah tidak berlaku. Masuk kembali lalu simpan profilmu.",
        false
      );
      await updateSession();
      return;
    }
    setFeedbackMessage(
      profileInfoFeedbackEl,
      "Gagal menyimpan profil. Coba lagi nanti.",
      false
    );
  }
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
  navToggleButton = document.getElementById("nav-toggle");
  navLinksList = document.getElementById("primary-navigation");
  navContainerEl = document.querySelector(".navbar");
  enrollmentsContainer = document.getElementById("my-enrollments");
  teknikEnrollButton = document.getElementById("teknik-enroll-button");
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

  hydrateSessionFromStorage();
  authLoading = !cachedSession;
  renderNavbar();

  setupMainNavDropdowns();
  setupMobileNavToggle();
  initializeEventListeners();
  initializeProfileForms();
  initializeTeknikPertambanganCTA();
  const sessionPromise = updateSession();

  try {
    await initializeCourseFilters();
  } catch (error) {
    console.error(error);
  }

  await sessionPromise;

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
