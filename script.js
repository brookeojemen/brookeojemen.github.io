function formatProjectDate(value) {
  if (!value) return "Undated";
  const [year, month = "1"] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

(() => {
  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function renderProjects() {
    const grid = document.querySelector("[data-project-grid]");
    if (!grid || !Array.isArray(window.PROJECTS)) return;
    const buttons = [...document.querySelectorAll("[data-project-category]")];
    const count = document.querySelector("[data-project-count]");
    const empty = document.querySelector("[data-project-empty]");

    const draw = category => {
      const projects = window.PROJECTS.filter(project => category === "all" || project.category === category);
      grid.innerHTML = projects.map(project => `
        <article class="project-card project-card--case-study">
          <a class="project-image-link" href="${escapeHTML(project.caseStudy)}" aria-label="Read ${escapeHTML(project.title)} case study">
            <img class="project-card__image" src="${escapeHTML(project.image)}" alt="${escapeHTML(project.imageAlt)}" loading="lazy">
          </a>
          <div class="project-card__body">
            <div class="project-card__top">
              <div><p class="project-meta">${escapeHTML(formatProjectDate(project.date))} · ${escapeHTML(project.category)}</p><h2>${escapeHTML(project.title)}</h2></div>
              <span class="status status--done">${escapeHTML(project.status)}</span>
            </div>
            <p class="project-description">${escapeHTML(project.description)}</p>
            <div class="metric-row">${project.metrics.map(metric => `<span>${escapeHTML(metric)}</span>`).join("")}</div>
            <div class="tag-row">${project.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
            <div class="project-card__foot">
              <a class="button" href="${escapeHTML(project.caseStudy)}">View case study</a>
              <a class="text-link" href="${escapeHTML(project.github)}" target="_blank" rel="noopener">GitHub ↗</a>
            </div>
          </div>
        </article>`).join("");
      if (count) count.textContent = `${projects.length} project${projects.length === 1 ? "" : "s"}`;
      if (empty) empty.hidden = projects.length !== 0;
    };

    buttons.forEach(button => button.addEventListener("click", () => {
      buttons.forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      draw(button.dataset.projectCategory);
    }));
    draw("all");
  }

  renderProjects();
})();

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cat = document.createElement("div");
  cat.className = "portfolio-cat is-walking";
  cat.dataset.direction = "right";
  cat.setAttribute("role", "img");
  cat.setAttribute("aria-label", "A small calico cat walking along the top of the page. Drag it with the mouse.");
  cat.innerHTML = '<img class="portfolio-cat__sprite pixel" src="pixel_cat.png" alt="">';
  document.body.appendChild(cat);

  const visibilityKey = "brookePortfolioCatVisible";
  const toggle = document.querySelector("[data-cat-toggle]");
  let catVisible = localStorage.getItem(visibilityKey) !== "false";

  const updateCatVisibility = () => {
    cat.hidden = !catVisible;
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(catVisible));
      toggle.setAttribute("aria-label", catVisible ? "Hide cat" : "Show cat");
      toggle.title = catVisible ? "Hide cat" : "Show cat";
      toggle.classList.toggle("is-off", !catVisible);
    }
  };

  toggle?.addEventListener("click", () => {
    catVisible = !catVisible;
    localStorage.setItem(visibilityKey, String(catVisible));
    updateCatVisibility();
  });

  updateCatVisibility();

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
    if (catVisible && !dragging && speed > 0) {
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
