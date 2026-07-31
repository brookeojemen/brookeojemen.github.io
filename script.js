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
              <span class="status ${project.status === "Completed" ? "status--done" : "status--wip"}">${escapeHTML(project.status)}</span>
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
  