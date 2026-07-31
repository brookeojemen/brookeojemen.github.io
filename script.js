
(() => {
  const key = "brookePortfolioTheme";
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const updateButton = () => {
    const dark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    button.title = dark ? "Light mode" : "Dark mode";
  };

  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(key, root.dataset.theme);
    updateButton();
  });

  updateButton();
})();


function formatProjectDate(value) {
  if (!value) return "Undated";
  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  const d = new Date(year, Math.max(0, month - 1), 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

(() => {
  const STORAGE_KEY = "brookePortfolioProjects";

  const safeProjects = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn("Could not load saved projects:", error);
    }
    return Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  };

  const projectSlug = value => String(value || "project")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = value => {
    if (!value) return "Current";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month || 1) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  function renderProjects() {
    const grid = document.querySelector("[data-project-grid]");
    if (!grid) return;

    const search = document.querySelector("[data-project-search]");
    const category = document.querySelector("[data-project-category]");
    const status = document.querySelector("[data-project-status]");
    const sort = document.querySelector("[data-project-sort]");
    const empty = document.querySelector("[data-project-empty]");
    const count = document.querySelector("[data-project-count]");
    let projects = safeProjects();

    const draw = () => {
      const q = (search?.value || "").toLowerCase().trim();
      const cat = category?.value || "all";
      const stat = status?.value || "all";
      const order = sort?.value || "newest";

      let filtered = projects.filter(project => {
        const haystack = [project.title, project.question, project.description, project.finding, project.category, ...(project.tags || []), ...(project.metrics || [])].join(" ").toLowerCase();
        return (!q || haystack.includes(q)) &&
          (cat === "all" || project.category === cat) &&
          (stat === "all" || project.status === stat);
      });

      filtered.sort((a, b) => {
        if (order === "oldest") return String(a.date).localeCompare(String(b.date));
        if (order === "az") return String(a.title).localeCompare(String(b.title));
        return String(b.date).localeCompare(String(a.date));
      });

      grid.innerHTML = filtered.map(project => {
        const tags = (project.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
        const metrics = (project.metrics || []).map(metric => `<span>${escapeHTML(metric)}</span>`).join("");
        const links = [
          project.github ? `<a class="text-link" href="${escapeHTML(project.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : "",
          project.demo ? `<a class="text-link" href="${escapeHTML(project.demo)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""
        ].filter(Boolean).join("");

        return `
      <div class="timeline-project ${project.status === "Completed" ? "timeline-project--done" : "timeline-project--wip"}">
        <div class="timeline-date-block">
          <span class="timeline-dot" aria-hidden="true"></span>
          <time datetime="${escapeHTML(project.date || "")}">${formatProjectDate(project.date)}</time>
        </div>
        <article class="project-card">
          <div class="project-card__visual"><span>${escapeHTML(project.category)}</span></div>
          <div class="project-card__body">
            <div class="project-card__top">
              <div>
                <p class="project-meta">${escapeHTML(formatDate(project.date))} · ${escapeHTML(project.category)}</p>
                <h2>${escapeHTML(project.title)}</h2>
              </div>
              <span class="status ${project.status === "Completed" ? "status--done" : "status--wip"}">${escapeHTML(project.status)}</span>
            </div>
            ${project.question ? `<div class="project-question"><span>Project question</span><strong>${escapeHTML(project.question)}</strong></div>` : ""}
            <p class="project-description">${escapeHTML(project.description)}</p>
            ${project.finding ? `<div class="project-finding"><span>Key takeaway</span><p>${escapeHTML(project.finding)}</p></div>` : ""}
            <div class="metric-row">${metrics}</div>
            <div class="tag-row">${tags}</div>
            <div class="project-card__foot">
              <span class="project-id">${escapeHTML(project.id || projectSlug(project.title))}</span>
              <div class="project-links">${project.github ? `<a class="button" href="${escapeHTML(project.github)}" target="_blank" rel="noopener">View project ↗</a>` : '<span class="muted">Link coming soon</span>'}${project.demo ? `<a class="button button--ghost" href="${escapeHTML(project.demo)}" target="_blank" rel="noopener">Live demo ↗</a>` : ""}</div>
            </div>
          </div>
        </article>
      </div>
    `;
      }).join("");

      if (count) count.textContent = `${filtered.length} project${filtered.length === 1 ? "" : "s"}`;
      if (empty) empty.hidden = filtered.length !== 0;
    };

    [search, category, status, sort].forEach(control => control?.addEventListener("input", draw));
    draw();
  }

  function renderFeaturedProjects() {
    const target = document.querySelector("[data-featured-projects]");
    if (!target) return;
    const projects = safeProjects().filter(project => project.featured).slice(0, 3);
    target.innerHTML = projects.map(project => `
      <article class="mini-project">
        <p class="project-meta">${escapeHTML(project.category)} · ${escapeHTML(project.status)}</p>
        <h3>${escapeHTML(project.title)}</h3>
        ${project.question ? `<p class="mini-question">${escapeHTML(project.question)}</p>` : ""}
        <p>${escapeHTML(project.description)}</p>
        <div class="tag-row">${(project.tags || []).slice(0, 4).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
      </article>`).join("");
  }

  renderProjects();
  renderFeaturedProjects();
})();

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cat = document.createElement("div");
  cat.className = "portfolio-cat is-walking";
  cat.dataset.direction = "right";
  cat.setAttribute("role", "img");
  cat.setAttribute("aria-label", "A small calico cat walking along the top of the page. Drag it with the mouse.");
  cat.innerHTML = `
    <svg class="portfolio-cat__sprite" viewBox="0 0 64 46" aria-hidden="true">
      <g class="portfolio-cat__body">
        <path class="portfolio-cat__tail" d="M15 25 C5 24, 3 15, 8 12 C12 10, 14 15, 11 17" fill="none" stroke="#2f3135" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="32" cy="25" rx="19" ry="12" fill="#f7f2e8" stroke="#2f3135" stroke-width="2"/>
        <path d="M19 18 C22 12, 30 12, 34 18 C30 22, 24 23, 19 18Z" fill="#d3833f"/>
        <path d="M35 15 C42 14, 48 18, 50 23 C45 25, 40 24, 35 20Z" fill="#2f3135"/>
        <circle cx="47" cy="18" r="10" fill="#f7f2e8" stroke="#2f3135" stroke-width="2"/>
        <path d="M40 11 L42 3 L47 10Z" fill="#f7f2e8" stroke="#2f3135" stroke-width="2" stroke-linejoin="round"/>
        <path d="M50 10 L56 4 L56 13Z" fill="#d3833f" stroke="#2f3135" stroke-width="2" stroke-linejoin="round"/>
        <path d="M44 10 C47 8, 51 9, 53 12 L49 17 L43 15Z" fill="#2f3135"/>
        <circle cx="45" cy="18" r="1.2" fill="#2f3135"/>
        <circle cx="52" cy="18" r="1.2" fill="#2f3135"/>
        <path d="M48 21 q2 2 4 0" fill="none" stroke="#2f3135" stroke-width="1.3" stroke-linecap="round"/>
        <path class="portfolio-cat__leg--back" d="M23 31 v9" stroke="#2f3135" stroke-width="4" stroke-linecap="round"/>
        <path class="portfolio-cat__leg--front" d="M41 31 v9" stroke="#2f3135" stroke-width="4" stroke-linecap="round"/>
        <path d="M24 39 h5 M42 39 h5" stroke="#2f3135" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>`;
  document.body.appendChild(cat);

  let x = 24;
  let y = 38;
  let direction = 1;
  let dragging = false;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;
  let lastTime = performance.now();
  const speed = reducedMotion ? 0 : 34;

  const trackY = () => Math.max(24, Math.min(46, document.querySelector(".site-nav")?.getBoundingClientRect().bottom - cat.offsetHeight / 2 || 38));
  const clampX = value => Math.max(4, Math.min(window.innerWidth - cat.offsetWidth - 4, value));
  const render = () => { cat.style.transform = `translate3d(${x}px, ${y}px, 0)`; };

  function animate(now) {
    const elapsed = Math.min((now - lastTime) / 1000, .05);
    lastTime = now;
    if (!dragging && speed > 0) {
      x += direction * speed * elapsed;
      const maxX = window.innerWidth - cat.offsetWidth - 4;
      if (x >= maxX) { x = maxX; direction = -1; cat.dataset.direction = "left"; }
      if (x <= 4) { x = 4; direction = 1; cat.dataset.direction = "right"; }
      y += (trackY() - y) * Math.min(1, elapsed * 8);
      render();
    }
    requestAnimationFrame(animate);
  }

  cat.addEventListener("pointerdown", event => {
    dragging = true;
    cat.classList.add("is-dragging");
    cat.classList.remove("is-walking");
    const rect = cat.getBoundingClientRect();
    pointerOffsetX = event.clientX - rect.left;
    pointerOffsetY = event.clientY - rect.top;
    cat.setPointerCapture(event.pointerId);
  });

  cat.addEventListener("pointermove", event => {
    if (!dragging) return;
    x = clampX(event.clientX - pointerOffsetX);
    y = Math.max(0, Math.min(window.innerHeight - cat.offsetHeight, event.clientY - pointerOffsetY));
    render();
  });

  const releaseCat = event => {
    if (!dragging) return;
    dragging = false;
    cat.classList.remove("is-dragging");
    cat.classList.add("is-walking");
    if (cat.hasPointerCapture(event.pointerId)) cat.releasePointerCapture(event.pointerId);
  };
  cat.addEventListener("pointerup", releaseCat);
  cat.addEventListener("pointercancel", releaseCat);
  window.addEventListener("resize", () => { x = clampX(x); render(); });

  y = trackY();
  render();
  requestAnimationFrame(animate);
})();
