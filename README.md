# Brooke Ojemen Portfolio

A clean, white, professional portfolio designed for data science, analytics, machine learning, and backend software engineering applications.

## Files

- `index.html` — home page
- `projects.html` — searchable/filterable project portfolio
- `admin.html` — no-code project editor
- `style.css` — complete responsive design
- `projects.js` — default project data
- `script.js` — project rendering, search, filters, sorting
- `admin.js` — add/edit/delete/export project workflow

## Editing projects without touching code

1. Open `admin.html` in your browser.
2. Fill in the project form and click **Save project**.
3. Your changes are saved in that browser using `localStorage` and immediately appear on `projects.html` and the featured projects section on `index.html`.
4. When ready to publish, click **Export projects.js**.
5. Replace the `projects.js` file in your GitHub Pages repository with the downloaded file and commit/push it.

GitHub Pages is a static host, so a browser cannot permanently rewrite files in your repository on its own. The export workflow gives you a form-based editor without requiring you to manually edit project HTML or JavaScript objects.

## Included projects

- Iris Flower Classification
- Penguin Data Analysis
- Customer Behavior Analysis

The Iris project already points to your current repository. Add GitHub links for the other projects when those repositories are ready.

## GitHub Pages

Upload all six website files to the same repository directory. GitHub Pages will serve `index.html` automatically.
