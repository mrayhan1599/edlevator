const courses = [
  {
    title: "Dasar Pemrograman Web",
    category: "teknik informatika",
    lecturer: "Dr. Sinta Wardhani",
    hours: 24,
    rating: 4.8,
    level: "pemula"
  },
  {
    title: "Manajemen Proyek Digital",
    category: "manajemen bisnis",
    lecturer: "Bima Adi, M.M.",
    hours: 18,
    rating: 4.6,
    level: "menengah"
  },
  {
    title: "Psikologi Komunikasi Massa",
    category: "psikologi",
    lecturer: "Dr. Rani Kartika",
    hours: 20,
    rating: 4.9,
    level: "lanjutan"
  },
  {
    title: "Branding Visual untuk Startup",
    category: "desain komunikasi visual",
    lecturer: "Aditia Permana, S.Ds.",
    hours: 16,
    rating: 4.7,
    level: "menengah"
  },
  {
    title: "Analisis Data Bisnis",
    category: "manajemen bisnis",
    lecturer: "Fadhil Ramadhan, M.BA",
    hours: 22,
    rating: 4.5,
    level: "lanjutan"
  },
  {
    title: "UI/UX Research Fundamentals",
    category: "desain komunikasi visual",
    lecturer: "Natasya Lingga, M.Ds.",
    hours: 14,
    rating: 4.4,
    level: "pemula"
  },
  {
    title: "Machine Learning Praktis",
    category: "teknik informatika",
    lecturer: "Yusuf Rahman, M.Kom",
    hours: 26,
    rating: 4.9,
    level: "lanjutan"
  }
];

const courseListEl = document.getElementById("course-list");
const searchInputEl = document.getElementById("search-input");
const categoryFilterEl = document.getElementById("category-filter");
const levelFilterEl = document.getElementById("level-filter");
const statTotalCourseEl = document.getElementById("stat-total-course");
const statTotalHoursEl = document.getElementById("stat-total-hours");
const statAverageRatingEl = document.getElementById("stat-average-rating");

if (
  courseListEl &&
  searchInputEl &&
  categoryFilterEl &&
  levelFilterEl &&
  statTotalCourseEl &&
  statTotalHoursEl &&
  statAverageRatingEl
) {
  const renderCourse = (course) => {
    const wrapper = document.createElement("article");
    wrapper.className = "course-card";
    wrapper.innerHTML = `
      <div class="course-header">
        <div>
          <h2>${course.title}</h2>
          <div class="course-meta">
            <span class="badge">${course.category}</span>
            <span>${course.lecturer}</span>
          </div>
        </div>
        <div class="course-meta">
          <span>${course.hours} jam</span>
          <span>Rating ${course.rating.toFixed(1)}</span>
          <span class="badge">${course.level}</span>
        </div>
      </div>
      <div class="course-actions">
        <button type="button" class="btn secondary">Mulai</button>
        <button type="button" class="btn">Daftar</button>
      </div>
    `;
    return wrapper;
  };

  const updateStats = (list) => {
    const totalCourse = list.length;
    const totalHours = list.reduce((sum, course) => sum + course.hours, 0);
    const averageRating =
      totalCourse > 0
        ? list.reduce((sum, course) => sum + course.rating, 0) / totalCourse
        : 0;

    statTotalCourseEl.textContent = totalCourse.toString();
    statTotalHoursEl.textContent = `${totalHours} jam`;
    statAverageRatingEl.textContent = averageRating.toFixed(1);
  };

  const renderList = (list) => {
    courseListEl.innerHTML = "";

    if (list.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Kursus tidak ditemukan. Coba ubah kata kunci atau filter.";
      emptyMessage.style.color = "var(--text-light)";
      courseListEl.appendChild(emptyMessage);
      updateStats([]);
      return;
    }

    list.forEach((course) => {
      courseListEl.appendChild(renderCourse(course));
    });

    updateStats(list);
  };

  const filterCourses = () => {
    const keyword = searchInputEl.value.trim().toLowerCase();
    const category = categoryFilterEl.value;
    const level = levelFilterEl.value;

    const filtered = courses.filter((course) => {
      const matchesKeyword =
        keyword === "" ||
        course.title.toLowerCase().includes(keyword) ||
        course.lecturer.toLowerCase().includes(keyword) ||
        course.category.toLowerCase().includes(keyword);

      const matchesCategory = category === "" || course.category === category;
      const matchesLevel = level === "" || course.level === level;

      return matchesKeyword && matchesCategory && matchesLevel;
    });

    renderList(filtered);
  };

  searchInputEl.addEventListener("input", filterCourses);
  categoryFilterEl.addEventListener("change", filterCourses);
  levelFilterEl.addEventListener("change", filterCourses);

  renderList(courses);
}
