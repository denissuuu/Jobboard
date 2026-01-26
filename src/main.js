import "./style.css";

/**
 * Objectif perf/éco :
 * - 0 librairies
 * - données en localfez
 * - routing hash
 * - favoris en localStorage
 */

const JOBS = [
  { id: 1, title: "Stage Front-end", company: "Studio Nova", city: "Lille", url: "#" },
  { id: 2, title: "Stage UX/UI", company: "Kraft", city: "Paris", url: "#" },
  { id: 3, title: "Stage Web Intégration", company: "PixelWorks", city: "Lyon", url: "#" },
  { id: 4, title: "Stage Dév Web", company: "BlueForge", city: "Bordeaux", url: "#" },
  { id: 5, title: "Stage Data (Light)", company: "Sfera", city: "Nantes", url: "#" },
  { id: 6, title: "Stage Fullstack (no backend ici)", company: "Cobalt", city: "Toulouse", url: "#" },
];

const $topbar = document.querySelector("#topbar");
const $view = document.querySelector("#view");

const store = {
  getFavs() {
    try {
      return new Set(JSON.parse(localStorage.getItem("favs") || "[]"));
    } catch {
      return new Set();
    }
  },
  setFavs(set) {
    localStorage.setItem("favs", JSON.stringify([...set]));
  },
  getStats() {
    try {
      return JSON.parse(localStorage.getItem("stats") || `{"apps":12,"interviews":3,"replies":4}`);
    } catch {
      return { apps: 12, interviews: 3, replies: 4 };
    }
  },
};

function route() {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith("search")) return renderSearch();
  if (hash === "follow") return renderFollow();
  if (hash === "favorites") return renderFavorites();
  if (hash === "settings") return renderSettings();
  return renderHome();
}

function setTopbar({ left = "", right = "" }) {
  $topbar.innerHTML = `
    <div class="flex items-center gap-2">${left}</div>
    <div class="flex items-center gap-2">${right}</div>
  `;
}

function profileButton() {
  return `
    <button
      type="button"
      class="rounded bg-neutral-100 px-3 py-2 text-xs shadow-sm hover:bg-white"
      aria-label="Profil et déconnexion"
    >
      Profil / Déconnexion
    </button>
  `;
}

function backButton(to = "#") {
  return `
    <button
      type="button"
      class="rounded bg-neutral-100 px-3 py-2 text-xs shadow-sm hover:bg-white"
      data-go="${to}"
    >
      ← Retour
    </button>
  `;
}

function renderHome() {
  setActiveNav("home");
  setTopbar({
    left: `<div class="text-sm font-semibold text-neutral-600">ACCUEIL</div>`,
    right: profileButton(),
  });

  $view.innerHTML = `
    <div class="grid min-h-[52vh] place-items-center">
      <div class="w-full max-w-lg text-center">
        <div class="mx-auto w-full rounded bg-neutral-200 px-4 py-3 text-sm shadow-sm">
          Recherche un stage
        </div>

        <div class="mt-4 flex justify-center">
          <input
            id="homeQuery"
            type="search"
            inputmode="search"
            autocomplete="off"
            class="w-full max-w-md rounded bg-neutral-100 px-4 py-3 text-sm shadow-sm outline-none focus:bg-white"
            placeholder="Recherche un stage"
            aria-label="Recherche un stage"
          />
        </div>

        <div class="mt-3">
          <button
            id="homeSearchBtn"
            class="rounded bg-neutral-100 px-8 py-2 text-sm shadow-sm hover:bg-white"
            type="button"
          >
            Search
          </button>
        </div>

        <div class="mt-10 flex items-center justify-between">
          <div class="h-0"></div>
          <button
            data-go="#follow"
            class="rounded bg-neutral-100 px-4 py-2 text-xs shadow-sm hover:bg-white"
            type="button"
          >
            Suivi →
          </button>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#homeSearchBtn").addEventListener("click", () => {
    const q = document.querySelector("#homeQuery").value.trim();
    location.hash = q ? `#search?q=${encodeURIComponent(q)}` : "#search";
  });
}

function parseQuery() {
  const raw = location.hash.split("?")[1] || "";
  const params = new URLSearchParams(raw);
  return { q: (params.get("q") || "").trim() };
}

function jobRow(job, favs) {
  const saved = favs.has(job.id);
  return `
    <li class="flex items-center justify-between gap-3 rounded bg-neutral-200 px-4 py-3 shadow-sm">
      <div class="min-w-0">
        <div class="text-sm font-semibold">Intitulé du stage</div>
        <div class="mt-1 text-xs text-neutral-700">
          <span class="font-medium">Entreprise</span> : ${escapeHtml(job.company)}
          <span class="mx-2">|</span>
          <span class="font-medium">Ville</span> : ${escapeHtml(job.city)}
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <a
          class="rounded bg-neutral-100 px-4 py-2 text-xs shadow-sm hover:bg-white"
          href="${job.url}"
          target="_blank"
          rel="noopener"
        >
          Voir l'offre
        </a>

        <button
          type="button"
          class="saveBtn rounded bg-neutral-100 px-4 py-2 text-xs shadow-sm hover:bg-white"
          data-id="${job.id}"
          aria-pressed="${saved ? "true" : "false"}"
        >
          ${saved ? "Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </li>
  `;
}

