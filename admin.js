(() => {
  const STORAGE_KEY = "brookePortfolioProjects";
  const form = document.querySelector("#project-form");
  const list = document.querySelector("#admin-project-list");
  const resetButton = document.querySelector("#reset-projects");
  const exportButton = document.querySelector("#export-projects");
  const clearButton = document.querySelector("#clear-form");
  let editingId = null;

  const defaults = () => JSON.parse(JSON.stringify(window.PROJECTS || []));
  const load = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaults();
    } catch { return defaults(); }
  };
  let projects = load();

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    render();
  };

  const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const splitCSV = value => value.split(",").map(item => item.trim()).filter(Boolean);

  function clearForm() {
    editingId = null;
    form.reset();
    document.querySelector("#form-title").textContent = "Add a project";
    document.querySelector("#submit-project").textContent = "Save project";
  }

  function render() {
    list.innerHTML = projects.map(project => `
      <article class="admin-item">
        <div>
          <p class="project-meta">${esc(project.category)} · ${esc(project.status)}</p>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description)}</p>
        </div>
        <div class="admin-actions">
          <button type="button" class="button button--ghost" data-edit="${esc(project.id)}">Edit</button>
          <button type="button" class="button button--danger" data-delete="${esc(project.id)}">Delete</button>
        </div>
      </article>`).join("");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const title = data.get("title").trim();
    const project = {
      id: editingId || slugify(title) || `project-${Date.now()}`,
      title,
      question: data.get("question").trim(),
      description: data.get("description").trim(),
      finding: data.get("finding").trim(),
      category: data.get("category"),
      tags: splitCSV(data.get("tags")),
      status: data.get("status"),
      date: data.get("date"),
      github: data.get("github").trim(),
      demo: data.get("demo").trim(),
      featured: data.get("featured") === "on",
      metrics: splitCSV(data.get("metrics"))
    };

    if (editingId) projects = projects.map(item => item.id === editingId ? project : item);
    else projects.unshift(project);
    save();
    clearForm();
  });

  list.addEventListener("click", event => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId) {
      const project = projects.find(item => item.id === editId);
      if (!project) return;
      editingId = editId;
      for (const [key, value] of Object.entries(project)) {
        const field = form.elements[key];
        if (!field) continue;
        if (field.type === "checkbox") field.checked = Boolean(value);
        else field.value = Array.isArray(value) ? value.join(", ") : value ?? "";
      }
      document.querySelector("#form-title").textContent = "Edit project";
      document.querySelector("#submit-project").textContent = "Update project";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (deleteId && confirm("Delete this project from your local project list?")) {
      projects = projects.filter(item => item.id !== deleteId);
      save();
      if (editingId === deleteId) clearForm();
    }
  });

  clearButton.addEventListener("click", clearForm);

  resetButton.addEventListener("click", () => {
    if (!confirm("Reset to the default projects from projects.js?")) return;
    projects = defaults();
    localStorage.removeItem(STORAGE_KEY);
    render();
    clearForm();
  });

  exportButton.addEventListener("click", () => {
    const fileText = `window.PROJECTS = ${JSON.stringify(projects, null, 2)};\n`;
    const blob = new Blob([fileText], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.js";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  render();
})();
