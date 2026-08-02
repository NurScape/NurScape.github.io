const state = {
  courses: [],
  resources: [],
  activeCourseFilter: "all",
  activeResourceFilter: "all"
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function iconClass(icon) {
  if (!icon) return "fa-solid fa-heart-pulse";
  return icon.includes(" ") ? icon : `fa-solid ${icon}`;
}

function renderHomepage(homepage) {
  qs("#heroTitle").innerHTML = homepage.hero_title || FALLBACK_DATA.homepage.hero_title;
  qs("#heroSubtitle").textContent = homepage.hero_subtitle || FALLBACK_DATA.homepage.hero_subtitle;
  qs("#heroPrimaryBtn").textContent = homepage.primary_label || "Découvrir les cours";
  qs("#heroPrimaryBtn").insertAdjacentHTML("beforeend", ' <i class="fa-solid fa-arrow-right"></i>');
  qs("#heroPrimaryBtn").href = homepage.primary_href || "#cours";
  qs("#heroSecondaryBtn").textContent = homepage.secondary_label || "Explorer les ressources";
  qs("#heroSecondaryBtn").href = homepage.secondary_href || "#ressources";
  qs("#heroBackdrop").style.backgroundImage = `linear-gradient(90deg, rgba(6, 12, 24, .98) 0%, rgba(6, 12, 24, .7) 42%, rgba(6, 12, 24, .28) 100%), url("${homepage.hero_image_url || FALLBACK_DATA.homepage.hero_image_url}")`;
  qs("#aboutTitle").textContent = homepage.about_title || FALLBACK_DATA.homepage.about_title;
  qs("#aboutText").textContent = homepage.about_text || FALLBACK_DATA.homepage.about_text;
  qs("#aboutImage").src = homepage.about_image_url || FALLBACK_DATA.homepage.about_image_url;

  const stats = homepage.stats || FALLBACK_DATA.homepage.stats;
  qs("#statsGrid").innerHTML = stats.map((stat) => `
    <article class="stat-item">
      <i class="${iconClass(stat.icon)}"></i>
      <strong>${stat.value}</strong>
      <span>${stat.label}</span>
    </article>
  `).join("");

  const features = homepage.features || FALLBACK_DATA.homepage.features;
  qs("#featureList").innerHTML = features.map((feature) => `
    <article class="feature">
      <i class="${iconClass(feature.icon)}"></i>
      <h3>${feature.title}</h3>
      <p>${feature.text}</p>
    </article>
  `).join("");

  const socials = homepage.social_links || FALLBACK_DATA.homepage.social_links;
  qs("#socialLinks").innerHTML = socials.map((item) => `
    <a href="${item.url}" aria-label="${item.label}" target="_blank" rel="noreferrer">
      <i class="${iconClass(item.icon)}"></i>
    </a>
  `).join("");
}

function renderCourses() {
  const query = qs("#courseSearch").value.trim().toLowerCase();
  const filtered = state.courses.filter((course) => {
    const matchesFilter = state.activeCourseFilter === "all" || course.category === state.activeCourseFilter;
    const haystack = `${course.title} ${course.description} ${course.category}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  qs("#courseEmpty").hidden = filtered.length > 0;
  qs("#courseGrid").innerHTML = filtered.map((course) => `
    <article class="course-card" data-category="${course.category}">
      <div class="course-icon"><i class="${iconClass(course.icon)}"></i></div>
      <h3>${course.title}</h3>
      <p>${course.description}</p>
    </article>
  `).join("");
}

function resourceIcon(type) {
  return {
    video: "fa-regular fa-circle-play",
    infographic: "fa-regular fa-image",
    pdf: "fa-regular fa-file-pdf",
    quiz: "fa-regular fa-circle-question"
  }[type] || "fa-regular fa-folder";
}

function renderResources() {
  const filtered = state.resources.filter((resource) => state.activeResourceFilter === "all" || resource.type === state.activeResourceFilter);
  qs("#resourceEmpty").hidden = filtered.length > 0;
  qs("#resourceGrid").innerHTML = filtered.map((resource) => `
    <a class="resource-card" href="${resource.url || "#"}" ${resource.url && resource.url !== "#" ? 'target="_blank" rel="noreferrer"' : ""}>
      <i class="${resourceIcon(resource.type)}"></i>
      <span>${resource.subject || resource.type}</span>
      <h3>${resource.title}</h3>
      <p>${resource.description || ""}</p>
    </a>
  `).join("");
}

function bindInteractions() {
  qs("#menuBtn").addEventListener("click", () => qs("#navLinks").classList.toggle("open"));
  qsa(".nav-links a").forEach((link) => link.addEventListener("click", () => qs("#navLinks").classList.remove("open")));

  qs("#themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("light");
    qs("#themeBtn").innerHTML = document.body.classList.contains("light")
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });

  qs("#courseSearch").addEventListener("input", renderCourses);
  qsa("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      qsa("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.activeCourseFilter = button.dataset.filter;
      renderCourses();
    });
  });

  qsa("[data-resource-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      qsa("[data-resource-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.activeResourceFilter = button.dataset.resourceFilter;
      renderResources();
    });
  });

  qs("#newsletterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    qs("#newsletterNote").textContent = "Merci. Le module newsletter sera connecté dans une prochaine étape.";
    event.currentTarget.reset();
  });
}

async function init() {
  bindInteractions();
  qs("#year").textContent = new Date().getFullYear();
  const content = await loadPublishedContent();
  state.courses = content.courses;
  state.resources = content.resources;
  renderHomepage(content.homepage);
  renderCourses();
  renderResources();
}

init();