function renderSearch() {
  setActiveNav("home");
  const { q } = parseQuery();

  setTopbar({
    left: backButton("#"),
    right: profileButton(),
  });

  const favs = store.getFavs();
  const filtered = q
    ? JOBS.filter((j) => (j.title + " " + j.company + " " + j.city).toLowerCase().includes(q.toLowerCase()))
    : JOBS;

  $view.innerHTML = `
    <div class="mx-auto max-w-3xl">
      <div class="mx-auto mb-4 w-full max-w-xl rounded bg-neutral-200 px-4 py-3 text-center text-sm shadow-sm">
        Stages recommandés
      </div>

      <div class="mb-3 flex justify-center">
        <input
          id="searchQuery"
          type="search"
          inputmode="search"
          autocomplete="off"
          class="w-full max-w-xl rounded bg-neutral-100 px-4 py-3 text-sm shadow-sm outline-none focus:bg-white"
          placeholder="Rechercher..."
          value="${escapeAttr(q)}"
          aria-label="Rechercher"
        />
      </div>

      <div class="mx-auto max-w-3xl rounded bg-neutral-300 p-3">
        <ul class="max-h-[320px] space-y-3 overflow-y-auto pr-2">
          ${filtered.map((job) => jobRow(job, favs)).join("")}
        </ul>
      </div>
    </div>
  `;

  // back button
  const back = $topbar.querySelector("[data-go]");
  if (back) back.addEventListener("click", () => (location.hash = back.dataset.go));

  // live search (debounce très léger)
  const input = document.querySelector("#searchQuery");
  let t = null;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const val = input.value.trim();
      location.hash = val ? `#search?q=${encodeURIComponent(val)}` : "#search";
    }, 120);
  });

  // save
  document.querySelectorAll(".saveBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const set = store.getFavs();
      if (set.has(id)) set.delete(id);
      else set.add(id);
      store.setFavs(set);
      route();
    });
  });
}

function renderFollow() {
  setActiveNav(null);
  setTopbar({
    left: backButton("#"),
    right: profileButton(),
  });

  const stats = store.getStats();

  $view.innerHTML = `
    <div class="mx-auto max-w-3xl">
      <div class="mx-auto mb-6 w-full max-w-xl rounded bg-neutral-200 px-4 py-3 text-center text-sm shadow-sm">
        Suivi
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        ${statCard("Candidatures", stats.apps)}
        ${statCard("Entretiens :", stats.interviews)}
        ${statCard("Réponses:", stats.replies)}
      </div>
    </div>
  `;

  const back = $topbar.querySelector("[data-go]");
  if (back) back.addEventListener("click", () => (location.hash = back.dataset.go));
}

function statCard(label, value) {
  return `
    <div class="rounded bg-neutral-200 p-6 text-center shadow-sm">
      <div class="text-sm">${escapeHtml(label)}</div>
      <div class="mt-3 text-lg font-semibold">${Number(value) || 0}</div>
    </div>
  `;
}

function renderFavorites() {
  setActiveNav("favorites");
  setTopbar({
    left: `<div class="text-sm font-semibold text-neutral-600">FAVORIS</div>`,
    right: profileButton(),
  });

  const favs = store.getFavs();
  const favJobs = JOBS.filter((j) => favs.has(j.id));

  $view.innerHTML = `
    <div class="mx-auto max-w-3xl">
      <div class="rounded bg-neutral-200 px-4 py-3 text-center text-sm shadow-sm">
        Vos offres sauvegardées
      </div>

      <div class="mt-4 rounded bg-neutral-300 p-3">
        ${
          favJobs.length
            ? `<ul class="space-y-3">${favJobs.map((job) => jobRow(job, favs)).join("")}</ul>`
            : `<p class="rounded bg-neutral-200 px-4 py-6 text-center text-sm text-neutral-700 shadow-sm">
                 Aucun favori pour l'instant.
               </p>`
        }
      </div>
    </div>
  `;

  document.querySelectorAll(".saveBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const set = store.getFavs();
      if (set.has(id)) set.delete(id);
      else set.add(id);
      store.setFavs(set);
      route();
    });
  });
}

function renderSettings() {
  setActiveNav("settings");
  setTopbar({
    left: `<div class="text-sm font-semibold text-neutral-600">PARAMETRES</div>`,
    right: profileButton(),
  });

  $view.innerHTML = `
    <div class="mx-auto max-w-3xl">
      <div class="rounded bg-neutral-200 px-4 py-3 text-center text-sm shadow-sm">
        Paramètres (demo)
      </div>

      <div class="mt-4 rounded bg-neutral-300 p-3">
        <div class="rounded bg-neutral-200 p-4 text-sm shadow-sm">
          <p class="text-neutral-700">
            Ici tu peux ajouter des options légères (reset favoris / reset suivi).
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <button id="resetFavs" class="rounded bg-neutral-100 px-4 py-2 text-xs shadow-sm hover:bg-white" type="button">
              Reset favoris
            </button>
            <button id="resetStats" class="rounded bg-neutral-100 px-4 py-2 text-xs shadow-sm hover:bg-white" type="button">
              Reset suivi
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#resetFavs").addEventListener("click", () => {
    localStorage.removeItem("favs");
    route();
  });
  document.querySelector("#resetStats").addEventListener("click", () => {
    localStorage.removeItem("stats");
    route();
  });
}

function setActiveNav(key) {
  document.querySelectorAll(".navbtn").forEach((btn) => {
    const is = btn.dataset.nav === key;
    btn.classList.toggle("bg-neutral-100", is);
    btn.classList.toggle("bg-neutral-200", !is);
  });
}

// sidebar nav
document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.nav;
    if (page === "home") location.hash = "#";
    else location.hash = `#${page}`;
  });
});

// delegation back buttons
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-go]");
  if (!el) return;
  location.hash = el.dataset.go;
});

window.addEventListener("hashchange", route);
route();

/* helpers */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}
